import { execFileSync } from "node:child_process";
import fs from "node:fs";

const DEFAULT_KNOWN_CHROMIUM_PATH =
  "/nix/store/0n9rl5l9syy808xi9bk4f6dhnfrvhkww-playwright-browsers-chromium/chromium-1080/chrome-linux/chrome";

function existingPath(candidate) {
  const value = candidate?.trim();
  return value && fs.existsSync(value) ? value : null;
}

function findOnPath() {
  for (const command of [
    "chromium",
    "chromium-browser",
    "google-chrome",
    "google-chrome-stable",
  ]) {
    try {
      const discoveredPath = execFileSync("which", [command], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
      if (existingPath(discoveredPath)) return discoveredPath;
    } catch {
      // This command is not installed; try the next known browser name.
    }
  }
  return null;
}

export async function loadLeafletBrowserRuntime(generatorName) {
  let chromium;
  try {
    ({ chromium } = await import("playwright-core"));
  } catch {
    console.warn(
      `⚠  Leaflet ${generatorName} generation skipped: playwright-core is not installed.\n` +
        "   Existing generated files remain in place.",
    );
    return null;
  }

  const executablePath =
    existingPath(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) ??
    existingPath(process.env.CHROMIUM_PATH) ??
    findOnPath() ??
    existingPath(process.env.LEAFLET_PDF_KNOWN_CHROMIUM_PATH ?? DEFAULT_KNOWN_CHROMIUM_PATH) ??
    (process.env.LEAFLET_SKIP_PLAYWRIGHT_BROWSER_PATH === "1"
      ? null
      : existingPath(chromium.executablePath()));

  if (!executablePath) {
    console.warn(
      `⚠  Leaflet ${generatorName} generation skipped: Chromium was not found in the ` +
        "configured path, PATH, known Nix location, or Playwright installation.\n" +
        "   Existing generated files remain in place.",
    );
    return null;
  }

  return { chromium, executablePath };
}