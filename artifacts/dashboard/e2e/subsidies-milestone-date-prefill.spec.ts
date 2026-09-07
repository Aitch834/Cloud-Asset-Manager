/**
 * E2E: Subsidies report — completion date is prefilled when a claim status is selected.
 *
 * A past due date should be reused, while a future or missing due date should
 * default to today. These assertions intentionally happen before Save so a
 * regression cannot be hidden by the mutation handler.
 */

import { expect, test } from "@playwright/test";
import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const REPORT_YEAR = new Date().getFullYear();
const TODAY = new Date();
const TODAY_ISO = TODAY.toISOString().slice(0, 10);
const PAST_DUE_DATE = new Date(TODAY.getTime() - 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);
const FUTURE_DUE_DATE = new Date(TODAY.getTime() + 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);
const RUN_TAG = `E2E-MILESTONE-DATE-${Date.now()}`;
const SCHEME_NAME = `${RUN_TAG} Agri-Environment`;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getTestUserId(): string {
  const stateFile = path.join(__dirname, ".test-user-id");
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — .test-user-id missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

function getTestUserEmail(): string {
  const stateFile = path.join(__dirname, ".test-user-email");
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — .test-user-email missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

test("prefills past due dates and falls back to today before Save", async ({ page }) => {
  const milestoneNames = [
    `${RUN_TAG} past due`,
    `${RUN_TAG} future due`,
    `${RUN_TAG} no due date`,
  ];

  await page.route(`**/api/farms/${FARM_ID}/reports/subsidies**`, async route => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        schemes: [],
        subsidyTransactions: [],
        agriEnvProjects: [{
          id: 1,
          farmId: FARM_ID,
          schemeName: SCHEME_NAME,
          agreementReference: RUN_TAG,
          startDate: `${REPORT_YEAR}-01-01`,
          endDate: `${REPORT_YEAR + 1}-12-31`,
          totalGrantValuePence: 3_000,
          status: "active",
        }],
        agriEnvMilestones: [
          { id: 1, projectId: 1, milestoneName: milestoneNames[0], dueDate: PAST_DUE_DATE, completionDate: null, claimAmountPence: 1_000, status: "pending" },
          { id: 2, projectId: 1, milestoneName: milestoneNames[1], dueDate: FUTURE_DUE_DATE, completionDate: null, claimAmountPence: 1_000, status: "pending" },
          { id: 3, projectId: 1, milestoneName: milestoneNames[2], dueDate: null, completionDate: null, claimAmountPence: 1_000, status: "pending" },
        ],
        year: REPORT_YEAR,
      }),
    });
  });

  await page.addInitScript(
    ([slug, farmId, year]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
      localStorage.setItem(`business-reports-active-tab-${farmId}`, "subsidies");
      localStorage.setItem(`business-reports-year-filter-${farmId}`, String(year));
    },
    [TENANT_SLUG, FARM_ID, REPORT_YEAR] as [string, number, number],
  );
  await setupClerkTestingToken({ page, userId: getTestUserId() });
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
  await clerk.signIn({ page, emailAddress: getTestUserEmail() });
  await page.goto("/dashboard/business-reports");
  await page.waitForLoadState("networkidle");

  await expect(
    page.getByRole("button", { name: "Subsidies", exact: true }),
  ).toBeVisible();
  const projectRow = page.locator("tr").filter({ hasText: SCHEME_NAME }).first();
  await expect(projectRow).toBeVisible({ timeout: 20_000 });
  await projectRow.click();

  const expectedDates = [PAST_DUE_DATE, TODAY_ISO, TODAY_ISO];
  for (const [index, milestoneName] of milestoneNames.entries()) {
    const milestoneRow = page
      .getByRole("cell", { name: milestoneName, exact: true })
      .locator("..");
    await expect(milestoneRow).toBeVisible();

    const statusSelect = milestoneRow.locator("select");
    await expect(statusSelect).toHaveValue("pending");
    await statusSelect.selectOption("submitted");

    const completionDate = milestoneRow.locator('input[type="date"]');
    await expect(completionDate).toBeVisible();
    await expect(completionDate).toHaveValue(expectedDates[index]);

    // Keep this test focused on the prefill and leave every fixture milestone
    // pending so no mutation is sent and no save-time warning is involved.
    await milestoneRow.getByRole("button", { name: "Cancel", exact: true }).click();
  }
});