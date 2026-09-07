/**
 * E2E: Batch Trail print contents layout.
 *
 * The fixture is served entirely through read-only browser routes so the check
 * exercises the real dashboard entry point and generated print popup without
 * changing shared winery data.
 */

import { expect, test, type Page } from "@playwright/test";
import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled
const PRESSING_ID = 2232001;
const BATCH_REF = "E2E-BATCH-PRINT-CONTENTS";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type ApiRecord = Record<string, unknown>;

const PRESSING: ApiRecord = {
  id: PRESSING_ID,
  batch_ref: BATCH_REF,
  vintage_year: 2026,
  press_date: "2026-08-01",
  press_type: "Pneumatic",
  operator_name: "E2E Winemaker",
  grapes_pressed_kg: 1000,
  total_juice_litres: 700,
  press_efficiency_l_per_kg: 0.7,
  juice_brix: 20,
  juice_ph: 3.2,
  juice_turbidity: "Clear",
  notes: "Deterministic print contents fixture",
};

const BATCH_TRAIL: ApiRecord = {
  batchRef: BATCH_REF,
  vintageYear: 2026,
  scope: "batchRef",
  fermentation: [
    {
      id: 2232011,
      batch_ref: BATCH_REF,
      fermentation_date: "2026-08-02",
      vessel_ref: "TANK-E2E-01",
      wine_name: "E2E White",
      fermentation_type: "Primary",
    },
  ],
  cellarOps: [
    {
      id: 2232021,
      batch_ref: BATCH_REF,
      operation_date: "2026-08-10",
      operation_type: "Transfer",
      vessel_ref: "TANK-E2E-01",
      volume_moved_litres: 650,
    },
  ],
  so2Tests: [
    {
      id: 2232031,
      batch_ref: BATCH_REF,
      test_date: "2026-08-12",
    },
  ],
  bottling: [
    {
      id: 2232041,
      batch_ref: BATCH_REF,
      bottling_date: "2026-08-20",
      product_name: "E2E Estate White",
      volume_litres: 600,
    },
  ],
  pressAdditions: [],
};

function readStateFile(name: string): string {
  const stateFile = path.join(__dirname, name);
  if (!fs.existsSync(stateFile)) {
    throw new Error(`global-setup did not run — e2e/${name} is missing`);
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

async function prepareReadOnlyFixture(page: Page): Promise<void> {
  await page.route(`**/api/farms/${FARM_ID}`, async route => {
    if (route.request().method() !== "GET") {
      await route.fulfill({
        status: 405,
        contentType: "application/json",
        body: JSON.stringify({ error: "This regression fixture is read-only" }),
      });
      return;
    }
    await route.fulfill({
      json: { record: { id: FARM_ID, name: "Highfield Vineyard" } },
    });
  });

  await page.route(`**/api/farms/${FARM_ID}/**`, async route => {
    if (route.request().method() !== "GET") {
      await route.fulfill({
        status: 405,
        contentType: "application/json",
        body: JSON.stringify({ error: "This regression fixture is read-only" }),
      });
      return;
    }

    const pathname = new URL(route.request().url()).pathname;
    if (pathname.endsWith("/dashboard")) {
      await route.fulfill({ json: { activeSubscriptions: [{ moduleKey: "viticulture" }] } });
    } else if (pathname.endsWith("/winery-pressing")) {
      await route.fulfill({ json: { records: [PRESSING] } });
    } else if (pathname.includes("/winery-pressing/batch-trail")) {
      await route.fulfill({ json: BATCH_TRAIL });
    } else if (pathname.endsWith("/winery-pressing/additions-summary")) {
      await route.fulfill({ json: { summary: [] } });
    } else if (pathname.endsWith("/winery-pressing/all-additions")) {
      await route.fulfill({ json: { additions: [] } });
    } else if (pathname.endsWith("/winery-batch-settings")) {
      await route.fulfill({ json: { settings: {}, nextRef: "E2E-001" } });
    } else if (pathname.endsWith("/winery-vessels")) {
      await route.fulfill({ json: { records: [] } });
    } else if (pathname.endsWith("/winery-equipment")) {
      await route.fulfill({ json: { records: [] } });
    } else if (pathname.endsWith("/winery-staff")) {
      await route.fulfill({ json: { records: [] } });
    } else {
      await route.fulfill({ json: { records: [] } });
    }
  });

  await setupClerkTestingToken({ page, userId: readStateFile(".test-user-id") });
  await page.goto("/dashboard/", { waitUntil: "domcontentloaded" });
  await clerk.signIn({ page, emailAddress: readStateFile(".test-user-email") });

  await page.evaluate(
    ([tenantSlug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "winery-pressing");
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );
}

test("keeps Batch Trail contents wrapping on screen and aligned in print", async ({ page }) => {
  await prepareReadOnlyFixture(page);
  await page.goto("/dashboard/viticulture", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("button", { name: "Pressing Records", exact: true })).toBeVisible();
  await expect(page.getByText(BATCH_REF, { exact: true })).toBeVisible();

  await page
    .locator(`span[title="View batch trail for ${BATCH_REF}"]`)
    .getByRole("button")
    .click();

  const trailDialog = page.getByRole("dialog", {
    name: new RegExp(`Batch Trail — ${BATCH_REF}`),
  });
  await expect(trailDialog).toBeVisible();

  const popupPromise = page.waitForEvent("popup");
  await trailDialog.getByRole("button", { name: "Print / Export PDF", exact: true }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState("domcontentloaded");
  await expect(popup).toHaveTitle(/Batch Trail/i);
  await expect(popup.locator(".toc-link")).toHaveCount(6);

  await popup.emulateMedia({ media: "screen" });
  await expect(popup.locator(".toc-list")).toHaveCSS("display", "flex");
  await expect(popup.locator(".toc-list")).toHaveCSS("flex-wrap", "wrap");
  await expect(popup.locator(".toc-link").first()).toHaveCSS("white-space", "nowrap");

  await popup.emulateMedia({ media: "print" });
  // beforeprint is the real browser fallback used by the report; dispatching
  // it here makes the page-number annotation deterministic across Chromium
  // versions while still asserting the print media stylesheet.
  await popup.evaluate(() => window.dispatchEvent(new Event("beforeprint")));

  await expect(popup.locator(".toc-list")).toHaveCSS("display", "block");
  await expect(popup.locator(".toc-link")).toHaveCount(6);
  await expect.poll(() => popup.locator(".toc-link[data-page-num]").count()).toBe(6);

  const printLayout = await popup.locator(".toc-link").evaluateAll(links =>
    links.map(link => {
      const style = getComputedStyle(link);
      const number = link.querySelector(".toc-number");
      const title = link.querySelector(".toc-title");
      return {
        display: style.display,
        columns: style.gridTemplateColumns.split(/\s+/).length,
        whiteSpace: style.whiteSpace,
        numberWhiteSpace: number ? getComputedStyle(number).whiteSpace : "",
        titleMinWidth: title ? getComputedStyle(title).minWidth : "",
        pageNumber: link.getAttribute("data-page-num"),
        pageAnnotation: getComputedStyle(link, "::after").content,
      };
    }),
  );

  expect(printLayout).toHaveLength(6);
  expect(new Set(printLayout.map(entry => entry.display))).toEqual(new Set(["grid"]));
  expect(new Set(printLayout.map(entry => entry.columns))).toEqual(new Set([3]));
  expect(new Set(printLayout.map(entry => entry.whiteSpace))).toEqual(new Set(["normal"]));
  expect(new Set(printLayout.map(entry => entry.numberWhiteSpace))).toEqual(new Set(["nowrap"]));
  expect(new Set(printLayout.map(entry => entry.titleMinWidth))).toEqual(new Set(["0px"]));
  expect(printLayout.every(entry => entry.pageNumber && /^\d+$/.test(entry.pageNumber))).toBe(true);
  expect(printLayout.every(entry => /p\./.test(entry.pageAnnotation))).toBe(true);

  await popup.close();
});