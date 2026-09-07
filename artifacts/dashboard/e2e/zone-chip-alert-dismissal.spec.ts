/**
 * E2E: VesselRegisterTab — zone-chip alert dismissal.
 *
 * The browser receives a deterministic, API-shaped vessel list so every
 * user-visible alert type is covered without relying on counts in the shared
 * development farm. Authentication and navigation still use the real Clerk
 * test identity and Viticulture-enabled Highfield Vineyard fixture.
 */

import { expect, test, type Page } from "@playwright/test";
import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const RUN_TAG = `E2E-2276-${Date.now()}`;
const ZONE_A = `${RUN_TAG}-zone-a`;
const ZONE_B = `${RUN_TAG}-zone-b`;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type ApiRecord = Record<string, unknown>;

const vessels: ApiRecord[] = [
  {
    id: 227601,
    vessel_ref: `${RUN_TAG}-cooperage`,
    vessel_type: "barrel",
    capacity_litres: 225,
    cellar_zone: ZONE_A,
    status: "active",
    fill_count: 0,
    fill_number: 0,
    maintenance_count: 1,
    maintenance_spend_pence: 100_000_000,
    clean_count: 0,
    is_full: false,
    empty_since: "2020-01-01",
  },
  {
    id: 227602,
    vessel_ref: `${RUN_TAG}-no-records`,
    vessel_type: "barrel",
    capacity_litres: 225,
    cellar_zone: ZONE_A,
    status: "active",
    fill_count: 0,
    fill_number: 0,
    maintenance_count: 0,
    maintenance_spend_pence: 0,
    clean_count: 0,
    is_full: false,
  },
  {
    id: 227603,
    vessel_ref: `${RUN_TAG}-approaching`,
    vessel_type: "barrel",
    capacity_litres: 225,
    cellar_zone: ZONE_A,
    status: "active",
    fill_count: 6,
    fill_number: 99,
    maintenance_count: 0,
    maintenance_spend_pence: 0,
    clean_count: 1,
    is_full: true,
  },
  {
    id: 227604,
    vessel_ref: `${RUN_TAG}-zone-b`,
    vessel_type: "barrel",
    capacity_litres: 225,
    cellar_zone: ZONE_B,
    status: "active",
    fill_count: 1,
    fill_number: 1,
    maintenance_count: 0,
    maintenance_spend_pence: 0,
    clean_count: 1,
    is_full: true,
  },
];

function readSetupFile(name: string): string {
  const stateFile = path.join(__dirname, name);
  if (!fs.existsSync(stateFile)) {
    throw new Error(
      `global-setup did not run — ${name} missing; check the Clerk setup output for quota or authentication blockers`,
    );
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

async function openVesselRegister(page: Page): Promise<void> {
  await setupClerkTestingToken({
    page,
    userId: readSetupFile(process.env.PLAYWRIGHT_E2E_USER_ID_FILE!),
  });

  await page.route("**/api/farms/5/winery-vessels*", async route => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    const response = await route.fetch();
    const body = await response.json() as ApiRecord;
    await route.fulfill({ response, json: { ...body, records: vessels } });
  });

  await page.goto("/dashboard/", { waitUntil: "domcontentloaded" });
  await clerk.signIn({
    page,
    emailAddress: readSetupFile(process.env.PLAYWRIGHT_E2E_USER_EMAIL_FILE!),
  });
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

  await page.goto("/dashboard/viticulture", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByText("Tank & Vessel Register", { exact: true }),
  ).toBeVisible({ timeout: 20_000 });
}

function zoneChip(page: Page, zone: string) {
  return page.getByRole("button", { name: new RegExp(`^${zone} `) });
}

test.describe("VesselRegisterTab — zone-chip alert dismissal", () => {
  test("dismisses every populated alert on zone drill-down and preserves no-alert multi-select", async ({
    page,
  }) => {
    await openVesselRegister(page);

    const alertChips = [
      page.getByRole("button", { name: /Never cleaned \d+/ }),
      page.getByRole("button", { name: /No fills — cooperage only \d+/ }),
      page.getByRole("button", { name: /No fills — no records \d+/ }),
      page.getByRole("button", { name: /\d+ approaching neutral/ }),
      page.getByRole("button", { name: /\d+ idle barrel/ }),
      page.getByRole("button", { name: /Retirement risk \d+/ }),
    ];

    for (const alertChip of alertChips) {
      await expect(alertChip).toBeVisible();
      await alertChip.click();
      await expect(alertChip).toHaveClass(/ring-2/);

      await zoneChip(page, ZONE_A).click();

      await expect(alertChip).not.toHaveClass(/ring-2/);
      await expect(zoneChip(page, ZONE_A)).toHaveClass(/ring-2/);
      await expect(zoneChip(page, ZONE_B)).not.toHaveClass(/ring-2/);
      await expect(page.locator("tbody tr")).not.toHaveCount(0);
      await expect(page.locator("tbody tr")).toHaveCount(
        vessels.filter(vessel => vessel.cellar_zone === ZONE_A).length,
      );
      await expect(
        page.locator("p", { hasText: `Showing barrels in ${ZONE_A}` }),
      ).toBeVisible();
      await expect(
        page.evaluate(
          storageKey => localStorage.getItem(storageKey),
          `vessel-register-alert-flag-filter-${FARM_ID}`,
        ),
      ).resolves.toBe("");

      // Reset the sole selected zone before exercising the next alert.
      await zoneChip(page, ZONE_A).click();
      await expect(zoneChip(page, ZONE_A)).not.toHaveClass(/ring-2/);
    }

    // With no alert active, zone chips retain their existing multi-select and
    // selected-chip toggle behavior.
    await zoneChip(page, ZONE_A).click();
    await zoneChip(page, ZONE_B).click();
    await expect(zoneChip(page, ZONE_A)).toHaveClass(/ring-2/);
    await expect(zoneChip(page, ZONE_B)).toHaveClass(/ring-2/);
    await expect(page.locator("tbody tr")).toHaveCount(vessels.length);

    await zoneChip(page, ZONE_A).click();
    await expect(zoneChip(page, ZONE_A)).not.toHaveClass(/ring-2/);
    await expect(zoneChip(page, ZONE_B)).toHaveClass(/ring-2/);
    await expect(page.locator("tbody tr")).toHaveCount(
      vessels.filter(vessel => vessel.cellar_zone === ZONE_B).length,
    );
  });
});