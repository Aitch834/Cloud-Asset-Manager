import { defineConfig } from "@playwright/test";
import dashboardConfig from "./playwright.config";

export default defineConfig({
  ...dashboardConfig,
  testDir: "./scripts",
  testMatch: "browser-launch.smoke.spec.ts",
  timeout: 15_000,
  retries: 0,
  globalSetup: undefined,
  globalTeardown: undefined,
});