import { expect, test, type Page } from "@playwright/test";
import { signInDashboard } from "./auth";

/**
 * E2E: VesselRegisterTab — no-fill subtype filters.
 *
 * Mock the vessel list at the browser boundary so this release check protects
 * the cooperage-only/no-records split without depending on shared farm data.
 */

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const RUN_TAG = `E2E-2405-${Date.now()}`;
const ZONE_A = `${RUN_TAG}-zone-a`;
const ZONE_B = `${RUN_TAG}-zone-b`;

type ApiRecord = Record<string, unknown>;

function barrel(
  id: number,
  suffix: string,
  cellarZone: string,
  fillCount: number,
  maintenanceCount: number,
): ApiRecord {
  return {
    id,
    vessel_ref: `${RUN_TAG}-${suffix}`,
    vessel_type: "barrel",
    capacity_litres: 225,
    cellar_zone: cellarZone,
    status: "active",
    fill_count: fillCount,
    fill_number: fillCount,
    maintenance_count: maintenanceCount,
    maintenance_spend_pence: maintenanceCount * 10_000,
    clean_count: 1,
    is_full: fillCount > 0,
  };
}

const cooperageOnly = [
  barrel(240501, "cooperage-a", ZONE_A, 0, 1),
  barrel(240502, "cooperage-b", ZONE_B, 0, 2),
];
const noRecords = [
  barrel(240503, "no-records-a", ZONE_A, 0, 0),
  barrel(240504, "no-records-b", ZONE_B, 0, 0),
];
const filledControl = barrel(240505, "filled-control", ZONE_A, 1, 0);
const vessels = [...cooperageOnly, ...noRecords, filledControl];

async function openVesselRegister(page: Page): Promise<void> {
  await signInDashboard(page);

  await page.route("**/api/farms/5/winery-vessels*", async route => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    const response = await route.fetch();
    const body = await response.json() as ApiRecord;
    await route.fulfill({ response, json: { ...body, records: vessels } });
  });

  await page.evaluate(
    ([slug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "winery-vessels");
      for (const filter of ["zone", "fill-tier", "alert-flag", "is-full"]) {
        localStorage.removeItem(`vessel-register-${filter}-filter-${farmId}`);
      }
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );

  await page.goto("/dashboard/viticulture", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByText("Tank & Vessel Register", { exact: true }),
  ).toBeVisible({ timeout: 20_000 });
}

function subtypeChip(page: Page, label: string, count: number) {
  return page.getByRole("button", {
    name: new RegExp(`^${label} ${count}$`),
  });
}

function zoneChip(page: Page, zone: string) {
  return page.getByRole("button", { name: new RegExp(`^${zone} `) });
}

async function expectOnlyRows(page: Page, records: ApiRecord[]): Promise<void> {
  const rows = page.locator("tbody tr");
  await expect(rows).toHaveCount(records.length);
  for (const record of records) {
    await expect(rows.filter({ hasText: String(record.vessel_ref) })).toHaveCount(1);
  }
  for (const record of vessels.filter(record => !records.includes(record))) {
    await expect(rows.filter({ hasText: String(record.vessel_ref) })).toHaveCount(0);
  }
}

test.describe("VesselRegisterTab — no-fill subtype filters", () => {
  test("keeps subtype counts, styles, table rows, summaries, and zone counts aligned", async ({
    page,
  }) => {
    await openVesselRegister(page);

    const cooperageChip = subtypeChip(page, "No fills — cooperage only", 2);
    const noRecordsChip = subtypeChip(page, "No fills — no records", 2);

    await expect(cooperageChip).toHaveClass(/bg-amber-50/);
    await expect(cooperageChip).toHaveClass(/text-amber-700/);
    await expect(cooperageChip).toHaveClass(/border-amber-200/);
    await expect(noRecordsChip).toHaveClass(/bg-violet-50/);
    await expect(noRecordsChip).toHaveClass(/text-violet-700/);
    await expect(noRecordsChip).toHaveClass(/border-violet-200/);

    await cooperageChip.click();
    await expect(cooperageChip).toHaveClass(/ring-2/);
    await expectOnlyRows(page, cooperageOnly);
    await expect(page.getByText(/Showing barrels flagged as no fills — cooperage only/)).toBeVisible();
    await expect(zoneChip(page, ZONE_A)).toContainText("1 cooperage-only");
    await expect(zoneChip(page, ZONE_B)).toContainText("1 cooperage-only");
    await expect(page.locator("p.bg-amber-50.border-amber-200")).toHaveText(
      `${ZONE_A} 1 · ${ZONE_B} 1`,
    );

    await noRecordsChip.click();
    await expect(cooperageChip).not.toHaveClass(/ring-2/);
    await expect(noRecordsChip).toHaveClass(/ring-2/);
    await expectOnlyRows(page, noRecords);
    await expect(page.getByText(/Showing barrels flagged as no fills — no records/)).toBeVisible();
    await expect(zoneChip(page, ZONE_A)).toContainText("1 no records");
    await expect(zoneChip(page, ZONE_B)).toContainText("1 no records");
    await expect(page.locator("p.bg-amber-50.border-amber-200")).toHaveText(
      `${ZONE_A} 1 · ${ZONE_B} 1`,
    );
  });
});