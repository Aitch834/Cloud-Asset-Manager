import { signInDashboard } from "./auth";
/**
 * E2E: Viticulture print reports — pagination guards
 *
 * Opens each viticulture report from its real dashboard entry point and checks
 * the generated print document, rather than only checking the source template.
 *
 * The report rows for Organic Wine and Excise are supplied as browser fixtures
 * so this check stays read-only and does not depend on shared report history.
 */

import { test, expect, type Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getActiveViticultureFarm,
  type ActiveViticultureFarm,
} from "./viticulture-farm-fixture";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type PrintPopup = Page;

function getTestUserId(): string {
  const stateFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_ID_FILE!);
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — e2e/.test-user-id is missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

function reportApiUrl(farmId: number, report: string): string {
  return `**/api/farms/${farmId}/${report}`;
}

async function prepareDashboard(
  page: Page,
  farm: ActiveViticultureFarm,
): Promise<void> {
  await signInDashboard(page);

  // Keep the generated rows deterministic and avoid changing shared farm data.
  await page.route(
    reportApiUrl(farm.farmId, "organic-viticulture/wine-production"),
    async route => {
      if (route.request().method() !== "GET") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          records: [
            {
              id: 910002,
              vintageYear: 2026,
              wineColour: "White",
              volumeLitres: "1200",
              certifiedOrganic: 1,
              certifierRef: "E2E-ORGANIC",
              additiveName: "Sulphites",
              additiveType: "Sulphites / SO₂",
              quantityUsed: "1.2",
              quantityUnit: "kg",
              actualSO2MgL: "95",
              maxSO2MgL: "150",
              so2Compliant: 1,
            },
          ],
        }),
      });
    },
  );

  await page.route(
    reportApiUrl(farm.farmId, "winery-excise-returns"),
    async route => {
      if (route.request().method() !== "GET") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          records: [
            {
              id: 910003,
              periodStart: "2026-04-01",
              periodEnd: "2026-06-30",
              status: "draft",
              totalLitresProduced: "1800",
              totalLitresRemovedUK: "700",
              totalLitresDomesticConsumption: "100",
              totalLitresTastings: "25",
              totalLitresExported: "500",
              openingStockL: "2000",
              closingStockL: "2475",
              nominalAbvPct: "12.5",
              totalDutyPayable: "250",
              hmrcReturnRef: "E2E-EXCISE",
            },
          ],
        }),
      });
    },
  );

  await page.route(
    reportApiUrl(farm.farmId, "vineyard-harvest"),
    async route => {
      if (route.request().method() !== "GET") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          records: [
            {
              id: 910004,
              blockId: 1,
              vintageYear: new Date().getFullYear(),
              harvestDate: `${new Date().getFullYear()}-09-01`,
              yieldKg: "1250",
              harvestMethod: "Hand",
            },
          ],
        }),
      });
    },
  );

  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(
    ([tenantSlug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
      localStorage.removeItem(`viticulture-active-tab-${farmId}`);
      localStorage.removeItem(`viticulture-wine-production-vintage-filter-${farmId}`);
    },
    [farm.tenantSlug, farm.farmId] as [string, number],
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.goto("/dashboard/viticulture");
  await page.waitForLoadState("networkidle");
  await expect(
    page.getByRole("button", { name: "Vine Register", exact: true }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Viticulture", exact: true })).toBeVisible();
  await expect(page.getByText("Viticulture module not active", { exact: true })).toHaveCount(0);
}

async function openPrintPopup(
  page: Page,
  click: () => Promise<void>,
  expectRegistrationWarning = false,
): Promise<PrintPopup> {
  const popupPromise = page.waitForEvent("popup");
  await click();

  // Print entry points may first show the existing registration-reference
  // warning. Continue through it so the test verifies the generated document.
  const warning = page.getByRole("dialog", {
    name: "Registration refs incomplete",
    exact: true,
  });
  if (expectRegistrationWarning) {
    await expect(warning).toBeVisible();
  }
  if (await warning.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await warning.getByRole("button", { name: "Print anyway", exact: true }).click();
  }

  const popup = await popupPromise;
  await expect.poll(
    async () => popup.locator("style").count(),
    { timeout: 5_000, message: "Print popup did not contain a generated stylesheet" },
  ).toBeGreaterThan(0);
  return popup;
}

async function expectPaginationGuards(
  popup: PrintPopup,
  reportName: string,
): Promise<void> {
  const stylesheet = (await popup.locator("style").allTextContents()).join("\n");

  expect(
    stylesheet,
    `${reportName}: each table row must stay together when printed`,
  ).toMatch(/tr\s*\{[^}]*break-inside:\s*avoid/i);
  expect(
    stylesheet,
    `${reportName}: legacy browsers must also avoid splitting table rows`,
  ).toMatch(/tr\s*\{[^}]*page-break-inside:\s*avoid/i);
  expect(
    stylesheet,
    `${reportName}: section headings must stay with their content`,
  ).toMatch(/h2\s*\{[^}]*page-break-after:\s*avoid/i);
  expect(
    stylesheet,
    `${reportName}: modern browsers must also keep headings with content`,
  ).toMatch(/h2\s*\{[^}]*break-after:\s*avoid/i);
}

test("all viticulture print reports preserve pagination guards", async ({ page }) => {
  const farm = await getActiveViticultureFarm();
  await prepareDashboard(page, farm);

  // ── RPA Reference ───────────────────────────────────────────────────────
  await page.getByRole("button", { name: "Vine Register", exact: true }).click();
  const rpaPopup = await openPrintPopup(
    page,
    () => page.getByRole("button", { name: "Print RPA Reference", exact: true }).click(),
  );
  await expect(rpaPopup).toHaveTitle(/RPA Rural Payments/i);
  await expectPaginationGuards(rpaPopup, "RPA Reference");
  await rpaPopup.close();

  // ── Organic Wine Production Register ────────────────────────────────────
  await page.getByRole("button", { name: "Wine Production", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Print Register", exact: true }),
  ).toBeVisible();
  const organicPopup = await openPrintPopup(
    page,
    () => page.getByRole("button", { name: "Print Register", exact: true }).click(),
    true,
  );
  await expect(organicPopup).toHaveTitle(/Organic Wine Production Register/i);
  await expectPaginationGuards(organicPopup, "Organic Wine Production Register");
  await organicPopup.close();

  // ── Excise Return ───────────────────────────────────────────────────────
  await page.getByRole("button", { name: "Excise & Duty", exact: true }).click();
  await expect(page.locator("table tbody tr")).toHaveCount(1);
  await page.locator("table tbody tr").getByRole("button").first().click();
  const returnDialog = page.getByRole("dialog", {
    name: /Excise Return/i,
  });
  await expect(returnDialog).toBeVisible();
  const excisePopup = await openPrintPopup(
    page,
    () => returnDialog.getByRole("button", { name: "Print Return", exact: true }).click(),
    true,
  );
  await expect(excisePopup).toHaveTitle(/HMRC Alcohol Duty Return/i);
  await expectPaginationGuards(excisePopup, "Excise Return");
  await excisePopup.close();

  // ── Harvest ──────────────────────────────────────────────────────────────
  await page.getByRole("button", { name: "Harvest", exact: true }).click();
  await expect(page.getByRole("button", { name: "Print", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Export PDF", exact: true })).toBeVisible();
});
