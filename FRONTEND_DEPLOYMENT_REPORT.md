# Frontend Deployment Report

## Setup

The existing Next-style App Router pages are now a buildable `@campushub/frontend` workspace with:

- `next@15.5.24` resolved from the declared `^15.5.0` range
- React and React DOM 19
- `dev`, `build`, and `start` scripts
- Required `app/layout.jsx` root layout and metadata
- `next.config.mjs` API rewrite

## Build

Run `npm --workspace frontend run build`. The production build passed on 2026-08-28 and generated all 12 existing routes.

## Environment and API communication

Set `BACKEND_ORIGIN` in the frontend environment. The default is `http://localhost:4000` for local development. Browser requests continue using the existing relative `/api/...` paths; Next rewrites them to `${BACKEND_ORIGIN}/api/...`. This keeps cookies and the current user-facing API calls unchanged.

The backend must set `CLIENT_ORIGIN` to the public frontend origin and allow credentialed CORS. Do not expose backend secrets or Cloudinary credentials to the frontend.

## Limitations

- No browser E2E suite or manual production workflow was run.
- Next/PostCSS audit findings remain unresolved pending a tested major Next upgrade.
- Backend and frontend deployment providers are not configured in this repository.
- The existing pages intentionally remain dependency-light and were not redesigned.
