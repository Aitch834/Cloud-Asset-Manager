---
name: Gesture Race test mocks
description: How to mock react-native-gesture-handler Race compositions without producing impossible gesture state in component tests.
---

When a component uses `Gesture.Race`, a test mock must route an event sequence to only the recognizer that wins that race. Do not invoke every nested recognizer for the same synthetic event.

**Why:** Firing both double-tap and pan callbacks for one synthetic swipe can change zoom state before the pan ends. The component then correctly blocks navigation while zoomed, even though that state cannot occur for a real winning pan gesture.

**How to apply:** For focused component tests, make `Race` select the recognizer under test and forward the complete begin/update/end sequence to it. Also mark default-export mocks such as Reanimated with `__esModule: true` when Babel default-import interop is involved.