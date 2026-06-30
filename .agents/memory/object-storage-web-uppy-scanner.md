---
name: object-storage-web @uppy/core scanner trigger
description: Why import type from @uppy/core in use-upload.ts causes "Invalid hook call" in test-dashboard
---

## Rule
`lib/object-storage-web/src/use-upload.ts` must NOT import from `@uppy/core` — not even as `import type`.

## Why
`lib/object-storage-web/node_modules/` contains its OWN local copy of `@uppy/*` (pnpm installs workspace package deps into the package's own node_modules). Vite's dep scanner runs on raw TypeScript before esbuild erases type-only imports. When the scanner sees `from "@uppy/core"` in `use-upload.ts`, it resolves it via pnpm to `lib/object-storage-web/node_modules/@uppy/core` — a DIFFERENT location from the pre-bundled `dashboard/node_modules/@uppy/core`. Vite sees a new, un-pre-bundled dep → triggers mid-render dep re-optimisation → browserHash changes → old cached chunks + new chunks coexist → two React instances → "Invalid hook call" on `useQueryClient()` (the first hook) in any component that renders DocAttach or RecordAttachments.

This happens every time the module graph is cleared (each session restart) and the user first navigates to a tab using DocAttach/RecordAttachments (e.g. Johne's Monitoring in OrganicDairyPage).

## How to apply
- In `lib/object-storage-web/src/use-upload.ts`: remove `import type { UppyFile } from "@uppy/core"` and replace the `UppyFile` parameter in `getUploadParameters` with an inline `{ name: string; size: number; type: string }` type.
- Do NOT add any `@uppy/*` imports to `use-upload.ts` — only `ObjectUploader.tsx` should import @uppy packages.
- If future code in `use-upload.ts` needs Uppy types, define them inline rather than importing from the package.
