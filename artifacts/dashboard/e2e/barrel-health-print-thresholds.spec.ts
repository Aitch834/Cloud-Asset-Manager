import { signInDashboard } from "./auth";
/**
 * E2E: Vessel Register — Barrel Health Summary threshold audit trail.
 *
 * Keep the fixture on a farm with Viticulture enabled, then give its threshold
 * settings distinctive values so the print popup proves it used the farm
 * configuration rather than platform or hardcoded defaults.
 */

import { expect, test, type Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled
const IDLE_DAYS = 47;
const NEUTRAL_FILLS = 7;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getTestUserEmail(): string {
  const stateFile = path.join(__dirname, ".test-user-email");
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — .test-user-email missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

async function prepareDashboard(page: Page): Promise<void> {
  await signInDashboard(page);
  await page.evaluate(
    ([slug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "winery-vessels");
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );
  await page.reload({ waitUntil: "networkidle" });
}

test("prints the enabled farm's configured barrel thresholds", async ({ page }) => {
  const diagnostics: string[] = [];

  page.on("pageerror", error => diagnostics.push(`pageerror: ${error.message}`));
  page.on("requestfailed", request => {
    if (new URL(request.url()).pathname.startsWith("/api/")) {
      diagnostics.push(
        `requestfailed: ${request.method()} ${request.url()} — ${request.failure()?.errorText ?? "unknown error"}`,
      );
    }
  });
  page.on("response", response => {
    if (
      new URL(response.url()).pathname.startsWith("/api/")
      && response.status() >= 400
    ) {
      diagnostics.push(
        `response: ${response.request().method()} ${response.url()} — ${response.status()}`,
      );
    }
  });

  await page.addInitScript(() => {
    window.print = () => {
      document.documentElement.dataset.printCalled = "true";
    };
  });

  await page.route(`**/api/farms/${FARM_ID}`, async route => {
    const response = await route.fetch();
    const body = await response.json() as { record: Record<string, unknown> };
    await route.fulfill({
      response,
      json: {
        ...body,
        record: {
          ...body.record,
          sectorViticulture: true,
          idleBarrelDays: IDLE_DAYS,
          approachingNeutralFills: NEUTRAL_FILLS,
        },
      },
    });
  });
  await page.route(`**/api/farms/${FARM_ID}/winery-vessels`, async route => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      json: {
        records: [{
          id: 2292001,
          vessel_ref: "BARREL-THRESHOLD-AUDIT",
          vessel_type: "barrel",
          capacity_litres: 225,
          status: "active",
          fill_number: 2,
          fill_count: 2,
          is_full: true,
          maintenance_count: 0,
        }],
      },
    });
  });
  await page.route(
    `**/api/farms/${FARM_ID}/winery-vessels-maintenance-summary`,
    async route => {
      const response = await route.fetch();
      await route.fulfill({ response, json: { records: [] } });
    },
  );

  await prepareDashboard(page);
  await page.getByRole("link", { name: "Viticulture", exact: true }).first().click();
  await expect(
    page.getByText("Tank & Vessel Register", { exact: true }),
  ).toBeVisible({ timeout: 20_000 });

  const stockSummary = page.locator("div.rounded-lg", {
    hasText: "Cellar Stock — Barrels",
  });
  const popupPromise = page.waitForEvent("popup");
  await stockSummary.getByRole("button", { name: "Print", exact: true }).click();
  const printPopup = await popupPromise;

  await expect(printPopup.locator("h1")).toContainText("Barrel Health Summary");
  await expect(printPopup.locator(".thresholds")).toHaveText(
    new RegExp(
      `Idle threshold: ${IDLE_DAYS}d\\s+\\|\\s+Neutral threshold: fill ${NEUTRAL_FILLS}\\+`,
    ),
  );
  await expect(printPopup.locator("html")).toHaveAttribute("data-print-called", "true");

  expect(
    diagnostics,
    `Browser/request errors while printing Barrel Health Summary:\n${diagnostics.join("\n")}`,
  ).toEqual([]);
});