/**
 * E2E: Shared analytics chart cards — print pagination guards
 *
 * Opens the real Analytics tab for viticulture, livestock, and poultry with an
 * authenticated farm that has chart data. The assertions deliberately target
 * AnalyticsChartCard's shared .analytics-chart-cap contract rather than each
 * module's chart markup.
 */

import { test, expect, type Page } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { Client } from "pg";
import * as fs from "node:fs";
import * as path from "node:path";

const TENANT_ID = 1;
type AnalyticsFarm = {
  tenantSlug: string;
  farmId: number;
  year: number;
  filterPage: string;
};

type AnalyticsModule = {
  name: string;
  path: string;
  farm: AnalyticsFarm;
};

function getTestUserId(): string {
  const stateFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_ID_FILE!);
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — e2e/.test-user-id is missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

async function getAnalyticsModules(): Promise<AnalyticsModule[]> {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();

  try {
    const result = await db.query<{
      tenant_slug: string;
      viticulture_farm_id: number | null;
      viticulture_year: number | null;
      livestock_farm_id: number | null;
      livestock_year: number | null;
      poultry_farm_id: number | null;
      poultry_year: number | null;
    }>(
      `SELECT
         t.slug AS tenant_slug,
         (
           SELECT f.id
           FROM farms f
           WHERE f.tenant_id = t.id
             AND f.sector_viticulture = true
             AND EXISTS (SELECT 1 FROM vineyard_harvest h WHERE h.farm_id = f.id)
           ORDER BY f.id
           LIMIT 1
         ) AS viticulture_farm_id,
         (
           SELECT MAX(h.vintage_year)::int
           FROM vineyard_harvest h
           JOIN farms f ON f.id = h.farm_id
           WHERE f.tenant_id = t.id AND f.sector_viticulture = true
         ) AS viticulture_year,
         (
           SELECT f.id
           FROM farms f
           WHERE f.tenant_id = t.id
             AND (f.sector_beef OR f.sector_dairy OR f.sector_sheep OR f.sector_goats)
             AND (
               EXISTS (
                 SELECT 1 FROM livestock_mortality lm
                 WHERE lm.farm_id = f.id
                   AND lm.date_of_death IS NOT NULL
               )
               OR EXISTS (
                 SELECT 1 FROM bvd_testing_records bt
                 WHERE bt.farm_id = f.id
                   AND bt.test_date IS NOT NULL
               )
               OR EXISTS (
                 SELECT 1 FROM tb_tests tt
                 WHERE tt.farm_id = f.id
                   AND tt.test_date IS NOT NULL
               )
             )
           ORDER BY f.id
           LIMIT 1
         ) AS livestock_farm_id,
         (
           SELECT MAX(EXTRACT(YEAR FROM lm.date_of_death))::int
           FROM livestock_mortality lm
           JOIN farms f ON f.id = lm.farm_id
           WHERE f.tenant_id = t.id
             AND (f.sector_beef OR f.sector_dairy OR f.sector_sheep OR f.sector_goats)
         ) AS livestock_year,
         (
           SELECT f.id
           FROM farms f
           WHERE f.tenant_id = t.id
             AND f.sector_poultry = true
             AND (
               EXISTS (
                 SELECT 1 FROM poultry_flocks pf
                 WHERE pf.farm_id = f.id
                   AND pf.placement_date IS NOT NULL
               )
               OR EXISTS (
                 SELECT 1 FROM poultry_treatments pt
                 WHERE pt.farm_id = f.id
                   AND pt.treatment_date IS NOT NULL
               )
             )
           ORDER BY f.id
           LIMIT 1
         ) AS poultry_farm_id
         ,(
           SELECT MAX(EXTRACT(YEAR FROM pf.placement_date))::int
           FROM poultry_flocks pf
           JOIN farms f ON f.id = pf.farm_id
           WHERE f.tenant_id = t.id AND f.sector_poultry = true
         ) AS poultry_year
       FROM tenants t
       WHERE t.id = $1`,
      [TENANT_ID],
    );

    const farms = result.rows[0];
    if (!farms) throw new Error("Analytics print setup failed: E2E tenant is missing");

    const definitions = [
      { name: "Viticulture", path: "/dashboard/viticulture", farmId: farms.viticulture_farm_id, year: farms.viticulture_year, filterPage: "viticulture-analytics" },
      { name: "Livestock", path: "/dashboard/livestock", farmId: farms.livestock_farm_id, year: farms.livestock_year, filterPage: "livestock-analytics" },
      { name: "Poultry", path: "/dashboard/poultry-production", farmId: farms.poultry_farm_id, year: farms.poultry_year, filterPage: "poultry-analytics" },
    ];
    const missing = definitions
      .filter(module => module.farmId === null || module.year === null)
      .map(module => module.name);
    if (missing.length > 0) {
      throw new Error(
        `Analytics print setup failed: no current-year chart data for ${missing.join(", ")}`,
      );
    }

    return definitions.map(module => ({
      name: module.name,
      path: module.path,
      farm: {
        tenantSlug: farms.tenant_slug,
        farmId: module.farmId as number,
        year: module.year as number,
        filterPage: module.filterPage,
      },
    }));
  } finally {
    await db.end();
  }
}

async function selectFarm(page: Page, farm: AnalyticsFarm): Promise<void> {
  await page.goto("/dashboard/");
  await page.evaluate(
    ([tenantSlug, farmId, year, filterPage]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
      localStorage.setItem(`${filterPage}-year-filter-${farmId}`, String(year));
    },
    [farm.tenantSlug, farm.farmId, farm.year, farm.filterPage] as [string, number, number, string],
  );
}

async function expectSharedPrintContract(page: Page, moduleName: string): Promise<void> {
  const cards = page.locator(".analytics-chart-cap");
  await expect(cards.first(), `${moduleName}: an analytics chart card must render`).toBeVisible();

  const chart = cards.locator(".recharts-responsive-container").first();
  await expect(chart, `${moduleName}: the chart card must contain a rendered Recharts chart`).toBeVisible();

  await page.emulateMedia({ media: "print" });

  const styles = await cards.first().evaluate(element => {
    const cardStyle = getComputedStyle(element);
    const container = element.querySelector<HTMLElement>(".recharts-responsive-container");
    const wrapper = element.querySelector<HTMLElement>(".recharts-wrapper");
    const svg = element.querySelector<SVGElement>(".recharts-wrapper svg");

    return {
      breakInside: cardStyle.breakInside,
      pageBreakInside: cardStyle.pageBreakInside,
      containerMaxHeight: container ? getComputedStyle(container).maxHeight : "",
      wrapperMaxHeight: wrapper ? getComputedStyle(wrapper).maxHeight : "",
      svgMaxHeight: svg ? getComputedStyle(svg).maxHeight : "",
      containerHeight: container?.getBoundingClientRect().height ?? 0,
      wrapperHeight: wrapper?.getBoundingClientRect().height ?? 0,
      svgHeight: svg?.getBoundingClientRect().height ?? 0,
    };
  });

  expect(styles.breakInside, `${moduleName}: chart card must not split across pages`).toBe("avoid");
  expect(styles.pageBreakInside, `${moduleName}: legacy print engines must not split the card`).toBe("avoid");
  expect(styles.containerMaxHeight).toBe("300px");
  expect(styles.wrapperMaxHeight).toBe("300px");
  expect(styles.svgMaxHeight).toBe("300px");
  expect(styles.containerHeight).toBeLessThanOrEqual(300);
  expect(styles.wrapperHeight).toBeLessThanOrEqual(300);
  expect(styles.svgHeight).toBeLessThanOrEqual(300);

  await page.emulateMedia({ media: "screen" });
}

test("shared analytics chart cards stay capped and unsplit when printed", async ({ page }) => {
  const modules = await getAnalyticsModules();
  await setupClerkTestingToken({ page, userId: getTestUserId() });

  for (const module of modules) {
    await selectFarm(page, module.farm);
    await page.goto(module.path);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Analytics", exact: true }).click();
    await expectSharedPrintContract(page, module.name);
  }
});