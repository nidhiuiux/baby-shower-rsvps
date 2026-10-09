import { NextResponse } from "next/server";
import { event } from "@/lib/event";
import { isHostPin } from "@/lib/host-auth";
import { guestConfirmationsEnabled, sendRsvpConfirmation, type NotifyResult } from "@/lib/notify";
import { copy } from "@/lib/copy";
import { validateRsvpInput } from "@/lib/rsvp-model";
import {
  addRsvp,
  deleteRsvp,
  listRsvps,
  summarize,
  updateRsvp,
} from "@/lib/rsvps";

/** Listing reads RSVPs back from Resend, which can take a few seconds when rate-limited. */
export const maxDuration = 60;

/** Guest form only: a few replies per address every ten minutes is plenty for a family. */
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 8;
const recentByIp = new Map<string, number[]>();

function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "";
}

function rateLimited(ip: string) {
  if (!ip) return false;
  const now = Date.now();
  const recent = (recentByIp.get(ip) ?? []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) return true;
  recent.push(now);
  recentByIp.set(ip, recent);
  if (recentByIp.size > 5000) recentByIp.clear();
  return false;
}

function confirmationStatus(result: NotifyResult | null) {
  if (!result) return "off" as const;
  return result.sent ? ("sent" as const) : result.code;
}

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? body as Record<string, unknown> : null;
  } catch { return null; }
}

export async function POST(request: Request) {
  const body = await readBody(request);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const isManual = request.headers.has("x-host-pin") || "pin" in body;
  if (isManual && !isHostPin(request.headers.get("x-host-pin") ?? body.pin)) {
    return NextResponse.json({ error: "Wrong PIN." }, { status: 401 });
  }
  if (!isManual) {
    // Bots fill every field, people never see this one. Pretend success and store nothing.
    if (typeof body.rsvp_extra === "string" && body.rsvp_extra.trim()) {
      return NextResponse.json({ ok: true, confirmationRequested: false, confirmationSent: false, confirmationStatus: "off" });
    }
    if (rateLimited(clientIp(request))) {
      return NextResponse.json({ error: copy.en.formErrTooMany, errorCode: "formErrTooMany" }, { status: 429 });
    }
  }
  const parsed = validateRsvpInput(body, !isManual);
  if (parsed.error) return NextResponse.json({ error: copy.en[parsed.error], errorCode: parsed.error }, { status: 400 });
  if (isManual && body.sendConfirmation === true && !parsed.value.email) {
    return NextResponse.json({ error: "Add an email address before sending a confirmation." }, { status: 400 });
  }
  try {
    const saved = await addRsvp(parsed.value, isManual ? "manual" : "guest");
    const confirmationRequested = !isManual || body.sendConfirmation === true;
    const confirmation = confirmationRequested ? await sendRsvpConfirmation(saved.rsvp) : null;
    return NextResponse.json({ ok: true, ...saved, confirmationRequested, confirmationSent: confirmation?.sent ?? false, confirmationStatus: confirmationStatus(confirmation) });
  } catch (error) {
    console.error("Could not save RSVP:", error);
    return NextResponse.json({ error: "Could not save RSVP. Please try again." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const body = await readBody(request);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  if (!isHostPin(request.headers.get("x-host-pin") ?? body.pin)) {
    return NextResponse.json({ error: "Wrong PIN." }, { status: 401 });
  }
  if (typeof body.id !== "string" || !body.id) return NextResponse.json({ error: "Missing RSVP id." }, { status: 400 });
  try {
    const existing = (await listRsvps()).find(row => row.id === body.id);
    if (!existing) return NextResponse.json({ error: "RSVP not found." }, { status: 404 });
    if (typeof body.updatedAt === "string" && body.updatedAt !== existing.updatedAt) {
      return NextResponse.json({ error: "This RSVP changed since you opened it. Reload the guest list before editing." }, { status: 409 });
    }
    const parsed = validateRsvpInput({ ...existing, ...body }, false);
    if (parsed.error) return NextResponse.json({ error: copy.en[parsed.error] }, { status: 400 });
    if (body.sendConfirmation === true && !parsed.value.email) {
      return NextResponse.json({ error: "Add an email address before sending a confirmation." }, { status: 400 });
    }
    const saved = await updateRsvp(existing, parsed.value);
    const confirmation = body.sendConfirmation === true ? await sendRsvpConfirmation(saved.rsvp) : null;
    return NextResponse.json({ ok: true, ...saved, confirmationRequested: body.sendConfirmation === true, confirmationSent: confirmation?.sent ?? false, confirmationStatus: confirmationStatus(confirmation) });
  } catch (error) {
    console.error("Could not update RSVP:", error);
    return NextResponse.json({ error: "Could not save the changes. Please try again." }, { status: 503 });
  }
}

export async function GET(request: Request) {
  // The PIN travels in a header, not the address, so it stays out of logs and browser history.
  if (!isHostPin(request.headers.get("x-host-pin"))) {
    return NextResponse.json({ error: "Wrong PIN." }, { status: 401 });
  }

  let rsvps;
  try {
    rsvps = await listRsvps();
  } catch (err) {
    console.error("Could not list RSVPs:", err);
    return NextResponse.json(
      { error: "Could not load responses right now. Please try again in a moment." },
      { status: 503 },
    );
  }
  return NextResponse.json({
    rsvps,
    summary: summarize(rsvps),
    email: {
      notifyEmail: process.env.NOTIFY_EMAIL || event.notifyEmail,
      configured: Boolean(process.env.RESEND_API_KEY?.trim()),
      guestConfirmations: guestConfirmationsEnabled(),
    },
  });
}

export async function DELETE(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { id, pin } = body as Record<string, unknown>;
  if (!isHostPin(pin)) {
    return NextResponse.json({ error: "Wrong PIN." }, { status: 401 });
  }
  if (typeof id !== "string" || !id) {
    return NextResponse.json({ error: "Missing RSVP id." }, { status: 400 });
  }

  const removed = await deleteRsvp(id);
  if (!removed.ok) {
    return NextResponse.json(
      { error: removed.reason || "Could not remove RSVP." },
      { status: 502 },
    );
  }

  // Skip slow Resend re-list on delete — client already updates instantly.
  return NextResponse.json({
    ok: true,
    removedId: id,
  });
}
