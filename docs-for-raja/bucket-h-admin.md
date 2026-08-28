# Bucket H: Admin Dashboard

## 1. What Was Built
Tenant-scoped admin APIs and frontend pages for metrics, users, colleges, departments, announcements, and events.

## 2. Why It Was Built
Administrators need one protected workspace to monitor campus data, manage access, maintain structure, and moderate content.

## 3. Architecture Decisions
Admin routes are isolated under `/api/admin` and compose `requireAuth` with `requireRole("admin")`. The current token model has no platform-admin claim, so administrators manage only their authenticated college.

## 4. Database Changes
No migrations or schema changes were required. Existing models are queried with college scope and safe projections.

## 5. API Endpoints
- `GET /api/admin/metrics`
- `GET /api/admin/users`, `PATCH /api/admin/users/:id/role`
- `GET|POST /api/admin/colleges`, `PATCH /api/admin/colleges/:id`
- `GET|POST /api/admin/departments`, `PATCH /api/admin/departments/:id`
- `GET|DELETE /api/admin/announcements` and `/:id`
- `GET|DELETE /api/admin/events` and `/:id`

## 6. Frontend Components
`AdminLayout` provides credentialed access checks and navigation. `DataTable` renders reusable empty-aware tables. Dashboard, users, colleges, departments, announcements, and events pages provide the required workflows.

## 7. Security Considerations
All admin endpoints require authentication and the admin role. Tenant scope comes from JWT identity, role updates use strict enums, search input is escaped before regex construction, pagination is bounded, and password hashes are never selected or returned.

## 8. Testing Completed
`backend/src/test/admin.test.ts` covers 401/403 protection, metrics, search/filter/pagination, invalid roles, safe role updates, moderation deletion, tenant isolation, and department scope using mocked Mongoose methods.

## 9. Common Bugs Encountered
The initial focused test used an unmocked Mongoose lookup for a foreign tenant and timed out. The test now explicitly mocks that lookup, keeping the suite network-free and deterministic.

## 10. Rebuild Guide
Run `npm --workspace backend test -- src/test/admin.test.ts`, then `npm test` and `npm run build` from the repository root. Open `/admin` with an authenticated admin session.