import { BabyDoodles, FloatingDoodles } from "@/components/baby-doodles";
import { CelebrateScroll } from "@/components/celebrate-scroll";
import { Countdown } from "@/components/countdown";
import { InvitationReveal } from "@/components/invitation-reveal";
import { InviteActions } from "@/components/invite-actions";
import { RsvpForm } from "@/components/rsvp-form";
import { ShowerDetails } from "@/components/shower-details";
import { ShowerTicket } from "@/components/shower-ticket";
import { TwinklingStars } from "@/components/twinkling-stars";
import { event } from "@/lib/event";

export default function Home() {
  return (
    <InvitationReveal>
      <div className="shower-shell flex flex-1 flex-col">
        <TwinklingStars />
        <span className="petal petal-1" aria-hidden />
        <span className="petal petal-2" aria-hidden />
        <span className="petal petal-3" aria-hidden />
        <FloatingDoodles />

        <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-12 sm:px-6 sm:py-16">
          <header className="animate-rise text-center">
            <BabyDoodles />
            <p className="eyebrow mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[var(--leaf-deep)] sm:text-xs">
              {event.eyebrow}
            </p>
            <p className="brand-name mt-3 font-display text-5xl leading-[0.95] tracking-tight text-[var(--ink)] sm:text-6xl md:text-7xl">
              {event.brand}
            </p>
            <p className="mt-3 font-display text-xl italic leading-snug text-[var(--blush-deep)] sm:text-2xl">
              {event.title}
            </p>
            <p className="mx-auto mt-5 max-w-sm text-[0.95rem] leading-relaxed text-[var(--ink-soft)] sm:max-w-md sm:text-base">
              {event.tagline}
            </p>
            <div className="mt-8">
              <ShowerTicket />
            </div>
          </header>

          <CelebrateScroll />

          <div className="text-center">
            <Countdown />
            <InviteActions />
          </div>

          <ShowerDetails />

          <section
            aria-label="RSVP form"
            className="animate-rise-delay rsvp-card mx-auto mt-10 w-full max-w-xl rounded-[1.75rem] border border-white/70 bg-white/55 p-6 shadow-[0_20px_60px_-30px_rgba(47,61,52,0.35)] backdrop-blur-sm sm:p-8"
          >
            <h2 className="mb-1 text-center font-display text-2xl text-[var(--ink)] sm:text-[1.75rem]">
              Kindly RSVP
            </h2>
            <p className="mb-6 text-center text-sm text-[var(--ink-muted)]">
              We can&apos;t wait to see you ♡
            </p>
            <RsvpForm />
          </section>
        </main>
      </div>
    </InvitationReveal>
  );
}
