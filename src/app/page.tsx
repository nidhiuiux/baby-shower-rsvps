import { BabyDoodles } from "@/components/baby-doodles";
import { RsvpForm } from "@/components/rsvp-form";
import { event } from "@/lib/event";

export default function Home() {
  return (
    <div className="shower-shell flex flex-1 flex-col">
      <span className="petal petal-1" aria-hidden />
      <span className="petal petal-2" aria-hidden />
      <span className="petal petal-3" aria-hidden />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-12 sm:px-6 sm:py-16">
        <header className="animate-rise mb-10 text-center sm:mb-12">
          <BabyDoodles />
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--leaf-deep)] sm:text-base">
            {event.eyebrow}
          </p>
          <p className="mt-3 font-display text-5xl leading-none tracking-tight text-[var(--ink)] sm:text-6xl md:text-7xl">
            {event.brand}
          </p>
          <p className="mt-3 font-display text-2xl italic text-[var(--leaf-deep)] sm:text-3xl">
            {event.title}
          </p>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-[var(--ink-soft)] sm:text-lg">
            {event.tagline}
          </p>
          <div className="mt-6 space-y-1 text-sm text-[var(--ink-soft)] sm:text-base">
            <p>{event.date}</p>
            <p>{event.location}</p>
          </div>
        </header>

        <section
          aria-label="RSVP form"
          className="rounded-[1.75rem] border border-white/70 bg-white/55 p-6 shadow-[0_20px_60px_-30px_rgba(47,61,52,0.35)] backdrop-blur-sm sm:p-8"
        >
          <h2 className="mb-6 text-center font-display text-2xl text-[var(--ink)]">
            Kindly RSVP
          </h2>
          <RsvpForm />
        </section>
      </main>
    </div>
  );
}
