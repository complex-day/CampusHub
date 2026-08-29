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
- Bucket L0: Beta Testing & User Validation (Completed)

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

## Bucket L0 Decisions

- Beta research focuses specifically on verifying student and faculty preference for CampusHub over noisy WhatsApp groups.
- 5 operational documents created: `BETA_TEST_PLAN.md`, `TESTER_ONBOARDING_GUIDE.md`, `FEEDBACK_FORM.md`, `BUG_TRIAGE_PROCESS.md`, `FEATURE_PRIORITIZATION_FRAMEWORK.md`.
- Feature scoring uses an adapted RICE model combined with Kano classification.

## Current Work

- Bucket L0 framework complete. Ready for Beta tester recruitment or Bucket L (Pathshala Academic Module).

## Memory Rule

Read this file before starting a task. Update it after completing a task whenever a technical decision, completed chunk, or important assumption changes.
