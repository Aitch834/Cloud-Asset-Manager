/**
 * E2E: Operations and Harvest Farm Address warnings.
 *
 * Uses a real active Viticulture farm to pass the module gate, while routing
 * farm metadata and tab records in the browser so the check is deterministic
 * and does not mutate shared farm data.
 */

import { expect, test, type Page } from "@playwright/test";
import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import { Client } from "pg";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const TENANT_SLUG = "oakfield-farms";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type ViticultureFarm = {
  tenantSlug: string;
  farmId: number;
};

function readSetupFile(name: string): string {
  const stateFile = path.join(__dirname, name);
  if (!fs.existsSync(stateFile)) {
    throw new Error(`global-setup did not run — e2e/${name} is missing`);
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

async function getViticultureFarm(): Promise<ViticultureFarm> {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();

  try {
    const result = await db.query<{ tenant_slug: string; farm_id: number }>(
      `SELECT t.slug AS tenant_slug, f.id AS farm_id
       FROM tenants t
       JOIN farms f ON f.tenant_id = t.id
       JOIN subscriptions s ON s.farm_id = f.id AND s.tenant_id = t.id
       JOIN modules m ON m.id = s.module_id
       WHERE t.slug = $1
         AND (
           s.status = 'active'
           OR (
             s.status = 'trial'
             AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
           )
         )
         AND m.key IN ('viticulture', 'organic-viticulture')
         AND f.sector_viticulture = true
       ORDER BY f.id
       LIMIT 1`,
      [TENANT_SLUG],
    );

    const farm = result.rows[0];
    if (!farm) {
      throw new Error(
        `Farm Address warning setup failed: no active Viticulture farm is available for tenant ${TENANT_SLUG}.`,
      );
    }
    return { tenantSlug: farm.tenant_slug, farmId: farm.farm_id };
  } finally {
    await db.end();
  }
}

async function prepareDashboard(
  page: Page,
  farm: ViticultureFarm,
  farmAddress: { value: string },
): Promise<void> {
  await page.route(`**/api/farms/${farm.farmId}`, async route => {
    const requestUrl = new URL(route.request().url());
    if (
      route.request().method() !== "GET"
      || requestUrl.pathname.endsWith("/dashboard")
    ) {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        record: {
          id: farm.farmId,
          name: "E2E Viticulture Address Farm",
          address: farmAddress.value,
          postcode: "YO1 7HJ",
          sbiNumber: "123456789",
          appaRef: "E2E-APPA",
        },
      }),
    });
  });

  for (const endpoint of ["vineyard-blocks", "vineyard-operations", "vineyard-harvest"]) {
    await page.route(`**/api/farms/${farm.farmId}/${endpoint}`, async route => {
      if (route.request().method() !== "GET") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ records: [] }),
      });
    });
  }

  await setupClerkTestingToken({
    page,
    userId: readSetupFile(".test-user-id"),
  });
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
  await clerk.signIn({
    page,
    emailAddress: readSetupFile(".test-user-email"),
  });

  await page.evaluate(
    ([tenantSlug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "operations");
    },
    [farm.tenantSlug, farm.farmId] as [string, number],
  );
}

function farmAddressWarning(page: Page) {
  return page
    .getByText("Farm Settings incomplete:", { exact: true })
    .locator("..")
    .filter({ hasText: "Farm Address is not set" });
}

async function openViticulture(page: Page): Promise<void> {
  await page.goto("/dashboard/viticulture");
  await page.waitForLoadState("networkidle");
  await expect(
    page.getByText("Viticulture module not active", { exact: true }),
  ).toHaveCount(0);
}

async function expectWarningTargetsAddress(page: Page): Promise<void> {
  const warning = farmAddressWarning(page);
  await expect(warning).toBeVisible();
  await warning
    .getByRole("button", { name: "Add in Farm Settings → Contact & Address", exact: true })
    .click();
  await expect(page).toHaveURL(/\/dashboard\/settings\/farm$/);
  await expect(page.locator("#settings-address")).toBeVisible();
  await expect(page.locator("#settings-address")).toBeInViewport();
}

test("Operations and Harvest show the Farm Address warning only when address is blank", async ({
  page,
}) => {
  const farm = await getViticultureFarm();
  const farmAddress = { value: "" };
  await prepareDashboard(page, farm, farmAddress);

  await openViticulture(page);
  await expect(
    page.getByRole("button", { name: "Pruning & Canopy", exact: true }),
  ).toBeVisible({ timeout: 15_000 });
  await expectWarningTargetsAddress(page);

  await openViticulture(page);
  await page.getByRole("button", { name: "Harvest", exact: true }).click();
  await expect(
    page.getByText("Harvest & Vintage Records", { exact: true }),
  ).toBeVisible();
  await expectWarningTargetsAddress(page);

  farmAddress.value = "1 E2E Vineyard Lane, York";
  await page.reload({ waitUntil: "networkidle" });
  await openViticulture(page);
  await expect(farmAddressWarning(page)).toHaveCount(0);

  await page.getByRole("button", { name: "Pruning & Canopy", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pruning & Canopy", exact: true }),
  ).toBeVisible();
  await expect(farmAddressWarning(page)).toHaveCount(0);
});