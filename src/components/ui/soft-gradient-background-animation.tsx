import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type BgradientAnimProps = {
  className?: string;
  animationDuration?: number;
};

/** A slow sage-and-blush version of the supplied soft-gradient background. */
export function BgradientAnim({ className, animationDuration = 14 }: BgradientAnimProps) {
  const duration = Number.isFinite(animationDuration) ? Math.max(1, animationDuration) : 14;

  return (
    <div
      aria-hidden="true"
      className={cn("soft-gradient-bg pointer-events-none absolute inset-0", className)}
      style={{ "--gradient-duration": `${duration}s` } as CSSProperties}
    />
  );
}
