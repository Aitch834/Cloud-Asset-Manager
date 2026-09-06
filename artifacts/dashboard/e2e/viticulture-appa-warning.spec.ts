import { expect, test, type Page } from "@playwright/test";
import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function readStateFile(name: string): string {
  const stateFile = path.join(__dirname, name);
  if (!fs.existsSync(stateFile)) {
    throw new Error(`global-setup did not run — e2e/${name} is missing`);
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

async function selectViticultureFarm(page: Page): Promise<void> {
  await setupClerkTestingToken({ page, userId: readStateFile(".test-user-id") });
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
  await clerk.signIn({ page, emailAddress: readStateFile(".test-user-email") });

  await page.evaluate(
    ([tenantSlug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "spray-diary");
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );
}

test("shows one APPA warning only while the active farm reference is blank", async ({ page }) => {
  let appaRef: string | null = null;
  const browserErrors: string[] = [];

  page.on("console", message => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  page.on("pageerror", error => browserErrors.push(error.message));

  await page.route(`**/api/farms/${FARM_ID}`, async route => {
    const requestUrl = new URL(route.request().url());
    if (
      route.request().method() !== "GET" ||
      requestUrl.pathname.endsWith("/dashboard")
    ) {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        record: {
          id: FARM_ID,
          name: "Highfield Vineyard",
          address: "1 Vineyard Lane",
          postcode: "AB1 2CD",
          fsaVineRegisterRef: "E2E-FSA-VINE",
          fsaWineProductionRef: "E2E-FSA-WINE",
          winegbMembershipNumber: "E2E-WINEGB",
          appaRef,
        },
      }),
    });
  });

  await selectViticultureFarm(page);
  browserErrors.length = 0;
  await page.goto("/dashboard/viticulture");
  await page.waitForLoadState("networkidle");

  const appaWarnings = page
    .locator('[class*="border-amber"]')
    .filter({ hasText: "APPA Ref" });

  await expect(page.getByRole("button", { name: "Spray Diary", exact: true })).toHaveAttribute(
    "data-state",
    "active",
  );
  await expect(appaWarnings).toHaveCount(1);
  await expect(appaWarnings).toContainText("Farm Settings incomplete");

  await page.getByRole("button", { name: "Harvest", exact: true }).click();
  await expect(page.getByRole("button", { name: "Harvest", exact: true })).toHaveAttribute(
    "data-state",
    "active",
  );
  await expect(appaWarnings).toHaveCount(1);
  await expect(appaWarnings).toContainText("Farm Settings incomplete");

  appaRef = "E2E-APPA-2151";
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: "Harvest", exact: true })).toHaveAttribute(
    "data-state",
    "active",
  );
  await expect(appaWarnings).toHaveCount(0);

  await page.getByRole("button", { name: "Spray Diary", exact: true }).click();
  await expect(page.getByRole("button", { name: "Spray Diary", exact: true })).toHaveAttribute(
    "data-state",
    "active",
  );
  await expect(appaWarnings).toHaveCount(0);
  expect(browserErrors).toEqual([]);
});