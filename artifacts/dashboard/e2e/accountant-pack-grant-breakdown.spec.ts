/**
 * E2E: Accountant's Pack keeps linked grant payment detail aligned with totals.
 *
 * Browser-owned fixtures make the two agri-environment income categories,
 * payment dates, projects, years, and enterprises deterministic. The check
 * covers the on-screen report and the generated print document.
 */

import { expect, test, type Page } from "@playwright/test";
import { signInDashboard } from "./auth";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const YEAR = new Date().getFullYear();
const PREVIOUS_YEAR = YEAR - 1;

const PROJECTS = [
  { id: 9_371_101, schemeName: "SFI Moorland Recovery" },
  { id: 9_371_102, schemeName: "FiPL Hedgerow Renewal" },
  { id: 9_371_103, schemeName: "Viticulture Habitat Trial" },
] as const;

const TRANSACTIONS = [
  {
    id: 9_371_201,
    transactionDate: `${YEAR}-03-14T12:00:00.000Z`,
    transactionType: "income",
    category: "Agri-Environment Scheme",
    description: "Current SFI milestone payment",
    amountPence: 125_050,
    vatAmountPence: 0,
    enterprise: "Arable",
    agriEnvProjectId: PROJECTS[0].id,
  },
  {
    id: 9_371_202,
    transactionDate: `${YEAR}-07-02T12:00:00.000Z`,
    transactionType: "income",
    category: "Grant / Subsidy",
    description: "Current FiPL milestone payment",
    amountPence: 75_025,
    vatAmountPence: 0,
    enterprise: "Arable",
    agriEnvProjectId: PROJECTS[1].id,
  },
  {
    id: 9_371_203,
    transactionDate: `${PREVIOUS_YEAR}-11-21T12:00:00.000Z`,
    transactionType: "income",
    category: "Agri-Environment Scheme",
    description: "Previous-year SFI payment",
    amountPence: 900_000,
    vatAmountPence: 0,
    enterprise: "Arable",
    agriEnvProjectId: PROJECTS[0].id,
  },
  {
    id: 9_371_204,
    transactionDate: `${YEAR}-08-19T12:00:00.000Z`,
    transactionType: "income",
    category: "Grant / Subsidy",
    description: "Other-enterprise habitat payment",
    amountPence: 800_000,
    vatAmountPence: 0,
    enterprise: "Viticulture",
    agriEnvProjectId: PROJECTS[2].id,
  },
] as const;

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("en-GB");

async function openAccountantPack(page: Page) {
  await page.route(`**/api/farms/${FARM_ID}`, route =>
    route.fulfill({
      json: {
        record: {
          id: FARM_ID,
          name: "Accountant Pack Fixture Farm",
          addressLine1: "1 Test Lane",
          addressTown: "Testford",
          addressCounty: "Kent",
          addressPostcode: "TE1 1ST",
        },
      },
    }),
  );
  await page.route(
    `**/api/farms/${FARM_ID}/financial-transactions`,
    route => route.fulfill({ json: { records: TRANSACTIONS } }),
  );
  await page.route(
    `**/api/farms/${FARM_ID}/livestock-purchases`,
    route => route.fulfill({ json: { records: [] } }),
  );
  await page.route(
    `**/api/farms/${FARM_ID}/agri-env-projects`,
    route => route.fulfill({ json: { projects: PROJECTS } }),
  );

  await signInDashboard(page);
  await page.evaluate(
    ([slug, farmId, year]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
      localStorage.setItem(`financial-active-tab-${farmId}`, "accountant-pack");
      localStorage.setItem(
        `financial-accountant-pack-year-filter-${farmId}`,
        String(year),
      );
      localStorage.setItem(
        `financial-transactions-enterprise-filter-${farmId}`,
        "all",
      );
    },
    [TENANT_SLUG, FARM_ID, YEAR] as const,
  );

  await page.goto("/dashboard/financial", { waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { name: "Accountant's Financial Pack" }),
  ).toBeVisible({ timeout: 20_000 });
}

function incomeCategoryRow(page: Page, category: string) {
  return page.locator("tbody > tr", {
    has: page.getByText(category, { exact: true }),
  });
}

test("year and enterprise filters keep both grant breakdowns aligned in screen and print", async ({
  page,
}) => {
  await openAccountantPack(page);

  const schemeRow = incomeCategoryRow(page, "Agri-Environment Scheme");
  const grantRow = incomeCategoryRow(page, "Grant / Subsidy");

  await expect(schemeRow).toContainText("£1,250.50");
  await expect(schemeRow).toContainText(formatDate(TRANSACTIONS[0].transactionDate));
  await expect(schemeRow).toContainText(PROJECTS[0].schemeName);
  await expect(schemeRow).not.toContainText("£9,000.00");

  await expect(grantRow).toContainText("£8,750.25");
  await expect(grantRow).toContainText(formatDate(TRANSACTIONS[1].transactionDate));
  await expect(grantRow).toContainText(formatDate(TRANSACTIONS[3].transactionDate));
  await expect(grantRow).toContainText(PROJECTS[1].schemeName);
  await expect(grantRow).toContainText(PROJECTS[2].schemeName);

  await page.getByRole("combobox").filter({ hasText: "All Enterprises" }).click();
  await page.getByRole("option", { name: "Arable", exact: true }).click();

  await expect(page.getByText("Arable only — livestock purchases excluded")).toBeVisible();
  await expect(schemeRow).toContainText("£1,250.50");
  await expect(grantRow).toContainText("£750.25");
  await expect(grantRow).toContainText(PROJECTS[1].schemeName);
  await expect(grantRow).not.toContainText(PROJECTS[2].schemeName);
  await expect(grantRow).not.toContainText("£8,000.00");

  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Generate & Print Pack" }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState("domcontentloaded");

  const printBody = popup.locator("body");
  await expect(printBody).toContainText(`Period: ${YEAR}`);
  await expect(printBody).toContainText("Enterprise: Arable");

  const printSchemeRow = popup.locator("tbody > tr", {
    has: popup.getByText("Agri-Environment Scheme", { exact: true }),
  });
  const printGrantRow = popup.locator("tbody > tr", {
    has: popup.getByText("Grant / Subsidy", { exact: true }),
  });

  await expect(printSchemeRow).toContainText("£1,250.50");
  await expect(printSchemeRow).toContainText(formatDate(TRANSACTIONS[0].transactionDate));
  await expect(printSchemeRow).toContainText(PROJECTS[0].schemeName);
  await expect(printSchemeRow).not.toContainText(formatDate(TRANSACTIONS[2].transactionDate));

  await expect(printGrantRow).toContainText("£750.25");
  await expect(printGrantRow).toContainText(formatDate(TRANSACTIONS[1].transactionDate));
  await expect(printGrantRow).toContainText(PROJECTS[1].schemeName);
  await expect(printGrantRow).not.toContainText(PROJECTS[2].schemeName);
  await expect(printGrantRow).not.toContainText(formatDate(TRANSACTIONS[3].transactionDate));

  await popup.close();
});