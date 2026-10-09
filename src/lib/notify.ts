import { Resend } from "resend";
import { event } from "@/lib/event";
import { buildGuestConfirmationEmail, buildHostNotificationEmail, type EmailTemplate, type RsvpSource } from "@/lib/rsvp-emails";
import type { Rsvp } from "@/lib/rsvp-model";

export type NotifyResult = { sent: true; via: "resend" } | { sent: false; reason: string };
export const notifyAddress = () => (process.env.NOTIFY_EMAIL || event.notifyEmail).trim();

async function sendEmail(to: string, template: EmailTemplate, idempotencyKey: string, replyTo?: string): Promise<NotifyResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || !to) return { sent: false, reason: "Email delivery is not configured." };
  const resend = new Resend(apiKey);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.NOTIFY_FROM_EMAIL?.trim() || "Baby Shower RSVP <onboarding@resend.dev>",
        to: [to], replyTo, ...template,
      }, { idempotencyKey });
      if (!error && data?.id) return { sent: true, via: "resend" };
      if (error && error.statusCode !== 429 && (error.statusCode ?? 0) < 500) return { sent: false, reason: error.message };
    } catch {
      // Retry transient transport failures with the same key, avoiding duplicate emails.
    }
    if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 700 * (attempt + 1)));
  }
  return { sent: false, reason: "Email delivery is temporarily unavailable." };
}

export function sendRsvpNotification(rsvp: Rsvp, source: RsvpSource = "guest") {
  return sendEmail(notifyAddress(), buildHostNotificationEmail(rsvp, source), `rsvp-host-${rsvp.id}-${rsvp.updatedAt}`, rsvp.email || undefined);
}

export function sendRsvpConfirmation(rsvp: Rsvp): Promise<NotifyResult> {
  if (!rsvp.email) return Promise.resolve({ sent: false, reason: "No guest email address." });
  return sendEmail(rsvp.email, buildGuestConfirmationEmail(rsvp), `rsvp-guest-${rsvp.id}-${rsvp.updatedAt}`, notifyAddress());
}
