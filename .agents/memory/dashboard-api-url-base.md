---
name: Dashboard API calls must use root /api, never BASE_URL
description: Why `${import.meta.env.BASE_URL}api/...` silently breaks dashboard API calls
---

Dashboard API requests must use the shared `apiUrl()` helper (`src/lib/api.ts`), which builds root-relative `/api/...` URLs.

**Why:** The dashboard artifact is mounted at `/dashboard/`, so `${import.meta.env.BASE_URL}api/...` resolves to `/dashboard/api/...`. serve.mjs has no API proxy — its SPA fallback answers those requests with the HTML shell (HTTP 200), so `res.json()` fails and users see only a generic error toast. This is exactly what blocked fresh-user onboarding.

**How to apply:** Any new dashboard fetch must go through `apiUrl()`. Also: after onboarding creates a tenant, `/select` must not bounce back to `/onboard` on the stale cached empty tenants query — guard on the app-store tenantSlug and invalidate queries when leaving onboarding.
