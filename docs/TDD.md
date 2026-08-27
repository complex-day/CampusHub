# CampusHub MVP - Test Driven Development (TDD)

## Purpose

This document defines the tests that must pass before CampusHub MVP is considered complete.

Implementation should be written only after these tests are defined.

---

# 1. Authentication Module

## AUTH-001: Student Registration

### Given

A new student provides:

- Name
- Email
- Password
- College

### When

Registration request is submitted.

### Then

- User record is created.
- Password is hashed.
- User receives unique ID.

### Failure Cases

- Duplicate email
- Invalid email
- Missing password
- Missing college

---

## AUTH-002: Login Success

### Given

A registered user exists.

### When

Correct credentials are submitted.

### Then

- JWT/session generated.
- Login succeeds.
- User profile returned.

---

## AUTH-003: Login Failure

### Given

A registered user exists.

### When

Wrong password is submitted.

### Then

- Login fails.
- HTTP 401 returned.

---

## AUTH-004: Session Persistence

### Given

User logged in.

### When

Page refresh occurs.

### Then

- Session remains active.

---

## AUTH-005: Unauthorized Access

### Given

No authentication token.

### When

Protected endpoint is accessed.

### Then

- HTTP 401 returned.

---

# 2. College Isolation Module

## COL-001: Data Isolation

### Given

College A and College B exist.

### When

Student from College A requests announcements.

### Then

Only College A announcements appear.

---

## COL-002: Cross-College Access Block

### Given

Student belongs to College A.

### When

Student requests College B data.

### Then

Access denied.

---

## COL-003: College Creation

### Given

Admin user.

### When

New college is created.

### Then

College record stored successfully.

---

# 3. Department Module

## DEP-001: Create Department

### Given

Admin user.

### When

Department created.

### Then

Department stored successfully.

---

## DEP-002: Duplicate Department

### Given

Department already exists.

### When

Same department created again.

### Then

Validation error returned.

---

## DEP-003: Join Department

### Given

Student exists.

### When

Student joins department.

### Then

Membership recorded.

---

## DEP-004: Invalid Department

### Given

Department does not exist.

### When

Student attempts joining.

### Then

Request rejected.

---

# 4. Announcement Module

## ANN-001: Create Announcement

### Given

Faculty account.

### When

Announcement submitted.

### Then

Announcement stored.

---

## ANN-002: Missing Title

### Given

Faculty account.

### When

Title empty.

### Then

Validation error.

---

## ANN-003: Missing Description

### Given

Faculty account.

### When

Description empty.

### Then

Validation error.

---

## ANN-004: Student Cannot Create Announcement

### Given

Student account.

### When

Announcement submitted.

### Then

Access denied.

---

## ANN-005: Announcement Feed

### Given

Multiple announcements exist.

### When

Feed requested.

### Then

Newest announcements shown first.

---

## ANN-006: Announcement Pagination

### Given

500 announcements.

### When

Feed requested.

### Then

Results paginated.

---

## ANN-007: Announcement Deletion

### Given

Admin user.

### When

Announcement deleted.

### Then

Announcement removed.

---

# 5. Poster Upload Module

## UPLOAD-001: Valid Image Upload

### Given

Faculty account.

### When

PNG image uploaded.

### Then

Image stored successfully.

---

## UPLOAD-002: JPG Upload

### Given

Faculty account.

### When

JPG uploaded.

### Then

Upload succeeds.

---

## UPLOAD-003: Invalid File Type

### Given

Faculty account.

### When

EXE file uploaded.

### Then

Upload rejected.

---

## UPLOAD-004: Oversized File

### Given

Faculty account.

### When

File exceeds size limit.

### Then

Upload rejected.

---

## UPLOAD-005: Broken File

### Given

Corrupted image.

### When

Upload attempted.

### Then

Upload rejected.

---

# 6. Event Module

## EVENT-001: Create Event

### Given

Faculty account.

### When

Event created.

### Then

Event stored successfully.

---

## EVENT-002: Event Validation

### Given

Faculty account.

### When

Required fields missing.

### Then

Validation error.

---

## EVENT-003: Upcoming Events

### Given

Past and future events.

### When

Upcoming feed requested.

### Then

Only future events displayed.

---

## EVENT-004: Event Sorting

### Given

Multiple future events.

### When

Event feed loaded.

### Then

Nearest event shown first.

---

# 7. Search Module

## SEARCH-001: Announcement Search

### Given

Announcements exist.

### When

Keyword searched.

### Then

Relevant announcements returned.

---

## SEARCH-002: Event Search

### Given

Events exist.

### When

Keyword searched.

### Then

Relevant events returned.

---

## SEARCH-003: Empty Search

### Given

No keyword.

### When

Search executed.

### Then

Validation response returned.

---

## SEARCH-004: Nonexistent Query

### Given

No matching content.

### When

Search executed.

### Then

Empty results returned.

---

# 8. Authorization Module

## ROLE-001: Student Permissions

Student can:

- View announcements
- View events
- Search content

Student cannot:

- Create announcements
- Delete content

---

## ROLE-002: Faculty Permissions

Faculty can:

- Create announcements
- Create events
- Upload posters

Faculty cannot:

- Manage colleges

---

## ROLE-003: Admin Permissions

Admin can:

- Manage users
- Manage colleges
- Manage departments
- Delete content

---

# 9. Security Tests

## SEC-001: Password Hashing

Verify:

- Plain text passwords never stored.

---

## SEC-002: JWT Tampering

Given:

Modified JWT token.

Expected:

Access denied.

---

## SEC-003: SQL/NoSQL Injection

Test payloads:

```text
' OR 1=1
$ne:null
```

Expected:

Request rejected.

---

## SEC-004: XSS Prevention

Input:

```html
<script>alert("hack")</script>
```

Expected:

Sanitized output.

---

# 10. Performance Tests

## PERF-001: Feed Response

Requirement:

- Under 2 seconds

For:

- 10,000 announcements

---

## PERF-002: Search Response

Requirement:

- Under 2 seconds

For:

- 50,000 records

---

## PERF-003: Concurrent Users

Requirement:

- 500 simultaneous users

without server crash.

---

# 11. Database Integrity Tests

## DB-001: Orphan Announcement Prevention

If department deleted:

- Related announcements handled correctly.

---

## DB-002: Orphan Event Prevention

If faculty deleted:

- Events remain valid.

---

## DB-003: College Isolation Validation

Every record must contain:

```json
{
  "collegeId": "required"
}
```

No record should exist without college ownership.

---

# 12. Memory & Resource Tests

## MEM-001

Repeated login requests:

- No memory growth.

---

## MEM-002

Repeated search requests:

- No memory leak.

---

## MEM-003

Repeated image uploads:

- Resources released correctly.

---

# Definition of Done

CampusHub MVP is complete only when:

- All Authentication tests pass.
- All Authorization tests pass.
- All College Isolation tests pass.
- All Announcement tests pass.
- All Event tests pass.
- All Search tests pass.
- All Security tests pass.
- All Performance requirements pass.
- No memory leaks detected.
- Test coverage >= 80%.

Expected Test Count: ~50+
Expected MVP Target Users: First Campus Deployment
Expected Architecture: Multi-Tenant College Workspace System
