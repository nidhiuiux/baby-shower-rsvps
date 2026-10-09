"use client";

import { useState } from "react";
import { HostRsvpEditor } from "@/components/host-rsvp-editor";
import BlogCard from "@/components/ui/blog-cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { copy } from "@/lib/copy";
import { dietaryCopyKeys, type Rsvp } from "@/lib/rsvp-model";

type EmailStatus = { notifyEmail: string; configured: boolean };

export function HostDashboard() {
  const [pin, setPin] = useState("");
  const [rsvps, setRsvps] = useState<Rsvp[] | null>(null);
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const yes = rsvps?.filter(r => r.attending === "yes") ?? [];
  const summary = rsvps ? { total: rsvps.length, yes: yes.length, no: rsvps.length - yes.length, headcount: yes.reduce((sum, r) => sum + r.guests, 0) } : null;

  async function loadResponses(e?: React.FormEvent) {
    e?.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/rsvp", { headers: { "x-host-pin": pin }, cache: "no-store" });
      const data = await res.json() as { error?: string; rsvps?: Rsvp[]; email?: EmailStatus };
      if (!res.ok) { setError(data.error || "Could not load responses."); return; }
      setRsvps(data.rsvps ?? []); setEmailStatus(data.email ?? null); setEditingId(null);
    } catch { setError("Could not load responses. Please try again."); }
    finally { setLoading(false); }
  }

  function saved(rsvp: Rsvp, message: string) {
    setRsvps(current => [rsvp, ...(current ?? []).filter(row => row.id !== rsvp.id)]);
    setEditingId(null); setError(""); setAnnouncement(message);
  }

  async function removeRsvp(id: string) {
    const index = rsvps?.findIndex(r => r.id === id) ?? -1;
    const removed = index >= 0 ? rsvps?.[index] : undefined;
    if (!removed) return;
    setError("");
    setRsvps(current => current?.filter(r => r.id !== id) ?? null);
    setAnnouncement(`Removed ${removed.name}.`);
    const restore = (message: string) => {
      setRsvps(current => {
        if (!current || current.some(r => r.id === id)) return current;
        const next = current.slice(); next.splice(Math.min(index, next.length), 0, removed); return next;
      });
      setAnnouncement(""); setError(message);
    };
    try {
      const res = await fetch("/api/rsvp", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, pin }) });
      const data = await res.json() as { error?: string };
      if (!res.ok) restore(data.error || `Could not remove ${removed.name}.`);
    } catch { restore(`Could not remove ${removed.name}. Please try again.`); }
  }

  if (!rsvps) {
    return (
      <form onSubmit={loadResponses} aria-busy={loading} className="surface-card panel-padding mx-auto w-full max-w-md space-y-6">
        <div className="space-y-2">
          <Label htmlFor="pin">Enter host PIN</Label>
          <Input id="pin" type="password" autoComplete="current-password" value={pin} onChange={e => setPin(e.target.value)} placeholder="PIN" disabled={loading} required />
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">{loading ? "Checking…" : "Open host access"}</Button>
      </form>
    );
  }

  return (
    <div className="content-width space-y-8">
      <p role="status" className={announcement ? "status-note" : "sr-only"}>{announcement}</p>
      {emailStatus && <div className="status-note">{emailStatus.configured ? <p>Email notifications configured for <strong>{emailStatus.notifyEmail}</strong></p> : <p>Email delivery is not configured. Replies saved locally can still be edited here.</p>}</div>}
      {summary && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {[{ label: "Responses", value: summary.total }, { label: "Coming", value: summary.yes }, { label: "Can't make it", value: summary.no }, { label: "Guest total", value: summary.headcount }].map(item => <div key={item.label} className="surface-card px-4 py-5 text-center"><p className="font-display text-3xl text-[var(--ink)]">{item.value}</p><p className="mt-1 text-sm text-[var(--ink-soft)]">{item.label}</p></div>)}
      </div>}
      <HostRsvpEditor pin={pin} onSaved={saved} disabled={saving} onSavingChange={setSaving} />
      <div className="flex items-center justify-between gap-4">
        <h2 className="section-heading">Guest list</h2>
        <Button type="button" variant="outline" disabled={loading || saving || editingId !== null} onClick={() => void loadResponses()}>{loading ? "Refreshing…" : "Refresh list"}</Button>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {rsvps.length === 0 ? <p className="surface-card panel-padding section-copy text-center">No RSVPs yet. Add people manually above, or share your RSVP link.</p> : (
        <ul className="surface-card panel-padding divide-y divide-border">
          {rsvps.map(rsvp => <li key={rsvp.id} className="py-6 first:pt-0 last:pb-0">
            {editingId === rsvp.id ? <HostRsvpEditor pin={pin} existing={rsvp} onSaved={saved} onCancel={() => setEditingId(null)} disabled={saving} onSavingChange={setSaving} /> : <>
              <BlogCard variant="ledger" strongTitle className="py-0!" title={rsvp.name} date={rsvp.attending === "yes" ? `Coming · ${rsvp.guests} guest${rsvp.guests === 1 ? "" : "s"}` : "Can't make it"} />
              <dl className="mt-4 grid gap-2 text-sm leading-relaxed sm:grid-cols-[7rem_1fr]">
                <dt className="text-muted-foreground">Email</dt><dd className="break-all">{rsvp.email || "Not provided"}</dd>
                <dt className="text-muted-foreground">Phone</dt><dd>{rsvp.phone || "Not provided"}</dd>
                <dt className="text-muted-foreground">Email language</dt><dd>{rsvp.lang === "gu" ? "Gujarati" : "English"}</dd>
              </dl>
              {rsvp.attending === "yes" && <ol className="mt-4 space-y-2 rounded-xl bg-secondary/50 p-4 text-sm leading-relaxed">
                {rsvp.guestDetails.map((guest, i) => <li key={i} className="break-words"><span className="font-semibold">{guest.name || `Guest ${i + 1} · name to add`}</span> · {guest.dietary ? copy.en[dietaryCopyKeys[guest.dietary]] : "Dietary preference to add"}{guest.dietaryNote ? ` · ${guest.dietaryNote}` : ""}</li>)}
              </ol>}
              {rsvp.note && <p className="mt-4 whitespace-pre-wrap break-words text-sm text-muted-foreground">{rsvp.note}</p>}
              <div className="mt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" aria-label={`Edit RSVP for ${rsvp.name}`} disabled={saving || editingId !== null} onClick={() => { setEditingId(rsvp.id); setAnnouncement(""); }}>Edit details</Button>
                <Button type="button" variant="outline" size="sm" disabled={saving} aria-label={`Remove RSVP for ${rsvp.name}`} onClick={() => void removeRsvp(rsvp.id)}>Remove</Button>
              </div>
            </>}
          </li>)}
        </ul>
      )}
      <div className="text-center"><Button type="button" variant="outline" disabled={saving} onClick={() => { setRsvps(null); setError(""); setEditingId(null); setAnnouncement(""); setEmailStatus(null); setPin(""); }}>Lock host access</Button></div>
    </div>
  );
}
