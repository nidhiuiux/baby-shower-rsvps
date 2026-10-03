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
};

export function HostDashboard() {
  const [pin, setPin] = useState("");
  const [rsvps, setRsvps] = useState<Rsvp[] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [manualName, setManualName] = useState("");
  const [manualAttending, setManualAttending] = useState<Attendance>("yes");
  const [manualNote, setManualNote] = useState("");
  const [savingManual, setSavingManual] = useState(false);
  const [manualError, setManualError] = useState("");

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
      };
      if (!res.ok) {
        setError(data.error || "Could not load responses.");
        setRsvps(null);
        setSummary(null);
        return;
      }
      setRsvps(data.rsvps ?? []);
      setSummary(data.summary ?? null);
    } catch {
      setError("Could not load responses. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function addManual(e: React.FormEvent) {
    e.preventDefault();
    setManualError("");
    if (!manualName.trim()) {
      setManualError("Enter a name.");
      return;
    }
    setSavingManual(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: manualName.trim(),
          attending: manualAttending,
          note: manualNote.trim(),
          pin,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        rsvps?: Rsvp[];
        summary?: Summary;
      };
      if (!res.ok) {
        setManualError(data.error || "Could not add RSVP.");
        return;
      }
      setRsvps(data.rsvps ?? []);
      setSummary(data.summary ?? null);
      setManualName("");
      setManualNote("");
      setManualAttending("yes");
    } catch {
      setManualError("Could not add RSVP. Please try again.");
    } finally {
      setSavingManual(false);
    }
  }

  async function removeRsvp(id: string) {
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
        setError(data.error || "Could not remove RSVP.");
        return;
      }
      setRsvps(data.rsvps ?? []);
      setSummary(data.summary ?? null);
    } catch {
      setError("Could not remove RSVP. Please try again.");
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
        <p className="text-center text-sm text-[var(--ink-muted)]">
          Default PIN is set in <code className="text-[var(--ink-soft)]">src/lib/event.ts</code>
        </p>
      </form>
    );
  }

  return (
    <div className="space-y-8">
      {summary && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: "Responses", value: summary.total },
            { label: "Coming", value: summary.yes },
            { label: "Can't make it", value: summary.no },
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
                    {rsvp.attending === "yes" ? "Coming" : "Can't make it"}
                  </p>
                  {rsvp.note && (
                    <p className="mt-2 text-sm text-[var(--ink-soft)]">{rsvp.note}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeRsvp(rsvp.id)}
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
          onClick={() => {
            setRsvps(null);
            setSummary(null);
            setPin("");
          }}
        >
          Lock host access
        </Button>
      </div>
    </div>
  );
}
