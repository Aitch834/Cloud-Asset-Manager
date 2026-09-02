import { defineConfig, devices } from "@playwright/test";
import { execSync } from "child_process";
import { existsSync } from "node:fs";
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
    // NOTE: the 2.84.3 build available in this environment is 32-bit and
    // breaks Chromium with ELFCLASS32, so we intentionally prefer the 64-bit
    // 2.82.1 / 2.74.1 builds below.
    "/nix/store/26hcp8h792wl0h52c5r94qakhvk6q717-glib-2.82.1/lib",
    "/nix/store/2k366jrbsra97gjfxwvrhvixjfxdach5-glib-2.74.1/lib",
    // nss / nspr — required for SSL in Chromium
    "/nix/store/2jsrwgic869zynqljiqa4g7dqzpwm2yd-nss-3.101.2/lib",
    "/nix/store/1ag0klg91f6gnhlx0iazgysahngp4rf8-nss-3.90.2/lib",
    // dbus
    "/nix/store/231d6mmkylzr80pf30dbywa9x9aryjgy-dbus-1.14.10-lib/lib",
  ].filter(existsSync);

  const profileLib = path.join(
    process.env.HOME ?? "/home/runner",
    ".nix-profile",
    "lib",
  );
  return [profileLib, ...knownNixPaths, process.env.LD_LIBRARY_PATH ?? ""]
    .filter(Boolean)
    .join(":");
}

function findChromiumExecutable(): string | undefined {
  try {
    const result = execSync(
      "ls -d /nix/store/*playwright-chromium/chrome-linux/chrome-wrapper 2>/dev/null | head -n 1",
      { encoding: "utf-8" },
    ).trim();
    return result || undefined;
  } catch {
    return undefined;
  }
}

const nixLibPath = buildNixLibPath();
const chromiumExecutablePath = findChromiumExecutable();

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
      executablePath: chromiumExecutablePath,
      // Pass the Nix store library paths so the Chromium headless shell can
      // find glib, nss, etc. in the NixOS Replit container.
      env: nixLibPath
        ? { ...process.env, LD_LIBRARY_PATH: nixLibPath }
        : { ...process.env },
    },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
