import { signInDashboard } from "./auth";
/**
 * E2E: Farm Settings winery threshold hints.
 *
 * Blank farm overrides should show the configured platform defaults. As soon
 * as a grower enters an override, the amber hint should be replaced by the
 * normal explanatory copy. API responses are adjusted in-browser so this test
 * neither depends on nor changes persisted farm settings.
 */

import { expect, test, type Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const IDLE_DEFAULT_DAYS = "73";
const NEUTRAL_DEFAULT_FILLS = "6";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getTestUserEmail(): string {
  const stateFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_EMAIL_FILE!);
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
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );
  await page.reload({ waitUntil: "networkidle" });
}

test("switches winery threshold hints from platform defaults to override descriptions", async ({
  page,
}) => {
  await prepareDashboard(page);

  await page.route(`**/api/farms/${FARM_ID}`, async route => {
    const response = await route.fetch();
    const body = await response.json() as {
      record: Record<string, unknown>;
    };
    await route.fulfill({
      response,
      json: {
        ...body,
        record: {
          ...body.record,
          sectorViticulture: true,
          idleBarrelDays: null,
          approachingNeutralFills: null,
        },
      },
    });
  });
  await page.route("**/api/platform-config", async route => {
    const response = await route.fetch();
    const body = await response.json() as { config: Record<string, string> };
    await route.fulfill({
      response,
      json: {
        ...body,
        config: {
          ...body.config,
          barrel_idle_days_default: IDLE_DEFAULT_DAYS,
          barrel_neutral_fills_default: NEUTRAL_DEFAULT_FILLS,
          "winery.barrelIdleThresholdDays": IDLE_DEFAULT_DAYS,
          "winery.barrelNeutralOakFills": NEUTRAL_DEFAULT_FILLS,
        },
      },
    });
  });

  await page.goto("/dashboard/settings/farm");
  await expect(page.getByText("Barrel Alert Thresholds", { exact: true })).toBeVisible({
    timeout: 20_000,
  });

  const idleThreshold = page.getByLabel("Idle Barrel Threshold (days)", { exact: true });
  const neutralThreshold = page.getByLabel("Neutral Oak Threshold (fills)", { exact: true });
  const idleDefaultHint = page.getByText(
    `Using platform default: ${IDLE_DEFAULT_DAYS} days`,
    { exact: true },
  );
  const neutralDefaultHint = page.getByText(
    `Using platform default: ${NEUTRAL_DEFAULT_FILLS} fills`,
    { exact: true },
  );

  await expect(idleThreshold).toHaveValue("");
  await expect(neutralThreshold).toHaveValue("");
  await expect(idleDefaultHint).toBeVisible();
  await expect(neutralDefaultHint).toBeVisible();

  await idleThreshold.fill("45");
  await neutralThreshold.fill("8");

  await expect(idleDefaultHint).toHaveCount(0);
  await expect(neutralDefaultHint).toHaveCount(0);
  await expect(page.getByText(
    `A barrel empty for longer than this many days is flagged as idle in the vessel register. Leave blank to use the platform default of ${IDLE_DEFAULT_DAYS} days.`,
    { exact: true },
  )).toBeVisible();
  await expect(page.getByText(
    `Barrels at or beyond this fill number are flagged as approaching neutral oak influence. Leave blank to use the platform default of ${NEUTRAL_DEFAULT_FILLS} fills.`,
    { exact: true },
  )).toBeVisible();
});
