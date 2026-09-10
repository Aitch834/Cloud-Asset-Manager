---
name: React Native host-mock style assertions
description: How to make rendered mobile style regressions reliable when tests replace React Native components with forwarded host wrappers.
---

When a mobile render test mocks React Native components as forwarded host elements, do not rely on a text node's `parent` or rendered host traversal to expose the surrounding container style. Assert the flattened style of visible text or icon nodes that carry the user-visible state.

**Why:** Forwarded host wrappers can add or collapse renderer layers, causing parent traversal and container-style searches to miss styles that are present in the source while direct visible-node style assertions remain stable.

**How to apply:** In focused React Native rendering tests with host mocks, use `StyleSheet.flatten` on queried visible nodes. Only assert wrapper backgrounds when the test uses a renderer setup known to preserve those wrapper nodes.