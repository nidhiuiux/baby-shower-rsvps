"use client";

import { useEffect, useState } from "react";
import { VaporCountdown } from "@/components/ui/countdown-vapor-digits";
import { event } from "@/lib/event";

export function Countdown() {
  const target = new Date(event.startsAt).getTime();
  const [done, setDone] = useState(() => Date.now() >= target);

  useEffect(() => {
    const check = () => setDone(Date.now() >= target);
    check();
    const id = window.setInterval(check, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (done) {
    return (
      <p className="mt-6 text-center font-display text-2xl italic text-[var(--blush-deep)]">
        The shower is here
      </p>
    );
  }

  return (
    <div
      className="mt-7 flex w-full flex-col items-center"
      role="timer"
      aria-label="Time until the baby shower"
    >
      <p className="mb-4 text-center text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--leaf-deep)]">
        Until we celebrate
      </p>
      <VaporCountdown
        targetDate={event.startsAt}
        units="span"
        className="font-display max-w-full"
      />
    </div>
  );
}
