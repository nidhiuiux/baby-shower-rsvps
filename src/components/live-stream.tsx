"use client";

import { buttonVariants } from "@/components/ui/button";
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
        className="content-width section-space surface-card panel-padding text-center"
      >
        <span className="icon-medallion mx-auto">
          <Video className="size-6" strokeWidth={1.5} aria-hidden />
        </span>
        <p className="eyebrow mt-5">
          {t.liveEyebrow}
        </p>
        <h2 id="live-stream" className="section-heading mt-2">
          {t.liveHeading}
        </h2>
        <p className="section-copy mt-3">
          {url ? t.liveReady : t.liveSoon}
        </p>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">{t.liveWhen}</p>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ className: "mt-6" })}
          >
            {t.liveWatch}
          </a>
        ) : (
          <p className="mt-6 inline-flex rounded-full bg-secondary px-4 py-2 text-sm font-semibold leading-relaxed text-primary">
            {t.liveSoonPill}
          </p>
        )}
      </section>
    </Reveal>
  );
}
