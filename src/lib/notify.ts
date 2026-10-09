import nodemailer, { type Transporter } from "nodemailer";
import { Resend } from "resend";
import { event } from "@/lib/event";
import { buildGuestConfirmationEmail, buildHostNotificationEmail, type EmailTemplate, type RsvpSource } from "@/lib/rsvp-emails";
import type { Rsvp } from "@/lib/rsvp-model";

export type NotifyResult =
  | { sent: true; via: "resend" | "gmail" }
  | { sent: false; reason: string; code: "off" | "failed" };
export const notifyAddress = () => (process.env.NOTIFY_EMAIL || event.notifyEmail).trim();

const FALLBACK_FROM = "Baby Shower RSVP <onboarding@resend.dev>";
const fromAddress = () => process.env.NOTIFY_FROM_EMAIL?.trim() || FALLBACK_FROM;

const gmailUser = () => process.env.GMAIL_USER?.trim() || "";
// Google shows app passwords in groups of four; spaces are not part of the password.
const gmailPassword = () => process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "") || "";
const gmailConfigured = () => Boolean(gmailUser() && gmailPassword());
const resendSenderVerified = () => Boolean(process.env.RESEND_API_KEY?.trim() && process.env.NOTIFY_FROM_EMAIL?.trim());

/**
 * Guests can be emailed through the couple's Gmail (GMAIL_USER + GMAIL_APP_PASSWORD),
 * or through Resend once a sender on a verified domain is set (NOTIFY_FROM_EMAIL).
 * Resend's shared test sender only reaches the account owner, so it is not used for guests.
 */
export const guestConfirmationsEnabled = () => gmailConfigured() || resendSenderVerified();

async function sendWithResend(to: string, template: EmailTemplate, idempotencyKey: string, replyTo?: string): Promise<NotifyResult> {
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

let gmailTransport: Transporter | null = null;
/** Tests swap in nodemailer's JSON transport so no real email is sent. */
export function setGmailTransportForTests(transport: Transporter | null) {
  gmailTransport = transport;
}

function gmail(): Transporter {
  gmailTransport ??= nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: gmailUser(), pass: gmailPassword() },
  });
  return gmailTransport;
}

async function sendWithGmail(to: string, template: EmailTemplate, replyTo?: string): Promise<NotifyResult> {
  const message = {
    from: { name: event.brand, address: gmailUser() },
    to,
    replyTo,
    subject: template.subject,
    html: template.html,
    text: template.text,
    attachments: template.attachments?.map((a) => ({
      filename: a.filename || undefined,
      content: typeof a.content === "string" ? Buffer.from(a.content, "base64") : a.content,
      contentType: a.contentType,
      cid: a.contentId,
    })),
  };
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await gmail().sendMail(message);
      return { sent: true, via: "gmail" };
    } catch (error) {
      const code = (error as { responseCode?: number }).responseCode ?? 0;
      console.error("Gmail could not send:", (error as Error).message);
      // 5xx answers (bad password, rejected address) will not change on a retry.
      if (code >= 500) return { sent: false, reason: (error as Error).message, code: "failed" };
    }
    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 800));
  }
  return { sent: false, reason: "Gmail is temporarily unavailable.", code: "failed" };
}

/** The host email stays on Resend: on Vercel it is also the stored copy of each RSVP. */
export function sendRsvpNotification(rsvp: Rsvp, source: RsvpSource = "guest") {
  return sendWithResend(notifyAddress(), buildHostNotificationEmail(rsvp, source), `rsvp-host-${rsvp.id}-${rsvp.updatedAt}`, rsvp.email || undefined);
}

export function sendRsvpConfirmation(rsvp: Rsvp): Promise<NotifyResult> {
  if (!rsvp.email) return Promise.resolve({ sent: false, reason: "No guest email address.", code: "off" });
  const template = buildGuestConfirmationEmail(rsvp);
  if (gmailConfigured()) return sendWithGmail(rsvp.email, template, notifyAddress());
  if (resendSenderVerified()) return sendWithResend(rsvp.email, template, `rsvp-guest-${rsvp.id}-${rsvp.updatedAt}`, notifyAddress());
  return Promise.resolve({ sent: false, reason: "Guest confirmations need Gmail (GMAIL_USER + GMAIL_APP_PASSWORD) or a verified Resend sender.", code: "off" });
}
