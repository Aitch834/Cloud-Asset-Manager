---
name: Viticulture browser test fixture
description: The dashboard browser test needs an active Viticulture farm before tab-level checks can run.
---

Viticulture tab smoke tests require a selectable farm with the Viticulture module enabled. A successful dashboard authentication is not sufficient: the route can render the inactive-module state before any tabs or print controls are mounted.

**Why:** Authentication can succeed while the module gate stops the route before any tabs or print controls mount, making tab-level browser verification impossible.

**How to apply:** Use an active Viticulture farm fixture for tab-level checks and treat the inactive-module state as a fixture blocker, not a component failure.