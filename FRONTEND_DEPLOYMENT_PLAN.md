# Frontend Deployment Plan

## Recommendation

Deploy the Next.js App Router frontend to Vercel. Set the Vercel project root to `frontend` so Vercel uses `frontend/package.json` and its Next.js configuration.

## Build and runtime

- Project root: `frontend` workspace.
- Build command: `npm run build`.
- Start command for a self-hosted or preview Node runtime: `npm run start`. Vercel normally manages the Next.js runtime and does not require a long-running `next start` command; keep the command documented for non-Vercel verification.
- The root build command is `npm run build` and currently builds backend then frontend. It is accurate for repository-level CI, but the Vercel project should build only from the `frontend` root.
- The current production build passed and generated 12 routes.

## API rewrite and origins

`frontend/next.config.mjs` reads `BACKEND_ORIGIN` and rewrites `/api/:path*` to `${BACKEND_ORIGIN}/api/:path*`. Keep frontend calls relative (`/api/...`) so the browser remains on the Vercel origin and cookies/credentialed requests follow the existing behavior.

Set:

- Vercel `BACKEND_ORIGIN=https://<railway-service-domain>` with no trailing path. Do not point it at a browser-only route.
- Railway `CLIENT_ORIGIN=https://<vercel-production-domain>` so Express CORS permits the production frontend with credentials.

The rewrite is server-side configuration. Never put MongoDB, JWT, or Cloudinary secrets in `NEXT_PUBLIC_*` variables or browser-exposed code.

## Environments

Configure separate Preview and Production values in Vercel. Preview deployments must use a backend environment that has an explicitly allowlisted preview origin, or use a staging frontend/backend pair. Do not let arbitrary preview URLs access production data.

For production, use the canonical Vercel domain or custom domain consistently in both Vercel and Railway CORS configuration. After each domain change, test login, logout, `/api/me`, announcements, events, search, and poster upload.

## Caveats

The frontend has no browser E2E suite or manual production workflow yet. The full audit still reports one high PostCSS finding and one moderate Next finding through `next@15.5.24`; a supported patched dependency chain or tested Next major upgrade is required before release. Backend and frontend hosting are not configured in this repository.

Official reference: [Vercel pricing](https://vercel.com/pricing).
