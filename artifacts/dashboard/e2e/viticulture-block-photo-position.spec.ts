import { expect, test, type Page } from "@playwright/test";
import { signInDashboard } from "./auth";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;

function apiBase(): string {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

async function apiRequest(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<Record<string, unknown>> {
  const response = await fetch(`${apiBase()}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-dev-bypass": DEV_BYPASS,
      "x-tenant-slug": TENANT_SLUG,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`${method} ${path} → ${response.status}: ${await response.text()}`);
  }
  return response.status === 204
    ? {}
    : (await response.json()) as Record<string, unknown>;
}

async function createBlock(name: string): Promise<number> {
  const result = await apiRequest(`/api/farms/${FARM_ID}/vineyard-blocks`, "POST", {
    blockName: name,
    variety: "Chardonnay",
  }) as { record: { id: number } };
  return result.record.id;
}

async function attachPhoto(blockId: number, fileName: string): Promise<number> {
  const result = await apiRequest(
    `/api/farms/${FARM_ID}/vineyard-blocks/${blockId}/photos`,
    "POST",
    {
      objectPath: `/objects/e2e-block-photo-position-${Date.now()}-${fileName}`,
      fileName,
    },
  ) as { photo: { id: number } };
  return result.photo.id;
}

async function openBlocksTab(page: Page): Promise<void> {
  await signInDashboard(page);
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
  await page.waitForLoadState("networkidle");

  const blocksTab = page.getByRole("button", { name: "Blocks", exact: true });
  if (await blocksTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await blocksTab.click();
  }
}

test("lightbox position follows reordered block photos and navigation", async ({ page }) => {
  const runId = Date.now();
  const blockName = `E2E photo position ${runId}`;
  const coverName = `position-cover-${runId}.jpg`;
  const middleName = `position-middle-${runId}.jpg`;
  const movedName = `position-moved-${runId}.jpg`;
  const blockId = await createBlock(blockName);
  const photoIds: number[] = [];

  try {
    photoIds.push(await attachPhoto(blockId, coverName));
    photoIds.push(await attachPhoto(blockId, middleName));
    photoIds.push(await attachPhoto(blockId, movedName));
    await Promise.all([
      apiRequest(
        `/api/farms/${FARM_ID}/vineyard-blocks/${blockId}/photos/${photoIds[0]}`,
        "PATCH",
        { isCover: true, sortOrder: 0 },
      ),
      apiRequest(
        `/api/farms/${FARM_ID}/vineyard-blocks/${blockId}/photos/${photoIds[1]}`,
        "PATCH",
        { sortOrder: 1 },
      ),
      apiRequest(
        `/api/farms/${FARM_ID}/vineyard-blocks/${blockId}/photos/${photoIds[2]}`,
        "PATCH",
        { sortOrder: 2 },
      ),
    ]);

    await openBlocksTab(page);

    const row = page.locator("tr", { hasText: blockName });
    await expect(row).toBeVisible();
    await row.locator("button").first().click();

    const blockDialog = page
      .getByRole("dialog")
      .filter({ hasText: `Vineyard Block — ${blockName}` });
    await expect(blockDialog.getByText("Photos (3)", { exact: true })).toBeVisible();

    await blockDialog.getByAltText(movedName).click();
    let lightbox = page.getByRole("dialog", { name: new RegExp(movedName) });
    await expect(lightbox).toContainText("3 of 3");
    await lightbox.getByRole("button", { name: "Close", exact: true }).click();

    const movedPhoto = blockDialog.getByAltText(movedName).locator("..");
    const reorderHandle = movedPhoto.getByRole("button", { name: "Reorder photo" });
    await reorderHandle.focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("Space");

    await blockDialog.getByAltText(movedName).click();
    lightbox = page.getByRole("dialog", { name: new RegExp(movedName) });
    await expect(lightbox).toContainText("2 of 3");

    await lightbox.getByRole("button", { name: "Next photo" }).click();
    await expect(lightbox).toContainText(middleName);
    await expect(lightbox).toContainText("3 of 3");

    await lightbox.getByRole("button", { name: "Previous photo" }).click();
    await expect(lightbox).toContainText(movedName);
    await expect(lightbox).toContainText("2 of 3");

    await lightbox.getByRole("button", { name: "Previous photo" }).click();
    await expect(lightbox).toContainText(coverName);
    await expect(lightbox).toContainText("1 of 3");
  } finally {
    for (const photoId of photoIds.reverse()) {
      await apiRequest(
        `/api/farms/${FARM_ID}/vineyard-blocks/${blockId}/photos/${photoId}`,
        "DELETE",
      ).catch(() => undefined);
    }
    await apiRequest(`/api/farms/${FARM_ID}/vineyard-blocks/${blockId}`, "DELETE")
      .catch(() => undefined);
  }
});