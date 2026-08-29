import { expect, test } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;

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

async function patchFarm(body: Record<string, unknown>) {
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
  return response.json() as Promise<{ record: Record<string, unknown> }>;
}

async function getFarm() {
  const response = await fetch(`${apiBase()}/api/farms/${FARM_ID}`, {
    headers: {
      "x-dev-bypass": DEV_BYPASS,
      "x-tenant-slug": TENANT_SLUG,
    },
  });
  if (!response.ok) {
    throw new Error(`GET farm failed (${response.status}): ${await response.text()}`);
  }
  return response.json() as Promise<{ record: Record<string, unknown> }>;
}

test("saves a missing registration reference without leaving viticulture", async ({ page }) => {
  const sentinel = `E2E-APPA-${Date.now()}`;
  const original = await getFarm();
  await patchFarm({ appaRef: null });

  try {
    await setupClerkTestingToken({ page, userId: getTestUserId() });
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
    await page.getByRole("link", { name: /viticulture/i }).click();
    await page.waitForLoadState("networkidle");

    const originalUrl = page.url();
    await page.getByRole("button", { name: /APPA Ref/ }).click();
    await expect(page.getByRole("dialog", { name: "Add APPA Ref" })).toBeVisible();
    await page.getByLabel("APPA Ref").fill(sentinel);
    await page.getByRole("button", { name: "Save reference" }).click();

    await expect(page.getByRole("dialog", { name: "Add APPA Ref" })).toBeHidden();
    await expect(page.getByRole("button", { name: /APPA Ref/ })).toBeDisabled();
    expect(page.url()).toBe(originalUrl);

    await page.waitForTimeout(750);
    await expect(page.getByRole("button", { name: /APPA Ref/ })).toBeDisabled();
  } finally {
    await patchFarm({ appaRef: original.record.appaRef ?? null });
  }
});