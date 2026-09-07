---
name: Mobile cover-action regression tests
description: How mobile photo cover tests stay aligned when request/state logic is extracted from a component
---

When a mobile photo action moves its request and local state transition into a shared helper, update both rendered-action tests and source-contract guards, plus any React Native mocks that enumerate helper exports.

**Why:** Static guards and lightweight component harnesses intentionally mock module boundaries; extracting a callback can otherwise make the full suite fail even though the production behavior is correct.

**How to apply:** Keep success assertions on the PATCH payload and the single-cover invariant, keep failure assertions on unchanged state and feedback, and update neighboring helper mocks whenever the component gains a new imported export.