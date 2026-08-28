# Security Audit

## Audit date

2026-08-28

## Commands

- `npm audit --omit=dev --json`
- `npm audit --json`

## Backend findings and remediation

The initial audit reported two high-severity findings for `cloudinary@1.41.3` and `multer-storage-cloudinary@4.0.0`. The Cloudinary advisory is arbitrary argument injection when parameters contain an ampersand (GHSA-g4mf-96x5-5m2c, CWE-88, CVSS 8.6), affecting Cloudinary versions before 2.7.0. The storage adapter was unused: uploads use Multer memory storage and `cloudinary.uploader.upload_stream` directly.

Remediation completed:

- Removed the unused `multer-storage-cloudinary` dependency.
- Upgraded the directly used `cloudinary` SDK to `^2.7.0`.
- Refreshed `package-lock.json` without `--force`.
- Rebuilt the backend and passed upload tests.

The backend production-only and full audits report no remaining backend vulnerabilities.

## Frontend findings and residual risk

After adding Next.js, the frontend was upgraded to `next@16.3.3`. The full npm audit and backend production-only audit now report 0 vulnerabilities. The backend and frontend production builds pass after the upgrade, with browser E2E and real provider verification remaining open.

## Other controls reviewed

- Production configuration fails startup when JWT, MongoDB, or Cloudinary credentials are missing.
- Uploads remain memory-buffered and validate extension, MIME type, image signature, and 5MB size before Cloudinary upload.
- Tenant scope, JWT claims, password handling, rate limits, security headers, and sanitized input remain covered by the existing security tests.

## Residual risk

No production credentials were read. Cloudinary and MongoDB connectivity, dependency behavior under production traffic, browser E2E behavior, performance/resource limits, and all real staging smoke tests remain unverified. No staging deployment has occurred.
