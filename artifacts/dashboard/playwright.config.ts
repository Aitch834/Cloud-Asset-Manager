import { defineConfig, devices } from "@playwright/test";
import {
  closeSync,
  existsSync,
  openSync,
  readSync,
  readdirSync,
} from "node:fs";
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

const ELF_CLASS_BY_ARCH: Partial<Record<NodeJS.Architecture, number>> = {
  ia32: 1,
  x64: 2,
  arm: 1,
  arm64: 2,
};

/** Check the ELF class without running `file`, so discovery also works when
 * Playwright loads this ESM config in a minimal non-interactive environment. */
function isHostArchitecture(libraryPath: string): boolean {
  let descriptor: number | undefined;
  try {
    const header = Buffer.allocUnsafe(5);
    descriptor = openSync(libraryPath, "r");
    if (readSync(descriptor, header, 0, header.length, 0) !== header.length) {
      return false;
    }
    return (
      header[0] === 0x7f &&
      header.subarray(1, 4).toString() === "ELF" &&
      header[4] === ELF_CLASS_BY_ARCH[process.arch]
    );
  } catch {
    return false;
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

function packageVersion(storeEntry: string): number[] {
  const match = storeEntry.match(/-(\d+(?:\.\d+)+)(?:-|$)/);
  return match ? match[1].split(".").map(Number) : [];
}

function comparePackageVersionsNewestFirst(a: string, b: string): number {
  const aVersion = packageVersion(a);
  const bVersion = packageVersion(b);
  const length = Math.max(aVersion.length, bVersion.length);

  for (let index = 0; index < length; index += 1) {
    const difference = (bVersion[index] ?? 0) - (aVersion[index] ?? 0);
    if (difference !== 0) return difference;
  }

  return a.localeCompare(b);
}

let nixStoreEntries: string[] | undefined;

function getNixStoreEntries(): string[] {
  if (nixStoreEntries) return nixStoreEntries;
  try {
    nixStoreEntries = readdirSync("/nix/store");
  } catch {
    nixStoreEntries = [];
  }
  return nixStoreEntries;
}

function findCompatibleNixLib(
  packageName: RegExp,
  requiredLibrary: string,
): string | undefined {
  try {
    const entries = getNixStoreEntries()
      .filter((entry) => packageName.test(entry))
      .sort(comparePackageVersionsNewestFirst);

    for (const entry of entries) {
      const libDir = path.join("/nix/store", entry, "lib");
      if (isHostArchitecture(path.join(libDir, requiredLibrary))) return libDir;
    }
  } catch {
    // /nix/store does not exist outside NixOS; Playwright's bundled browser
    // discovery remains the fallback in those environments.
  }

  return undefined;
}

/** Discover additional LD_LIBRARY_PATH entries needed by the Chromium
 * headless shell in the NixOS Replit container. Store hashes and package
 * versions change between images, and both 32-bit and 64-bit outputs may be
 * present, so only libraries matching the Node/Chromium architecture are used. */
function buildNixLibPath(): string {
  const discoveredNixPaths = [
    findCompatibleNixLib(/-glib-\d/, "libglib-2.0.so.0"),
    findCompatibleNixLib(/-nss-\d/, "libnss3.so"),
    findCompatibleNixLib(/-nspr-\d/, "libnspr4.so"),
    findCompatibleNixLib(/-dbus-\d.*-lib$/, "libdbus-1.so.3"),
    findCompatibleNixLib(/-atk-\d/, "libatk-1.0.so.0"),
    // ATK 2.38 is packaged with its matching bridge in at-spi2-atk. Newer
    // at-spi2-core bridges expect symbols that the installed ATK ABI lacks.
    findCompatibleNixLib(/-at-spi2-atk-\d/, "libatk-bridge-2.0.so.0"),
    findCompatibleNixLib(/-at-spi2-core-\d/, "libatspi.so.0"),
    findCompatibleNixLib(/-cups-\d.*-lib$/, "libcups.so.2"),
    findCompatibleNixLib(/-libdrm-\d/, "libdrm.so.2"),
    findCompatibleNixLib(/-libxkbcommon-\d/, "libxkbcommon.so.0"),
    findCompatibleNixLib(/-mesa-\d/, "libgbm.so.1"),
    findCompatibleNixLib(/-pango-\d/, "libpango-1.0.so.0"),
    findCompatibleNixLib(/-cairo-\d/, "libcairo.so.2"),
    findCompatibleNixLib(/-alsa-lib-\d/, "libasound.so.2"),
    findCompatibleNixLib(/-libX11-\d/, "libX11.so.6"),
    findCompatibleNixLib(/-libXcomposite-\d/, "libXcomposite.so.1"),
    findCompatibleNixLib(/-libXdamage-\d/, "libXdamage.so.1"),
    findCompatibleNixLib(/-libXext-\d/, "libXext.so.6"),
    findCompatibleNixLib(/-libXfixes-\d/, "libXfixes.so.3"),
    findCompatibleNixLib(/-libXrandr-\d/, "libXrandr.so.2"),
    findCompatibleNixLib(/-libxcb-\d/, "libxcb.so.1"),
  ].filter((entry): entry is string => Boolean(entry));

  const profileLib = path.join(
    process.env.HOME ?? "/home/runner",
    ".nix-profile",
    "lib",
  );
  return [
    ...discoveredNixPaths,
    existsSync(profileLib) ? profileLib : "",
    process.env.LD_LIBRARY_PATH ?? "",
  ]
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
      // Do not override executablePath with a Nix-provided Chromium. Playwright
      // must launch the browser revision matching @playwright/test, installed
      // with `pnpm run test:e2e:install-browser`.
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
