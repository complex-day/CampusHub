# Bucket G: Security & Hardening

## 1. What Was Built

CampusHub now has global Helmet security headers, route-specific request rate limiting, strict input validation, stored-XSS encoding, NoSQL/operator-injection defenses, validated JWT claims, stronger registration passwords, production configuration checks, safe global errors, and sanitized failure logging.

## 2. Why It Was Built

Bucket G protects authentication, tenant data, content creation, search, and poster uploads from common web attacks and accidental sensitive-data exposure while preserving the existing API paths and response contracts.

## 3. Architecture Decisions

- Security middleware is centralized in `backend/src/middleware/securityMiddleware.ts`.
- Errors are normalized by `backend/src/middleware/errorMiddleware.ts`.
- Zod schemas remain at controller/service boundaries.
- Tenant scope is always derived from authenticated JWT claims.
- Rate-limit reset is exposed for deterministic tests; production limits remain active by default.

## 4. Database Changes

No migrations or schema changes were required. Department membership reads now include the authenticated `collegeId` in both user and department queries.

## 5. API Endpoints

Existing endpoints are preserved. Rate limits protect register/login, search, poster upload, announcement creation, and event creation. Invalid JSON, invalid multipart data, malformed JWTs, unsafe input, and weak passwords receive safe validation responses.

## 6. Frontend Components

No frontend components changed. Existing clients continue using the same routes, cookies, Bearer authentication, and response shapes.

## 7. Security Considerations

- JWT expiration remains one day and required claims are type- and role-validated.
- Passwords are bcrypt-hashed and never returned.
- Text fields are encoded before storage and unknown request fields are rejected.
- External IDs cannot be objects or MongoDB operators.
- Poster extension, MIME, memory size, and image signature checks remain enforced.
- Production requires JWT, MongoDB, and Cloudinary credentials.
- Error responses omit stacks, database errors, provider details, secrets, tokens, and passwords.

## 8. Testing Completed

`security.test.ts` covers password hashing and complexity, JWT tampering and invalid roles, operator-shaped search input, security headers, XSS encoding, rate limiting, malformed JSON, and password non-disclosure. The complete backend suite passes 43 tests, and the TypeScript build passes.

## 9. Common Bugs Encountered

URL protocol validation initially allowed a thrown `new URL()` error to become a 500 response. It was changed to a non-throwing validator so malformed URLs return 400 validation responses.

## 10. Rebuild Guide

1. Install dependencies with `npm install` in `backend`.
2. Set production variables: `JWT_SECRET`, `MONGODB_URI`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
3. Run `npm run test --prefix backend`.
4. Run `npm run build --prefix backend`.
5. Start development with `npm run dev --prefix backend`.

Bucket G is complete. The next bucket is Bucket H: Admin Dashboard.
