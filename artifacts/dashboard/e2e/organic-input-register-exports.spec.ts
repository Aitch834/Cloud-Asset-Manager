/**
 * E2E: authenticated Organic Input Register exports retain derogation expiry.
 *
 * The browser uses a real Clerk-authenticated tenant/farm context. The input row
 * itself is supplied as a read-only route fixture so the check is deterministic
 * and never changes shared farm records.
 */

import { expect, test, type Page } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { Client } from "pg";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const TENANT_ID = 1;
const PRODUCT_NAME = "E2E Derogation Seed Treatment";
const EXPIRY_ISO = "2026-12-31";
const EXPIRY_UK = "31/12/2026";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type OrganicFarm = {
  tenantSlug: string;
  farmId: number;
  farmName: string;
};

function getTestUserId(): string {
  const stateFile = path.join(__dirname, ".test-user-id");
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — e2e/.test-user-id is missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

async function getOrganicFarm(): Promise<OrganicFarm> {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();

  try {
    const result = await db.query<{
      tenant_slug: string;
      farm_id: number;
      farm_name: string;
    }>(
      `SELECT t.slug AS tenant_slug, f.id AS farm_id, f.name AS farm_name
       FROM tenants t
       JOIN farms f ON f.tenant_id = t.id
       JOIN subscriptions s ON s.farm_id = f.id AND s.tenant_id = t.id
       JOIN modules m ON m.id = s.module_id
       WHERE t.id = $1
         AND m.key = 'organic-compliance'
         AND (
           s.status = 'active'
           OR (
             s.status = 'trial'
             AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
           )
         )
       ORDER BY f.id
       LIMIT 1`,
      [TENANT_ID],
    );

    const farm = result.rows[0];
    if (!farm) {
      throw new Error(
        "Input Register export setup failed: no organic-compliance farm is available for the E2E tenant.",
      );
    }

    return {
      tenantSlug: farm.tenant_slug,
      farmId: farm.farm_id,
      farmName: farm.farm_name,
    };
  } finally {
    await db.end();
  }
}

async function prepareInputRegister(page: Page, farm: OrganicFarm): Promise<void> {
  await page.route(`**/api/farms/${farm.farmId}/organic/inputs*`, async route => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        records: [
          {
            id: 910_028,
            farmId: farm.farmId,
            productName: PRODUCT_NAME,
            inputType: "Seed Treatment",
            supplier: "E2E Organic Supplies",
            poReference: "PO-E2E-1928",
            grnReference: "GRN-E2E-1928",
            approvalStatus: "derogation",
            certifierApprovalRef: "DER-E2E-1928",
            cropYear: 2026,
            dateOfUse: "2026-09-01",
            quantityAmount: "25",
            quantityUnit: "kg",
            fieldId: null,
            fieldName: "North Field",
            justification: "Deterministic browser export fixture",
            certifierNotified: true,
            appliedBy: "E2E Tester",
            derogationExpiryDate: EXPIRY_ISO,
            notes: "Authenticated export regression fixture",
            createdAt: "2026-09-01T09:00:00.000Z",
          },
        ],
      }),
    });
  });

  await setupClerkTestingToken({ page, userId: getTestUserId() });
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(
    ([tenantSlug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
    },
    [farm.tenantSlug, farm.farmId] as [string, number],
  );

  await page.goto("/dashboard/organic?tab=input-register", {
    waitUntil: "networkidle",
  });
  await expect(
    page.getByText("Input register — arable, horticultural & general farm inputs"),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(PRODUCT_NAME, { exact: true })).toBeVisible();
}

test("shows derogation expiry in authenticated CSV and print exports", async ({
  page,
}) => {
  const farm = await getOrganicFarm();
  await prepareInputRegister(page, farm);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(
    /^input-register-2026-.+\.csv$/,
  );

  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  const csv = fs.readFileSync(downloadPath!, "utf8");
  const [header, fixtureRow] = csv.trim().split(/\r?\n/);

  expect(header).toContain("Derogation Expiry");
  expect(fixtureRow).toContain(PRODUCT_NAME);
  expect(fixtureRow).toContain(EXPIRY_UK);

  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Print Register", exact: true }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState("domcontentloaded");

  await expect(popup).toHaveTitle(
    new RegExp(`Input Register — ${farm.farmName}`),
  );
  await expect(
    popup.getByRole("columnheader", { name: "Derogation Expiry", exact: true }),
  ).toBeVisible();
  const printRow = popup.getByRole("row").filter({ hasText: PRODUCT_NAME });
  await expect(printRow).toContainText(PRODUCT_NAME);
  await expect(printRow).toContainText(EXPIRY_UK);

  await popup.close();
});