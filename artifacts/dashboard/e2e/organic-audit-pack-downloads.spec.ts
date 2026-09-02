/**
 * E2E: the Organic Compliance audit pack downloads every register.
 *
 * The farm and authentication are real, while the four register responses are
 * supplied as read-only browser fixtures. This keeps the check deterministic
 * and avoids changing shared farm records.
 */

import { expect, test, type Download, type Page } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";
import { Client } from "pg";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const TENANT_ID = 1;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type OrganicFarm = {
  tenantSlug: string;
  farmId: number;
  farmName: string;
};

function getTestUserEmail(): string {
  const stateFile = path.join(__dirname, ".test-user-email");
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — e2e/.test-user-email is missing");
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
        "Audit pack setup failed: no organic-compliance farm is available for the E2E tenant.",
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

function fixtureRoute(page: Page, farmId: number, register: string, records: unknown[]) {
  return page.route(
    `**/api/farms/${farmId}/organic/${register}`,
    async route => {
      if (route.request().method() !== "GET") {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ records }),
      });
    },
  );
}

async function prepareOrganicCompliance(page: Page, farm: OrganicFarm): Promise<void> {
  await fixtureRoute(page, farm.farmId, "certification", [
    {
      id: 920_001,
      farmId: farm.farmId,
      certifier: "Soil Association",
      scope: "All enterprises",
      certificateNumber: "E2E-CERT-920001",
      certificationDate: "2026-01-15",
      renewalDate: "2027-01-15",
      expiryDate: "2028-01-15",
      status: "certified",
      operatorNumber: "E2E-OP-920001",
      notes: "Audit pack certification fixture",
    },
  ]);
  await fixtureRoute(page, farm.farmId, "fields", [
    {
      id: 920_002,
      farmId: farm.farmId,
      fieldId: null,
      fieldName: "Audit Pack North Field",
      status: "certified",
      conversionStartDate: "2024-01-01",
      certificationDate: "2026-01-01",
      certifierRef: "E2E-FIELD-920002",
      parallelProduction: false,
      notes: "Audit pack field fixture",
    },
  ]);
  await fixtureRoute(page, farm.farmId, "inspections", [
    {
      id: 920_003,
      farmId: farm.farmId,
      certifier: "Soil Association",
      inspectorName: "E2E Inspector",
      inspectionDate: "2026-02-20",
      outcome: "Pass",
      certificateReference: "E2E-INSP-920003",
      nextDueDate: "2027-02-20",
      nonConformances: null,
      actions: null,
      notes: "Audit pack inspection fixture",
      documentPath: null,
      documentName: null,
    },
  ]);
  await fixtureRoute(page, farm.farmId, "inputs", [
    {
      id: 920_004,
      farmId: farm.farmId,
      productName: "E2E Audit Pack Input",
      inputType: "Fertiliser",
      supplier: "E2E Organic Supplies",
      poReference: "PO-E2E-920004",
      grnReference: "GRN-E2E-920004",
      approvalStatus: "restricted",
      certifierApprovalRef: "E2E-INPUT-920004",
      cropYear: 2026,
      dateOfUse: "2026-03-10",
      quantityAmount: "10",
      quantityUnit: "kg",
      fieldId: null,
      fieldName: "Audit Pack North Field",
      justification: "Audit pack input fixture",
      certifierNotified: true,
      appliedBy: "E2E Tester",
      derogationExpiryDate: "2026-12-31",
      notes: "Audit pack restricted input fixture",
      createdAt: "2026-03-10T09:00:00.000Z",
    },
  ]);

  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
  await clerk.signIn({ page, emailAddress: getTestUserEmail() });
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

  await page.goto("/dashboard/organic", { waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { name: "Organic Compliance", exact: true }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByRole("button", { name: "Download Audit Pack", exact: true }),
  ).toBeEnabled();
}

test("downloads all four populated organic registers in the audit pack", async ({
  page,
}) => {
  const farm = await getOrganicFarm();
  await prepareOrganicCompliance(page, farm);

  const downloads: Download[] = [];
  const recordDownload = (download: Download) => downloads.push(download);
  page.on("download", recordDownload);

  try {
    await page.getByRole("button", { name: "Download Audit Pack", exact: true }).click();
    await expect
      .poll(() => downloads.length, {
        timeout: 10_000,
        message: "Download Audit Pack did not emit four register downloads",
      })
      .toBe(4);
  } finally {
    page.off("download", recordDownload);
  }

  const today = new Date().toISOString().slice(0, 10);
  const filenames = downloads.map(download => download.suggestedFilename());

  expect(filenames[0]).toMatch(
    new RegExp(`^[A-Za-z0-9_]+_Organic_Certification_${today}\\.csv$`),
  );
  expect(filenames[1]).toMatch(/^field-status-register-[a-z0-9-]+\.csv$/);
  expect(filenames[2]).toMatch(
    new RegExp(`^inspections-[a-z0-9-]+-${today}\\.csv$`),
  );
  expect(filenames[3]).toMatch(/^restricted-inputs-all-[A-Za-z0-9-]+\.csv$/);
  expect(new Set(filenames)).toHaveProperty("size", 4);

  for (const download of downloads) {
    const downloadPath = await download.path();
    expect(downloadPath).not.toBeNull();
    expect(fs.readFileSync(downloadPath!, "utf8").trim().split(/\r?\n/)).toHaveLength(2);
  }
});