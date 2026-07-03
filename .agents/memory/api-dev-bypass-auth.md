---
name: API dev-bypass auth for direct endpoint testing
description: How to call api-server endpoints directly (curl/fetch) without going through Clerk, for backend verification when UI e2e testing is blocked or unnecessary.
---

In development (`NODE_ENV=development`), `artifacts/api-server` accepts a bypass header instead of a Clerk session:

- Header `x-dev-bypass: bde-dev-bypass-local` (or `process.env.DEV_BYPASS_TOKEN` if set) sets `req.userId = "dev-bypass-user"` and `req.isBypassMode = true`.
- Tenant-scoped routes also require `x-tenant-slug: <slug>` (e.g. `oakfield-farms`) since tenant context isn't inferred from the bypass user.
- Useful for verifying a new/changed endpoint's behavior (PATCH/POST/GET) end-to-end against the real DB without needing a working Clerk login — especially when the e2e browser-test flow is blocked by an unrelated auth issue.

**Why:** Saved significant time verifying a backend change (field_crop_assignments reasonTags) when the Playwright-based e2e tester got stuck on a phantom "Sign In with Replit" button/`/api/login` 404 that doesn't exist anywhere in the dashboard's own source (see testing-agent-phantom-replit-login.md) — this let backend correctness be confirmed independently of that test-infra issue.

**How to apply:** When you need to validate an API change but UI-based e2e testing is unavailable/blocked, curl the api-server directly (find its local port from workflow logs) with the two headers above, then verify via a GET or direct DB query. Remember to revert any test data written this way if it touches seeded rows.
