"use client";

import { AttendanceChoice } from "@/components/attendance-choice";
import { GuestStepper } from "@/components/guest-stepper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Copy } from "@/lib/copy";
import { dietaryCopyKeys, dietaryOptions, guestsForDraft, type DietaryPreference, type RsvpDraft } from "@/lib/rsvp-model";

export function RsvpFields({ value, onChange, t, prefix = "rsvp", requireDetails = true }: {
  value: RsvpDraft; onChange: (value: RsvpDraft) => void; t: Copy; prefix?: string; requireDetails?: boolean;
}) {
  const details = guestsForDraft(value);
  const set = (patch: Partial<RsvpDraft>) => onChange({ ...value, ...patch });
  const updateGuest = (index: number, patch: Partial<(typeof details)[number]>) => {
    // Keep temporarily hidden guests when the count is lowered or attendance is toggled.
    const next = [...value.guestDetails];
    next[index] = { ...details[index], ...patch };
    set({ guestDetails: next });
  };
  const optional = !requireDetails ? ` ${t.formOptional}` : "";
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-name`}>{t.formName}</Label>
        <Input id={`${prefix}-name`} name="name" autoComplete="name" maxLength={80} placeholder={t.formNamePlaceholder} value={value.name} onChange={e => set({ name: e.target.value })} required />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-email`}>{t.formEmail}{optional}</Label>
          <Input id={`${prefix}-email`} name="email" type="email" autoComplete="email" maxLength={254} value={value.email} onChange={e => set({ email: e.target.value })} required={requireDetails} aria-describedby={requireDetails ? `${prefix}-email-help` : undefined} />
          {requireDetails && <p id={`${prefix}-email-help`} className="text-sm text-muted-foreground">{t.formEmailHelp}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-phone`}>{t.formPhone}{optional}</Label>
          <Input id={`${prefix}-phone`} name="phone" type="tel" autoComplete="tel" maxLength={40} value={value.phone} onChange={e => set({ phone: e.target.value })} required={requireDetails} />
        </div>
      </div>
      <AttendanceChoice name={`${prefix}-attending`} legend={t.formAttend} value={value.attending} onChange={attending => set({ attending })} yesLabel={t.formYes} noLabel={t.formNo} />
      {value.attending === "yes" && (
        <div className="space-y-5">
          <GuestStepper id={`${prefix}-guests`} label={t.formGuests} value={value.guests} onChange={guests => set({ guests })} fewerLabel={t.guestsFewer} moreLabel={t.guestsMore} describe={t.guestsCount} />
          <p className="text-sm leading-relaxed text-muted-foreground">{t.formDetailsHint}</p>
          {details.map((guest, index) => (
            <fieldset key={index} className="min-w-0 space-y-4 rounded-2xl border border-border bg-secondary/40 p-4 sm:p-5">
              <legend className="px-2 text-sm font-semibold text-primary">{t.formGuestLabel(index + 1)}{index === 0 ? ` · ${t.formYou}` : ""}</legend>
              <div className="space-y-2">
                <Label htmlFor={`${prefix}-guest-${index}-name`}>{t.formGuestName}{index > 0 ? optional : ""}</Label>
                <Input id={`${prefix}-guest-${index}-name`} maxLength={80} value={guest.name} readOnly={index === 0} autoComplete="off" onChange={e => updateGuest(index, { name: e.target.value })} required={requireDetails} className={index === 0 ? "bg-white/40 text-muted-foreground" : undefined} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${prefix}-guest-${index}-dietary`}>{t.formDietary}{optional}</Label>
                <select id={`${prefix}-guest-${index}-dietary`} value={guest.dietary} onChange={e => updateGuest(index, { dietary: e.target.value as DietaryPreference })} required={requireDetails} className="h-12 w-full min-w-0 rounded-xl border border-input bg-white/80 px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50">
                  <option value="">{t.formDietaryChoose}</option>
                  {dietaryOptions.map(option => <option key={option} value={option}>{t[dietaryCopyKeys[option]]}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${prefix}-guest-${index}-dietary-note`}>{t.formDietaryNote}{!(requireDetails && guest.dietary === "other") ? ` ${t.formOptional}` : ""}</Label>
                <Input id={`${prefix}-guest-${index}-dietary-note`} maxLength={200} placeholder={t.formDietaryNotePlaceholder} value={guest.dietaryNote} onChange={e => updateGuest(index, { dietaryNote: e.target.value })} required={requireDetails && guest.dietary === "other"} />
              </div>
            </fieldset>
          ))}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-note`}>{t.formNote} <span className="font-normal text-muted-foreground">{t.formOptional}</span></Label>
        <Textarea id={`${prefix}-note`} name="note" rows={3} maxLength={500} placeholder={t.formNotePlaceholder} value={value.note} onChange={e => set({ note: e.target.value })} />
      </div>
    </>
  );
}
