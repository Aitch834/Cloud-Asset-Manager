import { signInDashboard } from "./auth";
/**
 * E2E: Irrigation Advisor farm defaults are shared across devices.
 *
 * The Advisor keeps an offline/localStorage copy for convenience, but the
 * farm-level DB values must win when the component first loads. This test uses
 * two browser contexts to model two devices with different localStorage.
 */

import { expect, test } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const DEFAULTS_STORAGE_KEY = `irrigation-advisor-defaults-${FARM_ID}`;

type FarmResponse = { record: Record<string, unknown> };
type PlatformConfigResponse = { config: Record<string, string> };

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

function getTestUserId(): string {
  const stateFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_ID_FILE!);
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

async function getPlatformConfig(): Promise<Record<string, string>> {
  const response = await fetch(`${apiBase()}/api/platform-config`);
  if (!response.ok) {
    throw new Error(`GET platform config failed (${response.status}): ${await response.text()}`);
  }
  const payload = await response.json() as PlatformConfigResponse;
  return payload.config;
}

async function initialiseDashboard(
  page: import("@playwright/test").Page,
  options: { clearAdvisorDefaults?: boolean } = {},
) {
  await signInDashboard(page);
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(
    ([slug, farmId, defaultsKey, clearAdvisorDefaults]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
      if (clearAdvisorDefaults) localStorage.removeItem(defaultsKey);
    },
    [TENANT_SLUG, FARM_ID, DEFAULTS_STORAGE_KEY, options.clearAdvisorDefaults ?? false] as const,
  );
  await page.reload({ waitUntil: "networkidle" });
}

async function openAdvisor(
  page: import("@playwright/test").Page,
  localDefaults: { costPerMmHa: string; cropPricePerTonne: string; irrigateMm: string },
) {
  await initialiseDashboard(page);
  await page.evaluate(
    ([defaultsKey, defaults]) => {
      localStorage.setItem(
        defaultsKey,
        JSON.stringify({
          ...defaults,
          expectedRainfall7dMm: "5",
        }),
      );
    },
    [DEFAULTS_STORAGE_KEY, localDefaults] as [
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

async function openFarmSettings(page: import("@playwright/test").Page) {
  await initialiseDashboard(page, { clearAdvisorDefaults: true });
  await page.goto("/dashboard/settings/farm");
  await expect(page.getByRole("heading", { name: "Farm Settings", exact: true })).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByText("Water & Irrigation", { exact: true })).toBeVisible({
    timeout: 20_000,
  });
}

async function selectFirstAdvisorField(page: import("@playwright/test").Page) {
  const fieldPicker = page.getByText("Field", { exact: true }).locator("..").getByRole("combobox");
  await fieldPicker.click();
  await page.getByRole("option").first().click();
  await expect(page.getByText("Abstraction Source", { exact: true })).toBeVisible();
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

test("uses platform water defaults when farm overrides are blank and farm overrides otherwise", async ({
  page,
}) => {
  const original = await getFarm();
  const platformConfig = await getPlatformConfig();
  const platformCost = platformConfig["irrigation.costPerMmHa"];
  const platformSource = platformConfig["irrigation.abstractionSource"];
  const farmCostOverride = "8.25";
  const farmSourceOverride = "North reservoir";

  expect(platformCost, "platform irrigation cost must be configured").toBeTruthy();
  expect(platformSource, "platform abstraction source must be configured").toBeTruthy();

  try {
    await patchFarm({
      irrigationCostPerMmHa: null,
      irrigationAbstractionSource: null,
    });

    await openFarmSettings(page);
    await expect(page.locator("#settings-irrig-cost")).toHaveValue("");
    await expect(page.locator("#settings-irrig-source")).toHaveValue("");
    await expect(
      page.getByText(
        `Using platform default: £${Number(platformCost).toFixed(2)}/mm/ha`,
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page.getByText(`Using platform default: ${platformSource}`, { exact: true }),
    ).toBeVisible();

    await page.goto("/dashboard/water-irrigation?tab=advisor");
    await expect(page.getByText("What-if Parameters", { exact: true })).toBeVisible({
      timeout: 20_000,
    });
    await expect(advisorInput(page, "Cost per mm/ha (£)")).toHaveValue(platformCost);
    await selectFirstAdvisorField(page);
    await expect(page.getByText(platformSource, { exact: true })).toBeVisible();

    await patchFarm({
      irrigationCostPerMmHa: farmCostOverride,
      irrigationAbstractionSource: farmSourceOverride,
    });

    await openFarmSettings(page);
    await expect(page.locator("#settings-irrig-cost")).toHaveValue(farmCostOverride);
    await expect(page.locator("#settings-irrig-source")).toHaveValue(farmSourceOverride);
    await expect(page.getByText(/Using platform default:/)).toHaveCount(0);

    await page.goto("/dashboard/water-irrigation?tab=advisor");
    await expect(page.getByText("What-if Parameters", { exact: true })).toBeVisible({
      timeout: 20_000,
    });
    await expect(advisorInput(page, "Cost per mm/ha (£)")).toHaveValue(farmCostOverride);
    await selectFirstAdvisorField(page);
    await expect(page.getByText(farmSourceOverride, { exact: true })).toBeVisible();
  } finally {
    await patchFarm({
      irrigationCostPerMmHa: original.record.irrigationCostPerMmHa ?? null,
      irrigationAbstractionSource: original.record.irrigationAbstractionSource ?? null,
    }).catch(() => {});
  }
});
