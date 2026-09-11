import { expect, test, type Page } from "@playwright/test";
import { Client } from "pg";

import { signInDashboard } from "./auth";

const TENANT_SLUG = "oakfield-farms";
const WITH_PHOTOS = "E2E Has Photos Variety";
const WITHOUT_PHOTOS = "E2E No Photos Variety";
const UNLINKED = "E2E Unlinked Variety";

type ViticultureFarm = {
  tenantSlug: string;
  farmId: number;
};

async function getViticultureFarm(): Promise<ViticultureFarm> {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();

  try {
    const result = await db.query<{ tenant_slug: string; farm_id: number }>(
      `SELECT t.slug AS tenant_slug, f.id AS farm_id
       FROM tenants t
       JOIN farms f ON f.tenant_id = t.id
       JOIN subscriptions s ON s.farm_id = f.id AND s.tenant_id = t.id
       JOIN modules m ON m.id = s.module_id
       WHERE t.slug = $1
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
      [TENANT_SLUG],
    );

    const farm = result.rows[0];
    if (!farm) {
      throw new Error(
        `Vine Register photo filter setup failed: no active Viticulture farm is available for tenant ${TENANT_SLUG}.`,
      );
    }
    return { tenantSlug: farm.tenant_slug, farmId: farm.farm_id };
  } finally {
    await db.end();
  }
}

async function prepareDashboard(page: Page, farm: ViticultureFarm): Promise<void> {
  await page.route(`**/api/farms/${farm.farmId}/vine-register`, async route => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await route.fulfill({
      json: {
        records: [
          {
            id: 924471,
            blockId: 924461,
            registeredVariety: WITH_PHOTOS,
            fsaVineRegisterRef: "E2E-PHOTO-1",
            registeredAreaHa: "1.25",
            isRemovedFromRegister: false,
          },
          {
            id: 924472,
            blockId: 924462,
            registeredVariety: WITHOUT_PHOTOS,
            fsaVineRegisterRef: "E2E-PHOTO-2",
            registeredAreaHa: "2.50",
            isRemovedFromRegister: false,
          },
          {
            id: 924473,
            blockId: null,
            registeredVariety: UNLINKED,
            fsaVineRegisterRef: "E2E-PHOTO-3",
            registeredAreaHa: "3.75",
            isRemovedFromRegister: false,
          },
        ],
      },
    });
  });

  await page.route(`**/api/farms/${farm.farmId}/vineyard-blocks`, async route => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await route.fulfill({
      json: {
        records: [
          { id: 924461, farmId: farm.farmId, blockName: "Photo Block", photoCount: 2 },
          { id: 924462, farmId: farm.farmId, blockName: "Bare Block", photoCount: 0 },
        ],
      },
    });
  });

  for (const endpoint of [
    "vineyard-operations",
    "vineyard-harvest",
    "vineyard-scouting",
    "vineyard-spray-diary",
    "vineyard-phenology",
  ]) {
    await page.route(`**/api/farms/${farm.farmId}/${endpoint}`, async route => {
      if (route.request().method() !== "GET") {
        await route.continue();
        return;
      }
      await route.fulfill({ json: { records: [] } });
    });
  }

  await signInDashboard(page);
  await page.goto("/dashboard/");
  await page.evaluate(
    ([tenantSlug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "vine-register");
      for (const filter of ["search", "status", "gi", "colour", "photo-coverage"]) {
        localStorage.removeItem(`vine-register-${filter}-filter-${farmId}`);
      }
    },
    [farm.tenantSlug, farm.farmId] as [string, number],
  );
  await page.goto("/dashboard/viticulture");
  await page.waitForLoadState("networkidle");
  await expect(page.getByText("FSA Vine Register", { exact: true })).toBeVisible();
}

async function selectPhotoCoverage(
  page: Page,
  option: "All photo coverage" | "Has photos" | "No photos",
): Promise<void> {
  await page.getByRole("combobox").nth(3).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test("Vine Register photo coverage filter includes unlinked rows and resets accurately", async ({
  page,
}) => {
  const farm = await getViticultureFarm();
  await prepareDashboard(page, farm);

  for (const variety of [WITH_PHOTOS, WITHOUT_PHOTOS, UNLINKED]) {
    await expect(page.getByText(variety, { exact: true })).toBeVisible();
  }
  await expect(page.getByRole("button", { name: /Clear filters/ })).toHaveCount(0);

  await selectPhotoCoverage(page, "Has photos");
  await expect(page.getByText(WITH_PHOTOS, { exact: true })).toBeVisible();
  await expect(page.getByText(WITHOUT_PHOTOS, { exact: true })).toHaveCount(0);
  await expect(page.getByText(UNLINKED, { exact: true })).toHaveCount(0);
  await expect(page.getByText("Showing 1 of 3", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Clear filters (1)" })).toBeVisible();

  await selectPhotoCoverage(page, "No photos");
  await expect(page.getByText(WITH_PHOTOS, { exact: true })).toHaveCount(0);
  await expect(page.getByText(WITHOUT_PHOTOS, { exact: true })).toBeVisible();
  await expect(page.getByText(UNLINKED, { exact: true })).toBeVisible();
  await expect(page.getByText("Showing 2 of 3", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Clear filters (1)" })).toBeVisible();

  await page.getByRole("button", { name: "Clear filters (1)" }).click();
  for (const variety of [WITH_PHOTOS, WITHOUT_PHOTOS, UNLINKED]) {
    await expect(page.getByText(variety, { exact: true })).toBeVisible();
  }
  await expect(page.getByRole("button", { name: /Clear filters/ })).toHaveCount(0);
  await expect(page.getByText(/Showing \d+ of \d+/)).toHaveCount(0);

  await selectPhotoCoverage(page, "All photo coverage");
  for (const variety of [WITH_PHOTOS, WITHOUT_PHOTOS, UNLINKED]) {
    await expect(page.getByText(variety, { exact: true })).toBeVisible();
  }
});