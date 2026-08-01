---
name: Clerk e2e login needs DB tenant mapping
description: How the Playwright testing agent gets past the dashboard's Clerk gate — programmatic sign-in plus manual users/user_tenants rows.
---

The dashboard gates routes client-side on Clerk's `useAuth().isSignedIn`, and server-side on the user's row in `user_tenants`. The testing agent's programmatic Clerk sign-in creates a fresh Clerk user whose sub is NOT in the DB, so the app renders the public landing page / no tenant.

**How to apply:** After the tester signs in programmatically, have it note the Clerk sub and `[DB]` insert:
- `users (id, email, first_name, last_name)` with id = the sub
- `user_tenants (user_id, tenant_id, role_id, is_super_admin, is_active)` values `('<sub>', 1, 2, true, true)` for tenant oakfield-farms.
Then hard-reload; `/api/tenants/mine` resolves and the authenticated shell renders. Also note: the dashboard artifact serves a pre-built `dist/` bundle (not Vite dev) — rebuild (`PORT=3000 BASE_PATH=/dashboard/ pnpm --filter @workspace/dashboard run build`) before e2e-verifying frontend edits, or the tester runs against stale code.
