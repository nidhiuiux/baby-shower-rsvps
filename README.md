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

Every new RSVP (guest form or host manual add) emails you.

Emails are already addressed to `notifyEmail` in `src/lib/event.ts`
(`nsavaliya93@gmail.com`). To turn sending on:

1. Create a free account at [resend.com](https://resend.com) **with `nsavaliya93@gmail.com`** (or the inbox you want alerts in) and create an API key
2. In the project folder, copy the example env file:
   ```bash
   cp .env.example .env.local
   ```
3. Put your key in `.env.local` (do not commit this file):
   ```bash
   RESEND_API_KEY=re_your_real_key
   NOTIFY_EMAIL=nsavaliya93@gmail.com
   ```
4. Restart the app (`npm run dev`)
5. Submit a test RSVP — you should get an email within a few seconds

Until `RESEND_API_KEY` is set, RSVPs still save; only the email is skipped. The host page (`/host`) shows whether email is configured.

Note: Resend’s free test sender (`onboarding@resend.dev`) can only deliver to the
email on your Resend account. For other inboxes, verify a domain in Resend and
set `NOTIFY_FROM_EMAIL`.

## How it works

1. **Guest link (share this):** `/` — simple RSVP (name, yes/no, optional note). No guest-count field.
2. **Host link (keep private):** `/host` — enter your PIN to view responses, add people manually, or remove entries
3. Each RSVP is saved and an email notification is sent to you
4. Responses are also stored in `data/rsvps.json` on the server

Example (local):
- Guests: `http://127.0.0.1:43123`
- You only: `http://127.0.0.1:43123/host`


## Permanent links (Vercel)

Temporary Cloudflare tunnel links expire. For lasting guest + host URLs:

1. Open the **claim** link from the latest deploy (or ask the agent to redeploy).
2. Sign up / log in to Vercel (free) and claim the deployment.
3. Your permanent URLs will be:
   - Guest RSVP: `https://YOUR-PROJECT.vercel.app`
   - Host: `https://YOUR-PROJECT.vercel.app/host` (PIN in `src/lib/event.ts`)

RSVPs on Vercel are stored via Resend email records (same inbox as notifications), so they persist across deploys when `RESEND_API_KEY` is set.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
