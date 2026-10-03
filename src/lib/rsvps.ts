import { promises as fs } from "fs";
import path from "path";

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

async function ensureStore(): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, "[]", "utf8");
  }
}

function normalizeGuests(
  attending: Attendance,
  guests: unknown,
): number {
  if (attending === "no") return 0;
  if (typeof guests === "number" && Number.isFinite(guests)) {
    return Math.min(20, Math.max(1, Math.round(guests)));
  }
  // Older rows without guests: treat attending yes as 1
  return 1;
}

export async function listRsvps(): Promise<Rsvp[]> {
  await ensureStore();
  const raw = await fs.readFile(dataFile, "utf8");
  try {
    const parsed = JSON.parse(raw) as Array<Partial<Rsvp> & { guests?: number }>;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((row) => {
      const attending: Attendance = row.attending === "no" ? "no" : "yes";
      return {
        id: String(row.id ?? crypto.randomUUID()),
        name: String(row.name ?? ""),
        attending,
        guests: normalizeGuests(attending, row.guests),
        note: String(row.note ?? ""),
        createdAt: String(row.createdAt ?? new Date().toISOString()),
      };
    });
  } catch {
    return [];
  }
}

export async function addRsvp(
  input: Omit<Rsvp, "id" | "createdAt">,
): Promise<Rsvp> {
  const rsvps = await listRsvps();
  const entry: Rsvp = {
    ...input,
    guests: normalizeGuests(input.attending, input.guests),
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  rsvps.unshift(entry);
  await fs.writeFile(dataFile, JSON.stringify(rsvps, null, 2), "utf8");
  return entry;
}

export async function deleteRsvp(id: string): Promise<boolean> {
  const rsvps = await listRsvps();
  const next = rsvps.filter((r) => r.id !== id);
  if (next.length === rsvps.length) return false;
  await fs.writeFile(dataFile, JSON.stringify(next, null, 2), "utf8");
  return true;
}
