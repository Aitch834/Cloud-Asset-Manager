import { expect, test } from "@playwright/test";
import { signInDashboard } from "./auth";
import { TENANT_SLUG, VITICULTURE_FARM_ID } from "./global-setup";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

async function apiRequest(
  method: "GET" | "POST" | "DELETE",
  path: string,
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
    : response.json() as Promise<Record<string, unknown>>;
}

test("keyboard users can open the block lightbox and persist a filmstrip reorder", async ({
  page,
}) => {
  const blockName = `E2E-keyboard-lightbox-${Date.now()}`;
  const created = await apiRequest(
    "POST",
    `/api/farms/${VITICULTURE_FARM_ID}/vineyard-blocks`,
    { blockName, variety: "Chardonnay" },
  ) as { record: { id: number } };
  const blockId = created.record.id;
  const photoIds: number[] = [];

  try {
    for (const label of ["cover", "middle", "last"]) {
      const createdPhoto = await apiRequest(
        "POST",
        `/api/farms/${VITICULTURE_FARM_ID}/vineyard-blocks/${blockId}/photos`,
        {
          objectPath: `/objects/e2e-keyboard-lightbox-${label}-${Date.now()}.jpg`,
          fileName: `${label}.jpg`,
        },
      ) as { photo: { id: number } };
      photoIds.push(createdPhoto.photo.id);
    }

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
      [TENANT_SLUG, VITICULTURE_FARM_ID] as [string, number],
    );
    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("link", { name: "Viticulture", exact: true }).first().click();

    const row = page.locator("tr").filter({ hasText: blockName });
    await expect(row).toBeVisible();
    const viewButton = row.getByRole("button", { name: "View", exact: true });
    await viewButton.focus();
    await page.keyboard.press("Enter");

    const blockDialog = page.getByRole("dialog").filter({ hasText: blockName });
    await expect(blockDialog).toBeVisible();
    const lightboxTrigger = blockDialog.getByRole("button", {
      name: "Open middle.jpg in lightbox",
    });
    await lightboxTrigger.focus();
    await page.keyboard.press("Enter");

    const lightbox = page.getByRole("dialog").filter({ hasText: "middle.jpg" });
    await expect(lightbox).toBeVisible();
    const handles = lightbox.getByRole("button", { name: "Drag to reorder" });
    const middleHandle = handles.first();
    await middleHandle.focus();
    await expect(middleHandle).toBeFocused();
    await expect(middleHandle).toHaveCSS("opacity", "1");

    const reorderResponses = Promise.all([
      page.waitForResponse(response =>
        response.request().method() === "PATCH"
        && response.url().includes(`/vineyard-blocks/${blockId}/photos/`),
      ),
      page.waitForResponse(response =>
        response.request().method() === "PATCH"
        && response.url().includes(`/vineyard-blocks/${blockId}/photos/`),
      ),
    ]);
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Space");
    const responses = await reorderResponses;
    expect(responses.every(response => response.ok())).toBe(true);

    await expect.poll(async () => {
      const payload = await apiRequest(
        "GET",
        `/api/farms/${VITICULTURE_FARM_ID}/vineyard-blocks/${blockId}/photos`,
      ) as { photos: Array<{ id: number }> };
      return payload.photos.map(photo => photo.id);
    }).toEqual([photoIds[0], photoIds[2], photoIds[1]]);
  } finally {
    for (const photoId of photoIds) {
      await apiRequest(
        "DELETE",
        `/api/farms/${VITICULTURE_FARM_ID}/vineyard-blocks/${blockId}/photos/${photoId}`,
      ).catch(() => undefined);
    }
    await apiRequest(
      "DELETE",
      `/api/farms/${VITICULTURE_FARM_ID}/vineyard-blocks/${blockId}`,
    ).catch(() => undefined);
  }
});