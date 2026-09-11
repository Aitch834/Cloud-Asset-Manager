import { expect, test, type Page } from "@playwright/test";
import { signInDashboard } from "./auth";

/**
 * E2E: Vessel Register — individual barrel cooperage cost summary.
 *
 * Read-only route fixtures exercise the real row print action and generated
 * popup without changing shared winery data.
 */

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled
const VESSEL_ID = 2391001;
const VESSEL_REF = "BARREL-COOPERAGE-SUMMARY";

type MaintenanceRecord = {
  id: number;
  maintenance_date: string;
  work_type: string;
  cooperage_name: string;
  cost_pence: number | null;
  operator_name: string;
  notes: string;
};

async function prepareReadOnlyFixture(
  page: Page,
  maintenance: MaintenanceRecord[],
): Promise<void> {
  await page.addInitScript(() => {
    window.print = () => {
      document.documentElement.dataset.printCalled = "true";
    };
  });

  await page.route(`**/api/farms/${FARM_ID}`, async route => {
    await route.fulfill({
      json: {
        record: {
          id: FARM_ID,
          name: "Highfield Vineyard",
          sectorViticulture: true,
        },
      },
    });
  });

  await page.route(`**/api/farms/${FARM_ID}/**`, async route => {
    if (route.request().method() !== "GET") {
      await route.fulfill({
        status: 405,
        contentType: "application/json",
        body: JSON.stringify({ error: "This regression fixture is read-only" }),
      });
      return;
    }

    const pathname = new URL(route.request().url()).pathname;
    if (pathname.endsWith("/dashboard")) {
      await route.fulfill({
        json: { activeSubscriptions: [{ moduleKey: "viticulture" }] },
      });
    } else if (pathname.endsWith("/winery-vessels")) {
      await route.fulfill({
        json: {
          records: [{
            id: VESSEL_ID,
            vessel_ref: VESSEL_REF,
            vessel_type: "barrel",
            capacity_litres: 225,
            status: "active",
            fill_count: 1,
            maintenance_count: maintenance.length,
          }],
        },
      });
    } else if (
      pathname.endsWith(`/winery-vessels/${VESSEL_ID}/maintenance`)
    ) {
      await route.fulfill({ json: { records: maintenance } });
    } else if (
      pathname.endsWith(`/winery-vessels/${VESSEL_ID}/fills`)
      || pathname.endsWith(`/winery-vessels/${VESSEL_ID}/movements`)
      || pathname.endsWith(`/winery-vessels/${VESSEL_ID}/cleans`)
    ) {
      await route.fulfill({ json: { records: [] } });
    } else {
      await route.fulfill({ json: { records: [] } });
    }
  });

  await page.route("**/api/platform-config", async route => {
    await route.fulfill({ json: { config: {} } });
  });

  await signInDashboard(page);
  await page.evaluate(
    ([tenantSlug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "winery-vessels");
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );

  await page.goto("/dashboard/viticulture", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(VESSEL_REF, { exact: true })).toBeVisible();
}

async function printBarrelHistory(page: Page) {
  const vesselRow = page.getByText(VESSEL_REF, { exact: true }).locator("tr");
  const popupPromise = page.waitForEvent("popup");
  await vesselRow.locator("button").nth(1).click();
  const popup = await popupPromise;
  await expect(popup.locator("h1")).toHaveText(`Barrel History — ${VESSEL_REF}`);
  await expect(popup.locator("html")).toHaveAttribute("data-print-called", "true");
  return popup;
}

test("prints total cooperage spend and each work-type subtotal", async ({ page }) => {
  await prepareReadOnlyFixture(page, [
    {
      id: 1,
      maintenance_date: "2026-06-01",
      work_type: "Rehooping",
      cooperage_name: "Cooper A",
      cost_pence: 12500,
      operator_name: "Winemaker",
      notes: "",
    },
    {
      id: 2,
      maintenance_date: "2026-06-15",
      work_type: "Rehooping",
      cooperage_name: "Cooper B",
      cost_pence: 3750,
      operator_name: "Winemaker",
      notes: "",
    },
    {
      id: 3,
      maintenance_date: "2026-07-01",
      work_type: "Head replacement",
      cooperage_name: "Cooper A",
      cost_pence: 8000,
      operator_name: "Cellar hand",
      notes: "",
    },
  ]);

  const popup = await printBarrelHistory(page);

  await expect(popup.getByRole("heading", { name: "Cost Summary" })).toBeVisible();
  await expect(popup.locator(".cost-summary-total")).toHaveText(
    "Total spend: £242.50 across 3 records",
  );
  await expect(popup.locator(".cost-summary-item")).toHaveText([
    "Rehooping: £162.50",
    "Head replacement: £80.00",
  ]);
});

test("omits the cost summary when every maintenance cost is missing", async ({ page }) => {
  await prepareReadOnlyFixture(page, [
    {
      id: 4,
      maintenance_date: "2026-08-01",
      work_type: "Inspection",
      cooperage_name: "Cooper A",
      cost_pence: null,
      operator_name: "Winemaker",
      notes: "No charge recorded",
    },
    {
      id: 5,
      maintenance_date: "2026-08-02",
      work_type: "Steam clean",
      cooperage_name: "Cooper B",
      cost_pence: null,
      operator_name: "Cellar hand",
      notes: "Routine work",
    },
  ]);

  const popup = await printBarrelHistory(page);

  await expect(
    popup.getByRole("heading", { name: "Cooperage / Maintenance (2 records)" }),
  ).toBeVisible();
  await expect(popup.getByRole("heading", { name: "Cost Summary" })).toHaveCount(0);
  await expect(popup.locator(".cost-summary")).toHaveCount(0);
});