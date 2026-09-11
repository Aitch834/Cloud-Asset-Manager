import { signInDashboard } from "./auth";
import { expect, test } from "@playwright/test";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled
const RUN_TAG = `E2E-2402-${Date.now()}`;

type ApiRecord = Record<string, unknown>;

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

async function devFetch(
  url: string,
  init: RequestInit = {},
): Promise<ApiRecord> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers as Record<string, string> | undefined),
      "x-dev-bypass": DEV_BYPASS,
      "x-tenant-slug": TENANT_SLUG,
    },
  });
  if (!response.ok) {
    throw new Error(
      `${init.method ?? "GET"} ${url} → ${response.status}: ${await response.text()}`,
    );
  }
  return response.json() as Promise<ApiRecord>;
}

async function createBarrel(vesselRef: string): Promise<number> {
  const body = await devFetch(`${apiBase()}/api/farms/${FARM_ID}/winery-vessels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      vesselRef,
      vesselType: "barrel",
      capacityLitres: 225,
      status: "active",
    }),
  });
  return Number((body.record as ApiRecord).id);
}

async function createClean(vesselId: number): Promise<void> {
  await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/winery-vessels/${vesselId}/cleans`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cleanDate: new Date().toISOString().slice(0, 10),
        cleanType: "Chemical wash",
        cleaningProduct: RUN_TAG,
        rinseCompleted: true,
      }),
    },
  );
}

async function deleteBarrel(vesselId: number): Promise<void> {
  await devFetch(`${apiBase()}/api/farms/${FARM_ID}/winery-vessels/${vesselId}`, {
    method: "DELETE",
  });
}

async function openVesselRegister(
  page: import("@playwright/test").Page,
  visibleRefs: string[],
): Promise<void> {
  await signInDashboard(page);

  await page.route("**/api/farms/5/winery-vessels*", async route => {
    const response = await route.fetch();
    const body = await response.json() as ApiRecord;
    const records = ((body.records ?? []) as ApiRecord[]).filter(record =>
      visibleRefs.includes(String(record.vessel_ref)),
    );
    await route.fulfill({ response, json: { ...body, records } });
  });

  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(
    ([slug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "winery-vessels");
      localStorage.removeItem(`vessel-register-detail-tab-filter-${farmId}`);
      localStorage.removeItem(`vessel-register-last-viewed-vessel-filter-${farmId}`);
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );

  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Viticulture", exact: true }).first().click();
  await page.waitForLoadState("networkidle");
  await expect(
    page.getByText("Tank & Vessel Register", { exact: true }),
  ).toBeVisible({ timeout: 20_000 });
}

test.describe("VesselRegisterTab — Never cleaned shortcut", () => {
  test("opens a new clean form and is absent when a clean exists", async ({ page }) => {
    const neverCleanedRef = `${RUN_TAG}-never`;
    const cleanedRef = `${RUN_TAG}-cleaned`;
    const vesselIds: number[] = [];

    try {
      const neverCleanedId = await createBarrel(neverCleanedRef);
      vesselIds.push(neverCleanedId);
      const cleanedId = await createBarrel(cleanedRef);
      vesselIds.push(cleanedId);
      await createClean(cleanedId);

      await openVesselRegister(page, [neverCleanedRef, cleanedRef]);

      const neverCleanedRow = page.locator("tbody tr", { hasText: neverCleanedRef });
      const cleanedRow = page.locator("tbody tr", { hasText: cleanedRef });
      await expect(neverCleanedRow).toBeVisible();
      await expect(cleanedRow).toBeVisible();
      await expect(
        cleanedRow.getByRole("button", { name: "Never cleaned", exact: true }),
      ).toHaveCount(0);

      await neverCleanedRow
        .getByRole("button", { name: "Never cleaned", exact: true })
        .click();

      const dialog = page
        .getByRole("dialog")
        .filter({ hasText: `Vessel — ${neverCleanedRef}` });
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByRole("button", { name: "Cleaning: 0 records", exact: true }),
      ).toHaveClass(/border-primary/);
      await expect(dialog.getByText("New clean record", { exact: true })).toBeVisible();
      await expect(
        dialog.getByRole("button", { name: "Save Clean", exact: true }),
      ).toBeVisible();
    } finally {
      for (const vesselId of vesselIds) {
        await deleteBarrel(vesselId).catch(() => {});
      }
    }
  });
});