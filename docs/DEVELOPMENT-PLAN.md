# CampusHub MVP Development Plan

This plan uses deployable vertical slices. Each chunk should have a clear goal, be testable, be commit-able, and leave the project working.

## Major Buckets

1. Foundation
2. Departments
3. Announcements
4. Posters
5. Events
6. Search
7. Security
8. Admin
9. Testing
10. Deployment

## Four-Week Plan

### Week 1: Foundation

#### Chunk 01: Project Initialization

Deliverables:

- Next.js setup
- Express setup
- MongoDB connection
- Folder structure

Suggested commit: `setup project foundation`

#### Chunk 02: Database Models

Deliverables:

- User model
- College model
- Department model

Suggested commit: `add core database schemas`

#### Chunk 03: Authentication API

Deliverables:

- Register
- Login
- Logout

Tests: AUTH-001, AUTH-002

Suggested commit: `implement authentication api`

#### Chunk 04: JWT Middleware

Deliverables:

- Protect routes
- Verify tokens

Tests: AUTH-005

Suggested commit: `add jwt authorization middleware`

#### Chunk 05: Role System

Deliverables:

- Student role
- Faculty role
- Admin role

Tests: ROLE tests

Suggested commit: `implement role based access`

#### Chunk 06: College Module

Deliverables:

- Create college
- View college

Tests: COL tests

Suggested commit: `implement college management`

### Week 2: Departments And Announcements

#### Chunk 07: Department Module

Deliverable: CRUD departments

Suggested commit: `implement department management`

#### Chunk 08: Department Membership

Deliverables:

- Join department
- Leave department

Suggested commit: `implement department membership`

#### Chunk 09: Announcement Schema And API

Deliverable: create announcement

Suggested commit: `implement announcement api`

#### Chunk 10: Announcement Feed

Deliverables:

- Latest announcements
- Pagination

Suggested commit: `implement announcement feed`

#### Chunk 11: Announcement UI

Deliverable: feed screen

Suggested commit: `build announcement interface`

#### Chunk 12: Announcement Validation

Deliverables:

- Input validation
- Error handling

Suggested commit: `add announcement validations`

### Week 3: Posters And Events

#### Chunk 13: Cloudinary Integration

Deliverable: upload image

Suggested commit: `integrate cloudinary uploads`

#### Chunk 14: Poster Attachment

Deliverable: link uploads to announcements

Suggested commit: `support poster attachments`

#### Chunk 15: Event Schema And API

Deliverable: create event

Suggested commit: `implement event management api`

#### Chunk 16: Event Feed

Deliverable: upcoming events

Suggested commit: `implement event feed`

#### Chunk 17: Event UI

Deliverable: event screens

Suggested commit: `build event interface`

#### Chunk 18: Event Validation

Deliverables:

- Date validation
- Required fields

Suggested commit: `add event validations`

### Week 4: Search, Security, And Release

#### Chunk 19: Search Backend

Deliverables:

- Search announcements
- Search events

Suggested commit: `implement search api`

#### Chunk 20: Search UI

Deliverable: search page

Suggested commit: `build search interface`

#### Chunk 21: Security Hardening

Deliverables:

- XSS protection
- Injection protection

Suggested commit: `add security protections`

#### Chunk 22: Admin Dashboard

Deliverables:

- User list
- College list
- Department list

Suggested commit: `build admin dashboard`

#### Chunk 23: Testing Sprint

Deliverables:

- Execute TDD suite
- Fix failures

Suggested commit: `complete test coverage`

#### Chunk 24: Production Deployment

Deliverables:

- Vercel
- Render or Railway
- MongoDB Atlas

Suggested commit: `deploy mvp to production`

## Daily Task Completion Checklist

Before considering a chunk complete:

- Requirements and acceptance criteria checked
- Dependencies and affected modules identified
- Tests added or updated
- Implementation completed
- Focused tests pass
- Security implications reviewed
- Documentation updated
- Working tree is understandable and ready for the next task
