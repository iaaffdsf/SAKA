---
name: Prisma SQLite setup
description: How Prisma + SQLite is configured in this monorepo, including env var naming and generated client location.
---

## Rule
Use `SQLITE_DATABASE_URL` (not `DATABASE_URL`) for the SQLite connection string. `DATABASE_URL` is runtime-managed by Replit and always points to PostgreSQL.

## Setup
- Schema: `database/prisma/schema.prisma`
- Generator output: `../src/generated/client` → `database/src/generated/client/`
- Dev DB file: `database/prisma/dev.db` (created by `prisma db push`)
- Env var set in Replit shared env: `SQLITE_DATABASE_URL=file:/home/runner/workspace/database/prisma/dev.db`

## Why
`DATABASE_URL` is in Replit's list of runtime-managed keys — it cannot be overridden and always resolves to a Postgres connection string. A separate `SQLITE_DATABASE_URL` env var avoids this conflict.

## How to apply
After any schema change:
1. `pnpm --filter @workspace/database run push` — syncs schema to dev.db
2. `pnpm --filter @workspace/database run generate` — regenerates `database/src/generated/client/`
3. Restart the backend workflow so it picks up new types

The `database/src/generated/` directory is gitignored and must be regenerated after clone.
