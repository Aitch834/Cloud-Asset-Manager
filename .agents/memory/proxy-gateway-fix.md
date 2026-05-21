---
name: Replit External Proxy Gateway Fix
description: How to fix blank screens when the Replit external preview proxy fails to route sub-path apps to their correct ports.
---

# Replit External Proxy — Gateway Fix

## The Problem

In this monorepo, multiple Vite dev servers run on different ports at different paths:
- Website: port 19161 at `/`
- Dashboard: port 23183 at `/dashboard/`
- Test Dashboard: port 18652 at `/test-dashboard/`
- Admin Portal: port 25580 at `/admin-portal/`

The Replit external preview proxy (*.replit.dev) reliably routes only the root path `/` to the website server. Sub-path apps (dashboard, test-dashboard) are NOT reliably routed to their correct ports — the proxy sends all traffic to the website server, which has no React routes for those paths, resulting in blank screens.

**Why:** Web artifacts are registered in `artifact.toml` files inside `.replit-artifact/` directories, but the external proxy may not read these. Only artifacts listed in `.replit`'s `[[artifacts]]` section are reliably registered. However, `.replit` cannot be edited directly.

## The Fix

Add Vite proxy rules to the **website's** `vite.config.ts` so it acts as a gateway, forwarding sub-path requests to the correct local ports:

```typescript
proxy: {
  "/test-dashboard": {
    target: "http://localhost:18652",
    changeOrigin: true,
    ws: true,
  },
  "/dashboard": {
    target: "http://localhost:23183",
    changeOrigin: true,
    ws: true,
  },
},
```

**Why this works:** Since the external proxy routes all unrecognised sub-paths to the website server (port 19161), the website's Vite proxy rules intercept those requests and forward them to the correct app servers.

## Apps NOT needing gateway proxy

- `/admin-portal/` — appears to work via direct routing (registered differently)
- `/` — the website itself, always routed correctly

## When to apply

Apply this fix whenever a new sub-path web app is added and the user reports blank screens for that path but the website still works.
