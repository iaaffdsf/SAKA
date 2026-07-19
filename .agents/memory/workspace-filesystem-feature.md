---
name: Workspace + filesystem feature
description: File/project management system — key files and architecture decisions.
---

## Backend
- `backend/src/services/workspace.service.ts` — project list CRUD, stores to `.ai-ide/workspace.json`
- `backend/src/services/filesystem.service.ts` — safe file ops, path guard via `validatePath()`
- `backend/src/routes/workspace.router.ts` — `/api/workspace/*`
- `backend/src/routes/filesystem.router.ts` — `/api/fs/*` (tree, read, write, create, delete, rename, copy, move, search, git-status)

## Frontend
- `frontend/src/ide/contexts/WorkspaceContext.tsx` — entire workspace+filesystem state, all tree mutation helpers
- `frontend/src/ide/utilities/language.ts` — extension→language and git status color helpers (mirrors backend)
- `frontend/src/ide/components/workspace/WorkspaceManager.tsx` — project picker (add/pin/rename/remove)
- `frontend/src/ide/components/panels/FileExplorer.tsx` — tree with lazy folder loading, context menu, inline rename/create
- `frontend/src/ide/components/panels/SearchPanel.tsx` — filename search
- `frontend/src/ide/components/panels/GitPanel.tsx` — git status list

## Key decisions
- File tree is lazy: root loads depth=2, each folder expand fetches depth=1 on demand
- Safety: ALL filesystem ops validate against registered workspace paths (`validatePath`)
- File content loaded on first tab open; saved on Ctrl+S
- WorkspaceProvider wraps IDEProvider (outer); components use both contexts via separate hooks
- Git status polled every 10s when a project is open

**Why workspace.json separate from projects.json:** `workspace.json` is for the file manager (local folder management, pinned, lastOpenedAt). `projects.json` is for AI context memory. Different use cases.
