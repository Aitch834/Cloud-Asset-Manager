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

function readShareState(page) {
  const url = new URL(page.url());
  const farmsRaw = url.searchParams.get("farms");
  assert.ok(farmsRaw, "farms query parameter is present");
  return {
    farms: JSON.parse(farmsRaw),
    sector: url.searchParams.get("sector"),
  };
}

async function expectShareState(page, label, expectedFarms, expectedSector) {
  await page.waitForFunction(
    ({ farms, sector }) => {
      const params = new URLSearchParams(window.location.search);
      return params.get("farms") === JSON.stringify(farms)
        && params.get("sector") === sector;
    },
    { farms: expectedFarms, sector: expectedSector },
  );
  assert.deepEqual(readShareState(page), {
    farms: expectedFarms,
    sector: expectedSector,
  });
  console.log(`  ✓ ${label}`);
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
  assert.ok(executablePath, "A Chromium executable is available for the pricing browser check.");
  browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  console.log("\nPricing share-link interactions:");
  await page.goto(`${baseUrl}/pricing`, { waitUntil: "networkidle" });

  const initial = [[
    "Farm 1",
    ["red-tractor-compliance", "field-crop-management", "equipment-workshop"],
  ]];
  await expectShareState(page, "initial configuration is placed in the URL", initial, null);

  await page.getByRole("button", { name: /^Field & Crop Management £20\/mo/ }).click();
  const afterModuleToggle = [[
    "Farm 1",
    ["red-tractor-compliance", "equipment-workshop"],
  ]];
  await expectShareState(
    page,
    "module toggle updates farms and preserves the All-sector URL state",
    afterModuleToggle,
    null,
  );

  await page.getByRole("button", { name: /^Livestock \d+$/ }).click();
  await expectShareState(
    page,
    "sector change preserves farms and writes the sector",
    afterModuleToggle,
    "Livestock",
  );

  await page.getByRole("button", { name: "Add Farm" }).click();
  const afterAdd = [
    ...afterModuleToggle,
    ["Farm 2", ["red-tractor-compliance"]],
  ];
  await expectShareState(page, "adding a farm updates farms and preserves sector", afterAdd, "Livestock");

  await page.getByRole("button", { name: "Rename Farm 2" }).click();
  const nameInput = page.getByRole("textbox", { name: "Name for Farm 2" });
  await nameInput.fill("Hill Farm");
  await page.keyboard.press("Enter");
  const afterRename = [
    ...afterModuleToggle,
    ["Hill Farm", ["red-tractor-compliance"]],
  ];
  await expectShareState(page, "renaming a farm updates farms and preserves sector", afterRename, "Livestock");

  await page.getByRole("button", { name: /^Livestock & Feed Management £35\/mo/ }).click();
  const afterSecondModuleToggle = [
    ...afterModuleToggle,
    ["Hill Farm", ["red-tractor-compliance", "livestock-management"]],
  ];
  await expectShareState(
    page,
    "second-farm module toggle updates farms and preserves sector",
    afterSecondModuleToggle,
    "Livestock",
  );

  await page.getByRole("button", { name: "Remove Farm 1" }).click();
  const finalFarms = [["Hill Farm", ["red-tractor-compliance", "livestock-management"]]];
  await expectShareState(page, "removing a farm updates farms and preserves sector", finalFarms, "Livestock");

  console.log("\nPricing share-link reload restoration:");
  await page.reload({ waitUntil: "networkidle" });
  await expectShareState(page, "reload preserves both query parameters", finalFarms, "Livestock");
  await page.getByRole("button", { name: "Hill Farm", exact: true }).waitFor();
  assert.equal(
    await page.getByRole("button", { name: "Hill Farm", exact: true }).getAttribute("aria-pressed"),
    "true",
    "restored farm is active after reload",
  );
  assert.equal(
    await page.getByRole("button", { name: /^Livestock \d+$/ }).getAttribute("aria-pressed"),
    null,
    "sector buttons do not use aria-pressed",
  );
  assert.match(
    await page.getByRole("button", { name: /^Livestock \d+$/ }).getAttribute("class"),
    /bg-brand-forest/,
    "restored sector is visibly active after reload",
  );
  assert.equal(
    await page.getByRole("button", { name: /^Livestock & Feed Management £35\/mo/ }).getAttribute("aria-pressed"),
    "true",
    "restored module selection remains active after reload",
  );
  console.log("  ✓ farm name, sector, and module selection restore in the UI");

  console.log("\n✓ Pricing share-link browser regression check passed.");
} catch (error) {
  if (serverOutput.trim()) {
    console.error("\nWebsite test server output:\n", serverOutput.trim());
  }
  throw error;
} finally {
  await browser?.close();
  vite.kill("SIGTERM");
}