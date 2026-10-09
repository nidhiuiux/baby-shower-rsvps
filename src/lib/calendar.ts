import type { Copy } from "@/lib/copy";
import { event } from "@/lib/event";

/** Calendar helpers shared by the page's "Save the date" button and the guest email. */
export function icsStamp(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function icsText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("\n", "\\n").replaceAll(",", "\\,").replaceAll(";", "\;");
}

/** An .ics file that Apple Calendar, Outlook and Google Calendar can all import. */
export function buildIcs(t: Copy, link: string) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nidhi and Hardik Baby Shower//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:nidhi-hardik-baby-shower-${icsStamp(event.startsAt)}@rsvp`,
    `DTSTAMP:${icsStamp(new Date().toISOString())}`,
    `DTSTART:${icsStamp(event.startsAt)}`,
    `DTEND:${icsStamp(event.endsAt)}`,
    `SUMMARY:${icsText(t.calendarTitle)}`,
    `LOCATION:${icsText(event.location)}`,
    `DESCRIPTION:${icsText(t.calendarDescription(link))}`,
    `URL:${link}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsText(t.calendarTitle)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function googleCalendarUrl(t: Copy, link: string) {
  const stamp = (iso: string) => icsStamp(iso);
  const query = new URLSearchParams({
    action: "TEMPLATE",
    text: t.calendarTitle,
    dates: `${stamp(event.startsAt)}/${stamp(event.endsAt)}`,
    location: event.location,
    details: t.calendarDescription(link),
    ctz: "America/New_York",
  });
  return `https://calendar.google.com/calendar/render?${query}`;
}

const destination = encodeURIComponent(event.location);
export const directions = {
  google: `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
  apple: `https://maps.apple.com/?daddr=${destination}&dirflg=d`,
};
