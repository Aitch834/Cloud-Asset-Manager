import { expect, test, type Page } from "@playwright/test";
import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MATCHING_MACHINE_REF = "BDE-FILLER-ALPHA-2196";
const OTHER_MACHINE_REF = "BDE-FILLER-BRAVO-2196";

const BOTTLING_RECORDS = [
  {
    id: 219601,
    bottling_date: "2026-08-14",
    vintage_year: 2026,
    lot_code: "LOT-MACHINE-ALPHA",
    batch_ref: "BATCH-MACHINE-ALPHA",
    wine_colour: "White",
    volume_bottled_litres: 750,
    bottles_produced: 1000,
    bottling_machine_id: 101,
    bottling_machine_ref: MATCHING_MACHINE_REF,
    closure_type: "Screw cap",
    operator_name: "Fixture Operator Alpha",
    notes: "Matching machine fixture",
  },
  {
    id: 219602,
    bottling_date: "2026-08-15",
    vintage_year: 2026,
    lot_code: "LOT-MACHINE-BRAVO",
    batch_ref: "BATCH-MACHINE-BRAVO",
    wine_colour: "Rosé",
    volume_bottled_litres: 600,
    bottles_produced: 800,
    bottling_machine_id: 102,
    bottling_machine_ref: OTHER_MACHINE_REF,
    closure_type: "Cork",
    operator_name: "Fixture Operator Bravo",
    notes: "Non-matching machine fixture",
  },
];

function readStateFile(name: string): string {
  const stateFile = path.join(__dirname, name);
  if (!fs.existsSync(stateFile)) {
    throw new Error(`global-setup did not run — e2e/${name} is missing`);
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

async function openBottlingRecords(page: Page): Promise<void> {
  await page.route(`**/api/farms/${FARM_ID}/winery-bottling`, async route => {
    if (route.request().method() !== "GET") {
      throw new Error("Machine-reference search test must not change bottling data");
    }
    await route.fulfill({ json: { records: BOTTLING_RECORDS } });
  });

  await setupClerkTestingToken({ page, userId: readStateFile(process.env.PLAYWRIGHT_E2E_USER_ID_FILE!) });
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
  await clerk.signIn({ page, emailAddress: readStateFile(process.env.PLAYWRIGHT_E2E_USER_EMAIL_FILE!) });

  await page.evaluate(
    ([tenantSlug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "winery-bottling");
      localStorage.setItem(`bottling-records-signed-filter-${farmId}`, "all");
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );

  await page.goto("/dashboard/viticulture");
  await page.waitForLoadState("networkidle");
  await expect(
    page.getByRole("button", { name: "Bottling Records", exact: true }),
  ).toHaveAttribute("data-state", "active");
  await expect(page.getByText("Bottling Records", { exact: true }).last()).toBeVisible();
}

test("searches displayed bottling rows by machine reference without changing data", async ({
  page,
}) => {
  await openBottlingRecords(page);

  const matchingRow = page.locator("tbody tr", { hasText: "LOT-MACHINE-ALPHA" });
  const otherRow = page.locator("tbody tr", { hasText: "LOT-MACHINE-BRAVO" });

  await expect(matchingRow).toContainText(MATCHING_MACHINE_REF);
  await expect(otherRow).toContainText(OTHER_MACHINE_REF);

  await page
    .getByPlaceholder("Batch, lot, wine, operator, notes…")
    .fill(MATCHING_MACHINE_REF);

  await expect(matchingRow).toBeVisible();
  await expect(otherRow).toHaveCount(0);
  await expect(page.getByText("1 run", { exact: true })).toBeVisible();
});