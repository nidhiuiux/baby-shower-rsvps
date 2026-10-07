"use client";

import { SahibBandgi, ShrimantSanskar, WithLove } from "@/components/blessings";
import { FloatingDoodles } from "@/components/baby-doodles";
import { KrishnaOnMoon } from "@/components/devotional-art";
import { CelebrateScroll } from "@/components/celebrate-scroll";
import { Countdown } from "@/components/countdown";
import { InvitationReveal } from "@/components/invitation-reveal";
import { ScrollLanguageSwitch } from "@/components/language-switch";
import { InviteActions } from "@/components/invite-actions";
import { LiveStream } from "@/components/live-stream";
import { RsvpForm } from "@/components/rsvp-form";
import { ShowerDetails } from "@/components/shower-details";
import { ShowerTicket } from "@/components/shower-ticket";
import { TwinklingStars } from "@/components/twinkling-stars";
import { useCopy } from "@/lib/i18n";

export default function Home() {
  const { t } = useCopy();
  return (
    <InvitationReveal>
      <div className="shower-shell flex flex-1 flex-col">
        <TwinklingStars />
        <span className="petal petal-1" aria-hidden />
        <span className="petal petal-2" aria-hidden />
        <span className="petal petal-3" aria-hidden />
        <FloatingDoodles />

        <main className="page-container flex flex-col">
          <ScrollLanguageSwitch />

          <header className="animate-rise text-center">
            <KrishnaOnMoon
              priority
              alt=""
              sizes="(min-width: 640px) 256px, 208px"
              className="art-float mx-auto h-auto w-52 sm:w-64"
            />
            <p className="eyebrow mt-6">
              {t.eyebrow}
            </p>
            <h1 tabIndex={-1} className="outline-none brand-name mt-3 font-display text-5xl leading-[0.95] tracking-tight text-[var(--ink)] sm:text-6xl md:text-7xl">
              {t.brand}
            </h1>
            <p className="mt-3 font-display text-xl italic leading-snug text-[var(--blush-deep)] sm:text-2xl">
              {t.title}
            </p>
            <p className="section-copy mx-auto mt-5 max-w-md">
              {t.tagline}
            </p>
            <div className="mt-8">
              <ShowerTicket
                name={t.brand}
                presenter={t.eyebrow}
                eventTitle={t.title}
                stubText={t.ticketStub}
                dates={t.ticketDates}
              />
            </div>
          </header>

          <SahibBandgi />
          <ShrimantSanskar />

          <CelebrateScroll />

          <div className="text-center">
            <Countdown />
            <InviteActions />
          </div>

          <ShowerDetails />

          <section
            id="rsvp"
            aria-labelledby="rsvp-heading"
            className="rsvp-card content-width section-space surface-card panel-padding"
          >
            <h2 id="rsvp-heading" className="section-heading mb-2 text-center">
              {t.rsvpHeading}
            </h2>
            <p className="section-copy text-center">
              {t.rsvpSub}
            </p>
            <p className="mb-8 mt-3 text-center text-sm font-semibold leading-relaxed text-[var(--blush-deep)]">
              {t.rsvpConfirmBy}
            </p>
            <RsvpForm />
          </section>

          <LiveStream />

          <WithLove />
        </main>
      </div>
    </InvitationReveal>
  );
}
