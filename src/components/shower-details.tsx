"use client";

import { FeatureCard } from "@/components/ui/grid-feature-cards";
import { event } from "@/lib/event";
import { Calendar, MapPin } from "lucide-react";

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;

const details = [
  {
    title: "When",
    icon: Calendar,
    imageSrc: "/doodles/star.svg",
    description: (
      <>
        <p className="font-display text-xl leading-tight text-[var(--ink)]">Sunday, October 25</p>
        <p className="mt-1">10:30 in the morning</p>
      </>
    ),
  },
  {
    title: "Where",
    icon: MapPin,
    imageSrc: "/doodles/moon.svg",
    description: (
      <>
        <p className="font-display text-xl leading-tight text-[var(--ink)]">124 Crain Road</p>
        <a href={mapsHref} target="_blank" rel="noreferrer" className="mt-1 inline-block underline decoration-[var(--blush)] underline-offset-4">
          Paramus, NJ 07652
        </a>
      </>
    ),
  },
];

export function ShowerDetails() {
  return (
    <section aria-label="Shower details" className="mt-10">
      <h2 className="mb-4 text-center font-display text-2xl text-[var(--ink)] sm:text-[1.75rem]">
        A few things to know
      </h2>
      <div className="grid grid-cols-1 divide-x divide-y divide-dashed divide-[var(--line)] overflow-hidden rounded-[1.75rem] border border-dashed border-[var(--line)] bg-white/55 sm:grid-cols-2">
        {details.map((detail) => (
          <FeatureCard key={detail.title} feature={detail} />
        ))}
      </div>
    </section>
  );
}
