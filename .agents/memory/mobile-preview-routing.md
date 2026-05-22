---
name: Mobile preview routing
description: How the Expo mobile app preview is routed in this pnpm monorepo project
---

# Mobile Preview Routing

## The confirmed root cause
Replit routes ALL traffic — including the `*.expo.*` subdomain — to whichever app
sits at `/`. In this project that is the website Vite server (port 19161).
`router = "expo-domain"` in artifact.toml does NOT cause Replit to route the expo
subdomain to a different port; it only sets the outer wrapper iframe URL.

## The two-part fix (both are needed, both live in `artifacts/website/vite.config.ts`)

### Fix 1 — Expo-subdomain middleware plugin
When the incoming `Host` header contains `.expo.`, the Vite custom middleware
forwards the request directly to Metro (port 18115) instead of serving the website.
This handles the canvas iframes and the Replit preview pane which show the expo
subdomain URL.

### Fix 2 — Asset path proxies
Metro's HTML page (served at `/mobile/`) embeds root-relative asset paths:
- `src="/node_modules/.pnpm/expo-router.../entry.bundle?..."` — the main JS bundle
- `/_expo/static/media/...` — fonts and static media

Without proxy entries for these paths, Vite's SPA fallback returns `text/html`
(the website's index.html) for the bundle request. The browser refuses to execute
HTML as JavaScript, so the React app never starts. The proxy entries:
```js
"/_expo":             { target: "http://localhost:18115", changeOrigin: true }
"/node_modules/.pnpm": { target: "http://localhost:18115", changeOrigin: true }
"/mobile":            { target: "http://localhost:18115", changeOrigin: true, ws: true }
```
The `/node_modules/.pnpm` entry is safe because Vite's `fs.deny: ["**/.*"]` already
blocks `.pnpm` (hidden dir) from Vite's own file serving; proxying it to Metro
cannot conflict.

## Port assignments
- Website/gateway: 19161 (all external traffic arrives here)
- Dashboard: 23183
- Test dashboard: 18652
- Mobile Metro: 18115

## What does NOT work
- `experiments.baseUrl: "/mobile/"` in `artifacts/mobile/app.json` — breaks Metro
  HMR (see metro-baseur-hmr-crash.md)
- HTML-rewriting proxy that prefixes asset src paths with `/mobile/` — same crash
- `router = "expo-domain"` alone is NOT enough; the gateway proxy fixes are required
