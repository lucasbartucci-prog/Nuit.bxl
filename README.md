# NUIT.BXL

A Brussels nightlife catalogue — dark canvas, lime accent, rave-flyer cards. Built from the Figma flow and populated with Resident Advisor (Brussels) listings.

Made by [@bartuccino](https://instagram.com/bartuccino).

## Run locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## What it does

- Reads the current date and shows only **upcoming** events, capped at a rolling **14-day** window. Past nights drop off automatically; day tabs and the genre filter are built from what's inside the window.
- Cards mirror the Figma component: flyer, venue, genre tags, line-up, door price. Tap a card for the full detail sheet. The carousel resets to the first card on every day change.
- Save (♥) toggles, genre filter, and a link out to each event on RA.

## Data — Resident Advisor

Event **names, venues and genres** come from RA's Brussels listings. RA has **no official public API**; its full chronological list loads through a private GraphQL endpoint (`ra.co/graphql`) that a browser can't call directly (CORS).

This build ships a static snapshot: real names/venues, with **dates and times generated relative to today** as placeholders, and generated posters where a real flyer wasn't fetched. A small banner makes this clear in the UI.

### Going live

`src/App.jsx` contains the wiring at the bottom (`RA_GRAPHQL`, `fetchEvents`, `RA_PROXY_EXAMPLE`):

1. Deploy the tiny serverless proxy (`/api/ra-proxy`) so the GraphQL call clears CORS.
2. Fill in the Brussels `areas.eq` id (grab it from the graphql request body on `ra.co/events/be/brussels` via DevTools → Network).
3. Set `LIVE = true` and swap the mock `EVENTS` array for `fetchEvents()`.

The query already asks for `today → +14 days`, so the same window logic then runs on real data, with exact dates, flyers and line-ups.

> Check RA's terms before anything public-facing — the GraphQL endpoint is unofficial and the flyer images are hotlinked from their CDN.

## Deploy (GitHub Pages)

A workflow is included at `.github/workflows/deploy.yml`. On push to `main` it builds and deploys to Pages. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

`vite.config.js` sets `base: "/Nuit.bxl/"` to match the repo name. For a root domain (custom domain / Netlify / Vercel), set `base: "/"`.
