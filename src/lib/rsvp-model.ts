import type { Lang } from "@/lib/copy";

export type Attendance = "yes" | "no";
export const dietaryOptions = ["none", "swaminarayan", "jain", "vegan", "other"] as const;
export type DietaryPreference = (typeof dietaryOptions)[number] | "";
export const dietaryCopyKeys = { none: "dietaryNone", swaminarayan: "dietarySwaminarayan", jain: "dietaryJain", vegan: "dietaryVegan", other: "dietaryOther" } as const;
export type GuestDetail = { name: string; dietary: DietaryPreference; dietaryNote: string };
export type RsvpInput = {
  name: string;
  email: string;
  phone: string;
  attending: Attendance;
  guests: number;
  guestDetails: GuestDetail[];
  note: string;
  lang: Lang;
};
export type Rsvp = RsvpInput & { id: string; createdAt: string; updatedAt: string };
export type RsvpDraft = Omit<RsvpInput, "attending"> & { attending: Attendance | "" };

export function emptyRsvpDraft(): RsvpDraft {
  return { name: "", email: "", phone: "", attending: "", guests: 1, guestDetails: [], note: "", lang: "en" };
}

export function guestsForDraft(draft: RsvpDraft): GuestDetail[] {
  return Array.from({ length: draft.guests }, (_, index) => ({
    name: index === 0 ? draft.name : draft.guestDetails[index]?.name ?? "",
    dietary: draft.guestDetails[index]?.dietary ?? "",
    dietaryNote: draft.guestDetails[index]?.dietaryNote ?? "",
  }));
}

const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const validDietary = (value: unknown): value is DietaryPreference =>
  value === "" || dietaryOptions.includes(value as (typeof dietaryOptions)[number]);

/** Missing fields on earlier replies stay blank, ready for the host to complete. */
export function normalizeRsvp(row: Partial<Rsvp>): Rsvp {
  const attending = row.attending === "no" ? "no" : "yes";
  const guests = attending === "no" ? 0 : Math.min(20, Math.max(1, Math.round(Number(row.guests) || 1)));
  const createdAt = text(row.createdAt) || new Date().toISOString();
  const name = text(row.name);
  return {
    id: text(row.id) || crypto.randomUUID(), name,
    email: text(row.email), phone: text(row.phone), attending, guests,
    guestDetails: Array.from({ length: guests }, (_, i) => {
      const guest = row.guestDetails?.[i];
      return { name: i === 0 ? name : text(guest?.name), dietary: validDietary(guest?.dietary) ? guest.dietary : "", dietaryNote: text(guest?.dietaryNote) };
    }),
    note: text(row.note), lang: row.lang === "gu" ? "gu" : "en",
    createdAt, updatedAt: text(row.updatedAt) || createdAt,
  };
}

export type ValidationCode = "formErrName" | "formErrChoice" | "formErrEmail" | "formErrPhone" | "formErrGuests" | "formErrGuestDetails" | "formErrNote";
type Validation = { value: RsvpInput; error?: never } | { error: ValidationCode; value?: never };

/** New guest replies are complete; authenticated host edits can fill older replies gradually. */
export function validateRsvpInput(raw: Record<string, unknown>, requireDetails: boolean): Validation {
  const name = text(raw.name), email = text(raw.email), phone = text(raw.phone), note = text(raw.note);
  if (!name || name.length > 80) return { error: "formErrName" };
  if (raw.attending !== "yes" && raw.attending !== "no") return { error: "formErrChoice" };
  if ((requireDetails && !email) || email.length > 254 || (email && !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email))) return { error: "formErrEmail" };
  if ((requireDetails && !phone) || phone.length > 40 || (phone && (!/^[+\d\s().-]+$/.test(phone) || phone.replace(/\D/g, "").length < 7 || phone.replace(/\D/g, "").length > 15))) return { error: "formErrPhone" };
  if (note.length > 500) return { error: "formErrNote" };
  const guests = raw.attending === "yes" ? raw.guests : 0;
  if (typeof guests !== "number" || !Number.isInteger(guests) || guests < (raw.attending === "yes" ? 1 : 0) || guests > 20) return { error: "formErrGuests" };
  const details = raw.guestDetails ?? [];
  if (!Array.isArray(details) || details.length > 20 || (requireDetails && raw.attending === "yes" && details.length !== guests)) return { error: "formErrGuestDetails" };
  const guestDetails: GuestDetail[] = [];
  for (let i = 0; i < guests; i++) {
    const guest = details[i] ?? {};
    if (!guest || typeof guest !== "object" || Array.isArray(guest)) return { error: "formErrGuestDetails" };
    const guestName = i === 0 ? name : text(guest.name);
    const dietary: unknown = guest.dietary ?? "";
    const dietaryNote = text(guest.dietaryNote);
    if (!validDietary(dietary) || guestName.length > 80 || dietaryNote.length > 200 || (requireDetails && (!guestName || !dietary || (dietary === "other" && !dietaryNote)))) return { error: "formErrGuestDetails" };
    guestDetails.push({ name: guestName, dietary, dietaryNote });
  }
  return { value: { name, email, phone, attending: raw.attending, guests, guestDetails, note, lang: raw.lang === "gu" ? "gu" : "en" } };
}

export const RECORD_START = "---RSVP_JSON---";
export const RECORD_END = "---END---";
export function rsvpRecordBlock(rsvp: Rsvp): string {
  return [RECORD_START, JSON.stringify(rsvp), RECORD_END].join("\n");
}
