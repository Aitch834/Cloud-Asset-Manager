/**
 * E2E: VesselRegisterTab — vessel delete confirmation.
 *
 * Clicking the trash action must only open the confirmation dialog. Cancelling
 * must preserve the record, and only one DELETE request may be issued even if
 * confirmation is clicked twice rapidly.
 */

import { expect, test } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const RUN_TAG = `E2E-vessel-delete-${Date.now()}`;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type ApiRecord = Record<string, unknown>;

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

function getTestUserEmail(): string {
  const emailFile = path.join(__dirname, ".test-user-email");
  if (!fs.existsSync(emailFile)) {
    throw new Error("global-setup did not run — .test-user-email missing");
  }
  return fs.readFileSync(emailFile, "utf8").trim();
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

async function deleteBarrel(vesselId: number): Promise<void> {
  await devFetch(`${apiBase()}/api/farms/${FARM_ID}/winery-vessels/${vesselId}`, {
    method: "DELETE",
  });
}

async function openVesselRegister(
  page: import("@playwright/test").Page,
): Promise<void> {
  await page.goto("/dashboard/");
  await clerk.signIn({ page, emailAddress: getTestUserEmail() });
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

test.describe("VesselRegisterTab — delete confirmation", () => {
  test("only sends one vessel DELETE when destructive confirmation is clicked twice rapidly", async ({
    page,
  }) => {
    const vesselRef = `${RUN_TAG}-barrel`;
    let vesselId: number | null = null;

    try {
      vesselId = await createBarrel(vesselRef);
      await openVesselRegister(page);

      const vesselRow = page.locator("tbody tr", { hasText: vesselRef });
      await expect(vesselRow).toBeVisible({ timeout: 20_000 });

      let deleteRequests = 0;
      page.on("request", request => {
        if (
          request.method() === "DELETE"
          && new URL(request.url()).pathname.endsWith(`/winery-vessels/${vesselId}`)
        ) {
          deleteRequests += 1;
        }
      });

      await vesselRow.getByRole("button", { name: "Delete vessel" }).click();

      const confirmDialog = page.getByRole("dialog", {
        name: "Delete Vessel",
      });
      await expect(confirmDialog).toBeVisible();
      expect(deleteRequests).toBe(0);

      await confirmDialog.getByRole("button", { name: "Cancel" }).click();
      await expect(confirmDialog).toHaveCount(0);
      await expect(vesselRow).toBeVisible();
      expect(deleteRequests).toBe(0);

      await vesselRow.getByRole("button", { name: "Delete vessel" }).click();

      const vesselDeletePattern = "**/api/farms/*/winery-vessels/*";
      await page.route(vesselDeletePattern, async route => {
        await new Promise(resolve => setTimeout(resolve, 250));
        await route.continue();
      });

      const confirmDialogAfterReopen = page.getByRole("dialog", {
        name: "Delete Vessel",
      });
      const confirmButton = confirmDialogAfterReopen.getByRole("button", {
        name: "Delete",
      });
      const deleteResponse = page.waitForResponse(response =>
        response.request().method() === "DELETE"
        && new URL(response.url()).pathname.endsWith(`/winery-vessels/${vesselId}`)
      );

      // Fire both DOM clicks in the same task. Removing disabled here models
      // the browser's second click arriving before React paints isPending;
      // ConfirmDialog's in-flight guard must still allow only one mutation.
      await confirmButton.evaluate(button => {
        button.removeAttribute("disabled");
        button.click();
        button.click();
      });
      await expect(confirmButton).toBeDisabled();
      expect((await deleteResponse).ok()).toBe(true);
      await expect(confirmDialogAfterReopen).toHaveCount(0);
      await expect(vesselRow).toHaveCount(0);
      expect(deleteRequests).toBe(1);
      await page.unroute(vesselDeletePattern);
    } finally {
      if (vesselId !== null) {
        await deleteBarrel(vesselId).catch(() => {});
      }
    }
  });
});