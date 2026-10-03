import { promises as fs } from "fs";
import path from "path";
import { Resend } from "resend";
import { event } from "@/lib/event";

export type Attendance = "yes" | "no";

export type Rsvp = {
  id: string;
  name: string;
  attending: Attendance;
  guests: number;
  note: string;
  createdAt: string;
};

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "rsvps.json");

const RECORD_START = "---RSVP_JSON---";
const RECORD_END = "---END---";
const DELETE_START = "---RSVP_DELETE---";

function useResendStore(): boolean {
  return Boolean(process.env.VERCEL || process.env.RSVP_STORE === "resend");
}

function notifyAddress(): string {
  return (process.env.NOTIFY_EMAIL || event.notifyEmail).trim();
}

function resendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

async function ensureStore(): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, "[]", "utf8");
  }
}

function normalizeGuests(attending: Attendance, guests: unknown): number {
  if (attending === "no") return 0;
  if (typeof guests === "number" && Number.isFinite(guests)) {
    return Math.min(20, Math.max(1, Math.round(guests)));
  }
  return 1;
}

function normalizeRsvp(row: Partial<Rsvp>): Rsvp {
  const attending: Attendance = row.attending === "no" ? "no" : "yes";
  return {
    id: String(row.id ?? crypto.randomUUID()),
    name: String(row.name ?? ""),
    attending,
    guests: normalizeGuests(attending, row.guests),
    note: String(row.note ?? ""),
    createdAt: String(row.createdAt ?? new Date().toISOString()),
  };
}

function extractJsonBlock(text: string, start: string): unknown | null {
  const from = text.indexOf(start);
  if (from === -1) return null;
  const jsonStart = from + start.length;
  const end = text.indexOf(RECORD_END, jsonStart);
  const raw = (end === -1 ? text.slice(jsonStart) : text.slice(jsonStart, end)).trim();
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function parseLegacyEmail(subject: string, text: string, emailId: string, createdAt: string): Rsvp | null {
  if (!subject.startsWith("RSVP Yes:") && !subject.startsWith("RSVP No:")) {
    return null;
  }
  const attending: Attendance = subject.startsWith("RSVP Yes:") ? "yes" : "no";
  const nameMatch = text.match(/^Name:\s*(.+)$/m);
  const guestsMatch = text.match(/^Guests:\s*(\d+)/m);
  const noteMatch = text.match(/^Note:\s*(.+)$/m);
  const name = nameMatch?.[1]?.trim() || subject.replace(/^RSVP (Yes|No):\s*/i, "").split("—")[0].trim();
  if (!name) return null;
  const noteRaw = noteMatch?.[1]?.trim() || "";
  return normalizeRsvp({
    id: emailId,
    name,
    attending,
    guests: attending === "yes" ? Number(guestsMatch?.[1] || 1) : 0,
    note: noteRaw === "(none)" ? "" : noteRaw,
    createdAt,
  });
}

async function listFromResend(): Promise<Rsvp[]> {
  const resend = resendClient();
  if (!resend) return [];

  const records = new Map<string, Rsvp>();
  const deleted = new Set<string>();
  let after: string | undefined;

  for (let page = 0; page < 20; page += 1) {
    const { data, error } = await resend.emails.list(after ? { after } : undefined);
    if (error || !data) {
      console.error("Resend list error:", error);
      break;
    }

    for (const item of data.data) {
      const { data: full, error: fullError } = await resend.emails.get(item.id);
      if (fullError || !full?.text) continue;
      const text = full.text;

      const deletePayload = extractJsonBlock(text, DELETE_START);
      if (deletePayload && typeof deletePayload === "object" && deletePayload !== null) {
        const id = String((deletePayload as { id?: string }).id || "");
        if (id) deleted.add(id);
        continue;
      }

      const recordPayload = extractJsonBlock(text, RECORD_START);
      if (recordPayload && typeof recordPayload === "object" && recordPayload !== null) {
        const rsvp = normalizeRsvp(recordPayload as Partial<Rsvp>);
        if (!records.has(rsvp.id)) records.set(rsvp.id, rsvp);
        continue;
      }

      const legacy = parseLegacyEmail(
        full.subject || item.subject || "",
        text,
        item.id,
        full.created_at || item.created_at,
      );
      if (legacy && !records.has(legacy.id)) {
        records.set(legacy.id, legacy);
      }
    }

    if (!data.has_more || data.data.length === 0) break;
    after = data.data[data.data.length - 1]?.id;
    if (!after) break;
  }

  return [...records.values()]
    .filter((r) => !deleted.has(r.id))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

async function listFromFile(): Promise<Rsvp[]> {
  await ensureStore();
  const raw = await fs.readFile(dataFile, "utf8");
  try {
    const parsed = JSON.parse(raw) as Array<Partial<Rsvp>>;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((row) => normalizeRsvp(row));
  } catch {
    return [];
  }
}

export async function listRsvps(): Promise<Rsvp[]> {
  if (useResendStore()) {
    return listFromResend();
  }
  return listFromFile();
}

export async function addRsvp(
  input: Omit<Rsvp, "id" | "createdAt">,
): Promise<Rsvp> {
  const entry: Rsvp = normalizeRsvp({
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });

  if (useResendStore()) {
    // Durable copy is written via the notification email payload.
    return entry;
  }

  const rsvps = await listFromFile();
  rsvps.unshift(entry);
  await fs.writeFile(dataFile, JSON.stringify(rsvps, null, 2), "utf8");
  return entry;
}

export async function deleteRsvp(id: string): Promise<boolean> {
  if (useResendStore()) {
    const resend = resendClient();
    const to = notifyAddress();
    if (!resend || !to) return false;

    const existing = await listFromResend();
    if (!existing.some((r) => r.id === id)) return false;

    const from =
      process.env.NOTIFY_FROM_EMAIL?.trim() ||
      "Baby Shower RSVP <onboarding@resend.dev>";

    const { error } = await resend.emails.send({
      from,
      to: [to],
      subject: `RSVP Delete: ${id}`,
      text: [
        "An RSVP was removed from the host dashboard.",
        "",
        DELETE_START,
        JSON.stringify({ id }),
        RECORD_END,
      ].join("\n"),
    });

    if (error) {
      console.error("Resend delete marker error:", error);
      return false;
    }
    return true;
  }

  const rsvps = await listFromFile();
  const next = rsvps.filter((r) => r.id !== id);
  if (next.length === rsvps.length) return false;
  await fs.writeFile(dataFile, JSON.stringify(next, null, 2), "utf8");
  return true;
}

export function rsvpRecordBlock(rsvp: Rsvp): string {
  return [RECORD_START, JSON.stringify(rsvp), RECORD_END].join("\n");
}
