---
name: Clerk E2E user quota
description: Why dashboard Playwright runs can fail before test execution and how to distinguish that from an app regression.
---

Dashboard Playwright global setup creates a fresh Clerk test user for each run. The shared development Clerk tenant has a 100-user ceiling, so setup can return HTTP 403 `user_quota_exceeded` before any test or browser step starts.

**Why:** This infrastructure failure can be mistaken for an app regression even though the test body never executed. A focused spec compiled and was listed successfully but could not start, and repeated retries do not help while the tenant remains at quota.

**How to apply:** Treat this response as a test-infrastructure blocker rather than an app verdict. Prefer a reusable mapped test identity or reliable orphan-user cleanup in the harness instead of weakening authentication.
