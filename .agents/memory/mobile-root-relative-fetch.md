---
name: Mobile root-relative /api fetches fail on device
description: Native Expo builds have no origin and no session cookies — mobile API calls need an absolute base plus a Bearer token.
---

Rule: mobile screens must never call the API with root-relative URLs like `fetch("/api/...")`; requests must use the absolute base derived from EXPO_PUBLIC_DOMAIN and attach the stored Bearer auth token (use the shared apiFetch helper).

**Why:** In a native Expo build there is no browser origin, so relative URLs fail outright, and cookies aren't sent, so `credentials: "include"` alone never authenticates. Such bugs are invisible in the web preview — screens look fully working there but silently fail on a real phone.

**How to apply:** When adding or reviewing any mobile screen that talks to the API, grep the mobile app dir for root-relative `/api` fetches (both backtick and quote forms — note multi-line calls where the URL is on its own line can escape a single-line grep) and convert them.
