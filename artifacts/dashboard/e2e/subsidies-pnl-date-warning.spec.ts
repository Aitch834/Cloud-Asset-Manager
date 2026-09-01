/**
 * E2E: P&L removal warning after a submitted milestone is reverted.
 *
 * A milestone can be pending while the browser still has its previous,
 * in-year completion date in memory. If a grower then marks it submitted and
 * types an out-of-year date, saving must warn before the claim leaves the
 * report year's P&L.
 */

import { expect, test } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const REPORT_YEAR = new Date().getFullYear();
const IN_YEAR_DATE = `${REPORT_YEAR}-06-15`;
const OUT_OF_YEAR_DATE = `${REPORT_YEAR - 1}-06-15`;
const RUN_TAG = `E2E-PNL-DATE-${Date.now()}`;
const SCHEME_NAME = `${RUN_TAG} Agri-Environment`;
const MILESTONE_NAME = `${RUN_TAG} milestone`;
const CLAIM_AMOUNT_PENCE = 50_00;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    throw new Error(
      `${init.method ?? "GET"} ${url} → ${response.status}: ${await response.text()}`,
    );
  }
  return response.json() as Promise<Record<string, unknown>>;
}

async function createSubmittedMilestone() {
  const { project } = (await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/agri-env-projects`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schemeName: SCHEME_NAME,
        administeringBody: "E2E test setup",
        agreementReference: RUN_TAG,
        startDate: `${REPORT_YEAR}-01-01`,
        endDate: `${REPORT_YEAR}-12-31`,
        totalGrantValuePence: CLAIM_AMOUNT_PENCE,
        status: "active",
      }),
    },
  )) as { project: { id: number } };

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const { projects } = (await devFetch(
      `${apiBase()}/api/farms/${FARM_ID}/agri-env-projects`,
    )) as { projects: Array<{ id: number }> };
    if (projects.some(candidate => candidate.id === project.id)) break;
    if (attempt === 9) {
      throw new Error(`Project ${project.id} was not visible after creation`);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const { milestone } = (await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/agri-env-projects/${project.id}/milestones`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        milestoneName: MILESTONE_NAME,
        dueDate: IN_YEAR_DATE,
        completionDate: IN_YEAR_DATE,
        claimAmountPence: CLAIM_AMOUNT_PENCE,
        status: "submitted",
      }),
    },
  )) as { milestone: { id: number } };

  return { projectId: project.id, milestoneId: milestone.id };
}

test("warns before an out-of-year completion date removes submitted claim income", async ({
  page,
}) => {
  const { projectId, milestoneId } = await createSubmittedMilestone();

  try {
    // Model the post-revert state that motivated the regression fix: the
    // milestone is pending, but its previously submitted in-year date is
    // still present in the browser-visible record.
    await devFetch(
      `${apiBase()}/api/farms/${FARM_ID}/agri-env-projects/${projectId}/milestones/${milestoneId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending" }),
      },
    );

    await page.goto("/dashboard/");
    await clerk.signIn({ page, userId: getTestUserId() });
    await page.waitForLoadState("networkidle");
    await page.evaluate(
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
    await page.reload({ waitUntil: "networkidle" });
    await page.goto("/dashboard/business-reports");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("button", { name: "Subsidies", exact: true }),
    ).toBeVisible();
    await expect(page.getByText(SCHEME_NAME, { exact: true })).toBeVisible({
      timeout: 20_000,
    });

    await page.getByText(SCHEME_NAME, { exact: true }).click();
    const milestoneRow = page.locator("tr").filter({ hasText: MILESTONE_NAME });
    await expect(milestoneRow).toBeVisible();

    const statusSelect = milestoneRow.locator("select");
    await expect(statusSelect).toHaveValue("pending");
    await statusSelect.selectOption("submitted");

    const completionDate = milestoneRow.locator('input[type="date"]');
    await expect(completionDate).toBeVisible();
    await completionDate.fill(OUT_OF_YEAR_DATE);
    await milestoneRow.getByRole("button", { name: "Save", exact: true }).click();

    await expect(
      page.getByText(
        `This will remove £50.00 from the ${REPORT_YEAR} P&L income total.`,
        { exact: true },
      ),
    ).toBeVisible();
  } finally {
    await devFetch(
      `${apiBase()}/api/farms/${FARM_ID}/agri-env-projects/${projectId}`,
      { method: "DELETE" },
    ).catch(() => {});
  }
});