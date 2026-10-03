"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Attendance } from "@/lib/rsvps";

type Status = "idle" | "saving" | "done" | "error";

export function RsvpForm() {
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<Attendance | "">("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!attending) {
      setError("Please choose Yes or No.");
      return;
    }

    setStatus("saving");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          attending,
          note: note.trim(),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setError("Could not send your RSVP. Please try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="thanks animate-rise text-center">
        <p className="font-display text-3xl text-[var(--ink)] sm:text-4xl">
          {attending === "yes" ? "Wonderful — see you there!" : "Thank you for letting us know"}
        </p>
        <p className="mt-3 text-base text-[var(--ink-soft)] sm:text-lg">
          {attending === "yes"
            ? `We're so glad you're coming, ${name.trim().split(" ")[0]}.`
            : `We'll miss you, ${name.trim().split(" ")[0]}.`}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rsvp-form animate-rise-delay space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-[var(--ink)]">
          Your name
        </Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          placeholder="First and last name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 border-[var(--line)] bg-white/70 text-base text-[var(--ink)] placeholder:text-[var(--ink-muted)]"
          required
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-[var(--ink)]">
          Will you attend?
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "yes", label: "Yes, I'll be there" },
              { value: "no", label: "Sorry, can't make it" },
            ] as const
          ).map((option) => {
            const selected = attending === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setAttending(option.value)}
                className={`choice-btn h-12 rounded-xl border px-3 text-sm font-medium transition-all duration-200 sm:text-base ${
                  selected
                    ? "border-[var(--leaf)] bg-[var(--leaf-soft)] text-[var(--ink)] shadow-sm"
                    : "border-[var(--line)] bg-white/60 text-[var(--ink-soft)] hover:border-[var(--leaf)]/50"
                }`}
                aria-pressed={selected}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="note" className="text-[var(--ink)]">
          A note <span className="font-normal text-[var(--ink-muted)]">(optional)</span>
        </Label>
        <Textarea
          id="note"
          name="note"
          placeholder="Dietary needs, a sweet message…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="resize-none border-[var(--line)] bg-white/70 text-base text-[var(--ink)] placeholder:text-[var(--ink-muted)]"
        />
      </div>

      {error && (
        <p className="text-sm text-[var(--blush-deep)]" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={status === "saving"}
        className="h-12 w-full rounded-xl bg-[var(--leaf)] text-base font-semibold text-white hover:bg-[var(--leaf-deep)]"
      >
        {status === "saving" ? "Sending…" : "Send RSVP"}
      </Button>
    </form>
  );
}
