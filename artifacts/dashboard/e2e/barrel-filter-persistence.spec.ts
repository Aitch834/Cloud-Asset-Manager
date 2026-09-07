import { signInDashboard } from "./auth";
/**
 * E2E: VesselRegisterTab — farm-scoped barrel alert filter persistence.
 *
 * This uses the stable Highfield Vineyard fixture rather than creating
 * temporary vessels. B-01 and B-02 are real oak barrels with no fills or
 * cleaning records, which gives the browser a populated alert state to carry
 * across a tab change.
 */

import { expect, test } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled

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

async function getVessels(): Promise<ApiRecord[]> {
  const response = await fetch(`${apiBase()}/api/farms/${FARM_ID}/winery-vessels`, {
    headers: {
      "x-dev-bypass": DEV_BYPASS,
      "x-tenant-slug": TENANT_SLUG,
    },
  });
  if (!response.ok) {
    throw new Error(
      `GET winery vessels → ${response.status}: ${await response.text()}`,
    );
  }
  const body = await response.json() as { records?: ApiRecord[] };
  return body.records ?? [];
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
    page.getByText("Tank & Vessel Register", { exact: true }),
  ).toBeVisible({ timeout: 20_000 });
}

async function returnToVesselRegister(
  page: import("@playwright/test").Page,
): Promise<void> {
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await expect(page.getByText("Active Blocks", { exact: true })).toBeVisible({
    timeout: 20_000,
  });
  await page
    .getByRole("button", { name: "Tank & Vessel Register", exact: true })
    .click();
  await expect(
    page.getByText("Tank & Vessel Register", { exact: true }),
  ).toBeVisible({ timeout: 20_000 });
}

test.describe("VesselRegisterTab — alert filter persistence", () => {
  test("restores a selected alert and persists clearing it for the same farm", async ({
    page,
  }) => {
    const vessels = await getVessels();
    const seededBarrels = vessels.filter(
      vessel => vessel.vessel_ref === "B-01" || vessel.vessel_ref === "B-02",
    );

    expect(seededBarrels).toHaveLength(2);
    expect(seededBarrels.every(vessel => vessel.vessel_type === "oak-barrel")).toBe(
      true,
    );
    expect(seededBarrels.every(vessel => Number(vessel.fill_count ?? 0) === 0)).toBe(
      true,
    );

    await openVesselRegister(page);

    const noFillsFilter = page.getByRole("button", {
      name: /No fills logged \d+/,
    });
    await expect(noFillsFilter).toBeVisible({ timeout: 20_000 });
    await noFillsFilter.click();

    const tableRows = page.locator("tbody tr");
    await expect(tableRows).toHaveCount(2);
    await expect(tableRows.filter({ hasText: "B-01" })).toBeVisible();
    await expect(tableRows.filter({ hasText: "B-02" })).toBeVisible();
    await expect(
      page.getByText(/Showing barrels .*flagged as no fills logged/),
    ).toBeVisible();

    await returnToVesselRegister(page);

    // The alert filter is restored from the farm-scoped localStorage key.
    await expect(noFillsFilter).toBeVisible();
    await expect(tableRows).toHaveCount(2);
    await expect(
      page.getByText(/Showing barrels .*flagged as no fills logged/),
    ).toBeVisible();

    // "Show all" must use the persisted setter, not only clear React state.
    await page.getByRole("button", { name: "Show all", exact: true }).click();
    await expect(
      page.evaluate(
        storageKey => localStorage.getItem(storageKey),
        `vessel-register-alert-flag-filter-${FARM_ID}`,
      ),
    ).resolves.toBe("");
    await expect(tableRows).toHaveCount(vessels.length);
    await expect(
      page.getByText(/Showing barrels .*flagged as no fills logged/),
    ).toHaveCount(0);

    await returnToVesselRegister(page);

    // Returning again proves that the cleared value, rather than the old
    // selection, is what was persisted for this farm.
    await expect(tableRows).toHaveCount(vessels.length);
    await expect(
      page.getByText(/Showing barrels .*flagged as no fills logged/),
    ).toHaveCount(0);
    await expect(tableRows.filter({ hasText: "B-01" })).toBeVisible();
    await expect(tableRows.filter({ hasText: "T-01" })).toBeVisible();
  });
});
