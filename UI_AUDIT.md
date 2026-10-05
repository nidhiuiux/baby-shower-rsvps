# UI consistency audit — October 5, 2026

Branch: `codex/system-harmony-audit`. Scope: the invitation, English/Gujarati presentation, RSVP form, and host dashboard, following the request to normalize the UI. Existing devotional artwork, event details, and sage/blush visual direction are retained.

## Shared UI rules

- Content panels use a 42rem maximum width, 24px corners, one border/surface/shadow treatment, and 24px mobile / 32px desktop padding.
- Major sections use 48px mobile / 64px desktop spacing. Section headings share a 28px / 32px scale; body copy uses 16px with relaxed line height.
- Inputs and primary buttons use 48px targets. Secondary actions use at least 44px. Primary action colors and muted text have stronger contrast.
- Both forms use the same native, keyboard-accessible attendance component, labels, fields, error treatment, and name/note limits. Choices stack on narrow screens.
- Gujarati display text has additional line height. Countdown labels use the same sans-serif family as the rest of the interface.

## Behavior fixes

- Sealed invitations no longer leave a long invisible page to scroll. Opening moves focus into the invitation; successful RSVP submission moves focus to its confirmation.
- Reduced-motion rendering now uses a stable server snapshot, avoiding hydration mismatches, and shows static celebration text.
- Countdown text remains visible until its canvas initializes, including when canvas rendering is unavailable.
- Copying a Gujarati invitation retains `?lang=gu`; clipboard failure now gives visible feedback.
- Host totals derive from the current rows. Pending mutations disable conflicting actions, and failed deletes retain the row without rolling back other changes.
- Music state follows tab visibility, language metadata resets on navigation, and unused animation demo code was removed.
- `127.0.0.1` is explicitly allowed for local development, matching the README and this Next.js version's dev-origin policy.

## Verification

- ESLint and TypeScript checks.
- Production build with Next.js 16.3.8 / Turbopack. The first sandbox-restricted build could not bind its worker port; rebuilding with the required process permissions and a fresh generated cache succeeded.
- Browser checks at 320, 390, 768, and 1440px in English and Gujarati: opening, layout widths, consistent card/field dimensions, attendance choices, and hydration/runtime errors.
- Guest UI: pending state, failed submission and retry, confirmation, focus, and submitted payload.
- Host UI: wrong PIN, login, manual add, deletion failure/success, totals, pending action locks, and logout.
- Gujarati clipboard URL, calendar download, normal-motion countdown, and reduced-motion layout.

Mutation checks use intercepted fixture responses. They do not create real RSVPs, send email, or establish that production email/storage credentials work. Visual review covers Chromium; Safari and Firefox were not exercised.

## Separate backend findings

These existing concerns remain outside the UI normalization:

- Host authentication uses a hard-coded default PIN in `src/lib/event.ts`, and listing transmits the PIN in the URL. Move host credentials to server-only configuration and use a protected session before treating `/host` as strong access control.
- The local JSON store reads/modifies/writes without an atomic transaction. Concurrent writes can overwrite each other, and malformed JSON is treated as an empty store.
- With `RSVP_STORE=resend` outside Vercel, a failed email can still return success because the API only checks `VERCEL` when deciding whether notification failure means storage failure. Resend listing also stops after ten pages, so it can omit older responses.

No deployment or changes to `main` are part of this work.
