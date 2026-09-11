import { expect, test, type Page } from "@playwright/test";
import { signInDashboard } from "./auth";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

function bypassHeaders() {
  return {
    "Content-Type": "application/json",
    "x-dev-bypass": DEV_BYPASS,
    "x-tenant-slug": TENANT_SLUG,
  };
}

async function apiPost(url: string, body: unknown): Promise<Record<string, unknown>> {
  const response = await fetch(url, {
    method: "POST",
    headers: bypassHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`POST ${url} → ${response.status}: ${await response.text()}`);
  return response.json() as Promise<Record<string, unknown>>;
}

async function apiDelete(url: string): Promise<void> {
  const response = await fetch(url, {
    method: "DELETE",
    headers: bypassHeaders(),
  });
  if (!response.ok) throw new Error(`DELETE ${url} → ${response.status}: ${await response.text()}`);
}

async function createBlock(blockName: string): Promise<number> {
  const { record } = await apiPost(
    `${apiBase()}/api/farms/${FARM_ID}/vineyard-blocks`,
    { blockName, variety: "Chardonnay" },
  ) as { record: { id: number } };
  return record.id;
}

async function attachPhoto(blockId: number, fileName: string): Promise<number> {
  const { photo } = await apiPost(
    `${apiBase()}/api/farms/${FARM_ID}/vineyard-blocks/${blockId}/photos`,
    {
      objectPath: `/objects/e2e-lightbox-keyboard-${blockId}-${fileName}`,
      fileName,
    },
  ) as { photo: { id: number } };
  return photo.id;
}

async function openBlocksTab(page: Page) {
  await signInDashboard(page);
  await page.evaluate(([tenantSlug, farmId]) => {
    localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
    localStorage.setItem(
      "farmtrac-storage",
      JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
    );
  }, [TENANT_SLUG, FARM_ID] as [string, number]);
  await page.goto("/dashboard/viticulture");
  await page.waitForLoadState("networkidle");
  const blocksTab = page.getByRole("button", { name: "Blocks", exact: true });
  if (await blocksTab.isVisible({ timeout: 5_000 }).catch(() => false)) await blocksTab.click();
}

test("keyboard users can focus the lightbox reorder handle and move a filmstrip photo", async ({ page }) => {
  const blockName = `E2E lightbox keyboard ${Date.now()}`;
  const blockId = await createBlock(blockName);
  const photoIds: number[] = [];
  const fileNames = ["cover.jpg", "middle.jpg", "last.jpg"];

  try {
    for (const fileName of fileNames) photoIds.push(await attachPhoto(blockId, fileName));

    await openBlocksTab(page);
    await page.reload({ waitUntil: "networkidle" });

    const blockRow = page.locator("tr", { hasText: blockName });
    await expect(blockRow).toBeVisible();
    await blockRow.locator("td").last().locator("button").first().click();

    const blockDialog = page.getByRole("dialog").filter({ hasText: `Vineyard Block — ${blockName}` });
    await expect(blockDialog.getByText("Photos (3)", { exact: true })).toBeVisible();
    await blockDialog.getByRole("img", { name: "middle.jpg" }).click();

    const lightbox = page.getByRole("dialog").filter({ hasText: "middle.jpg" });
    await expect(lightbox).toBeVisible();
    const filmstrip = lightbox.locator("[data-photo-id]").first().locator("..");
    await expect(filmstrip.locator("[data-photo-id]")).toHaveCount(3);

    const reorderHandle = lightbox.getByRole("button", { name: "Drag to reorder" }).first();
    await reorderHandle.focus();
    await expect(reorderHandle).toBeFocused();
    await expect(reorderHandle).toHaveCSS("opacity", "1");

    const orderBefore = await filmstrip.locator("[data-photo-id]").evaluateAll(elements =>
      elements.map(element => element.getAttribute("data-photo-id")),
    );
    expect(orderBefore).toEqual(photoIds.map(String));

    await reorderHandle.press("Space");
    await reorderHandle.press("ArrowRight");
    await reorderHandle.press("Space");

    await expect.poll(async () =>
      filmstrip.locator("[data-photo-id]").evaluateAll(elements =>
        elements.map(element => element.getAttribute("data-photo-id")),
      ),
    ).toEqual([String(photoIds[0]), String(photoIds[2]), String(photoIds[1])]);
  } finally {
    for (const photoId of photoIds) {
      await apiDelete(
        `${apiBase()}/api/farms/${FARM_ID}/vineyard-blocks/${blockId}/photos/${photoId}`,
      ).catch(() => undefined);
    }
    await apiDelete(`${apiBase()}/api/farms/${FARM_ID}/vineyard-blocks/${blockId}`)
      .catch(() => undefined);
  }
});