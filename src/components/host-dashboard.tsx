"use client";

import { useState } from "react";
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
  const [summary, setSummary] = useState<Summary | null>(null);
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [manualName, setManualName] = useState("");
  const [manualAttending, setManualAttending] = useState<Attendance>("yes");
  const [manualGuests, setManualGuests] = useState("1");
  const [manualNote, setManualNote] = useState("");
  const [savingManual, setSavingManual] = useState(false);
  const [manualError, setManualError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function loadResponses(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/rsvp?pin=${encodeURIComponent(pin)}`);
      const data = (await res.json()) as {
        error?: string;
        rsvps?: Rsvp[];
        summary?: Summary;
        email?: EmailStatus;
      };
      if (!res.ok) {
        setError(data.error || "Could not load responses.");
        setRsvps(null);
        setSummary(null);
        setEmailStatus(null);
        return;
      }
      setRsvps(data.rsvps ?? []);
      setSummary(data.summary ?? null);
      setEmailStatus(data.email ?? null);
    } catch {
      setError("Could not load responses. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function addManual(e: React.FormEvent) {
    e.preventDefault();
    setManualError("");
    setError("");
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
        rsvps?: Rsvp[];
        summary?: Summary;
        emailSent?: boolean;
      };
      if (!res.ok) {
        setManualError(data.error || "Could not add RSVP.");
        return;
      }

      // Prefer server list, but always keep the new person visible.
      let next = data.rsvps ?? rsvps ?? [];
      if (data.rsvp && !next.some((r) => r.id === data.rsvp!.id)) {
        next = [data.rsvp, ...next];
      }
      setRsvps(next);
      setSummary(data.summary ?? buildSummary(next));
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
    if (removingId) return;
    setError("");
    setRemovingId(id);

    // Instant UI remove; roll back if server fails.
    const previous = rsvps ?? [];
    const optimistic = previous.filter((r) => r.id !== id);
    setRsvps(optimistic);
    setSummary(buildSummary(optimistic));

    try {
      const res = await fetch("/api/rsvp", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pin }),
      });
      const data = (await res.json()) as {
        error?: string;
        rsvps?: Rsvp[];
        summary?: Summary;
      };
      if (!res.ok) {
        setRsvps(previous);
        setSummary(buildSummary(previous));
        setError(data.error || "Could not remove RSVP.");
        return;
      }
      const next = (data.rsvps ?? optimistic).filter((r) => r.id !== id);
      setRsvps(next);
      setSummary(data.summary ?? buildSummary(next));
    } catch {
      setRsvps(previous);
      setSummary(buildSummary(previous));
      setError("Could not remove RSVP. Please try again.");
    } finally {
      setRemovingId(null);
    }
  }

  if (!rsvps) {
    return (
      <form onSubmit={loadResponses} className="mx-auto w-full max-w-sm space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pin">Enter host PIN</Label>
          <Input
            id="pin"
            type="password"
            autoComplete="current-password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            className="h-12"
            required
          />
        </div>
        {error && (
          <p className="text-sm text-[var(--blush-deep)]" role="alert">
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full bg-[var(--leaf)] text-white hover:bg-[var(--leaf-deep)]"
        >
          {loading ? "Checking…" : "Open host access"}
        </Button>
      </form>
    );
  }

  return (
    <div className="space-y-8">
      {emailStatus && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            emailStatus.configured
              ? "bg-[var(--leaf-soft)] text-[var(--leaf-deep)]"
              : "bg-[#f8e8e6] text-[var(--blush-deep)]"
          }`}
        >
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
            <div key={item.label} className="rounded-2xl bg-white/70 px-4 py-5 text-center">
              <p className="font-display text-3xl text-[var(--ink)]">{item.value}</p>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={addManual}
        className="space-y-4 rounded-[1.5rem] border border-[var(--line)] bg-white/70 p-5 sm:p-6"
      >
        <h2 className="font-display text-2xl text-[var(--ink)]">Add RSVP manually</h2>
        <p className="text-sm text-[var(--ink-soft)]">
          Use this when someone replies by text, call, or in person.
        </p>
        <div className="space-y-2">
          <Label htmlFor="manual-name">Name</Label>
          <Input
            id="manual-name"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            placeholder="Guest name"
            className="h-12"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "yes", label: "Coming" },
              { value: "no", label: "Can't make it" },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setManualAttending(option.value)}
              className={`h-11 rounded-xl border text-sm font-medium transition-all ${
                manualAttending === option.value
                  ? "border-[var(--leaf)] bg-[var(--leaf-soft)] text-[var(--ink)]"
                  : "border-[var(--line)] bg-white text-[var(--ink-soft)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
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
              className="h-12 w-32"
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="manual-note">
            Note <span className="font-normal text-[var(--ink-muted)]">(optional)</span>
          </Label>
          <Input
            id="manual-note"
            value={manualNote}
            onChange={(e) => setManualNote(e.target.value)}
            placeholder="Said yes by text…"
            className="h-12"
          />
        </div>
        {manualError && (
          <p className="text-sm text-[var(--blush-deep)]" role="alert">
            {manualError}
          </p>
        )}
        <Button
          type="submit"
          disabled={savingManual}
          className="h-12 w-full bg-[var(--leaf)] text-white hover:bg-[var(--leaf-deep)]"
        >
          {savingManual ? "Adding…" : "Add person"}
        </Button>
      </form>

      {error && (
        <p className="text-center text-sm text-[var(--blush-deep)]" role="alert">
          {error}
        </p>
      )}

      {rsvps.length === 0 ? (
        <p className="text-center text-[var(--ink-soft)]">
          No RSVPs yet. Add people manually above, or share your RSVP link.
        </p>
      ) : (
        <ul className="space-y-3">
          {rsvps.map((rsvp) => (
            <li
              key={rsvp.id}
              className="rounded-2xl border border-[var(--line)] bg-white/80 px-5 py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-[var(--ink)]">{rsvp.name}</p>
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
                    <p className="mt-2 text-sm text-[var(--ink-soft)]">{rsvp.note}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={removingId === rsvp.id}
                  onClick={() => removeRsvp(rsvp.id)}
                >
                  {removingId === rsvp.id ? "Removing…" : "Remove"}
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
          onClick={() => {
            setRsvps(null);
            setSummary(null);
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
