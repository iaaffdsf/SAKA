# AI IDE

A next-generation, browser-based AI-powered integrated development environment.

## Run & Operate

- `pnpm --filter @workspace/ai-ide run dev` — run the frontend (port assigned by workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm run typecheck` — full TypeScript check across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `npx eslint .` — lint all TypeScript files
- `npx prettier --write .` — format all files
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7 + Tailwind CSS v4 + Wouter + TanStack Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod v4, drizzle-zod
- API codegen: Orval (from OpenAPI spec in lib/api-spec/openapi.yaml)
- Linting: ESLint v9 flat config + typescript-eslint + eslint-plugin-react-hooks
- Formatting: Prettier
- Build: esbuild (API server CJS bundle), Vite (frontend)

## Where things live

- `artifacts/ai-ide/src/` — React frontend source
- `artifacts/ai-ide/src/App.tsx` — router setup (wouter Switch/Route)
- `artifacts/ai-ide/src/index.css` — Tailwind + CSS custom properties (design tokens)
- `artifacts/api-server/src/routes/` — Express API route handlers
- `lib/api-spec/openapi.yaml` — **source of truth** for all API contracts
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — generated Zod schemas (do not edit)
- `lib/db/src/schema/` — Drizzle table definitions
- `eslint.config.js` — ESLint flat config (root)
- `.prettierrc` — Prettier config (root)

## Architecture decisions

- **OpenAPI-first**: All API contracts are defined in `openapi.yaml` before code is written. Types flow downstream via Orval codegen — never hand-written.
- **Monorepo**: pnpm workspaces co-locate frontend, backend, shared libraries, and scripts with shared dependency management.
- **No circular deps**: `artifacts/*` are leaf packages and never import each other. Shared logic lives in `lib/*`.
- **Generated code excluded from lint**: `lib/api-client-react/src/generated/` and `lib/api-zod/src/generated/` are excluded in `eslint.config.js`.
- **Dark IDE theme**: CSS custom properties in `artifacts/ai-ide/src/index.css` define the full design token system.

## Product

AI IDE is a browser-based, AI-powered code editor. The foundation is in place; features will be built iteratively on top of this structure.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any change to `lib/api-spec/openapi.yaml`, always run codegen before using the updated types.
- Do not run `pnpm dev` at the workspace root — run per-artifact via the workflow or `pnpm --filter` commands.
- Generated files in `lib/api-client-react/src/generated/` and `lib/api-zod/src/generated/` are overwritten on every codegen run.
- CSS custom properties use space-separated HSL values without `hsl()` wrapper: `--primary: 221 83% 53%`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
