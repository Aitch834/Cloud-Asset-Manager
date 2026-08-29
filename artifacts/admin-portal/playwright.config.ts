import { defineConfig, devices } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

/**
 * Playwright configuration for the BDE Admin Portal.
 *
 * Run: cd artifacts/admin-portal && pnpm exec playwright test
 *
 * Required environment variables (all already set in Replit dev env):
 *   DATABASE_URL              PostgreSQL connection string
 *   DEV_BYPASS_TOKEN          API dev-bypass token (defaults to "bde-dev-bypass-local")
 *
 * The admin-portal and API server workflows must be running before executing tests.
 */

/** Prefer a Nix-wrapped Chromium on Replit; it carries its own runtime libraries. */
function findNixChromium(): string | undefined {
  try {
    const candidates = fs.readdirSync("/nix/store")
      .map((entry) => {
        const match = entry.match(/-chromium-(\d+)\./);
        return match
          ? {
              major: Number(match[1]),
              executable: path.join("/nix/store", entry, "bin", "chromium"),
            }
          : null;
      })
      .filter(
        (candidate): candidate is { major: number; executable: string } =>
          candidate !== null && fs.existsSync(candidate.executable),
      )
      .sort((a, b) => b.major - a.major);
    return candidates[0]?.executable;
  } catch {
    return undefined;
  }
}

const nixChromium = findNixChromium();

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 1,
  workers: 1,

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",

    launchOptions: {
      executablePath: nixChromium,
    },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
