/**
 * E2E: Subsidies double-count warning visibility and live clearing.
 *
 * The warning is derived from the subsidies report query. This test seeds an
 * unlinked agri-environment income transaction alongside a paid milestone,
 * then resolves the conflict through the Subsidies tab without reloading.
 */

import { expect, test } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const CURRENT_YEAR = new Date().getFullYear();

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

async function devFetch(url: string, init: RequestInit = {}) {
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
  return response.json() as Promise<Record<string, unknown>>;
}

type SubsidiesReport = {
  agriEnvMilestones?: Array<{
    status?: string | null;
    completionDate?: string | null;
  }>;
};

/**
 * Use a year in the report selector that has no existing paid/submitted
 * milestone claims. That makes the post-resolution hidden-banner assertion
 * independent of data left by other tests or demo records.
 */
async function findYearWithoutClaims(): Promise<number> {
  for (let offset = 0; offset < 6; offset += 1) {
    const year = CURRENT_YEAR - offset;
    const report = (await devFetch(
      `${apiBase()}/api/farms/${FARM_ID}/reports/subsidies?year=${year}`,
    )) as SubsidiesReport;
    const hasClaim = (report.agriEnvMilestones ?? []).some(
      milestone =>
        (milestone.status === "submitted" || milestone.status === "paid") &&
        !!milestone.completionDate &&
        new Date(milestone.completionDate).getFullYear() === year,
    );
    if (!hasClaim) return year;
  }
  throw new Error("No report year without existing paid/submitted milestone claims was available");
}

async function createProject(year: number, runTag: string): Promise<number> {
  const { project } = await devFetch(`${apiBase()}/api/farms/${FARM_ID}/agri-env-projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      schemeName: `E2E double-count ${runTag}`,
      agreementReference: `E2E-${runTag}`,
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
      totalGrantValuePence: 100_000,
      status: "active",
    }),
  }) as { project: { id: number } };
  return project.id;
}

async function createMilestone(year: number, projectId: number, runTag: string): Promise<number> {
  const { milestone } = await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/agri-env-projects/${projectId}/milestones`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        milestoneName: `E2E paid claim ${runTag}`,
        dueDate: `${year}-06-01`,
        completionDate: `${year}-06-15`,
        claimAmountPence: 50_000,
        status: "paid",
      }),
    },
  ) as { milestone: { id: number } };
  return milestone.id;
}

async function createTransaction(year: number, runTag: string): Promise<number> {
  const { record } = await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/financial-transactions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionType: "income",
        category: "Agri-Environment Scheme",
        description: `E2E unlinked agri-env payment ${runTag}`,
        amountPence: 50_000,
        transactionDate: `${year}-06-20T12:00:00.000Z`,
        reference: `E2E-${runTag}`,
      }),
    },
  ) as { record: { id: number } };
  return record.id;
}

async function openSubsidiesTab(
  page: import("@playwright/test").Page,
  year: number,
) {
  await setupClerkTestingToken({ page, userId: getTestUserId() });
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");

  await page.evaluate(
    ([slug, farmId, reportYear]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
      localStorage.setItem(`business-reports-active-tab-${farmId}`, "subsidies");
      localStorage.setItem(`business-reports-year-filter-${farmId}`, String(reportYear));
    },
    [TENANT_SLUG, FARM_ID, year] as [string, number, number],
  );

  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Business Reports", exact: true }).first().click();
  await expect(page.getByRole("button", { name: "Subsidies", exact: true })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText("Active Schemes", { exact: true })).toBeVisible({
    timeout: 20_000,
  });
}

test("shows and clears the Subsidies double-count warning without a reload", async ({ page }) => {
  const year = await findYearWithoutClaims();
  const runTag = `${Date.now()}`;
  let projectId: number | null = null;
  let transactionId: number | null = null;

  try {
    projectId = await createProject(year, runTag);
    await createMilestone(year, projectId, runTag);
    transactionId = await createTransaction(year, runTag);

    await openSubsidiesTab(page, year);

    const warningHeading = page.getByText("Possible double-count detected", { exact: true });
    await expect(warningHeading).toBeVisible();
    await expect(
      page.getByText(
        `You have both an Agri-Environment Scheme financial transaction and agri-env milestone claims in ${year}.`,
        { exact: false },
      ),
    ).toBeVisible();

    const projectRow = page.locator("tr").filter({ hasText: `E2E double-count ${runTag}` }).first();
    await expect(projectRow).toBeVisible();
    await projectRow.click();

    const milestoneRow = page.locator("tr").filter({ hasText: `E2E paid claim ${runTag}` }).first();
    await expect(milestoneRow).toBeVisible();

    // From this point on the test must remain on the same document.
    let loadedAfterResolution = false;
    page.on("load", () => {
      loadedAfterResolution = true;
    });

    await milestoneRow.locator("select").selectOption("pending");
    await expect(page.getByText(/This will remove .* from the \d{4} P&L income total\./)).toBeVisible();
    await page.getByRole("button", { name: "Confirm", exact: true }).click();

    // The mutation invalidates report-subsidies; no manual reload is allowed.
    await expect(milestoneRow.locator("select")).toHaveValue("pending", { timeout: 15_000 });
    await expect(warningHeading).toHaveCount(0, { timeout: 15_000 });
    expect(loadedAfterResolution).toBe(false);
  } finally {
    if (transactionId != null) {
      await devFetch(
        `${apiBase()}/api/farms/${FARM_ID}/financial-transactions/${transactionId}`,
        { method: "DELETE" },
      ).catch(() => {});
    }
    if (projectId != null) {
      await devFetch(
        `${apiBase()}/api/farms/${FARM_ID}/agri-env-projects/${projectId}`,
        { method: "DELETE" },
      ).catch(() => {});
    }
  }
});