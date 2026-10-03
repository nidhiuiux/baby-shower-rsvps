import { NextResponse } from "next/server";
import { event } from "@/lib/event";
import { addRsvp, deleteRsvp, listRsvps, type Attendance } from "@/lib/rsvps";

function summarize(rsvps: Awaited<ReturnType<typeof listRsvps>>) {
  const yes = rsvps.filter((r) => r.attending === "yes");
  const no = rsvps.filter((r) => r.attending === "no");
  return {
    total: rsvps.length,
    yes: yes.length,
    no: no.length,
  };
}

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

  const { name, attending, note, pin } = body as Record<string, unknown>;

  // Manual host entry requires PIN; public guest RSVP does not send a pin
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

  const trimmedNote =
    typeof note === "string" ? note.trim().slice(0, 500) : "";

  const rsvp = await addRsvp({
    name: trimmedName,
    attending: attending as Attendance,
    note: trimmedNote,
  });

  if (isManual) {
    const rsvps = await listRsvps();
    return NextResponse.json({
      ok: true,
      rsvp,
      rsvps,
      summary: summarize(rsvps),
    });
  }

  return NextResponse.json({ ok: true, rsvp });
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
    return NextResponse.json({ error: "RSVP not found." }, { status: 404 });
  }

  const rsvps = await listRsvps();
  return NextResponse.json({
    ok: true,
    rsvps,
    summary: summarize(rsvps),
  });
}
