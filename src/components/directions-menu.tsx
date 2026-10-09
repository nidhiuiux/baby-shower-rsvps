"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ExternalLink, Navigation } from "lucide-react";
import { directions } from "@/lib/calendar";
import { useCopy } from "@/lib/i18n";

const apps = [
  { name: "Google Maps", href: directions.google },
  // Opens the Apple Maps app on iPhone, iPad and Mac, and Apple's web map elsewhere
  { name: "Apple Maps", href: directions.apple },
] as const;

/** "Get directions" with a choice of map app, opened inline so the card never clips it */
export function DirectionsMenu() {
  const { t } = useCopy();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="mt-3">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className="invite-chip"
      >
        <Navigation aria-hidden />
        {t.getDirections}
      </button>
      {open && (
        <ul id={listId} aria-label={t.openWith} className="mt-2 flex flex-col gap-2 sm:max-w-[16rem]">
          {apps.map((app) => (
            <li key={app.name}>
              <a
                href={app.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="invite-chip w-full justify-between"
              >
                <span>{app.name}</span>
                <ExternalLink aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
