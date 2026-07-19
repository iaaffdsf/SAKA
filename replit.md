# AI IDE

A next-generation, browser-based AI-powered integrated development environment.

## Run & Operate

- `pnpm --filter @workspace/frontend run dev` — run the frontend (workflow: "Start application", port 5000)
- `pnpm --filter @workspace/backend run dev` — run the API server (workflow: "Backend API", port 8080)
- `pnpm run typecheck` — full TypeScript check across all packages
- `pnpm run build` — typecheck + build all packages
- `npx eslint .` — lint all TypeScript files
- `npx prettier --write .` — format all files
- No required env vars — the backend uses local filesystem storage only

## Stack

- pnpm workspaces, Node.js 20, TypeScript 5.9
- Frontend: React 19 + Vite 7 + Tailwind CSS v4 + Wouter
- API: Express 5 + WebSocket (ws)
- Storage: local filesystem JSON (`.ai-ide/` at workspace root — no database)
- Linting: ESLint v9 flat config + typescript-eslint + eslint-plugin-react-hooks
- Formatting: Prettier
- Build: tsc (API server), Vite (frontend)

## Where things live

- `frontend/src/` — React frontend source
- `frontend/src/App.tsx` — router setup (wouter Switch/Route)
- `frontend/src/index.css` — Tailwind + CSS custom properties (design tokens)
- `frontend/src/services/` — typed API client functions (api.ts, settings.ts, providers.ts, projects.ts, memory.ts)
- `frontend/src/ide/` — IDE panels, context, hooks
- `backend/src/routes/` — Express API route handlers
- `backend/src/services/` — business logic (storage, settings, providers, projects, memory, health)
- `shared/src/types/` — shared TypeScript types used by both frontend and backend
- `.ai-ide/` — local JSON config files written by the backend (gitignored)
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
