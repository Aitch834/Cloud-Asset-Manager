---
name: Playwright Nix library drift
description: Why repository Playwright tests can fail before launch after a browser update in the Replit Nix environment.
---

Playwright browser downloads can advance to a build whose shared-library needs are no longer satisfied by the hard-coded Nix store paths in the test launch configuration. The characteristic failure occurs before any test step and reports that Chromium cannot load `libglib-2.0.so.0`.

**Why:** Installing the matching Playwright Chromium binary fixed the missing-executable error, but installing glib/nss/dbus through workspace packages still did not expose those libraries to Chromium because the launch configuration constructs its own `LD_LIBRARY_PATH`.

The Nix store may also contain both 32-bit and 64-bit outputs for the same library version. An existing path is not necessarily compatible with the downloaded browser.

Newer browser revisions can additionally require GBM (`libgbm.so.1`), which may be absent even after Chromium and the usual glib/nss runtime packages are installed.

ATK and its accessibility bridge must also come from an ABI-compatible package generation. Selecting the newest `at-spi2-core` bridge alongside the separately installed ATK can launch-fail with an undefined `atk_object_get_help_text` symbol; the matching `at-spi2-atk` bridge avoids that mismatch while `libatspi` can still come from `at-spi2-core`.

**How to apply:** Treat this as test-infrastructure failure, not an app regression. In ESM Playwright configs, use imported `node:fs` APIs rather than `require` for Nix-store discovery. Read `/nix/store` once per config load and read only the first five bytes of candidate shared objects; repeatedly listing the store or loading whole `.so` files can add minutes before tests start. Select candidate outputs by checking the required shared object's ELF class against `process.arch`, preserve ATK/bridge ABI compatibility, include GBM when required, and put compatible directories before inherited `LD_LIBRARY_PATH` entries.