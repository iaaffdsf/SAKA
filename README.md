# AI IDE

A next-generation, browser-based AI-powered integrated development environment.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| Routing | Wouter |
| State / Data | TanStack Query + Orval-generated hooks |
| Backend | Node.js + Express 5 |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod v4 + drizzle-zod |
| API contract | OpenAPI 3.1 (code-first codegen via Orval) |
| Package manager | pnpm workspaces |

## Project Structure

```
.
├── artifacts/
│   ├── ai-ide/          # React + Vite frontend (main app)
│   └── api-server/      # Express API server
├── lib/
│   ├── api-spec/        # OpenAPI spec + codegen config
│   ├── api-client-react/# Generated React Query hooks (do not edit)
│   ├── api-zod/         # Generated Zod schemas (do not edit)
│   └── db/              # Drizzle ORM schema + client
├── scripts/             # Shared utility scripts
├── eslint.config.js     # ESLint flat config (v9)
├── .prettierrc          # Prettier config
├── tsconfig.base.json   # Shared TypeScript base
└── pnpm-workspace.yaml  # Workspace catalog + overrides
```

## Getting Started

Install dependencies:

```bash
pnpm install
```

Start the development servers (runs both frontend and API):

```bash
# Frontend (port assigned by workflow)
pnpm --filter @workspace/ai-ide run dev

# API server
pnpm --filter @workspace/api-server run dev
```

## Development Commands

| Command | Description |
|---|---|
| `pnpm run typecheck` | Full TypeScript check across all packages |
| `pnpm run build` | Typecheck + build all packages |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API hooks and Zod schemas |
| `pnpm --filter @workspace/db run push` | Push DB schema changes (dev only) |

## Code Generation

The API contract lives in `lib/api-spec/openapi.yaml`. After any change to the spec, regenerate typed helpers:

```bash
pnpm --filter @workspace/api-spec run codegen
```

This produces:
- **React Query hooks** in `lib/api-client-react/src/generated/` (used by the frontend)
- **Zod schemas** in `lib/api-zod/src/generated/` (used by the API server for request validation)

Do not edit generated files manually — they will be overwritten on the next codegen run.

## Linting & Formatting

```bash
# Lint all TypeScript files
npx eslint .

# Format all files
npx prettier --write .

# Check formatting without writing
npx prettier --check .
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | Yes (set by workflow) | Server port |
| `BASE_PATH` | Yes (set by workflow) | Frontend base path prefix |
| `SESSION_SECRET` | Yes | Secret for session signing |

## Architecture Decisions

- **OpenAPI-first**: All API contracts are defined in `openapi.yaml` before any code is written. Types flow downstream via codegen — never hand-written.
- **Monorepo**: pnpm workspaces keep the frontend, backend, shared libraries, and scripts co-located with shared dependency management.
- **No circular deps**: `artifacts/*` are leaf packages and never import each other. Shared logic lives in `lib/*`.
- **Generated code is ignored by ESLint**: `lib/api-client-react/src/generated/` and `lib/api-zod/src/generated/` are excluded from linting rules.

## Contributing

1. Define new endpoints in `lib/api-spec/openapi.yaml`
2. Run codegen to generate typed helpers
3. Implement routes in `artifacts/api-server/src/routes/`
4. Use generated hooks in `artifacts/ai-ide/src/` — never write raw `fetch` calls
