"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCopy } from "@/lib/i18n";
import type { Attendance } from "@/lib/rsvps";

type Status = "idle" | "saving" | "done" | "error";

function parseGuestCount(raw: string): number {
  const n = Number(raw);
  if (!raw.trim() || !Number.isFinite(n)) return 1;
  return Math.min(20, Math.max(1, Math.round(n)));
}

export function RsvpForm() {
  const { t, lang } = useCopy();
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<Attendance | "">("");
  const [guests, setGuests] = useState("1");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError(t.formErrName);
      return;
    }
    if (!attending) {
      setError(t.formErrChoice);
      return;
    }

    const guestCount = attending === "yes" ? parseGuestCount(guests) : 0;
    if (attending === "yes") {
      setGuests(String(guestCount));
    }

    setStatus("saving");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          attending,
          guests: guestCount,
          note: note.trim(),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError((lang === "en" && data.error) || t.formErrGeneric);
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setError(t.formErrSend);
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="thanks animate-rise text-center">
        <p className="font-display text-3xl text-[var(--ink)] sm:text-4xl">
          {attending === "yes" ? t.thanksYes : t.thanksNo}
        </p>
        <p className="mt-3 text-base text-[var(--ink-soft)] sm:text-lg">
          {attending === "yes"
            ? t.thanksYesSub(name.trim().split(" ")[0])
            : t.thanksNoSub(name.trim().split(" ")[0])}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rsvp-form animate-rise-delay space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-[var(--ink)]">
          {t.formName}
        </Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          placeholder={t.formNamePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 border-[var(--line)] bg-white/70 text-base text-[var(--ink)] placeholder:text-[var(--ink-muted)]"
          required
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-[var(--ink)]">
          {t.formAttend}
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "yes", label: t.formYes },
              { value: "no", label: t.formNo },
            ] as const
          ).map((option) => {
            const selected = attending === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setAttending(option.value)}
                className={`choice-btn h-12 rounded-xl border px-3 text-sm font-medium transition-all duration-200 sm:text-base ${
                  selected
                    ? "border-[var(--leaf)] bg-[var(--leaf-soft)] text-[var(--ink)] shadow-sm"
                    : "border-[var(--line)] bg-white/60 text-[var(--ink-soft)] hover:border-[var(--leaf)]/50"
                }`}
                aria-pressed={selected}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {attending === "yes" && (
        <div className="space-y-2 animate-fade">
          <Label htmlFor="guests" className="text-[var(--ink)]">
            {t.formGuests}
          </Label>
          <Input
            id="guests"
            name="guests"
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            value={guests}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || /^\d{0,2}$/.test(v)) {
                setGuests(v);
              }
            }}
            onBlur={() => setGuests(String(parseGuestCount(guests)))}
            className="h-12 w-32 border-[var(--line)] bg-white/70 text-base text-[var(--ink)]"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="note" className="text-[var(--ink)]">
          {t.formNote} <span className="font-normal text-[var(--ink-muted)]">{t.formOptional}</span>
        </Label>
        <Textarea
          id="note"
          name="note"
          placeholder={t.formNotePlaceholder}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="resize-none border-[var(--line)] bg-white/70 text-base text-[var(--ink)] placeholder:text-[var(--ink-muted)]"
        />
      </div>

      {error && (
        <p className="text-sm text-[var(--blush-deep)]" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={status === "saving"}
        className="h-12 w-full rounded-xl bg-[var(--leaf)] text-base font-semibold text-white hover:bg-[var(--leaf-deep)]"
      >
        {status === "saving" ? t.formSending : t.formSend}
      </Button>
    </form>
  );
}
