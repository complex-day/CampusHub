# Bucket E: Event Management System

## 1. What Was Built

Created the Event model, authenticated CRUD API, upcoming event feed, department targeting, role and ownership permissions, validation, and frontend event list/detail/create screens.

## 2. Why It Was Built

Events are a core CampusHub communication object and need a structured, searchable-ready home separate from announcements.

## 3. Architecture Decisions

Events follow the existing Express controller/router and Mongoose model patterns. Tenant and visibility filters are derived from `request.auth`; the client cannot choose a different college scope. Feed queries filter future dates and sort nearest first.

## 4. Database Changes

Added the `Event` collection with required title, description, college, event date, location, creator, and timestamps. Department and poster URL are optional. Indexes cover college/date and college/department/date access patterns.

## 5. API Endpoints

- `POST /api/events` creates an event for faculty or admins.
- `GET /api/events` returns visible upcoming events nearest first.
- `GET /api/events/:id` returns one visible event.
- `PATCH /api/events/:id` updates an owned faculty event or any same-college admin event.
- `DELETE /api/events/:id` deletes an owned faculty event or any same-college admin event.

## 6. Frontend Components

`frontend/app/events/page.jsx` loads the feed, auth, and departments. `EventCard.jsx` renders event details and links to the detail page. `CreateEventForm.jsx` uploads an optional poster through the existing `PosterUpload` component before submitting the event. `frontend/app/events/[id]/page.jsx` renders the authenticated detail view.

## 7. Security Considerations

All endpoints require JWT authentication. Students cannot create, edit, or delete. College IDs are validated against authenticated claims, departments must belong to that college, and department-specific reads require a matching user department. URLs and all event fields are validated with Zod.

## 8. Testing Completed

`event.test.ts` covers EVENT-001 through EVENT-004, unauthenticated access, student role blocking, invalid dates and URLs, invalid departments, ownership, admin permissions, department targeting, and college isolation. Focused event tests pass.

## 9. Common Bugs Encountered

The first PATCH schema accidentally required every create field. It was changed to a strict partial schema with a non-empty-body check, and the focused suite now verifies title-only updates.

## 10. Rebuild Guide

Run `npm install`, then `npm test` and `npm run build` from the repository root. Configure the existing MongoDB, JWT, and Cloudinary environment variables when running against real services. Start the backend with `npm run dev:backend`.
