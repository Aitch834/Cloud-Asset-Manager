/**
 * E2E: LIS re-authorisation warning
 *
 * The API exposes tokenScopeMismatch before a user tries to submit anything.
 * These checks cover both pages that surface that warning and ensure that a
 * re-authorised token does not leave stale warning copy behind.
 */

import { expect, test } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { Client } from "pg";

const TENANT_ID = 1;
const WARNING_TITLE = "Re-authorisation required — LIS production is now live";
const MOVEMENTS_WARNING_TITLE = "LIS re-authorisation required";

type TestFarm = {
  tenantSlug: string;
  farmId: number;
};

function getTestUserId(): string {
  const stateFile = path.join(__dirname, ".test-user-id");
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — .test-user-id missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

async function getTestFarm(): Promise<TestFarm> {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    const result = await db.query<{ tenant_slug: string; farm_id: number }>(
      `SELECT t.slug AS tenant_slug, f.id AS farm_id
       FROM tenants t
       JOIN farms f ON f.tenant_id = t.id
       WHERE t.id = $1
       ORDER BY f.id
       LIMIT 1`,
      [TENANT_ID],
    );
    const row = result.rows[0];
    if (!row) throw new Error(`No farm found for E2E tenant ${TENANT_ID}`);
    return { tenantSlug: row.tenant_slug, farmId: row.farm_id };
  } finally {
    await db.end();
  }
}

async function prepareDashboard(
  page: import("@playwright/test").Page,
  tokenScopeMismatch: boolean,
) {
  const { tenantSlug, farmId } = await getTestFarm();
  await setupClerkTestingToken({ page, userId: getTestUserId() });
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");

  await page.evaluate(
    ([slug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
      localStorage.removeItem(`movements-active-tab-${farmId}`);
    },
    [tenantSlug, farmId] as [string, number],
  );

  await page.route(`**/api/farms/${farmId}/lis-credentials`, async route => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        configured: true,
        sandboxMode: false,
        subscriptionKeyConfigured: true,
        platformOAuthSandbox: false,
        tokenSandboxMode: tokenScopeMismatch,
        tokenScopeMismatch,
        lisUsername: "e2e@example.invalid",
        testStatus: "ok",
      }),
    });
  });

  await page.reload({ waitUntil: "networkidle" });
}

async function expectAmberBanner(
  page: import("@playwright/test").Page,
  title: string,
) {
  const bannerTitle = page.getByText(title, { exact: true });
  await expect(bannerTitle).toBeVisible();
  await expect(bannerTitle.locator("..").locator("..")).toHaveCSS(
    "background-color",
    "rgb(255, 251, 235)",
  );
}

async function openFarmSettings(page: import("@playwright/test").Page) {
  await page.goto("/dashboard/settings/farm");
  await expect(
    page.getByRole("heading", {
      name: "LIS / Livestock Information Service",
      exact: true,
    }),
  ).toBeVisible({ timeout: 20_000 });
}

async function openMovementsLisTab(page: import("@playwright/test").Page) {
  await page.goto("/dashboard/movements");
  await expect(
    page.getByRole("heading", { name: "Livestock Movements", exact: true }),
  ).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: /LIS Submissions/ }).click();
  await expect(
    page.getByRole("heading", { name: "LIS Submission History", exact: true }),
  ).toBeVisible({ timeout: 20_000 });
}

test.describe("LIS re-authorisation banner", () => {
  test("appears on Farm Settings and Movements before any submission attempt", async ({
    page,
  }) => {
    await prepareDashboard(page, true);

    await openFarmSettings(page);
    await expectAmberBanner(page, WARNING_TITLE);

    await openMovementsLisTab(page);
    await expectAmberBanner(page, MOVEMENTS_WARNING_TITLE);
  });

  test("is absent on Farm Settings and Movements after re-authorisation", async ({
    page,
  }) => {
    await prepareDashboard(page, false);

    await openFarmSettings(page);
    await expect(page.getByText(WARNING_TITLE, { exact: true })).toHaveCount(0);

    await openMovementsLisTab(page);
    await expect(
      page.getByText(MOVEMENTS_WARNING_TITLE, { exact: true }),
    ).toHaveCount(0);
  });
});