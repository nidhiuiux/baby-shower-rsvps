"use client";

import { CalendarDays, MapPin } from "lucide-react";
import { DirectionsMenu } from "@/components/directions-menu";
import BlogCard from "@/components/ui/blog-cards";
import { useCopy } from "@/lib/i18n";

export function ShowerDetails() {
  const { t } = useCopy();

  return (
    <section aria-labelledby="details-heading" className="content-width section-space">
      <h2 id="details-heading" className="section-heading mb-6 text-center">
        {t.detailsHeading}
      </h2>
      <div className="surface-card panel-padding divide-y divide-border">
        <BlogCard
          title={t.detailWhen}
          date={t.detailWhenDate}
          icon={<CalendarDays className="size-5" strokeWidth={1.5} />}
          description={<p>{t.detailWhenTime}</p>}
        />
        <BlogCard
          title={t.detailWhere}
          date="124 Crain Road"
          icon={<MapPin className="size-5" strokeWidth={1.5} />}
          description={
            <>
              <p>Paramus, NJ 07652</p>
              <DirectionsMenu />
            </>
          }
        />
      </div>
    </section>
  );
}
