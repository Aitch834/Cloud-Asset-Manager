---
name: Broken package command shims
description: How to distinguish workspace command-shim corruption from source or package failures.
---

If a package script fails with both “Permission denied” and `spawn ENOENT`, inspect the corresponding `node_modules/.bin` command. A zero-byte regular file is a broken command shim, not evidence that the compiler, dev server, or application source failed.

**Why:** The installed package can still be present in the pnpm store while its executable shim is empty. Normal typecheck, build, and workflow commands then fail before the package starts, which can be mistaken for a code regression.

**How to apply:** Confirm the shim size first. For read-only verification, invoke the installed package’s JavaScript entry point with `node`. Treat restoring dependency command shims as separate package/workspace maintenance rather than changing application code to work around it.