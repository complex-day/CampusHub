# Railway Setup Guide

## Service configuration

Create separate Railway staging and production environments. Recommended settings for this repository:

- Repository root/directory: repository root.
- Build command: `npm run build`.
- Start command: `node backend/dist/server.js`.
- Equivalent workspace start: `npm --workspace backend start` if Railway resolves it from the repository root.
- Health path: `/health`.
- Readiness path: `/ready`.
- Port: do not hard-code it; the backend reads Railway's `PORT`.

The root and backend package scripts now include `start: node backend/dist/server.js`. They are verified by the TypeScript production build, but Railway staging still requires an actual deployment and public health/readiness verification.

## Variables

Configure secrets in Railway, separately per environment:

`NODE_ENV`, `PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

Use the `campushub_staging` Atlas URI and staging Cloudinary account/folder in staging. Use unique production credentials in production. `CLIENT_ORIGIN` must exactly match the Vercel origin, including scheme and any required domain, with no trailing-slash mismatch.

## CLI commands for later use

These commands are examples only. They require an authenticated Railway CLI, an existing project/service, and the correct linked directory. Do not run them as part of this documentation task.

```powershell
railway login
railway link
railway variables
railway variables set NODE_ENV=production
railway up
railway status
railway logs
```

Confirm the CLI's current syntax and selected environment before changing variables or deploying. Prefer the Railway dashboard for secret review and environment selection.

## Deploy, verify, rollback

1. Create/select the staging environment and service.
2. Add variables, deploy the validated commit, and inspect build/runtime logs.
3. Confirm startup connects to Atlas before traffic is accepted.
4. Run `curl.exe -i https://<railway-host>/health` and `curl.exe -i https://<railway-host>/ready`.
5. Verify Vercel-origin CORS, cookies, API behavior, upload behavior, and logs.
6. Record deployment ID, commit, variables version, smoke results, and owner.
7. For rollback, stop promotion, select the last known-good Railway deployment, restore the approved variable set, redeploy if required, and rerun `/health`, `/ready`, and the critical workflow smoke tests. Do not roll back by exposing secrets or changing Atlas data destructively.

## Operational checks

- [ ] Health is liveness only; readiness is 503 when MongoDB is unavailable.
- [ ] Logs do not contain JWTs, passwords, request bodies, or Cloudinary secrets.
- [ ] Restart and graceful shutdown behavior are observed.
- [ ] Resource usage, rate limits, error rates, and alerts have agreed thresholds.
- [ ] Staging and production deployment histories and rollback targets are recorded.
