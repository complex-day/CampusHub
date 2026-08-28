# Bucket D: Poster Upload System

## 1. What Was Built

CampusHub now supports optional poster uploads for announcements. Faculty and admins can upload JPG, JPEG, PNG, or WebP files and receive a Cloudinary URL for the announcement payload.

## 2. Why It Was Built

Posters are a core campus communication object. Storing them in Cloudinary keeps binary files outside MongoDB while allowing announcements to display the published image.

## 3. Architecture Decisions

The upload route authenticates and authorizes the user, Multer buffers one file in memory, validation checks the declared type and image content, and only then does the upload service stream the bytes to Cloudinary. Announcement creation remains a separate API call to preserve the existing contract.

## 4. Database Changes

Announcements have an optional `posterUrl` string field, trimmed and limited to 2048 characters. No migration is required because existing documents may omit the field.

## 5. API Endpoints

- `POST /api/uploads/poster` accepts multipart field `poster` and requires faculty or admin authentication.
- Success returns HTTP 201 with `{ "posterUrl": "..." }`.
- Invalid, missing, oversized, unauthorized, or storage-failed uploads return JSON errors.
- `POST /api/announcements` accepts the optional validated `posterUrl`.

## 6. Frontend Components

`PosterUpload` handles file selection and upload state. `CreateAnnouncementForm` uploads before publishing and includes the returned URL. `AnnouncementCard` renders an image only when `posterUrl` exists.

## 7. Security Considerations

The route enforces JWT authentication and faculty/admin roles. Extension and MIME values must match. Only four image types are accepted, files are capped at 5MB, and basic image signatures/content structure are checked before Cloudinary storage. The URL is validated before persistence and tenant behavior remains controlled by the existing announcement API.

## 8. Testing Completed

`UPLOAD-001` through `UPLOAD-005` cover valid PNG/JPG, unsafe and mismatched types, oversized files, and corrupted content. Authorization coverage checks 401 and 403 responses. Announcement regression coverage verifies poster URL persistence. Full validation passed with 25 tests and a successful TypeScript build.

## 9. Common Bugs Encountered

The PNG fixture initially placed the `IEND` marker at a different offset than the validator expected. The validator and fixture were aligned to the PNG chunk layout, and the focused suite passed afterward.

## 10. Rebuild Guide

Install dependencies with `npm install`. Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in the backend environment. Run `npm test` and `npm run build` from the repository root. Start the backend with `npm run dev:backend`.