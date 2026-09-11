import { signInDashboard } from "./auth";
/**
 * E2E: Disease Scouting print honours the shared photo filter.
 *
 * Uses deterministic browser fixtures so the check exercises the real
 * Scouting tab, shared Has photos / No photos selector, pre-flight dialog, and
 * generated print document without changing shared scouting data.
 */

import { expect, test, type Page } from "@playwright/test";
import {
  getActiveViticultureFarm,
  type ActiveViticultureFarm,
} from "./viticulture-farm-fixture";

const WITH_PHOTOS_SCOUT = "E2E Print Has Photos";
const WITHOUT_PHOTOS_SCOUT = "E2E Print No Photos";

async function prepareScouting(page: Page, farm: ActiveViticultureFarm): Promise<void> {
  await page.route(`**/api/farms/${farm.farmId}/vineyard-blocks`, async route => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        records: [
          {
            id: 924091,
            farmId: farm.farmId,
            blockName: "E2E Scouting Print Block",
            variety: "Chardonnay",
            photos: [],
          },
        ],
      }),
    });
  });

  await page.route(`**/api/farms/${farm.farmId}/vineyard-scouting`, async route => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        records: [
          {
            id: 924092,
            farmId: farm.farmId,
            blockId: 924091,
            scoutDate: "2026-08-14",
            scoutedBy: WITH_PHOTOS_SCOUT,
            photoCount: 2,
            captionCount: 1,
            downyMildewPressure: 1,
            powderyMildewPressure: 0,
            botrytisPressure: 0,
            phomopsisPressure: 0,
          },
          {
            id: 924093,
            farmId: farm.farmId,
            blockId: null,
            scoutDate: "2026-08-15",
            scoutedBy: WITHOUT_PHOTOS_SCOUT,
            photoCount: 0,
            captionCount: 0,
            downyMildewPressure: 0,
            powderyMildewPressure: 1,
            botrytisPressure: 0,
            phomopsisPressure: 0,
          },
        ],
      }),
    });
  });

  await signInDashboard(page);
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(
    ([tenantSlug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "scouting");
      for (const filter of ["block", "year", "photos", "print-block"]) {
        localStorage.removeItem(`viticulture-scouting-${filter}-filter-${farmId}`);
      }
    },
    [farm.tenantSlug, farm.farmId] as [string, number],
  );

  await page.goto("/dashboard/viticulture");
  await page.waitForLoadState("networkidle");
  await expect(page.getByText("Disease & Pest Scouting", { exact: true })).toBeVisible({
    timeout: 15_000,
  });
}

async function selectPhotoFilter(page: Page, option: "Has photos" | "No photos") {
  // Scouting renders block, year, photo, then print-block selectors.
  await page.getByRole("combobox").nth(2).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test("scouting print uses Has photos rows and explains the No photos filter before printing", async ({
  page,
}) => {
  const farm = await getActiveViticultureFarm();
  await prepareScouting(page, farm);

  await selectPhotoFilter(page, "Has photos");
  await expect(page.locator("tr", { hasText: WITH_PHOTOS_SCOUT })).toBeVisible();
  await expect(page.locator("tr", { hasText: WITHOUT_PHOTOS_SCOUT })).toHaveCount(0);

  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Print", exact: true }).click();
  const popup = await popupPromise;
  await expect(popup.getByText(WITH_PHOTOS_SCOUT, { exact: true })).toBeVisible();
  await expect(popup.getByText(WITHOUT_PHOTOS_SCOUT, { exact: true })).toHaveCount(0);
  await popup.close();

  await selectPhotoFilter(page, "No photos");
  await expect(page.locator("tr", { hasText: WITHOUT_PHOTOS_SCOUT })).toBeVisible();
  await expect(page.locator("tr", { hasText: WITH_PHOTOS_SCOUT })).toHaveCount(0);
  await page.getByRole("button", { name: "Print", exact: true }).click();

  const dialog = page.getByRole("dialog", { name: /record isn't linked to a block/i });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Active photo filter: No photos.");
  await expect(dialog).toContainText("Records with photos are excluded.");
});