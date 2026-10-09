"use client";

import { useState } from "react";
import { HostRsvpEditor } from "@/components/host-rsvp-editor";
import BlogCard from "@/components/ui/blog-cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { copy } from "@/lib/copy";
import { dietaryCopyKeys, dietaryOptions, type Rsvp } from "@/lib/rsvp-model";

type EmailStatus = { notifyEmail: string; configured: boolean; guestConfirmations?: boolean };

const csvCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

/** One row per person, so the caterer and seating plan can be done straight from a spreadsheet. */
function guestListCsv(rows: Rsvp[]) {
  const header = ["Party", "Primary guest", "Email", "Phone", "Attending", "Party size", "Guest #", "Guest name", "Food preference", "Food details / allergies", "Message", "Email language", "Received", "Last updated"];
  const lines = [header];
  rows.forEach((r, partyIndex) => {
    const base = [partyIndex + 1, r.name, r.email, r.phone, r.attending === "yes" ? "Yes" : "No", r.guests];
    const tail = [r.note, r.lang === "gu" ? "Gujarati" : "English", r.createdAt, r.updatedAt];
    if (r.attending === "yes" && r.guestDetails.length) {
      r.guestDetails.forEach((g, i) => lines.push([...base, i + 1, g.name, g.dietary ? copy.en[dietaryCopyKeys[g.dietary]] : "", g.dietaryNote, ...tail] as string[]));
    } else {
      lines.push([...base, "", "", "", "", ...tail] as string[]);
    }
  });
  return "\uFEFF" + lines.map((line) => line.map(csvCell).join(",")).join("\r\n");
}

function downloadCsv(rows: Rsvp[]) {
  const blob = new Blob([guestListCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nidhi-hardik-rsvps-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Replies that share an email or phone number, which usually means someone answered twice. */
function findDuplicates(rows: Rsvp[]) {
  const byKey = new Map<string, Rsvp[]>();
  for (const r of rows) {
    const keys = [r.email.trim().toLowerCase(), r.phone.replace(/\D/g, "").slice(-10)].filter((k) => k.length >= 5);
    for (const key of new Set(keys)) byKey.set(key, [...(byKey.get(key) ?? []), r]);
  }
  const dupes = new Map<string, string[]>();
  for (const group of byKey.values()) {
    if (group.length < 2) continue;
    for (const r of group) dupes.set(r.id, [...new Set([...(dupes.get(r.id) ?? []), ...group.filter((o) => o.id !== r.id).map((o) => o.name)])]);
  }
  return dupes;
}

export function HostDashboard() {
  const [pin, setPin] = useState("");
  const [rsvps, setRsvps] = useState<Rsvp[] | null>(null);
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  // Removing is permanent, so it takes a second, explicit "Yes, remove".
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const yes = rsvps?.filter(r => r.attending === "yes") ?? [];
  const summary = rsvps ? { total: rsvps.length, yes: yes.length, no: rsvps.length - yes.length, headcount: yes.reduce((sum, r) => sum + r.guests, 0) } : null;
  const people = yes.flatMap((r) => r.guestDetails.map((g, i) => ({ ...g, name: g.name || `${r.name} · guest ${i + 1}` })));
  const food = [...dietaryOptions.map((key) => ({ label: copy.en[dietaryCopyKeys[key]], count: people.filter((p) => p.dietary === key).length })), { label: "Not chosen yet", count: people.filter((p) => !p.dietary).length }].filter((row) => row.count > 0);
  const foodNotes = people.filter((p) => p.dietaryNote);
  const duplicates = rsvps ? findDuplicates(rsvps) : new Map<string, string[]>();

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
      {emailStatus && <div className="status-note space-y-1">{emailStatus.configured ? <p>Email notifications go to <strong>{emailStatus.notifyEmail}</strong>.</p> : <p>Email delivery is not configured. Replies saved locally can still be edited here.</p>}{emailStatus.configured && !emailStatus.guestConfirmations && <p>Guest confirmation emails are off. To turn them on, add <code>GMAIL_USER</code> and <code>GMAIL_APP_PASSWORD</code> (a Gmail app password) in Vercel, then redeploy.</p>}</div>}
      {summary && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {[{ label: "Responses", value: summary.total }, { label: "Coming", value: summary.yes }, { label: "Can't make it", value: summary.no }, { label: "Guest total", value: summary.headcount }].map(item => <div key={item.label} className="surface-card px-4 py-5 text-center"><p className="font-display text-3xl text-[var(--ink)]">{item.value}</p><p className="mt-1 text-sm text-[var(--ink-soft)]">{item.label}</p></div>)}
      </div>}
      {people.length > 0 && (
        <section aria-labelledby="food-heading" className="surface-card panel-padding">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="food-heading" className="section-heading">Food planning</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => downloadCsv(rsvps)}>Download guest list (CSV)</Button>
          </div>
          {food.map((row) => <BlogCard key={row.label} variant="ledger" title={row.label} date={String(row.count)} />)}
          {foodNotes.length > 0 && (
            <div className="mt-5 rounded-xl bg-[var(--blush)]/40 p-4">
              <p className="text-sm font-semibold text-[var(--blush-deep)]">Food details & allergies</p>
              <ul className="mt-2 space-y-1 text-sm leading-relaxed">
                {foodNotes.map((p, i) => <li key={i} className="break-words"><span className="font-semibold">{p.name}</span>: {p.dietaryNote}</li>)}
              </ul>
            </div>
          )}
        </section>
      )}
      <HostRsvpEditor pin={pin} onSaved={saved} disabled={saving} onSavingChange={setSaving} confirmationsEnabled={emailStatus?.guestConfirmations ?? false} />
      <div className="flex items-center justify-between gap-4">
        <h2 className="section-heading">Guest list</h2>
        <Button type="button" variant="outline" disabled={loading || saving || editingId !== null} onClick={() => void loadResponses()}>{loading ? "Refreshing…" : "Refresh list"}</Button>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {rsvps.length === 0 ? <p className="surface-card panel-padding section-copy text-center">No RSVPs yet. Add people manually above, or share your RSVP link.</p> : (
        <ul className="surface-card panel-padding divide-y divide-border">
          {rsvps.map(rsvp => <li key={rsvp.id} className="py-6 first:pt-0 last:pb-0">
            {editingId === rsvp.id ? <HostRsvpEditor pin={pin} existing={rsvp} onSaved={saved} onCancel={() => setEditingId(null)} disabled={saving} onSavingChange={setSaving} confirmationsEnabled={emailStatus?.guestConfirmations ?? false} /> : <>
              <BlogCard variant="ledger" strongTitle className="py-0!" title={rsvp.name} date={rsvp.attending === "yes" ? `Coming · ${rsvp.guests} guest${rsvp.guests === 1 ? "" : "s"}` : "Can't make it"} />
              {duplicates.has(rsvp.id) && <p className="mt-3 rounded-lg bg-[var(--blush)]/50 px-3 py-2 text-sm text-[var(--blush-deep)]">Possible duplicate: same email or phone as {duplicates.get(rsvp.id)!.join(", ")}</p>}
              <dl className="mt-4 grid gap-2 text-sm leading-relaxed sm:grid-cols-[7rem_1fr]">
                <dt className="text-muted-foreground">Email</dt><dd className="break-all">{rsvp.email || "Not provided"}</dd>
                <dt className="text-muted-foreground">Phone</dt><dd>{rsvp.phone || "Not provided"}</dd>
                <dt className="text-muted-foreground">Email language</dt><dd>{rsvp.lang === "gu" ? "Gujarati" : "English"}</dd>
              </dl>
              {rsvp.attending === "yes" && <ol className="mt-4 space-y-2 rounded-xl bg-secondary/50 p-4 text-sm leading-relaxed">
                {rsvp.guestDetails.map((guest, i) => <li key={i} className="break-words"><span className="font-semibold">{guest.name || `Guest ${i + 1} · name to add`}</span> · {guest.dietary ? copy.en[dietaryCopyKeys[guest.dietary]] : "Dietary preference to add"}{guest.dietaryNote ? ` · ${guest.dietaryNote}` : ""}</li>)}
              </ol>}
              {rsvp.note && <p className="mt-4 whitespace-pre-wrap break-words text-sm text-muted-foreground">{rsvp.note}</p>}
              {confirmingId === rsvp.id ? (
                <div role="alertdialog" aria-labelledby={`confirm-${rsvp.id}`} className="mt-4 rounded-xl border border-[var(--blush-deep)]/30 bg-[var(--blush)]/40 p-4">
                  <p id={`confirm-${rsvp.id}`} className="text-sm font-semibold leading-relaxed text-[var(--ink)]">
                    Are you sure you want to remove {rsvp.name}&apos;s RSVP? This cannot be undone.
                  </p>
                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" autoFocus onClick={() => setConfirmingId(null)}>Cancel</Button>
                    <Button type="button" size="sm" className="bg-[var(--destructive)] text-white hover:bg-[var(--blush-deep)]" disabled={saving} onClick={() => { setConfirmingId(null); void removeRsvp(rsvp.id); }}>Yes, remove</Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" aria-label={`Edit RSVP for ${rsvp.name}`} disabled={saving || editingId !== null} onClick={() => { setEditingId(rsvp.id); setAnnouncement(""); setConfirmingId(null); }}>Edit details</Button>
                  <Button type="button" variant="outline" size="sm" disabled={saving} aria-label={`Remove RSVP for ${rsvp.name}`} onClick={() => setConfirmingId(rsvp.id)}>Remove</Button>
                </div>
              )}
            </>}
          </li>)}
        </ul>
      )}
      <div className="text-center"><Button type="button" variant="outline" disabled={saving} onClick={() => { setRsvps(null); setError(""); setEditingId(null); setAnnouncement(""); setEmailStatus(null); setPin(""); }}>Lock host access</Button></div>
    </div>
  );
}
