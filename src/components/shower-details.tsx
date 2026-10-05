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
          <a href={mapsHref} target="_blank" rel="noreferrer" className="mt-1 inline-flex min-h-11 items-center rounded-sm text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary">
            Paramus, NJ 07652
          </a>
        </>
      ),
    },
  ];

  return (
    <section aria-labelledby="details-heading" className="content-width section-space">
      <h2 id="details-heading" className="section-heading mb-6 text-center">
        {t.detailsHeading}
      </h2>
      <div className="surface-card grid grid-cols-1 divide-y divide-border overflow-hidden sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        {details.map((detail) => (
          <FeatureCard key={detail.title} feature={detail} />
        ))}
      </div>
    </section>
  );
}
