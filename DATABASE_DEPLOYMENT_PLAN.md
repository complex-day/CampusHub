# Database Deployment Plan

## Atlas target

Use MongoDB Atlas for the MVP. Start with the Atlas Free tier at $0 when its limits and availability are acceptable; use Atlas Flex at approximately $8-$30/month for a small production workload; move to a Dedicated cluster from about $56.94/month when sustained traffic, workload isolation, or higher availability requires it. Verify current regional pricing before purchase.

Use production database name `campushub` in the SRV URI, for example:

`mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority`

Use TLS through the SRV connection. Store the URI only as Railway `MONGODB_URI`, never in source control or frontend configuration.

## Access and tenant safety

Create a dedicated least-privilege application database user. Keep administrative and restore identities separate. Prefer private networking/peering when supported by the selected provider; otherwise use a narrow, documented deployment egress allowlist. Do not use `0.0.0.0/0` as a permanent production rule.

Every tenant-owned query must remain scoped by the authenticated user's `collegeId`. Review connection pool limits and timeouts against the Railway plan and Atlas tier before scaling instances.

## Indexes and migrations

The current required index set is:

- User: unique `email`; compound unique `{ collegeId: 1, email: 1 }`.
- College: unique `name`.
- Department: unique `{ collegeId: 1, name: 1 }`.
- Announcement: `{ collegeId: 1, departmentId: 1, createdAt: -1 }` and text `{ title: "text", description: "text" }`.
- Event: `{ collegeId: 1, eventDate: 1 }`, `{ collegeId: 1, departmentId: 1, eventDate: 1 }`, and text `{ title: "text", description: "text" }`.

Review model/index diffs in staging. Apply indexes through an explicit, approved migration or controlled `syncIndexes` operation during a maintenance window, monitor Atlas load and build duration, and record the resulting index set. Do not create or drop indexes destructively from application startup. Never run `dropDatabase` in startup or deployment hooks.

Define a migration policy with versioned, reviewed, reversible operations where possible. The application must start against the existing production schema without running destructive migrations automatically.

## Backups, monitoring, and recovery

Enable continuous backup/PITR or scheduled snapshots with a documented retention period. Restrict restore permissions. Alert on CPU, memory, storage, connections, replication health, query latency, failed authentication, and backup failures.

Before production release, restore a backup to an isolated cluster and verify application connectivity and representative reads. Never test recovery by overwriting production. Set an MVP target RPO of 15 minutes or the selected Atlas capability's nearest documented limit, and an RTO of 2 hours; confirm both with a timed restore exercise and revise if the purchased tier cannot meet them.

## Open integrity work

Orphan prevention, deletion/cascade or archival policy, and cross-collection integrity are not fully tested. Close those gaps before relying on deletion workflows at scale. Production smoke tests, backup/restore rehearsal, and controlled index migration remain open release work.

Official reference: [MongoDB Atlas pricing](https://www.mongodb.com/cloud/atlas/pricing).
