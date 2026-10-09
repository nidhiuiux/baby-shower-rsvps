"use client";

import { useEffect, useRef, useState } from "react";
import { RsvpFields } from "@/components/rsvp-fields";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { copy } from "@/lib/copy";
import { emptyRsvpDraft, guestsForDraft, validateRsvpInput, type Rsvp, type RsvpDraft } from "@/lib/rsvp-model";

const labels = { ...copy.en, formName: "Guest name", formAttend: "Will they attend?", formGuests: "Number of guests (including them)", formYou: "Primary guest" };

export function HostRsvpEditor({ pin, existing, onSaved, onCancel, disabled, onSavingChange }: {
  pin: string; existing?: Rsvp; onSaved: (rsvp: Rsvp, message: string) => void; onCancel?: () => void;
  disabled?: boolean; onSavingChange: (saving: boolean) => void;
}) {
  const [draft, setDraft] = useState<RsvpDraft>(() => existing ? { ...existing, guests: existing.guests || 1 } : { ...emptyRsvpDraft(), attending: "yes" });
  const [sendConfirmation, setSendConfirmation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (existing) titleRef.current?.focus(); }, [existing]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving || disabled) return;
    setError("");
    const parsed = validateRsvpInput({ ...draft, guestDetails: draft.attending === "yes" ? guestsForDraft(draft) : [] }, false);
    if (parsed.error) { setError(copy.en[parsed.error]); return; }
    if (sendConfirmation && !parsed.value.email) { setError("Add an email address before sending a confirmation."); return; }
    setSaving(true);
    onSavingChange(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: existing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", "x-host-pin": pin },
        body: JSON.stringify({ ...parsed.value, ...(existing ? { id: existing.id, updatedAt: existing.updatedAt } : {}), sendConfirmation }),
      });
      const data = await res.json() as { error?: string; rsvp?: Rsvp; confirmationSent?: boolean };
      if (!res.ok || !data.rsvp) { setError(data.error || "Could not save RSVP."); return; }
      const delivery = sendConfirmation ? (data.confirmationSent ? " Confirmation email sent." : " Saved, but the guest email could not be sent.") : "";
      onSaved(data.rsvp, `${existing ? "Updated" : "Added"} ${data.rsvp.name}.${delivery}`);
      if (!existing) { setDraft({ ...emptyRsvpDraft(), attending: "yes" }); setSendConfirmation(false); }
    } catch { setError("Could not save RSVP. Please try again."); }
    finally { setSaving(false); onSavingChange(false); }
  }

  return (
    <form onSubmit={submit} aria-busy={saving} className={existing ? "w-full rounded-2xl border border-border bg-white/60 p-4 sm:p-6" : "surface-card panel-padding"}>
      <h2 ref={titleRef} tabIndex={existing ? -1 : undefined} className="section-heading outline-none">{existing ? `Edit ${existing.name}` : "Add RSVP manually"}</h2>
      <p className="section-copy mb-6 mt-2">{existing ? "Fill in or correct any details below. The original reply stays on the same guest record." : "Use this when someone replies by text, call, or in person."} Contact and dietary details can be completed later.</p>
      <fieldset disabled={saving || disabled} className="min-w-0 space-y-6">
        <legend className="sr-only">Guest details</legend>
        <RsvpFields value={draft} onChange={setDraft} t={labels} prefix={existing ? `edit-${existing.id}` : "manual"} requireDetails={false} />
        <div className="space-y-2">
          <Label htmlFor={existing ? `language-${existing.id}` : "manual-language"}>Confirmation email language</Label>
          <select id={existing ? `language-${existing.id}` : "manual-language"} className="h-12 w-full rounded-xl border border-input bg-white/80 px-3 text-base" value={draft.lang} onChange={e => setDraft({ ...draft, lang: e.target.value === "gu" ? "gu" : "en" })}>
            <option value="en">English</option><option value="gu">ગુજરાતી</option>
          </select>
        </div>
        <label className="flex min-h-11 items-start gap-3 text-sm leading-relaxed">
          <input type="checkbox" checked={sendConfirmation} onChange={e => setSendConfirmation(e.target.checked)} className="mt-1 size-5 shrink-0 accent-primary" />
          <span>Send a confirmation email to this guest when I save.<span className="mt-1 block text-muted-foreground">Leave unchecked when filling in details for an earlier RSVP.</span></span>
        </label>
        {error && <p role="alert" className="form-error">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={saving} className="flex-1">{saving ? "Saving…" : existing ? "Save changes" : "Add person"}</Button>
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        </div>
      </fieldset>
    </form>
  );
}
