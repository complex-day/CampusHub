# Rollback Plan

## Incident sequence

1. Declare the incident, record the deployment/version, affected origins, symptoms, and start time.
2. Check Vercel deployment status, Railway logs/restarts, `/health`, `/ready`, Atlas health, Cloudinary status, and recent configuration changes.
3. Stop promotion and disable further migrations or index operations.
4. Roll back the application provider deployments if the failure is code or build related.
5. Recover environment configuration if the failure is secret or origin related.
6. Use database restore only when data corruption or an incompatible schema change requires it; do not use database restore for an ordinary application regression.
7. Verify the service with unauthenticated, authenticated, tenant-isolation, upload, and frontend rewrite smoke tests.
8. Communicate recovery, preserve logs, and open a follow-up for root cause and prevention.

## Application rollback

- Vercel: promote the last known-good deployment from the project's deployment history, then verify the production domain and rewrite behavior.
- Railway: redeploy or promote the previous known-good service deployment/image from provider history. Confirm the start command remains `node backend/dist/server.js` and that the compiled artifact matches the selected commit.
- Record the last known-good frontend, backend, and configuration versions before each release.
- Prefer rolling back application code before changing data. If a migration or new index is involved, follow the database section first.

## Database rollback and restore

Database changes are not automatically rolled back by application rollback. Pause writes when necessary, preserve the incident evidence, and determine whether the issue is an index, schema, migration, or data mutation problem.

For data recovery, restore an Atlas backup/PITR point to an isolated cluster first. Validate connectivity, indexes, tenant-scoped reads, counts, and representative application workflows there. Only after approval should a controlled cutover or production recovery occur. Never overwrite production as the first restore test.

Index caution: do not blindly run `syncIndexes`, drop indexes, or rerun migrations during an incident. Compare the recorded production index set with the target version, review impact, and apply an approved operation during a controlled window. There is currently no permitted destructive startup migration.

The planning targets are RPO 15 minutes and RTO 2 hours, subject to the selected Atlas tier and a completed timed restore test.

## Environment recovery

Keep provider environment variables in Railway/Vercel secret stores. Record versioned change history and the last known-good values without placing secret values in this document or source control. Revert a bad `BACKEND_ORIGIN`, `CLIENT_ORIGIN`, database URI, or credential rotation to the last known-good provider version. If a secret may have leaked, rotate it rather than restoring the exposed value.

After changing origins or secrets, restart/redeploy the affected service and verify CORS, cookies, database readiness, and Cloudinary uploads.

## Cloudinary assets

Application rollback does not remove Cloudinary assets. Keep assets in `campushub/posters` during incident investigation. Do not bulk-delete files to match a rolled-back database until references are reconciled. If a database restore removes references to newer uploads, retain an incident-safe window, identify orphaned assets, and clean them only through an approved reconciliation process.

## Verification

A rollback is complete only when:

- `/health` is 200 and `/ready` is 200 with Atlas available.
- Vercel `/api` rewrites reach the restored Railway version.
- Login/session cookies and CORS work on the canonical origin.
- Announcements, events, search, admin authorization, and poster upload behave correctly.
- Cross-college access remains denied.
- Logs show stable startup, no credential disclosure, and no repeated restarts.
- Atlas and Cloudinary metrics return to normal and the incident record contains the exact restored versions.
