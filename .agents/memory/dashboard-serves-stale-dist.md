---
name: Dashboard dev workflow serves stale dist
description: Dashboard "dev" script serves a pre-built bundle and only builds if dist is missing — source edits are invisible until a manual rebuild.
---

The dashboard artifact's `dev` script does NOT run Vite in dev mode. It checks for `dist/public/index.html`, builds only if missing, then runs `serve.mjs` over the built bundle.

**Why:** User reported "nothing changed" after a code change + refresh; the running app was serving a weeks-old dist.

**How to apply:** After ANY dashboard source change, rebuild before telling the user to look:
`cd artifacts/dashboard && PORT=3000 BASE_PATH=/dashboard/ pnpm run build` then restart `artifacts/dashboard: web`. Verify by grepping a new string in `dist/public/assets/`.
