---
name: Workspace package exports for tsx
description: How to configure package.json exports so tsx resolves workspace packages to TypeScript source files at runtime.
---

## Rule
Workspace packages consumed by `tsx` at runtime must set their `"default"` export condition to the `.ts` source file, not a compiled `.js` output path.

## Why
`tsconfig.base.json` sets `"customConditions": ["workspace"]` so TypeScript resolves the `"workspace"` condition. But `tsx watch` uses Node's runtime resolver which only knows standard conditions (`import`, `require`, `default`). It ignores `"workspace"` and falls through to `"default"`. If `"default"` points to `./dist/index.js` and no build has run, Node throws `ERR_MODULE_NOT_FOUND`.

## How to apply
```json
"exports": {
  ".": {
    "workspace": "./src/index.ts",
    "default": "./src/index.ts"
  }
}
```

Both conditions point to the same `.ts` source. tsx handles TypeScript files natively, so this works in dev. For a compiled production build, a separate build step emits the `dist/` output; the exports can be updated then if needed.

This applies to every internal workspace package that has consumers running via `tsx`.
