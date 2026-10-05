"use client";

import { FeatureCard } from "@/components/ui/grid-feature-cards";
import { event } from "@/lib/event";
import { useCopy } from "@/lib/i18n";
import { Calendar, MapPin } from "lucide-react";

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;

export function ShowerDetails() {
  const { t } = useCopy();
  const details = [
    {
      title: t.detailWhen,
      icon: Calendar,
      description: (
        <>
          <p className="font-display text-xl leading-tight text-[var(--ink)]">{t.detailWhenDate}</p>
          <p className="mt-1">{t.detailWhenTime}</p>
        </>
      ),
    },
    {
      title: t.detailWhere,
      icon: MapPin,
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

  return (
    <section aria-label={t.detailsHeading} className="mt-10">
      <h2 className="mb-4 text-center font-display text-2xl text-[var(--ink)] sm:text-[1.75rem]">
        {t.detailsHeading}
      </h2>
      <div className="grid grid-cols-1 divide-x divide-y divide-dashed divide-[var(--line)] overflow-hidden rounded-[1.75rem] border border-dashed border-[var(--line)] bg-white/55 sm:grid-cols-2">
        {details.map((detail) => (
          <FeatureCard key={detail.title} feature={detail} />
        ))}
      </div>
    </section>
  );
}
