"use client";

import { useRef } from "react";
import { useScroll } from "framer-motion";
import { CharacterV1 } from "@/components/ui/text-scroll-animation";

const text = "WITH LOVE";

export function CelebrateScroll() {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 0.85", "start 0.25"],
  });
  const characters = text.split("");
  const centerIndex = Math.floor(characters.length / 2);

  return (
    <section
      ref={targetRef}
      aria-label="Celebrate"
      className="relative my-4 flex min-h-[46vh] items-center justify-center sm:min-h-[38vh]"
    >
      <div className="text-center">
        <p className="mb-4 text-[0.68rem] font-semibold tracking-[0.28em] text-[var(--leaf-deep)] uppercase">
          Scroll and the letters gather
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
