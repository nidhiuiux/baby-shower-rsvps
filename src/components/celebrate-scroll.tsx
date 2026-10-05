"use client";

import { useRef } from "react";
import { useScroll } from "framer-motion";
import { CharacterV1 } from "@/components/ui/text-scroll-animation";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useCopy } from "@/lib/i18n";

/** Split into whole letters so Gujarati conjuncts are never torn apart */
function letters(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text), (part) => part.segment);
  }
  return Array.from(text);
}

export function CelebrateScroll() {
  const { t } = useCopy();
  const reduced = useReducedMotion();
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 0.85", "start 0.25"],
  });
  const characters = letters(t.celebrateText);
  const centerIndex = Math.floor(characters.length / 2);

  return (
    <section
      ref={targetRef}
      aria-label={t.celebrateText}
      className="relative section-space flex items-center justify-center overflow-hidden py-12 sm:py-16"
    >
      <div className="text-center">
        {!reduced && <p className="eyebrow mb-4">{t.celebrateHint}</p>}
        <div
          aria-hidden="true"
          className="font-display text-4xl tracking-tight text-[var(--ink)] uppercase sm:text-7xl"
          style={{ perspective: "500px" }}
        >
          {reduced ? t.celebrateText : characters.map((char, index) => (
            <CharacterV1
              key={`${char}-${index}`}
              char={char}
              index={index}
              centerIndex={centerIndex}
              scrollYProgress={scrollYProgress}
              className="text-[var(--blush-deep)]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
