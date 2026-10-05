"use client";

import { Reveal } from "@/components/reveal";
import { event } from "@/lib/event";
import { useCopy } from "@/lib/i18n";
import { Video } from "lucide-react";

/** One calm section for guests joining online; shows "stay tuned" until event.liveStreamUrl is set */
export function LiveStream() {
  const { t } = useCopy();
  const url = event.liveStreamUrl;

  return (
    <Reveal>
      <section
        aria-labelledby="live-stream"
        className="mx-auto mt-10 w-full max-w-xl rounded-[1.75rem] border border-white/70 bg-white/55 px-6 py-8 text-center shadow-[0_20px_60px_-30px_rgba(47,61,52,0.35)] backdrop-blur-sm sm:px-8"
      >
        <span className="mx-auto flex size-16 items-center justify-center rounded-full border border-white/80 bg-white/80 text-[var(--blush-deep)] shadow-[inset_0_0_0_6px_var(--leaf-soft)]">
          <Video className="size-6" strokeWidth={1.5} aria-hidden />
        </span>
        <p className="eyebrow mt-5 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[var(--leaf-deep)] sm:text-xs">
          {t.liveEyebrow}
        </p>
        <h2 id="live-stream" className="mt-2 font-display text-3xl leading-tight text-[var(--ink)] sm:text-4xl">
          {t.liveHeading}
        </h2>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
          {url ? t.liveReady : t.liveSoon}
        </p>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">{t.liveWhen}</p>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[var(--leaf)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--leaf-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--leaf)]/50"
          >
            {t.liveWatch}
          </a>
        ) : (
          <p className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-dashed border-[var(--line)] bg-white/60 px-6 text-sm font-semibold text-[var(--ink-soft)]">
            {t.liveSoonPill}
          </p>
        )}
      </section>
    </Reveal>
  );
}
