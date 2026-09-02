---
name: Clerk testing token is not sign-in
description: Current Clerk Playwright testing helper behavior for authenticated browser checks.
---

`setupClerkTestingToken` only registers the Clerk Frontend API testing-token route. It does not authenticate a user, and extra identity arguments such as `userId` are ignored.

**Why:** A browser check reached the public sign-in screen even though the helper was called with a freshly created Clerk user. The current package exposes authentication separately through `clerk.signIn`.

**How to apply:** For authenticated Clerk Playwright checks, load the app and call `clerk.signIn` with the test identity created by global setup. Do not treat `setupClerkTestingToken` as login.