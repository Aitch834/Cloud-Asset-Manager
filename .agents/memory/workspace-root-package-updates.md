---
name: Workspace-root package updates
description: How to reconcile dependency changes when the package installer rejects a pnpm workspace-root dependency.
---

The language-package installer cannot express pnpm's required workspace-root `-w` flag. If a reviewed dependency change intentionally affects the workspace root, edit the relevant manifests first, then use `pnpm install --lockfile-only` followed by `pnpm install --frozen-lockfile`.

**Why:** Passing the root package alone is rejected as ambiguous, while passing `-w` as a package token is rejected by the installer interface.

**How to apply:** Use this only for intentional pnpm monorepo-root dependency updates after confirming the package belongs at the root. Continue to prefer the package installer for ordinary package changes.