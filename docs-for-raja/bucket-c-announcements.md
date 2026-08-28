# Bucket C: Announcement System

## What was built

- Announcement model with college, optional department, creator, timestamps, and validation.
- Faculty/admin publishing API.
- Tenant- and department-scoped announcement feed.
- Pagination with a default of 10 and maximum of 50.
- Admin and creator-faculty deletion permissions.
- Announcement feed page, reusable card, and publishing form.

## Why it was built

Announcements are the first CampusHub feature that replaces fragmented WhatsApp communication with a searchable, structured feed.

## Architecture decisions

- College scope is always taken from verified JWT context.
- Department-targeted announcements are visible only to users in that department; college-wide announcements use `departmentId: null`.
- Announcement creation verifies the college, creator, and optional department before writing.

## Database changes

- Added the `Announcement` collection and a compound feed index on college, department, and creation time.

## API endpoints

- `POST /api/announcements` (faculty/admin)
- `GET /api/announcements` (tenant and department scoped, paginated)
- `GET /api/announcements/:id` (tenant and department scoped)
- `DELETE /api/announcements/:id` (admin or creator faculty)

## Frontend components

- `frontend/app/announcements/page.jsx`
- `frontend/components/AnnouncementCard.jsx`
- `frontend/components/CreateAnnouncementForm.jsx`

## Security considerations

- Students cannot create announcements.
- Client-provided college IDs cannot escape the authenticated tenant.
- Invalid college, department, creator, and announcement IDs are rejected.
- Delete permissions are checked against both role and creator ownership.

## Testing completed

- ANN-001 through ANN-007 pass.
- Existing authentication and Bucket B tests remain covered by the full suite.

## Common bugs encountered

- Department targeting required adding the optional department ID to verified JWT context.

## Rebuild guide

Run `npm install`, then `npm run build` and `npm test` from the repository root.