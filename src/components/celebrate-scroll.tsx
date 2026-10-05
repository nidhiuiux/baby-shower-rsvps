"use client";

import { useRef } from "react";
import { useScroll } from "framer-motion";
import { CharacterV1 } from "@/components/ui/text-scroll-animation";
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
      aria-label="Celebrate"
      className="relative my-4 flex min-h-[46vh] items-center justify-center sm:min-h-[38vh]"
    >
      <div className="text-center">
        <p className="mb-4 text-[0.68rem] font-semibold tracking-[0.28em] text-[var(--leaf-deep)] uppercase">
          {t.celebrateHint}
        </p>
        <div
          className="font-display text-5xl tracking-tight text-[var(--ink)] uppercase sm:text-7xl"
          style={{ perspective: "500px" }}
        >
          {characters.map((char, index) => (
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
