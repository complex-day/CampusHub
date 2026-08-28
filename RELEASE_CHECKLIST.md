# Release Checklist

## Current assessment

**NO-GO for production release.** Backend and frontend builds pass, 68 backend tests pass, coverage is 81.44% statements/lines, and both the full and backend production audits report 0 vulnerabilities. Next.js is upgraded to 16.3.3, and the root/backend production start script is `node backend/dist/server.js`. Performance, memory/resource, database-integrity, manual browser E2E, real staging smoke tests, backup/restore, and controlled index migration remain open.

## Provider and architecture

- [ ] Vercel frontend project is created with root `frontend`.
- [ ] Railway backend service uses repository root/workspace context.
- [ ] Railway build command is `npm run build`, and both workspace builds are confirmed in deployment logs.
- [ ] Railway production start is configured as `node backend/dist/server.js` and verified in a real staging deployment. The root and backend scripts now provide this command.
- [ ] Atlas and Cloudinary production resources are selected and billed within approval.
- [ ] Deployment diagram and provider ownership are reviewed.

## Code, build, and audit

- [x] Backend TypeScript build passes.
- [x] Frontend Next production build passes and generates 12 routes.
- [x] 68 backend tests pass across 10 files.
- [x] Coverage is 81.44% statements/lines, 74.13% branches, and 80% functions.
- [x] Full dependency audit is clean; current report is 0 vulnerabilities after the Next.js 16.3.3 upgrade.
- [ ] Performance/concurrency validation passes.
- [ ] Memory/resource validation passes.
- [ ] Manual browser E2E workflow passes.

## Environment and security

- [ ] All variables in [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) are configured in provider secret/config stores.
- [ ] Production secrets are unique, long, access-controlled, and absent from logs/source control.
- [ ] Preview variables point only to staging resources.
- [ ] Railway `CLIENT_ORIGIN` exactly matches the canonical frontend origin.
- [ ] Cloudinary upload role, file validation, 5 MB limit, and secret handling are smoke-tested.
- [ ] Rate limits, credentialed CORS, cookies, security headers, and generic errors are verified on the deployed service.

## Database and Cloudinary

- [ ] Atlas least-privilege user and deployment network access are configured.
- [ ] Atlas TLS/SRV connection succeeds from Railway.
- [ ] All current indexes are reviewed and applied through a controlled operation.
- [ ] No destructive startup migration or index drop is enabled.
- [ ] PITR/snapshots, retention, alerts, and restore permissions are configured.
- [ ] Backup restores to an isolated cluster and representative reads are verified.
- [ ] Cloudinary `campushub/posters` exists and quota alerts are active.

## Smoke tests

- [ ] `GET /health` returns 200 through the backend provider.
- [ ] `GET /ready` returns 200 only after Atlas is connected and returns 503 when unavailable.
- [ ] Vercel relative `/api` requests reach Railway through the rewrite.
- [ ] Registration, login, logout, session persistence, and unauthorized access work in a browser.
- [ ] Tenant-scoped announcements, events, search, admin actions, and poster upload work.
- [ ] CORS and httpOnly cookie behavior work on the production origin.
- [ ] Logs, alerts, graceful shutdown, and restart behavior are verified.

## Rollback readiness

- [ ] Previous Vercel and Railway deployment identifiers are recorded.
- [ ] Provider environment variable versions/rollback values are recorded securely.
- [ ] Atlas restore procedure and isolated-cluster test are complete.
- [ ] Cloudinary asset retention and orphan cleanup procedure is documented.
- [ ] Incident owner, communication path, and verification commands are assigned.

## Cost estimate

Planning estimate per month, excluding domain, email, and monitoring:

- MongoDB Atlas: Free $0, Flex approximately $8-$30, or Dedicated from about $56.94; verify current regional pricing.
- Cloudinary: Free $0 with 25 credits, or Plus $89; verify current limits.
- Vercel: Hobby $0 for personal/non-commercial use, or Pro $20.
- Railway backend: provider usage-based; planning assumption $5-$20 for a small service. Verify current pricing before purchase.

Expected MVP range is **about $5-$159/month**, depending on free versus paid tiers and usage. A typical small paid setup using Atlas Flex, Cloudinary Free, Vercel Pro, and the assumed Railway range is approximately **$33-$70/month**. Pricing varies and must be confirmed with [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/pricing), [Cloudinary](https://cloudinary.com/pricing), [Vercel](https://vercel.com/pricing), and [Railway](https://railway.com/pricing).

## Final recommendation and next action

Do not release yet. Complete a real staging deployment with Atlas/Cloudinary, verify the Railway start command and Vercel rewrite through public smoke tests, then complete controlled indexes, backup restore, resource checks, and manual browser smoke tests. Update this checklist only after observed evidence supports GO.
