# AI Dev Platform

A production-grade, AI-powered development platform — the foundation for a next-generation browser-based IDE.

## Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite 7 + Tailwind CSS v4 + Wouter |
| **Backend** | Node.js 20 + Express 5 + WebSocket (`ws`) |
| **Database** | Prisma 6 + SQLite (dev) / PostgreSQL (prod) |
| **Shared** | TypeScript 5.9 types and utilities |
| **Package manager** | pnpm workspaces |

## Project layout

```
frontend/    React + Vite UI (components, pages, hooks, services, contexts)
backend/     Express API (routes, controllers, services, middleware, websocket)
shared/      Zero-dep TypeScript types and utils (used by both sides)
database/    Prisma schema + migrations
docs/        Architecture and development docs
```

## Quick start (Replit)

The dev servers start automatically via managed workflows. To run manually:

```bash
pnpm install
pnpm --filter @workspace/database run generate
pnpm --filter @workspace/database run push
```

See [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) for the full development guide.

## Architecture

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for a detailed breakdown of
data flow, package responsibilities, environment variables, and conventions for
adding new features.

## Adding features

1. Define types in `shared/src/types/`
2. Add Prisma models in `database/prisma/schema.prisma`, then `push` + `generate`
3. Implement backend: service → controller → router
4. Implement frontend: service → hook → component/page
