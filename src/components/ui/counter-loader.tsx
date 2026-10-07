import { cn } from "@/lib/utils";

const DIGITS = [
  "111101101101111",
  "010110010010111",
  "111001111100111",
  "111001111001111",
  "101101111001001",
  "111100111001111",
  "111100111101111",
  "111001001001001",
  "111101111101111",
  "111101111001111",
] as const;

type CounterLoadingProps = {
  value?: number;
  className?: string;
};

/** The supplied 3 × 5 pixel counter, driven by the invitation's real deadline. */
export default function CounterLoading({ value = 5, className }: CounterLoadingProps) {
  const digit = Number.isFinite(value) ? Math.min(9, Math.max(0, Math.ceil(value))) : 5;

  return (
    <span aria-hidden="true" className={cn("counter-loader", className)} data-counter={digit}>
      {Array.from(DIGITS[digit], (pixel, index) => (
        <span key={index} className="counter-pixel" data-lit={pixel === "1"} />
      ))}
    </span>
  );
}
