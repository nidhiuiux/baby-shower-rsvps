import { promises as fs } from "fs";
import path from "path";

export type Attendance = "yes" | "no";

export type Rsvp = {
  id: string;
  name: string;
  attending: Attendance;
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

export async function listRsvps(): Promise<Rsvp[]> {
  await ensureStore();
  const raw = await fs.readFile(dataFile, "utf8");
  try {
    const parsed = JSON.parse(raw) as Array<Rsvp & { guests?: number }>;
    if (!Array.isArray(parsed)) return [];
    // Drop legacy guest-count field from older saved rows
    return parsed.map(({ id, name, attending, note, createdAt }) => ({
      id,
      name,
      attending,
      note: note ?? "",
      createdAt,
    }));
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
