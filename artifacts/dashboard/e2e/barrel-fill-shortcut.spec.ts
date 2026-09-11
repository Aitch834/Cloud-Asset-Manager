import {
  openVesselRegister,
  VESSEL_REGISTER_FARM_ID as FARM_ID,
  VESSEL_REGISTER_TENANT_SLUG as TENANT_SLUG,
} from "./vessel-register";
/**
 * E2E: VesselRegisterTab — no-fills fill shortcut.
 *
 * The seeded Highfield Vineyard fixture includes B-01 as an oak barrel with
 * no fill history. Clicking its row badge should open the fill history with
 * the first-fill form ready to use.
 */

import { expect, test } from "@playwright/test";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";

type ApiRecord = Record<string, unknown>;

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
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

test.describe("VesselRegisterTab — fill shortcut", () => {
  test("opens Fill History with the add-fill form from a no-fills badge", async ({
    page,
  }) => {
    const vessels = await getVessels();
    const seededBarrel = vessels.find(vessel => vessel.vessel_ref === "B-01");

    expect(seededBarrel).toBeDefined();
    expect(seededBarrel?.vessel_type).toBe("oak-barrel");
    expect(Number(seededBarrel?.fill_count ?? 0)).toBe(0);

    await openVesselRegister(page);

    const vesselRow = page.locator("tbody tr", { hasText: "B-01" });
    await expect(vesselRow).toBeVisible({ timeout: 20_000 });

    await vesselRow.getByRole("button", { name: "No fills logged", exact: true }).click();

    const detailDialog = page.getByRole("dialog", {
      name: "Vessel — B-01",
      exact: true,
    });
    await expect(detailDialog).toBeVisible();

    const fillHistoryTab = detailDialog.getByRole("button", {
      name: /^Fill History: 0 records$/,
      exact: true,
    });
    await expect(fillHistoryTab).toBeVisible();
    await expect(fillHistoryTab).toHaveClass(/border-primary/);
    await expect(detailDialog.getByLabel("Fill Number *")).toBeVisible();
  });
});
