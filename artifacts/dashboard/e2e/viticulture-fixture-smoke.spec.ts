import { expect, test } from "@playwright/test";
import { signInDashboard } from "./auth";
import { TENANT_SLUG, VITICULTURE_FARM_ID } from "./global-setup";

test("shared Viticulture fixture opens the Tank & Vessel Register", async ({
  page,
}) => {
  await signInDashboard(page);

  await page.evaluate(
    ([tenantSlug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "winery-vessels");
    },
    [TENANT_SLUG, VITICULTURE_FARM_ID] as [string, number],
  );

  await page.reload({ waitUntil: "networkidle" });
  await page
    .getByRole("link", { name: "Viticulture", exact: true })
    .first()
    .click();

  const moduleGate = page.getByRole("heading", {
    name: "Viticulture module not active",
    exact: true,
  });
  const vesselRegister = page.getByText("Tank & Vessel Register", {
    exact: true,
  });

  await expect
    .poll(
      async () => {
        if (await moduleGate.isVisible()) return "module-gate";
        if (await vesselRegister.isVisible()) return "vessel-register";
        return "loading";
      },
      {
        message:
          "Expected the shared Viticulture fixture to open Tank & Vessel Register; " +
          "the Viticulture module gate must not be shown",
        timeout: 20_000,
      },
    )
    .toBe("vessel-register");

  await expect(moduleGate).toHaveCount(0);
});