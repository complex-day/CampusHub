# Bucket B: College and Department Management

## What was built

- College and Department Mongoose models.
- Admin-only college and department creation APIs.
- College and department read APIs.
- Role middleware for student, faculty, and admin roles.
- Same-college department membership assignment.

## Why it was built

CampusHub needs a tenant boundary before announcements are added. Every department is owned by one college, and users can only join departments in their own college.

## Architecture decisions

- College and Department IDs use MongoDB ObjectId references.
- Department uniqueness is enforced by `{ collegeId, name }`.
- Authenticated tenant identity comes from the verified JWT, not a client-selected tenant.

## Database changes

- Added `College` with required, constrained name and description fields.
- Added `Department` with required college reference and compound unique index.
- Updated `User.collegeId` and `User.departmentId` to ObjectId references.

## API endpoints

- `POST /api/colleges` (admin)
- `GET /api/colleges`
- `GET /api/colleges/:id`
- `POST /api/departments` (admin, same college)
- `GET /api/departments` (authenticated college scope)
- `GET /api/departments/:id` (authenticated college scope)
- `PATCH /api/users/:id/department` (self or same-college admin)

## Frontend components

No frontend components were required for Bucket B.

## Security considerations

- Creation routes require authentication and the admin role.
- Department reads are tenant-scoped.
- Membership assignment validates user existence, department existence, and matching college IDs.
- User IDs, department IDs, and input fields are validated before database operations.

## Testing completed

- Existing AUTH-001 through AUTH-005 tests pass.
- Bucket B tests cover admin creation, role denial, department creation, duplicate departments, valid membership, and cross-college rejection.

## Common bugs encountered

- ObjectId values must be serialized before placing them in JWT payloads or public auth responses.

## Rebuild guide

Run `npm install`, then `npm run build` and `npm test` from the repository root.