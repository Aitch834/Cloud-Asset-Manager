/**
 * E2E: Capital grants keep the selected scheme while composing filters.
 *
 * The screen scheme filter is independent from status tabs and summary-card
 * quick filters. This fixture intentionally has multiple scheme names so the
 * test proves the screen filter is a real selection rather than an empty-list
 * edge case.
 */

import { expect, test } from "@playwright/test";
import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;

function getTestUserId(): string {
  const stateFile = path.join(path.dirname(fileURLToPath(import.meta.url)), ".test-user-id");
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — .test-user-id missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

function getTestUserEmail(): string {
  const stateFile = path.join(path.dirname(fileURLToPath(import.meta.url)), ".test-user-email");
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — .test-user-email missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

function isoDateFromToday(daysFromToday: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}

const applicationDate = `${new Date().getFullYear()}-02-15`;
const grants = [
  {
    id: 1,
    schemeName: "FETF 2026",
    schemeType: "FETF",
    itemReferenceCode: "T-SYS-1",
    itemDescription: "Auto-steering / GPS guidance system",
    applicationReference: "E2E-FETF-2026",
    approvalAgreementReference: "E2E-AGREEMENT-1",
    applicationDate,
    approvalDate: applicationDate,
    purchaseDeadline: isoDateFromToday(10),
    claimDeadline: isoDateFromToday(20),
    grantAmountPence: 125_000,
    actualCostPence: 250_000,
    status: "approved",
    notes: null,
    documentPath: null,
    documentName: null,
  },
  {
    id: 2,
    schemeName: "FETF 2026",
    schemeType: "FETF",
    itemReferenceCode: "T-ENV-1",
    itemDescription: "Soil sampling and analysis technology",
    applicationReference: "E2E-FETF-APPLIED",
    approvalAgreementReference: null,
    applicationDate,
    approvalDate: null,
    purchaseDeadline: isoDateFromToday(15),
    claimDeadline: isoDateFromToday(25),
    grantAmountPence: 80_000,
    actualCostPence: 160_000,
    status: "applied",
    notes: null,
    documentPath: null,
    documentName: null,
  },
  {
    id: 3,
    schemeName: "CS Capital",
    schemeType: "CS",
    itemReferenceCode: "CS-CAP-1",
    itemDescription: "Capital item for environmental improvement",
    applicationReference: "E2E-CS-CAPITAL",
    approvalAgreementReference: null,
    applicationDate,
    approvalDate: null,
    purchaseDeadline: isoDateFromToday(5),
    claimDeadline: isoDateFromToday(30),
    grantAmountPence: 90_000,
    actualCostPence: 180_000,
    status: "draft",
    notes: null,
    documentPath: null,
    documentName: null,
  },
  {
    id: 4,
    schemeName: "CS Capital",
    schemeType: "CS",
    itemReferenceCode: "CS-CAP-2",
    itemDescription: "Completed capital grant item",
    applicationReference: "E2E-CS-CLAIMED",
    approvalAgreementReference: "E2E-AGREEMENT-2",
    applicationDate,
    approvalDate: applicationDate,
    purchaseDeadline: isoDateFromToday(-10),
    claimDeadline: isoDateFromToday(-2),
    grantAmountPence: 70_000,
    actualCostPence: 140_000,
    status: "claimed",
    notes: null,
    documentPath: null,
    documentName: null,
  },
] as const;

async function openCapitalGrants(page: import("@playwright/test").Page): Promise<void> {
  await page.route(`**/api/farms/${FARM_ID}/grants`, route =>
    route.fulfill({ json: { records: grants } }),
  );

  await setupClerkTestingToken({ page, userId: getTestUserId() });
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
  await clerk.signIn({ page, emailAddress: getTestUserEmail() });
  await page.evaluate(([slug, farmId]) => {
    localStorage.setItem("farmtrac_tenantSlug", slug);
    localStorage.setItem(
      "farmtrac-storage",
      JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
    );
  }, [TENANT_SLUG, FARM_ID] as [string, number]);
  await page.reload({ waitUntil: "networkidle" });

  await page.getByRole("link", { name: "Grants & Funding", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Grants & Funding", exact: true }))
    .toBeVisible({ timeout: 20_000 });
  await expect(page.locator(".grants-cap-screen tbody tr").first()).toBeVisible();
}

test("retains a capital-grant scheme across status and quick filters, then resets all filters", async ({
  page,
}) => {
  await openCapitalGrants(page);

  const schemeNames = [...new Set(grants.map(grant => grant.schemeName))];
  expect(schemeNames.length).toBeGreaterThan(1);
  const selectedScheme = schemeNames[0];
  const otherScheme = schemeNames.find(name => name !== selectedScheme);
  expect(otherScheme).toBeTruthy();

  const screen = page.locator(".grants-cap-screen");
  const schemeFilter = screen
    .getByRole("combobox", { name: "Filter by scheme name" })
    .last();
  await schemeFilter.click();
  await page.getByRole("option", { name: selectedScheme, exact: true }).click();
  await expect(schemeFilter).toHaveValue(selectedScheme);

  // Every status tab must compose with, rather than replace, the scheme filter.
  for (const statusLabel of [
    "All",
    "Draft",
    "Applied",
    "Approved",
    "Purchased",
    "Claimed",
    "Rejected",
    "Withdrawn",
  ]) {
    await page.getByRole("button", { name: new RegExp(`^${statusLabel} \\(`) }).click();
    await expect(schemeFilter).toHaveValue(selectedScheme);
  }

  // The three summary cards are quick filters and must preserve the same
  // scheme selection while they clear/rebuild the status filter.
  for (const title of [
    "Click to filter by approved, purchased & claimed",
    "Click to filter active applications",
    "Click to filter records with upcoming or overdue deadlines",
  ]) {
    await screen.locator(`[title="${title}"]`).click();
    await expect(schemeFilter).toHaveValue(selectedScheme);
  }

  // Set the remaining screen filters as well, so reset is verified as a
  // complete reset rather than only clearing the selected scheme.
  const yearFilter = screen.locator("select").filter({ hasText: "All years" });
  await yearFilter.selectOption(String(new Date().getFullYear()));
  await screen.getByRole("button", { name: /^Show archived/ }).click();
  await expect(screen.getByRole("button", { name: "Reset filters", exact: true })).toBeVisible();

  await screen.getByRole("button", { name: "Reset filters", exact: true }).click();

  await expect(schemeFilter).toHaveValue("");
  await expect(yearFilter).toHaveValue("all");
  await expect(screen.getByRole("button", { name: /^Show archived/ })).toBeVisible();
  await expect(screen.getByRole("button", { name: /^All \(/ })).toBeVisible();
  await expect(screen.locator("tbody tr").filter({ hasText: otherScheme! })).not.toHaveCount(0);
});