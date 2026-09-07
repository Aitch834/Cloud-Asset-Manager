import { signInDashboard } from "./auth";
/**
 * E2E: authenticated Organic Input Register exports retain derogation expiry.
 *
 * The browser uses a real Clerk-authenticated tenant/farm context. The input row
 * itself is supplied as a read-only route fixture so the check is deterministic
 * and never changes shared farm records.
 */

import { expect, test, type Page } from "@playwright/test";
import { Client } from "pg";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const TENANT_ID = 1;
const PRODUCT_NAME = "E2E Derogation Seed Treatment";
const FILTER_2025_PRODUCT_NAME = "E2E 2025 Restricted Input";
const FILTER_2024_PRODUCT_NAME = "E2E 2024 Restricted Input";
const EXPIRY_ISO = "2026-12-31";
const EXPIRY_UK = "31/12/2026";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type OrganicFarm = {
  tenantSlug: string;
  farmId: number;
  farmName: string;
};

function getTestUserEmail(): string {
  const stateFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_EMAIL_FILE!);
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — e2e/.test-user-email is missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

function getTestUserId(): string {
  const stateFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_ID_FILE!);
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

  await signInDashboard(page);
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

async function prepareInputRegisterFilterPersistence(
  page: Page,
  farm: OrganicFarm,
): Promise<void> {
  await page.route(`**/api/farms/${farm.farmId}/organic/inputs*`, async route => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }

    const cropYear = new URL(route.request().url()).searchParams.get("cropYear");
    const record =
      cropYear === "2024"
        ? {
            id: 910_042,
            farmId: farm.farmId,
            productName: FILTER_2024_PRODUCT_NAME,
            inputType: "Fertiliser",
            supplier: "E2E Organic Supplies",
            poReference: "PO-E2E-2024",
            grnReference: "GRN-E2E-2024",
            approvalStatus: "restricted",
            certifierApprovalRef: "RESTRICTED-E2E-2024",
            cropYear: 2024,
            dateOfUse: "2024-05-15",
            quantityAmount: "20",
            quantityUnit: "kg",
            fieldId: null,
            fieldName: "North Field",
            justification: "Crop-year filter persistence fixture",
            certifierNotified: true,
            appliedBy: "E2E Tester",
            derogationExpiryDate: null,
            notes: "2024 crop-year fixture",
            createdAt: "2024-05-15T09:00:00.000Z",
          }
        : {
            id: 910_043,
            farmId: farm.farmId,
            productName: FILTER_2025_PRODUCT_NAME,
            inputType: "Fertiliser",
            supplier: "E2E Organic Supplies",
            poReference: "PO-E2E-2025",
            grnReference: "GRN-E2E-2025",
            approvalStatus: "restricted",
            certifierApprovalRef: "RESTRICTED-E2E-2025",
            cropYear: 2025,
            dateOfUse: "2025-05-15",
            quantityAmount: "20",
            quantityUnit: "kg",
            fieldId: null,
            fieldName: "North Field",
            justification: "Crop-year filter persistence fixture",
            certifierNotified: true,
            appliedBy: "E2E Tester",
            derogationExpiryDate: null,
            notes: "2025 crop-year fixture",
            createdAt: "2025-05-15T09:00:00.000Z",
          };

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ records: [record] }),
    });
  });

  await signInDashboard(page);
  await expect(
    page.getByRole("heading", { name: "Select a Farm", exact: true }),
  ).toBeVisible({ timeout: 15_000 });
  await page
    .getByRole("heading", { name: farm.farmName, exact: true })
    .click();
  await expect(page).toHaveURL(/\/dashboard\/?(?:\?.*)?$/, {
    timeout: 15_000,
  });
  await page.evaluate(
    (farmId) => {
      localStorage.setItem(
        `organic-input-register-year-filter-${farmId}`,
        "2025",
      );
      localStorage.setItem(
        `organic-input-register-approval-status-filter-${farmId}`,
        "all",
      );
    },
    farm.farmId,
  );

  await page.goto("/dashboard/organic?tab=input-register", {
    waitUntil: "networkidle",
  });
  await expect(
    page.getByText("Input register — arable, horticultural & general farm inputs"),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByText(FILTER_2025_PRODUCT_NAME, { exact: true }),
  ).toBeVisible();
}

async function prepareEmptyAuditPack(page: Page, farm: OrganicFarm): Promise<() => void> {
  let releaseCertificationRequest!: () => void;
  const certificationRequestHeld = new Promise<void>(resolve => {
    releaseCertificationRequest = resolve;
  });

  await page.route(`**/api/farms/${farm.farmId}/organic/**`, async route => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }

    const pathname = new URL(route.request().url()).pathname;
    if (pathname.endsWith("/certification")) {
      await certificationRequestHeld;
    }

    if (
      !pathname.endsWith("/certification") &&
      !pathname.endsWith("/fields") &&
      !pathname.endsWith("/inspections") &&
      !pathname.endsWith("/inputs")
    ) {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ records: [] }),
    });
  });

  await signInDashboard(page);
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

  await page.goto("/dashboard/organic", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: "Download Audit Pack", exact: true })).toBeVisible({
    timeout: 15_000,
  });

  return releaseCertificationRequest;
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
  const expectedDaysRemaining = await page.evaluate((expiryIso) => {
    const [year, month, day] = expiryIso.split("-").map(Number);
    const now = new Date();
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const expiry = Date.UTC(year, month - 1, day);
    return Math.round((expiry - today) / 86_400_000);
  }, EXPIRY_ISO);

  expect(header).toContain("Derogation Expiry");
  expect(fixtureRow).toContain(PRODUCT_NAME);
  expect(fixtureRow).toContain(EXPIRY_UK);
  expect(fixtureRow).toMatch(new RegExp(`,${expectedDaysRemaining},`));

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
  await expect(printRow).toContainText(String(expectedDaysRemaining));

  await popup.close();
});

test("preserves approval status when switching crop year and includes both in the CSV filename", async ({
  page,
}) => {
  const farm = await getOrganicFarm();
  await prepareInputRegisterFilterPersistence(page, farm);

  const selects = page.locator("select");
  await expect(selects).toHaveCount(2);
  const yearSelect = selects.nth(0);
  const statusSelect = selects.nth(1);

  await expect(yearSelect).toHaveValue("2025");
  await expect(statusSelect).toHaveValue("all");

  await statusSelect.selectOption("restricted");
  await expect(statusSelect).toHaveValue("restricted");
  await expect(
    page.getByText(FILTER_2025_PRODUCT_NAME, { exact: true }),
  ).toBeVisible();

  await yearSelect.selectOption("2024");
  await expect(yearSelect).toHaveValue("2024");
  await expect(statusSelect).toHaveValue("restricted");
  await expect(
    page.getByText(FILTER_2024_PRODUCT_NAME, { exact: true }),
  ).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(
    /^input-register-2024-restricted-.+\.csv$/,
  );
});

test("blocks an immediate audit pack click until empty-register warnings are ready", async ({
  page,
}) => {
  const farm = await getOrganicFarm();
  const releaseCertificationRequest = await prepareEmptyAuditPack(page, farm);
  let downloadCount = 0;
  page.on("download", () => {
    downloadCount += 1;
  });

  try {
    const downloadButton = page.getByRole("button", {
      name: "Download Audit Pack",
      exact: true,
    });
    await expect(downloadButton).toBeDisabled();
    await downloadButton.click({ timeout: 1_000 }).catch(() => {});
    expect(downloadCount).toBe(0);

    releaseCertificationRequest();
    await expect(downloadButton).toBeEnabled({ timeout: 15_000 });
    await expect(page.getByText(/Certification Register is empty/)).toBeVisible();
    await expect(page.getByText(/Inspection Register is empty/)).toBeVisible();
    await expect(page.getByText(/Restricted Inputs Register is empty/)).toBeVisible();
  } finally {
    releaseCertificationRequest();
  }
});
