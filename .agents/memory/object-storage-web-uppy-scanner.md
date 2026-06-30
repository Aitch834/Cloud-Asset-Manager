---
name: object-storage-web @uppy/core scanner trigger
description: Why @workspace/object-storage-web causes "Invalid hook call" in test-dashboard, and the definitive fix
---

## Rule
`@workspace/object-storage-web` MUST be aliased in `artifacts/test-dashboard/vite.config.ts` to point directly at `lib/object-storage-web/src/use-upload.ts`, NOT at the package root.

## Why
`lib/object-storage-web/node_modules/` contains its OWN local copies of `@uppy/*` (pnpm installs workspace package deps into the package's own node_modules). When Vite resolves `@workspace/object-storage-web` via the pnpm workspace symlink, it lands at the package root and its dep scanner crawls EVERY file in the package — including `ObjectUploader.tsx`. That file imports `@uppy/core` directly (not as a type), which resolves to `lib/object-storage-web/node_modules/@uppy/core` — a DIFFERENT copy from the pre-bundled `dashboard/node_modules/@uppy/core`. Vite sees a new un-pre-bundled dep → triggers mid-render dep re-optimisation → browserHash changes → old cached chunks + new chunks coexist in the same tab → two React instances → "Invalid hook call" on any component that uses DocAttach or RecordAttachments (e.g. JohnesTab).

This happens on EVERY session restart when the user first visits a tab containing DocAttach or RecordAttachments.

## Fix (already applied)
In `artifacts/test-dashboard/vite.config.ts` resolve.alias:
```js
{ find: "@workspace/object-storage-web", replacement: path.resolve(import.meta.dirname, "../../lib/object-storage-web/src/use-upload.ts") },
```
This bypasses the package-root scanner entirely — ObjectUploader.tsx is never crawled, its @uppy/core import is never discovered, no dep re-optimisation occurs.

**Why:** `@uppy/*` are already aliased to `dashboard/node_modules/@uppy/` — but only if Vite resolves them through the alias map. When the package root is used as entry, pnpm's local node_modules takes precedence before the alias map is consulted.

## How to apply
- The fix is in place. Do NOT remove the `@workspace/object-storage-web` alias from test-dashboard/vite.config.ts.
- If any new workspace lib packages appear in dashboard imports and cause "Invalid hook call": add a similar alias pointing directly at their entry file (not the package root).
- `use-upload.ts` itself must also NOT import from `@uppy/core` — belt-and-suspenders. Keep using inline types there.
