import { signInDashboard } from "./auth";
/**
 * E2E: Barrel fill history — remember the last successful operator.
 *
 * Vessel and fill data are served through browser routes so this check never
 * writes to the live winery API. The POST response is still successful, which
 * exercises the same mutation success path used by a real fill save.
 */

import { expect, test, type Page } from "@playwright/test";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled
const VESSEL_ID = 2326001;
const VESSEL_REF = "E2E-LAST-OPERATOR-BARREL";
const OPERATOR_NAME = "Morgan Cellar";

const VESSEL = {
  id: VESSEL_ID,
  vessel_ref: VESSEL_REF,
  vessel_type: "oak-barrel",
  capacity_litres: 225,
  material: "French oak",
  status: "active",
  is_full: false,
  fill_count: 0,
  maintenance_count: 0,
  movement_count: 0,
  clean_count: 0,
};

async function prepareFixture(page: Page): Promise<Record<string, unknown>[]> {
  const postedFills: Record<string, unknown>[] = [];

  await page.route(`**/api/farms/${FARM_ID}/dashboard`, route =>
    route.fulfill({
      json: { activeSubscriptions: [{ moduleKey: "viticulture" }] },
    }),
  );

  await page.route(`**/api/farms/${FARM_ID}/winery-vessels**`, async route => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;

    if (pathname === `/api/farms/${FARM_ID}/winery-vessels`) {
      await route.fulfill({ json: { records: [VESSEL] } });
      return;
    }

    if (pathname.endsWith(`/winery-vessels/${VESSEL_ID}/fills`)) {
      if (request.method() === "POST") {
        postedFills.push(request.postDataJSON() as Record<string, unknown>);
        await route.fulfill({
          status: 201,
          json: { record: { id: 2326011, ...postedFills.at(-1) } },
        });
      } else {
        await route.fulfill({ json: { records: [] } });
      }
      return;
    }

    if (
      pathname.endsWith(`/winery-vessels/${VESSEL_ID}/maintenance`)
      || pathname.endsWith(`/winery-vessels/${VESSEL_ID}/movements`)
      || pathname.endsWith(`/winery-vessels/${VESSEL_ID}/cleans`)
    ) {
      await route.fulfill({ json: { records: [] } });
      return;
    }

    await route.continue();
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
      localStorage.removeItem("last_operator_name");
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );

  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Viticulture", exact: true }).first().click();
  await expect(page.getByText("Tank & Vessel Register", { exact: true })).toBeVisible({
    timeout: 20_000,
  });

  const vesselRow = page.locator("tbody tr", { hasText: VESSEL_REF });
  await expect(vesselRow).toBeVisible();
  await vesselRow.getByRole("button").first().click();

  return postedFills;
}

test("writes and reuses the operator from the last successful fill", async ({ page }) => {
  const postedFills = await prepareFixture(page);
  const vesselDialog = page.getByRole("dialog", {
    name: `Vessel — ${VESSEL_REF}`,
    exact: true,
  });
  await expect(vesselDialog).toBeVisible();

  await vesselDialog.getByRole("button", { name: "Log Fill", exact: true }).click();
  await vesselDialog.getByLabel("Operator", { exact: true }).fill(`  ${OPERATOR_NAME}  `);
  await vesselDialog.getByRole("button", { name: "Save", exact: true }).click();

  await expect(page.getByText("Fill record added", { exact: true })).toBeVisible();
  await expect.poll(() => postedFills).toHaveLength(1);
  expect(postedFills[0]?.operatorName).toBe(`  ${OPERATOR_NAME}  `);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("last_operator_name")))
    .toBe(OPERATOR_NAME);

  await vesselDialog.getByRole("button", { name: "Log Fill", exact: true }).click();
  await expect(vesselDialog.getByLabel("Operator", { exact: true })).toHaveValue(OPERATOR_NAME);
});