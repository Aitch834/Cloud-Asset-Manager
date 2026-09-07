import { signInDashboard } from "./auth";
/**
 * E2E: Bottling-machine CIP operator persistence.
 *
 * The add form remembers the last successfully saved operator in localStorage,
 * while edit forms must continue to initialise from the selected CIP record.
 * Endpoint interception keeps this browser regression deterministic without
 * changing the shared winery fixture.
 */

import { expect, test, type Locator, type Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled
const MACHINE_ID = 2280;
const MACHINE_REF = "E2E-CIP-OPERATOR-MACHINE";
const OPERATOR_KEY = "winery-cip-operator";
const STORED_OPERATOR = "Remembered CIP Operator";
const EXISTING_OPERATOR = "Saved Record Operator";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type CipRecord = Record<string, unknown>;

function readStateFile(name: string): string {
  const stateFile = path.join(__dirname, name);
  if (!fs.existsSync(stateFile)) {
    throw new Error(`global-setup did not run — e2e/${name} is missing`);
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

function operatorInput(form: Locator): Locator {
  return form.getByText("Operator", { exact: true }).locator("..").getByRole("textbox");
}

async function expandMachine(page: Page): Promise<Locator> {
  const machineCard = page.getByText(MACHINE_REF, { exact: true }).locator("..").locator("..");
  await expect(machineCard).toBeVisible();
  await machineCard.getByRole("button").first().click();
  await expect(machineCard.getByText("CIP / Cleaning Log", { exact: true })).toBeVisible();
  return machineCard;
}

test("remembers a successfully saved CIP operator after reopen and reload without overriding edits", async ({
  page,
}) => {
  const records: CipRecord[] = [
    {
      id: 1,
      clean_date: "2026-09-01",
      timing: "post-run",
      chemical_used: "Existing detergent",
      concentration_pct: "2.5",
      contact_time_mins: 20,
      temperature_c: "60",
      rinse_confirmed: true,
      operator_name: EXISTING_OPERATOR,
      notes: "Existing fixture",
    },
  ];
  let postedRecord: Record<string, unknown> | undefined;

  await page.route(`**/api/farms/${FARM_ID}/winery-bottling-machines`, async route => {
    if (route.request().method() !== "GET") {
      throw new Error("CIP operator test must not change bottling machines");
    }
    await route.fulfill({
      json: {
        records: [{
          id: MACHINE_ID,
          machine_ref: MACHINE_REF,
          machine_type: "filler",
          manufacturer: "E2E",
          model: "CIP fixture",
          last_clean_date: "2026-09-01",
        }],
      },
    });
  });

  await page.route(
    `**/api/farms/${FARM_ID}/winery-bottling-machines/${MACHINE_ID}/cleans`,
    async route => {
      if (route.request().method() === "POST") {
        postedRecord = route.request().postDataJSON() as Record<string, unknown>;
        records.unshift({
          id: 2,
          clean_date: postedRecord.cleanDate,
          timing: postedRecord.timing,
          rinse_confirmed: postedRecord.rinseConfirmed,
          operator_name: postedRecord.operatorName,
        });
        await route.fulfill({ status: 201, json: { record: records[0] } });
        return;
      }
      await route.fulfill({ json: { records } });
    },
  );

  await signInDashboard(page);
  await page.evaluate(
    ([tenantSlug, farmId, operatorKey, operator]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "winery-equipment");
      localStorage.setItem(operatorKey, operator);
    },
    [TENANT_SLUG, FARM_ID, OPERATOR_KEY, STORED_OPERATOR] as const,
  );

  await page.goto("/dashboard/viticulture");
  await expect(page.getByText("Bottling Machine Register", { exact: true })).toBeVisible({
    timeout: 20_000,
  });

  let machineCard = await expandMachine(page);
  await machineCard.getByRole("button", { name: "Log Clean", exact: true }).click();
  await expect(operatorInput(machineCard)).toHaveValue(STORED_OPERATOR);

  await operatorInput(machineCard).fill("Operator saved by CIP test");
  await Promise.all([
    page.waitForResponse(response =>
      response.request().method() === "POST" &&
      response.url().endsWith(`/winery-bottling-machines/${MACHINE_ID}/cleans`),
    ),
    machineCard.getByRole("button", { name: "Save", exact: true }).click(),
  ]);

  expect(postedRecord).toMatchObject({ operatorName: "Operator saved by CIP test" });
  await expect.poll(() => page.evaluate(key => localStorage.getItem(key), OPERATOR_KEY))
    .toBe("Operator saved by CIP test");

  await machineCard.getByRole("button", { name: "Log Clean", exact: true }).click();
  await expect(operatorInput(machineCard)).toHaveValue("Operator saved by CIP test");

  await page.reload({ waitUntil: "networkidle" });
  machineCard = await expandMachine(page);
  await machineCard.getByRole("button", { name: "Log Clean", exact: true }).click();
  await expect(operatorInput(machineCard)).toHaveValue("Operator saved by CIP test");
  await machineCard.getByRole("button", { name: "Cancel", exact: true }).click();

  const existingRow = machineCard.getByText(EXISTING_OPERATOR, { exact: true }).locator("..");
  await existingRow.getByRole("button").first().click();
  await expect(operatorInput(machineCard)).toHaveValue(EXISTING_OPERATOR);
  await expect(operatorInput(machineCard)).not.toHaveValue("Operator saved by CIP test");
});