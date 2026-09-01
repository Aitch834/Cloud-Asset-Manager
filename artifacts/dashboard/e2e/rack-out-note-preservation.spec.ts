/**
 * E2E: Barrel fill history — rack-out notes survive a later full edit.
 *
 * A rack-out appends its note to the fill's notes field.  The full fill editor
 * sends that same field back on PUT, so this flow guards against an edit that
 * accidentally replaces the appended note with an empty value.
 *
 * The barrel is seeded through the dev-bypass API; the fill creation,
 * rack-out, and later edit all happen through the visible UI.
 */

import { expect, test } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const VESSEL_REF = `E2E-1857-${Date.now()}`;
const RACK_OUT_NOTE = `Rack-out note ${Date.now()}`;

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

async function apiRequest(
  url: string,
  init: RequestInit = {},
): Promise<Record<string, unknown>> {
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

async function createBarrel(): Promise<number> {
  const body = {
    vesselRef: VESSEL_REF,
    vesselType: "Oak barrel (225L)",
    capacityLitres: "225",
    status: "active",
  };
  const result = await apiRequest(`${apiBase()}/api/farms/${FARM_ID}/winery-vessels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return Number((result.record as { id: number }).id);
}

async function getFills(vesselId: number): Promise<Array<{ id: number; notes: string | null }>> {
  const result = await apiRequest(
    `${apiBase()}/api/farms/${FARM_ID}/winery-vessels/${vesselId}/fills`,
  );
  return (result.records ?? []) as Array<{ id: number; notes: string | null }>;
}

async function deleteFill(vesselId: number, fillId: number): Promise<void> {
  await apiRequest(
    `${apiBase()}/api/farms/${FARM_ID}/winery-vessels/${vesselId}/fills/${fillId}`,
    { method: "DELETE" },
  );
}

async function deleteBarrel(vesselId: number): Promise<void> {
  await apiRequest(`${apiBase()}/api/farms/${FARM_ID}/winery-vessels/${vesselId}`, {
    method: "DELETE",
  });
}

async function openVesselRegister(page: import("@playwright/test").Page): Promise<void> {
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
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
  await page.goto("/dashboard/viticulture");
  await page.waitForLoadState("networkidle");

  const vesselTab = page.getByRole("button", {
    name: "Tank & Vessel Register",
    exact: true,
  });
  if (await vesselTab.isVisible({ timeout: 10_000 })) {
    await vesselTab.click();
  }
}

test("preserves a rack-out note when the fill is edited afterwards", async ({ page }) => {
  await setupClerkTestingToken({ page, userId: getTestUserId() });
  const vesselId = await createBarrel();

  try {
    await openVesselRegister(page);

    const vesselRow = page.locator("tr", { hasText: VESSEL_REF });
    await expect(vesselRow).toBeVisible({
      timeout: 20_000,
      message: "The uniquely seeded barrel must appear in the vessel register",
    });
    await vesselRow.locator("td").last().getByRole("button").first().click();

    const vesselDialog = page.getByRole("dialog").filter({ hasText: VESSEL_REF });
    await expect(vesselDialog).toBeVisible();

    // 1. Create a fill with no notes.
    await vesselDialog.getByRole("button", { name: "Log Fill", exact: true }).click();
    await vesselDialog.getByLabel("Fill Number *").fill("1");
    await vesselDialog.getByRole("button", { name: "Save", exact: true }).click();
    await expect(vesselDialog.getByText("New oak", { exact: true })).toBeVisible({
      timeout: 10_000,
    });

    // 2. Record a rack-out with a note.
    await vesselDialog.getByRole("button", { name: "Rack out", exact: true }).click();
    await vesselDialog.getByLabel("Notes (optional)").fill(RACK_OUT_NOTE);
    await vesselDialog.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText("Rack-out date recorded", { exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await expect(vesselDialog.getByText(RACK_OUT_NOTE, { exact: true })).toBeVisible({
      timeout: 10_000,
    });

    // 3. Open the same fill's edit form and save without touching Notes.
    const fillRow = vesselDialog.locator("div.border.rounded-lg").filter({
      hasText: RACK_OUT_NOTE,
    });
    await expect(fillRow).toBeVisible();
    await fillRow.locator("button").first().click();
    await expect(vesselDialog.getByText("Edit fill record", { exact: true })).toBeVisible();
    await vesselDialog.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText("Fill record updated", { exact: true })).toBeVisible({
      timeout: 10_000,
    });

    // 4. Confirm both the rendered history and persisted API record retain it.
    await expect(vesselDialog.getByText(RACK_OUT_NOTE, { exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await expect.poll(async () => (await getFills(vesselId))[0]?.notes).toBe(RACK_OUT_NOTE);
  } finally {
    for (const fill of await getFills(vesselId).catch(() => [])) {
      await deleteFill(vesselId, fill.id).catch(() => undefined);
    }
    await deleteBarrel(vesselId).catch(() => undefined);
  }
});