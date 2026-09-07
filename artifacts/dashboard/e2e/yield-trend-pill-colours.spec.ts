import { expect, test, type Locator, type Page } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BLOCKS = [
  { id: 211_901, blockName: "Colour check North", variety: "Chardonnay", areaHa: "1", isActive: true },
  { id: 211_902, blockName: "Colour check South", variety: "Pinot Noir", areaHa: "2", isActive: true },
];

const HARVESTS = [
  { id: 211_901_1, blockId: BLOCKS[0].id, vintageYear: 2024, harvestDate: "2024-09-15", yieldKg: "1800" },
  { id: 211_901_2, blockId: BLOCKS[0].id, vintageYear: 2025, harvestDate: "2025-09-15", yieldKg: "2400" },
  { id: 211_902_1, blockId: BLOCKS[1].id, vintageYear: 2024, harvestDate: "2024-09-16", yieldKg: "3200" },
  { id: 211_902_2, blockId: BLOCKS[1].id, vintageYear: 2025, harvestDate: "2025-09-16", yieldKg: "4000" },
];

function getTestUserEmail(): string {
  const emailFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_EMAIL_FILE!);
  if (!fs.existsSync(emailFile)) {
    throw new Error("global-setup did not run — e2e/.test-user-email is missing");
  }
  return fs.readFileSync(emailFile, "utf8").trim();
}

async function useVintageReport(page: Page): Promise<void> {
  await page.evaluate(
    ([tenantSlug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "vintage-report");
      localStorage.setItem(`vintage-season-report-year-filter-${farmId}`, "-1");
      localStorage.removeItem(`vintage-season-report-block-selection-filter-${farmId}`);
      localStorage.setItem(
        `vintage-season-report-trend-chart-group-by-variety-filter-${farmId}`,
        "false",
      );
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );
  // The Zustand farm store is hydrated when the app boots, so reload after
  // writing its persisted state before navigating to the module route.
  await page.reload({ waitUntil: "networkidle" });
  await page.goto("/dashboard/viticulture");
  await expect(page.getByRole("heading", { name: "Vintage Season Report" })).toBeVisible();
}

async function colours(locator: Locator): Promise<{ background: string; border: string }> {
  return locator.evaluate(element => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, border: style.borderTopColor };
  });
}

test("active block pills match yield lines and toggling only changes visibility", async ({ page }) => {
  const harvestWrites: string[] = [];

  await page.route(`**/api/farms/${FARM_ID}/vineyard-blocks`, route =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(BLOCKS) }),
  );
  await page.route(`**/api/farms/${FARM_ID}/vineyard-harvest`, async route => {
    if (route.request().method() !== "GET") {
      harvestWrites.push(route.request().method());
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(HARVESTS),
    });
  });
  for (const endpoint of ["vineyard-scouting", "vineyard-operations", "vineyard-spray-diary"]) {
    await page.route(`**/api/farms/${FARM_ID}/${endpoint}`, route =>
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
    );
  }

  await page.goto("/dashboard/");
  await clerk.signIn({ page, emailAddress: getTestUserEmail() });
  await page.waitForLoadState("networkidle");
  await useVintageReport(page);

  const chartCard = page
    .getByRole("heading", { name: "Per-Block Yield Trend — All Vintages" })
    .locator("xpath=../..");
  await expect(chartCard).toBeVisible();

  const pills = BLOCKS.map(block => chartCard.getByRole("button", { name: block.blockName }));
  const lines = chartCard.locator("path.recharts-line-curve");
  await expect(lines).toHaveCount(BLOCKS.length);

  for (let index = 0; index < BLOCKS.length; index += 1) {
    const pillColours = await colours(pills[index]);
    const lineColour = await lines.nth(index).evaluate(element => getComputedStyle(element).stroke);
    expect(pillColours.background).toBe(lineColour);
    expect(pillColours.border).toBe(lineColour);
  }

  const originalHarvests = JSON.stringify(HARVESTS);
  await pills[0].click();
  await expect(pills[0]).toHaveAttribute("title", `Show ${BLOCKS[0].blockName}`);
  await expect(lines).toHaveCount(1);
  const inactiveColours = await colours(pills[0]);
  expect(inactiveColours.background).not.toBe(await lines.first().evaluate(el => getComputedStyle(el).stroke));

  await pills[0].click();
  await expect(pills[0]).toHaveAttribute("title", `Hide ${BLOCKS[0].blockName}`);
  await expect(lines).toHaveCount(BLOCKS.length);
  const restoredColours = await colours(pills[0]);
  const restoredLineColour = await lines.first().evaluate(element => getComputedStyle(element).stroke);
  expect(restoredColours.background).toBe(restoredLineColour);
  expect(restoredColours.border).toBe(restoredLineColour);

  expect(harvestWrites, "pill toggles must not write harvest records").toEqual([]);
  expect(JSON.stringify(HARVESTS), "the fixture harvest data must remain unchanged").toBe(originalHarvests);
});