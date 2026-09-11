---
name: Expo Jest ESM transforms
description: Keeping custom mobile Jest projects compatible with Expo SDK ESM packages.
---

When a custom Jest project overrides the Expo preset transform, its matcher must include JavaScript as well as TypeScript (`.[jt]sx?`), while retaining the existing Expo-oriented ignore patterns.

**Why:** Expo SDK packages may ship ESM `.js` entry points. A TypeScript-only matcher leaves those files uncompiled and crashes the suite with an `Unexpected token 'export'` error before any assertion runs.

**How to apply:** Check every custom Jest project when altering transform configuration; do not compensate with global mocks or broaden the ignore list. A focused screen test that reaches a transitive Expo dependency confirms the configuration behaves correctly.