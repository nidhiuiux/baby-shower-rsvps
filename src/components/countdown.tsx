"use client";

import { useEffect, useState } from "react";
import { VaporCountdown } from "@/components/ui/countdown-vapor-digits";
import { event } from "@/lib/event";
import { useCopy } from "@/lib/i18n";

export function Countdown() {
  const { t } = useCopy();
  const target = new Date(event.startsAt).getTime();
  // The static HTML may have been built before the event. Match it during hydration.
  const [done, setDone] = useState(false);

  useEffect(() => {
    const check = () => setDone(Date.now() >= target);
    check();
    const id = window.setInterval(check, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (done) {
    return (
      <p className="mt-6 text-center font-display text-2xl italic text-[var(--blush-deep)]">
        {t.countdownDone}
      </p>
    );
  }

  return (
    <div
      className="mt-7 flex w-full flex-col items-center"
      role="timer"
      aria-label={t.countdownAria}
    >
      <p className="eyebrow mb-5 text-center">
        {t.countdownLabel}
      </p>
      <VaporCountdown
        targetDate={event.startsAt}
        units="span"
        labels={t.countdownUnits}
        className="font-display max-w-full"
      />
    </div>
  );
}
