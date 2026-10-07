import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BlogCardProps = {
  title: string;
  date: string;
  description: ReactNode;
  icon?: ReactNode;
  className?: string;
};

/** Editorial dotted-leader row, adapted for the existing invitation details. */
export default function BlogCard({ title, date, description, icon, className }: BlogCardProps) {
  return (
    <article className={cn("event-detail-row relative min-w-0 py-6 first:pt-0 last:pb-0", className)}>
      <div className="relative flex min-w-0 items-start gap-4 sm:gap-5">
        {icon && <span aria-hidden="true" className="event-detail-icon mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-primary">{icon}</span>}
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-2">
            <h3 className="font-display text-xl leading-snug text-foreground sm:text-2xl">{title}</h3>
            <span aria-hidden="true" className="min-w-4 flex-1 border-b border-dotted border-primary/30 max-sm:hidden" />
            <span className="event-detail-value w-full text-sm font-semibold leading-relaxed text-primary sm:w-auto sm:max-w-[65%] sm:text-right">{date}</span>
          </div>
          <div className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</div>
        </div>
      </div>
    </article>
  );
}
