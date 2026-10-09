import { promises as fs } from "fs";
import path from "path";
import { Resend } from "resend";
import { event } from "@/lib/event";
import { sendRsvpNotification } from "@/lib/notify";
import { normalizeRsvp, RECORD_START, RECORD_END, type Attendance, type Rsvp, type RsvpInput } from "@/lib/rsvp-model";
import type { RsvpSource } from "@/lib/rsvp-emails";
export type { Attendance, Rsvp } from "@/lib/rsvp-model";

const dataDir = process.env.RSVP_DATA_DIR || path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "rsvps.json");

const DELETE_START = "---RSVP_DELETE---";

function shouldUseResendStore(): boolean {
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
    await fs.writeFile(dataFile, "[]", { encoding: "utf8", flag: "wx" });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
  }
}

function extractJsonBlock(text: string, start: string): unknown | null {
  // The final standalone marker is ours; a guest's note may contain marker-like text.
  const marker = `\n${start}\n`;
  const source = `\n${text}`;
  const from = source.lastIndexOf(marker);
  if (from === -1) return null;
  const jsonStart = from + marker.length;
  const end = source.indexOf(`\n${RECORD_END}`, jsonStart);
  const raw = (end === -1 ? source.slice(jsonStart) : source.slice(jsonStart, end)).trim();
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function parseLegacyEmail(
  subject: string,
  text: string,
  emailId: string,
  createdAt: string,
): Rsvp | null {
  if (!subject.startsWith("RSVP Yes:") && !subject.startsWith("RSVP No:")) {
    return null;
  }
  const attending: Attendance = subject.startsWith("RSVP Yes:") ? "yes" : "no";
  const nameMatch = text.match(/^Name:\s*(.+)$/m);
  const guestsMatch = text.match(/^Guests:\s*(\d+)/m);
  const noteMatch = text.match(/^Note:\s*(.+)$/m);
  const name =
    nameMatch?.[1]?.trim() ||
    subject.replace(/^RSVP (Yes|No):\s*/i, "").split("—")[0].trim();
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

const DELETE_SUBJECT = "RSVP Delete: ";

/** Resend allows only a couple of requests per second; back off instead of dropping emails. */
const MAX_ATTEMPTS = 6;
const FETCH_CONCURRENCY = 2;

/** Emails never change, so what we parse from one can be kept for the life of the server instance. */
const parsedEmails = new Map<string, Rsvp | null>();
/** Ids deleted on this instance, covers Resend's short lag before the marker email appears in the list. */
const recentlyDeleted = new Set<string>();
const recentlySaved = new Map<string, Rsvp>();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type ResendResult<T> = {
  data: T | null;
  error: { name?: string; statusCode?: number | null; message: string } | null;
};

async function resendCall<T>(call: () => Promise<ResendResult<T>>): Promise<T> {
  let lastMessage = "unknown error";
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const { data, error } = await call();
    if (!error && data) return data;
    lastMessage = error?.message ?? "empty response";
    const limited = error?.name === "rate_limit_exceeded" || error?.statusCode === 429;
    const transient = limited || (error?.statusCode ?? 0) >= 500;
    if (!transient) break;
    await sleep(600 * (attempt + 1));
  }
  throw new Error(`Resend request failed: ${lastMessage}`);
}

async function parseEmail(
  resend: Resend,
  item: { id: string; subject?: string | null; created_at: string },
): Promise<Rsvp | null> {
  if (parsedEmails.has(item.id)) return parsedEmails.get(item.id) ?? null;

  const full = await resendCall(() => resend.emails.get(item.id));
  const text = full.text || "";
  let rsvp: Rsvp | null = null;

  const recordPayload = extractJsonBlock(text, RECORD_START);
  if (recordPayload && typeof recordPayload === "object") {
    rsvp = normalizeRsvp(recordPayload as Partial<Rsvp>);
  } else {
    rsvp = parseLegacyEmail(
      full.subject || item.subject || "",
      text,
      item.id,
      full.created_at || item.created_at,
    );
  }

  parsedEmails.set(item.id, rsvp);
  return rsvp;
}

async function listFromResend(): Promise<Rsvp[]> {
  const resend = resendClient();
  if (!resend) throw new Error("Resend storage is not configured.");

  const deleted = new Set<string>(recentlyDeleted);
  const candidates: { id: string; subject?: string | null; created_at: string }[] = [];
  let after: string | undefined;

  for (;;) {
    const data = await resendCall(() =>
      resend.emails.list(after ? { limit: 100, after } : { limit: 100 }),
    );

    for (const item of data.data) {
      const subject = item.subject || "";
      // Delete markers carry the id in the subject, so no extra request is needed to read them.
      if (subject.startsWith(DELETE_SUBJECT)) {
        const id = subject.slice(DELETE_SUBJECT.length).trim();
        if (id) deleted.add(id);
        continue;
      }
      // Guest confirmations never contain storage records and need not be fetched.
      if (/^RSVP (Yes|No|Update):/.test(subject)) candidates.push(item);
    }

    if (!data.has_more || data.data.length === 0) break;
    after = data.data[data.data.length - 1]?.id;
    if (!after) break;
  }

  // Read the record bodies a couple at a time. Any failure throws, so the host never sees a partial list.
  const records = new Map<string, Rsvp>();
  let next = 0;
  const worker = async () => {
    while (next < candidates.length) {
      const item = candidates[next++];
      const rsvp = await parseEmail(resend, item);
      const previous = rsvp ? records.get(rsvp.id) : undefined;
      if (rsvp && (!previous || rsvp.updatedAt > previous.updatedAt)) records.set(rsvp.id, rsvp);
    }
  };
  await Promise.all(Array.from({ length: FETCH_CONCURRENCY }, worker));

  for (const [id, rsvp] of recentlySaved) {
    const stored = records.get(id);
    if (!stored || rsvp.updatedAt > stored.updatedAt) records.set(id, rsvp);
    else recentlySaved.delete(id);
  }

  return [...records.values()]
    .filter((r) => !deleted.has(r.id))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

async function listFromFile(): Promise<Rsvp[]> {
  await ensureStore();
  const raw = await fs.readFile(dataFile, "utf8");
  const parsed = JSON.parse(raw) as Array<Partial<Rsvp>>;
  if (!Array.isArray(parsed)) throw new Error("Invalid RSVP store.");
  return parsed.map((row) => normalizeRsvp(row));
}

let fileWrites: Promise<unknown> = Promise.resolve();
function mutateFileStore(update: (rows: Rsvp[]) => Rsvp[]) {
  const write = fileWrites.then(async () => {
    const rows = update(await listFromFile());
    const temporary = `${dataFile}.${crypto.randomUUID()}.tmp`;
    await fs.writeFile(temporary, JSON.stringify(rows, null, 2), "utf8");
    await fs.rename(temporary, dataFile);
  });
  fileWrites = write.catch(() => undefined);
  return write;
}

export async function listRsvps(): Promise<Rsvp[]> {
  if (shouldUseResendStore()) {
    return listFromResend();
  }
  return listFromFile();
}

/** Merge helper for Resend lag right after create/delete. */
export function mergeRsvpList(
  current: Rsvp[],
  opts: { upsert?: Rsvp; removeId?: string },
): Rsvp[] {
  let next = current.slice();
  if (opts.removeId) {
    next = next.filter((r) => r.id !== opts.removeId);
  }
  if (opts.upsert) {
    next = [opts.upsert, ...next.filter((r) => r.id !== opts.upsert!.id)];
  }
  return next;
}

async function persistRsvp(rsvp: Rsvp, source: RsvpSource) {
  const remote = shouldUseResendStore();
  if (!remote) await mutateFileStore(rows => [rsvp, ...rows.filter(row => row.id !== rsvp.id)]);
  const notification = await sendRsvpNotification(rsvp, source);
  // On Vercel the host email is the durable record. Never report success before it is stored.
  if (remote && !notification.sent) throw new Error("Could not save RSVP to Resend.");
  if (remote) recentlySaved.set(rsvp.id, rsvp);
  return { rsvp, emailSent: notification.sent };
}

export async function addRsvp(input: RsvpInput, source: "guest" | "manual" = "guest") {
  const entry: Rsvp = normalizeRsvp({
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });

  return persistRsvp(entry, source);
}

export function updateRsvp(existing: Rsvp, input: RsvpInput) {
  const previousTime = Date.parse(existing.updatedAt) || 0;
  const updatedAt = new Date(Math.max(Date.now(), previousTime + 1)).toISOString();
  const entry = normalizeRsvp({ ...existing, ...input, updatedAt });
  return persistRsvp(entry, "updated");
}

export async function deleteRsvp(
  id: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (shouldUseResendStore()) {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const to = notifyAddress();
    if (!apiKey) return { ok: false, reason: "Missing RESEND_API_KEY" };
    if (!to) return { ok: false, reason: "Missing notify email" };

    const from =
      process.env.NOTIFY_FROM_EMAIL?.trim() ||
      "Baby Shower RSVP <onboarding@resend.dev>";

    // Use REST directly — more reliable than SDK in some serverless runs.
    // Retry when Resend rate-limits us so a delete is never silently lost.
    let res: Response | null = null;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject: `${DELETE_SUBJECT}${id}`,
          text: [
            "An RSVP was removed from the host dashboard.",
            "",
            DELETE_START,
            JSON.stringify({ id }),
            RECORD_END,
          ].join("\n"),
        }),
      });
      if (res.status !== 429) break;
      await sleep(700 * (attempt + 1));
    }

    if (!res || !res.ok) {
      const body = res ? await res.text() : "";
      console.error("Resend delete marker error:", res?.status, body);
      return { ok: false, reason: `Email delete failed (${res?.status ?? "no response"})` };
    }
    recentlyDeleted.add(id);
    return { ok: true };
  }

  let found = false;
  await mutateFileStore(rows => {
    found = rows.some(row => row.id === id);
    return rows.filter(row => row.id !== id);
  });
  if (!found) {
    return { ok: false, reason: "RSVP not found." };
  }
  return { ok: true };
}

export function summarize(rsvps: Rsvp[]) {
  const yes = rsvps.filter((r) => r.attending === "yes");
  const no = rsvps.filter((r) => r.attending === "no");
  const headcount = yes.reduce((sum, r) => sum + r.guests, 0);
  return {
    total: rsvps.length,
    yes: yes.length,
    no: no.length,
    headcount,
  };
}
