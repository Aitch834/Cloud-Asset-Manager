---
name: Clerk Playwright sign-in helper
description: How dashboard browser tests authenticate with current Clerk testing packages.
---

`setupClerkTestingToken` only installs Clerk's bot-protection bypass. It does not authenticate a user, and a `userId` property is neither accepted by its current type nor consumed at runtime. Browser tests that rely on it alone remain on the public sign-in screen.

**Why:** A browser regression repeatedly timed out waiting for authenticated navigation even though global setup created and mapped a valid Clerk user. The installed package documents `clerk.signIn` as the authentication helper.

**How to apply:** Navigate to a public page that loads Clerk, then call `clerk.signIn({ page, emailAddress })` using the generated test user's email before visiting protected routes. Keep `setupClerkTestingToken` for bot bypass only when direct sign-in is not needed. If a test needs a selected farm, seed its persisted tenant/farm state with `page.addInitScript` before navigation; setting it after sign-in can race tenant discovery and be cleared before the protected page mounts.