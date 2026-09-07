import { signInDashboard } from "./auth";
/**
 * E2E: FieldsPage — soil available-water hint stays in sync.
 *
 * A selected soil type should show its available water capacity in the field
 * editor, update immediately when the selection changes, and disappear when
 * the selection is cleared.
 */

import { expect, test, type Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const RUN_TAG = `E2E-field-soil-water-hint-${Date.now()}`;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type ApiRecord = Record<string, unknown>;

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

function getTestUserEmail(): string {
  const stateFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_EMAIL_FILE!);
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — .test-user-email missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

async function devFetch(url: string, init: RequestInit = {}): Promise<ApiRecord> {
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
  return response.json() as Promise<ApiRecord>;
}

async function createField(): Promise<number> {
  const body = await devFetch(`${apiBase()}/api/farms/${FARM_ID}/fields`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: RUN_TAG,
      areaHectares: 1.25,
      soilType: "sandy_loam",
      fieldReference: RUN_TAG,
    }),
  });
  const fieldId = Number((body.record as ApiRecord | undefined)?.id);
  if (!Number.isInteger(fieldId)) {
    throw new Error("POST field did not return a valid field id");
  }
  return fieldId;
}

async function waitForField(fieldId: number): Promise<void> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const body = await devFetch(`${apiBase()}/api/farms/${FARM_ID}/fields`);
    const records = (body.records ?? []) as ApiRecord[];
    if (records.some(record => Number(record.id) === fieldId)) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Created field ${fieldId} was not readable after retries`);
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

test("updates and clears the soil available-water hint immediately", async ({ page }) => {
  const fieldId = await createField();
  try {
    await waitForField(fieldId);
    await prepareDashboard(page);
    await page.goto(`/dashboard/fields?editFieldId=${fieldId}`);

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const soilType = dialog.locator('select[name="soilType"]');

    await expect(soilType).toHaveValue("sandy_loam");
    await expect(dialog.getByText("💧 Holds ~120 mm available water", { exact: true })).toBeVisible();

    await soilType.selectOption("clay");
    await expect(dialog.getByText("💧 Holds ~175 mm available water", { exact: true })).toBeVisible();
    await expect(dialog.getByText("💧 Holds ~120 mm available water", { exact: true })).toHaveCount(0);

    await soilType.selectOption("");
    await expect(dialog.getByText(/Holds ~\d+ mm available water/)).toHaveCount(0);
  } finally {
    await devFetch(`${apiBase()}/api/farms/${FARM_ID}/fields/${fieldId}`, {
      method: "DELETE",
    }).catch(() => undefined);
  }
});
