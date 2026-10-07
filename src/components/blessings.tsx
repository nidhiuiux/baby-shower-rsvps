"use client";

import { BabyRadha, KabirSaheb, KrishnaWithFlute, LotusDivider, MotherToBe } from "@/components/devotional-art";
import { Spotlight } from "@/components/ui/spotlight";
import { Reveal } from "@/components/reveal";
import { event } from "@/lib/event";
import { useCopy } from "@/lib/i18n";

/** Opening blessing — Kabir Saheb with the greeting */
export function SahibBandgi() {
  const { t } = useCopy();
  return (
    <Reveal>
      <section aria-labelledby="sahib-bandgi" className="content-width section-space text-center">
        <div className="art-halo mx-auto w-52 sm:w-64">
          <KabirSaheb
            alt={t.kabirAlt}
            sizes="(min-width: 640px) 256px, 208px"
            className="h-auto w-full"
          />
        </div>
        <p className="eyebrow mt-6">
          {t.blessingEyebrow}
        </p>
        <h2
          id="sahib-bandgi"
          lang="hi"
          className="font-hindi mt-2 text-4xl leading-snug text-[var(--ink)] sm:text-5xl"
        >
          {event.blessing.title}
        </h2>
        <p className="font-display mt-1 text-lg italic text-[var(--blush-deep)] sm:text-xl">
          {event.blessing.transliteration}
        </p>
        <LotusDivider className="mt-4" />
        <p className="section-copy mx-auto mt-4 max-w-md">
          {t.blessingMessage}
        </p>
      </section>
    </Reveal>
  );
}

/** The shower itself — Shrimant Sanskar */
export function ShrimantSanskar() {
  const { t } = useCopy();
  return (
    <Reveal>
      <section
        aria-labelledby="shrimant-sanskar"
        className="content-width section-space surface-card panel-padding relative text-center sm:grid sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center sm:gap-8 sm:text-left"
      >
        <Spotlight size={320} />
        <MotherToBe sizes="(min-width: 640px) 208px, 176px" className="relative mx-auto h-auto w-44 sm:w-52" />
        <div className="relative mt-5 sm:mt-0">
          <p className="eyebrow">
            {t.shrimantEyebrow}
          </p>
          <h2 id="shrimant-sanskar" className="section-heading mt-2">
            {t.shrimantTitle}
          </h2>
          <p className="mt-3 font-display text-lg italic leading-snug text-[var(--blush-deep)]">
            {t.shrimantLine}
          </p>
          <p className="section-copy mt-3">{t.shrimantMessage}</p>
        </div>
      </section>
    </Reveal>
  );
}

/** Closing note with Krishna and Radha */
export function WithLove() {
  const { t } = useCopy();
  return (
    <Reveal>
      <footer className="content-width section-space text-center">
        <div className="mx-auto flex max-w-sm items-end justify-center gap-3 sm:max-w-md sm:gap-6">
          <KrishnaWithFlute sizes="(min-width: 640px) 200px, 45vw" className="art-float h-auto w-[46%]" />
          <BabyRadha sizes="(min-width: 640px) 200px, 45vw" className="art-float art-float-delay h-auto w-[46%]" />
        </div>
        <LotusDivider className="mt-5" />
        <p className="mt-3 font-display text-2xl text-[var(--ink)] sm:text-3xl">{t.withLove}</p>
        <p className="font-display text-xl italic text-[var(--blush-deep)] sm:text-2xl">{t.brand}</p>
        <p lang="hi" className="font-hindi mt-3 text-sm text-[var(--ink-muted)]">{event.blessing.title}</p>
      </footer>
    </Reveal>
  );
}
