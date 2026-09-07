import { signInDashboard } from "./auth";
/**
 * E2E: VesselRegisterTab — zone-chip context menu dismissal.
 *
 * The zone menu is intentionally transient: it should disappear after an
 * outside click, scrolling, or leaving the tab that owns it.
 */

import { expect, test } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const RUN_TAG = `E2E-1883-${Date.now()}`;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type ApiRecord = Record<string, unknown>;

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

function getTestUserId(): string {
  const stateFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_ID_FILE!);
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

async function createBarrel(vesselRef: string, cellarZone: string): Promise<number> {
  const body = await devFetch(`${apiBase()}/api/farms/${FARM_ID}/winery-vessels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      vesselRef,
      vesselType: "barrel",
      capacityLitres: 225,
      cellarZone,
      status: "active",
    }),
  });
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
  await signInDashboard(page);
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
      for (const filter of ["zone", "fill-tier", "alert-flag", "is-full"]) {
        localStorage.removeItem(`vessel-register-${filter}-filter-${farmId}`);
      }
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );

  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Viticulture", exact: true }).first().click();
  await expect(
    page.locator("p").filter({ hasText: "Tank & Vessel Register" }).first(),
  ).toBeVisible({ timeout: 20_000 });
}

test.describe("VesselRegisterTab — zone context menu dismissal", () => {
  test("opens on right-click and closes on outside click, scroll, and tab switch", async ({
    page,
  }) => {
    const zone = `${RUN_TAG}-zone`;
    const vesselRef = `${RUN_TAG}-barrel`;
    let vesselId: number | null = null;

    try {
      vesselId = await createBarrel(vesselRef, zone);
      await openVesselRegister(page);

      const zoneChip = page.getByRole("button", {
        name: new RegExp(`^${zone} `),
      });
      await expect(zoneChip).toBeVisible({ timeout: 20_000 });

      // Right-clicking a zone chip opens its transient menu.
      await zoneChip.click({ button: "right" });
      const zoneMenu = page.getByRole("menu", { name: "Zone options" });
      await expect(zoneMenu).toBeVisible();
      await expect(zoneMenu.getByText(zone, { exact: true })).toBeVisible();

      // A click elsewhere must dismiss it without selecting a menu action.
      await page
        .locator("p")
        .filter({ hasText: "Tank & Vessel Register" })
        .first()
        .click();
      await expect(zoneMenu).toHaveCount(0);

      // Scrolling must not leave a fixed-position menu behind at the old spot.
      await zoneChip.click({ button: "right" });
      await expect(zoneMenu).toBeVisible();
      await page.evaluate(() => window.dispatchEvent(new Event("scroll")));
      await expect(zoneMenu).toHaveCount(0);

      // The menu belongs to VesselRegisterTab, so switching tabs must remove it.
      await zoneChip.click({ button: "right" });
      await expect(zoneMenu).toBeVisible();
      await page.getByRole("button", {
        name: "Pruning & Canopy",
        exact: true,
      }).click();
      await expect(zoneMenu).toHaveCount(0);
      await expect(
        page.getByText("Pruning & Canopy", { exact: true }),
      ).toBeVisible();
    } finally {
      if (vesselId !== null) {
        await deleteBarrel(vesselId).catch(() => {});
      }
    }
  });
});
