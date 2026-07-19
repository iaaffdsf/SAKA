# Development Guide

## Prerequisites

- Node.js 20+
- pnpm 10+ (`npm install -g pnpm`)

## Initial setup

```bash
# 1. Install all workspace dependencies
pnpm install

# 2. Set the SQLite database URL (Replit sets this automatically)
#    If running locally, add to your shell profile:
#    export SQLITE_DATABASE_URL="file:$(pwd)/database/prisma/dev.db"

# 3. Generate the Prisma client
pnpm --filter @workspace/database run generate

# 4. Sync the database schema
pnpm --filter @workspace/database run push

# 5. (Optional) Seed initial data
pnpm --filter @workspace/database run seed
```

## Running the dev servers

The Replit environment starts both servers automatically via managed workflows.
To run manually:

```bash
# Frontend (Vite dev server, hot reload)
PORT=23107 BASE_PATH=/ pnpm --filter @workspace/frontend run dev

# Backend (tsx watch, auto-restarts on file changes)
pnpm --filter @workspace/backend run dev
```

## Useful commands

```bash
# Type-check all packages
pnpm run typecheck

# Lint
npx eslint .

# Format
npx prettier --write .

# Prisma Studio (visual DB browser)
pnpm --filter @workspace/database run studio

# Regenerate Prisma client after schema changes
pnpm --filter @workspace/database run generate
```

## Project conventions

### File naming

| Type | Convention | Example |
|---|---|---|
| React components | PascalCase | `Button.tsx`, `HomePage.tsx` |
| Hooks | camelCase with `use` prefix | `useWindowSize.ts` |
| Utilities | kebab-case | `cn.ts`, `format-date.ts` |
| Backend modules | kebab-case with type suffix | `health.router.ts`, `health.service.ts` |

### Import paths

- Use `@/*` alias in `frontend/` for `src/` paths (e.g. `@/components/ui/Button`)
- Always use `.js` extension in backend ESM imports (TypeScript resolves them to `.ts`)
- Import from `@workspace/shared` for shared types, never duplicate them

### Git

- Branch: `feature/<name>`, `fix/<name>`, `chore/<name>`
- Commit: conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)
- Never commit `database/prisma/dev.db` or `database/src/generated/`
