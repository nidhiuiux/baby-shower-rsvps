"use client";

import { useEffect, useRef, useState } from "react";
import { RsvpFields } from "@/components/rsvp-fields";
import BlogCard from "@/components/ui/blog-cards";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/lib/i18n";
import { dietaryCopyKeys, emptyRsvpDraft, guestsForDraft, validateRsvpInput, type RsvpDraft, type ValidationCode } from "@/lib/rsvp-model";

type Status = "idle" | "saving" | "done" | "error";

export function RsvpForm() {
  const { t, lang } = useCopy();
  const [draft, setDraft] = useState<RsvpDraft>(emptyRsvpDraft);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [confirmationSent, setConfirmationSent] = useState(false);
  const thanksRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (status === "done") thanksRef.current?.focus();
  }, [status]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "saving") return;
    setError("");
    const parsed = validateRsvpInput({ ...draft, lang, guestDetails: draft.attending === "yes" ? guestsForDraft(draft) : [] }, true);
    if (parsed.error) { setError(t[parsed.error]); return; }
    setStatus("saving");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.value),
      });
      const data = await res.json() as { error?: string; errorCode?: ValidationCode; confirmationSent?: boolean };
      if (!res.ok) {
        setError(data.errorCode && data.errorCode in t ? t[data.errorCode] : (lang === "en" && data.error) || t.formErrGeneric);
        setStatus("error");
        return;
      }
      setConfirmationSent(data.confirmationSent === true);
      setDraft(parsed.value);
      setStatus("done");
    } catch { setError(t.formErrSend); setStatus("error"); }
  }

  if (status === "done") {
    const firstName = draft.name.split(" ")[0];
    return (
      <div ref={thanksRef} tabIndex={-1} role="status" className="animate-rise rounded-xl bg-secondary p-6 outline-none sm:p-8">
        <p className="section-heading text-center">{draft.attending === "yes" ? t.thanksYes : t.thanksNo}</p>
        <p className="section-copy mt-3 break-words text-center">{draft.attending === "yes" ? t.thanksYesSub(firstName) : t.thanksNoSub(firstName)}</p>
        <p className="mt-4 break-words text-center text-sm leading-relaxed text-muted-foreground">{confirmationSent ? t.thanksEmailSent(draft.email) : t.thanksEmailFailed}</p>
        <div className="mt-6 rounded-xl border border-border bg-white/70 p-5">
          <p className="eyebrow mb-4">{t.recapTitle}</p>
          <BlogCard variant="ledger" title={t.recapName} date={draft.name} />
          <BlogCard variant="ledger" title={t.formEmail} description={<span className="break-all">{draft.email}</span>} />
          <BlogCard variant="ledger" title={t.formPhone} date={draft.phone} />
          <BlogCard variant="ledger" title={t.recapAttending} date={draft.attending === "yes" ? t.formYes : t.formNo} />
          {draft.attending === "yes" && <>
            <BlogCard variant="ledger" title={t.recapGuests} date={String(draft.guests)} />
            {draft.guestDetails.map((guest, index) => <BlogCard key={index} variant="ledger" title={t.formGuestLabel(index + 1)} description={<span className="break-words">{[guest.name, guest.dietary ? t[dietaryCopyKeys[guest.dietary]] : "", guest.dietaryNote].filter(Boolean).join(" · ")}</span>} />)}
          </>}
          {draft.note && <BlogCard variant="ledger" title={t.recapNote} description={<span className="whitespace-pre-wrap break-words">{draft.note}</span>} />}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} aria-busy={status === "saving"}>
      <fieldset disabled={status === "saving"} className="min-w-0 space-y-6">
        <legend className="sr-only">{t.rsvpAria}</legend>
        <RsvpFields value={draft} onChange={setDraft} t={t} />
        {error && <p className="form-error" role="alert">{error}</p>}
        <Button type="submit" disabled={status === "saving"} className="w-full">{status === "saving" ? t.formSending : t.formSend}</Button>
      </fieldset>
    </form>
  );
}
