---
name: Artifact run-command delegation
description: How to point an existing Replit artifact at a different workspace package without moving the artifact directory.
---

## Rule
The `[services.development] run` command in `artifact.toml` can reference any `@workspace/<slug>` package. Updating it via `verifyAndReplaceArtifactToml` re-routes the managed workflow without creating a new artifact or losing routing/preview infrastructure.

## Why
This project uses `frontend/` and `backend/` as the actual source packages but Replit's routing system requires artifact shells at `artifacts/ai-ide/` and `artifacts/api-server/`. The shells contain only `artifact.toml` and delegate execution to the real packages.

## How to apply
1. Write the updated TOML to a sibling `.edit.toml` file
2. Call `verifyAndReplaceArtifactToml({ tempFilePath, artifactTomlPath })`
3. The managed workflow name stays the same (`artifacts/<slug>: <service>`)
4. Restart the workflow with `WorkflowsRestart`

**Production build path** must also be updated in the TOML:
- `publicDir = "frontend/dist/public"` (not `artifacts/ai-ide/dist/public`)
- Production run args point to `backend/dist/index.js`
