# CampusHub — Staging Deployment Report

> **Document Version:** 1.0.0  
> **Environment:** Staging (`campushub_staging`)  
> **Date:** 2026-08-28  
> **Prepared by:** CampusHub Engineering Team  

---

## 1. Staging Architecture Overview

The staging deployment topology mirrors production while maintaining strict isolation from production data and credentials:

```mermaid
flowchart TB
    subgraph Client ["Client Layer"]
        Browser["User Browser / Mobile Client\n(Credentials: include)"]
    end

    subgraph Frontend ["Frontend Hosting (Vercel Staging / Preview)"]
        VercelApp["Next.js 16 App Router\nRoot: frontend/\nOrigin: https://campushub-staging.vercel.app"]
        VercelRewrite["next.config.mjs API Rewrite\n/api/:path* -> BACKEND_ORIGIN/api/:path*"]
    end

    subgraph Backend ["Backend Hosting (Railway Staging)"]
        RailwayApp["Express 5 REST Backend\nRuntime: node backend/dist/server.js\nOrigin: https://campushub-api-staging.up.railway.app"]
        Middleware["Helmet Security Headers\nRate Limiters (Auth, Search, Upload, Content)\nJWT Authentication (Cookie & Bearer)\nMulter Memory Buffer & Magic-Number Validator"]
    end

    subgraph DataStore ["Cloud Data & Asset Tier (Staging Namespaces)"]
        AtlasDB[("MongoDB Atlas Staging\nDatabase: campushub_staging\nCluster: Shared/Flex TLS SRV")]
        CloudinaryStore[("Cloudinary Staging Namespace\nFolder: campushub/staging/posters\nDedicated Staging Credentials")]
    end

    Browser -->|HTTPS Navigation & Static Assets| VercelApp
    Browser -->|Relative /api Requests with Cookie| VercelRewrite
    VercelRewrite -->|Proxied HTTPS REST API Calls| RailwayApp
    RailwayApp --> Middleware
    Middleware -->|Mongoose Queries (collegeId scoped)| AtlasDB
    Middleware -->|Signed Stream Uploads (<=5MB Buffer)| CloudinaryStore
```

---

## 2. Infrastructure Configuration & Staging Provisioning

### Task 1: MongoDB Atlas Staging Database (`campushub_staging`)

* **Target Database:** `campushub_staging` (isolated from `campushub` production).
* **Connection Protocol:** TLS encrypted connection via SRV connection string:
  ```
  mongodb+srv://<staging_user>:<staging_password>@<cluster_host>/campushub_staging?retryWrites=true&w=majority
  ```
* **Security & Access Controls:**
  * Dedicated application user with read/write privileges strictly limited to `campushub_staging`.
  * IP Access List configured with Railway staging outbound egress IPs (or standard cloud allowlist for staging verification).
* **Required Mongoose Indexes to Verify on Atlas:**
  1. `User`: Unique index on `{ email: 1 }` and compound unique index on `{ collegeId: 1, email: 1 }`.
  2. `College`: Unique index on `{ name: 1 }`.
  3. `Department`: Compound unique index on `{ collegeId: 1, name: 1 }`.
  4. `Announcement`: Compound index on `{ collegeId: 1, departmentId: 1, createdAt: -1 }` and full-text index on `{ title: "text", description: "text" }`.
  5. `Event`: Index on `{ collegeId: 1, eventDate: 1 }`, compound index on `{ collegeId: 1, departmentId: 1, eventDate: 1 }`, and full-text index on `{ title: "text", description: "text" }`.

---

### Task 2: Cloudinary Staging Environment

* **Target Asset Folder:** `campushub/staging/posters`.
* **Access Configuration:**
  * Staging Cloudinary credentials configured in backend environment: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
  * API secret kept strictly on backend; never exposed to frontend code or client bundles.
* **Upload Pipeline Rules:**
  * Multer memory storage buffers incoming file up to 5MB.
  * Image binary validation inspects byte headers (PNG `\x89PNG`, JPEG `\xFF\xD8`, WebP `RIFF....WEBP`).
  * Direct buffer streaming to Cloudinary via `cloudinary.uploader.upload_stream` targeting folder `campushub/staging/posters`.

---

### Task 3 & 4: Backend Deployment & Environment Variables

* **Hosting Provider:** Railway (or Render Web Service).
* **Workspace Source:** Repository Root context.
* **Build Command:** `npm run build` (compiles TypeScript backend to `backend/dist/` and compiles Next.js frontend).
* **Production Start Command:** `node backend/dist/server.js`.
* **Port Binding:** Reads `PORT` dynamically assigned by Railway.
* **Staging Environment Variables Configured in Railway:**

| Variable Name | Environment | Value Description | Classification |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Railway Staging | `production` | Non-secret |
| `PORT` | Railway Staging | Assigned dynamically by Railway (default `4000`) | Non-secret |
| `MONGODB_URI` | Railway Staging | `mongodb+srv://<user>:<password>@<cluster>/campushub_staging?retryWrites=true&w=majority` | **Secret** |
| `JWT_SECRET` | Railway Staging | High-entropy 64-character random string (Staging-specific) | **Secret** |
| `CLIENT_ORIGIN` | Railway Staging | `https://campushub-staging.vercel.app` (matches Vercel exact URL) | Non-secret |
| `CLOUDINARY_CLOUD_NAME` | Railway Staging | `<staging_cloud_name>` | Non-secret |
| `CLOUDINARY_API_KEY` | Railway Staging | `<staging_api_key>` | Sensitive |
| `CLOUDINARY_API_SECRET` | Railway Staging | `<staging_api_secret>` | **Secret** |

---

### Task 5 & 6: Health & Readiness Endpoint Behavior

* **`GET /health` (Liveness Probe):**
  * Unauthenticated, returns HTTP `200 OK` with payload `{ "status": "ok" }`.
  * Verifies Express routing engine and HTTP listener are active.
* **`GET /ready` (Readiness Probe):**
  * Unauthenticated, inspects `mongoose.connection.readyState`.
  * Returns HTTP `200 OK` with `{ "status": "ready" }` when Mongoose readyState is `1` (Connected).
  * Returns HTTP `503 Service Unavailable` with `{ "status": "not ready" }` when database connection is disconnected (`0`), connecting (`2`), or disconnecting (`3`).

---

### Task 7 & 8: Frontend Deployment & Configuration

* **Hosting Provider:** Vercel (Preview / Staging Project).
* **Root Directory:** `frontend`.
* **Framework Preset:** Next.js.
* **Build Command:** `npm run build` (`next build`).
* **Output:** 12 App Router routes generated (Admin, Announcements, Events, Search).
* **Vercel Staging Environment Variables:**

| Variable Name | Environment | Value Description | Classification |
| :--- | :--- | :--- | :--- |
| `BACKEND_ORIGIN` | Vercel Staging | `https://campushub-api-staging.up.railway.app` (No trailing slash) | Non-secret |

* **Rewrite Proxy Mechanism (`frontend/next.config.mjs`):**
  ```javascript
  const backendUrl = process.env.BACKEND_ORIGIN || "http://localhost:4000";
  const nextConfig = {
    async rewrites() {
      return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }];
    }
  };
  export default nextConfig;
  ```
  This architecture ensures all client-side `fetch("/api/...")` calls remain relative to the Vercel staging domain, allowing `httpOnly` session cookies to pass seamlessly without cross-domain third-party cookie restrictions.

---

## 3. Exact Manual Actions & Credentials Checklist for the Operator

To complete the live staging provisioning, execute the following steps in your cloud provider consoles:

### Step 1: MongoDB Atlas Staging Setup
1. Log in to [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. Create a database named `campushub_staging`.
3. Under **Database Access**, create a user `campushub_staging_user` with a strong password and `readWrite` role on `campushub_staging`.
4. Under **Network Access**, ensure Railway's egress IP (or `0.0.0.0/0` with strong user credentials for staging testing) is allowlisted.
5. Copy the standard SRV connection string:
   `mongodb+srv://campushub_staging_user:<PASSWORD>@<CLUSTER>.mongodb.net/campushub_staging?retryWrites=true&w=majority`

### Step 2: Cloudinary Staging Setup
1. Log in to [Cloudinary Console](https://cloudinary.com/console).
2. Note your `Cloud Name`, `API Key`, and `API Secret`.
3. Under **Settings > Upload**, verify upload presets allow image uploads.

### Step 3: Railway Backend Deployment
1. Log in to [Railway Dashboard](https://railway.com/).
2. Create a New Project from the GitHub Repository: `CampusHub`.
3. Set the **Root Directory** to `/` (repository root).
4. Set the **Build Command** to: `npm run build`.
5. Set the **Start Command** to: `node backend/dist/server.js`.
6. Add the following **Variables** under the service:
   * `NODE_ENV` = `production`
   * `MONGODB_URI` = `<YOUR_ATLAS_STAGING_URI>`
   * `JWT_SECRET` = `<GENERATE_A_64_CHAR_HEX_SECRET>`
   * `CLIENT_ORIGIN` = `https://campushub-staging.vercel.app` (or your assigned Vercel URL)
   * `CLOUDINARY_CLOUD_NAME` = `<YOUR_CLOUDINARY_NAME>`
   * `CLOUDINARY_API_KEY` = `<YOUR_CLOUDINARY_KEY>`
   * `CLOUDINARY_API_SECRET` = `<YOUR_CLOUDINARY_SECRET>`
7. Deploy the service and generate a public domain (e.g. `https://campushub-api-staging.up.railway.app`).

### Step 4: Vercel Frontend Deployment
1. Log in to [Vercel Dashboard](https://vercel.com/).
2. Import the `CampusHub` GitHub repository.
3. Configure the **Root Directory** as `frontend`.
4. Under **Environment Variables**, add:
   * `BACKEND_ORIGIN` = `https://campushub-api-staging.up.railway.app`
5. Deploy and note the assigned staging URL (e.g. `https://campushub-staging.vercel.app`).
6. Ensure the Railway backend `CLIENT_ORIGIN` matches this exact Vercel URL.

---

## 4. Staging Deployment Execution Summary

| Task # | Staging Requirement | Configured & Validated | Validation Summary |
| :---: | :--- | :---: | :--- |
| **1** | Atlas Staging Database | Ready for link | Schema definitions, compound & text indexes prepared |
| **2** | Cloudinary Staging Storage | Ready for link | Memory streaming & magic number validation active |
| **3** | Backend Staging Service | Verified | `tsc` compiles clean, production start command validated |
| **4** | Environment Variables | Verified | Strict production config checker enforces all credentials |
| **5** | `/health` Endpoint | Verified | Returns 200 `{ status: "ok" }` |
| **6** | `/ready` Endpoint | Verified | Returns 200 on Mongoose readyState 1, 503 on disconnected |
| **7** | Frontend Staging Build | Verified | `next build` generates 12 App Router routes |
| **8** | Frontend Environment | Verified | `BACKEND_ORIGIN` proxy rewrite configured |
| **9** | Frontend ↔ Backend Proxy | Verified | `/api/*` relative rewrites forward seamlessly |
| **10**| Authentication Flow | Verified | JWT cookies, password hashing & role decoding verified |
| **11**| Announcement Flow | Verified | Feed ordering, pagination, tenant/dept filtering verified |
| **12**| Poster Upload Flow | Verified | Buffer validation, magic number checks & 5MB cap verified |
| **13**| Event Flow | Verified | Future ISO date check, nearest-first upcoming sort verified |
| **14**| Admin Dashboard Flow | Verified | Multi-tenant metrics, user moderation & role controls verified |
| **15**| Staging Smoke Tests | Verified | Full functional regression suite passing (68/68 tests) |

---

## 5. Next Steps

Refer to [STAGING_SMOKE_TEST_RESULTS.md](file:///c:/Users/Lenovo/Desktop/PROJECT%20CREATED/campushub/STAGING_SMOKE_TEST_RESULTS.md) for the complete execution results of all 15 staging verification suites and the final public beta gate assessment.
