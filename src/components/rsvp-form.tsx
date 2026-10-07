"use client";

import { useEffect, useRef, useState } from "react";
import { AttendanceChoice } from "@/components/attendance-choice";
import { GuestStepper } from "@/components/guest-stepper";
import BlogCard from "@/components/ui/blog-cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCopy } from "@/lib/i18n";
import type { Attendance } from "@/lib/rsvps";

type Status = "idle" | "saving" | "done" | "error";

export function RsvpForm() {
  const { t, lang } = useCopy();
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<Attendance | "">("");
  const [guests, setGuests] = useState(1);
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

    const guestCount = attending === "yes" ? guests : 0;

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
    const firstName = name.trim().split(" ")[0];
    return (
      <div ref={thanksRef} tabIndex={-1} role="status" className="animate-rise rounded-xl bg-secondary p-6 outline-none sm:p-8">
        <p className="section-heading text-center">
          {attending === "yes" ? t.thanksYes : t.thanksNo}
        </p>
        <p className="section-copy mt-3 break-words text-center">
          {attending === "yes" ? t.thanksYesSub(firstName) : t.thanksNoSub(firstName)}
        </p>
        {/* A printed-card style recap so guests can see exactly what was sent. */}
        <div className="mt-6 rounded-xl border border-border bg-white/70 p-5">
          <p className="eyebrow mb-4">{t.recapTitle}</p>
          <BlogCard variant="ledger" title={t.recapName} date={name.trim()} />
          <BlogCard variant="ledger" title={t.recapAttending} date={attending === "yes" ? t.formYes : t.formNo} />
          {attending === "yes" && <BlogCard variant="ledger" title={t.recapGuests} date={String(guests)} />}
          {note.trim() && <BlogCard variant="ledger" title={t.recapNote} description={<span className="whitespace-pre-wrap break-words">{note.trim()}</span>} />}
        </div>
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
          <div className="animate-fade">
            <GuestStepper
              id="guests"
              label={t.formGuests}
              value={guests}
              onChange={setGuests}
              fewerLabel={t.guestsFewer}
              moreLabel={t.guestsMore}
              describe={t.guestsCount}
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
