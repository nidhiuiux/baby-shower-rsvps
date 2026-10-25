import { NextResponse } from "next/server";
import { isHostPin } from "@/lib/host-auth";
import { buildLiveAnnouncementEmail } from "@/lib/live-announcement";
import { notifyAddress, sendAnnouncement } from "@/lib/notify";
import { listRsvps } from "@/lib/rsvps";

export const maxDuration = 60;

const EMAIL = /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/;

/**
 * Host only. "preview" lists who would receive the live-stream email,
 * "test" sends it to the host inbox only, "send" sends it to everyone (BCC).
 * Recipients: every RSVP with an email (attending or not) plus any extra addresses.
 */
export async function POST(request: Request) {
  if (!isHostPin(request.headers.get("x-host-pin"))) return NextResponse.json({ error: "Wrong PIN." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { mode?: string; extra?: unknown } | null;
  const mode = body?.mode;
  if (mode !== "preview" && mode !== "test" && mode !== "send") return NextResponse.json({ error: "mode must be preview, test or send." }, { status: 400 });

  const extra = Array.isArray(body?.extra) ? body.extra.filter((e): e is string => typeof e === "string") : [];
  if (extra.length > 100) return NextResponse.json({ error: "Too many extra addresses." }, { status: 400 });

  let rsvps;
  try {
    rsvps = await listRsvps();
  } catch (error) {
    console.error("Could not list RSVPs for announcement:", error);
    return NextResponse.json({ error: "Could not load the guest list. Try again." }, { status: 503 });
  }
  const recipients = [...new Set([...rsvps.map((r) => r.email), ...extra].map((e) => e.trim().toLowerCase()).filter((e) => EMAIL.test(e)))].sort();

  if (mode === "preview") return NextResponse.json({ ok: true, count: recipients.length, recipients });

  const email = buildLiveAnnouncementEmail();
  const result = await sendAnnouncement(email, mode === "send" ? recipients : []);
  if (!result.sent) return NextResponse.json({ error: result.reason }, { status: 502 });
  return NextResponse.json({ ok: true, mode, sentTo: mode === "send" ? recipients.length : notifyAddress() });
}
