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

## Bucket B Decisions

- College and Department are Mongoose models with validated fields and ObjectId references.
- Department names are unique within a college through a compound MongoDB index.
- Department reads and membership updates enforce the authenticated user's college boundary.
- College and department creation require the admin role.

## Bucket C Decisions

- Announcements use a tenant and optional department reference, plus a required creator reference.
- Feed visibility is limited to college-wide announcements and the authenticated user's department.
- Feed pagination defaults to 10 items and is capped at 50 items.
- Faculty can delete only their own announcements; admins can delete announcements in their college.

## Current Work

- Bucket F: Search System

## Bucket D Decisions

- Poster uploads use Multer memory storage so extension, MIME, size, and image signature/content checks happen before Cloudinary receives bytes.
- `POST /api/uploads/poster` requires authentication and the faculty or admin role, and returns `{ posterUrl }` after Cloudinary upload.
- Supported poster formats are JPG, JPEG, PNG, and WebP; the maximum upload size is 5MB.
- Announcements keep an optional validated `posterUrl`; the existing announcement creation and feed APIs remain compatible with requests that omit it.

## Bucket E Decisions

- Events require title, description, college, future ISO event date, and location; poster URL and department are optional.
- Event reads derive college scope and department visibility from the authenticated token. College-wide events use `departmentId: null` and department events are visible only to matching users.
- Faculty can edit or delete only their own events. Admins can manage any event in their college. Client college IDs are checked but never used to widen tenant scope.
- Event feeds filter future dates and sort by `eventDate` ascending. Compound indexes support college/date and college/department/date access.
- Event creation reuses the existing `/api/uploads/poster` flow and does not introduce another upload system.

## Memory Rule

Read this file before starting a task. Update it after completing a task whenever a technical decision, completed chunk, or important assumption changes.
