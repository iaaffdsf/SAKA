---
name: Local filesystem storage architecture
description: Backend stores all config as JSON files in .ai-ide/ — no database.
---

This is a personal local AI IDE, not a SaaS app. All persistence uses JSON files.

**Storage location:** `<workspace-root>/.ai-ide/` (gitignored)

**Files:**
- `settings.json` — app settings (theme, fontSize, aiProvider, etc.)
- `providers.json` — AI provider configs (OpenAI, Anthropic, Ollama, etc.)
- `projects.json` — project metadata list
- `memory.json` — AI memory entries

**Core abstraction:** `backend/src/services/storage.service.ts`
- `readJson(filename, defaultValue)` — safe read with fallback
- `writeJson(filename, data)` — atomic write with auto-mkdir
- `checkStorage()` — health check (write + delete .health-check)

**API routes:** `/api/settings`, `/api/providers`, `/api/projects`, `/api/memory`

**Why:** Removed Prisma/SQLite/PostgreSQL entirely. No DATABASE_URL needed. No session auth. Personal tool — filesystem is the right storage layer.

**How to apply:** When adding new config domains, create a new `*service.ts` using `readJson/writeJson`, a new router, and mount it in `backend/src/routes/index.ts`. Add the shared type to `shared/src/types/common.ts`.
