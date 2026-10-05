"use client";

import { useEffect } from "react";
import { setLang, useCopy } from "@/lib/i18n";
import type { Lang } from "@/lib/copy";

const options: { value: Lang; label: string; lang: string }[] = [
  { value: "en", label: "English", lang: "en" },
  { value: "gu", label: "ગુજરાતી", lang: "gu" },
];

/** Small English / Gujarati toggle shown on the gate and at the top of the page */
export function LanguageSwitch({ className = "" }: { className?: string }) {
  const { lang, t } = useCopy();

  return (
    <div
      role="group"
      aria-label={`${t.languageLabel} / Language`}
      className={`inline-flex rounded-full border border-white/80 bg-white/65 p-1 shadow-[0_8px_20px_-16px_rgba(47,61,52,0.45)] backdrop-blur-md ${className}`}
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
            className={`h-8 rounded-full px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--leaf)]/50 ${
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
