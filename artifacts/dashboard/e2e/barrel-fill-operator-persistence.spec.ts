import { signInDashboard } from "./auth";
/**
 * E2E: Barrel fill history — remember the last successful operator.
 *
 * Vessel and fill data are served through browser routes so this check never
 * writes to the live winery API. Successful PUT responses still exercise the
 * same mutation success path used by real fill edits.
 */

import { expect, test, type Page } from "@playwright/test";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled
const VESSEL_ID = 2326001;
const FILL_ID = 2326011;
const VESSEL_REF = "E2E-LAST-OPERATOR-BARREL";
const OPERATOR_NAME = "Morgan Cellar";
const PREVIOUS_OPERATOR_NAME = "Previous Cellar Operator";

const VESSEL = {
  id: VESSEL_ID,
  vessel_ref: VESSEL_REF,
  vessel_type: "oak-barrel",
  capacity_litres: 225,
  material: "French oak",
  status: "active",
  is_full: false,
  fill_count: 1,
  maintenance_count: 0,
  movement_count: 0,
  clean_count: 0,
};

const EXISTING_FILL = {
  id: FILL_ID,
  fill_number: 1,
  wine_name: "E2E Bacchus",
  vintage_year: 2025,
  fill_date: "2026-08-01",
  operator_name: "Original Fill Operator",
};

async function prepareFixture(page: Page): Promise<Record<string, unknown>[]> {
  const editedFills: Record<string, unknown>[] = [];

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

    if (pathname.endsWith(`/winery-vessels/${VESSEL_ID}/fills/${FILL_ID}`)) {
      if (request.method() === "PUT") {
        editedFills.push(request.postDataJSON() as Record<string, unknown>);
        await route.fulfill({
          json: { record: { ...EXISTING_FILL, ...editedFills.at(-1) } },
        });
        return;
      }
      throw new Error("Barrel operator test only expects PUT for the fill record");
    }

    if (pathname.endsWith(`/winery-vessels/${VESSEL_ID}/fills`)) {
      await route.fulfill({ json: { records: [EXISTING_FILL] } });
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
      localStorage.setItem("last_operator_name", PREVIOUS_OPERATOR_NAME);
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

  return editedFills;
}

test("edited fills remember non-blank operators and preserve them after blank edits", async ({ page }) => {
  const editedFills = await prepareFixture(page);
  const vesselDialog = page.getByRole("dialog", {
    name: `Vessel — ${VESSEL_REF}`,
    exact: true,
  });
  await expect(vesselDialog).toBeVisible();

  const fillCard = vesselDialog.locator("div.border.rounded-lg", { hasText: "E2E Bacchus" });
  await expect(fillCard).toBeVisible();
  await fillCard.getByRole("button").nth(1).click();
  await expect(vesselDialog.getByText("Edit fill record", { exact: true })).toBeVisible();
  await vesselDialog.getByLabel("Operator", { exact: true }).fill(`  ${OPERATOR_NAME}  `);
  await vesselDialog.getByRole("button", { name: "Save", exact: true }).click();

  await expect(page.getByText("Fill record updated", { exact: true })).toBeVisible();
  await expect.poll(() => editedFills).toHaveLength(1);
  expect(editedFills[0]?.operatorName).toBe(`  ${OPERATOR_NAME}  `);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("last_operator_name")))
    .toBe(OPERATOR_NAME);

  await fillCard.getByRole("button").nth(1).click();
  await vesselDialog.getByLabel("Operator", { exact: true }).fill("   ");
  await vesselDialog.getByRole("button", { name: "Save", exact: true }).click();

  await expect.poll(() => editedFills).toHaveLength(2);
  expect(editedFills[1]?.operatorName).toBe("   ");
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("last_operator_name")))
    .toBe(OPERATOR_NAME);
});
