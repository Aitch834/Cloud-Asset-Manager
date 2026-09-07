---
name: Playwright Nix library drift
description: Why repository Playwright tests can fail before launch after a browser update in the Replit Nix environment.
---

Playwright browser downloads can advance to a build whose shared-library needs are no longer satisfied by the hard-coded Nix store paths in the test launch configuration. The characteristic failure occurs before any test step and reports that Chromium cannot load `libglib-2.0.so.0`.

**Why:** Installing the matching Playwright Chromium binary fixed the missing-executable error, but installing glib/nss/dbus through workspace packages still did not expose those libraries to Chromium because the launch configuration constructs its own `LD_LIBRARY_PATH`.

The Nix store may also contain both 32-bit and 64-bit outputs for the same library version. An existing path is not necessarily compatible with the downloaded browser.

Newer browser revisions can additionally require GBM (`libgbm.so.1`), which may be absent even after Chromium and the usual glib/nss runtime packages are installed.

**How to apply:** Treat this as test-infrastructure failure, not an app regression. In ESM Playwright configs, use imported `node:fs` APIs rather than `require` for Nix-store discovery. Select candidate package outputs by checking the required shared object's ELF class against `process.arch`; package version or path existence alone cannot distinguish a same-version 32-bit output from its 64-bit counterpart. Put the selected compatible directories before inherited `LD_LIBRARY_PATH` entries.