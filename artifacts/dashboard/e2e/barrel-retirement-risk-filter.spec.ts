import { expect, test, type Page } from "@playwright/test";
import * as fs from "node:fs";
import { signInDashboard } from "./auth";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const VESSEL_ID = 2_397_001;
const VESSEL_REF = "RETIREMENT-RISK-E2E";
const THRESHOLD_GBP = 600;
const MAINTENANCE_ID = 2_397_002;

type MaintenanceRecord = {
  id: number;
  vessel_id: number;
  maintenance_date: string;
  work_type: string;
  cooperage_name: string;
  operator_name: string;
  cost_pence: number;
  notes: string;
};

async function prepareDashboard(page: Page): Promise<void> {
  await signInDashboard(page);
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(
    ([slug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "winery-vessels");
      localStorage.setItem(
        `vessel-register-detail-tab-filter-${farmId}`,
        "maintenance",
      );
      localStorage.removeItem(`vessel-register-alert-flag-filter-${farmId}`);
      localStorage.removeItem(`vessel-register-last-viewed-vessel-filter-${farmId}`);
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Viticulture", exact: true }).first().click();
  await expect(page.getByText("Tank & Vessel Register", { exact: true })).toBeVisible({
    timeout: 20_000,
  });
}

test("keeps retirement-risk filtering current after maintenance edits and reload", async ({
  page,
}) => {
  let maintenance: MaintenanceRecord = {
    id: MAINTENANCE_ID,
    vessel_id: VESSEL_ID,
    maintenance_date: "2026-09-01",
    work_type: "Repair",
    cooperage_name: "Release Check Cooperage",
    operator_name: "Release Check",
    cost_pence: 59_900,
    notes: "Retirement filter regression fixture",
  };

  await page.route(`**/api/farms/${FARM_ID}`, async route => {
    const response = await route.fetch();
    const body = await response.json() as { record?: Record<string, unknown> };
    await route.fulfill({
      response,
      json: {
        ...body,
        record: {
          ...body.record,
          sectorViticulture: true,
          barrelRetirementThresholdGbp: THRESHOLD_GBP,
        },
      },
    });
  });

  await page.route(`**/api/farms/${FARM_ID}/winery-vessels`, route => {
    if (route.request().method() !== "GET") return route.continue();
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        records: [{
          id: VESSEL_ID,
          vessel_ref: VESSEL_REF,
          vessel_type: "barrel",
          capacity_litres: 225,
          status: "active",
          fill_number: 2,
          fill_count: 1,
          clean_count: 1,
          maintenance_count: 1,
          maintenance_spend_pence: maintenance.cost_pence,
          is_full: false,
          cellar_zone: "Release Check",
        }],
      }),
    });
  });

  await page.route(
    `**/api/farms/${FARM_ID}/winery-vessels/${VESSEL_ID}/maintenance*`,
    async route => {
      if (route.request().method() === "PUT") {
        const body = route.request().postDataJSON() as Record<string, unknown>;
        maintenance = {
          ...maintenance,
          maintenance_date: String(body.maintenanceDate),
          work_type: String(body.workType),
          cooperage_name: String(body.cooperageName ?? ""),
          operator_name: String(body.operatorName ?? ""),
          cost_pence: Number(body.costPence),
          notes: String(body.notes ?? ""),
        };
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ record: maintenance }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ records: [maintenance] }),
      });
    },
  );

  await page.route(
    `**/api/farms/${FARM_ID}/winery-vessels-maintenance-summary`,
    route => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        records: [{
          vessel_id: VESSEL_ID,
          work_type: maintenance.work_type,
          total_pence: maintenance.cost_pence,
          record_count: 1,
        }],
      }),
    }),
  );

  await prepareDashboard(page);

  const retirementChip = page.getByRole("button", { name: /Retirement risk \d+/ });
  const tableRows = page.locator("tbody tr");
  await expect(retirementChip).toHaveCount(0);
  await expect(tableRows.filter({ hasText: VESSEL_REF })).toBeVisible();

  await tableRows
    .filter({ hasText: VESSEL_REF })
    .locator("td")
    .last()
    .getByRole("button")
    .first()
    .click();
  const dialog = page.getByRole("dialog").filter({ hasText: `Vessel — ${VESSEL_REF}` });
  await expect(dialog.getByText("Cooperage / Maintenance", { exact: true })).toBeVisible();

  const maintenanceRow = dialog.getByText("Cost: £599.00", { exact: true }).locator("..");
  await maintenanceRow.getByRole("button").first().click();
  await dialog.locator('input[type="number"]').fill("601.00");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog.getByText("Cost: £601.00", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Close", exact: true }).click();

  await expect(retirementChip).toHaveAccessibleName("Retirement risk 1");
  await retirementChip.click();
  await expect(tableRows).toHaveCount(1);
  await expect(tableRows.filter({ hasText: VESSEL_REF })).toBeVisible();
  await expect(page.getByText(
    `Showing barrels flagged as retirement risk (maintenance spend > £${THRESHOLD_GBP})`,
    { exact: false },
  )).toBeVisible();

  await page.reload({ waitUntil: "networkidle" });
  await expect(retirementChip).toHaveAccessibleName("Retirement risk 1");
  await expect(tableRows).toHaveCount(1);
  await expect(
    page.evaluate(
      key => localStorage.getItem(key),
      `vessel-register-alert-flag-filter-${FARM_ID}`,
    ),
  ).resolves.toBe("retirement-risk");

  const stockSummary = page.locator("div.rounded-lg", {
    hasText: "Cellar Stock — Barrels",
  });
  const downloadPromise = page.waitForEvent("download");
  await stockSummary.getByRole("button", { name: "Export CSV", exact: true }).click();
  const download = await downloadPromise;
  const csvPath = await download.path();
  expect(csvPath).not.toBeNull();
  const csv = fs.readFileSync(csvPath!, "utf8");
  expect(csv).toContain(
    `Scope: Active barrels — Flag: retirement risk (maintenance spend > £${THRESHOLD_GBP})`,
  );
  expect(csv).toContain(VESSEL_REF);

  await tableRows
    .filter({ hasText: VESSEL_REF })
    .locator("td")
    .last()
    .getByRole("button")
    .first()
    .click();
  await expect(dialog).toBeVisible();
  await dialog.getByText("Cost: £601.00", { exact: true }).locator("..").getByRole("button").first().click();
  await dialog.locator('input[type="number"]').fill("599.00");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog.getByText("Cost: £599.00", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Close", exact: true }).click();

  await expect(retirementChip).toHaveCount(0);
  await expect(tableRows).toHaveCount(0);
  await expect(tableRows.filter({ hasText: VESSEL_REF })).toHaveCount(0);
});