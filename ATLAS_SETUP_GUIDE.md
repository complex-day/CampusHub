# MongoDB Atlas Setup Guide

## Environments

Create separate Atlas databases in an approved cluster plan:

- Staging: `campushub_staging`
- Production: `campushub`

Use separate application users and credentials. Do not point staging at production data.

## Setup

1. Create or select the approved Atlas project and cluster.
2. Enable TLS and use the SRV connection form:

   `mongodb+srv://<app-user>:<url-encoded-password>@<cluster-host>/<database>?retryWrites=true&w=majority`

3. Create a dedicated application database user with the minimum read/write privileges required for its database. Do not use the Atlas project owner or an unrestricted administrative user from Railway.
4. Restrict Network Access to Railway's documented egress addresses where practical. Prefer private networking/peering or a private endpoint for the production path. Do not use `0.0.0.0/0` as a permanent production rule.
5. Configure backups, point-in-time recovery (PITR) where supported by the selected tier, retention, restore permissions, and alerts for availability, storage, connections, replication lag, and unusual load.
6. Store the complete URI only in Railway's secret configuration as `MONGODB_URI`. URL-encode reserved password characters.

## Current declared indexes

Mongoose creates `_id` indexes automatically. The application models currently declare:

- `User`: unique `{ collegeId: 1, email: 1 }`.
- `College`: unique `name` field index.
- `Department`: unique `{ collegeId: 1, name: 1 }`.
- `Announcement`: `{ collegeId: 1, departmentId: 1, createdAt: -1 }` and text `{ title: "text", description: "text" }`.
- `Event`: `{ collegeId: 1, eventDate: 1 }`, `{ collegeId: 1, departmentId: 1, eventDate: 1 }`, and text `{ title: "text", description: "text" }`.

Review the live Atlas index list against these declarations. Index names and existing historical indexes may differ.

## Controlled index strategy

Before release, an owner should compare model declarations with `listIndexes()` in an isolated or staging database, review query plans, and approve any additions or removals. Run the approved MongoDB shell/Atlas operation during a controlled change window, or add migration tooling before release. This repository has no dedicated migration/index script, so do not invent a startup command and do not drop indexes automatically at application startup. Test index builds on staging first and monitor load.

Conceptual validation only, to be run by an authorized operator against the intended database:

```javascript
db.getName()
db.users.getIndexes()
db.users.find({ collegeId: ObjectId("<college>") }).sort({ createdAt: -1 }).explain("executionStats")
db.announcements.find({ collegeId: ObjectId("<college>"), departmentId: null }).sort({ createdAt: -1 }).explain("executionStats")
db.events.find({ collegeId: ObjectId("<college>") }).sort({ eventDate: 1 }).explain("executionStats")
```

Use the appropriate collection names and authorized Atlas shell context. These examples are read-only; do not run destructive commands against production without an approved change and backup.

## Validation checklist

- [ ] Railway can establish the TLS SRV connection to the intended database.
- [ ] `/ready` is 503 before connection and 200 after connection.
- [ ] Two test colleges remain isolated in announcements, events, search, membership, and admin operations.
- [ ] Duplicate email and department constraints behave as expected.
- [ ] Backup/PITR retention and alert delivery are verified.
- [ ] A restore is tested into an isolated target and representative reads succeed.
- [ ] No application startup path performs destructive migrations or index drops.
