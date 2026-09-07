/**
 * E2E: Viticulture Analytics block-performance vintage sorting.
 *
 * Seeds isolated data on the stable Highfield Vineyard fixture, which has the
 * Viticulture module enabled. Three active blocks provide opposite rankings
 * across two vintages, with one block deliberately missing the current vintage.
 */

import { expect, test, type Locator, type Page } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled
const CURRENT_VINTAGE = new Date().getFullYear();
const PRIOR_VINTAGE = CURRENT_VINTAGE - 1;
const RUN_TAG = `E2E-2101-${Date.now()}`;
const HIGH_CURRENT = `${RUN_TAG}-high-current`;
const HIGH_PRIOR = `${RUN_TAG}-high-prior`;
const MISSING_CURRENT = `${RUN_TAG}-missing-current`;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type ApiRecord = Record<string, unknown>;

function apiBase(): string {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

function getTestUserEmail(): string {
  const emailFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_EMAIL_FILE!);
  if (!fs.existsSync(emailFile)) {
    throw new Error("global-setup did not run — .test-user-email missing");
  }
  return fs.readFileSync(emailFile, "utf8").trim();
}

async function devFetch(url: string, init: RequestInit = {}): Promise<ApiRecord> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers as Record<string, string> | undefined),
      "x-dev-bypass": DEV_BYPASS,
      "x-tenant-slug": TENANT_SLUG,
    },
  });
  if (!response.ok) {
    throw new Error(`${init.method ?? "GET"} ${url} → ${response.status}: ${await response.text()}`);
  }
  return response.json() as Promise<ApiRecord>;
}

async function createBlock(blockName: string): Promise<number> {
  const response = await devFetch(`${apiBase()}/api/farms/${FARM_ID}/vineyard-blocks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blockName, variety: "Chardonnay", areaHa: 1 }),
  });
  const blockId = Number((response.record as ApiRecord).id);
  if (!Number.isInteger(blockId) || blockId <= 0) {
    throw new Error("Vineyard block creation returned no id");
  }

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const list = await devFetch(`${apiBase()}/api/farms/${FARM_ID}/vineyard-blocks`);
    if (((list.records ?? []) as ApiRecord[]).some(record => Number(record.id) === blockId)) {
      return blockId;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Created vineyard block ${blockId} was not readable after retries`);
}

async function seedHarvest(blockId: number, vintage: number, yieldKg: number): Promise<number> {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    const result = await db.query<{ id: number }>(
      `INSERT INTO vineyard_harvest
         (farm_id, block_id, vintage_year, harvest_date, yield_kg)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [FARM_ID, blockId, vintage, `${vintage}-09-15`, yieldKg],
    );
    return Number(result.rows[0].id);
  } finally {
    await db.end();
  }
}

async function verifyEnabledFixture(): Promise<void> {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    const result = await db.query(
      `SELECT 1
       FROM farms f
       JOIN subscriptions s ON s.farm_id = f.id AND s.tenant_id = f.tenant_id
       JOIN modules m ON m.id = s.module_id
       WHERE f.id = $1
         AND f.sector_viticulture = true
         AND m.key IN ('viticulture', 'organic-viticulture')
         AND (s.status = 'active' OR (s.status = 'trial' AND (s.current_period_end IS NULL OR s.current_period_end > NOW())))
       LIMIT 1`,
      [FARM_ID],
    );
    if (result.rowCount !== 1) {
      throw new Error("Analytics sort setup failed: Highfield Vineyard is not viticulture-enabled");
    }
  } finally {
    await db.end();
  }
}

async function cleanup(harvestIds: number[], blockIds: number[]): Promise<void> {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    if (harvestIds.length > 0) {
      await db.query("DELETE FROM vineyard_harvest WHERE id = ANY($1::int[])", [harvestIds]);
    }
    if (blockIds.length > 0) {
      await db.query("DELETE FROM vineyard_blocks WHERE id = ANY($1::int[])", [blockIds]);
    }
  } finally {
    await db.end();
  }
}

async function blockNames(table: Locator): Promise<string[]> {
  return (await table.locator("tbody tr td:first-child").allTextContents())
    .filter(name => name.startsWith(RUN_TAG));
}

test("vintage headers sort block performance and keep missing yields last", async ({ page }) => {
  const blockIds: number[] = [];
  const harvestIds: number[] = [];
  const browserErrors: string[] = [];
  const requestErrors: string[] = [];

  page.on("pageerror", error => browserErrors.push(error.message));
  page.on("response", response => {
    if (response.url().includes("/api/") && response.status() >= 400) {
      requestErrors.push(`${response.status()} ${response.request().method()} ${response.url()}`);
    }
  });

  try {
    await verifyEnabledFixture();
    const highCurrentId = await createBlock(HIGH_CURRENT);
    const highPriorId = await createBlock(HIGH_PRIOR);
    const missingCurrentId = await createBlock(MISSING_CURRENT);
    blockIds.push(highCurrentId, highPriorId, missingCurrentId);

    harvestIds.push(
      await seedHarvest(highCurrentId, CURRENT_VINTAGE, 3000),
      await seedHarvest(highCurrentId, PRIOR_VINTAGE, 1000),
      await seedHarvest(highPriorId, CURRENT_VINTAGE, 1000),
      await seedHarvest(highPriorId, PRIOR_VINTAGE, 4000),
      await seedHarvest(missingCurrentId, PRIOR_VINTAGE, 2000),
    );

    await page.goto("/dashboard/");
    await clerk.signIn({ page, emailAddress: getTestUserEmail() });
    await page.waitForLoadState("networkidle");
    await page.evaluate(
      ([slug, farmId, currentVintage]) => {
        localStorage.setItem("farmtrac_tenantSlug", slug);
        localStorage.setItem(
          "farmtrac-storage",
          JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
        );
        localStorage.setItem(`viticulture-analytics-year-filter-${farmId}`, currentVintage);
        localStorage.removeItem(`viticulture-analytics-block-performance-sort-vintage-filter-${farmId}`);
        localStorage.removeItem(`viticulture-analytics-block-performance-sort-direction-filter-${farmId}`);
      },
      [TENANT_SLUG, FARM_ID, String(CURRENT_VINTAGE)] as [string, number, string],
    );
    await page.reload({ waitUntil: "networkidle" });
    await page.goto("/dashboard/viticulture");
    await page.getByRole("button", { name: "Analytics", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Viticulture Analytics" })).toBeVisible({
      timeout: 20_000,
    });
    // Startup requests for unrelated global navigation badges are outside this
    // flow; from here onward, capture only errors caused while using Analytics.
    browserErrors.length = 0;
    requestErrors.length = 0;

    const compareSelect = page.getByRole("combobox").nth(1);
    await compareSelect.click();
    await page.getByRole("option", { name: String(PRIOR_VINTAGE), exact: true }).click();

    const table = page
      .getByRole("heading", { name: /Block Performance — Yield/ })
      .locator("xpath=../following-sibling::div//table");
    await expect(table).toBeVisible();

    const currentHeader = table.getByRole("button", {
      name: `Sort by ${CURRENT_VINTAGE} yield`,
    });
    await expect(currentHeader.locator("svg.lucide-arrow-up-down")).toBeVisible();
    await currentHeader.click();
    await expect(currentHeader.locator("svg.lucide-arrow-down")).toBeVisible();
    await expect.poll(() => blockNames(table)).toEqual([
      HIGH_CURRENT,
      HIGH_PRIOR,
      MISSING_CURRENT,
    ]);

    await currentHeader.click();
    await expect(currentHeader.locator("svg.lucide-arrow-up")).toBeVisible();
    await expect.poll(() => blockNames(table)).toEqual([
      HIGH_PRIOR,
      HIGH_CURRENT,
      MISSING_CURRENT,
    ]);

    const priorHeader = table.getByRole("button", {
      name: `Sort by ${PRIOR_VINTAGE} yield`,
    });
    await priorHeader.click();
    await expect(priorHeader.locator("svg.lucide-arrow-down")).toBeVisible();
    await expect(currentHeader.locator("svg.lucide-arrow-up-down")).toBeVisible();
    await expect.poll(() => blockNames(table)).toEqual([
      HIGH_PRIOR,
      MISSING_CURRENT,
      HIGH_CURRENT,
    ]);

    expect(browserErrors, "browser errors during Analytics sorting").toEqual([]);
    expect(requestErrors, "failed API requests during Analytics sorting").toEqual([]);
  } finally {
    await cleanup(harvestIds, blockIds);
  }
});