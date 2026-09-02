/**
 * E2E: VesselRegisterTab — no-fills fill shortcut.
 *
 * The seeded Highfield Vineyard fixture includes B-01 as an oak barrel with
 * no fill history. Clicking its row badge should open the fill history with
 * the first-fill form ready to use.
 */

import { expect, test } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type ApiRecord = Record<string, unknown>;

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

function getTestUserEmail(): string {
  const emailFile = path.join(__dirname, ".test-user-email");
  if (!fs.existsSync(emailFile)) {
    throw new Error("global-setup did not run — .test-user-email missing");
  }
  return fs.readFileSync(emailFile, "utf8").trim();
}

async function getVessels(): Promise<ApiRecord[]> {
  const response = await fetch(`${apiBase()}/api/farms/${FARM_ID}/winery-vessels`, {
    headers: {
      "x-dev-bypass": DEV_BYPASS,
      "x-tenant-slug": TENANT_SLUG,
    },
  });
  if (!response.ok) {
    throw new Error(
      `GET winery vessels → ${response.status}: ${await response.text()}`,
    );
  }
  const body = await response.json() as { records?: ApiRecord[] };
  return body.records ?? [];
}

async function openVesselRegister(
  page: import("@playwright/test").Page,
): Promise<void> {
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
  await clerk.signIn({ page, emailAddress: getTestUserEmail() });

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
  const viticultureLink = page.getByRole("link", {
    name: "Viticulture",
    exact: true,
  }).first();
  await viticultureLink.click();
  await expect(
    page.getByRole("button", { name: "Add Vessel", exact: true }),
  ).toBeVisible({ timeout: 20_000 });
}

test.describe("VesselRegisterTab — fill shortcut", () => {
  test("opens Fill History with the add-fill form from a no-fills badge", async ({
    page,
  }) => {
    const vessels = await getVessels();
    const seededBarrel = vessels.find(vessel => vessel.vessel_ref === "B-01");

    expect(seededBarrel).toBeDefined();
    expect(seededBarrel?.vessel_type).toBe("oak-barrel");
    expect(Number(seededBarrel?.fill_count ?? 0)).toBe(0);

    await openVesselRegister(page);

    const vesselRow = page.locator("tbody tr", { hasText: "B-01" });
    await expect(vesselRow).toBeVisible({ timeout: 20_000 });

    await vesselRow.getByRole("button", { name: "No fills logged", exact: true }).click();

    const detailDialog = page.getByRole("dialog", {
      name: "Vessel — B-01",
      exact: true,
    });
    await expect(detailDialog).toBeVisible();

    const fillHistoryTab = detailDialog.getByRole("button", {
      name: /^Fill History: 0 records$/,
      exact: true,
    });
    await expect(fillHistoryTab).toBeVisible();
    await expect(fillHistoryTab).toHaveClass(/border-primary/);
    await expect(detailDialog.getByLabel("Fill Number *")).toBeVisible();
  });
});