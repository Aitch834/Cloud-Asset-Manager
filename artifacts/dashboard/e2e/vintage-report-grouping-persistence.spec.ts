import { test, expect, type Page } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";
import { Client } from "pg";
import * as fs from "node:fs";
import * as path from "node:path";

const TENANT_ID = 1;
const GROUPING_FILTER = "trend-chart-group-by-variety";

type TestFarm = {
  tenantSlug: string;
  farmId: number;
};

function getTestUserEmail(): string {
  const emailFile = path.join(__dirname, ".test-user-email");
  if (!fs.existsSync(emailFile)) {
    throw new Error("global-setup did not run — e2e/.test-user-email is missing");
  }
  return fs.readFileSync(emailFile, "utf8").trim();
}

async function getExistingViticultureFarms(): Promise<[TestFarm, TestFarm]> {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    const result = await db.query<{
      tenant_slug: string;
      farm_id: number;
    }>(
      `SELECT t.slug AS tenant_slug, f.id AS farm_id
       FROM tenants t
       JOIN farms f ON f.tenant_id = t.id
       WHERE t.id = $1
         AND EXISTS (
           SELECT 1 FROM vineyard_blocks vb WHERE vb.farm_id = f.id
         )
       ORDER BY f.id
       LIMIT 2`,
      [TENANT_ID],
    );

    if (result.rows.length < 2) {
      throw new Error(
        "Grouping persistence setup failed: the E2E tenant needs two existing farms with vineyard blocks.",
      );
    }

    return result.rows.map(row => ({
      tenantSlug: row.tenant_slug,
      farmId: row.farm_id,
    })) as [TestFarm, TestFarm];
  } finally {
    await db.end();
  }
}

function groupingStorageKey(farmId: number): string {
  return `vintage-season-report-${GROUPING_FILTER}-filter-${farmId}`;
}

async function useFarm(page: Page, farm: TestFarm): Promise<void> {
  await page.evaluate(
    ([tenantSlug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "vintage-report");
    },
    [farm.tenantSlug, farm.farmId] as [string, number],
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.goto("/dashboard/viticulture");
  await expect(page.getByRole("heading", { name: "Vintage Season Report" })).toBeVisible();
}

test("restores the Vintage Season Report grouping independently for each farm", async ({ page }) => {
  const [varietyFarm, blockFarm] = await getExistingViticultureFarms();

  for (const farm of [varietyFarm, blockFarm]) {
    await page.route(`**/api/farms/${farm.farmId}/vineyard-blocks`, async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(Array.from({ length: 8 }, (_, index) => ({
          id: farm.farmId * 1000 + index,
          blockName: `Persistence block ${index + 1}`,
          variety: index < 4 ? "Chardonnay" : "Pinot Noir",
          areaHa: "1",
          numberOfVines: 1000,
          isActive: true,
        }))),
      });
    });
    for (const endpoint of [
      "vineyard-harvest",
      "vineyard-scouting",
      "vineyard-operations",
      "vineyard-spray-diary",
    ]) {
      await page.route(`**/api/farms/${farm.farmId}/${endpoint}`, async route => {
        await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
      });
    }
  }

  await page.goto("/dashboard/");
  await clerk.signIn({ page, emailAddress: getTestUserEmail() });
  await page.waitForLoadState("networkidle");

  await page.evaluate(
    ([varietyKey, blockKey]) => {
      localStorage.setItem(varietyKey, "true");
      localStorage.setItem(blockKey, "false");
    },
    [groupingStorageKey(varietyFarm.farmId), groupingStorageKey(blockFarm.farmId)] as [string, string],
  );

  const groupingButton = page.getByRole("button", { name: "By variety" });

  await useFarm(page, varietyFarm);
  await expect(groupingButton).toHaveAttribute("aria-pressed", "true");

  await useFarm(page, blockFarm);
  await expect(groupingButton).toHaveAttribute("aria-pressed", "false");

  await groupingButton.click();
  await expect(groupingButton).toHaveAttribute("aria-pressed", "true");

  await useFarm(page, varietyFarm);
  await expect(groupingButton).toHaveAttribute("aria-pressed", "true");
  await groupingButton.click();
  await expect(groupingButton).toHaveAttribute("aria-pressed", "false");

  await useFarm(page, blockFarm);
  await expect(groupingButton).toHaveAttribute("aria-pressed", "true");
});