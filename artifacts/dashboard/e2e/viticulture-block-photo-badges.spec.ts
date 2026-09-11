import { expect, test, type Page } from "@playwright/test";

import { signInDashboard } from "./auth";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const WITH_PHOTOS = "E2E Block With Photos";
const WITHOUT_PHOTOS = "E2E Block Without Photos";

async function openBlocksTab(page: Page): Promise<void> {
  await page.route(`**/api/farms/${FARM_ID}/vineyard-blocks`, async route => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }

    await route.fulfill({
      json: {
        records: [
          {
            id: 924481,
            farmId: FARM_ID,
            blockName: WITH_PHOTOS,
            photoCount: 3,
            isActive: true,
          },
          {
            id: 924482,
            farmId: FARM_ID,
            blockName: WITHOUT_PHOTOS,
            photoCount: 0,
            isActive: true,
          },
        ],
      },
    });
  });

  await signInDashboard(page);
  await page.goto("/dashboard/");
  await page.evaluate(
    ([tenantSlug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "blocks");
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );
  await page.goto("/dashboard/viticulture");
  await page.waitForLoadState("networkidle");
  await expect(page.getByText("Vineyard Blocks", { exact: true })).toBeVisible();
}

test("Blocks rows show the photo count chip and amber no-photos badge", async ({ page }) => {
  await openBlocksTab(page);

  const withPhotosRow = page.getByRole("row").filter({ hasText: WITH_PHOTOS });
  await expect(withPhotosRow).toBeVisible();
  await expect(withPhotosRow.getByText("3", { exact: true })).toBeVisible();
  await expect(withPhotosRow.locator(".bg-muted").filter({ hasText: "3" })).toBeVisible();

  const withoutPhotosRow = page.getByRole("row").filter({ hasText: WITHOUT_PHOTOS });
  await expect(withoutPhotosRow).toBeVisible();
  const noPhotosBadge = withoutPhotosRow.getByText("No photos", { exact: true });
  await expect(noPhotosBadge).toBeVisible();
  await expect(noPhotosBadge).toHaveClass(/bg-amber-50/);
  await expect(noPhotosBadge).toHaveClass(/text-amber-700/);
});