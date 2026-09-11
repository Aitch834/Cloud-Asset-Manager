import { expect, type Page } from "@playwright/test";
import { signInDashboard } from "./auth";

export const VESSEL_REGISTER_FARM_ID = 5;
export const VESSEL_REGISTER_TENANT_SLUG = "oakfield-farms";

interface OpenVesselRegisterOptions {
  preparePage?: (page: Page) => Promise<void>;
}

export async function openVesselRegister(
  page: Page,
  options: OpenVesselRegisterOptions = {},
): Promise<void> {
  await signInDashboard(page);

  await page.evaluate(
    ([slug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "winery-vessels");
    },
    [VESSEL_REGISTER_TENANT_SLUG, VESSEL_REGISTER_FARM_ID] as [string, number],
  );
  await options.preparePage?.(page);

  await page.reload();
  const viticultureLink = page.getByRole("link", {
    name: "Viticulture",
    exact: true,
  }).first();
  await expect(viticultureLink).toBeVisible({ timeout: 20_000 });
  await viticultureLink.click();
  await expect(
    page.getByText("Tank & Vessel Register", { exact: true }),
  ).toBeVisible({ timeout: 20_000 });
}