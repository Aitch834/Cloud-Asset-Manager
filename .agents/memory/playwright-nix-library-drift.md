---
name: Playwright Nix library drift
description: Why repository Playwright tests can fail before launch after a browser update in the Replit Nix environment.
---

Playwright browser downloads can advance to a build whose shared-library needs are no longer satisfied by the hard-coded Nix store paths in the test launch configuration. The characteristic failure occurs before any test step and reports that Chromium cannot load `libglib-2.0.so.0`.

**Why:** Installing the matching Playwright Chromium binary fixed the missing-executable error, but installing glib/nss/dbus through workspace packages still did not expose those libraries to Chromium because the launch configuration constructs its own `LD_LIBRARY_PATH`.

**How to apply:** Treat this as test-infrastructure failure, not an app regression. Check the effective browser launch environment and replace stale hard-coded store paths with dynamically discovered current paths before rerunning browser specs.