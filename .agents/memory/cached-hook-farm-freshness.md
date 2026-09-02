---
name: Cached hook farm freshness
description: The freshness contract for farm-scoped cached mobile hooks and their consumers
---

Farm-scoped cached hooks must return an empty item list whenever the current data provenance does not match the requested farm. Effect-time clearing may still keep internal state tidy, but it is not the safety boundary.

**Why:** React effects run after a changed-farm render commits. Clearing state in an effect still lets that first render and its consumer effects observe records from the previous farm.

**How to apply:** Derive the public item list during render from the requested farm and the loaded farm. Use a real React rerender test to prove no render or consumer effect for Farm B can observe Farm A items.