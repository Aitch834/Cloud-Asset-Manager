import { signInDashboard } from "./auth";
import { expect, test, type Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const TENANT_SLUG = "oakfield-farms";
const FARM_A = { id: 921_671, name: "Levy Test Farm A", totalAcreage: 120 };
const FARM_B = { id: 921_672, name: "Levy Test Farm B", totalAcreage: 240 };
const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.use({ viewport: { width: 390, height: 844 } });

type LevyRequests = {
  ahdbFarmIds: number[];
  tradeLevyFarmIds: number[];
};

function readSetupFile(name: string): string {
  const stateFile = path.join(__dirname, name);
  if (!fs.existsSync(stateFile)) {
    throw new Error(`global-setup did not run — e2e/${name} is missing`);
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

async function mockFarmContext(page: Page): Promise<LevyRequests> {
  const requests: LevyRequests = { ahdbFarmIds: [], tradeLevyFarmIds: [] };

  await page.route("**/api/tenants/current/farms", route =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ farms: [FARM_A, FARM_B] }),
    }),
  );

  for (const farm of [FARM_A, FARM_B]) {
    await page.route(`**/api/farms/${farm.id}`, async route => {
      const url = new URL(route.request().url());
      if (route.request().method() !== "GET" || url.pathname.endsWith("/dashboard")) {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          record: { id: farm.id, name: farm.name, cphNumber: null },
        }),
      });
    });

    await page.route(`**/api/farms/${farm.id}/dashboard`, route =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          farm: { id: farm.id, name: farm.name },
          activeSubscriptions: [],
        }),
      }),
    );

    await page.route(`**/api/farms/${farm.id}/ahdb/**`, route => {
      requests.ahdbFarmIds.push(farm.id);
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          rates: [],
          summary: [],
          records: [],
          registrations: [],
          totalLevyPence: 0,
          farmName: farm.name,
        }),
      });
    });

    await page.route(`**/api/farms/${farm.id}/trade-levies/**`, route => {
      requests.tradeLevyFarmIds.push(farm.id);
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          bodies: [],
          registrations: [],
          records: [],
          summary: [],
          totalPence: 0,
        }),
      });
    });
  }

  return requests;
}

test("Trade & Levy links remain available and correct after switching farms", async ({ page }) => {
  const requests = await mockFarmContext(page);
  await signInDashboard(page);

  await page.evaluate(
    ([tenantSlug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
    },
    [TENANT_SLUG, FARM_A.id] as [string, number],
  );
  await page.goto("/dashboard/dashboard");

  await expect(page.getByText(FARM_A.name, { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Toggle navigation menu" }).click();

  let mobileNav = page.locator("nav:visible");
  await expect(mobileNav.getByText("Trade & Levy", { exact: true })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "AHDB Levy", exact: true })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Trade Body Levies", exact: true })).toBeVisible();

  await page.getByRole("button", { name: /Switch Farm/ }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/\/dashboard\/select$/);
  await page.getByText(FARM_B.name, { exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard\/dashboard$/);

  await expect(page.getByText(FARM_B.name, { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Toggle navigation menu" }).click();
  mobileNav = page.locator("nav:visible");
  await expect(mobileNav.getByText("Trade & Levy", { exact: true })).toBeVisible();

  await mobileNav.getByRole("link", { name: "AHDB Levy", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard\/ahdb-levy$/);
  await expect(page.getByRole("heading", { name: "AHDB Levy Management" })).toBeVisible();
  await expect.poll(() => requests.ahdbFarmIds).toContain(FARM_B.id);
  expect(requests.ahdbFarmIds).not.toContain(FARM_A.id);

  await page.getByRole("button", { name: "Toggle navigation menu" }).click();
  mobileNav = page.locator("nav:visible");
  await expect(mobileNav.getByText("Trade & Levy", { exact: true })).toBeVisible();
  await mobileNav.getByRole("link", { name: "Trade Body Levies", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard\/trade-levies$/);
  await expect(page.getByRole("heading", { name: "Trade Body Levies & Subscriptions" })).toBeVisible();
  await expect.poll(() => requests.tradeLevyFarmIds).toContain(FARM_B.id);
  expect(requests.tradeLevyFarmIds).not.toContain(FARM_A.id);
});