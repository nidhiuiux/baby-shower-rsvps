"use client";

import { Minus, Plus } from "lucide-react";
import CounterLoading from "@/components/ui/counter-loader";

type GuestStepperProps = {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  fewerLabel: string;
  moreLabel: string;
  /** Spoken after each change, e.g. "3 guests" */
  describe: (value: number) => string;
};

/**
 * Large − / + buttons around the same pixel digits as the opening countdown.
 * Easier than a tiny number field, especially for older guests on phones.
 */
export function GuestStepper({ id, label, value, onChange, min = 1, max = 20, fewerLabel, moreLabel, describe }: GuestStepperProps) {
  const digits = String(value).split("").map(Number);
  const step = (delta: number) => onChange(Math.min(max, Math.max(min, value + delta)));

  return (
    <div className="space-y-3">
      <p id={`${id}-label`} className="text-sm font-semibold leading-relaxed text-foreground">
        {label}
      </p>
      <div role="group" aria-labelledby={`${id}-label`} className="guest-stepper flex items-center gap-4">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={value <= min}
          aria-label={fewerLabel}
          className="guest-stepper-button"
        >
          <Minus className="size-6" strokeWidth={2} aria-hidden />
        </button>
        <output id={id} aria-live="polite" className="guest-stepper-value">
          <span className="flex items-center gap-2" aria-hidden>
            {digits.map((digit, index) => (
              <CounterLoading key={`${index}-${digit}`} value={digit} className="counter-loader-sm" />
            ))}
          </span>
          <span className="sr-only">{describe(value)}</span>
        </output>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={value >= max}
          aria-label={moreLabel}
          className="guest-stepper-button"
        >
          <Plus className="size-6" strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>
  );
}
