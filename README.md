# Baby Shower RSVP

A bilingual baby shower invitation with family RSVP details and email confirmations.

## Quick start

```bash
npm install
npm run dev
```

- On this computer: [http://127.0.0.1:43123](http://127.0.0.1:43123)
- On a phone (public link): keep `npm run dev` running, then in another terminal run `npm run tunnel` and open the `https://….trycloudflare.com` URL it prints

`127.0.0.1` only works on the same computer. Phones need the HTTPS tunnel link (or a deployed site).

## Personalize your invite

Edit `src/lib/event.ts`:

- **brand** — parents' names (shown large on the page)
- **title** — e.g. "Baby Shower"
- **tagline** — short welcome line
- **date** / **location** — event details
- **hostPin** — fallback PIN only (default: `shower`). The repository is public, so set a private `HOST_PIN` environment variable in your deploy settings (and `.env.local`) instead
- **notifyEmail** — where RSVP confirmation emails are sent

## Email notifications

Every new RSVP emails the host with all submitted details. Guests receive a
separate English or Gujarati confirmation matching the language they used,
with different messages for attending and declined replies. Both emails use
the invitation's cream, sage and blush theme. Guest replies go to the host;
replies to host notifications go to the guest's email address.

Emails are already addressed to `notifyEmail` in `src/lib/event.ts`
(`nsavaliya93@gmail.com`). To turn sending on:

1. Create a free account at [resend.com](https://resend.com) **with `nsavaliya93@gmail.com`** (or the inbox you want alerts in) and create an API key
2. In the project folder, copy the example env file:
   ```bash
   cp .env.example .env.local
   ```
3. Put your key in `.env.local` (do not commit this file), and use a sender on a verified Resend domain for guest confirmations:
   ```bash
   RESEND_API_KEY=re_your_real_key
   NOTIFY_EMAIL=nsavaliya93@gmail.com
   NOTIFY_FROM_EMAIL=Nidhi & Hardik <celebrate@your-verified-domain.com>
   ```
4. Restart the app (`npm run dev`)
5. Submit a test RSVP — you should get an email within a few seconds

Local replies still save without email credentials. On Vercel, the host email
is the durable record, so `RESEND_API_KEY` is required and a storage failure
is reported to the guest. If only the guest confirmation fails, the RSVP stays
saved and the success screen explains that they do not need to submit again.

Note: Resend’s free test sender (`onboarding@resend.dev`) can only deliver to the
email on your Resend account. For other inboxes, verify a domain in Resend and
set `NOTIFY_FROM_EMAIL`. See [Resend's sender-domain guidance](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain).

## How it works

1. **Guest link (share this):** `/` — name, email, phone, attendance, guest count, each guest's name and dietary preference, dietary details/allergies, and an optional note. Name/email/phone are required for new replies. Attending families provide every guest's name and preference; Other requires an explanation.
2. **Host link (keep private):** `/host` — enter your PIN to view all details, add people, edit existing replies, or remove entries.
3. Existing RSVPs keep their IDs, original dates, notes and counts. New fields appear blank until completed. Host additions and edits allow incomplete contact/dietary details so you can fill them gradually.
4. Host saves send a host notification. The **Send a confirmation email to this guest when I save** checkbox is off by default; editing older records does not automatically contact guests. Choose English or Gujarati for an optional confirmation.
5. Local replies are stored in `data/rsvps.json`, using serialized atomic writes. Vercel replies remain in the existing Resend email store, with the full record embedded in the host email only. Edits use the same ID, and the latest version wins when reloading. Guest confirmations are not treated as new RSVP records.

The wedding repository was used as a reference for fields and confirmation
flows. Its wedding branding, guest data and credentials are not copied.
The baby shower's existing sections, artwork and event details are preserved.

Example (local):
- Guests: `http://127.0.0.1:43123`
- You only: `http://127.0.0.1:43123/host`


## Permanent links (Vercel)

Temporary Cloudflare tunnel links expire. For lasting guest + host URLs:

1. Open the **claim** link from the latest deploy (or ask the agent to redeploy).
2. Sign up / log in to Vercel (free) and claim the deployment.
3. Your permanent URLs will be:
   - Guest RSVP: `https://YOUR-PROJECT.vercel.app`
   - Host: `https://YOUR-PROJECT.vercel.app/host` (PIN from the `HOST_PIN` environment variable)

RSVPs on Vercel are stored via Resend email records (same inbox as notifications), so they persist across deploys when `RESEND_API_KEY` is set.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm test` | Validate fields, email templates, persistence, legacy edits and delivery failures using isolated data and mocked email transport |

Email templates live in `src/lib/rsvp-emails.ts`. They include HTML and plain
text, use inline styles and table layouts, escape guest-provided content,
and need no new dependencies. Browser previews are useful for layout checks;
actual inbox delivery requires the verified sender configuration above.

## UI conventions

Shared colors, panel styles, type, and section spacing live in `src/app/globals.css`.
Use `surface-card`, `panel-padding`, `content-width`, `section-space`,
`section-heading`, and `section-copy` for new sections. Use the shared `Button`,
`Input`, `Textarea`, `Label`, and `AttendanceChoice` components for forms.
Keep guest-facing strings in both language entries in `src/lib/copy.ts`.

See [UI_AUDIT.md](UI_AUDIT.md) for the normalization, verification scope, and
separate backend findings.

## Invitation entrance and effects

The existing opening screen displays a five-second pixel countdown and opens
at its deadline. Tapping anywhere above the language selector opens it sooner.
Automatic opening is silent; music can start with the opening tap or the music
button. Changing languages does not restart the timer.

Reusable components live in `src/components/ui` (the configured shadcn alias
`@/components/ui`), with CSS in `src/app/globals.css`:

- `soft-gradient-background-animation.tsx`: a slow sage/blush background.
- `counter-loader.tsx`: the supplied pixel-counter idea, driven by remaining seconds.
- `blog-cards.tsx`: responsive dotted-leader rows for the existing event details.
- `spotlight.tsx`: a subtle hover highlight on the existing ceremony card.

These adaptations use the installed React, Tailwind, TypeScript, Framer Motion,
and Lucide dependencies. No extra providers or image assets are needed. The
counter uses shared CSS rather than adding styled-components. The full-screen
glyph portal and extra pixel canvas were omitted to preserve the invitation's
length and artwork. No sections or demo routes were added. Decorative motion
is disabled for reduced-motion preferences; the spotlight also stays off on
touch devices.
