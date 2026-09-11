import { expect, test, type Locator, type Page } from "@playwright/test";
import { signInDashboard } from "./auth";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const BLOCK_ID = 238_700;
const SHORT_CAPTION = "North row after pruning";
const LONG_CAPTION =
  "North-west corner after the late summer canopy pass, showing the lower leaves, fruit zone, and the posts beside the access track for the next inspection.";

const PHOTOS = [
  {
    id: 238_701,
    objectPath: "/test/short.jpg",
    fileName: "north-row-pruning.jpg",
    caption: SHORT_CAPTION,
    isCover: true,
    sortOrder: 0,
    uploadedAt: "2026-09-11T09:00:00.000Z",
  },
  {
    id: 238_702,
    objectPath: "/test/long.jpg",
    fileName: "north-west-corner-canopy-inspection.jpg",
    caption: LONG_CAPTION,
    isCover: false,
    sortOrder: 1,
    uploadedAt: "2026-09-11T09:01:00.000Z",
  },
];

const BLOCK = {
  id: BLOCK_ID,
  blockName: "Caption layout check",
  blockRef: "CAP-01",
  variety: "Chardonnay",
  areaHa: "1.2",
  isActive: true,
  plantingStatus: "active",
  photoCount: PHOTOS.length,
  photos: PHOTOS,
  plantings: [],
};

async function openBlocksTab(page: Page): Promise<void> {
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
  await page.reload({ waitUntil: "networkidle" });
  await page.goto("/dashboard/viticulture");
  await expect(page.getByText("Vineyard Blocks", { exact: true })).toBeVisible();
}

async function expectInsideViewport(locator: Locator, viewportWidth: number): Promise<void> {
  const box = await locator.boundingBox();
  expect(box, "element must have a visible bounding box").not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewportWidth);
}

test("short and long lightbox captions stay readable on a narrow dashboard", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.route(`**/api/farms/${FARM_ID}/vineyard-blocks`, route =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([BLOCK]) }),
  );
  await page.route(`**/api/farms/${FARM_ID}/vineyard-blocks/${BLOCK_ID}/photos`, route =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ photos: PHOTOS }) }),
  );
  await page.route(`**/api/farms/${FARM_ID}/vineyard-blocks/${BLOCK_ID}/photos/*`, route =>
    route.fulfill({
      status: 200,
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="100%" height="100%" fill="#d1d5db"/></svg>',
    }),
  );
  await page.route(new RegExp(`/api/farms/${FARM_ID}(?:\\?.*)?$`), async route => {
    const response = await route.fetch();
    const body = await response.json() as { record: Record<string, unknown> };
    await route.fulfill({
      response,
      json: {
        ...body,
        record: { ...body.record, sectorViticulture: true },
      },
    });
  });

  await signInDashboard(page);
  await openBlocksTab(page);

  await page.getByRole("button", { name: /view/i }).first().click();
  await page.getByAltText(PHOTOS[0].fileName).first().click();

  const lightbox = page.getByTestId("block-photo-lightbox");
  const caption = page.getByTestId("lightbox-caption");
  await expect(lightbox).toBeVisible();
  await expect(caption).toHaveText(SHORT_CAPTION);
  await expect(page.getByTestId("lightbox-filename")).toHaveText(PHOTOS[0].fileName);
  await expect(page.getByTestId("lightbox-position")).toHaveText("1 of 2");

  await page.getByRole("button", { name: "Next photo" }).click();
  await expect(caption).toHaveText(LONG_CAPTION);
  await expect(page.getByTestId("lightbox-filename")).toHaveText(PHOTOS[1].fileName);
  await expect(page.getByTestId("lightbox-position")).toHaveText("2 of 2");

  const captionMetrics = await caption.evaluate(element => {
    const style = getComputedStyle(element);
    return {
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      height: element.getBoundingClientRect().height,
      lineHeight: Number.parseFloat(style.lineHeight),
    };
  });
  expect(captionMetrics.scrollWidth).toBeLessThanOrEqual(captionMetrics.clientWidth);
  expect(captionMetrics.height).toBeGreaterThan(captionMetrics.lineHeight);

  await expectInsideViewport(lightbox, 360);
  await expectInsideViewport(page.getByTestId("lightbox-filename"), 360);
  await expectInsideViewport(page.getByTestId("lightbox-position"), 360);
  await expectInsideViewport(page.getByRole("button", { name: "Previous photo" }), 360);
  await expectInsideViewport(page.getByRole("button", { name: "Close" }), 360);
  await expect(lightbox.getByAltText(PHOTOS[1].fileName)).toBeVisible();

  await page.getByRole("button", { name: "Close" }).click();
  await expect(lightbox).toBeHidden();
});
