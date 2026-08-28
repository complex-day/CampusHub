# Bucket J: Deployment Planning

## 1. What Was Built

A complete deployment plan for CampusHub covering staging and production architecture, backend hosting, frontend hosting, MongoDB Atlas, Cloudinary, environment variables, release checks, and rollback.

## 2. Why It Was Built

The application is feature-complete locally, but deployment requires repeatable provider configuration, secret handling, database safeguards, health checks, and recovery procedures before production traffic is accepted.

## 3. Architecture Decisions

- Vercel hosts the Next.js frontend.
- Railway hosts the compiled Express backend.
- MongoDB Atlas stores tenant-scoped application data.
- Cloudinary stores poster images.
- Vercel rewrites relative `/api/*` requests to Railway through `BACKEND_ORIGIN`.
- Railway uses `CLIENT_ORIGIN` for credentialed CORS.
- Staging and production use separate databases, credentials, and Cloudinary namespaces.

## 4. Database Changes

No application schema changes were made. Atlas setup requires controlled review and creation of the existing Mongoose indexes, including tenant/date indexes and text indexes. Index changes must not run destructively during application startup.

## 5. API Endpoints

- `GET /health` is an unauthenticated liveness check.
- `GET /ready` is an unauthenticated readiness check and returns 200 only when MongoDB is connected.
- Existing authenticated APIs remain unchanged.

## 6. Frontend Components

The frontend is a Next.js App Router workspace with `frontend/package.json`, `npm run build`, `npm run start`, a root layout, and a rewrite configured by `BACKEND_ORIGIN`. Exact Vercel settings are documented in `VERCEL_SETUP_GUIDE.md`.

## 7. Security Considerations

- Backend production dependencies audit clean after upgrading Cloudinary and Next.js to 16.3.3 and removing the unused vulnerable storage adapter.
- Secrets belong only in Railway/Vercel provider secret stores, never in source control or browser variables.
- Upload validation, JWT checks, tenant isolation, CORS, cookies, rate limits, and security headers must be verified in staging.
- Preview deployments must use staging resources and origins, never production data.

## 8. Testing Completed

Local validation passed:

- 68 backend tests across 10 files
- Backend TypeScript build
- Frontend Next.js production build with 12 routes
- V8 statement coverage at 81.44%
- Full and backend production dependency audits with 0 vulnerabilities
- `git diff --check`

Real provider smoke tests, browser E2E, load, memory/resource, database-integrity, and backup-restore tests remain open.

## 9. Common Bugs Encountered

The original deployment audit identified a missing frontend build project, vulnerable dependency versions, and no explicit production start command. J0 remediation added the frontend workspace, upgraded dependencies, and established `node backend/dist/server.js` as the compiled backend start command.

## 10. Rebuild Guide

Read these documents in order:

1. `DEPLOYMENT_READINESS.md`
2. `BACKEND_DEPLOYMENT_PLAN.md`
3. `FRONTEND_DEPLOYMENT_PLAN.md`
4. `ATLAS_SETUP_GUIDE.md`
5. `RAILWAY_SETUP_GUIDE.md`
6. `VERCEL_SETUP_GUIDE.md`
7. `CLOUDINARY_SETUP_GUIDE.md`
8. `ENVIRONMENT_VARIABLES.md`
9. `STAGING_DEPLOYMENT_GUIDE.md`
10. `RELEASE_CHECKLIST.md` and `ROLLBACK_PLAN.md`

Current decision: local readiness is GO, but staging is NO-GO until provider resources are provisioned and public health, readiness, API, security, tenant-isolation, upload, browser, and rollback checks pass. No deployment has been performed.
