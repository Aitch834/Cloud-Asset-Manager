/**
 * E2E: Subsidies report — reverting a claimed milestone clears its date
 *
 * A submitted milestone with an in-year completion date contributes to the
 * report P&L. Reverting it to pending must clear both the status and the
 * completion date, including when the P&L warning confirmation is required.
 *
 * The fixture is created through the dev-bypass API and deleted with its
 * project in the finally block so the test does not modify existing farm data.
 */

import { expect, test } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const YEAR = new Date().getFullYear();
const COMPLETION_DATE = `${YEAR}-06-15`;
const PROJECT_NAME = `E2E milestone revert ${Date.now()}`;
const MILESTONE_NAME = `E2E submitted milestone ${Date.now()}`;
const CLAIM_AMOUNT_PENCE = 10_000;

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

function getTestUserId(): string {
  const stateFile = path.join(__dirname, ".test-user-id");
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — .test-user-id missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

async function devFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers as Record<string, string> | undefined),
      "x-dev-bypass": DEV_BYPASS,
      "x-tenant-slug": TENANT_SLUG,
    },
  });
  if (!response.ok) {
    throw new Error(`${init.method ?? "GET"} ${url} → ${response.status}: ${await response.text()}`);
  }
  return response.json() as Promise<T>;
}

async function createFixture() {
  const { project } = await devFetch<{ project: { id: number } }>(
    `${apiBase()}/api/farms/${FARM_ID}/agri-env-projects`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schemeName: PROJECT_NAME,
        agreementReference: `E2E-${Date.now()}`,
        startDate: `${YEAR}-01-01`,
        endDate: `${YEAR}-12-31`,
        totalGrantValuePence: 100_000,
        status: "active",
      }),
    },
  );

  // The API commits farm-scoped writes after the response finishes. Wait until
  // the project is visible before creating the child milestone.
  let projectVisible = false;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const data = await devFetch<{ projects: Array<{ id: number }> }>(
      `${apiBase()}/api/farms/${FARM_ID}/agri-env-projects`,
    );
    projectVisible = data.projects.some(candidate => candidate.id === project.id);
    if (projectVisible) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!projectVisible) {
    throw new Error(`Created project ${project.id} was not readable after waiting`);
  }

  const { milestone } = await devFetch<{ milestone: { id: number } }>(
    `${apiBase()}/api/farms/${FARM_ID}/agri-env-projects/${project.id}/milestones`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        milestoneName: MILESTONE_NAME,
        dueDate: COMPLETION_DATE,
        completionDate: COMPLETION_DATE,
        claimAmountPence: CLAIM_AMOUNT_PENCE,
        status: "submitted",
      }),
    },
  );

  return { projectId: project.id, milestoneId: milestone.id };
}

async function deleteFixture(projectId: number) {
  await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/agri-env-projects/${projectId}`,
    { method: "DELETE" },
  );
}

async function getMilestone(projectId: number, milestoneId: number) {
  const data = await devFetch<{
    milestones: Array<{ id: number; status: string; completionDate: string | null }>;
  }>(`${apiBase()}/api/farms/${FARM_ID}/agri-env-projects/${projectId}/milestones`);
  return data.milestones.find(milestone => milestone.id === milestoneId);
}

async function openSubsidiesReport(page: import("@playwright/test").Page) {
  const clerkTestingTokenParams = { page, userId: getTestUserId() } as Parameters<
    typeof setupClerkTestingToken
  >[0];
  await setupClerkTestingToken(clerkTestingTokenParams);
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(
    ([slug, farmId, tabKey, yearKey, year]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
      localStorage.setItem(tabKey, "subsidies");
      localStorage.setItem(yearKey, String(year));
    },
    [
      TENANT_SLUG,
      FARM_ID,
      `business-reports-active-tab-${FARM_ID}`,
      `business-reports-year-filter-${FARM_ID}`,
      YEAR,
    ] as [string, number, string, string, number],
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.goto("/dashboard/business-reports");
  await expect(page.getByRole("heading", { name: "Business Reports", exact: true })).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByRole("button", { name: "Subsidies", exact: true })).toBeVisible({
    timeout: 20_000,
  });
  await page.getByRole("button", { name: "Subsidies", exact: true }).click();
}

test("clears completion date when confirming a submitted milestone revert", async ({ page }) => {
  let projectId: number | null = null;

  try {
    const fixture = await createFixture();
    projectId = fixture.projectId;
    await openSubsidiesReport(page);

    const projectRow = page.locator("tr").filter({ hasText: PROJECT_NAME }).first();
    await expect(projectRow).toBeVisible({ timeout: 20_000 });
    await projectRow.click();

    const milestoneRow = page.locator("tr").filter({ hasText: MILESTONE_NAME }).last();
    await expect(milestoneRow).toBeVisible({ timeout: 20_000 });
    await expect(milestoneRow).toContainText("15/06/" + YEAR);

    await milestoneRow.getByRole("combobox").selectOption("pending");
    await expect(
      milestoneRow.getByText(`This will remove £100.00 from the ${YEAR} P&L income total.`),
    ).toBeVisible();

    await milestoneRow.getByRole("button", { name: "Confirm", exact: true }).click();

    await expect(milestoneRow.getByRole("combobox")).toHaveValue("pending");
    await expect(milestoneRow).toContainText("—");
    await expect(milestoneRow).not.toContainText("15/06/" + YEAR);

    await expect.poll(async () => {
      const milestone = await getMilestone(fixture.projectId, fixture.milestoneId);
      return milestone ? `${milestone.status}:${milestone.completionDate ?? "null"}` : "missing";
    }).toBe("pending:null");
  } finally {
    if (projectId !== null) {
      await deleteFixture(projectId).catch(() => {});
    }
  }
});