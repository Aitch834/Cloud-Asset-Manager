import { signInDashboard } from "./auth";
/**
 * E2E: VesselRegisterTab — detail-tab count badges.
 *
 * The fixture is served entirely through read-only browser routes. This keeps
 * the check independent of shared vessel data and guarantees that a release
 * check cannot create or delete persistent winery records.
 */

import { expect, test, type Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled
const VESSEL_ID = 2226001;
const VESSEL_REF = "E2E-TAB-COUNTS-BARREL";

type ApiRecord = Record<string, unknown>;

const VESSEL: ApiRecord = {
  id: VESSEL_ID,
  vessel_ref: VESSEL_REF,
  vessel_type: "oak-barrel",
  capacity_litres: 225,
  material: "French oak",
  status: "active",
  is_full: true,
  current_contents: "E2E Test Wine",
  current_volume_litres: 225,
  fill_number: 2,
  cellar_zone: "E2E Cellar",
  cellar_position: "Rack 1",
  fill_count: 2,
  maintenance_count: 1,
  movement_count: 3,
  clean_count: 0,
};

const FILLS: ApiRecord[] = [
  { id: 2226011, fill_number: 1, wine_name: "Fixture First Fill", fill_date: "2026-01-10" },
  { id: 2226012, fill_number: 2, wine_name: "Fixture Second Fill", fill_date: "2026-02-10" },
];

const MAINTENANCE: ApiRecord[] = [
  {
    id: 2226021,
    maintenance_date: "2026-03-10",
    work_type: "Inspection",
    cooperage_name: "Fixture Cooperage",
  },
];

const MOVEMENTS: ApiRecord[] = [
  { id: 2226031, moved_date: "2026-01-01", from_zone: "Receiving", to_zone: "Cellar A" },
  { id: 2226032, moved_date: "2026-01-05", from_zone: "Cellar A", to_zone: "Cellar B" },
  { id: 2226033, moved_date: "2026-01-10", from_zone: "Cellar B", to_zone: "E2E Cellar" },
];

function readStateFile(name: string): string {
  const stateFile = path.join(__dirname, name);
  if (!fs.existsSync(stateFile)) {
    throw new Error(`global-setup did not run — e2e/${name} is missing`);
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

async function prepareReadOnlyFixture(page: Page): Promise<string[]> {
  const mutationRequests: string[] = [];

  page.on("request", request => {
    const url = new URL(request.url());
    if (
      url.pathname.includes(`/api/farms/${FARM_ID}/winery-vessels`)
      && request.method() !== "GET"
    ) {
      mutationRequests.push(`${request.method()} ${url.pathname}`);
    }
  });

  await page.route(`**/api/farms/${FARM_ID}/dashboard`, async route => {
    await route.fulfill({
      json: {
        activeSubscriptions: [{ moduleKey: "viticulture" }],
      },
    });
  });

  await page.route(`**/api/farms/${FARM_ID}/winery-vessels**`, async route => {
    if (route.request().method() !== "GET") {
      await route.fulfill({
        status: 405,
        contentType: "application/json",
        body: JSON.stringify({ error: "This regression fixture is read-only" }),
      });
      return;
    }

    const pathname = new URL(route.request().url()).pathname;
    if (pathname === `/api/farms/${FARM_ID}/winery-vessels`) {
      await route.fulfill({ json: { records: [VESSEL] } });
    } else if (pathname.endsWith(`/winery-vessels/${VESSEL_ID}/fills`)) {
      await route.fulfill({ json: { records: FILLS } });
    } else if (pathname.endsWith(`/winery-vessels/${VESSEL_ID}/maintenance`)) {
      await route.fulfill({ json: { records: MAINTENANCE } });
    } else if (pathname.endsWith(`/winery-vessels/${VESSEL_ID}/movements`)) {
      await route.fulfill({ json: { records: MOVEMENTS } });
    } else if (pathname.endsWith(`/winery-vessels/${VESSEL_ID}/cleans`)) {
      await route.fulfill({ json: { records: [] } });
    } else {
      await route.continue();
    }
  });

  await signInDashboard(page);

  await page.evaluate(
    ([tenantSlug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
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

  const vesselRow = page.locator("tbody tr", { hasText: VESSEL_REF });
  await expect(vesselRow).toBeVisible();
  await vesselRow.getByRole("button").first().click();

  const detailDialog = page.getByRole("dialog", {
    name: `Vessel — ${VESSEL_REF}`,
    exact: true,
  });
  await expect(detailDialog).toBeVisible();

  return mutationRequests;
}

test.describe("VesselRegisterTab — detail-tab count badges", () => {
  test("shows populated counts, hides zero badges, and keeps all tab labels accessible", async ({
    page,
  }) => {
    const mutationRequests = await prepareReadOnlyFixture(page);

    const detailDialog = page.getByRole("dialog", {
      name: `Vessel — ${VESSEL_REF}`,
      exact: true,
    });

    const tabs = [
      ["Fill History: 2 records", "2 fill history records"],
      ["Maintenance: 1 record", "1 maintenance record"],
      ["Location: 3 records", "3 location records"],
      ["Cleaning: 0 records", null],
    ] as const;

    for (const [accessibleName, badgeLabel] of tabs) {
      await expect(
        detailDialog.getByRole("button", { name: accessibleName, exact: true }),
      ).toBeVisible();
      if (badgeLabel) {
        await expect(detailDialog.getByLabel(badgeLabel, { exact: true })).toBeVisible();
      }
    }

    // Zero-count tabs remain announced to assistive technology but do not
    // render a misleading "0" badge.
    await expect(
      detailDialog.getByLabel("0 cleaning records", { exact: true }),
    ).toHaveCount(0);

    await detailDialog
      .getByRole("button", { name: "Fill History: 2 records", exact: true })
      .click();
    await expect(detailDialog.getByText("Fixture First Fill", { exact: true })).toBeVisible();

    await detailDialog
      .getByRole("button", { name: "Maintenance: 1 record", exact: true })
      .click();
    await expect(detailDialog.getByText("Fixture Cooperage", { exact: true })).toBeVisible();

    await detailDialog
      .getByRole("button", { name: "Location: 3 records", exact: true })
      .click();
    await expect(detailDialog.getByText("E2E Cellar", { exact: true })).toBeVisible();

    await detailDialog
      .getByRole("button", { name: "Cleaning: 0 records", exact: true })
      .click();
    await expect(
      detailDialog.getByText("No cleaning records logged.", { exact: true }),
    ).toBeVisible();
    await expect.poll(() => mutationRequests).toEqual([]);
  });
});