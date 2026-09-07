import { expect, test } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

function getTestUserId(): string {
  const stateFile = path.join(path.dirname(fileURLToPath(import.meta.url)), ".test-user-id");
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

async function openViticulture(page: import("@playwright/test").Page) {
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
}

test("saves a missing registration reference without leaving viticulture", async ({ page }) => {
  const sentinel = `E2E-APPA-${Date.now()}`;
  const original = await getFarm();
  await patchFarm({ appaRef: null });

  try {
    await openViticulture(page);

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

test("header link targets the missing FSA Vine Register Ref before a filled APPA Ref", async ({ page }) => {
  const original = await getFarm();
  await patchFarm({
    fsaVineRegisterRef: null,
    fsaWineProductionRef: "E2E-FSA-WINE-FILLED",
    appaRef: "E2E-APPA-FILLED",
    winegbMembershipNumber: "E2E-WINEGB-FILLED",
  });

  try {
    await page.addInitScript(() => {
      HTMLElement.prototype.scrollIntoView = function scrollIntoView() {
        (window as typeof window & { __scrolledRegistrationId?: string }).__scrolledRegistrationId = this.id;
      };
    });
    await openViticulture(page);

    await page.getByRole("button", { name: "Farm Settings → Viticulture Registrations" }).click();

    await expect(page).toHaveURL(/\/dashboard\/settings\/farm/);
    await expect.poll(() =>
      page.evaluate(() =>
        (window as typeof window & { __scrolledRegistrationId?: string }).__scrolledRegistrationId,
      ),
    ).toBe("settings-fsa-vine-ref");
  } finally {
    await patchFarm({
      fsaVineRegisterRef: original.record.fsaVineRegisterRef ?? null,
      fsaWineProductionRef: original.record.fsaWineProductionRef ?? null,
      appaRef: original.record.appaRef ?? null,
      winegbMembershipNumber: original.record.winegbMembershipNumber ?? null,
    });
  }
});

test("header link targets APPA when it is the first missing registration field", async ({ page }) => {
  const original = await getFarm();
  await patchFarm({
    fsaVineRegisterRef: "E2E-FSA-VINE-FILLED",
    fsaWineProductionRef: "E2E-FSA-WINE-FILLED",
    appaRef: null,
    winegbMembershipNumber: "E2E-WINEGB-FILLED",
  });

  try {
    await page.addInitScript(() => {
      HTMLElement.prototype.scrollIntoView = function scrollIntoView() {
        (window as typeof window & { __scrolledRegistrationId?: string }).__scrolledRegistrationId = this.id;
      };
    });
    await openViticulture(page);

    await page.getByRole("button", { name: "Farm Settings → Viticulture Registrations" }).click();

    await expect(page).toHaveURL(/\/dashboard\/settings\/farm/);
    await expect.poll(() =>
      page.evaluate(() =>
        (window as typeof window & { __scrolledRegistrationId?: string }).__scrolledRegistrationId,
      ),
    ).toBe("settings-appa-ref");
  } finally {
    await patchFarm({
      fsaVineRegisterRef: original.record.fsaVineRegisterRef ?? null,
      fsaWineProductionRef: original.record.fsaWineProductionRef ?? null,
      appaRef: original.record.appaRef ?? null,
      winegbMembershipNumber: original.record.winegbMembershipNumber ?? null,
    });
  }
});
