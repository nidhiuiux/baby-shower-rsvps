"use client";

import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { Spotlight } from "@/components/ui/spotlight";
import { VideoPlayer } from "@/components/ui/video-thumbnail-player";
import { event } from "@/lib/event";
import { useCopy } from "@/lib/i18n";
import { ExternalLink, Video } from "lucide-react";
import thumbnail from "../../public/live/thumbnail.jpg";

/** YouTube video id from a /live/, /watch?v= or youtu.be link */
function youtubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/(?:live\/|watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  return match?.[1] ?? null;
}

/** One calm section for guests joining online; shows "stay tuned" until event.liveStreamUrl is set */
export function LiveStream() {
  const { t } = useCopy();
  const url = event.liveStreamUrl;
  const videoId = url ? youtubeId(url) : null;

  return (
    <Reveal>
      <section
        aria-labelledby="live-stream"
        className="has-spotlight content-width section-space surface-card panel-padding text-center"
      >
        <Spotlight size={300} />
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
        {url && videoId ? (
          <>
            <VideoPlayer
              className="mt-6"
              thumbnailUrl={thumbnail}
              videoUrl={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`}
              title={t.liveHeading}
              hideCaption
              closeLabel={t.liveClose}
            />
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", className: "mt-4" })}
            >
              <ExternalLink aria-hidden />
              {t.liveOpenYoutube}
            </a>
          </>
        ) : url ? (
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
