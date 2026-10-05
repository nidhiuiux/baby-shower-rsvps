"use client";

import { Languages } from "lucide-react";
import { useEffect } from "react";
import { setLang, useCopy } from "@/lib/i18n";
import type { Lang } from "@/lib/copy";

const options: { value: Lang; label: string; lang: string }[] = [
  { value: "en", label: "English", lang: "en" },
  { value: "gu", label: "ગુજરાતી", lang: "gu" },
];

/** Shown in both languages on purpose: a guest must be able to read it before choosing */
const PROMPT = "ભાષા પસંદ કરો · Select language";

/** English / Gujarati toggle with a visible prompt, shown on the gate and at the top of the page */
export function LanguageSwitch({ className = "" }: { className?: string }) {
  const { lang } = useCopy();

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <p className="flex items-center gap-1.5 text-sm font-semibold text-[var(--leaf-deep)]">
        <Languages className="size-4" aria-hidden />
        <span>{PROMPT}</span>
      </p>
      <div
        role="group"
        aria-label={PROMPT}
        className="inline-flex rounded-full border border-[var(--leaf)]/30 bg-white/80 p-1 shadow-[0_10px_24px_-16px_rgba(47,61,52,0.55)] backdrop-blur-md"
      >
        {options.map((option) => {
          const selected = lang === option.value;
          return (
            <button
              key={option.value}
              type="button"
              lang={option.lang}
              aria-pressed={selected}
              onClick={() => setLang(option.value)}
              className={`h-10 min-w-[7rem] rounded-full px-5 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--leaf)]/50 ${
                selected
                  ? "bg-[var(--leaf)] text-white shadow-sm"
                  : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Keeps <html lang> in step with the chosen language for screen readers and browsers */
export function HtmlLangSync() {
  const { t } = useCopy();
  useEffect(() => {
    document.documentElement.lang = t.htmlLang;
  }, [t.htmlLang]);
  return null;
}
