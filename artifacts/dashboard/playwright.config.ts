import { defineConfig, devices } from "@playwright/test";
import { execSync } from "child_process";
import * as path from "path";

/**
 * Playwright configuration for the BDE Farm Trac Dashboard.
 *
 * Run: cd artifacts/dashboard && pnpm exec playwright test
 *
 * Required environment variables (all already set in Replit dev env):
 *   CLERK_SECRET_KEY          Clerk backend secret
 *   VITE_CLERK_PUBLISHABLE_KEY  Clerk frontend publishable key
 *   DATABASE_URL              PostgreSQL connection string
 *   DEV_BYPASS_TOKEN          API dev-bypass token (defaults to "bde-dev-bypass-local")
 *
 * The dashboard and API server workflows must be running before executing tests.
 */

/** Discover additional LD_LIBRARY_PATH entries needed by the Chromium
 *  headless shell in the NixOS Replit container (glib, nss, dbus, etc.).
 *  Falls back gracefully if globs fail or nix store is unavailable. */
function buildNixLibPath(): string {
  const knownNixPaths = [
    // glib — required for every Chromium launch
    "/nix/store/2mi3dqfmc56502p1vdr4pgyf6jl3hw2a-glib-2.84.3/lib",
    "/nix/store/26hcp8h792wl0h52c5r94qakhvk6q717-glib-2.82.1/lib",
    "/nix/store/2k366jrbsra97gjfxwvrhvixjfxdach5-glib-2.74.1/lib",
    // nss / nspr — required for SSL in Chromium
    "/nix/store/2jsrwgic869zynqljiqa4g7dqzpwm2yd-nss-3.101.2/lib",
    "/nix/store/1ag0klg91f6gnhlx0iazgysahngp4rf8-nss-3.90.2/lib",
    // dbus
    "/nix/store/231d6mmkylzr80pf30dbywa9x9aryjgy-dbus-1.14.10-lib/lib",
  ].filter((p) => {
    try {
      const fs = require("fs") as typeof import("fs");
      return fs.existsSync(p);
    } catch {
      return false;
    }
  });

  const profileLib = path.join(
    process.env.HOME ?? "/home/runner",
    ".nix-profile",
    "lib",
  );
  return [profileLib, ...knownNixPaths, process.env.LD_LIBRARY_PATH ?? ""]
    .filter(Boolean)
    .join(":");
}

const nixLibPath = buildNixLibPath();

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 1,
  workers: 1,

  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",

  use: {
    // Dashboard base URL — served via the Replit proxy at /dashboard/
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",

    launchOptions: {
      // Pass the Nix store library paths so the Chromium headless shell can
      // find glib, nss, etc. in the NixOS Replit container.
      env: nixLibPath ? { LD_LIBRARY_PATH: nixLibPath } : {},
    },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
