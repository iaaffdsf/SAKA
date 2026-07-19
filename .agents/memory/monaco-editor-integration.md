---
name: Monaco editor integration
description: How Monaco Editor 0.55.x is set up in the frontend — workers, loader, TypeScript service, theme registration, and model management.
---

## Setup pattern

`frontend/src/ide/setup/monacoSetup.ts` must be imported as a side-effect BEFORE any `@monaco-editor/react` usage:

```ts
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
// ... other workers
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

(self as any).MonacoEnvironment = { getWorker(_, label) { ... } };
loader.config({ monaco }); // Use local bundle, not CDN
```

`MonacoEditor.tsx` imports this as a side effect at the top of the file so it runs before any `<Editor>` component renders.

## TypeScript language service (0.55.x)

`monaco.languages.typescript` is deprecated in the type definitions for 0.55.1. Access it with:

```ts
const ts = (monacoInst as any).languages?.typescript;
if (!ts) return;
ts.typescriptDefaults?.setCompilerOptions(opts);
```

Do NOT type `monacoNs.languages.typescript` directly — it causes TS2694 compile errors.

## Model management

Use `@monaco-editor/react`'s `path` prop for multi-file support. Monaco creates one model per path and caches it. When `path` changes (tab switch), Monaco switches the model; the old model's cursor/scroll/content is preserved.

Set `keepCurrentModel={true}` to prevent model disposal on unmount.

Load content once per path with a `loadedPaths: Set<string>` ref. On first open, call `model.setValue(content)` after fetching from disk. Subsequent tab switches reuse the cached model.

## Custom themes

Define with `loader.init().then(m => m.editor.defineTheme(...))`. Three custom themes:
- `ai-ide-dark` — One Dark-inspired, background #0c0c0f
- `ai-ide-midnight` — Deep purple, background #020209
- `ai-ide-light` — GitHub-inspired light

Map IDE theme to Monaco theme in the MonacoEditor component based on `useTheme()` output.

## Vite config

```ts
optimizeDeps: { exclude: ['monaco-editor'] }
```
Prevents Vite from pre-bundling monaco-editor (too large; breaks CJS/ESM boundary).

## Session restore

IDEContext persists open file metadata (id, name, path, language — NO content) to localStorage under `ide-session-tabs`. Content is always loaded fresh from disk on session restore. `beforeunload` fires a browser dialog if any file is dirty.

**Why:** Storing content in localStorage would hit the 5MB limit quickly and serve stale data.
