import { signInDashboard } from "./auth";
/**
 * E2E: authenticated Organic Input Register exports retain derogation expiry.
 *
 * Global setup supplies a clearly tagged database fixture on the reusable
 * Clerk-authenticated tenant. This exercises the real API and OrganicPage export
 * behavior without consuming another Clerk development-user slot.
 */

import { expect, test, type Page } from "@playwright/test";
import { Client } from "pg";
import * as fs from "node:fs";
import {
  ORGANIC_INPUT_FIXTURE_EXPIRY_UK,
  ORGANIC_INPUT_FIXTURE_MARKER,
  ORGANIC_INPUT_FIXTURE_PRODUCT,
} from "./organic-input-fixture";

const TENANT_SLUG = "oakfield-farms";
const FILTER_2025_PRODUCT_NAME = "E2E 2025 Restricted Input";
const FILTER_2024_PRODUCT_NAME = "E2E 2024 Restricted Input";

type OrganicFarm = {
  tenantSlug: string;
  farmId: number;
  farmName: string;
};

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
       JOIN organic_inputs oi ON oi.farm_id = f.id
       WHERE t.slug = $1
         AND m.key = 'organic-compliance'
         AND oi.notes = $2
         AND (
           s.status = 'active'
           OR (
             s.status = 'trial'
             AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
           )
         )
       ORDER BY f.id
       LIMIT 1`,
       [TENANT_SLUG, ORGANIC_INPUT_FIXTURE_MARKER],
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
  await page.evaluate((farmId) => {
    localStorage.setItem(`organic-input-register-year-filter-${farmId}`, "all");
    localStorage.setItem(
      `organic-input-register-approval-status-filter-${farmId}`,
      "all",
    );
  }, farm.farmId);

  await page.goto("/dashboard/organic?tab=input-register", {
    waitUntil: "networkidle",
  });
  await expect(
    page.getByText("Input register — arable, horticultural & general farm inputs"),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByText(ORGANIC_INPUT_FIXTURE_PRODUCT, { exact: true }),
  ).toBeVisible();
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
    /^input-register-.+\.csv$/,
  );

  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  const csv = fs.readFileSync(downloadPath!, "utf8");
  const [header, fixtureRow] = csv.trim().split(/\r?\n/);

  expect(header).toContain("Derogation Expiry");
  expect(fixtureRow).toContain(ORGANIC_INPUT_FIXTURE_PRODUCT);
  expect(fixtureRow).toContain(ORGANIC_INPUT_FIXTURE_EXPIRY_UK);

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
  const printRow = popup
    .getByRole("row")
    .filter({ hasText: ORGANIC_INPUT_FIXTURE_PRODUCT });
  await expect(printRow).toContainText(ORGANIC_INPUT_FIXTURE_PRODUCT);
  await expect(printRow).toContainText(ORGANIC_INPUT_FIXTURE_EXPIRY_UK);

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
