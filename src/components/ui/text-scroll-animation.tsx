"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import ReactLenis from "lenis/react";
import React, { useRef } from "react";
import { cn } from "@/lib/utils";

type CharacterProps = {
  char: string;
  index: number;
  centerIndex: number;
  scrollYProgress: MotionValue<number>;
  className?: string;
};

const CharacterV1 = ({ char, index, centerIndex, scrollYProgress, className }: CharacterProps) => {
  const isSpace = char === " ";
  const distanceFromCenter = index - centerIndex;
  const x = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 50, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 50, 0]);
  return (
    <motion.span className={cn("inline-block", className ?? "text-orange-500", isSpace && "w-4")} style={{ x, rotateX }}>
      {char}
    </motion.span>
  );
};

const CharacterV2 = ({ char, index, centerIndex, scrollYProgress }: CharacterProps) => {
  const distanceFromCenter = index - centerIndex;
  const x = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 50, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.75, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [Math.abs(distanceFromCenter) * 50, 0]);
  return <motion.img src={char} alt="" className="h-16 w-16 shrink-0 object-contain will-change-transform" style={{ x, scale, y, transformOrigin: "center" }} />;
};

const CharacterV3 = ({ char, index, centerIndex, scrollYProgress }: CharacterProps) => {
  const distanceFromCenter = index - centerIndex;
  const x = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 90, 0]);
  const rotate = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 50, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [-Math.abs(distanceFromCenter) * 20, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.75, 1]);
  return <motion.img src={char} alt="" className="h-16 w-16 shrink-0 object-contain will-change-transform" style={{ x, rotate, y, scale, transformOrigin: "center" }} />;
};

const icons = ["/doodles/star.svg", "/doodles/moon.svg", "/doodles/bear.svg", "/doodles/star.svg", "/doodles/moon.svg", "/doodles/bear.svg"];

const Skiper31 = () => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const targetRef2 = useRef<HTMLDivElement | null>(null);
  const targetRef3 = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const { scrollYProgress: scrollYProgress2 } = useScroll({ target: targetRef2 });
  const { scrollYProgress: scrollYProgress3 } = useScroll({ target: targetRef3 });
  const text = "celebrate ";
  const characters = text.split("");
  const centerIndex = Math.floor(characters.length / 2);
  const iconCenterIndex = Math.floor(icons.length / 2);
  return (
    <ReactLenis root>
      <main className="w-full bg-[var(--mist)]">
        <div ref={targetRef} className="relative box-border flex h-[210vh] items-center justify-center overflow-hidden bg-[#f3f6f2] p-[2vw]">
          <div className="w-full max-w-4xl text-center font-display text-6xl font-bold tracking-tighter text-[var(--ink)] uppercase" style={{ perspective: "500px" }}>
            {characters.map((char, index) => (
              <CharacterV1 key={index} char={char} index={index} centerIndex={centerIndex} scrollYProgress={scrollYProgress} className="text-[var(--blush-deep)]" />
            ))}
          </div>
        </div>
        <div ref={targetRef2} className="relative -mt-[100vh] box-border flex h-[210vh] items-center justify-center overflow-hidden bg-[#f3f6f2]" />
        <div ref={targetRef3} className="relative -mt-[95vh] box-border flex h-[210vh] items-center justify-center overflow-hidden bg-[#f3f6f2]" />
      </main>
    </ReactLenis>
  );
};

export { CharacterV1, CharacterV2, CharacterV3, Skiper31 };

const Bracket = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 27 78" className={className}>
    <path fill="currentColor" d="M26.52 77.21h-5.75c-6.83 0-12.38-5.56-12.38-12.38V48.38C8.39 43.76 4.63 40 .01 40v-4c4.62 0 8.38-3.76 8.38-8.38V12.4C8.38 5.56 13.94 0 20.77 0h5.75v4h-5.75c-4.62 0-8.38 3.76-8.38 8.38V27.6c0 4.34-2.25 8.17-5.64 10.38 3.39 2.21 5.64 6.04 5.64 10.38v16.45c0 4.62 3.76 8.38 8.38 8.38h5.75v4.02Z" />
  </svg>
);
