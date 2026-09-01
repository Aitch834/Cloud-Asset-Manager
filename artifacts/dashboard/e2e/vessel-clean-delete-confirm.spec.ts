/**
 * E2E: VesselCleanRow — cleaning-record delete confirmation.
 *
 * Clicking the trash action must only open the confirmation dialog. Cancelling
 * must preserve the record, and only the destructive confirmation may issue
 * the DELETE request.
 */

import { expect, test } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const RUN_TAG = `E2E-clean-delete-${Date.now()}`;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  const vesselId = Number((body.record as ApiRecord).id);

  // Farm-scoped requests commit after the response finishes. Wait until the
  // new vessel is visible before inserting its child cleaning record.
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const list = await devFetch(`${apiBase()}/api/farms/${FARM_ID}/winery-vessels`);
    const records = (list.records ?? []) as ApiRecord[];
    if (records.some(record => Number(record.id) === vesselId)) return vesselId;
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  throw new Error(`Created vessel ${vesselRef} was not readable after retries`);
}

async function createCleaning(vesselId: number): Promise<number> {
  const body = await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/winery-vessels/${vesselId}/cleans`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cleanDate: new Date().toISOString().slice(0, 10),
        cleanType: "rinse",
        cleaningProduct: RUN_TAG,
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

async function openVesselRegister(
  page: import("@playwright/test").Page,
): Promise<void> {
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

test.describe("VesselCleanRow — delete confirmation", () => {
  test("only deletes a cleaning record after destructive confirmation", async ({
    page,
  }) => {
    const vesselRef = `${RUN_TAG}-barrel`;
    let vesselId: number | null = null;

    try {
      vesselId = await createBarrel(vesselRef);
      await createCleaning(vesselId);
      await openVesselRegister(page);

      const vesselRow = page.locator("tbody tr", { hasText: vesselRef });
      await expect(vesselRow).toBeVisible({ timeout: 20_000 });
      await vesselRow.getByRole("button").first().click();

      const vesselDialog = page.getByRole("dialog", {
        name: `Vessel — ${vesselRef}`,
      });
      await vesselDialog
        .getByRole("button", { name: /^Cleaning: 1 record$/ })
        .click();
      await expect(vesselDialog.getByText(RUN_TAG, { exact: true })).toBeVisible();

      let deleteRequests = 0;
      page.on("request", request => {
        if (
          request.method() === "DELETE"
          && request.url().includes(`/winery-vessels/${vesselId}/cleans/`)
        ) {
          deleteRequests += 1;
        }
      });

      await vesselDialog
        .getByRole("button", { name: "Delete cleaning record" })
        .click();

      const confirmDialog = page.getByRole("dialog", {
        name: "Delete cleaning record",
      });
      await expect(confirmDialog).toBeVisible();
      expect(deleteRequests).toBe(0);

      await confirmDialog.getByRole("button", { name: "Cancel" }).click();
      await expect(confirmDialog).toHaveCount(0);
      await expect(vesselDialog.getByText(RUN_TAG, { exact: true })).toBeVisible();
      expect(deleteRequests).toBe(0);

      await vesselDialog
        .getByRole("button", { name: "Delete cleaning record" })
        .click();
      const deleteResponse = page.waitForResponse(response =>
        response.request().method() === "DELETE"
        && response.url().includes(`/winery-vessels/${vesselId}/cleans/`)
      );
      await page
        .getByRole("dialog", { name: "Delete cleaning record" })
        .getByRole("button", { name: "Delete" })
        .click();

      expect((await deleteResponse).ok()).toBe(true);
      await expect(vesselDialog.getByText(RUN_TAG, { exact: true })).toHaveCount(0);
      expect(deleteRequests).toBe(1);
    } finally {
      if (vesselId !== null) {
        await deleteBarrel(vesselId).catch(() => {});
      }
    }
  });
});