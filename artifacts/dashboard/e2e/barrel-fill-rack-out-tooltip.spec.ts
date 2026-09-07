/**
 * E2E: BarrelFillHistory — rack-out tooltip.
 *
 * Seeds a barrel and an open fill, then verifies that the quick rack-out
 * action explains what date it records when hovered or focused with the keyboard.
 */

import { expect, test } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const VESSEL_REF = `E2E-RACK-OUT-${Date.now()}`;

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

async function devFetch(url: string, init: RequestInit = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers as Record<string, string> | undefined),
      "x-dev-bypass": DEV_BYPASS,
      "x-tenant-slug": TENANT_SLUG,
    },
  });
  if (!response.ok) {
    throw new Error(
      `${init.method ?? "GET"} ${url} → ${response.status}: ${await response.text()}`,
    );
  }
  return response.json() as Promise<Record<string, unknown>>;
}

async function createFixture() {
  const vesselData = await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/winery-vessels`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vesselRef: VESSEL_REF,
        vesselType: "Oak barrel (225L)",
        capacityLitres: "225",
        status: "active",
      }),
    },
  );
  const vesselId = Number((vesselData.record as Record<string, unknown>).id);

  // The request-scoped farm transaction commits after the response. Poll until
  // the new vessel is visible to the next request before creating its fill.
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const list = await devFetch(
      `${apiBase()}/api/farms/${FARM_ID}/winery-vessels`,
    );
    const visible = (list.records as Array<Record<string, unknown>>).some(
      (record) => Number(record.id) === vesselId,
    );
    if (visible) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const fillData = await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/winery-vessels/${vesselId}/fills`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fillNumber: "1",
        wineName: "E2E Tooltip Wine",
        fillDate: "2026-08-01",
      }),
    },
  );
  const fillId = Number((fillData.record as Record<string, unknown>).id);

  return { vesselId, fillId };
}

async function deleteFixture(vesselId: number, fillId: number) {
  // Delete the fill explicitly first so cleanup remains safe even if the
  // vessel's cascade behaviour changes in a future schema revision.
  await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/winery-vessels/${vesselId}/fills/${fillId}`,
    { method: "DELETE" },
  ).catch(() => undefined);
  await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/winery-vessels/${vesselId}`,
    {
      method: "DELETE",
    },
  ).catch(() => undefined);
}

async function openVesselRegister(page: import("@playwright/test").Page) {
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(
    ([slug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
      localStorage.setItem(
        `viticulture-active-tab-${farmId}`,
        "winery-vessels",
      );
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.goto("/dashboard/viticulture");
  await page.waitForLoadState("networkidle");
  await expect(
    page.getByText("Tank & Vessel Register", { exact: true }),
  ).toBeVisible({ timeout: 20_000 });
}

test("shows the rack-out explanation when hovering or keyboard-focusing an open barrel fill", async ({
  page,
}) => {
  await setupClerkTestingToken({ page, userId: getTestUserId() });
  const { vesselId, fillId } = await createFixture();

  try {
    await openVesselRegister(page);

    const vesselRow = page.locator("tr", { hasText: VESSEL_REF });
    await expect(vesselRow).toBeVisible({
      timeout: 20_000,
      message: "The seeded barrel must appear in the vessel register",
    });

    await vesselRow.locator("td").last().locator("button").first().click();
    const detailDialog = page.getByRole("dialog", {
      name: `Vessel — ${VESSEL_REF}`,
      exact: true,
    });
    await expect(detailDialog).toBeVisible();

    const rackOutButton = detailDialog.getByRole("button", {
      name: "Rack out",
      exact: true,
    });
    await expect(rackOutButton).toBeVisible({
      message: "An open fill must offer the rack-out quick action",
    });
    const explanation = page.getByRole("tooltip", {
      name: "Record the date wine left this barrel",
      exact: true,
    });

    await rackOutButton.hover();
    await expect(explanation).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(explanation).toBeHidden();

    for (let attempt = 0; attempt < 20; attempt += 1) {
      if (await rackOutButton.evaluate((button) => button === document.activeElement)) {
        break;
      }
      await page.keyboard.press("Tab");
    }
    await expect(rackOutButton).toBeFocused({
      message: "Keyboard navigation must reach the rack-out quick action",
    });

    await expect(explanation).toBeVisible();
  } finally {
    await deleteFixture(vesselId, fillId);
  }
});
