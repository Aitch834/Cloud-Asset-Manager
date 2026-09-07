---
name: Dashboard E2E setup stalls
description: How to interpret a focused dashboard Playwright run that produces no test result.
---

When a focused dashboard Playwright command times out with no assertion output and no test-results report, the shared Clerk/global browser setup may be stalled before the test body starts. Switching application navigation from network-idle waits to DOM-ready waits does not address that startup failure.

**Why:** The dashboard has long-lived or delayed browser/setup traffic, and Clerk test-user setup can stall independently of the feature under test. Treat the absence of a first-step report as an environment/setup issue, not evidence that the test assertion failed.

**How to apply:** Check the global setup output, Clerk test identity files, and workflow availability first. Still keep the browser spec itself deterministic and use explicit UI waits rather than relying on network idle.