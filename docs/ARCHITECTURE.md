# Architecture

## Overview

This platform is structured as a **pnpm monorepo** with four core workspace packages and two Replit artifact shells that handle routing/preview infrastructure.

```
.
├── frontend/          # React 19 + Vite 7 + Tailwind CSS v4 (UI)
├── backend/           # Node.js + Express 5 + WebSocket (API)
├── shared/            # TypeScript types and utilities (no runtime deps)
├── database/          # Prisma schema + SQLite (dev) / Postgres (prod)
├── docs/              # Architecture and development documentation
│
├── artifacts/         # Replit routing shells (do not add source here)
│   ├── ai-ide/        # ← points to @workspace/frontend
│   └── api-server/    # ← points to @workspace/backend
│
└── lib/               # Legacy shared libraries (kept for compatibility)
```

---

## Package responsibilities

### `frontend/`

| Concern | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 7 |
| Styling | Tailwind CSS v4 (Vite plugin, no PostCSS) |
| Routing | Wouter v3 |
| State | React Context + hooks (TanStack Query added per feature) |
| Types | TypeScript 5.9 strict mode |

Internal folder structure mirrors domain boundaries:

```
src/
  components/     # Pure UI atoms and molecules
    layout/       # Page-level shells (Header, Footer, MainLayout)
    ui/           # Design-system primitives (Button, Badge, …)
  pages/          # Route components — one file per route
  hooks/          # Custom React hooks
  contexts/       # React Context providers
  services/       # API client wrappers (fetch calls)
  utilities/      # Pure helper functions (cn, formatDate, …)
  types/          # Frontend-specific TypeScript types
```

**Rules:**
- `pages/` components never call `fetch` directly — they delegate to `services/`.
- `utilities/` is pure (no React imports).
- Design tokens live in `src/index.css` under `@theme {}`.

---

### `backend/`

| Concern | Technology |
|---|---|
| Runtime | Node.js 20, ESM |
| Framework | Express 5 |
| WebSocket | `ws` (attached to the same HTTP server) |
| Logging | Pino (structured JSON in prod, pretty-printed in dev) |
| Types | TypeScript 5.9 strict mode |

Internal folder structure:

```
src/
  routes/         # Express routers — one file per resource
  controllers/    # Request/response handling (thin)
  services/       # Business logic (no Express types)
  middleware/     # CORS, error handler, request logger
  database/       # Re-exports Prisma client from @workspace/database
  websocket/      # WS server setup + message handlers
  utilities/      # Logger, config loader
  types/          # Express augmentation + internal types
```

**Rules:**
- `controllers/` only calls `services/` — never touches the DB directly.
- `services/` is pure business logic, easily unit-testable.
- All errors flow through the global `errorHandler` middleware.

---

### `shared/`

Zero runtime dependencies. Contains:

- `src/types/common.ts` — `ApiResponse<T>`, `User`, `Status`, etc.
- `src/types/api.ts` — `HealthCheckResponse`, `WebSocketMessage`, etc.
- `src/utils/index.ts` — `formatDate`, `generateId`, `truncate`, etc.

Imported by both `frontend/` and `backend/`. Changes here affect both sides.

---

### `database/`

| Concern | Technology |
|---|---|
| ORM | Prisma 6 |
| Dev DB | SQLite (`database/prisma/dev.db`) |
| Prod DB | Postgres (via `DATABASE_URL`) |
| Generated client | `database/src/generated/client/` |

**Workflow:**

```bash
# After schema changes:
pnpm --filter @workspace/database run push      # sync to dev DB
pnpm --filter @workspace/database run generate  # regenerate types

# Seed initial data:
pnpm --filter @workspace/database run seed
```

---

## Data flow

```
Browser
  │
  ├─ HTTP → /api/*       → Express router → controller → service → Prisma → SQLite
  │
  └─ WebSocket → /ws     → wsServer → handlers → (future: emit events back)
```

---

## Environment variables

| Variable | Owner | Description |
|---|---|---|
| `PORT` | Replit (injected) | Server port |
| `BASE_PATH` | Replit (injected) | Frontend URL prefix |
| `SESSION_SECRET` | Replit Secret | Session signing key |
| `SQLITE_DATABASE_URL` | Env var | SQLite file path for dev |
| `DATABASE_URL` | Replit (prod) | PostgreSQL connection string |
| `NODE_ENV` | Runtime | `development` \| `production` |

---

## Adding a new feature

1. **Define the API shape** in `shared/src/types/api.ts`
2. **Add the DB model** in `database/prisma/schema.prisma`, then run `push` + `generate`
3. **Implement the backend**: service → controller → router (mount in `routes/index.ts`)
4. **Implement the frontend**: service call in `services/` → hook → page/component
