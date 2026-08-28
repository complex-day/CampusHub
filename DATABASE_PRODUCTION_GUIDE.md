# Database Production Guide

## Current indexes

- `User`: unique `email` from the schema and compound unique `{ collegeId: 1, email: 1 }`.
- `College`: unique `name` from the schema.
- `Department`: unique `{ collegeId: 1, name: 1 }`.
- `Announcement`: `{ collegeId: 1, departmentId: 1, createdAt: -1 }` and text `{ title: "text", description: "text" }`.
- `Event`: `{ collegeId: 1, eventDate: 1 }`, `{ collegeId: 1, departmentId: 1, eventDate: 1 }`, and text `{ title: "text", description: "text" }`.

## Controlled index strategy

Mongoose declares indexes in the model layer, but production index creation must be controlled. Review index diffs in staging, run an explicit migration or approved `syncIndexes` operation during a maintenance window, monitor build duration and Atlas load, and record the resulting index set. Do not run destructive index drops or `dropDatabase` from application startup.

## Startup and connectivity

The backend connects before listening. `GET /health` is a liveness check. `GET /ready` returns 200 only when Mongoose is connected and 503 otherwise. Configure MongoDB Atlas SRV connectivity, TLS, a least-privilege application user, an allowlisted deployment network or private networking, and appropriate connection limits/timeouts for the hosting provider.

## Backup and restore

Enable Atlas continuous backup or scheduled snapshots with a tested retention policy. Document the recovery point objective and recovery time objective, restrict restore permissions, and rehearse restoring to an isolated cluster before any production incident. Never test restore by overwriting the production cluster.

## Integrity gaps

Schemas require ownership fields at persistence level, but orphan prevention, user/content deletion policy, referential cleanup, and cross-collection integrity are not fully tested or enforced. Define deletion/cascade or archival policy and add controlled integrity migrations before relying on deletion workflows at scale.

## Production operating rule

Run migrations and index changes as an explicit release operation, then start the application with production environment validation enabled. Application startup must not perform destructive database operations.
