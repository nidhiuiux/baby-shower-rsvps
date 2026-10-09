"use client";

import { useState, useSyncExternalStore } from "react";
import { Calendar, MapPin, MessageCircle, Share2 } from "lucide-react";
import { buildIcs } from "@/lib/calendar";
import { shareLink, type Copy, type Lang } from "@/lib/copy";
import { event } from "@/lib/event";
import { useCopy } from "@/lib/i18n";

/** The invitation message in the language the guest is viewing the page in */
function shareText(t: Copy, lang: Lang) {
  return t.shareMessage(shareLink(window.location.origin, lang));
}

export function InviteActions() {
  const { t, lang } = useCopy();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  // Only phones and some browsers offer the system share sheet (Messages, Gmail, Google apps...)
  const canShare = useSyncExternalStore(
    () => () => {},
    () => typeof navigator.share === "function",
    () => false,
  );
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;

  function shareWhatsApp() {
    const href = `https://wa.me/?text=${encodeURIComponent(shareText(t, lang))}`;
    window.open(href, "_blank", "noopener,noreferrer");
  }

  async function shareNative() {
    try {
      await navigator.share({ title: t.shareTitle, text: shareText(t, lang) });
    } catch {
      // Closing the share sheet is not an error
    }
  }

  function saveDate() {
    const blob = new Blob([buildIcs(t, window.location.origin)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nidhi-hardik-baby-shower.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareLink(window.location.origin, lang));
      setCopyError(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyError(true);
      setCopied(false);
    }
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={shareWhatsApp} className="invite-chip">
          <MessageCircle aria-hidden />
          {t.actionWhatsapp}
        </button>
        {canShare ? (
          <button type="button" onClick={() => void shareNative()} className="invite-chip">
            <Share2 aria-hidden />
            {t.actionShare}
          </button>
        ) : null}
        <button type="button" onClick={saveDate} className="invite-chip">
          <Calendar aria-hidden />
          {t.actionSaveDate}
        </button>
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="invite-chip">
          <MapPin aria-hidden />
          {t.actionDirections}
        </a>
      </div>
      <button type="button" onClick={copyLink} className="min-h-11 rounded-lg px-3 py-2 text-sm font-semibold text-primary underline-offset-4 hover:underline">
        {copied ? t.actionCopied : t.actionCopy}
      </button>
      <p className="sr-only" role="status">{copied ? t.actionCopied : ""}</p>
      {copyError && <p role="alert" className="text-sm text-destructive">{t.actionCopyError}</p>}
    </div>
  );
}
