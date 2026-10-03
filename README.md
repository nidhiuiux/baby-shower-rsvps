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

## How it works

1. **Guest link (share this):** `/` — simple RSVP (name, yes/no, optional note). No guest-count field.
2. **Host link (keep private):** `/host` — enter your PIN to view responses, add people manually, or remove entries
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
