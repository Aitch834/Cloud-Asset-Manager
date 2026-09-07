import { signInDashboard } from "./auth";
/**
 * E2E: Bottling Records — source vessel and capacity regression coverage.
 *
 * The fixture is served entirely through read-only browser routes. This keeps
 * the check independent of shared bottling/vessel data while still exercising
 * the real Viticulture page and its register look-up.
 */

import { expect, test, type Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled
const VESSEL_ID = 2237001;
const RECORD_ID = 2237002;
const VESSEL_REF = "E2E-BOTTLE-TANK";
const LOT_CODE = "LOT-E2E-VESSEL-CAPACITY";
const VESSEL_CAPACITY_LITRES = 2750;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type ApiRecord = Record<string, unknown>;

const VESSEL: ApiRecord = {
  id: VESSEL_ID,
  vessel_ref: VESSEL_REF,
  vessel_type: "stainless-tank",
  capacity_litres: VESSEL_CAPACITY_LITRES,
  material: "Stainless steel",
  status: "active",
};

const BOTTLING_RECORD: ApiRecord = {
  id: RECORD_ID,
  bottling_date: "2026-08-20",
  vintage_year: 2026,
  lot_code: LOT_CODE,
  batch_ref: "BATCH-E2E-VESSEL-CAPACITY",
  wine_colour: "White",
  source_vessel_id: VESSEL_ID,
  source_vessel_ref: VESSEL_REF,
  volume_bottled_litres: 750,
  bottle_size_ml: 750,
  bottles_produced: 1000,
  closure_type: "Screw cap",
  operator_name: "E2E Vessel Fixture",
  notes: "Read-only vessel-capacity regression fixture",
};

function readStateFile(name: string): string {
  const stateFile = path.join(__dirname, name);
  if (!fs.existsSync(stateFile)) {
    throw new Error(`global-setup did not run — e2e/${name} is missing`);
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

async function openBottlingRecords(page: Page): Promise<void> {
  await page.route(`**/api/farms/${FARM_ID}/dashboard`, async route => {
    await route.fulfill({
      json: {
        activeSubscriptions: [{ moduleKey: "viticulture" }],
      },
    });
  });

  await page.route(`**/api/farms/${FARM_ID}/winery-vessels`, async route => {
    if (route.request().method() !== "GET") {
      await route.fulfill({
        status: 405,
        contentType: "application/json",
        body: JSON.stringify({ error: "This regression fixture is read-only" }),
      });
      return;
    }
    await route.fulfill({ json: { records: [VESSEL] } });
  });

  await page.route(`**/api/farms/${FARM_ID}/winery-bottling`, async route => {
    if (route.request().method() !== "GET") {
      await route.fulfill({
        status: 405,
        contentType: "application/json",
        body: JSON.stringify({ error: "This regression fixture is read-only" }),
      });
      return;
    }
    await route.fulfill({ json: { records: [BOTTLING_RECORD] } });
  });

  await signInDashboard(page);

  await page.evaluate(
    ([tenantSlug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "winery-bottling");
      localStorage.setItem(`bottling-records-signed-filter-${farmId}`, "all");
      localStorage.setItem(`viticulture-bottling-year-filter-${farmId}`, "all");
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );

  await page.goto("/dashboard/viticulture");
  await expect(page.locator("tbody tr", { hasText: LOT_CODE })).toBeVisible();
}

async function expectVesselAndCapacity(page: Page): Promise<void> {
  const headers = page.locator("thead tr").first().locator("th");
  const headerTexts = await headers.allTextContents();
  const sourceVesselIndex = headerTexts.findIndex(text => text.trim() === "Source Vessel");
  const capacityIndex = headerTexts.findIndex(text => text.trim() === "Capacity (L)");

  expect(sourceVesselIndex, "Source Vessel column should be present").toBeGreaterThanOrEqual(0);
  expect(capacityIndex, "Capacity (L) column should be present").toBe(sourceVesselIndex + 1);

  const row = page.locator("tbody tr", { hasText: LOT_CODE });
  await expect(row).toBeVisible();
  const cells = row.locator("td");
  await expect(cells.nth(sourceVesselIndex)).toHaveText(VESSEL_REF);
  await expect(cells.nth(capacityIndex)).toHaveText(
    VESSEL_CAPACITY_LITRES.toFixed(0),
  );
}

test("keeps source vessel immediately followed by its register capacity after reload", async ({
  page,
}) => {
  await openBottlingRecords(page);
  await expectVesselAndCapacity(page);

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByText("Bottling Records", { exact: true }).last()).toBeVisible();
  await expectVesselAndCapacity(page);
});