---
name: Test-dashboard dep-chunk stamping
description: Why dep-chunk URLs must NOT be session-stamped in the reconnectReloadPlugin, and why only @fs/ source file URLs should be stamped.
---

## The rule
Do NOT stamp dep-chunk URLs (`/test-dashboard/node_modules/.vite/deps/pkg.js?v=HASH`) with `&td=SESSION_TOKEN` in the `reconnectReloadPlugin`. Stamp ONLY `@fs/` source file URLs and the HTML entry `<script src>`.

**Why:** Replit's preview proxy caches module responses. Large source files (e.g. `EnvironmentalPageFull.tsx`, ~900 KB compiled) exceed the proxy's per-entry size limit and are **always served fresh** from Vite (current session's token). Smaller source files ARE served from the proxy cache (previous session's token). If dep-chunk URLs carry `&td=SESSION_TOKEN`, fresh files reference `react.js?v=HASH&td=NEW` while cached files reference `react.js?v=HASH&td=OLD`. The browser treats these as **two separate ES-module instances** → two React instances → "Invalid hook call" on `SlurryTab` (or whichever tab renders from the freshly-served large file).

**How to apply:** The `?v=HASH` in dep-chunk URLs already busts the cache when deps change. Leave it alone. If a mid-session dep re-optimisation changes the browserHash, the Layer 3+4 double-reload mechanism (regenerate sessionToken → fresh @fs/ URLs → correct hash references) handles it without dep-chunk stamping.

**Verified:** After removing `depUrlRe` and the `url.includes("node_modules/.vite/deps/")` branch from `isJsModule`, both the large `EnvironmentalPageFull.tsx` and small `StorageLocationMapPicker.tsx` compiled outputs show identical un-stamped dep-chunk URLs → one React instance → no crash.
