# CampusHub Project Status

## Current Bucket

Bucket A: Foundation & Authentication

## Completed

- Project documentation added: PRD, system design, TDD, and development plan.
- Node.js workspace and TypeScript backend initialized.
- Express API with health endpoint created.
- MongoDB connection helper and tenant-aware User model created.
- Registration, login, logout, JWT verification, and protected session endpoint implemented.
- Authentication tests AUTH-001 through AUTH-005 added.

## Validation

- `npm test` passes: AUTH-001 through AUTH-005.
- `npm run build` passes: backend TypeScript compiles successfully.

## Next Task

Begin Bucket B: Department management and membership after reviewing the current authentication implementation.

## Known Assumptions

- Registration accepts a non-empty `collegeId` until the College management module provides a persisted college lookup.
- JWTs are stored in an httpOnly cookie for browser sessions and may also be supplied as a Bearer token for API clients.
