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

## Data — Resident Advisor (live)

Event names, dates, venues, line-ups, genres **and posters** come from RA's live Brussels agenda. The app calls its own serverless function at `/api/ra-proxy`, which queries `ra.co/graphql` server-side (no key needed), resolves the Brussels area automatically, and returns the next 14 days of events — each with its real RA flyer (`flyerFront`).

- **Deployed (Vercel/Netlify):** `/api/ra-proxy` runs and the app shows RA's current upcoming agenda, refreshing on every load (cached 30 min). Dates are real and fixed; past events never render.
- **Local `npm run dev` / static preview:** there's no serverless function, so the fetch fails quietly and the app falls back to the bundled snapshot in `src/App.jsx`.

RA's GraphQL is public but unofficial — it can change or rate-limit, so keep the static fallback and check RA's terms before anything public-facing. The flyer images are hotlinked from RA's CDN.

### Tweaks
- Window length: `/api/ra-proxy?days=14` (RA allows up to 30).
- Different city: change the `searchTerm` in `brusselsAreaId()` inside `api/ra-proxy.js`.

## Deploy (GitHub Pages)

A workflow is included at `.github/workflows/deploy.yml`. On push to `main` it builds and deploys to Pages. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

`vite.config.js` sets `base: "/Nuit.bxl/"` to match the repo name. For a root domain (custom domain / Netlify / Vercel), set `base: "/"`.
