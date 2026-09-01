---
name: Clerk E2E user quota
description: Why dashboard Playwright runs can fail before test execution and how to distinguish that from an app regression.
---

Dashboard Playwright global setup creates a fresh Clerk test user. The shared Clerk development tenant can reach its 100-user quota, causing global setup to fail with `user_quota_exceeded` before any test or browser step runs.

**Why:** This infrastructure failure can be mistaken for a failed regression test even though the test body never executed. Repeated retries do not help while the tenant remains at quota.

**How to apply:** When dashboard E2E fails in Clerk user creation, report it as a test-infrastructure blocker. Prefer a reusable mapped test user or reliable orphan-user cleanup in the test harness rather than weakening application authentication.