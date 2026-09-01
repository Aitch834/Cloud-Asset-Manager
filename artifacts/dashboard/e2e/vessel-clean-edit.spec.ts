/**
 * E2E: VesselRegisterTab — edit and cancel cleaning records.
 *
 * Each scenario seeds a barrel with two cleaning records through the
 * dev-bypass API, then exercises the cleaning history from the vessel detail
 * dialog. Keeping a second row in the fixture catches accidental replacement
 * of the whole history when one record is edited or cancelled.
 */

import { expect, test } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled
const RUN_TAG = `E2E-1867-${Date.now()}`;

const CLEAN_TYPE = "Chemical wash";

type ApiRecord = Record<string, unknown>;

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

function getTestUserId(): string {
  const stateFile = path.join(__dirname, ".test-user-id");
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — .test-user-id missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
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

function dateDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
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

async function createCleaning(
  vesselId: number,
  cleanDate: string,
  cleaningProduct: string,
): Promise<number> {
  const body = await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/winery-vessels/${vesselId}/cleans`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cleanDate,
        cleanType: CLEAN_TYPE,
        cleaningProduct,
        concentrationPct: 2.5,
        waterTempC: 60,
        contactTimeMin: 15,
        rinseCompleted: true,
        operatorName: "E2E Operator",
        notes: "Initial clean record",
      }),
    },
  );
  return Number((body.record as ApiRecord).id);
}

async function deleteBarrel(vesselId: number): Promise<void> {
  await devFetch(`${apiBase()}/api/farms/${FARM_ID}/winery-vessels/${vesselId}`, {
    method: "DELETE",
  });
}

async function openCleaningHistory(
  page: import("@playwright/test").Page,
  vesselRef: string,
): Promise<import("@playwright/test").Locator> {
  await setupClerkTestingToken({ page, userId: getTestUserId() });
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
      localStorage.setItem(
        `vessel-register-detail-tab-filter-${farmId}`,
        "cleaning",
      );
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

  const vesselRow = page.locator("tbody tr", { hasText: vesselRef });
  await expect(vesselRow).toBeVisible({ timeout: 20_000 });
  await vesselRow.locator("td").last().getByRole("button").first().click();

  const dialog = page
    .getByRole("dialog")
    .filter({ hasText: `Vessel — ${vesselRef}` });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: /^Cleaning:/ }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: /^Cleaning:/ }).click();
  await expect(dialog.getByText("Cleaning History", { exact: true })).toBeVisible();
  return dialog;
}

function cleaningRow(
  dialog: import("@playwright/test").Locator,
  cleaningProduct: string,
): import("@playwright/test").Locator {
  return dialog
    .getByText(cleaningProduct, { exact: true })
    .locator("..")
    .locator("..");
}

test.describe("VesselRegisterTab — cleaning record edits", () => {
  test("opens a clean row pre-filled, saves its change, and keeps the other row", async ({
    page,
  }) => {
    const vesselRef = `${RUN_TAG}-save`;
    const originalProduct = `${RUN_TAG}-original`;
    const otherProduct = `${RUN_TAG}-other`;
    const updatedProduct = `${RUN_TAG}-updated`;
    let vesselId: number | undefined;

    try {
      vesselId = await createBarrel(vesselRef);
      const targetDate = dateDaysAgo(10);
      await createCleaning(vesselId, targetDate, originalProduct);
      await createCleaning(vesselId, dateDaysAgo(20), otherProduct);

      const dialog = await openCleaningHistory(page, vesselRef);
      const targetRow = cleaningRow(dialog, originalProduct);
      await expect(targetRow).toBeVisible();
      await expect(cleaningRow(dialog, otherProduct)).toBeVisible();

      await targetRow.getByRole("button").first().click();
      const editForm = dialog
        .getByText("Edit clean record", { exact: true })
        .locator("..");
      await expect(editForm).toBeVisible();
      await expect(editForm.locator('input[type="date"]')).toHaveValue(targetDate);
      await expect(editForm.locator("input").nth(1)).toHaveValue(originalProduct);
      await expect(editForm.getByRole("combobox")).toHaveText(CLEAN_TYPE);
      await expect(editForm.locator("input").nth(2)).toHaveValue("2.5");
      await expect(editForm.locator("input").nth(3)).toHaveValue("60");
      await expect(editForm.locator("input").nth(4)).toHaveValue("15");
      await expect(editForm.locator("input").nth(5)).toHaveValue("E2E Operator");

      await editForm.locator("input").nth(1).fill(updatedProduct);
      await Promise.all([
        page.waitForResponse(response =>
          response.request().method() === "PUT" &&
          response.url().includes(`/winery-vessels/${vesselId}/cleans/`),
        ),
        editForm.getByRole("button", { name: "Save Changes", exact: true }).click(),
      ]);

      await expect(editForm).toBeHidden();
      await expect(cleaningRow(dialog, updatedProduct)).toBeVisible({
        timeout: 15_000,
      });
      await expect(dialog.getByText(originalProduct, { exact: true })).toHaveCount(0);
      await expect(cleaningRow(dialog, otherProduct)).toBeVisible();
    } finally {
      if (vesselId !== undefined) await deleteBarrel(vesselId).catch(() => {});
    }
  });

  test("cancels an edit without changing either cleaning row", async ({ page }) => {
    const vesselRef = `${RUN_TAG}-cancel`;
    const originalProduct = `${RUN_TAG}-cancel-original`;
    const otherProduct = `${RUN_TAG}-cancel-other`;
    const unsavedProduct = `${RUN_TAG}-cancel-unsaved`;
    let vesselId: number | undefined;

    try {
      vesselId = await createBarrel(vesselRef);
      await createCleaning(vesselId, dateDaysAgo(10), originalProduct);
      await createCleaning(vesselId, dateDaysAgo(20), otherProduct);

      const dialog = await openCleaningHistory(page, vesselRef);
      const targetRow = cleaningRow(dialog, originalProduct);
      await expect(targetRow).toBeVisible();
      await expect(cleaningRow(dialog, otherProduct)).toBeVisible();

      await targetRow.getByRole("button").first().click();
      const editForm = dialog
        .getByText("Edit clean record", { exact: true })
        .locator("..");
      await editForm.locator("input").nth(1).fill(unsavedProduct);
      await editForm.getByRole("button", { name: "Cancel", exact: true }).click();

      await expect(editForm).toBeHidden();
      await expect(cleaningRow(dialog, originalProduct)).toBeVisible();
      await expect(cleaningRow(dialog, otherProduct)).toBeVisible();
      await expect(dialog.getByText(unsavedProduct, { exact: true })).toHaveCount(0);
    } finally {
      if (vesselId !== undefined) await deleteBarrel(vesselId).catch(() => {});
    }
  });
});