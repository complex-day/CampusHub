# Bucket A: Foundation & Authentication

## 1. What Was Built

Bucket A established the CampusHub backend foundation and authentication flow.

Completed:

- Node.js workspace with npm workspaces
- Strict TypeScript backend configuration
- Express API application
- Health-check endpoint
- MongoDB connection helper
- Tenant-aware User model
- User registration
- bcrypt password hashing
- User login
- JWT token generation and verification
- httpOnly cookie-based sessions
- Bearer token support for API clients
- Logout endpoint
- Protected current-user endpoint
- Authentication tests AUTH-001 through AUTH-005

## 2. Why It Was Built

CampusHub needs a secure identity layer before departments, announcements, events, and administration can be implemented.

Authentication provides:

- A known user identity
- Role information for authorization
- College ownership for tenant isolation
- Persistent browser sessions
- Protected API access

This foundation allows later modules to enforce student, faculty, and admin permissions consistently.

## 3. Architecture Decisions

### Backend Structure

The backend uses Node.js, Express, and TypeScript as specified by the system design.

Current structure:

```text
backend/
├── src/
│   ├── app.ts
│   ├── auth/
│   │   ├── auth.middleware.ts
│   │   ├── auth.routes.ts
│   │   └── auth.service.ts
│   ├── config.ts
│   ├── db.ts
│   ├── models/
│   │   └── user.model.ts
│   ├── server.ts
│   └── test/
│       ├── auth.test.ts
│       └── setup.ts
├── .env.example
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Authentication

- Passwords are hashed with bcrypt before persistence.
- JWTs contain `userId`, `collegeId`, and `role`.
- Browser sessions use an httpOnly cookie named `campushub_token`.
- API clients may send the JWT in an `Authorization: Bearer <token>` header.
- JWT secrets are loaded from environment configuration.
- Production startup requires `JWT_SECRET` to be configured.

### Tenant Boundary

Users contain a required `collegeId`. Future tenant-owned queries must derive college scope from authenticated server-side identity instead of trusting a client-supplied college identifier.

## 4. Database Changes

### Users Collection

The User model contains:

- `name`
- `email`
- `passwordHash`
- `role`
- `collegeId`
- Optional `departmentId`
- `createdAt`

The password hash is excluded from normal queries with `select: false`. Email values are normalized to lowercase. A unique email index prevents duplicate accounts.

### MongoDB Connection

The connection is configured with `MONGODB_URI`. The application connects before starting the HTTP server.

Example environment configuration is provided in `backend/.env.example`.

## 5. API Endpoints

### `POST /api/auth/register`

Creates a student account.

Accepted fields:

- `name`
- `email`
- `password`
- `collegeId`
- Optional `departmentId`

Responses:

- `201` for successful registration
- `400` for invalid input
- `409` for an already registered email

Password hashes are never returned.

### `POST /api/auth/login`

Authenticates a user and sets the httpOnly JWT session cookie.

Responses:

- `200` for successful login
- `400` for invalid input
- `401` for invalid credentials

### `POST /api/auth/logout`

Clears the authentication cookie and returns `204`.

### `GET /api/me`

Protected endpoint used to verify the current authenticated session.

Responses:

- `200` with JWT identity claims
- `401` when authentication is missing, invalid, or expired

### `GET /health`

Returns the service health status.

## 6. Frontend Components

No frontend components were added in Bucket A. The frontend workspace is reserved for the Next.js implementation in a later bucket.

## 7. Security Considerations

Implemented:

- bcrypt password hashing with a cost factor of 12
- No plaintext password storage
- Password hash excluded from standard User queries
- JWT signature verification
- JWT expiration after one day
- httpOnly session cookie
- `secure` cookie flag in production
- SameSite cookie protection
- Input validation with Zod
- JSON request body size limit of 1 MB
- CORS configured with credentials and an explicit client origin
- Generic invalid-login response to avoid revealing whether an email exists
- Authentication middleware for protected routes

Remaining security work belongs to later buckets:

- Role authorization middleware
- College and department authorization checks
- NoSQL injection tests
- XSS handling for user-generated content
- File upload validation
- Rate limiting
- Production secret and deployment configuration

## 8. Testing Completed

The following TDD cases were added and pass:

- AUTH-001: Student registration
- AUTH-002: Login success
- AUTH-003: Login failure with HTTP 401
- AUTH-004: Session persistence across a subsequent request
- AUTH-005: Unauthorized access with HTTP 401

Validation commands:

```powershell
npm test
npm run build
```

Both commands completed successfully for Bucket A.

## 9. Common Bugs Encountered

### Zod Catch Variable Type Error

TypeScript treats caught errors as `unknown`. The validation helper was changed into a type guard so Zod issues could be accessed safely.

### Missing Supertest Types

The backend required `@types/supertest` for the strict TypeScript build.

### Environment Configuration

The server requires a valid MongoDB connection string for runtime startup. Production also requires a strong `JWT_SECRET`.

## 10. Rebuild Guide

From the CampusHub project root:

```powershell
npm install
Copy-Item backend\.env.example backend\.env
```

Edit `backend/.env`:

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_ORIGIN=http://localhost:3000
NODE_ENV=development
```

Run tests and compile the backend:

```powershell
npm test
npm run build
```

Start the API:

```powershell
npm run dev:backend
```

The API runs at:

```text
http://localhost:4000
```

Health check:

```text
http://localhost:4000/health
```

The next planned work is Bucket B: Department Management & Membership.
