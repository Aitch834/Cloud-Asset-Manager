import { signInDashboard } from "./auth";
/**
 * E2E: Harvest PDF export honours year and print-block filters and preserves
 * every report field.
 */

import { expect, test, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import {
  getActiveViticultureFarm,
  type ActiveViticultureFarm,
} from "./viticulture-farm-fixture";

const BLOCKS = [
  { id: 924301, blockName: "E2E Harvest North Block", variety: "Chardonnay" },
  { id: 924302, blockName: "E2E Harvest South Block", variety: "Pinot Noir" },
];

const HARVESTS = [
  {
    id: 924311,
    blockId: 924301,
    vintageYear: 2026,
    harvestDate: "2026-09-15",
    harvestMethod: "Hand picked",
    yieldKg: 1234.5,
    yieldTonnesPerHa: 4.56,
    brix: 19.7,
    ph: 3.21,
    titratableAcidityGl: 8.4,
    potentialAlcohol: 11.6,
    grapeCondition: "Excellent",
    botrytisPresent: true,
    botrytisPercentage: 7,
    operatorName: "PDF Operator Alpha",
    notes: "PDF selected harvest notes",
  },
  {
    id: 924312,
    blockId: 924302,
    vintageYear: 2026,
    harvestDate: "2026-09-16",
    harvestMethod: "Machine",
    yieldKg: 2222,
    operatorName: "EXCLUDED SOUTH OPERATOR",
    notes: "EXCLUDED SOUTH NOTES",
  },
  {
    id: 924313,
    blockId: 924301,
    vintageYear: 2025,
    harvestDate: "2025-09-17",
    harvestMethod: "Hand picked",
    yieldKg: 3333,
    operatorName: "EXCLUDED 2025 OPERATOR",
    notes: "EXCLUDED 2025 NOTES",
  },
];

async function openHarvest(page: Page, farm: ActiveViticultureFarm): Promise<void> {
  await page.route(`**/api/farms/${farm.farmId}/vineyard-blocks`, async route => {
    if (route.request().method() !== "GET") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        records: BLOCKS.map(block => ({ ...block, farmId: farm.farmId })),
      }),
    });
  });
  await page.route(`**/api/farms/${farm.farmId}/vineyard-harvest`, async route => {
    if (route.request().method() !== "GET") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        records: HARVESTS.map(harvest => ({ ...harvest, farmId: farm.farmId })),
      }),
    });
  });
  await page.route(`**/api/farms/${farm.farmId}`, async route => {
    const pathname = new URL(route.request().url()).pathname;
    if (route.request().method() !== "GET" || pathname.endsWith("/dashboard")) {
      return route.continue();
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        record: {
          id: farm.farmId,
          name: "E2E Harvest Farm",
          address: "E2E Test Address",
          postcode: "E2E 1AA",
          sbiNumber: "123456789",
          fsaVineRegisterRef: "E2E-FSA-VINE",
        },
      }),
    });
  });

  await signInDashboard(page);
  await page.evaluate(
    ([tenantSlug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "harvest");
      for (const filter of ["year", "block", "search", "print-block"]) {
        localStorage.removeItem(`viticulture-harvest-${filter}-filter-${farmId}`);
      }
    },
    [farm.tenantSlug, farm.farmId] as [string, number],
  );

  if (!/\/dashboard\/select$/.test(page.url())) {
    await page.getByRole("button", { name: /Switch Farm/ }).first().click();
    await expect(page).toHaveURL(/\/dashboard\/select$/);
  }
  await page.getByText(farm.farmName, { exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard\/dashboard$/);
  await page.getByRole("link", { name: "Viticulture", exact: true }).first().click();
  await page.waitForLoadState("networkidle");
  await expect(page.getByText("Harvest & Vintage Records", { exact: true })).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByRole("button", { name: "Export PDF", exact: true })).toBeVisible();
}

async function selectOption(page: Page, triggerIndex: number, label: string): Promise<void> {
  await page.getByRole("combobox").nth(triggerIndex).click();
  await page.getByRole("option", { name: label, exact: true }).click();
}

test("Harvest PDF exports only the selected year and print block with every report field", async ({
  page,
}) => {
  const farm = await getActiveViticultureFarm();
  await openHarvest(page, farm);

  // Harvest selectors are block, year, then print block.
  await selectOption(page, 1, "2026");
  await selectOption(page, 2, "Print: E2E Harvest North Block");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PDF", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("vine-harvest.pdf");

  const filePath = await download.path();
  if (!filePath) throw new Error("Harvest PDF download did not provide a file path");
  const pdfText = execFileSync("pdftotext", ["-layout", filePath, "-"], {
    encoding: "utf8",
  });
  const compactText = pdfText.replace(/\s+/g, " ");

  for (const header of [
    "Harvest Date",
    "Block",
    "Method",
    "Yield (kg)",
    "Brix",
    "pH",
    "TA (g/L)",
    "Pot. Alc. %",
    "Condition",
    "Botrytis",
    "Operator",
    "Notes",
  ]) {
    expect(compactText, `PDF should include the ${header} report field`).toContain(header);
  }

  for (const value of [
    "15/09/2026",
    "E2E Harvest North Block",
    "Hand picked",
    "1234.5",
    "19.7",
    "3.21",
    "8.4",
    "11.6",
    "Excellent",
    "Yes (7%)",
    "PDF Operator Alpha",
    "PDF selected harvest notes",
  ]) {
    expect(compactText, `PDF should include selected value: ${value}`).toContain(value);
  }

  expect(compactText).not.toContain("EXCLUDED SOUTH OPERATOR");
  expect(compactText).not.toContain("EXCLUDED SOUTH NOTES");
  expect(compactText).not.toContain("EXCLUDED 2025 OPERATOR");
  expect(compactText).not.toContain("EXCLUDED 2025 NOTES");
});