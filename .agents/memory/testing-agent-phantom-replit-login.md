---
name: e2e testing agent blocked by phantom "Sign In with Replit" button
description: The Playwright-based runTest tool can get stuck clicking a "Sign In with Replit" button that redirects to a 404'ing /api/login, even though no such button/route exists anywhere in the dashboard app's source.
---

Observed on `artifacts/dashboard`: calling `runTest` with a `[Clerk Auth]` sign-in step, then navigating to a protected route, repeatedly resulted in status "unable"/"blocked" because the test agent found and clicked a "Sign In with Replit" button that redirects to `/api/login`, which returns "Cannot GET /api/login".

Grepping the entire dashboard `src/` for "Sign In with Replit", "/api/login", and "Replit" login references turned up nothing — the app only has its own `/login` page (`Login.tsx`) with a "Sign In" link to Clerk's hosted `/sign-in` route. The phantom button/route is not part of this app's code.

**Why:** This is a test-environment/tooling quirk (possibly stale cached page state or bleed-through from another artifact in the shared preview), not a bug introduced by app changes. Retrying the same testPlan wording did not help; explicitly instructing the test plan to avoid `/login`/`/sign-in` and navigate directly to protected routes after the `[Clerk Auth]` step still hit the same blocker.

**How to apply:** If `runTest` reports being blocked by "Sign In with Replit" / `/api/login` 404 on an app that has no such route in its source, don't keep retrying the same e2e approach — treat it as a testing-infra limitation. Fall back to backend verification via the dev-bypass auth mechanism (see api-dev-bypass-auth.md) plus code review / typecheck / log inspection to confirm correctness, and note the e2e blocker explicitly rather than looping on it.
