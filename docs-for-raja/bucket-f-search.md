# Bucket F: Search System

## 1. What Was Built

Authenticated search across announcements and events using MongoDB text indexes.

## 2. Why It Was Built

Users need one searchable place to find relevant campus communication.

## 3. Architecture Decisions

Search uses a dedicated service layer and derives college and department visibility from JWT authentication. Each collection is queried independently and returned as grouped results.

## 4. Database Changes

Added text indexes on `title` and `description` for Announcement and Event while preserving existing tenant and feed indexes.

## 5. API Endpoints

`GET /api/search?q=keyword` requires authentication, trims and validates a query up to 100 characters, and returns up to 20 announcements and 20 events.

## 6. Frontend Components

Added the `/search` page and reusable `SearchResults` component with submit, Enter, clear, loading, error, and empty states.

## 7. Security Considerations

Tenant scope always comes from `request.auth.collegeId`; department results are limited to college-wide and the authenticated department. Empty, repeated, and oversized query values are rejected.

## 8. Testing Completed

Search tests cover SEARCH-001 and SEARCH-002, authentication, validation, college isolation, department visibility, limits, both collection queries, relevance sorting, and safe database failure handling.

## 9. Common Bugs Encountered

No implementation bugs remained after focused and full validation. A missing MongoDB text index in a deployed database would cause the API to return its generic search failure response.

## 10. Rebuild Guide

Install workspace dependencies, run `npm test`, then run `npm run build` from the repository root. Start the frontend and backend using the existing workspace scripts, authenticate, and open `/search`.
