# Baby Shower RSVP

A simple RSVP link for your baby shower invitation. Guests open the page, answer a short form, and you're done.

## Quick start

```bash
npm install
npm run dev -- --port 43123
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123) and share that link on your invitation.

## Personalize your invite

Edit `src/lib/event.ts`:

- **brand** — parents' names (shown large on the page)
- **title** — e.g. "Baby Shower"
- **tagline** — short welcome line
- **date** / **location** — event details
- **hostPin** — PIN to view responses (default: `shower`)

## How it works

1. **Guest link (share this):** `/` — RSVP form only. No host controls are shown.
2. **Host link (keep private):** `/host` — enter your PIN to see responses and guest totals
3. Responses are saved in `data/rsvps.json` on the server

Example (local):
- Guests: `http://127.0.0.1:43123`
- You only: `http://127.0.0.1:43123/host`

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
