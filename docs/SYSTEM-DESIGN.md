# CampusHub MVP System Design Document

## 1. System Overview

CampusHub is a multi-tenant campus communication platform designed to replace fragmented WhatsApp-based announcement sharing.

The platform allows colleges, departments, faculty, and students to communicate through structured announcements, events, and searchable content.

Each college operates as an isolated workspace (tenant), ensuring data separation and future scalability.

## 2. Design Goals

### Functional Goals

- Centralized campus communication
- Department-specific announcements
- Event management
- Searchable information
- Role-based access control

### Non-Functional Goals

- Mobile-first experience
- High availability
- Fast search performance
- Secure authentication
- Multi-tenant architecture
- Easy future AI integration

## 3. High-Level Architecture

```text
Browser (Next.js)
        |
       HTTPS
        v
API Gateway (Express Backend)
        |
  +-----+------+-----+
  |            |     |
Auth       Post    Event
Module    Module   Module
  |            |     |
  +------------+-----+
        |
        v
MongoDB Atlas
        |
        v
Cloudinary Poster Storage
```

## 4. Technology Stack

### Frontend

- Next.js
- Tailwind CSS
- ShadCN UI

Next.js provides SEO support, server-side rendering, a large ecosystem, and fast MVP development. Tailwind CSS and ShadCN UI support responsive component development.

### Backend

- Node.js
- Express.js

Express is used for its approachable learning curve, large community, and compatibility with the project skillset.

### Database

- MongoDB Atlas

MongoDB supports flexible schemas and rapid iteration for announcements and events.

### Authentication

- JWT authentication
- Future: Google Login and college email login

### File Storage

- Cloudinary for posters, event images, and announcement images

### Deployment

- Frontend: Vercel
- Backend: Render or Railway
- Database: MongoDB Atlas

## 5. Multi-Tenant Architecture

Every record belongs to exactly one college. CampusHub uses `collegeId` as the tenant boundary.

```json
{
  "collegeId": "college_123"
}
```

Backend queries must derive and enforce the college scope from the authenticated user rather than trusting a client-provided tenant identifier. This prevents cross-college visibility and unauthorized access.

## 6. User Roles

### Student

Can view announcements, view events, and search content. Cannot create announcements or delete content.

### Faculty

Can create announcements, upload posters, and create events.

### Admin

Can manage users, departments, colleges, and content deletion.

## 7. Database Design

### Users Collection

```json
{
  "_id": "user_id",
  "name": "Raja",
  "email": "raja@example.com",
  "passwordHash": "...",
  "role": "student",
  "collegeId": "college_1",
  "departmentId": "dept_1",
  "createdAt": "timestamp"
}
```

### Colleges Collection

```json
{
  "_id": "college_1",
  "name": "Engineering College",
  "description": "...",
  "createdAt": "timestamp"
}
```

### Departments Collection

```json
{
  "_id": "dept_1",
  "collegeId": "college_1",
  "name": "Computer Engineering"
}
```

### Announcements Collection

```json
{
  "_id": "announcement_1",
  "collegeId": "college_1",
  "departmentId": "dept_1",
  "title": "Hackathon Notice",
  "description": "Details...",
  "posterUrl": "cloudinary_url",
  "createdBy": "faculty_id",
  "createdAt": "timestamp"
}
```

### Events Collection

```json
{
  "_id": "event_1",
  "collegeId": "college_1",
  "title": "Tech Fest",
  "description": "...",
  "eventDate": "timestamp",
  "location": "Auditorium"
}
```

All tenant-owned collections require `collegeId`. Indexes should support tenant filtering and the feed sort order, such as compound indexes involving `collegeId` and `createdAt` or `eventDate`.

## 8. API Design

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Announcements

- `POST /api/announcements` - faculty only
- `GET /api/announcements` - latest announcements, tenant filtered

### Events

- `POST /api/events`
- `GET /api/events`

### Search

- `GET /api/search?q=hackathon`

Protected routes require authentication. Role checks and tenant checks are enforced server-side.

## 9. Announcement Creation Flow

```text
Faculty -> Upload Poster -> Cloudinary -> Poster URL
        -> Create Announcement API -> MongoDB -> Announcement Feed
```

## 10. Security Design

- Store passwords only as bcrypt hashes.
- Never store plaintext passwords.
- Sign and verify JWTs using a server-side secret kept outside source control.
- Treat authenticated identity, role, and tenant as server-controlled claims.
- Validate and constrain all request input.
- Escape or sanitize user-generated content before rendering.
- Reject unsafe file types, malformed images, and oversized uploads.
- Prevent NoSQL injection by validating types and never passing raw request objects to MongoDB queries.
- Apply authorization checks before every protected action.

JWT payloads contain the user ID, college ID, and role, but authorization must still be validated against current server state where appropriate.

## 11. Search Design

MVP search uses MongoDB text indexes over announcement and event `title` and `description` fields. Future advanced search may use Elasticsearch.

Search results must remain tenant-scoped and should be indexed and paginated to support the under-two-second target.

## 12. Scalability Considerations

Current target:

- 1 campus
- 500 users

Future target:

- 50 colleges
- 50,000 users

Scaling path:

- Phase 1: single backend and MongoDB cluster
- Phase 2: Redis cache, CDN, and read optimization
- Phase 3: microservices, message queue, and dedicated search engine

## 13. Future AI Integration

Each college may maintain an isolated context repository containing notices, events, policies, and documents. Any future AI assistant must enforce the same college tenant boundary and must never access another college's data.

Potential queries include upcoming events, latest notices, department information, and placement updates.

## 14. MVP Development Order

1. Authentication, user roles, and college setup
2. Departments and announcements
3. Poster uploads and events
4. Search and testing
5. Bucket K: Event RSVP & Participation System

## 15. Bucket K: Event RSVP Architecture & Data Model

### Event Model Extension
`Event` is augmented with an optional capacity field:
- `capacity`: Number (optional, min 1, max 100,000)

### EventRSVP Schema
```typescript
{
  eventId: ObjectId,      // ref: "Event", required, indexed
  userId: ObjectId,       // ref: "User", required, indexed
  collegeId: ObjectId,    // ref: "College", required, indexed
  status: String,         // "confirmed" | "cancelled", default: "confirmed", indexed
  ticketNumber: String,   // e.g. PASS-E14F-K8A9
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
- `{ eventId: 1, userId: 1 }` (unique compound index)
- `{ userId: 1, collegeId: 1, status: 1 }`
- `{ eventId: 1, status: 1 }`

### API Endpoints
- `POST /api/events/:id/rsvp`: Reserve pass and generate ticket (validates tenant, future date, department, and capacity).
- `DELETE /api/events/:id/rsvp`: Cancel pass reservation.
- `GET /api/events/:id/rsvp`: Check current user's RSVP status.
- `GET /api/me/passes`: List active event passes for the student.
- `GET /api/admin/events/:id/attendees`: List confirmed attendees for event organizers and admins.

## Architecture Summary

CampusHub is a multi-tenant campus communication platform built with Next.js, Express, MongoDB Atlas, and Cloudinary. The architecture prioritizes college-level data isolation, role-based access control, scalable announcement delivery, and dynamic event participation while remaining simple enough for a solo developer to build and maintain.

