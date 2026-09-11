import { expect, test, type Page } from "@playwright/test";
import { signInDashboard } from "./auth";

/**
 * E2E: Vessel cleaning history — remember only the last successful,
 * non-blank operator.
 *
 * Browser routes keep this focused check from writing to the winery API while
 * still exercising the real VesselRegisterTab mutation success/error paths.
 */

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled
const VESSEL_ID = 2418001;
const VESSEL_REF = "E2E-CLEAN-OPERATOR-MEMORY";
const STORED_OPERATOR = "Existing Cellar Operator";
const NEW_OPERATOR = "Morgan Cellar";

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

async function openVesselCleaning(page: Page): Promise<Record<string, unknown>[]> {
  const postedCleans: Record<string, unknown>[] = [];

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

    if (pathname.endsWith(`/winery-vessels/${VESSEL_ID}/cleans`)) {
      if (request.method() === "POST") {
        const clean = request.postDataJSON() as Record<string, unknown>;
        if (String(clean.operatorName ?? "").includes("Rejected")) {
          await route.fulfill({ status: 500, json: { error: "Clean save rejected" } });
          return;
        }
        postedCleans.push(clean);
        await route.fulfill({
          status: 201,
          json: { record: { id: 2418010 + postedCleans.length, ...clean } },
        });
      } else {
        await route.fulfill({ json: { records: [] } });
      }
      return;
    }

    if (
      pathname.endsWith(`/winery-vessels/${VESSEL_ID}/fills`)
      || pathname.endsWith(`/winery-vessels/${VESSEL_ID}/maintenance`)
      || pathname.endsWith(`/winery-vessels/${VESSEL_ID}/movements`)
    ) {
      await route.fulfill({ json: { records: [] } });
      return;
    }

    await route.continue();
  });

  await signInDashboard(page);
  await page.evaluate(
    ([tenantSlug, farmId, operator]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "winery-vessels");
      localStorage.setItem("last_operator_name", operator);
    },
    [TENANT_SLUG, FARM_ID, STORED_OPERATOR] as [string, number, string],
  );

  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Viticulture", exact: true }).first().click();
  await expect(page.getByText("Tank & Vessel Register", { exact: true })).toBeVisible({
    timeout: 20_000,
  });

  const vesselRow = page.locator("tbody tr", { hasText: VESSEL_REF });
  await expect(vesselRow).toBeVisible();
  await vesselRow.getByRole("button").first().click();

  const vesselDialog = page.getByRole("dialog", {
    name: `Vessel — ${VESSEL_REF}`,
    exact: true,
  });
  await expect(vesselDialog).toBeVisible();
  await vesselDialog
    .getByRole("button", { name: "Cleaning: 0 records", exact: true })
    .click();

  return postedCleans;
}

test("clean-log operator memory changes only after a successful non-blank save", async ({
  page,
}) => {
  const postedCleans = await openVesselCleaning(page);
  const vesselDialog = page.getByRole("dialog", {
    name: `Vessel — ${VESSEL_REF}`,
    exact: true,
  });
  const operatorInput = vesselDialog
    .locator("label", { hasText: /^Operator$/ })
    .locator("..")
    .locator("input");

  await vesselDialog.getByRole("button", { name: "Log Clean", exact: true }).click();
  await expect(operatorInput).toHaveValue(STORED_OPERATOR);

  await operatorInput.fill(`  ${NEW_OPERATOR}  `);
  await vesselDialog.getByRole("button", { name: "Save Clean", exact: true }).click();
  await expect(page.getByText("Clean record added", { exact: true })).toBeVisible();
  await expect.poll(() => postedCleans).toHaveLength(1);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("last_operator_name")))
    .toBe(NEW_OPERATOR);

  await vesselDialog.getByRole("button", { name: "Log Clean", exact: true }).click();
  await expect(operatorInput).toHaveValue(NEW_OPERATOR);
  await operatorInput.fill("   ");
  await vesselDialog.getByRole("button", { name: "Save Clean", exact: true }).click();
  await expect.poll(() => postedCleans).toHaveLength(2);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("last_operator_name")))
    .toBe(NEW_OPERATOR);

  await vesselDialog.getByRole("button", { name: "Log Clean", exact: true }).click();
  await operatorInput.fill("Rejected Operator");
  await vesselDialog.getByRole("button", { name: "Save Clean", exact: true }).click();
  await expect(vesselDialog.getByText("Clean save rejected", { exact: true })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("last_operator_name")))
    .toBe(NEW_OPERATOR);
});