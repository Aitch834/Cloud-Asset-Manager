import { signInDashboard } from "./auth";
/**
 * E2E: FieldsPage — edit-field deep links.
 *
 * The Irrigation Advisor can send a grower to /fields?editFieldId=<id>.
 * This must select the Fields tab, open the matching card's edit dialog on
 * mount, and still leave the field list usable after the dialog is closed.
 */

import { expect, test, type Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const RUN_TAG = `E2E-field-edit-deep-link-${Date.now()}`;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type ApiRecord = Record<string, unknown>;
type FieldRecord = { id: number; name?: string | null };

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

async function devFetch(
  url: string,
  init: RequestInit = {},
): Promise<ApiRecord> {
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

async function createField(): Promise<FieldRecord> {
  const body = await devFetch(`${apiBase()}/api/farms/${FARM_ID}/fields`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: RUN_TAG,
      areaHectares: 1.25,
      soilType: "loam",
      fieldReference: RUN_TAG,
    }),
  });
  const record = body.record as ApiRecord | undefined;
  const field = {
    id: Number(record?.id),
    name: typeof record?.name === "string" ? record.name : null,
  };
  if (!Number.isInteger(field.id) || !field.name) {
    throw new Error("POST field did not return a named field record");
  }
  return field;
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

async function deleteField(fieldId: number): Promise<void> {
  await devFetch(`${apiBase()}/api/farms/${FARM_ID}/fields/${fieldId}`, {
    method: "DELETE",
  });
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

test("opens the matching field editor from a direct deep link and closes normally", async ({
  page,
}) => {
  const field = await createField();
  try {
    await waitForField(field.id);
    await prepareDashboard(page);

    // The app is mounted at /dashboard/, so this is the proxied equivalent of
    // the product route /fields?editFieldId=<id>.
    await page.goto(`/dashboard/fields?editFieldId=${field.id}`);

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByText(`Update details for ${field.name}.`, { exact: true }),
    ).toBeVisible();
    await expect(dialog.locator('input[name="name"]')).toHaveValue(field.name);

    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText(field.name!, { exact: true }).first()).toBeVisible();
  } finally {
    await deleteField(field.id).catch(() => undefined);
  }
});
