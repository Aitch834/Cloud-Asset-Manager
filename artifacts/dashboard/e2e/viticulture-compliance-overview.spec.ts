import { signInDashboard } from "./auth";
/**
 * E2E: Viticulture Overview compliance summary.
 *
 * The Overview's record queries are intercepted so this test owns the complete
 * compliance input. It starts with one unlinked scouting record (the only
 * failing check), verifies the failure treatment and repair affordance, then
 * returns that record as linked and verifies the recalculated all-clear state.
 */

import { expect, test, type Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getTestUserEmail(): string {
  const emailFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_EMAIL_FILE!);
  if (!fs.existsSync(emailFile)) {
    throw new Error("global-setup did not run — .test-user-email missing");
  }
  return fs.readFileSync(emailFile, "utf8").trim();
}

async function signInAndOpenOverview(page: Page): Promise<void> {
  await signInDashboard(page);
  await page.evaluate(
    ([slug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "overview");
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );
  await page.goto("/dashboard/viticulture");
  await expect(page.getByText("UK Vineyard Compliance Checklist", { exact: true })).toBeVisible({
    timeout: 20_000,
  });
}

test("compliance failures stay ordered and clear after records change", async ({ page }) => {
  let scoutingLinked = false;
  const today = new Date().toISOString().slice(0, 10);
  const recordsByEndpoint = new Map<string, Array<Record<string, unknown>>>([
    ["vineyard-blocks", [{ id: 91001, blockName: "Compliance Block", areaHa: 1, isActive: true }]],
    ["vine-register", [{ id: 91002, blockId: 91001, registeredAreaHa: 1, isRemovedFromRegister: false }]],
    ["vineyard-harvest", [{ id: 91003, blockId: 91001, harvestDate: today, vintageYear: new Date().getFullYear() }]],
    ["vineyard-operations", [{ id: 91004, blockId: 91001, operationDate: today }]],
    ["vineyard-spray-diary", [{ id: 91005, blockId: 91001, applicationDate: today }]],
    ["vineyard-phenology", [{ id: 91006, blockId: 91001, observationDate: today }]],
  ]);

  await page.route(new RegExp(`/api/farms/${FARM_ID}/(vineyard-blocks|vine-register|vineyard-harvest|vineyard-scouting|vineyard-operations|vineyard-spray-diary|vineyard-phenology)(?:\\?.*)?$`), async route => {
    const endpoint = new URL(route.request().url()).pathname.split("/").pop()!;
    const records = endpoint === "vineyard-scouting"
      ? [{
          id: 91007,
          blockId: scoutingLinked ? 91001 : null,
          scoutDate: today,
          scoutedBy: "Compliance E2E",
          xylellaFastidiosa: false,
        }]
      : recordsByEndpoint.get(endpoint) ?? [];
    await route.fulfill({ json: { records } });
  });

  await signInAndOpenOverview(page);

  const checklist = page
    .getByText("UK Vineyard Compliance Checklist", { exact: true })
    .locator("xpath=ancestor::div[contains(@class, 'border') and contains(@class, 'p-4')][1]");
  const failingCheck = checklist
    .getByText("All scouting records linked to blocks", { exact: true })
    .locator("xpath=ancestor::div[@role='button'][1]");
  const firstCheck = checklist.locator("div.grid.grid-cols-1 > div").first();

  await expect(checklist.getByRole("status")).toHaveText("1 of 11 checks need attention");
  await expect(checklist.getByText("1 to fix", { exact: true })).toHaveClass(/text-red-700/);
  await expect(failingCheck).toHaveClass(/border-red-200/);
  await expect(failingCheck).toHaveClass(/bg-red-50/);
  await expect(failingCheck).toHaveAttribute("role", "button");
  await expect(failingCheck.getByText("1 unlinked", { exact: true })).toBeVisible();
  await expect(firstCheck).toContainText("All scouting records linked to blocks");

  await failingCheck.click();
  await expect(page.getByRole("dialog", {
    name: "Link unlinked scouting records to blocks",
  })).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();

  scoutingLinked = true;
  await page.evaluate(farmId => {
    localStorage.setItem(`viticulture-active-tab-${farmId}`, "overview");
  }, FARM_ID);
  await page.reload({ waitUntil: "networkidle" });

  const refreshedChecklist = page
    .getByText("UK Vineyard Compliance Checklist", { exact: true })
    .locator("xpath=ancestor::div[contains(@class, 'border') and contains(@class, 'p-4')][1]");
  await expect(refreshedChecklist.getByRole("status")).toHaveText("All 11 checks are up to date");
  await expect(refreshedChecklist.getByText("0 to fix", { exact: true })).toHaveClass(/text-green-700/);
  await expect(
    refreshedChecklist.getByText("Checks needing attention are shown first.", { exact: false }),
  ).toHaveCount(0);
});
