---
name: Dashboard component-test DOM setup
description: Runtime configuration required for dashboard DOM interaction tests.
---

Dashboard unit tests default to Node. DOM interaction tests should opt into JSDOM in the test file and Vitest should apply the same Vite React transform as the application.

**Why:** A path-based environment matcher did not activate for a shared UI test under the installed Vitest version. The per-file JSDOM directive reliably creates the DOM, and the React transform prevents browser components from compiling to missing global React references.

**How to apply:** When adding a dashboard test that renders and clicks components, use the per-file environment directive and keep the React Vite plugin in the Vitest configuration. Add test-only DOM utilities as direct dashboard dependencies rather than relying on another workspace package's installation.