"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
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
    <motion.span className={cn("inline-block", className ?? "text-[var(--blush-deep)]", isSpace && "w-4")} style={{ x, rotateX }}>
      {char}
    </motion.span>
  );
};

export { CharacterV1 };
