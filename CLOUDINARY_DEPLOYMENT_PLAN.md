# Cloudinary Deployment Plan

## Production account

Use Cloudinary for announcement and event poster delivery. Configure the production account with:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

The API secret is backend-only. Store all three values in Railway's secret configuration; expose none to Vercel or browser JavaScript. Templates in the repository are placeholders only.

Use the folder `campushub/posters` for uploaded poster assets. Confirm the folder naming convention and account before the first production upload so assets are not split across development and production accounts.

## Upload and delivery controls

The existing backend upload path uses memory storage and validates extension, MIME type, image signature/content, and a 5 MB size limit before calling Cloudinary. Uploads require authentication and the faculty or admin role. Preserve those controls and test them through Railway before release.

Use Cloudinary delivery URLs returned by the backend. Apply controlled image transformations for width, height, format, quality, and responsive delivery where the UI requires them. Keep transformations bounded to prevent abuse and avoid accepting arbitrary unsigned client upload parameters. Generate responsive variants only when measured frontend needs justify them.

## Operations

Track transformations, bandwidth, storage, upload failures, rejected files, and quota consumption. Configure provider alerts before launch. The Free plan is listed as $0 with 25 credits; Plus is listed as $89/month. Verify current plan limits and retention terms before purchase.

Define cleanup rules for abandoned uploads and assets no longer referenced by announcements/events. Do not delete an asset solely because a client request says it is unused; reconcile against database references and retain an incident-safe window. Cloudinary is delivery storage, not the only disaster-recovery copy for irreplaceable originals; decide whether originals require an approved export or backup process.

Do not log API secrets, signed parameters, tokens, or raw upload contents. Rotate credentials through the provider and Railway secret manager if exposure is suspected.

Official reference: [Cloudinary pricing](https://cloudinary.com/pricing).
