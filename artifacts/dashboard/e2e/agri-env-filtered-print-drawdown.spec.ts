/**
 * E2E: filtered agri-environment print reports retain farm-wide drawdown.
 *
 * Seed two active schemes with different claim states, filter the print report
 * to one scheme, and inspect the real print popup. The drawdown card must still
 * describe both active schemes while the project detail section contains only
 * the selected scheme.
 */

import { expect, test } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const RUN_TAG = `E2E filtered print ${Date.now()}`;
const FIRST_SCHEME = `${RUN_TAG} SFI`;
const SECOND_SCHEME = `${RUN_TAG} FiPL`;
const FIRST_MILESTONE = `${RUN_TAG} paid claim`;
const SECOND_MILESTONE = `${RUN_TAG} submitted claim`;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

function getTestUserEmail(): string {
  const emailFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_EMAIL_FILE!);
  if (!fs.existsSync(emailFile)) {
    throw new Error("global-setup did not run — .test-user-email missing");
  }
  return fs.readFileSync(emailFile, "utf8").trim();
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

async function createProject(
  schemeName: string,
  totalGrantValuePence: number,
): Promise<number> {
  const { project } = await devFetch<{ project: { id: number } }>(
    `${apiBase()}/api/farms/${FARM_ID}/agri-env-projects`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schemeName,
        administeringBody: "RPA (Rural Payments Agency)",
        totalGrantValuePence,
        status: "active",
      }),
    },
  );
  return project.id;
}

async function waitForProject(projectId: number): Promise<void> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const { projects } = await devFetch<{
      projects: Array<{ id: number }>;
    }>(`${apiBase()}/api/farms/${FARM_ID}/agri-env-projects`);
    if (projects.some(project => project.id === projectId)) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Created project ${projectId} was not readable after waiting`);
}

async function createMilestone(
  projectId: number,
  milestoneName: string,
  claimAmountPence: number,
  status: "paid" | "submitted",
): Promise<void> {
  await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/agri-env-projects/${projectId}/milestones`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        milestoneName,
        claimAmountPence,
        status,
      }),
    },
  );
}

type ProjectSnapshot = {
  id: number;
  status: string;
  totalGrantValuePence: number | null;
};

type MilestoneSnapshot = {
  projectId: number;
  milestoneName: string;
  claimAmountPence: number | null;
  status: string;
};

async function waitForSeededSnapshot(
  projectIds: number[],
): Promise<{ projects: ProjectSnapshot[]; milestones: MilestoneSnapshot[] }> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const [{ projects }, { milestones }] = await Promise.all([
      devFetch<{ projects: ProjectSnapshot[] }>(
        `${apiBase()}/api/farms/${FARM_ID}/agri-env-projects`,
      ),
      devFetch<{ milestones: MilestoneSnapshot[] }>(
        `${apiBase()}/api/farms/${FARM_ID}/agri-env-milestones`,
      ),
    ]);
    const projectsVisible = projectIds.every(projectId =>
      projects.some(project => project.id === projectId),
    );
    const milestonesVisible = [FIRST_MILESTONE, SECOND_MILESTONE].every(name =>
      milestones.some(milestone => milestone.milestoneName === name),
    );
    if (projectsVisible && milestonesVisible) return { projects, milestones };
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Seeded agri-environment data was not readable after waiting");
}

async function deleteProject(projectId: number): Promise<void> {
  await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/agri-env-projects/${projectId}`,
    { method: "DELETE" },
  );
}

async function openAgriEnvironmentTab(
  page: import("@playwright/test").Page,
): Promise<void> {
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
  await clerk.signIn({ page, emailAddress: getTestUserEmail() });

  await page.evaluate(
    ([slug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
      localStorage.removeItem(`grants-active-tab-${farmId}`);
      localStorage.removeItem(`grants-agri-env-export-scheme-filter-${farmId}`);
      localStorage.removeItem(`grants-agri-env-export-status-filter-${farmId}`);
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );

  await page.reload({ waitUntil: "networkidle" });
  await page.goto("/dashboard/grants?tab=agrienv");
  await page.reload({ waitUntil: "networkidle" });
  await expect(
    page.getByRole("button", { name: "Agri-environment Schemes", exact: true }),
  ).toBeVisible({ timeout: 20_000 });
  await expect(
    page.getByText(FIRST_SCHEME, { exact: true }),
  ).toBeVisible({ timeout: 20_000 });
}

test("keeps farm-wide drawdown context when printing a filtered scheme", async ({
  page,
}) => {
  const projectIds: number[] = [];

  try {
    const firstProjectId = await createProject(FIRST_SCHEME, 100_000);
    projectIds.push(firstProjectId);
    await waitForProject(firstProjectId);
    const secondProjectId = await createProject(SECOND_SCHEME, 200_000);
    projectIds.push(secondProjectId);
    await waitForProject(secondProjectId);

    await createMilestone(firstProjectId, FIRST_MILESTONE, 25_000, "paid");
    await createMilestone(secondProjectId, SECOND_MILESTONE, 50_000, "submitted");
    const snapshot = await waitForSeededSnapshot(projectIds);

    const drawdownProjects = snapshot.projects.filter(project =>
      ["active", "applied", "pending"].includes(project.status) &&
      (project.totalGrantValuePence ?? 0) > 0,
    );
    const drawdownProjectIds = new Set(drawdownProjects.map(project => project.id));
    const totalPence = drawdownProjects.reduce(
      (sum, project) => sum + (project.totalGrantValuePence ?? 0),
      0,
    );
    const paidPence = snapshot.milestones
      .filter(milestone =>
        drawdownProjectIds.has(milestone.projectId) && milestone.status === "paid",
      )
      .reduce((sum, milestone) => sum + (milestone.claimAmountPence ?? 0), 0);
    const submittedPence = snapshot.milestones
      .filter(milestone =>
        drawdownProjectIds.has(milestone.projectId) && milestone.status === "submitted",
      )
      .reduce((sum, milestone) => sum + (milestone.claimAmountPence ?? 0), 0);
    const drawnPercent = Math.min(100, Math.round(paidPence / totalPence * 100));
    const formatPence = (pence: number) =>
      `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })}`;

    await openAgriEnvironmentTab(page);

    const exportFilterBar = page
      .getByText("Export & Print filter:", { exact: true })
      .locator("..");
    const schemeFilter = exportFilterBar.getByRole("combobox", {
      name: "Filter by scheme name",
    });
    await schemeFilter.click();
    await page.getByRole("option", { name: FIRST_SCHEME, exact: true }).click();
    await expect(exportFilterBar).toContainText(
      `1 of ${snapshot.projects.length} schemes selected`,
    );

    await expect(page.getByText(FIRST_SCHEME, { exact: true })).toBeVisible();
    await expect(page.getByText(SECOND_SCHEME, { exact: true })).toBeVisible();

    const popupPromise = page.waitForEvent("popup");
    await page.getByRole("button", { name: "Print", exact: true }).click();
    const popup = await popupPromise;
    await popup.waitForLoadState("domcontentloaded");

    const printBody = popup.locator("body");
    await expect(printBody).toContainText(
      `Filtered: ${FIRST_SCHEME}`,
    );
    await expect(printBody).toContainText(
      `Farm-wide Drawdown — ${drawdownProjects.length} active projects`,
    );
    await expect(printBody).toContainText(
      `${formatPence(paidPence)} of ${formatPence(totalPence)} claimed across ${drawdownProjects.length} projects`,
    );
    await expect(printBody).toContainText(`${drawnPercent}% drawn`);
    await expect(printBody).toContainText(
      `+ ${formatPence(submittedPence)} submitted (awaiting payment)`,
    );
    await expect(printBody).toContainText(`1. ${FIRST_SCHEME}`);
    await expect(printBody).not.toContainText(SECOND_SCHEME);

    const drawdownCard = printBody.locator(".ae-print-card").first();
    const projectDetail = printBody.locator(".ae-print-card").nth(1);
    await expect(drawdownCard).toContainText("Farm-wide Drawdown");
    await expect(projectDetail).toContainText(`1. ${FIRST_SCHEME}`);

    const progressBar = drawdownCard.locator(
      "div[style*='height: 10px'][style*='overflow: hidden']",
    );
    await expect(progressBar).toHaveCount(1);
    expect(await progressBar.locator(":scope > div").count()).toBeGreaterThan(0);

    await popup.close();
  } finally {
    for (const projectId of projectIds) {
      await deleteProject(projectId).catch(() => {});
    }
  }
});