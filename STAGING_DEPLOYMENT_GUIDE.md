# CampusHub Staging Deployment Guide

## Decision

**Local readiness: GO. Staging deployment: NO-GO at this time.** Local verification is complete, but no real staging deployment, provider smoke test, or browser E2E run has occurred. Do not call staging GO until Atlas, Cloudinary, Railway, and Vercel resources are provisioned and the checks below produce observed results.

## Staged sequence

### 1. Local validation

Run from the repository root:

```powershell
npm install
npm test
npm --workspace backend run test -- --coverage
npm run build
npm audit --audit-level=high
npm --workspace backend audit --omit=dev --audit-level=high
git diff --check
```

Optional local production processes, in separate terminals:

```powershell
npm --workspace backend start
npm --workspace frontend start
```

With the backend running on its configured local port:

```powershell
curl.exe -i http://localhost:4000/health
curl.exe -i http://localhost:4000/ready
```

Expected: `/health` returns HTTP 200; `/ready` returns HTTP 200 only while MongoDB is connected and HTTP 503 otherwise. Use the actual configured port if `PORT` differs.

### 2. Provision isolated staging resources

- Create an Atlas staging database named `campushub_staging` and a least-privilege application user.
- Create a staging Cloudinary account or isolated staging folder, using `campushub/posters` only within the staging asset namespace.
- Create separate Railway and Vercel staging/preview environments.
- Generate unique staging secrets. Never reuse production `JWT_SECRET`, database credentials, or Cloudinary API secrets.
- Set Railway `CLIENT_ORIGIN` to the exact Vercel staging origin. Set Vercel `BACKEND_ORIGIN` to the Railway staging origin.
- Apply reviewed indexes through an approved Atlas/MongoDB operation. Do not add destructive startup migrations.

### 3. Deploy backend to Railway staging

Configure the repository root, build command `npm run build`, start command `node backend/dist/server.js`, `PORT` from Railway, and health/readiness paths `/health` and `/ready`. Confirm the deployment connects to `campushub_staging` before accepting traffic.

Run against the deployed backend URL:

```powershell
curl.exe -i https://<railway-staging-host>/health
curl.exe -i https://<railway-staging-host>/ready
```

### 4. Deploy frontend to Vercel staging

Configure the `frontend` directory as the project root, framework `Next.js`, build command `npm run build`, and `BACKEND_ORIGIN` for Preview. The existing rewrite sends relative `/api/:path*` requests to the configured backend origin. Confirm the preview origin is the value in Railway `CLIENT_ORIGIN`.

### 5. Run staging smoke and E2E checks

Record URLs, deployment IDs, commit/build identifiers, timestamps, and results. Use test accounts and staging data only.

## Staging test checklist

- [ ] `/health` and `/ready` return the expected status through the public Railway URL.
- [ ] Frontend loads through the Vercel preview URL and relative `/api` requests reach Railway.
- [ ] Register, login, logout, session persistence after refresh, and unauthenticated protection work in a browser.
- [ ] Student, faculty, and admin workflows match their authorization boundaries.
- [ ] Create/read/delete announcements and create/read/update/delete events work with valid data.
- [ ] Search returns tenant- and department-appropriate results and rejects invalid or oversized queries.
- [ ] College A cannot read or mutate College B announcements, events, users, departments, or search results.
- [ ] Unauthorized and wrong-role requests return the expected 401/403 responses.
- [ ] Credentialed CORS and httpOnly cookie behavior work from the Vercel staging origin.
- [ ] Security headers, rate limits, generic errors, malformed JSON handling, XSS encoding, and NoSQL/operator-injection rejection are verified.
- [ ] Upload a valid JPG/PNG/WebP poster through `POST /api/uploads/poster`; verify the returned Cloudinary URL and rendered asset.
- [ ] Reject missing files, invalid signatures/extensions/MIME types, mismatched content, and files over 5 MB.
- [ ] Confirm provider logs contain no tokens, passwords, request bodies, or provider secrets.
- [ ] Exercise restart/health behavior and confirm `/ready` fails when the database is unavailable.
- [ ] Run browser API/frontend E2E coverage for the main student, faculty, and admin paths.
- [ ] Complete performance/concurrency, memory/resource, database-integrity, backup-restore, and orphan-upload checks or record approved exceptions.

## Abort gates

Abort or roll back staging when any of these occurs: `/health` is not 200; `/ready` is 200 without a database connection; frontend API rewrites or CORS/cookies fail; tenant isolation or role authorization fails; secrets appear in logs; uploads bypass validation or use the wrong account/folder; database indexes are missing or destructive changes are proposed; backups cannot restore to an isolated target; error rates, latency, memory, or rate-limit behavior exceed agreed thresholds; or the deployed build does not match the validated commit.

## Staging decision record

Current decision: **NO-GO**. Local GO means the recorded install, tests, builds, audits, and diff check pass. It does not authorize staging or production. Change this decision to **GO for staging** only after all provider resources are actually configured, the public smoke commands pass, the API/frontend E2E checklist is complete, and rollback evidence is recorded.

## Architecture

```mermaid
flowchart LR
    Browser[Vercel Next.js frontend] -->|HTTPS and relative /api rewrite| Railway[Railway backend]
    Railway -->|TLS SRV connection| Atlas[MongoDB Atlas]
    Railway -->|signed server-side upload| Cloudinary[Cloudinary posters]
    Railway --> Health[/health and /ready]
```

## Monthly planning estimate

- Atlas: Free `$0`; Flex `$8-$30`; Dedicated from `$56.94`.
- Cloudinary: Free `$0` with 25 credits; Plus `$89`.
- Vercel: Hobby `$0` for personal/non-commercial use; Pro `$20`.
- Railway: usage-based; assume `$5-$20` for a small service.
- Typical paid setup: **$33-$70/month**, excluding domain, email, and monitoring. Confirm current pricing and regional usage before purchase.

## Risks

Provider configuration, DNS/origin drift, cookie/CORS behavior, Atlas network access, missing indexes, backup restoration, upload quota, orphaned assets, resource limits, and unverified browser workflows remain staging risks. The local audit and build results do not prove provider behavior.

## Final recommended next action

Provision isolated Atlas and Cloudinary staging resources, configure Railway and Vercel with separate secrets and matching origins, deploy the validated commit, and execute the smoke/E2E checklist before changing the staging decision.
