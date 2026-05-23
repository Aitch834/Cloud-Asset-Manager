---
name: Mobile preview routing
description: How the Expo mobile app preview is routed in this pnpm monorepo project — confirmed working state
---

# Mobile Preview Routing

## Architecture
Replit routes ALL traffic — including the `*.expo.*` subdomain — to whichever app
sits at `/`. In this project that is the website Vite server (port 19161).

## The confirmed fix (fully working as of May 2026)

### Part 1 — artifact.toml: do NOT use `router = "expo-domain"`
`router = "expo-domain"` causes Replit to set `initialPath=%2F` in the outer
workspace_iframe URL, so the inner preview iframe lands at the website root `/`
instead of `/mobile/`. Remove this line entirely; Replit then uses the regular
domain with `initialPath=%2Fmobile%2F`, which the gateway proxy serves correctly.

The artifact.toml for mobile should have NO `router` key — just `kind`, `previewPath`,
`title`, `version`, `id`, integratedSkills, and services.

### Part 2 — Expo-subdomain middleware plugin (vite.config.ts)
When the incoming `Host` header contains `.expo.`, forward the entire request to
Metro (port 18115) with the `origin` header rewritten to `http://localhost:18115`.
Metro's CorsMiddleware rejects any non-localhost origin — must override in the raw
`http.request` options before piping.

### Part 3 — Asset path proxies with Metro CORS fix (vite.config.ts)
Metro's HTML page embeds root-relative asset paths that all need to reach Metro.
Add proxy entries AND fix the Origin header via `configure` + `proxyReq` event:

```ts
function metroOriginFix(proxy) {
  proxy.on("proxyReq", (proxyReq) => {
    proxyReq.setHeader("origin", `http://localhost:${MOBILE_PORT}`);
  });
}

"/_expo":              { target: "http://localhost:18115", changeOrigin: true, configure: metroOriginFix }
"/node_modules/.pnpm": { target: "http://localhost:18115", changeOrigin: true, configure: metroOriginFix }
"/assets":             { target: "http://localhost:18115", changeOrigin: true, configure: metroOriginFix }
"/mobile":             { target: "http://localhost:18115", changeOrigin: true, ws: true, configure: metroOriginFix }
```

**Why `configure`, not `headers`**: Vite proxy `headers` adds response headers, not
request headers. `configure` + `proxy.on("proxyReq", ...)` is the only way to
override request headers before they reach the upstream.

## Port assignments
- Website/gateway: 19161 (all external traffic arrives here)
- Dashboard: 23183
- Test dashboard: 18652
- Mobile Metro: 18115

## What does NOT work
- `experiments.baseUrl: "/mobile/"` in `artifacts/mobile/app.json` — breaks Metro HMR
- HTML-rewriting proxy that prefixes asset src paths with `/mobile/` — same crash
- `router = "expo-domain"` — wrong initialPath in workspace iframe
- `headers: { origin: "..." }` in Vite proxy config — adds response headers, not request headers
