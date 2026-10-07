"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform, type SpringOptions } from "framer-motion";
import { cn } from "@/lib/utils";

const DEFAULT_SPRING: SpringOptions = { stiffness: 160, damping: 28 };

type SpotlightProps = {
  className?: string;
  size?: number;
  springOptions?: SpringOptions;
};

/** A decorative pointer highlight. Its parent owns positioning and layout. */
export function Spotlight({ className, size = 280, springOptions = DEFAULT_SPRING }: SpotlightProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mouseX = useSpring(0, springOptions);
  const mouseY = useSpring(0, springOptions);
  const opacity = useSpring(0, { stiffness: 200, damping: 30 });
  const left = useTransform(mouseX, (x) => x - size / 2);
  const top = useTransform(mouseY, (y) => y - size / 2);

  useEffect(() => {
    const root = rootRef.current;
    const parent = root?.parentElement;
    if (!parent) return;
    const preference = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const move = (event: PointerEvent) => {
      if (!preference.matches || event.pointerType === "touch") return;
      const bounds = parent.getBoundingClientRect();
      mouseX.set(event.clientX - bounds.left);
      mouseY.set(event.clientY - bounds.top);
      opacity.set(1);
    };
    const leave = () => opacity.set(0);
    const changePreference = () => { if (!preference.matches) opacity.jump(0); };
    parent.addEventListener("pointermove", move);
    parent.addEventListener("pointerleave", leave);
    preference.addEventListener("change", changePreference);
    return () => {
      parent.removeEventListener("pointermove", move);
      parent.removeEventListener("pointerleave", leave);
      preference.removeEventListener("change", changePreference);
    };
  }, [mouseX, mouseY, opacity]);

  return (
    <div ref={rootRef} aria-hidden="true" className={cn("card-spotlight pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]", className)}>
      <motion.div
        className="card-spotlight-glow absolute rounded-full"
        style={{ width: size, height: size, left, top, opacity }}
      />
    </div>
  );
}
