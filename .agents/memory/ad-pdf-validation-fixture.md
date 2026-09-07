---
name: Shared advert-PDF validation fixture
description: Why advert-PDF integration checks must not mutate their common brand-asset fixture concurrently.
---

Advert-PDF integration checks that alter brand assets, template rows, cache overrides, or fallback directories must serialize across processes.

**Why:** Parallel checks can overwrite the same cache and temporary database/filesystem state, producing contradictory HTTP responses even though each check passes in isolation.

**How to apply:** Any validation that mutates the advert-PDF fixture must participate in the shared process lock or use a fully isolated fixture.