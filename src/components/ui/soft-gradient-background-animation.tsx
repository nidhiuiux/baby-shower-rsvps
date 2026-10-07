import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type BgradientAnimProps = {
  className?: string;
  animationDuration?: number;
  /** "fixed" keeps the gradient still behind a scrolling page, like a sky. */
  position?: "absolute" | "fixed";
};

/** A slow sage-and-blush version of the supplied soft-gradient background. */
export function BgradientAnim({ className, animationDuration = 14, position = "absolute" }: BgradientAnimProps) {
  const duration = Number.isFinite(animationDuration) ? Math.max(1, animationDuration) : 14;

  return (
    <div
      aria-hidden="true"
      className={cn("soft-gradient-bg pointer-events-none inset-0", position === "fixed" ? "fixed" : "absolute", className)}
      style={{ "--gradient-duration": `${duration}s` } as CSSProperties}
    />
  );
}
