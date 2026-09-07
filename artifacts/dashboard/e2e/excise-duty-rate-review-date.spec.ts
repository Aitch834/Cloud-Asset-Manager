/**
 * E2E: Excise return view keeps the HMRC duty-rate review context visible.
 */

import { test, expect, type Page } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getTestUserId(): string {
  const stateFile = path.join(__dirname, ".test-user-id");
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — e2e/.test-user-id is missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

async function openExciseReturn(
  page: Page,
  farmId: number,
  ratesLastUpdated: string | null,
): Promise<void> {
  await setupClerkTestingToken({ page, userId: getTestUserId() });

  await page.route(`**/api/farms/${farmId}/winery-excise-returns`, async route => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        records: [{
          id: 921600,
          periodStart: "2026-04-01",
          periodEnd: "2026-06-30",
          status: "submitted",
          dutyRatePer100L: "356.25",
          totalLitresProduced: "1800",
          totalLitresRemovedUK: "700",
          totalDutyPayable: "2493.75",
          hmrcReturnRef: "E2E-HMRC-REVIEW",
        }],
      }),
    });
  });
  await page.route("**/api/hmrc-duty-rates", async route => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        lowAbvRatePerLpa: 9.27,
        highAbvRatePerLpa: 28.5,
        abvBandThresholdPct: 8.5,
        sprThresholdHl: 4500,
        ratesLastUpdated,
      }),
    });
  });

  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(([tenantSlug, selectedFarmId]) => {
    localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
    localStorage.setItem(
      "farmtrac-storage",
      JSON.stringify({
        state: { tenantSlug, farmId: selectedFarmId },
        version: 0,
      }),
    );
    localStorage.setItem(`viticulture-active-tab-${selectedFarmId}`, "excise");
  }, [TENANT_SLUG, farmId] as [string, number]);

  await page.reload({ waitUntil: "networkidle" });
  await page.goto("/dashboard/viticulture");
  await expect(page.getByText("Viticulture module not active", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Excise & Duty", exact: true })).toBeVisible({
    timeout: 15_000,
  });
  await page.getByRole("button", { name: "Excise & Duty", exact: true }).click();
  await expect(page.locator("table tbody tr")).toHaveCount(1);
  await page.locator("table tbody tr").getByRole("button").first().click();
}

for (const scenario of [
  {
    name: "shows the review date returned with the HMRC rates",
    ratesLastUpdated: "2026-07-22",
    expectedReview: "22 Jul 2026",
  },
  {
    name: "shows the documented fallback when HMRC has no configured review date",
    ratesLastUpdated: null,
    expectedReview: "HMRC August 2023",
  },
] as const) {
  test(scenario.name, async ({ page }) => {
    await openExciseReturn(page, FARM_ID, scenario.ratesLastUpdated);

    const dialog = page.getByRole("dialog", { name: /Excise Return/i });
    await expect(dialog).toBeVisible();

    const dutyRateLabel = dialog.getByText("Duty Rate (£ / 100 L)", { exact: true });
    const reviewedLabel = dialog.getByText("Duty Rates Reviewed", { exact: true });
    await expect(dutyRateLabel).toBeVisible();
    await expect(reviewedLabel).toBeVisible();
    await expect(dutyRateLabel.locator("xpath=..").locator("p").nth(1)).toHaveText("£356.25");
    await expect(reviewedLabel.locator("xpath=..").locator("p").nth(1)).toHaveText(
      scenario.expectedReview,
    );

    await expect.poll(async () => reviewedLabel.evaluate(element =>
      element.parentElement?.previousElementSibling?.textContent?.includes("Duty Rate (£ / 100 L)"),
    )).toBe(true);
  });
}