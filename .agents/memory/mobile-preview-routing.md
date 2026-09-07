---
name: Mobile preview routing
description: Why the Expo artifact must use direct expo-domain routing for standalone mobile preview checks
---

# Mobile Preview Routing

The mobile artifact must use direct `expo-domain` routing.

**Why:** Without direct routing, the Expo development domain depends on the root website gateway being active. Mobile-only workflow runs then return HTTP 502 even though Metro is healthy locally. Direct routing lets the managed mobile workflow serve Expo HTML and root-relative Router bundles itself.

**How to apply:** Keep `router = "expo-domain"` in the mobile artifact metadata. Test the Expo development domain at `/`, not `/mobile/`; the direct domain root is the mobile preview. Keep `experiments.baseUrl` out of Expo configuration because a `/mobile/` base breaks Metro HMR module resolution.
