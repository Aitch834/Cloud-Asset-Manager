---
name: Workspace-root package updates
description: How to reconcile dependency changes when the package installer rejects a pnpm workspace-root dependency.
---

The language-package installer cannot target a pnpm workspace package or express pnpm's required workspace-root `-w` flag. If a reviewed dependency change intentionally affects a workspace package, run the package manager from that package directory; for a root dependency, edit the relevant manifests first, then use `pnpm install --lockfile-only` followed by `pnpm install --frozen-lockfile`.

**Why:** Passing the root package alone is rejected as ambiguous, passing `-w` as a package token is rejected by the installer interface, and workspace-scoped installs are not exposed by that interface.

**How to apply:** Use this only for intentional pnpm monorepo dependency updates after confirming where the package belongs. Prefer the package installer for ordinary package changes; when it cannot express the needed workspace target, use the package manager in the correct package directory and review the manifest/lockfile diff.