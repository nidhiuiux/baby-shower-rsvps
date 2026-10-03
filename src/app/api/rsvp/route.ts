import { NextResponse } from "next/server";
import { event } from "@/lib/event";
import { sendRsvpNotification } from "@/lib/notify";
import {
  addRsvp,
  deleteRsvp,
  listRsvps,
  mergeRsvpList,
  summarize,
  type Attendance,
} from "@/lib/rsvps";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { name, attending, guests, note, pin } = body as Record<string, unknown>;

  const isManual = typeof pin === "string" && pin.length > 0;
  if (isManual && pin !== event.hostPin) {
    return NextResponse.json({ error: "Wrong PIN." }, { status: 401 });
  }

  const trimmedName = typeof name === "string" ? name.trim() : "";
  if (!trimmedName || trimmedName.length > 80) {
    return NextResponse.json(
      { error: "Please enter a name." },
      { status: 400 },
    );
  }

  if (attending !== "yes" && attending !== "no") {
    return NextResponse.json(
      { error: "Please choose Yes or No." },
      { status: 400 },
    );
  }

  const guestCount =
    attending === "yes"
      ? Math.min(20, Math.max(1, Number(guests) || 1))
      : 0;

  const trimmedNote =
    typeof note === "string" ? note.trim().slice(0, 500) : "";

  const rsvp = await addRsvp({
    name: trimmedName,
    attending: attending as Attendance,
    guests: guestCount,
    note: trimmedNote,
  });

  const notify = await sendRsvpNotification(
    rsvp,
    isManual ? "manual" : "guest",
  );
  if (!notify.sent && process.env.VERCEL) {
    return NextResponse.json(
      { error: "Could not save RSVP. Please try again." },
      { status: 502 },
    );
  }
  if (!notify.sent) {
    console.warn("RSVP saved, but email was not sent:", notify.reason);
  }

  if (isManual) {
    // Resend list API can lag — always include the new row immediately.
    const listed = await listRsvps();
    const rsvps = mergeRsvpList(listed, { upsert: rsvp });
    return NextResponse.json({
      ok: true,
      rsvp,
      emailSent: notify.sent,
      rsvps,
      summary: summarize(rsvps),
    });
  }

  return NextResponse.json({ ok: true, rsvp, emailSent: notify.sent });
}

export async function GET(request: Request) {
  const pin = new URL(request.url).searchParams.get("pin");
  if (pin !== event.hostPin) {
    return NextResponse.json({ error: "Wrong PIN." }, { status: 401 });
  }

  const rsvps = await listRsvps();
  return NextResponse.json({
    rsvps,
    summary: summarize(rsvps),
    email: {
      notifyEmail: process.env.NOTIFY_EMAIL || event.notifyEmail,
      configured: Boolean(process.env.RESEND_API_KEY?.trim()),
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
  if (pin !== event.hostPin) {
    return NextResponse.json({ error: "Wrong PIN." }, { status: 401 });
  }
  if (typeof id !== "string" || !id) {
    return NextResponse.json({ error: "Missing RSVP id." }, { status: 400 });
  }

  const removed = await deleteRsvp(id);
  if (!removed) {
    return NextResponse.json({ error: "Could not remove RSVP." }, { status: 502 });
  }

  // Filter locally so remove feels instant even if Resend list lags.
  const listed = await listRsvps();
  const rsvps = mergeRsvpList(listed, { removeId: id });
  return NextResponse.json({
    ok: true,
    rsvps,
    summary: summarize(rsvps),
  });
}
