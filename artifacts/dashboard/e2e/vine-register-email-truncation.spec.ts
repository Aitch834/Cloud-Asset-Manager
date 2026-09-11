import { signInDashboard } from "./auth";
/**
 * E2E: Vine Register email truncation guard.
 *
 * Uses an active Viticulture farm only to pass the module gate. Farm metadata
 * and Vine Register records are fulfilled in-browser so the fixtures are
 * stable, isolated, and never mutate shared data.
 */

import { expect, test, type Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getActiveViticultureFarm,
  type ActiveViticultureFarm,
} from "./viticulture-farm-fixture";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type VineRegisterRecord = {
  id: number;
  registeredVariety: string;
  fsaVineRegisterRef: string;
  registeredAreaHa: string;
  giClassification: string;
  wineColour: string;
  dateRegistered: string;
  isRemovedFromRegister: boolean;
};

function readSetupFile(name: string): string {
  const stateFile = path.join(__dirname, name);
  if (!fs.existsSync(stateFile)) {
    throw new Error(`global-setup did not run — e2e/${name} is missing`);
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

function makeRecord(id: number): VineRegisterRecord {
  return {
    id,
    registeredVariety: `Email fixture variety ${id}`,
    fsaVineRegisterRef: `E2E-FSA-${String(id).padStart(4, "0")}`,
    registeredAreaHa: "0.1250",
    giClassification: "Sussex Protected Designation",
    wineColour: "White",
    dateRegistered: "2026-01-15",
    isRemovedFromRegister: false,
  };
}

async function prepareDashboard(
  page: Page,
  farm: ActiveViticultureFarm,
  recordsRef: { value: VineRegisterRecord[] },
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
      json: {
        record: {
          id: farm.farmId,
          name: "E2E Email Guard Vineyard",
          address: "1 Fixture Lane, Testshire",
          sbiNumber: "123456789",
          fsaVineRegisterRef: "E2E-VR-001",
          fsaWineProductionRef: "E2E-WP-001",
          appaRef: "E2E-APPA",
          sectorViticulture: true,
        },
      },
    });
  });

  await page.route(`**/api/farms/${farm.farmId}/vine-register`, async route => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await route.fulfill({ json: { records: recordsRef.value } });
  });

  for (const endpoint of [
    "vineyard-blocks",
    "vineyard-operations",
    "vineyard-harvest",
    "vineyard-scouting",
    "vineyard-spray-diary",
    "vineyard-phenology",
  ]) {
    await page.route(`**/api/farms/${farm.farmId}/${endpoint}`, async route => {
      if (route.request().method() !== "GET") {
        await route.continue();
        return;
      }
      await route.fulfill({ json: { records: [] } });
    });
  }

  await signInDashboard(page);

  await page.evaluate(
    ([tenantSlug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "vine-register");
    },
    [farm.tenantSlug, farm.farmId] as [string, number],
  );
}

async function openVineRegister(page: Page): Promise<void> {
  await page.goto("/dashboard/viticulture");
  await page.waitForLoadState("networkidle");
  const tab = page.getByRole("button", { name: "Vine Register", exact: true });
  if (await tab.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await tab.click();
  }
  await expect(page.getByText("FSA Vine Register", { exact: true })).toBeVisible();
}

test("warns before an over-limit Vine Register mailto and opens a short draft normally", async ({
  page,
}) => {
  const farm = await getActiveViticultureFarm();
  const recordsRef = { value: Array.from({ length: 20 }, (_, index) => makeRecord(index + 1)) };
  await prepareDashboard(page, farm, recordsRef);

  const cdp = await page.context().newCDPSession(page);
  const requestedMailtos: string[] = [];
  cdp.on("Page.frameRequestedNavigation", event => {
    if (event.url.startsWith("mailto:")) requestedMailtos.push(event.url);
  });
  await cdp.send("Page.enable");

  await openVineRegister(page);
  await page.getByRole("button", { name: "Email Register", exact: true }).click();

  const warning = page.getByRole("dialog", { name: "Email may be cut off" });
  await expect(warning).toBeVisible();
  await expect(warning).toContainText("Your Vine Register has many entries");
  expect(requestedMailtos).toHaveLength(0);

  await page.keyboard.press("Escape");
  await expect(warning).not.toBeVisible();

  recordsRef.value = [makeRecord(1)];
  await page.reload({ waitUntil: "networkidle" });
  const tab = page.getByRole("button", { name: "Vine Register", exact: true });
  if (await tab.isVisible({ timeout: 5_000 }).catch(() => false)) await tab.click();
  await expect(page.getByText("Email fixture variety 1", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Email Register", exact: true }).click();
  await expect.poll(() => requestedMailtos.length).toBe(1);
  expect(requestedMailtos[0]).toContain("subject=FSA%20Vine%20Register");
  await expect(warning).toHaveCount(0);
});