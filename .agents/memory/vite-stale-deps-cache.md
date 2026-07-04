---
name: Generic Vite dev-server stale deps/transform cache
description: Quick fix when a newly-added import (e.g. a new React hook) throws "X is not defined" or "Invalid hook call" in a Vite dev server, in artifacts WITHOUT the custom session-token plugin.
---

Symptom: you add a new named import (e.g. `useCallback` from `"react"`) to an existing
source file, the import line is correct in source, typecheck passes, but the running
Vite dev server still throws `ReferenceError: X is not defined` and/or "Invalid hook
call" in the browser console after HMR.

**Why:** Vite's dev server can serve a stale pre-bundled/transformed module graph
(`node_modules/.vite`) that predates the new import, especially after several rapid
HMR updates to the same file in one session.

**Fix:** `rm -rf <artifact_dir>/node_modules/.vite` then restart that artifact's
workflow. This is distinct from the test-dashboard custom-plugin cache bug (see
[test-dashboard-vite-cache.md](test-dashboard-vite-cache.md)) — plain artifacts
(admin-portal, dashboard, website) don't have that plugin, so a simple cache
directory wipe + restart is sufficient.
