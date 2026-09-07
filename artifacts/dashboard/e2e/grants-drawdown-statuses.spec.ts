import { signInDashboard } from "./auth";
/**
 * E2E: Agri-environment drawdown excludes closed and unvalued projects.
 *
 * The card is farm-wide rather than filtered to the visible project list. The
 * intercepted fixture includes every project status, plus claims on excluded
 * projects, so the browser verifies all card values use one eligible set.
 */

import { expect, test } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const projects = [
  { id: 1, schemeName: "Active scheme", status: "active", totalGrantValuePence: 100_000 },
  { id: 2, schemeName: "Applied scheme", status: "applied", totalGrantValuePence: 200_000 },
  { id: 3, schemeName: "Pending scheme", status: "pending", totalGrantValuePence: 300_000 },
  { id: 4, schemeName: "Completed scheme", status: "completed", totalGrantValuePence: 900_000 },
  { id: 5, schemeName: "Suspended scheme", status: "suspended", totalGrantValuePence: 800_000 },
  { id: 6, schemeName: "Withdrawn scheme", status: "withdrawn", totalGrantValuePence: 700_000 },
  { id: 7, schemeName: "Unvalued active scheme", status: "active", totalGrantValuePence: null },
].map((project) => ({
  administeringBody: null,
  agreementReference: null,
  designatedLandscape: null,
  theme: null,
  startDate: null,
  endDate: null,
  notes: null,
  ...project,
}));

const milestones = [
  { id: 1, projectId: 1, status: "paid", claimAmountPence: 25_000 },
  { id: 2, projectId: 2, status: "paid", claimAmountPence: 50_000 },
  { id: 3, projectId: 3, status: "submitted", claimAmountPence: 40_000 },
  { id: 4, projectId: 4, status: "paid", claimAmountPence: 900_000 },
  { id: 5, projectId: 5, status: "submitted", claimAmountPence: 800_000 },
  { id: 6, projectId: 6, status: "paid", claimAmountPence: 700_000 },
  { id: 7, projectId: 7, status: "paid", claimAmountPence: 999_999 },
].map((milestone) => ({
  milestoneName: `Fixture milestone ${milestone.id}`,
  dueDate: null,
  completionDate: null,
  evidenceNotes: null,
  ...milestone,
}));

function getTestUserId(): string {
  const stateFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_ID_FILE!);
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — .test-user-id missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

async function openAgriEnvironmentTab(
  page: import("@playwright/test").Page,
): Promise<void> {
  await page.route(
    `**/api/farms/${FARM_ID}/agri-env-projects`,
    (route) => route.fulfill({ json: { projects } }),
  );
  await page.route(
    `**/api/farms/${FARM_ID}/agri-env-milestones`,
    (route) => route.fulfill({ json: { milestones } }),
  );

  await signInDashboard(page);
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
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
  await page.getByRole("button", {
    name: "Agri-environment Schemes",
    exact: true,
  }).click();
}

test("shows only valued active, applied, and pending projects in farm-wide drawdown", async ({
  page,
}) => {
  await openAgriEnvironmentTab(page);

  const cardHeading = page
    .locator(".ae-screen-only")
    .getByText(/Farm-wide Drawdown — \d+ active projects?/)
    .first();
  await expect(cardHeading).toHaveText("Farm-wide Drawdown — 3 active projects", {
    timeout: 20_000,
  });

  const card = cardHeading.locator("..");
  await expect(card).toContainText("13% drawn");
  await expect(card).toContainText("£750 of £6,000 claimed across 3 projects");
  await expect(card).toContainText("+ £400 submitted (awaiting payment)");
});
