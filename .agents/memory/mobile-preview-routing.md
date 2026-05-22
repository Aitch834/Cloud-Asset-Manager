---
name: Mobile preview routing
description: How the Expo mobile app preview is routed in this pnpm monorepo project
---

# Mobile Preview Routing

## The rule
The mobile app preview works via the **expo subdomain** (`*.expo.kirk.replit.dev`). This is configured by `router = "expo-domain"` + `localPort = 18115` in `artifacts/mobile/.replit-artifact/artifact.toml`. Replit routes the expo subdomain directly to Metro's port.

Additionally, the website's Vite gateway proxy (`artifacts/website/vite.config.ts`) must have a `/mobile` entry pointing to port 18115 so the regular-domain path also serves the HTML (even though asset requests only work via the expo domain).

**Why:** This project uses a gateway proxy pattern — the website Vite server (port 19161) sits at `/` and proxies `/dashboard` and `/test-dashboard` to their respective ports. The comment in vite.config.ts says "the external Replit preview proxy only reliably routes traffic to the app sitting at '/'". The `/mobile` entry was missing and had to be added.

**How to apply:** Whenever a new non-root artifact is added, add its path to the `proxy` block in `artifacts/website/vite.config.ts`. For the mobile app specifically, the expo subdomain is the primary preview mechanism (all assets load correctly there).

## Port assignments
- Website/gateway: 19161
- Dashboard: 23183
- Test dashboard: 18652
- Mobile Metro: 18115
