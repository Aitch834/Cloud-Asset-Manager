---
name: Viticulture browser test fixture
description: The dashboard browser test needs an active Viticulture farm before tab-level checks can run.
---

Viticulture tab smoke tests require a selectable farm with the Viticulture module enabled. A successful dashboard authentication is not sufficient: the route can render the inactive-module state before any tabs or print controls are mounted.

**Why:** Authentication can succeed while the module gate stops the route before any tabs or print controls mount, making tab-level browser verification impossible.

**How to apply:** When testing Viticulture tab UI, seed or select an active Viticulture farm first; treat the inactive-module state as a test-fixture blocker rather than a component failure.

Read-only browser fixtures can stub the farm dashboard's active subscription plus the
specific register endpoints needed by a tab. After Clerk sign-in, navigate directly
to the Viticulture route after seeding local storage; an intermediate full reload can
lose the test session in the preview environment. Perform the reload assertion only
after the fixture tab is visibly populated.

**Why:** This keeps release checks independent of shared tenant data while avoiding
the preview's occasional session loss during pre-navigation reloads.

**How to apply:** For deterministic tab regressions, route-mock the smallest read
surface, use the existing active farm fixture, and reserve reload checks for the
already-authenticated populated page.