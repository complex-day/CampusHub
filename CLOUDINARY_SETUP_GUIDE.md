# Cloudinary Setup Guide

## Account and configuration

1. Create or select an approved Cloudinary account for CampusHub.
2. Record the cloud name and API key; keep the API secret in Railway only.
3. Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in the backend environment.
4. Use the logical folder `campushub/posters` for poster uploads. Keep staging and production isolated with separate accounts where possible; otherwise use clearly separated folders such as `campushub/staging/posters` and `campushub/production/posters` and separate credentials.
5. Configure quota, transformation, bandwidth, and error alerts. Confirm the selected plan limits before enabling uploads.

## Existing upload contract

The backend exposes authenticated `POST /api/uploads/poster`. It accepts the multipart field `poster`, requires faculty or admin authorization, uses a server-side signed Cloudinary upload, and returns `{ posterUrl }` after a successful upload. Existing validation allows JPG, JPEG, PNG, and WebP image content up to 5 MB; extension, MIME type, and image signature/content are checked before upload. The client must never receive or use the API secret.

Configure delivery to use the returned HTTPS `secure_url`. Do not accept arbitrary client-supplied Cloudinary URLs as a replacement for the server upload flow.

## Smoke test

After Railway is configured, use a staging faculty/admin test account and a small valid image:

```powershell
curl.exe -i -X POST https://<railway-staging-host>/api/uploads/poster `
  -H "Authorization: Bearer <staging-test-token>" `
  -F "poster=@<path-to-valid-poster.png>"
```

Verify HTTP 201, an HTTPS Cloudinary URL, the expected staging folder/account, and rendering from the Vercel preview. Also test no file, invalid content, mismatched extension/MIME, over-5-MB content, unauthenticated access, and student access.

## Lifecycle and security

- Define whether deleting an announcement/event deletes its asset. Until an approved policy exists, retain records and assets and track orphan candidates rather than deleting automatically.
- Establish a reviewed orphan cleanup job or manual report with a grace period; never delete assets solely because a transient API request failed.
- Rotate API secrets on a schedule or after personnel/access changes, update Railway atomically, and rerun the upload smoke test.
- Limit account members and API access, monitor transformations/bandwidth/storage, and use separate staging credentials.

## Optional future/manual tooling

Cloudinary CLI or API administration may be used later for approved folder audits, quota checks, and orphan cleanup. Any CLI/API command must be selected from current Cloudinary documentation, authenticated by an authorized operator, dry-run/reviewed where supported, and run against staging first. No Cloudinary CLI or API administration command was executed for this guide.
