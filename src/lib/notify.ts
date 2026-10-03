import { Resend } from "resend";
import { event } from "@/lib/event";
import type { Rsvp } from "@/lib/rsvps";

export type NotifyResult =
  | { sent: true; via: "resend" | "formsubmit" }
  | { sent: false; reason: string };

function notifyAddress(): string {
  return (process.env.NOTIFY_EMAIL || event.notifyEmail).trim();
}

function emailBody(rsvp: Rsvp, source: "guest" | "manual"): string {
  const status = rsvp.attending === "yes" ? "Coming" : "Can't make it";
  const lines = [
    `New RSVP for ${event.brand}'s ${event.title}`,
    "",
    `Name: ${rsvp.name}`,
    `Status: ${status}`,
    `Note: ${rsvp.note || "(none)"}`,
    `Source: ${source === "manual" ? "Added manually by host" : "Guest RSVP form"}`,
    `Time: ${new Date(rsvp.createdAt).toLocaleString("en-US", { timeZone: "America/New_York" })}`,
  ];
  return lines.join("\n");
}

async function sendWithResend(
  to: string,
  subject: string,
  text: string,
): Promise<NotifyResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, reason: "RESEND_API_KEY not set" };
  }

  const resend = new Resend(apiKey);
  const from =
    process.env.NOTIFY_FROM_EMAIL || "Baby Shower RSVP <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    text,
  });

  if (error) {
    console.error("Resend error:", error);
    return { sent: false, reason: error.message };
  }

  return { sent: true, via: "resend" };
}

/** Free fallback — first use emails you an activation link to confirm. */
async function sendWithFormSubmit(
  to: string,
  subject: string,
  text: string,
  rsvp: Rsvp,
  source: "guest" | "manual",
): Promise<NotifyResult> {
  try {
    const res = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(to)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: subject,
          name: rsvp.name,
          attending: rsvp.attending === "yes" ? "Coming" : "Can't make it",
          note: rsvp.note || "(none)",
          source: source === "manual" ? "Manual host entry" : "Guest form",
          message: text,
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      console.error("FormSubmit error:", res.status, body);
      return { sent: false, reason: `FormSubmit failed (${res.status})` };
    }

    return { sent: true, via: "formsubmit" };
  } catch (err) {
    console.error("FormSubmit error:", err);
    return { sent: false, reason: "FormSubmit request failed" };
  }
}

export async function sendRsvpNotification(
  rsvp: Rsvp,
  source: "guest" | "manual" = "guest",
): Promise<NotifyResult> {
  const to = notifyAddress();
  if (!to) {
    return { sent: false, reason: "No notify email configured" };
  }

  const status = rsvp.attending === "yes" ? "Yes" : "No";
  const subject = `RSVP ${status}: ${rsvp.name} — ${event.brand} Baby Shower`;
  const text = emailBody(rsvp, source);

  if (process.env.RESEND_API_KEY) {
    const result = await sendWithResend(to, subject, text);
    if (result.sent) return result;
    console.warn("Resend failed, trying FormSubmit fallback:", result.reason);
  }

  return sendWithFormSubmit(to, subject, text, rsvp, source);
}
