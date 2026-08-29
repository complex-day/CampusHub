# CampusHub Agent Memory

## Tech Stack

- Frontend: Next.js
- UI: Tailwind CSS and ShadCN UI
- Backend: Node.js and Express.js
- Language: TypeScript
- Database: MongoDB Atlas
- Authentication: JWT and bcrypt
- File storage: Cloudinary
- Deployment: Vercel frontend with Render or Railway backend

## Coding Standards

- Use TypeScript with strict compiler settings.
- Follow separation of concerns and the existing module structure.
- Keep tenant boundaries enforced server-side.
- Validate all external input before use.
- Never store plaintext passwords or expose password hashes.
- Add focused unit, integration, edge-case, and security tests.
- Keep each task buildable and independently commit-able.

## Important Decisions

- Each tenant is a college workspace identified by `collegeId`.
- Tenant scope must come from authenticated server-side identity, not an untrusted client value.
- JWT sessions use an httpOnly cookie; Bearer tokens are accepted for API clients.
- MongoDB indexes must support tenant filtering and feed ordering.
- MVP search uses MongoDB text indexes.
- V1 excludes chat, AI assistant, anonymous posts, payments, attendance, LMS, exams, and social networking.

## Completed Chunks

- Documentation foundation: PRD, system design, TDD, development plan, and project status.
- Bucket A: Foundation and authentication.
  - Node.js workspace and TypeScript backend
  - MongoDB connection helper
  - Tenant-aware User model
  - Registration with bcrypt hashing
  - Login, logout, JWT verification, and protected session endpoint
  - AUTH-001 through AUTH-005 tests
- Bucket B: College management, department management, department membership, and role middleware
- Bucket C: Announcement System
- Bucket D: Poster Upload System
- Bucket E: Event Management System
- Bucket F: Search System
- Bucket G: Security & Hardening
- Bucket H: Admin Dashboard
- Bucket I: Testing & Quality Assurance
- Bucket J0: Production Readiness
- Kintsugi Academic UI Redesign
- Bucket K: Event RSVP & Participation System (Completed)

## Bucket K Decisions

- `EventRSVP` is a tenant-scoped Mongoose model referencing `eventId`, `userId`, and `collegeId`.
- Uniqueness is enforced via compound unique index `{ eventId: 1, userId: 1 }`, preventing duplicate active RSVP records.
- Event participation uses `confirmed` and `cancelled` state transitions; cancellation frees event capacity.
- `Event` model optionally accepts `capacity` (positive integer). When set, `POST /api/events/:id/rsvp` rejects with HTTP 409 Conflict if confirmed count reaches capacity.
- Ticket generation format: `PASS-{eventLast4}-{randomBase36}`.
- Student passbook endpoint `GET /api/me/passes` returns populated active passes for the authenticated user.
- Admin attendee visibility endpoint `GET /api/admin/events/:id/attendees` is restricted to admins and the event's creator faculty.
- Multi-tenant isolation and department visibility rules apply to all RSVP operations server-side.
- Full 12-test suite (`RSVP-001` to `RSVP-012`) validates all functional, capacity, and tenant boundary constraints.

## Current Work

- Bucket K completed & validated. Ready for next sprint.

## Memory Rule

Read this file before starting a task. Update it after completing a task whenever a technical decision, completed chunk, or important assumption changes.
