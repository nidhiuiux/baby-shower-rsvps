import { Resend } from "resend";
import { event } from "@/lib/event";
import { buildGuestConfirmationEmail, buildHostNotificationEmail, type EmailTemplate, type RsvpSource } from "@/lib/rsvp-emails";
import type { Rsvp } from "@/lib/rsvp-model";

export type NotifyResult =
  | { sent: true; via: "resend" }
  | { sent: false; reason: string; code: "off" | "failed" };
export const notifyAddress = () => (process.env.NOTIFY_EMAIL || event.notifyEmail).trim();

const FALLBACK_FROM = "Baby Shower RSVP <onboarding@resend.dev>";
const fromAddress = () => process.env.NOTIFY_FROM_EMAIL?.trim() || FALLBACK_FROM;

/**
 * Resend's shared test sender only delivers to the account owner's inbox, so
 * guest confirmations need a sender on a verified domain (NOTIFY_FROM_EMAIL).
 */
export const guestConfirmationsEnabled = () =>
  Boolean(process.env.RESEND_API_KEY?.trim() && process.env.NOTIFY_FROM_EMAIL?.trim());

async function sendEmail(to: string, template: EmailTemplate, idempotencyKey: string, replyTo?: string): Promise<NotifyResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || !to) return { sent: false, reason: "Email delivery is not configured.", code: "off" };
  const resend = new Resend(apiKey);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { data, error } = await resend.emails.send({ from: fromAddress(), to: [to], replyTo, ...template }, { idempotencyKey });
      if (!error && data?.id) return { sent: true, via: "resend" };
      if (error && error.statusCode !== 429 && (error.statusCode ?? 0) < 500) {
        console.error("Resend rejected email:", error.message);
        return { sent: false, reason: error.message, code: "failed" };
      }
    } catch {
      // Retry transient transport failures with the same key, avoiding duplicate emails.
    }
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
  }
  return { sent: false, reason: "Email delivery is temporarily unavailable.", code: "failed" };
}

export function sendRsvpNotification(rsvp: Rsvp, source: RsvpSource = "guest") {
  return sendEmail(notifyAddress(), buildHostNotificationEmail(rsvp, source), `rsvp-host-${rsvp.id}-${rsvp.updatedAt}`, rsvp.email || undefined);
}

export function sendRsvpConfirmation(rsvp: Rsvp): Promise<NotifyResult> {
  if (!rsvp.email) return Promise.resolve({ sent: false, reason: "No guest email address.", code: "off" });
  if (!guestConfirmationsEnabled()) return Promise.resolve({ sent: false, reason: "Guest confirmations need a verified sender (NOTIFY_FROM_EMAIL).", code: "off" });
  return sendEmail(rsvp.email, buildGuestConfirmationEmail(rsvp), `rsvp-guest-${rsvp.id}-${rsvp.updatedAt}`, notifyAddress());
}
