import { expect, test, type Page } from "@playwright/test";

import { signInDashboard } from "./auth";
import {
  getActiveViticultureFarm,
  type ActiveViticultureFarm,
} from "./viticulture-farm-fixture";

const WITH_PHOTOS = "E2E Has Photos Variety";
const WITHOUT_PHOTOS = "E2E No Photos Variety";
const UNLINKED = "E2E Unlinked Variety";

async function prepareDashboard(page: Page, farm: ActiveViticultureFarm): Promise<void> {
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
  const farm = await getActiveViticultureFarm();
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