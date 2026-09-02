/**
 * E2E: Planning Status — marking an overdue milestone complete refreshes the
 * summary strip without a page reload.
 *
 * The fixture is created through the dev-bypass API and its project is deleted
 * in the finally block so the test does not modify existing farm data.
 */

import { expect, test } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUN_TAG = `E2E overdue milestone ${Date.now()}`;
const TARGET_NAME = `${RUN_TAG} target`;
const SUPPORT_NAME = `${RUN_TAG} support`;

type ApiRecord = Record<string, unknown>;

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

function getTestUserEmail(): string {
  const stateFile = path.join(__dirname, ".test-user-email");
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — .test-user-email missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

async function devFetch(
  url: string,
  init: RequestInit = {},
): Promise<ApiRecord> {
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
  return response.json() as Promise<ApiRecord>;
}

function localIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function overdueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return localIsoDate(date);
}

async function createFixture(): Promise<{ projectId: number; milestoneId: number }> {
  const projectBody = await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/agri-env-projects`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schemeName: RUN_TAG,
        agreementReference: `E2E-${Date.now()}`,
        startDate: `${new Date().getFullYear()}-01-01`,
        endDate: `${new Date().getFullYear()}-12-31`,
        totalGrantValuePence: 100_000,
        status: "active",
      }),
    },
  );
  const project = projectBody.project as ApiRecord | undefined;
  const projectId = Number(project?.id);
  if (!Number.isInteger(projectId)) {
    throw new Error("POST project did not return a valid project id");
  }

  // Farm-scoped writes commit after the response finishes. Wait until the
  // parent is readable before creating its child milestone.
  let projectVisible = false;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const body = await devFetch(
      `${apiBase()}/api/farms/${FARM_ID}/agri-env-projects`,
    );
    const projects = (body.projects ?? []) as ApiRecord[];
    projectVisible = projects.some(candidate => Number(candidate.id) === projectId);
    if (projectVisible) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!projectVisible) {
    throw new Error(`Created project ${projectId} was not readable after waiting`);
  }

  const createMilestone = async (milestoneName: string): Promise<number> => {
    const milestoneBody = await devFetch(
      `${apiBase()}/api/farms/${FARM_ID}/agri-env-projects/${projectId}/milestones`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneName,
          dueDate: overdueDate(),
          claimAmountPence: 10_000,
          status: "pending",
        }),
      },
    );
    const milestone = milestoneBody.milestone as ApiRecord | undefined;
    const milestoneId = Number(milestone?.id);
    if (!Number.isInteger(milestoneId)) {
      throw new Error(`POST milestone "${milestoneName}" did not return a valid id`);
    }
    return milestoneId;
  };

  const milestoneId = await createMilestone(TARGET_NAME);
  await createMilestone(SUPPORT_NAME);

  return { projectId, milestoneId };
}

async function waitForPlannerMilestone(milestoneId: number): Promise<void> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const body = await devFetch(
      `${apiBase()}/api/farms/${FARM_ID}/planner-events`,
    );
    const milestones = (body.milestones ?? []) as ApiRecord[];
    if (milestones.some(milestone => Number(milestone.id) === milestoneId)) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Created milestone ${milestoneId} was not readable after waiting`);
}

async function deleteFixture(projectId: number): Promise<void> {
  await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/agri-env-projects/${projectId}`,
    { method: "DELETE" },
  );
}

async function openPlanningStatus(page: import("@playwright/test").Page): Promise<void> {
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
      localStorage.setItem(`resources-active-tab-${farmId}`, "status");
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );
  await page.reload({ waitUntil: "networkidle" });

  await page.getByRole("link", { name: "Resource Planner", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Resource Planner", exact: true }))
    .toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("button", { name: "Planning Status", exact: true }))
    .toBeVisible({ timeout: 20_000 });
}

test("drops the overdue count and changes the row badge without reloading", async ({
  page,
}) => {
  let projectId: number | null = null;

  try {
    const fixture = await createFixture();
    projectId = fixture.projectId;
    await waitForPlannerMilestone(fixture.milestoneId);
    await openPlanningStatus(page);

    const summary = page.getByText("Overdue milestones", { exact: true }).locator("..");
    const initialCount = Number(await summary.locator("div").first().textContent());
    expect(initialCount).toBeGreaterThan(0);

    await page.getByRole("button", { name: /^Show past tasks/ }).click();

    const milestoneRow = page.getByText(TARGET_NAME, { exact: true })
      .locator("..")
      .locator("..")
      .locator("..");
    await expect(milestoneRow).toBeVisible({ timeout: 20_000 });
    await expect(milestoneRow.getByText("Overdue", { exact: true })).toBeVisible();
    await expect(milestoneRow.getByRole("button", { name: "Mark complete", exact: true }))
      .toBeVisible();

    await milestoneRow.getByRole("button", { name: "Mark complete", exact: true }).click();

    await expect(page.getByText("Milestone marked as complete ✓")).toBeVisible({
      timeout: 20_000,
    });
    await expect(summary.locator("div").first()).toHaveText(String(initialCount - 1), {
      timeout: 20_000,
    });
    await expect(milestoneRow.getByText("✓ Completed", { exact: true })).toBeVisible({
      timeout: 20_000,
    });
    await expect(milestoneRow.getByRole("button", { name: "Mark complete", exact: true }))
      .toHaveCount(0);
  } finally {
    if (projectId !== null) {
      await deleteFixture(projectId).catch(() => {});
    }
  }
});