/**
 * E2E: Irrigation Advisor farm defaults are shared across devices.
 *
 * The Advisor keeps an offline/localStorage copy for convenience, but the
 * farm-level DB values must win when the component first loads. This test uses
 * two browser contexts to model two devices with different localStorage.
 */

import { expect, test } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const DEFAULTS_STORAGE_KEY = `irrigation-advisor-defaults-${FARM_ID}`;

type FarmResponse = { record: Record<string, unknown> };

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

function getTestUserId(): string {
  const stateFile = path.join(__dirname, ".test-user-id");
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — .test-user-id missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

async function getFarm(): Promise<FarmResponse> {
  const response = await fetch(`${apiBase()}/api/farms/${FARM_ID}`, {
    headers: {
      "x-dev-bypass": DEV_BYPASS,
      "x-tenant-slug": TENANT_SLUG,
    },
  });
  if (!response.ok) {
    throw new Error(`GET farm failed (${response.status}): ${await response.text()}`);
  }
  return response.json() as Promise<FarmResponse>;
}

async function patchFarm(body: Record<string, unknown>): Promise<FarmResponse> {
  const response = await fetch(`${apiBase()}/api/farms/${FARM_ID}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-dev-bypass": DEV_BYPASS,
      "x-tenant-slug": TENANT_SLUG,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`PATCH farm failed (${response.status}): ${await response.text()}`);
  }
  return response.json() as Promise<FarmResponse>;
}

async function openAdvisor(
  page: import("@playwright/test").Page,
  localDefaults: { costPerMmHa: string; cropPricePerTonne: string; irrigateMm: string },
) {
  await setupClerkTestingToken({ page, userId: getTestUserId() });
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(
    ([slug, farmId, defaultsKey, defaults]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
      localStorage.setItem(
        defaultsKey,
        JSON.stringify({
          ...defaults,
          expectedRainfall7dMm: "5",
        }),
      );
    },
    [TENANT_SLUG, FARM_ID, DEFAULTS_STORAGE_KEY, localDefaults] as [
      string,
      number,
      string,
      typeof localDefaults,
    ],
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.goto("/dashboard/water-irrigation?tab=advisor");
  await expect(page.getByRole("heading", { name: "Irrigation Advisor", exact: true })).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByText("What-if Parameters", { exact: true })).toBeVisible({
    timeout: 20_000,
  });
}

function advisorInput(
  page: import("@playwright/test").Page,
  label: string,
) {
  return page.getByText(label, { exact: true }).locator("..").locator("input");
}

async function expectAdvisorValues(
  page: import("@playwright/test").Page,
  values: { costPerMmHa: string; cropPricePerTonne: string; irrigateMm: string },
) {
  await expect(advisorInput(page, "Cost per mm/ha (£)")).toHaveValue(values.costPerMmHa);
  await expect(advisorInput(page, "Crop price (£/t)")).toHaveValue(values.cropPricePerTonne);
  await expect(advisorInput(page, "Application rate (mm)")).toHaveValue(values.irrigateMm);
}

async function expectNoDefaultSaveButtons(page: import("@playwright/test").Page) {
  await expect(page.getByRole("button", { name: "Save as default", exact: true })).toHaveCount(0);
}

test("seeds farm defaults across devices and only offers save for changed values", async ({
  browser,
}) => {
  const original = await getFarm();
  const initialDbDefaults = {
    irrigationCostPerMmHa: "4.75",
    irrigationCropPricePerTonne: "387",
    irrigationApplicationRateMm: "18",
  };
  const deviceADefaults = {
    costPerMmHa: "1.11",
    cropPricePerTonne: "111",
    irrigateMm: "9",
  };
  const deviceBStaleDefaults = {
    costPerMmHa: "2.22",
    cropPricePerTonne: "222",
    irrigateMm: "12",
  };
  const updatedCropPrice = "456";

  await patchFarm(initialDbDefaults);
  const deviceAContext = await browser.newContext();
  const deviceBContext = await browser.newContext();
  const deviceA = await deviceAContext.newPage();
  const deviceB = await deviceBContext.newPage();

  try {
    // Device A has stale local values, but the settled farm query must seed the
    // cost, crop price, and application rate from the DB.
    await openAdvisor(deviceA, deviceADefaults);
    await expectAdvisorValues(deviceA, {
      costPerMmHa: initialDbDefaults.irrigationCostPerMmHa,
      cropPricePerTonne: initialDbDefaults.irrigationCropPricePerTonne,
      irrigateMm: initialDbDefaults.irrigationApplicationRateMm,
    });
    await expectNoDefaultSaveButtons(deviceA);

    // A user edit makes exactly one save action available.
    await advisorInput(deviceA, "Crop price (£/t)").fill(updatedCropPrice);
    await expect(deviceA.getByRole("button", { name: "Save as default", exact: true })).toHaveCount(1);
    await deviceA.getByRole("button", { name: "Save as default", exact: true }).click();

    await expect.poll(async () => {
      const farm = await getFarm();
      return String(farm.record.irrigationCropPricePerTonne ?? "");
    }).toBe(updatedCropPrice);

    // Device B has a different stale localStorage copy. It must still show the
    // newly saved DB value after loading, without offering a redundant save.
    await openAdvisor(deviceB, deviceBStaleDefaults);
    await expectAdvisorValues(deviceB, {
      costPerMmHa: initialDbDefaults.irrigationCostPerMmHa,
      cropPricePerTonne: updatedCropPrice,
      irrigateMm: initialDbDefaults.irrigationApplicationRateMm,
    });
    await expectNoDefaultSaveButtons(deviceB);
  } finally {
    await deviceAContext.close().catch(() => {});
    await deviceBContext.close().catch(() => {});
    await patchFarm({
      irrigationCostPerMmHa: original.record.irrigationCostPerMmHa ?? null,
      irrigationCropPricePerTonne: original.record.irrigationCropPricePerTonne ?? null,
      irrigationApplicationRateMm: original.record.irrigationApplicationRateMm ?? null,
    }).catch(() => {});
  }
});