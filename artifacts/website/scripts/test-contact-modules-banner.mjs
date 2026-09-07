#!/usr/bin/env node
/**
 * Regression tests for the Contact page's module-selection banner.
 *
 * The Pricing page writes the selected module IDs to ?modules=. These tests
 * mirror Contact.tsx's pure query-string and banner-display logic so the
 * banner remains useful as the pricing URL synchronisation changes.
 *
 * Run with: node artifacts/website/scripts/test-contact-modules-banner.mjs
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const AVAILABLE_MODULES = [
  { id: "red-tractor-compliance", label: "Red Tractor Compliance" },
  { id: "field-crop-management", label: "Field & Crop Management" },
  { id: "finance-business", label: "Finance & Business" },
  { id: "viticulture", label: "Viticulture" },
];

const SECTOR_DEFAULT_MODULES = {
  Arable: ["field-crop-management", "finance-business"],
};

const VALID_MODULE_IDS = new Set(AVAILABLE_MODULES.map(({ id }) => id));
const VALID_SECTOR_NAMES = new Set(Object.keys(SECTOR_DEFAULT_MODULES));

// Mirrors Contact.tsx's getModulesParam().
function getModulesParam(search) {
  const raw = new URLSearchParams(search).get("modules");
  if (!raw) return null;
  const ids = raw
    .split(",")
    .map((id) => id.trim())
    .filter((id) => VALID_MODULE_IDS.has(id));
  return ids.length > 0 ? ids : null;
}

// Mirrors Contact.tsx's getSectorParam().
function getSectorParam(search) {
  const sector = new URLSearchParams(search).get("sector");
  return sector && VALID_SECTOR_NAMES.has(sector) ? sector : null;
}

// Represents the content the Contact banner renders from those parameters.
function getBanner(search) {
  const sector = getSectorParam(search);
  const modules = getModulesParam(search);
  if (!sector && !modules) return null;

  if (!modules) {
    return {
      heading: `Sector: ${sector}`,
      pills: [],
      usesSectorDefaults: true,
    };
  }

  return {
    heading: sector
      ? `Sector: ${sector} — from your Pricing calculator selection:`
      : "From your Pricing calculator selection:",
    pills: modules
      .map((id) => AVAILABLE_MODULES.find((module) => module.id === id)?.label)
      .filter(Boolean),
    usesSectorDefaults: false,
  };
}

let passed = 0;
let failed = 0;

function check(label, condition, detail = "") {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

console.log("\nKnown module IDs render the expected banner pills:");
{
  const banner = getBanner("?modules=field-crop-management,finance-business");
  check("banner is visible", banner !== null);
  check("selection heading is shown", banner?.heading === "From your Pricing calculator selection:");
  check(
    "known module labels are rendered in URL order",
    JSON.stringify(banner?.pills) === JSON.stringify(["Field & Crop Management", "Finance & Business"]),
  );
}

console.log("\nUnknown module IDs are ignored:");
{
  const banner = getBanner("?modules=field-crop-management,unknown-module,ghost-module");
  check("known module remains visible", banner?.pills?.includes("Field & Crop Management"));
  check("unknown module is not rendered", !banner?.pills?.includes("unknown-module"));
  check("unknown module is not rendered (second ID)", !banner?.pills?.includes("Ghost Module"));
  check("only known module pill remains", banner?.pills?.length === 1);
  check("unknown-only selection does not create an empty banner", getBanner("?modules=unknown-module") === null);
}

console.log("\nSector and explicit modules render together:");
{
  const banner = getBanner("?sector=Arable&modules=viticulture,finance-business");
  check(
    "combined heading identifies the sector and pricing selection",
    banner?.heading === "Sector: Arable — from your Pricing calculator selection:",
  );
  check(
    "explicit module pills are rendered",
    JSON.stringify(banner?.pills) === JSON.stringify(["Viticulture", "Finance & Business"]),
  );
  check("explicit modules take priority over sector defaults", !banner?.pills?.includes("Field & Crop Management"));
  check("sector defaults are not used for explicit selections", banner?.usesSectorDefaults === false);
}

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);

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

async function expectContactBanner(page, label) {
  const heading = "Sector: Arable — from your Pricing calculator selection:";
  const expectedPills = ["Viticulture", "Finance & Business"];
  const banner = page.getByText(heading, { exact: true }).locator("..");

  await banner.waitFor();
  assert.deepEqual(
    await banner.locator("span").allTextContents(),
    expectedPills,
    `${label}: exact module pills remain in URL order`,
  );
  console.log(`  ✓ ${label}`);
}

const websiteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const viteBin = path.resolve(websiteDir, "node_modules/vite/bin/vite.js");
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
  assert.ok(executablePath, "A Chromium executable is available for the Contact browser check.");
  browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  const contactPath = "/contact?sector=Arable&modules=viticulture,finance-business";

  console.log("\nContact banner browser-history navigation:");
  await page.goto(`${baseUrl}${contactPath}`, { waitUntil: "networkidle" });
  await expectContactBanner(page, "combined sector and modules render on direct arrival");

  await page.getByRole("link", { name: "Pricing", exact: true }).first().click();
  await page.waitForURL(url => url.pathname === "/pricing");

  await page.goBack({ waitUntil: "networkidle" });
  assert.equal(new URL(page.url()).pathname + new URL(page.url()).search, contactPath);
  await expectContactBanner(page, "browser back restores the heading and exact pills");

  await page.goForward({ waitUntil: "networkidle" });
  assert.equal(new URL(page.url()).pathname, "/pricing");
  console.log("  ✓ browser forward restores the page navigated away to");
} catch (error) {
  console.error(error);
  if (serverOutput.trim()) {
    console.error("\nVite output:\n" + serverOutput.trim());
  }
  process.exitCode = 1;
} finally {
  await browser?.close();
  vite.kill("SIGTERM");
}
