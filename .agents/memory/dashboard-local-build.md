---
name: Dashboard local build — PORT+BASE_PATH required
description: The dashboard vite.config.ts throws if PORT or BASE_PATH env vars are absent — must be set explicitly for local builds.
---

## Rule
To build the dashboard locally (outside of the Replit publish flow), both env vars must be provided:

```bash
PORT=3000 BASE_PATH=/dashboard/ pnpm --filter @workspace/dashboard run build
```

## Why
`vite.config.ts` enforces `PORT` (for the dev server) and `BASE_PATH` (for the Vite `base` option) at config-load time, throwing hard errors if either is missing. Replit's publish flow injects these automatically; local builds do not.

## How to apply
Use this command whenever you need to pre-build the dashboard dist for a deployment without going through Replit Publish. The built output lands in `artifacts/dashboard/dist/public/` which is what the production deployment serves as static files.
