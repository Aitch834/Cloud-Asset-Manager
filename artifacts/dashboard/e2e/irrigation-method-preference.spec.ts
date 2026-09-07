/**
 * E2E: Applications and Irrigation Advisor share one per-farm method preference.
 *
 * This deliberately crosses the two tabs so a form-local storage key, a save
 * callback regression, or a stale dialog initializer cannot silently split the
 * preference contract.
 */

import { expect, test, type Page } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const METHOD_STORAGE_KEY = `irrigation-advisor-method-${FARM_ID}`;

function getTestUserId(): string {
  const stateFile = path.join(__dirname, ".test-user-id");
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — .test-user-id missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

async function openIrrigation(page: Page) {
  // The installed Clerk runtime accepts userId (as used by the existing
  // dashboard E2E suite), although its published parameter type omits it.
  // @ts-expect-error Clerk's runtime supports the test user selected by global setup.
  await setupClerkTestingToken({ page, userId: getTestUserId() });
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(
    ([slug, farmId, methodKey]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
      localStorage.setItem(methodKey, "Drip / trickle");
    },
    [TENANT_SLUG, FARM_ID, METHOD_STORAGE_KEY] as const,
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.goto("/dashboard/water-irrigation?tab=records");
  await expect(page.getByText("Irrigation Application Records", { exact: true })).toBeVisible({
    timeout: 20_000,
  });
}

function selectTriggerFor(page: Page, label: string) {
  return page.getByText(label, { exact: true }).locator("..").getByRole("combobox");
}

test("Applications reads the stored method and a successful save updates the Advisor", async ({ page }) => {
  let savedApplication: Record<string, unknown> | null = null;

  await page.route(`**/api/farms/${FARM_ID}/irrigation-records`, async route => {
    if (route.request().method() === "POST") {
      savedApplication = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ record: { id: 9001 } }) });
      return;
    }
    await route.continue();
  });

  await page.route(`**/api/farms/${FARM_ID}/irrigation-advisor?*`, async route => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        fields: [{ id: 42, name: "North Field", areaHectares: "8.5", soilType: "Medium loam" }],
        assignment: {
          id: 77,
          cropName: "Winter wheat",
          variety: "Skyfall",
          plantingDate: `${new Date().getFullYear() - 1}-10-10`,
          expectedHarvestDate: `${new Date().getFullYear()}-08-15`,
          year: new Date().getFullYear(),
        },
        dailyWeather: [],
        hasWeatherStation: false,
        forecastRainfall7dMm: 4,
        forecastDailyMm: null,
        year: new Date().getFullYear(),
      }),
    });
  });

  await openIrrigation(page);
  await page.getByRole("button", { name: "Log Application", exact: true }).click();

  const applicationsDialog = page.getByRole("dialog", { name: "Log Irrigation Application" });
  await expect(applicationsDialog).toBeVisible();
  await expect(selectTriggerFor(page, "Irrigation Method")).toContainText("Drip / trickle");

  await selectTriggerFor(page, "Irrigation Method").click();
  await page.getByRole("option", { name: "Pivot", exact: true }).click();
  await applicationsDialog.getByRole("button", { name: "Log Application", exact: true }).click();
  await expect(applicationsDialog).toBeHidden();

  expect(savedApplication).toMatchObject({ irrigationMethod: "Pivot" });
  await expect.poll(() => page.evaluate(key => localStorage.getItem(key), METHOD_STORAGE_KEY)).toBe("Pivot");

  await page.getByRole("button", { name: "Irrigation Advisor", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Irrigation Advisor", exact: true })).toBeVisible();

  await selectTriggerFor(page, "Field").click();
  await page.getByRole("option", { name: /North Field/ }).click();
  await page.getByRole("button", { name: "Log this application", exact: true }).first().click();

  const advisorDialog = page.getByRole("dialog", { name: "Log Irrigation Application" });
  await expect(advisorDialog).toBeVisible();
  await expect(selectTriggerFor(page, "Method")).toContainText("Pivot");
});