---
name: Backend API workflow port conflict
description: Backend API and artifacts/api-server both try to own port 8080. Use the artifact workflow.
---

Two workflows both run `@workspace/backend` on port 8080:
- `artifacts/api-server: API Server` — the registered artifact workflow (wins the port)
- `Backend API` — a manual workflow created before artifact registration (always fails with EADDRINUSE)

**Fix applied:** Added Vite proxy in `frontend/vite.config.ts` so the frontend forwards `/api` and `/ws` to `http://localhost:8080`. The `Backend API` workflow is intentionally FAILED — `artifacts/api-server` is the live backend.

**Why:** The Replit artifact system registered both services as managed workflows. The manually configured `Backend API` is now a duplicate that conflicts.

**How to apply:** Do not try to restart `Backend API`. The backend is served by `artifacts/api-server: API Server`. The frontend proxy handles API routing.
