---
name: Shared tsconfig needs DOM lib
description: shared/tsconfig.json must include DOM lib or setTimeout and browser globals are missing.
---

The root `tsconfig.base.json` has `"lib": ["es2022"]` and `"types": []`. The shared package inherits both.

`shared/src/utils/index.ts` uses `setTimeout`, which lives in `lib.dom.d.ts`.

**Fix applied:** `shared/tsconfig.json` overrides lib to `["ES2022", "DOM"]`.

**Why:** `types: []` blocks auto-discovery of `@types/*`, and `lib: ["es2022"]` alone has no DOM globals. The override is the minimal fix that doesn't affect other packages.

**How to apply:** If setTimeout or other browser globals are missing in `shared/`, check that `shared/tsconfig.json` still has the DOM lib override.
