import { signInDashboard } from "./auth";
/**
 * E2E: Operations PDF export honours the selected year and print-block filters.
 *
 * The operations and block rows are supplied as deterministic browser fixtures.
 * This keeps the check read-only while still driving the real Operations tab and
 * inspecting the generated PDF file.
 */

import { expect, test, type Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { Client } from "pg";
import { fileURLToPath } from "node:url";

const TENANT_ID = 1;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type ViticultureFarm = {
  tenantSlug: string;
  farmId: number;
};

type OperationFixture = {
  id: number;
  farmId: number;
  blockId: number;
  operationDate: string;
  operationType: string;
  pruningSystem: string;
  operatorName: string;
  notes: string;
};

const BLOCKS = [
  { id: 920001, farmId: 5, blockName: "E2E Operations North Block", variety: "Chardonnay" },
  { id: 920002, farmId: 5, blockName: "E2E Operations South Block", variety: "Pinot Noir" },
];

const OPERATIONS: OperationFixture[] = [
  {
    id: 920011,
    farmId: 5,
    blockId: 920001,
    operationDate: "2026-03-15",
    operationType: "E2E North 2026",
    pruningSystem: "Double Guyot",
    operatorName: "OPS-NORTH-2026",
    notes: "E2E operations PDF north 2026",
  },
  {
    id: 920012,
    farmId: 5,
    blockId: 920002,
    operationDate: "2026-04-15",
    operationType: "E2E South 2026",
    pruningSystem: "Cordon Spur",
    operatorName: "OPS-SOUTH-2026",
    notes: "E2E operations PDF south 2026",
  },
  {
    id: 920013,
    farmId: 5,
    blockId: 920001,
    operationDate: "2025-03-15",
    operationType: "E2E North 2025",
    pruningSystem: "Single Guyot",
    operatorName: "OPS-NORTH-2025",
    notes: "E2E operations PDF north 2025",
  },
  {
    id: 920014,
    farmId: 5,
    blockId: 920002,
    operationDate: "2025-04-15",
    operationType: "E2E South 2025",
    pruningSystem: "Scott Henry",
    operatorName: "OPS-SOUTH-2025",
    notes: "E2E operations PDF south 2025",
  },
];

function getTestUserId(): string {
  const stateFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_ID_FILE!);
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — e2e/.test-user-id is missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

function getTestUserEmail(): string {
  const stateFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_EMAIL_FILE!);
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — e2e/.test-user-email is missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

async function getViticultureFarm(): Promise<ViticultureFarm> {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();

  try {
    const result = await db.query<{
      tenant_slug: string;
      farm_id: number;
    }>(
      `SELECT t.slug AS tenant_slug, f.id AS farm_id
       FROM tenants t
       JOIN farms f ON f.tenant_id = t.id
       JOIN subscriptions s ON s.farm_id = f.id AND s.tenant_id = t.id
       JOIN modules m ON m.id = s.module_id
       WHERE t.id = $1
         AND (
           s.status = 'active'
           OR (
             s.status = 'trial'
             AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
           )
         )
         AND m.key IN ('viticulture', 'organic-viticulture')
         AND f.sector_viticulture = true
       ORDER BY f.id
       LIMIT 1`,
      [TENANT_ID],
    );

    const farm = result.rows[0];
    if (!farm) {
      throw new Error(
        "Operations PDF export setup failed: no viticulture-enabled farm is available for the E2E tenant.",
      );
    }
    return { tenantSlug: farm.tenant_slug, farmId: farm.farm_id };
  } finally {
    await db.end();
  }
}

async function prepareOperations(page: Page, farm: ViticultureFarm): Promise<void> {
  await page.route(`**/api/farms/${farm.farmId}/vineyard-blocks`, async route => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ records: BLOCKS.map(block => ({ ...block, farmId: farm.farmId })) }),
    });
  });

  await page.route(`**/api/farms/${farm.farmId}/vineyard-operations`, async route => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        records: OPERATIONS.map(operation => ({ ...operation, farmId: farm.farmId })),
      }),
    });
  });

  await page.route(`**/api/farms/${farm.farmId}`, async route => {
    if (route.request().method() !== "GET" || new URL(route.request().url()).pathname.endsWith("/dashboard")) {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        record: {
          id: farm.farmId,
          name: "E2E Operations Farm",
          address: "E2E Test Address",
          postcode: "E2E 1AA",
          sbiNumber: "123456789",
          fsaVineRegisterRef: "E2E-FSA-VINE",
          fsaWineProductionRef: "E2E-FSA-WINE",
          appaRef: "E2E-APPA",
        },
      }),
    });
  });

  await signInDashboard(page);

  await page.evaluate(
    ([tenantSlug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "operations");
      for (const filter of ["year", "block", "search", "print-block"]) {
        localStorage.removeItem(`viticulture-operations-${filter}-filter-${farmId}`);
      }
    },
    [farm.tenantSlug, farm.farmId] as [string, number],
  );

  await page.goto("/dashboard/viticulture");
  await page.waitForLoadState("networkidle");
  await expect(
    page.getByRole("button", { name: "Pruning & Canopy", exact: true }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("button", { name: "Export PDF", exact: true })).toBeVisible();
}

async function selectOperationsOption(
  page: Page,
  triggerIndex: number,
  optionLabel: string,
): Promise<void> {
  // Operations has three triggers in a stable order: block, year, and print
  // block. Cane Weights renders its own selectors below them, so selecting by
  // index avoids matching the duplicate year/block labels in that section.
  await page.getByRole("combobox").nth(triggerIndex).click();
  await page.getByRole("option", { name: optionLabel, exact: true }).click();
}

async function downloadPdfText(page: Page): Promise<string> {
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PDF", exact: true }).click();
  const download = await downloadPromise;
  const filePath = await download.path();
  if (!filePath) throw new Error("Operations PDF download did not provide a file path");
  return execFileSync("pdftotext", [filePath, "-"], { encoding: "utf8" });
}

test("filtered Operations PDF includes only the selected year and block, while all filters export every record", async ({
  page,
}) => {
  const farm = await getViticultureFarm();
  await prepareOperations(page, farm);

  await selectOperationsOption(page, 1, "2026");
  await selectOperationsOption(page, 2, "Print: E2E Operations North Block");

  const filteredPdf = await downloadPdfText(page);
  expect(filteredPdf).toContain("E2E North 2026");
  expect(filteredPdf).not.toContain("E2E South 2026");
  expect(filteredPdf).not.toContain("E2E North 2025");
  expect(filteredPdf).not.toContain("E2E South 2025");

  await selectOperationsOption(page, 1, "All years");
  await selectOperationsOption(page, 2, "Print: all blocks");

  const unfilteredPdf = await downloadPdfText(page);
  for (const operation of OPERATIONS) {
    expect(unfilteredPdf, `${operation.operationType} should not be truncated from the all-record export`).toContain(
      operation.operationType,
    );
  }
});
