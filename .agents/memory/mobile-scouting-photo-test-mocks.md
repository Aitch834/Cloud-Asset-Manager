---
name: Mobile scouting photo test mocks
description: Keep ScoutingPhotoSection integration-test helper mocks aligned with its pure lightbox helpers.
---

When ScoutingPhotoSection gains a pure helper import, every test that mocks scoutingLightboxHelpers must provide a behaviorally safe implementation for that helper.

**Why:** Missing helper exports make the component unmount during async photo loading, which can look like a lightbox-index or React test-renderer failure rather than a mock contract failure.

**How to apply:** When adding or changing scouting photo integration coverage, compare the module mock with the component's imports before diagnosing renderer errors.