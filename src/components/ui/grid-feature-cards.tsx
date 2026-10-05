import { cn } from "@/lib/utils";
import React from "react";

type FeatureType = {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: React.ReactNode;
};

type FeatureCardPorps = React.ComponentProps<"div"> & {
  feature: FeatureType;
};

export function FeatureCard({ feature, className, ...props }: FeatureCardPorps) {
  const p = genRandomPattern(5, feature.title);
  return (
    <div className={cn("relative overflow-hidden p-6", className)} {...props}>
      <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
        <div className="from-foreground/5 to-foreground/1 absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] opacity-100">
          <GridPattern width={20} height={20} x="-12" y="4" squares={p} className="fill-foreground/5 stroke-foreground/25 absolute inset-0 h-full w-full mix-blend-overlay" />
        </div>
      </div>
      <span className="relative z-20 flex size-16 items-center justify-center rounded-full border border-white/80 bg-white/80 text-[var(--blush-deep)] shadow-[inset_0_0_0_6px_var(--leaf-soft)]">
        <feature.icon className="size-6" strokeWidth={1.5} aria-hidden />
      </span>
      <h3 className={cn("font-display relative z-20 text-sm text-[var(--ink)] md:text-base", "mt-5")}>{feature.title}</h3>
      <div className="text-muted-foreground relative z-20 mt-2 text-sm leading-relaxed">{feature.description}</div>
    </div>
  );
}

function GridPattern({ width, height, x, y, squares, ...props }: React.ComponentProps<"svg"> & { width: number; height: number; x: string; y: string; squares?: number[][] }) {
  const patternId = React.useId();
  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern id={patternId} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([sx, sy], index) => (
            <rect strokeWidth="0" key={index} width={width + 1} height={height + 1} x={sx * width} y={sy * height} />
          ))}
        </svg>
      )}
    </svg>
  );
}

function genRandomPattern(length: number, seed: string): number[][] {
  let n = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    n ^= seed.charCodeAt(i);
    n = Math.imul(n, 16777619);
  }
  const next = () => {
    n = Math.imul(n ^ (n >>> 16), 2246822507);
    n = Math.imul(n ^ (n >>> 13), 3266489909);
    n ^= n >>> 16;
    return (n >>> 0) / 4294967296;
  };
  return Array.from({ length }, () => [Math.floor(next() * 4) + 7, Math.floor(next() * 6) + 1]);
}
