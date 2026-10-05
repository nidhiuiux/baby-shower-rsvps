"use client";

import { useState } from "react";
import { AttendanceChoice } from "@/components/attendance-choice";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Attendance, Rsvp } from "@/lib/rsvps";

type Summary = {
  total: number;
  yes: number;
  no: number;
  headcount: number;
};

type EmailStatus = {
  notifyEmail: string;
  configured: boolean;
};

function parseGuestCount(raw: string): number {
  const n = Number(raw);
  if (!raw.trim() || !Number.isFinite(n)) return 1;
  return Math.min(20, Math.max(1, Math.round(n)));
}

function buildSummary(list: Rsvp[]): Summary {
  const yes = list.filter((r) => r.attending === "yes");
  return {
    total: list.length,
    yes: yes.length,
    no: list.length - yes.length,
    headcount: yes.reduce((sum, r) => sum + r.guests, 0),
  };
}

export function HostDashboard() {
  const [pin, setPin] = useState("");
  const [rsvps, setRsvps] = useState<Rsvp[] | null>(null);
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [manualName, setManualName] = useState("");
  const [manualAttending, setManualAttending] = useState<Attendance>("yes");
  const [manualGuests, setManualGuests] = useState("1");
  const [manualNote, setManualNote] = useState("");
  const [savingManual, setSavingManual] = useState(false);
  const [manualError, setManualError] = useState("");

  const summary = rsvps ? buildSummary(rsvps) : null;
  // Only adding locks the form. Removing is instant, so rows never wait on the server.
  const busy = savingManual;
  const [announcement, setAnnouncement] = useState("");

  async function loadResponses(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        headers: { "x-host-pin": pin },
        cache: "no-store",
      });
      const data = (await res.json()) as {
        error?: string;
        rsvps?: Rsvp[];
        summary?: Summary;
        email?: EmailStatus;
      };
      if (!res.ok) {
        setError(data.error || "Could not load responses.");
        setRsvps(null);
        setEmailStatus(null);
        return;
      }
      setRsvps(data.rsvps ?? []);
      setEmailStatus(data.email ?? null);
    } catch {
      setError("Could not load responses. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function addManual(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setManualError("");
    setError("");
    setAnnouncement("");
    if (!manualName.trim()) {
      setManualError("Enter a name.");
      return;
    }
    const guestCount =
      manualAttending === "yes" ? parseGuestCount(manualGuests) : 0;
    if (manualAttending === "yes") {
      setManualGuests(String(guestCount));
    }

    setSavingManual(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: manualName.trim(),
          attending: manualAttending,
          guests: guestCount,
          note: manualNote.trim(),
          pin,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        rsvp?: Rsvp;
        emailSent?: boolean;
      };
      if (!res.ok) {
        setManualError(data.error || "Could not add RSVP.");
        return;
      }

      if (!data.rsvp) {
        setManualError("Could not add RSVP.");
        return;
      }

      const added = data.rsvp;
      setRsvps((current) => [added, ...(current ?? []).filter((r) => r.id !== added.id)]);
      setAnnouncement(`Added ${added.name}.`);
      setManualName("");
      setManualNote("");
      setManualGuests("1");
      setManualAttending("yes");
    } catch {
      setManualError("Could not add RSVP. Please try again.");
    } finally {
      setSavingManual(false);
    }
  }

  async function removeRsvp(id: string) {
    const index = rsvps?.findIndex((r) => r.id === id) ?? -1;
    const removed = index >= 0 ? rsvps?.[index] : undefined;
    if (!removed) return;

    // The row disappears at once. If the server refuses, only this row comes back.
    setError("");
    setRsvps((current) => current?.filter((r) => r.id !== id) ?? null);
    setAnnouncement(`Removed ${removed.name}.`);

    const restore = (message: string) => {
      setRsvps((current) => {
        if (!current || current.some((r) => r.id === id)) return current;
        const next = current.slice();
        next.splice(Math.min(index, next.length), 0, removed);
        return next;
      });
      setAnnouncement("");
      setError(message);
    };

    try {
      const res = await fetch("/api/rsvp", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pin }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) restore(data.error || `Could not remove ${removed.name}.`);
    } catch {
      restore(`Could not remove ${removed.name}. Please try again.`);
    }
  }

  if (!rsvps) {
    return (
      <form onSubmit={loadResponses} aria-busy={loading} className="surface-card panel-padding mx-auto w-full max-w-md space-y-6">
        <div className="space-y-2">
          <Label htmlFor="pin">Enter host PIN</Label>
          <Input
            id="pin"
            type="password"
            autoComplete="current-password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            disabled={loading}
            required
          />
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? "Checking…" : "Open host access"}
        </Button>
      </form>
    );
  }

  return (
    <div className="content-width space-y-8">
      <p className="sr-only" role="status">{announcement}</p>
      {emailStatus && (
        <div className="status-note">
          {emailStatus.configured ? (
            <p>
              Email alerts on for <strong>{emailStatus.notifyEmail}</strong>
            </p>
          ) : (
            <p>
              Email alerts are not on yet. Add <code>RESEND_API_KEY</code> in
              your deploy settings.
            </p>
          )}
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {[
            { label: "Responses", value: summary.total },
            { label: "Coming", value: summary.yes },
            { label: "Can't make it", value: summary.no },
            { label: "Guest total", value: summary.headcount },
          ].map((item) => (
            <div key={item.label} className="surface-card px-4 py-5 text-center">
              <p className="font-display text-3xl text-[var(--ink)]">{item.value}</p>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={addManual}
        aria-busy={savingManual}
        className="surface-card panel-padding"
      >
        <h2 className="section-heading">Add RSVP manually</h2>
        <p className="section-copy mt-2 mb-6">
          Use this when someone replies by text, call, or in person.
        </p>
        <fieldset disabled={busy} className="min-w-0 space-y-6">
          <legend className="sr-only">Guest details</legend>
          <div className="space-y-2">
            <Label htmlFor="manual-name">Name</Label>
            <Input
              id="manual-name"
              autoComplete="name"
              maxLength={80}
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="Guest name"
              required
            />
          </div>
          <AttendanceChoice
            name="manual-attending"
            legend="Will they attend?"
            value={manualAttending}
            onChange={setManualAttending}
            yesLabel="Coming"
            noLabel="Can't make it"
          />
          {manualAttending === "yes" && (
            <div className="space-y-2">
              <Label htmlFor="manual-guests">Number of guests (including them)</Label>
              <Input
                id="manual-guests"
                type="number"
                inputMode="numeric"
                min={1}
                max={20}
                value={manualGuests}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d{0,2}$/.test(v)) {
                    setManualGuests(v);
                  }
                }}
                onBlur={() => setManualGuests(String(parseGuestCount(manualGuests)))}
                className="w-32"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="manual-note">
              Note <span className="font-normal text-[var(--ink-muted)]">(optional)</span>
            </Label>
            <Textarea
              id="manual-note"
              rows={3}
              maxLength={500}
              value={manualNote}
              onChange={(e) => setManualNote(e.target.value)}
              placeholder="Said yes by text…"
            />
          </div>
          {manualError && (
            <p className="form-error" role="alert">
              {manualError}
            </p>
          )}
          <Button
            type="submit"
            disabled={busy}
            className="w-full"
          >
            {savingManual ? "Adding…" : "Add person"}
          </Button>
        </fieldset>
      </form>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {rsvps.length === 0 ? (
        <p className="surface-card panel-padding section-copy text-center">
          No RSVPs yet. Add people manually above, or share your RSVP link.
        </p>
      ) : (
        <ul className="space-y-3">
          {rsvps.map((rsvp) => (
            <li
              key={rsvp.id}
              className="surface-card p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1 break-words">
                  <p className="font-semibold text-[var(--ink)]">{rsvp.name}</p>
                  <p
                    className={`mt-1 text-sm font-medium ${
                      rsvp.attending === "yes"
                        ? "text-[var(--leaf-deep)]"
                        : "text-[var(--ink-muted)]"
                    }`}
                  >
                    {rsvp.attending === "yes"
                      ? `Coming · ${rsvp.guests} guest${rsvp.guests === 1 ? "" : "s"}`
                      : "Can't make it"}
                  </p>
                  {rsvp.note && (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink-soft)]">{rsvp.note}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label={`Remove RSVP for ${rsvp.name}`}
                  onClick={() => void removeRsvp(rsvp.id)}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="text-center">
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => {
            setRsvps(null);
            setError("");
            setManualError("");
            setManualName("");
            setManualNote("");
            setManualGuests("1");
            setManualAttending("yes");
            setAnnouncement("");
            setEmailStatus(null);
            setPin("");
          }}
        >
          Lock host access
        </Button>
      </div>
    </div>
  );
}
