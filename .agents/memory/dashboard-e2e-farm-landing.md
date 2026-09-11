---
name: Dashboard E2E farm landing
description: How authenticated browser checks should select a farm when sign-in can land on different pages.
---

Authenticated dashboard browser checks can land directly on the farm picker when no farm is selected, or on the dashboard/sidebar when a farm is already persisted. Farm-selection helpers must handle both states instead of always waiting for the “Switch Farm” button.

**Why:** Programmatic Clerk sign-in can redirect to the farm picker before test setup runs. Waiting only for the authenticated sidebar then consumes the full test timeout even though authentication succeeded.

**How to apply:** After sign-in, inspect the current route. If it is the farm picker, choose the required farm directly. Otherwise open “Switch Farm,” wait for the picker, then choose the farm.