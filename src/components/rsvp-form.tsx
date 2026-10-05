"use client";

import { useEffect, useRef, useState } from "react";
import { AttendanceChoice } from "@/components/attendance-choice";
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

  const thanksRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (status === "done") thanksRef.current?.focus();
  }, [status]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "saving") return;
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
      <div ref={thanksRef} tabIndex={-1} role="status" className="animate-rise rounded-xl bg-secondary p-6 text-center outline-none">
        <p className="section-heading">
          {attending === "yes" ? t.thanksYes : t.thanksNo}
        </p>
        <p className="section-copy mt-3 break-words">
          {attending === "yes"
            ? t.thanksYesSub(name.trim().split(" ")[0])
            : t.thanksNoSub(name.trim().split(" ")[0])}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} aria-busy={status === "saving"}>
      <fieldset disabled={status === "saving"} className="min-w-0 space-y-6">
        <legend className="sr-only">{t.rsvpAria}</legend>
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[var(--ink)]">
            {t.formName}
          </Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            maxLength={80}
            placeholder={t.formNamePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <AttendanceChoice
          name="attending"
          legend={t.formAttend}
          value={attending}
          onChange={setAttending}
          yesLabel={t.formYes}
          noLabel={t.formNo}
        />

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
              className="w-32"
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
            maxLength={500}
          />
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={status === "saving"}
          className="w-full"
        >
          {status === "saving" ? t.formSending : t.formSend}
        </Button>
      </fieldset>
    </form>
  );
}
