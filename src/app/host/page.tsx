import type { Metadata } from "next";
import Link from "next/link";
import { HostDashboard } from "@/components/host-dashboard";
import { event } from "@/lib/event";

export const metadata: Metadata = {
  title: `RSVP responses | ${event.brand}`,
  robots: { index: false, follow: false },
};

export default function HostPage() {
  return (
    <div className="shower-shell flex flex-1 flex-col">
      <main className="page-container">
        <header className="mb-10 text-center">
          <p className="font-display text-4xl text-[var(--ink)] sm:text-5xl">
            {event.brand}
          </p>
          <h1 className="mt-2 text-lg text-[var(--ink-soft)]">RSVP responses</h1>
        </header>
        <HostDashboard />
        <p className="mt-10 text-center text-sm text-[var(--ink-muted)]">
          <Link href="/" className="inline-flex min-h-11 items-center rounded-lg px-3 text-primary underline-offset-4 hover:underline">
            ← Back to RSVP link
          </Link>
        </p>
      </main>
    </div>
  );
}
