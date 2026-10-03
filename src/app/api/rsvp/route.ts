import { NextResponse } from "next/server";
import { event } from "@/lib/event";
import { addRsvp, listRsvps, type Attendance } from "@/lib/rsvps";

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

  const { name, attending, guests, note } = body as Record<string, unknown>;

  const trimmedName = typeof name === "string" ? name.trim() : "";
  if (!trimmedName || trimmedName.length > 80) {
    return NextResponse.json(
      { error: "Please enter your name." },
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

  return NextResponse.json({ ok: true, rsvp });
}

export async function GET(request: Request) {
  const pin = new URL(request.url).searchParams.get("pin");
  if (pin !== event.hostPin) {
    return NextResponse.json({ error: "Wrong PIN." }, { status: 401 });
  }

  const rsvps = await listRsvps();
  const yes = rsvps.filter((r) => r.attending === "yes");
  const no = rsvps.filter((r) => r.attending === "no");
  const headcount = yes.reduce((sum, r) => sum + r.guests, 0);

  return NextResponse.json({
    rsvps,
    summary: {
      total: rsvps.length,
      yes: yes.length,
      no: no.length,
      headcount,
    },
  });
}
