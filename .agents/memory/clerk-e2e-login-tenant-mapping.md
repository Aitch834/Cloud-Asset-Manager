---
name: Clerk e2e login needs DB tenant mapping
description: How the Playwright testing agent gets past the dashboard's Clerk gate — programmatic sign-in plus manual users/user_tenants rows.
---

The dashboard gates routes client-side on Clerk's `useAuth().isSignedIn`, and server-side on matching rows in both `users` and `user_tenants`. A programmatically created Clerk user whose sub is absent from either table can render the public landing page or an empty organisation selector.

**Why:** Tenant discovery joins the mapping to the application user, and the installed Clerk Playwright helper's supported ticket sign-in identifies the test user by email rather than the older `userId` option.

**How to apply:** Ensure global setup inserts:
- `users (id, email, first_name, last_name)` with id = the sub
- `user_tenants (user_id, tenant_id, role_id, is_super_admin, is_active)` values `('<sub>', 1, 2, true, true)` for tenant oakfield-farms.
Navigate to a public page that loads Clerk, then call the Playwright helper with the generated email address and hard-reload; `/api/tenants/mine` resolves and the authenticated shell renders. Teardown must delete the mapping before the application user. Also note: the dashboard artifact serves a pre-built `dist/` bundle (not Vite dev) — rebuild (`PORT=3000 BASE_PATH=/dashboard/ pnpm --filter @workspace/dashboard run build`) before e2e-verifying frontend edits, or the tester runs against stale code.
