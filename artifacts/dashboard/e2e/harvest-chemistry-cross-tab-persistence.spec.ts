import { expect, test, type Page } from "@playwright/test";
import { signInDashboard } from "./auth";

const TENANT_SLUG = "oakfield-farms";
const FARM_A = { id: 5, name: "Highfield Vineyard" };
const FARM_B = { id: 924_244, name: "Chemistry Preference Vineyard" };
const STORAGE_KEY = (farmId: number) =>
  `viticulture-harvest-chemCrossTabOpen-filter-${farmId}`;
const HARVEST_FILTER_KEY = (filter: string, farmId: number) =>
  `viticulture-harvest-${filter}-filter-${farmId}`;

const chemistryMetrics = [
  { filter: "showVintageBrix", heading: "Avg Brix ° — Block × Vintage" },
  { filter: "showVintagePh", heading: "Avg pH — Block × Vintage" },
  { filter: "showVintageTa", heading: "Avg TA (g/L) — Block × Vintage" },
  { filter: "showVintagePa", heading: "Avg Pot. Alc % — Block × Vintage" },
] as const;

const blocks = [
  { id: 244_401, blockName: "Chemistry North", variety: "Chardonnay", areaHa: 1.2 },
  { id: 244_402, blockName: "Chemistry South", variety: "Pinot Noir", areaHa: 1.4 },
];

const harvests = blocks.flatMap((block, blockIndex) =>
  [2025, 2026].map((vintageYear, vintageIndex) => ({
    id: 244_410 + blockIndex * 2 + vintageIndex,
    blockId: block.id,
    vintageYear,
    harvestDate: `${vintageYear}-09-15`,
    yieldKg: 1200 + blockIndex * 100 + vintageIndex * 50,
    brix: 19.5 + blockIndex + vintageIndex * 0.4,
    ph: 3.1 + blockIndex * 0.1 + vintageIndex * 0.05,
    titratableAcidityGl: 7.2 - vintageIndex * 0.2,
    potentialAlcohol: 11.2 + blockIndex * 0.3 + vintageIndex * 0.2,
  })),
);

async function mockViticultureFarms(page: Page): Promise<void> {
  await page.route("**/api/tenants/current/farms", route =>
    route.fulfill({ json: { farms: [FARM_A, FARM_B] } }),
  );

  for (const farm of [FARM_A, FARM_B]) {
    await page.route(`**/api/farms/${farm.id}/dashboard`, route =>
      route.fulfill({
        json: {
          farm,
          activeSubscriptions: [{ moduleKey: "viticulture" }],
        },
      }),
    );
    await page.route(`**/api/farms/${farm.id}/vineyard-blocks**`, route =>
      route.fulfill({ json: { records: blocks } }),
    );
    await page.route(`**/api/farms/${farm.id}/vineyard-harvest**`, route => {
      const url = new URL(route.request().url());
      if (route.request().method() === "GET" && url.pathname === `/api/farms/${farm.id}/vineyard-harvest`) {
        return route.fulfill({ json: { records: harvests } });
      }
      return route.continue();
    });
  }
}

async function openHarvest(page: Page): Promise<void> {
  await page.getByRole("link", { name: "Viticulture", exact: true }).first().click();
  await expect(page.getByText("Harvest & Vintage Records", { exact: true })).toBeVisible({
    timeout: 20_000,
  });
}

async function switchFarm(page: Page, farmName: string): Promise<void> {
  await page.getByRole("button", { name: /Switch Farm/ }).first().click();
  await expect(page).toHaveURL(/\/dashboard\/select$/);
  await page.getByText(farmName, { exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard\/dashboard$/);
  await openHarvest(page);
}

async function setChemistryPrintVisibility(
  page: Page,
  visibility: Record<(typeof chemistryMetrics)[number]["filter"], boolean>,
): Promise<void> {
  await page.evaluate(
    ({ farmId, metrics, nextVisibility }) => {
      localStorage.setItem(
        `viticulture-harvest-year-filter-${farmId}`,
        "all",
      );
      for (const { filter } of metrics) {
        localStorage.setItem(
          `viticulture-harvest-${filter}-filter-${farmId}`,
          nextVisibility[filter] ? "true" : "false",
        );
      }
    },
    {
      farmId: FARM_A.id,
      metrics: chemistryMetrics,
      nextVisibility: visibility,
    },
  );
  await page.reload({ waitUntil: "networkidle" });
  await openHarvest(page);
}

async function openHarvestPrintPopup(page: Page): Promise<Page> {
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Print", exact: true }).click();
  const popup = await popupPromise;
  await expect(
    popup.getByRole("heading", {
      name: "Chemistry Cross-tab — Block × Vintage",
      exact: true,
    }),
  ).toBeVisible({ timeout: 10_000 });
  return popup;
}

test("chemistry cross-tab collapse persists per farm", async ({ page }) => {
  await mockViticultureFarms(page);
  await signInDashboard(page);

  await page.evaluate(
    ([tenantSlug, farmId, farmAKey, farmBKey]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "harvest");
      localStorage.removeItem(farmAKey);
      localStorage.removeItem(farmBKey);
    },
    [TENANT_SLUG, FARM_A.id, STORAGE_KEY(FARM_A.id), STORAGE_KEY(FARM_B.id)] as const,
  );

  await page.reload({ waitUntil: "networkidle" });
  await openHarvest(page);

  const chemistryCrossTab = page.getByRole("button", {
    name: /Chemistry Cross-tab — Block × Vintage/,
  });
  await expect(chemistryCrossTab).toHaveAttribute("aria-expanded", "true");
  await chemistryCrossTab.click();
  await expect(chemistryCrossTab).toHaveAttribute("aria-expanded", "false");
  await expect(page.evaluate(key => localStorage.getItem(key), STORAGE_KEY(FARM_A.id)))
    .resolves.toBe("false");

  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await expect(page.getByText("Active Blocks", { exact: true })).toBeVisible({
    timeout: 20_000,
  });
  await page.getByRole("button", { name: "Harvest", exact: true }).click();
  await expect(chemistryCrossTab).toHaveAttribute("aria-expanded", "false");

  await switchFarm(page, FARM_B.name);
  await expect(chemistryCrossTab).toHaveAttribute("aria-expanded", "true");
  await expect(page.evaluate(key => localStorage.getItem(key), STORAGE_KEY(FARM_B.id)))
    .resolves.toBeNull();

  await switchFarm(page, FARM_A.name);
  await expect(chemistryCrossTab).toHaveAttribute("aria-expanded", "false");
  await expect(page.evaluate(key => localStorage.getItem(key), STORAGE_KEY(FARM_A.id)))
    .resolves.toBe("false");
});

test("printed chemistry cross-tab follows persisted metric visibility", async ({ page }) => {
  await mockViticultureFarms(page);
  await signInDashboard(page);

  await page.evaluate(
    ([tenantSlug, farmId, yearFilterKey]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "harvest");
      localStorage.setItem(yearFilterKey, "all");
    },
    [TENANT_SLUG, FARM_A.id, HARVEST_FILTER_KEY("year", FARM_A.id)] as const,
  );

  const allVisible = Object.fromEntries(
    chemistryMetrics.map(({ filter }) => [filter, true]),
  ) as Record<(typeof chemistryMetrics)[number]["filter"], boolean>;

  await setChemistryPrintVisibility(page, allVisible);
  let popup = await openHarvestPrintPopup(page);
  for (const { heading } of chemistryMetrics) {
    await expect(popup.getByRole("heading", { name: heading, exact: true })).toBeVisible();
  }
  await popup.close();

  for (const hiddenMetric of chemistryMetrics) {
    await setChemistryPrintVisibility(page, {
      ...allVisible,
      [hiddenMetric.filter]: false,
    });
    popup = await openHarvestPrintPopup(page);
    await expect(
      popup.getByRole("heading", { name: hiddenMetric.heading, exact: true }),
    ).toHaveCount(0);
    for (const visibleMetric of chemistryMetrics.filter(
      metric => metric.filter !== hiddenMetric.filter,
    )) {
      await expect(
        popup.getByRole("heading", { name: visibleMetric.heading, exact: true }),
      ).toBeVisible();
    }
    await popup.close();
  }

  await setChemistryPrintVisibility(
    page,
    Object.fromEntries(
      chemistryMetrics.map(({ filter }) => [filter, false]),
    ) as Record<(typeof chemistryMetrics)[number]["filter"], boolean>,
  );
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Print", exact: true }).click();
  popup = await popupPromise;
  await expect(
    popup.getByRole("heading", { name: "Harvest & Vintage Records", exact: true }),
  ).toBeVisible({ timeout: 10_000 });
  await expect(
    popup.getByRole("heading", {
      name: "Chemistry Cross-tab — Block × Vintage",
      exact: true,
    }),
  ).toHaveCount(0);
  for (const { heading } of chemistryMetrics) {
    await expect(popup.getByRole("heading", { name: heading, exact: true })).toHaveCount(0);
  }
  await popup.close();
});
