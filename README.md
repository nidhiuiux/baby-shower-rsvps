# Baby Shower RSVP

A simple RSVP link for your baby shower invitation. Guests open the page, answer a short form, and you're done.

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
- **hostPin** — PIN to view responses (default: `shower`)
- **notifyEmail** — where RSVP confirmation emails are sent

## Email notifications

Every new RSVP (guest form or host manual add) emails `notifyEmail`.

**Works out of the box** via FormSubmit:
1. Set `notifyEmail` in `src/lib/event.ts` (already set for you)
2. Submit one test RSVP
3. Check your inbox for FormSubmit’s **activation / confirm** email and click it once
4. After that, each RSVP sends you a confirmation email

**Optional (more reliable):** create a free [Resend](https://resend.com) API key, copy `.env.example` to `.env.local`, and set:

```bash
RESEND_API_KEY=re_xxxxxxxx
NOTIFY_EMAIL=you@example.com
```

Then restart `npm run dev`.

## How it works

1. **Guest link (share this):** `/` — simple RSVP (name, yes/no, optional note). No guest-count field.
2. **Host link (keep private):** `/host` — enter your PIN to view responses, add people manually, or remove entries
3. Each RSVP is saved and an email notification is sent to you
4. Responses are also stored in `data/rsvps.json` on the server

Example (local):
- Guests: `http://127.0.0.1:43123`
- You only: `http://127.0.0.1:43123/host`

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
