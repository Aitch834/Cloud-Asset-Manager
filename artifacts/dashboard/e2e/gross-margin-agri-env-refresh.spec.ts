import { signInDashboard } from "./auth";
/**
 * E2E: Gross Margin refreshes after an Agri-Environment milestone claim.
 *
 * The Gross Margin and P&L tabs share a TanStack Query cache entry. This test
 * keeps that entry alive while navigating to Grants & Funding, completes an
 * Agri-Environment milestone, and then switches back into Gross Margin. The
 * report must refetch so an unlinked scheme transaction is shown with the
 * double-count warning and its "Link to project" action.
 */

import { expect, test } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const YEAR = new Date().getFullYear();
const RUN_TAG = `E2E-1837-${Date.now()}`;
const PROJECT_NAME = `${RUN_TAG} Agri-Environment Scheme`;
const MILESTONE_NAME = `${RUN_TAG} milestone`;
const TRANSACTION_DESCRIPTION = `${RUN_TAG} payment`;

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

function getTestUserId(): string {
  const stateFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_ID_FILE!);
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — .test-user-id missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

async function devFetch<T = Record<string, unknown>>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
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

async function createProject(): Promise<number> {
  const data = await devFetch<{ project: { id: number } }>(
    `${apiBase()}/api/farms/${FARM_ID}/agri-env-projects`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schemeName: PROJECT_NAME,
        administeringBody: "RPA (Rural Payments Agency)",
        startDate: `${YEAR}-01-01`,
        endDate: `${YEAR}-12-31`,
        totalGrantValuePence: 100000,
        status: "active",
      }),
    },
  );
  return data.project.id;
}

async function createMilestone(projectId: number): Promise<number> {
  const data = await devFetch<{ milestone: { id: number } }>(
    `${apiBase()}/api/farms/${FARM_ID}/agri-env-projects/${projectId}/milestones`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        milestoneName: MILESTONE_NAME,
        dueDate: `${YEAR}-06-01`,
        claimAmountPence: 25000,
        status: "pending",
      }),
    },
  );
  return data.milestone.id;
}

async function createTransaction(): Promise<number> {
  const data = await devFetch<{ record: { id: number } }>(
    `${apiBase()}/api/farms/${FARM_ID}/financial-transactions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionDate: `${YEAR}-06-15T12:00:00.000Z`,
        transactionType: "income",
        category: "Agri-Environment Scheme",
        description: TRANSACTION_DESCRIPTION,
        amountPence: 25000,
        currency: "GBP",
      }),
    },
  );
  return data.record.id;
}

async function deleteRecord(url: string) {
  await devFetch(url, { method: "DELETE" });
}

async function openBusinessReports(page: import("@playwright/test").Page) {
  await signInDashboard(page);
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");

  await page.evaluate(([slug, farmId]) => {
    localStorage.setItem("farmtrac_tenantSlug", slug);
    localStorage.setItem(
      "farmtrac-storage",
      JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
    );
    localStorage.setItem(`business-reports-active-tab-${farmId}`, "gross-margin");
  }, [TENANT_SLUG, FARM_ID] as [string, number]);

  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Business Reports", exact: true }).first().click();
  await expect(page.getByRole("button", { name: "Gross Margin", exact: true })).toBeVisible({
    timeout: 15_000,
  });
}

test("Gross Margin shows Link to project after a milestone is completed without a reload", async ({ page }) => {
  const projectId = await createProject();
  const milestoneId = await createMilestone(projectId);
  const transactionId = await createTransaction();

  try {
    await openBusinessReports(page);

    const transactionRow = page.locator("tr", { hasText: TRANSACTION_DESCRIPTION });
    await expect(transactionRow).toBeVisible({ timeout: 15_000 });
    await expect(transactionRow.getByRole("button", { name: "Link to project", exact: true })).toHaveCount(0);
    await expect(page.getByText("Possible double-count detected", { exact: true })).toHaveCount(0);

    // Navigate within the SPA so the report query remains in the shared cache.
    await page.getByRole("link", { name: "Grants & Funding", exact: true }).first().click();
    await expect(
      page.getByRole("button", { name: "Agri-environment Schemes", exact: true }),
    ).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: "Agri-environment Schemes", exact: true }).click();

    const project = page.getByText(PROJECT_NAME, { exact: true });
    await expect(project).toBeVisible({ timeout: 15_000 });
    await project.click();

    const milestone = page.getByText(MILESTONE_NAME, { exact: true });
    await expect(milestone).toBeVisible({ timeout: 10_000 });
    const milestoneRow = milestone.locator("..");
    await milestoneRow.getByRole("combobox").selectOption("completed");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText("Milestone updated", { exact: true })).toBeVisible({
      timeout: 10_000,
    });

    // Force the return path to exercise BusinessReportsPage.switchTab rather
    // than relying on the persisted Gross Margin tab on initial mount.
    await page.evaluate(
      ([farmId]) => localStorage.setItem(`business-reports-active-tab-${farmId}`, "pl"),
      [FARM_ID] as [number],
    );
    await page.getByRole("link", { name: "Business Reports", exact: true }).first().click();
    await expect(page.getByRole("button", { name: "P&L Statement", exact: true })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole("button", { name: "Gross Margin", exact: true }).click();

    const refreshedTransactionRow = page.locator("tr", { hasText: TRANSACTION_DESCRIPTION });
    await expect(
      page.getByText("Possible double-count detected", { exact: true }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      refreshedTransactionRow.getByRole("button", { name: "Link to project", exact: true }),
    ).toBeVisible({ timeout: 15_000 });
  } finally {
    await deleteRecord(
      `${apiBase()}/api/farms/${FARM_ID}/financial-transactions/${transactionId}`,
    ).catch(() => {});
    await deleteRecord(
      `${apiBase()}/api/farms/${FARM_ID}/agri-env-projects/${projectId}`,
    ).catch(() => {});
  }
});
