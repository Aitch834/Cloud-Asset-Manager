import { signInDashboard } from "./auth";
/**
 * E2E: Harvest block productivity exports.
 *
 * Seeds two blocks on the stable Highfield Vineyard fixture: one with a
 * positive area and one without an area. The test then reaches Harvest in the
 * authenticated dashboard, uses the search filter to isolate its records, and
 * downloads both block productivity exports through the visible UI.
 */

import { expect, test, type Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled
const RUN_TAG = `E2E-1901-${Date.now()}`;
const POSITIVE_BLOCK = `${RUN_TAG}-positive-area`;
const MISSING_AREA_BLOCK = `${RUN_TAG}-missing-area`;
const SINGLE_BLOCK_RUN_TAG = `E2E-2000-${Date.now()}`;
const SINGLE_BLOCK = `${SINGLE_BLOCK_RUN_TAG}-single-block`;
const ZERO_YIELD_CHEMISTRY_RUN_TAG = `E2E-2458-${Date.now()}`;
const ZERO_YIELD_CHEMISTRY_BLOCK = `${ZERO_YIELD_CHEMISTRY_RUN_TAG}-zero-yield-chemistry`;
const MULTI_VINTAGE_RUN_TAG = `E2E-2071-${Date.now()}`;
const MULTI_VINTAGE_BLOCK = `${MULTI_VINTAGE_RUN_TAG}-multi-vintage`;

const YEAR_SWITCH_RUN_TAG = `E2E-2384-${Date.now()}`;
const YEAR_SWITCH_BLOCK = `${YEAR_SWITCH_RUN_TAG}-year-switch`;
const VINTAGE_YEAR = new Date().getFullYear();
const HARVEST_DATE = `${VINTAGE_YEAR}-07-15`;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type ApiRecord = Record<string, unknown>;
type HarvestValues = {
  vintageYear?: number;
  brix?: number;
  ph?: number;
  titratableAcidityGl?: number;
  potentialAlcohol?: number;
};

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

async function devFetch(
  url: string,
  init: RequestInit = {},
): Promise<ApiRecord> {
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

async function createBlock(blockName: string, areaHa?: number): Promise<number> {
  const body: Record<string, unknown> = { blockName, variety: "Chardonnay" };
  if (areaHa !== undefined) body.areaHa = areaHa;

  const response = await devFetch(`${apiBase()}/api/farms/${FARM_ID}/vineyard-blocks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const blockId = Number((response.record as ApiRecord).id);
  if (!Number.isInteger(blockId) || blockId <= 0) {
    throw new Error("Vineyard block creation returned no id");
  }

  // Farm-scoped API transactions commit after the response finishes. Do not
  // insert the child harvest until the new block is visible to another request.
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const list = await devFetch(`${apiBase()}/api/farms/${FARM_ID}/vineyard-blocks`);
    const records = (list.records ?? []) as ApiRecord[];
    if (records.some(record => Number(record.id) === blockId)) return blockId;
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  throw new Error(`Created vineyard block ${blockId} was not readable after retries`);
}

async function createHarvest(
  blockId: number,
  yieldKg: number,
  values: HarvestValues = {},
): Promise<number> {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    const result = await db.query<{ id: number }>(
      `INSERT INTO vineyard_harvest
         (farm_id, block_id, vintage_year, harvest_date, yield_kg, brix, ph,
          titratable_acidity_gl, potential_alcohol)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        FARM_ID,
        blockId,
        values.vintageYear ?? VINTAGE_YEAR,
        values.vintageYear ? `${values.vintageYear}-07-15` : HARVEST_DATE,
        yieldKg,
        values.brix ?? null,
        values.ph ?? null,
        values.titratableAcidityGl ?? null,
        values.potentialAlcohol ?? null,
      ],
    );
    const harvestId = Number(result.rows[0]?.id);
    if (!Number.isInteger(harvestId) || harvestId <= 0) {
      throw new Error("Vineyard harvest creation returned no id");
    }
    return harvestId;
  } finally {
    await db.end();
  }
}

async function deleteHarvest(harvestId: number): Promise<void> {
  await devFetch(`${apiBase()}/api/farms/${FARM_ID}/vineyard-harvest/${harvestId}`, {
    method: "DELETE",
  });
}

async function deleteBlock(blockId: number): Promise<void> {
  await devFetch(`${apiBase()}/api/farms/${FARM_ID}/vineyard-blocks/${blockId}`, {
    method: "DELETE",
  });
}

async function openSeededHarvest(
  page: Page,
  runTag: string = RUN_TAG,
  expectedBlockNames: string[] = [POSITIVE_BLOCK, MISSING_AREA_BLOCK],
  yearFilter: string = String(VINTAGE_YEAR),
): Promise<void> {
  await signInDashboard(page);
  await page.waitForLoadState("networkidle");

  await page.evaluate(
    ([slug, farmId, year, runTag]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "harvest");
      localStorage.setItem(`viticulture-harvest-year-filter-${farmId}`, year);
      localStorage.setItem(`viticulture-harvest-block-filter-${farmId}`, "__all__");
      localStorage.setItem(`viticulture-harvest-search-filter-${farmId}`, runTag);
    },
    [TENANT_SLUG, FARM_ID, yearFilter, runTag] as [string, number, string, string],
  );

  await page.reload({ waitUntil: "networkidle" });
  await page.goto("/dashboard/viticulture");
  await page.waitForLoadState("networkidle");

  await expect(page.getByText("Harvest & Vintage Records", { exact: true })).toBeVisible({
    timeout: 20_000,
  });
  for (const blockName of expectedBlockNames) {
    await expect(page.getByText(blockName, { exact: true }).first()).toBeVisible({
      timeout: 20_000,
    });
  }
}

/**
 * Parse the complete CSV document, including the warning/note lines that can
 * precede the export header. This keeps the assertions tied to column labels,
 * not to incidental line positions.
 */
function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    if (quoted) {
      if (character === '"' && csv[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

async function downloadCsv(page: Page, menuItemName: RegExp): Promise<string[][]> {
  await page.getByRole("button", { name: /^Export CSV/ }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: menuItemName }).click();
  const download = await downloadPromise;
  const filePath = await download.path();
  if (!filePath) throw new Error("CSV download did not produce a local file");
  return parseCsv(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

function assertProductivityRows(rows: string[][], header: string[]): void {
  const headerIndex = rows.findIndex(
    row => row[0] === header[0] && row.includes("Total Yield (kg)") && row.includes("t/ha"),
  );
  expect(headerIndex, `CSV header ${header[0]} must be present`).toBeGreaterThanOrEqual(0);

  const csvHeader = rows[headerIndex];
  const blockIndex = csvHeader.indexOf("Block");
  const yieldIndex = csvHeader.indexOf("Total Yield (kg)");
  const productivityIndex = csvHeader.indexOf("t/ha");
  expect(blockIndex).toBeGreaterThanOrEqual(0);
  expect(yieldIndex).toBeGreaterThanOrEqual(0);
  expect(productivityIndex).toBeGreaterThanOrEqual(0);

  const positiveRow = rows.slice(headerIndex + 1).find(row => row[blockIndex] === POSITIVE_BLOCK);
  const missingAreaRow = rows.slice(headerIndex + 1).find(row => row[blockIndex] === MISSING_AREA_BLOCK);
  expect(positiveRow, "positive-area block must be present in the export").toBeDefined();
  expect(missingAreaRow, "missing-area block must be present in the export").toBeDefined();
  expect(positiveRow?.[yieldIndex]).toBe("1000.0");
  expect(positiveRow?.[productivityIndex]).toBe("0.50");
  expect(missingAreaRow?.[yieldIndex]).toBe("700.0");
  expect(missingAreaRow?.[productivityIndex]).toBe("");
}

test.describe("Harvest block productivity exports", () => {
  test("export block summary and one-vintage summary preserve derived t/ha values", async ({ page }) => {
    let positiveBlockId: number | null = null;
    let missingAreaBlockId: number | null = null;
    const harvestIds: number[] = [];

    try {
      positiveBlockId = await createBlock(POSITIVE_BLOCK, 2);
      missingAreaBlockId = await createBlock(MISSING_AREA_BLOCK);
      harvestIds.push(await createHarvest(positiveBlockId, 1000));
      harvestIds.push(await createHarvest(missingAreaBlockId, 700));

      await openSeededHarvest(page);

      const blockSummaryRows = await downloadCsv(page, /Export Block Summary/);
      assertProductivityRows(blockSummaryRows, ["Vintage", "Block"]);

      const oneVintageSummaryRows = await downloadCsv(page, /Export Summary/);
      assertProductivityRows(oneVintageSummaryRows, ["Block"]);
    } finally {
      for (const harvestId of harvestIds.reverse()) {
        await deleteHarvest(harvestId).catch(() => undefined);
      }
      if (positiveBlockId !== null) await deleteBlock(positiveBlockId).catch(() => undefined);
      if (missingAreaBlockId !== null) await deleteBlock(missingAreaBlockId).catch(() => undefined);
    }
  });

  test("show Season Totals for a zero-yield single linked block in the selected vintage", async ({ page }) => {
    let blockId: number | null = null;
    let harvestId: number | null = null;

    try {
      blockId = await createBlock(SINGLE_BLOCK, 2);
      harvestId = await createHarvest(blockId, 0);

      await openSeededHarvest(page, SINGLE_BLOCK_RUN_TAG, [SINGLE_BLOCK]);

      // The persisted year filter selects one vintage, and the run-tag search
      // leaves exactly one linked block with a recorded zero yield in the
      // Per-Block Yield Summary.
      await expect(
        page.getByRole("combobox").filter({ hasText: String(VINTAGE_YEAR) }),
      ).toBeVisible();

      const summarySection = page
        .getByRole("button", { name: /Per-Block Yield Summary/ })
        .locator("..");
      const summaryTable = summarySection.getByRole("table");

      const summaryRows = summaryTable.locator("tbody > tr");

      await expect(summaryTable.locator("tbody > tr")).toHaveCount(1);
      await expect(summaryTable.locator("tfoot > tr")).toContainText("Season Totals");
      await expect(summaryTable.locator("tfoot > tr")).toBeVisible();
    } finally {
      if (harvestId !== null) await deleteHarvest(harvestId).catch(() => undefined);
      if (blockId !== null) await deleteBlock(blockId).catch(() => undefined);
    }
  });

  test("keep chemistry for a zero-yield pick in the Block Summary CSV", async ({ page }) => {
    let blockId: number | null = null;
    let harvestId: number | null = null;

    try {
      blockId = await createBlock(ZERO_YIELD_CHEMISTRY_BLOCK, 2);
      harvestId = await createHarvest(blockId, 0, {
        brix: 19.4,
        ph: 3.21,
        titratableAcidityGl: 7.85,
        potentialAlcohol: 11.36,
      });

      await openSeededHarvest(
        page,
        ZERO_YIELD_CHEMISTRY_RUN_TAG,
        [ZERO_YIELD_CHEMISTRY_BLOCK],
      );

      const rows = await downloadCsv(page, /Export Block Summary/);
      const headerIndex = rows.findIndex(
        row => row[0] === "Vintage" && row.includes("Avg Pot. Alcohol %"),
      );
      expect(headerIndex, "Block Summary CSV header must be present").toBeGreaterThanOrEqual(0);

      const header = rows[headerIndex];
      const blockIndex = header.indexOf("Block");
      const exported = rows
        .slice(headerIndex + 1)
        .find(row => row[blockIndex] === ZERO_YIELD_CHEMISTRY_BLOCK);
      expect(exported, "zero-yield chemistry block must be present in the export").toBeDefined();

      const valueFor = (column: string) => exported?.[header.indexOf(column)];
      expect(valueFor("Total Yield (kg)")).toBe("");
      expect(valueFor("t/ha")).toBe("");
      expect(valueFor("Avg Brix °")).toBe("19.4");
      expect(valueFor("Avg pH")).toBe("3.21");
      expect(valueFor("Avg TA (g/L)")).toBe("7.85");
      expect(valueFor("Avg Pot. Alcohol %")).toBe("11.36");
    } finally {
      if (harvestId !== null) await deleteHarvest(harvestId).catch(() => undefined);
      if (blockId !== null) await deleteBlock(blockId).catch(() => undefined);
    }
  });

  test("refresh Season Totals when the selected harvest year changes", async ({ page }) => {
    let blockId: number | null = null;
    const harvestIds: number[] = [];
    const previousVintage = VINTAGE_YEAR - 1;

    try {
      blockId = await createBlock(YEAR_SWITCH_BLOCK, 2);
      harvestIds.push(await createHarvest(blockId, 500));
      harvestIds.push(await createHarvest(blockId, 400, { vintageYear: previousVintage }));
      harvestIds.push(await createHarvest(blockId, 600, { vintageYear: previousVintage }));

      await openSeededHarvest(page, YEAR_SWITCH_RUN_TAG, [YEAR_SWITCH_BLOCK]);

      const summarySection = page
        .getByRole("button", { name: /Per-Block Yield Summary/ })
        .locator("..");
      const summaryTable = summarySection.getByRole("table");
      const summaryRows = summaryTable.locator("tbody > tr");
      const seasonTotals = summaryTable.locator("tfoot > tr");

      await expect(summaryRows).toHaveCount(1);
      await expect(seasonTotals.locator("td").nth(3)).toHaveText("1");
      await expect(seasonTotals.locator("td").nth(4)).toHaveText("500");
      await expect(seasonTotals.locator("td").nth(5)).toHaveText("0.25");

      const yearSelect = page
        .getByRole("combobox")
        .filter({ hasText: String(VINTAGE_YEAR) });
      await yearSelect.click();
      await page.getByRole("option", { name: String(previousVintage), exact: true }).click();

      await expect(yearSelect).toContainText(String(previousVintage));
      await expect(summaryRows).toHaveCount(1);
      await expect(seasonTotals.locator("td").nth(3)).toHaveText("2");
      await expect(seasonTotals.locator("td").nth(4)).toHaveText("1,000");
      await expect(seasonTotals.locator("td").nth(5)).toHaveText("0.50");
    } finally {
      for (const harvestId of harvestIds.reverse()) {
        await deleteHarvest(harvestId).catch(() => undefined);
      }
      if (blockId !== null) await deleteBlock(blockId).catch(() => undefined);
    }
  });
});
