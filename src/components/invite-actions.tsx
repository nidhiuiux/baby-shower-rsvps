"use client";

import { useState, useSyncExternalStore } from "react";
import { Calendar, MapPin, MessageCircle, Share2 } from "lucide-react";
import { event } from "@/lib/event";

function icsStamp(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function icsText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("\n", "\\n").replaceAll(",", "\\,").replaceAll(";", "\\;");
}

function buildIcs() {
  const summary = icsText(`${event.title} — ${event.brand}`);
  const description = icsText(`${event.tagline} RSVP at ${window.location.origin}`);
  const lines = [
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
    `SUMMARY:${summary}`,
    `LOCATION:${icsText(event.location)}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

function shareText() {
  const { share } = event;
  return [
    share.greeting,
    "",
    share.intro,
    "",
    share.closing,
    "",
    `🗓️ : ${share.date}`,
    `🕥 : ${share.time}`,
    `📍 : ${event.location}`,
    "",
    share.rsvpLine,
    window.location.origin,
  ].join("\n");
}

export function InviteActions() {
  const [copied, setCopied] = useState(false);
  // Only phones and some browsers offer the system share sheet (Messages, Gmail, Google apps...)
  const canShare = useSyncExternalStore(
    () => () => {},
    () => typeof navigator.share === "function",
    () => false,
  );
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;

  function shareWhatsApp() {
    const href = `https://wa.me/?text=${encodeURIComponent(shareText())}`;
    window.open(href, "_blank", "noopener,noreferrer");
  }

  async function shareNative() {
    try {
      await navigator.share({ title: `${event.brand} | Shrimant Sanskar & ${event.title}`, text: shareText() });
    } catch {
      // Closing the share sheet is not an error
    }
  }

  function saveDate() {
    const blob = new Blob([buildIcs()], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nidhi-hardik-baby-shower.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={shareWhatsApp} className="invite-chip">
          <MessageCircle aria-hidden />
          WhatsApp
        </button>
        {canShare ? (
          <button type="button" onClick={() => void shareNative()} className="invite-chip">
            <Share2 aria-hidden />
            Share
          </button>
        ) : null}
        <button type="button" onClick={saveDate} className="invite-chip">
          <Calendar aria-hidden />
          Save the date
        </button>
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="invite-chip">
          <MapPin aria-hidden />
          Directions
        </a>
      </div>
      <button type="button" onClick={copyLink} className="text-xs font-medium text-[var(--leaf-deep)] underline-offset-4 hover:underline">
        {copied ? "Link copied" : "Copy RSVP link"}
      </button>
    </div>
  );
}
