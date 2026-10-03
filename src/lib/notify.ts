import { Resend } from "resend";
import { event } from "@/lib/event";
import { rsvpRecordBlock, type Rsvp } from "@/lib/rsvps";

export type NotifyResult =
  | { sent: true; via: "resend" }
  | { sent: false; reason: string };

function notifyAddress(): string {
  return (process.env.NOTIFY_EMAIL || event.notifyEmail).trim();
}

function emailBody(rsvp: Rsvp, source: "guest" | "manual"): string {
  const status = rsvp.attending === "yes" ? "Coming" : "Can't make it";
  const guestLine =
    rsvp.attending === "yes" ? `Guests: ${rsvp.guests}` : "Guests: 0";
  return [
    `New RSVP for ${event.brand}'s ${event.title}`,
    "",
    `Name: ${rsvp.name}`,
    `Status: ${status}`,
    guestLine,
    `Note: ${rsvp.note || "(none)"}`,
    `Source: ${source === "manual" ? "Added manually by host" : "Guest RSVP form"}`,
    `Time: ${new Date(rsvp.createdAt).toLocaleString("en-US", {
      timeZone: "America/New_York",
    })}`,
    "",
    "Open your host page anytime to see the full list.",
    "",
    rsvpRecordBlock(rsvp),
  ].join("\n");
}

export async function sendRsvpNotification(
  rsvp: Rsvp,
  source: "guest" | "manual" = "guest",
): Promise<NotifyResult> {
  const to = notifyAddress();
  if (!to) {
    return { sent: false, reason: "No notify email configured" };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return {
      sent: false,
      reason:
        "Add RESEND_API_KEY to .env.local (free at resend.com), then restart the app",
    };
  }

  const status = rsvp.attending === "yes" ? "Yes" : "No";
  const subject = `RSVP ${status}: ${rsvp.name} — ${event.brand} Baby Shower`;
  const text = emailBody(rsvp, source);
  const from =
    process.env.NOTIFY_FROM_EMAIL?.trim() ||
    "Baby Shower RSVP <onboarding@resend.dev>";

  try {
    const resend = new Resend(apiKey);
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
  } catch (err) {
    console.error("Resend error:", err);
    return { sent: false, reason: "Email send failed" };
  }
}
