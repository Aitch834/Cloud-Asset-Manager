import { expect, test, type Locator, type Page } from "@playwright/test";
import { buildVarietyColorMap } from "../src/lib/variety-colors";
import { signInDashboard } from "./auth";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled

const BLOCKS = [
  { id: 247_101, blockName: "North A", variety: "Chardonnay", areaHa: "1", isActive: true },
  { id: 247_102, blockName: "North B", variety: "Chardonnay", areaHa: "1.5", isActive: true },
  { id: 247_103, blockName: "South", variety: "Pinot Noir", areaHa: "2", isActive: true },
];

const HARVESTS = BLOCKS.flatMap((block, blockIndex) =>
  [2024, 2025].map((vintageYear, yearIndex) => ({
    id: block.id * 10 + yearIndex,
    blockId: block.id,
    vintageYear,
    harvestDate: `${vintageYear}-09-${String(15 + blockIndex).padStart(2, "0")}`,
    yieldKg: String(1_800 + blockIndex * 600 + yearIndex * 300),
  })),
);

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
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.goto("/dashboard/viticulture");
  await expect(page.getByRole("heading", { name: "Vintage Season Report" })).toBeVisible();
}

async function renderedColour(locator: Locator): Promise<string> {
  return locator.evaluate(element => getComputedStyle(element).color);
}

test("same-variety blocks keep distinct colours in the vintage trend table", async ({ page }) => {
  await page.route(`**/api/farms/${FARM_ID}/vineyard-blocks`, route =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(BLOCKS) }),
  );
  await page.route(`**/api/farms/${FARM_ID}/vineyard-harvest`, route =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(HARVESTS) }),
  );
  for (const endpoint of ["vineyard-scouting", "vineyard-operations", "vineyard-spray-diary"]) {
    await page.route(`**/api/farms/${FARM_ID}/${endpoint}`, route =>
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
    );
  }

  await signInDashboard(page);
  await page.waitForLoadState("networkidle");
  await useVintageReport(page);

  const trendTable = page
    .getByRole("heading", { name: "Block × Vintage Yield (t/ha)" })
    .locator("xpath=../..")
    .getByRole("table");
  const blockLabel = (name: string) =>
    trendTable.getByRole("row").filter({ hasText: name }).getByText(name, { exact: true });

  const northAColour = await renderedColour(blockLabel("North A"));
  const northBColour = await renderedColour(blockLabel("North B"));
  expect(northAColour).not.toBe(northBColour);

  const baseColours = buildVarietyColorMap(BLOCKS.map(block => block.variety));
  const expectedPinotColour = await page.evaluate(hex => {
    const element = document.createElement("span");
    element.style.color = hex;
    document.body.appendChild(element);
    const colour = getComputedStyle(element).color;
    element.remove();
    return colour;
  }, baseColours["Pinot Noir"]);
  expect(await renderedColour(blockLabel("South"))).toBe(expectedPinotColour);
});