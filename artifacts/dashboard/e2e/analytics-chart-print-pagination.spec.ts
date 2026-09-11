import { signInDashboard } from "./auth";
/**
 * E2E: Shared analytics chart cards — print pagination guards
 *
 * Opens the real Analytics tab for viticulture, livestock, and poultry with an
 * authenticated farm that has chart data. The assertions deliberately target
 * AnalyticsChartCard's shared .analytics-chart-cap contract rather than each
 * module's chart markup.
 */

import { test, expect, type Page } from "@playwright/test";
import { Client } from "pg";
import {
  ANALYTICS_FIXTURE_FARM_NAME,
  ANALYTICS_FIXTURE_YEAR,
} from "./analytics-chart-fixture";

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

async function getAnalyticsModules(): Promise<AnalyticsModule[]> {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();

  try {
    const result = await db.query<{ tenant_slug: string; farm_id: number }>(
      `SELECT t.slug AS tenant_slug, f.id AS farm_id
         FROM tenants t
         JOIN farms f ON f.tenant_id = t.id
        WHERE t.id = $1
          AND f.name = $2
          AND f.is_active = true
        ORDER BY f.id
        LIMIT 1`,
      [TENANT_ID, ANALYTICS_FIXTURE_FARM_NAME],
    );

    const fixture = result.rows[0];
    if (!fixture) {
      throw new Error(
        `Analytics print setup failed: reserved fixture farm "${ANALYTICS_FIXTURE_FARM_NAME}" is missing`,
      );
    }

    const definitions = [
      { name: "Viticulture", path: "/dashboard/viticulture", filterPage: "viticulture-analytics" },
      { name: "Livestock", path: "/dashboard/livestock", filterPage: "livestock-analytics" },
      { name: "Poultry", path: "/dashboard/poultry-production", filterPage: "poultry-analytics" },
    ];

    return definitions.map(module => ({
      name: module.name,
      path: module.path,
      farm: {
        tenantSlug: fixture.tenant_slug,
        farmId: fixture.farm_id,
        year: ANALYTICS_FIXTURE_YEAR,
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
  await signInDashboard(page);

  for (const module of modules) {
    await selectFarm(page, module.farm);
    await page.goto(module.path);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Analytics", exact: true }).click();
    await expectSharedPrintContract(page, module.name);
  }
});
