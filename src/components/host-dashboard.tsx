"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Rsvp } from "@/lib/rsvps";

type Summary = {
  total: number;
  yes: number;
  no: number;
  headcount: number;
};

export function HostDashboard() {
  const [pin, setPin] = useState("");
  const [rsvps, setRsvps] = useState<Rsvp[] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
          {loading ? "Checking…" : "View responses"}
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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

      {rsvps.length === 0 ? (
        <p className="text-center text-[var(--ink-soft)]">
          No RSVPs yet. Share your invitation link to get started.
        </p>
      ) : (
        <ul className="space-y-3">
          {rsvps.map((rsvp) => (
            <li
              key={rsvp.id}
              className="rounded-2xl border border-[var(--line)] bg-white/80 px-5 py-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium text-[var(--ink)]">{rsvp.name}</p>
                <p
                  className={`text-sm font-medium ${
                    rsvp.attending === "yes"
                      ? "text-[var(--leaf-deep)]"
                      : "text-[var(--ink-muted)]"
                  }`}
                >
                  {rsvp.attending === "yes"
                    ? `Coming · ${rsvp.guests} guest${rsvp.guests === 1 ? "" : "s"}`
                    : "Can't make it"}
                </p>
              </div>
              {rsvp.note && (
                <p className="mt-2 text-sm text-[var(--ink-soft)]">{rsvp.note}</p>
              )}
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
          Lock responses
        </Button>
      </div>
    </div>
  );
}
