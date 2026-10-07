import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BlogCardProps = {
  title: string;
  date?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  /**
   * "detail": roomy row for the invitation details; the value drops under the title on phones.
   * "ledger": compact row whose dotted leader always joins label and value (recaps, host totals).
   */
  variant?: "detail" | "ledger";
  /** Ledger only: make the label the prominent part (e.g. a guest's name). */
  strongTitle?: boolean;
  className?: string;
};

/** Editorial dotted-leader row, adapted for the invitation, the RSVP recap and the host ledger. */
export default function BlogCard({ title, date, description, icon, variant = "detail", strongTitle = false, className }: BlogCardProps) {
  if (variant === "ledger") {
    return (
      <div className={cn("event-detail-row ledger-row min-w-0 py-3 first:pt-0 last:pb-0", className)}>
        <div className="flex min-w-0 items-baseline gap-3">
          <span className={cn("min-w-0 shrink text-base", strongTitle ? "font-semibold text-foreground break-words" : "shrink-0 whitespace-nowrap text-muted-foreground")}>{title}</span>
          {date !== "" && date !== undefined && date !== null && (
            <>
              <span aria-hidden="true" className="ledger-leader min-w-6 flex-1 border-b-2 border-dotted border-primary/25" />
              <span className={cn("max-w-[65%] shrink-0 text-right leading-snug [overflow-wrap:anywhere]", strongTitle ? "text-sm font-medium text-primary" : "text-base font-semibold text-foreground")}>{date}</span>
            </>
          )}
        </div>
        {description && <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</div>}
      </div>
    );
  }

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
          {description && <div className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</div>}
        </div>
      </div>
    </article>
  );
}
