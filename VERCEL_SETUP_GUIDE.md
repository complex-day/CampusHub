# Vercel Setup Guide

## Project configuration

Create separate Preview/staging and Production configuration for the frontend:

- Project root: `frontend`.
- Framework preset: `Next.js`.
- Build command: `npm run build`.
- Output: automatic Next.js output; do not set a custom output directory.

Set `BACKEND_ORIGIN` in Vercel Environment Variables for Preview and Production. Preview must target Railway staging; Production must target Railway production. Never put backend, JWT, MongoDB, or Cloudinary secrets in Vercel variables.

## Rewrite and origin relationship

`frontend/next.config.mjs` rewrites relative `/api/:path*` requests to `${BACKEND_ORIGIN}/api/:path*`. Keep frontend requests relative so they use this rewrite. Railway `CLIENT_ORIGIN` must exactly allow the deployed Vercel origin used by browser requests. Verify scheme, hostname, preview URL, and custom domain separately.

## Commands for later use

Run these only after linking/authenticating the intended Vercel project; they were not run for this guide:

```powershell
npx vercel
npx vercel --prod
```

Review the current CLI prompts and selected project/environment before deployment. Record the deployment URL and identifier.

## Validation and rollback

- [ ] Preview loads and relative `/api` calls reach Railway staging.
- [ ] Production build completes in Vercel.
- [ ] Browser login, cookies, CORS, announcements, events, search, admin, and poster upload work.
- [ ] Preview cannot reach production Atlas or Cloudinary resources.
- [ ] Custom domain and preview URLs are not accidentally mixed in `CLIENT_ORIGIN`.
- [ ] Rollback target and deployment identifier are recorded. Use the Vercel deployment rollback/promote workflow, then rerun critical smoke tests.
