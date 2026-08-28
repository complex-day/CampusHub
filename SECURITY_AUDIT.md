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

After adding Next.js, the full and production-only audits report one high PostCSS advisory and one moderate Next advisory through `next@15.5.24`. npm offers `next@16.3.3` as a major upgrade. It was not applied because the major-version compatibility, runtime requirements, and complete browser regression workflow have not been validated. No forced upgrade was used.

This unresolved frontend audit is a release blocker. Before production, test and apply a supported Next upgrade, or pin a supported patched dependency chain after confirming compatibility.

## Other controls reviewed

- Production configuration fails startup when JWT, MongoDB, or Cloudinary credentials are missing.
- Uploads remain memory-buffered and validate extension, MIME type, image signature, and 5MB size before Cloudinary upload.
- Tenant scope, JWT claims, password handling, rate limits, security headers, and sanitized input remain covered by the existing security tests.

## Residual risk

No production credentials were read. Cloudinary and MongoDB connectivity, dependency behavior under production traffic, browser E2E behavior, and performance/resource limits remain unverified.
