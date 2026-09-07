#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const websiteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const viteBin = path.resolve(websiteDir, "node_modules/vite/bin/vite.js");
const pricingData = fs.readFileSync(
  path.join(websiteDir, "src/lib/pricing-data.ts"),
  "utf8",
);
const smsPriceMatch = pricingData.match(
  /export const SMS_ADDON_PRICE\s*=\s*(\d+(?:\.\d+)?)/,
);

assert.ok(smsPriceMatch, "SMS_ADDON_PRICE is defined in canonical pricing data");
const expectedSmsPrice = Number(smsPriceMatch[1]);

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

async function waitForWebsite(url, child) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`Vite exited before becoming ready (code ${child.exitCode}).`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Timed out waiting for the website test server.");
}

function findChromiumExecutable() {
  const candidates = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    process.env.CHROMIUM_PATH,
    "/repl/tools/bin/chromium",
    chromium.executablePath(),
  ].filter(Boolean);
  const nixStore = "/nix/store";
  if (fs.existsSync(nixStore)) {
    for (const entry of fs.readdirSync(nixStore)) {
      if (!entry.includes("playwright-browsers-chromium")) continue;
      candidates.push(path.join(nixStore, entry, "chrome-linux", "chrome"));
    }
  }
  return candidates.find(candidate => fs.existsSync(candidate));
}

const port = await getFreePort();
const baseUrl = `http://127.0.0.1:${port}`;
const vite = spawn(process.execPath, [viteBin, "--host", "127.0.0.1"], {
  cwd: websiteDir,
  env: {
    ...process.env,
    NODE_ENV: "test",
    PORT: String(port),
    BASE_PATH: "/",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let serverOutput = "";
vite.stdout.on("data", chunk => { serverOutput += chunk; });
vite.stderr.on("data", chunk => { serverOutput += chunk; });

let browser;
try {
  await waitForWebsite(baseUrl, vite);
  const executablePath = findChromiumExecutable();
  assert.ok(executablePath, "A Chromium executable is available for the SMS pricing check.");
  browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.goto(`${baseUrl}/pricing`, { waitUntil: "networkidle" });
  await page.getByText(
    `SMS Alerts add-on: £${expectedSmsPrice}/month per farm`,
    { exact: true },
  ).waitFor();
  console.log("✓ Pricing page shows the canonical SMS Alerts add-on price.");

  await page.goto(`${baseUrl}/sectors`, { waitUntil: "networkidle" });
  await page.getByText(
    `Optional SMS Alerts are available for £${expectedSmsPrice}/month per farm.`,
    { exact: false },
  ).waitFor();
  console.log("✓ Sectors page shows the canonical SMS Alerts price.");
} catch (error) {
  if (serverOutput.trim()) {
    console.error("\nWebsite test server output:\n", serverOutput.trim());
  }
  throw error;
} finally {
  await browser?.close();
  vite.kill("SIGTERM");
}