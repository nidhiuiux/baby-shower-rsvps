import { timingSafeEqual } from "crypto";
import { event } from "@/lib/event";

/** Set HOST_PIN in your deploy settings; the value in event.ts is only a fallback. */
function expectedPin(): string {
  return process.env.HOST_PIN?.trim() || event.hostPin;
}

export function isHostPin(candidate: unknown): boolean {
  if (typeof candidate !== "string" || candidate.length === 0) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expectedPin());
  return a.length === b.length && timingSafeEqual(a, b);
}
