/**
 * E2E: Bottling Records machine/search intersection and CSV export.
 *
 * Seeds two machines and three runs on the stable Highfield Vineyard fixture.
 * The browser responses are scoped to those temporary records so assertions are
 * deterministic even when the shared development farm contains other runs.
 */

import { expect, test, type Page } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled
const RUN_TAG = `E2E-2204-${Date.now()}`;
const SEARCH_TERM = `${RUN_TAG}-shared`;
const MACHINE_A = `${RUN_TAG}-machine-a`;
const MACHINE_B = `${RUN_TAG}-machine-b`;
const LOT_A_MATCH = `${RUN_TAG}-lot-a-match`;
const LOT_B_MATCH = `${RUN_TAG}-lot-b-match`;
const LOT_A_OTHER = `${RUN_TAG}-lot-a-other`;
const VINTAGE_YEAR = new Date().getFullYear();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type ApiRecord = Record<string, unknown>;

function apiBase(): string {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

function getTestUserEmail(): string {
  const emailFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_EMAIL_FILE!);
  if (!fs.existsSync(emailFile)) {
    throw new Error("global-setup did not run — .test-user-email missing");
  }
  return fs.readFileSync(emailFile, "utf8").trim();
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
    throw new Error(`${init.method ?? "GET"} ${url} → ${response.status}: ${await response.text()}`);
  }
  return response.json() as Promise<ApiRecord>;
}

async function createMachine(machineRef: string): Promise<number> {
  const body = await devFetch(`${apiBase()}/api/farms/${FARM_ID}/winery-bottling-machines`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ machineRef }),
  });
  return Number((body.record as ApiRecord).id);
}

async function createRun(
  machineId: number,
  lotCode: string,
  notes: string,
): Promise<number> {
  const body = await devFetch(`${apiBase()}/api/farms/${FARM_ID}/winery-bottling`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bottlingDate: `${VINTAGE_YEAR}-08-15`,
      vintageYear: VINTAGE_YEAR,
      batchRef: `${RUN_TAG}-batch`,
      lotCode,
      wineColour: "White",
      volumeBottledLitres: 75,
      bottleSizeMl: 750,
      bottlesProduced: 100,
      casesProduced: 8,
      bottlingMachineId: machineId,
      operatorName: "E2E Operator",
      notes,
    }),
  });
  return Number((body.record as ApiRecord).id);
}

async function waitForFixture(runIds: number[], machineIds: number[]): Promise<void> {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const [runsBody, machinesBody] = await Promise.all([
      devFetch(`${apiBase()}/api/farms/${FARM_ID}/winery-bottling`),
      devFetch(`${apiBase()}/api/farms/${FARM_ID}/winery-bottling-machines`),
    ]);
    const runIdsFound = new Set(
      ((runsBody.records ?? []) as ApiRecord[]).map(record => Number(record.id)),
    );
    const machineIdsFound = new Set(
      ((machinesBody.records ?? []) as ApiRecord[]).map(record => Number(record.id)),
    );
    if (
      runIds.every(id => runIdsFound.has(id)) &&
      machineIds.every(id => machineIdsFound.has(id))
    ) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Seeded bottling fixtures were not readable after retries");
}

async function deleteRun(runId: number): Promise<void> {
  await devFetch(`${apiBase()}/api/farms/${FARM_ID}/winery-bottling/${runId}`, {
    method: "DELETE",
  });
}

async function deleteMachine(machineId: number): Promise<void> {
  await devFetch(`${apiBase()}/api/farms/${FARM_ID}/winery-bottling-machines/${machineId}`, {
    method: "DELETE",
  });
}

async function openBottlingRecords(
  page: Page,
  runIds: number[],
  machineIds: number[],
): Promise<void> {
  await page.route(`**/api/farms/${FARM_ID}/winery-bottling`, async route => {
    const response = await route.fetch();
    const body = await response.json() as ApiRecord;
    const records = ((body.records ?? []) as ApiRecord[])
      .filter(record => runIds.includes(Number(record.id)));
    await route.fulfill({ response, json: { ...body, records } });
  });
  await page.route(`**/api/farms/${FARM_ID}/winery-bottling-machines`, async route => {
    const response = await route.fetch();
    const body = await response.json() as ApiRecord;
    const records = ((body.records ?? []) as ApiRecord[])
      .filter(record => machineIds.includes(Number(record.id)));
    await route.fulfill({ response, json: { ...body, records } });
  });

  await page.goto("/dashboard/");
  await clerk.signIn({ page, emailAddress: getTestUserEmail() });
  await page.waitForLoadState("networkidle");
  await page.evaluate(
    ([slug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "winery-bottling");
      localStorage.setItem(`viticulture-bottling-year-filter-${farmId}`, "all");
      localStorage.removeItem(`bottling-records-signed-filter-${farmId}`);
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.goto("/dashboard/viticulture");
  await expect(page.getByText("Bottling Records", { exact: true }).first()).toBeVisible({
    timeout: 20_000,
  });
}

function bottlingRows(page: Page) {
  return page.locator("tbody tr").filter({ hasText: RUN_TAG });
}

test("machine selection intersects with search and scopes the CSV export", async ({ page }) => {
  const machineIds: number[] = [];
  const runIds: number[] = [];
  const browserErrors: string[] = [];
  page.on("pageerror", error => browserErrors.push(error.message));

  try {
    const machineAId = await createMachine(MACHINE_A);
    const machineBId = await createMachine(MACHINE_B);
    machineIds.push(machineAId, machineBId);

    runIds.push(
      await createRun(machineAId, LOT_A_MATCH, SEARCH_TERM),
      await createRun(machineBId, LOT_B_MATCH, SEARCH_TERM),
      await createRun(machineAId, LOT_A_OTHER, `${RUN_TAG}-different`),
    );
    await waitForFixture(runIds, machineIds);
    await openBottlingRecords(page, runIds, machineIds);

    expect(
      browserErrors.filter(message => /farm|selector/i.test(message)),
      "the populated Viticulture farm must open without a farm-selector runtime error",
    ).toEqual([]);

    const search = page.getByPlaceholder("Batch, lot, wine, operator, notes…");
    await search.fill(SEARCH_TERM);
    await expect(search).toHaveValue(SEARCH_TERM);
    await expect(bottlingRows(page)).toHaveCount(2);
    await expect(page.getByText(LOT_A_MATCH, { exact: true })).toBeVisible();
    await expect(page.getByText(LOT_B_MATCH, { exact: true })).toBeVisible();
    await expect(page.getByText(LOT_A_OTHER, { exact: true })).toHaveCount(0);

    const machineSelect = page.getByRole("combobox").filter({ hasText: "All machines" });
    await machineSelect.click();
    await page.getByRole("option", { name: MACHINE_A, exact: true }).click();

    await expect(search).toHaveValue(SEARCH_TERM);
    await expect(bottlingRows(page)).toHaveCount(1);
    await expect(page.getByText(LOT_A_MATCH, { exact: true })).toBeVisible();
    await expect(page.getByText(LOT_B_MATCH, { exact: true })).toHaveCount(0);

    await page.getByRole("combobox").filter({ hasText: MACHINE_A }).click();
    await page.getByRole("option", { name: "All machines", exact: true }).click();
    await expect(search).toHaveValue(SEARCH_TERM);
    await expect(bottlingRows(page)).toHaveCount(2);

    await page.getByRole("combobox").filter({ hasText: "All machines" }).click();
    await page.getByRole("option", { name: MACHINE_A, exact: true }).click();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export CSV", exact: true }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain(`machine-${MACHINE_A.toLowerCase()}`);
    expect(download.suggestedFilename()).toContain(`search-${SEARCH_TERM.toLowerCase()}`);
    const downloadPath = await download.path();
    if (!downloadPath) throw new Error("CSV download did not produce a local file");
    const csv = fs.readFileSync(downloadPath, "utf8").replace(/^\uFEFF/, "");

    expect(csv).toContain(`Search filter: ${SEARCH_TERM}`);
    expect(csv).toContain(`Machine filter: ${MACHINE_A}`);
    expect(csv).toContain(LOT_A_MATCH);
    expect(csv).not.toContain(LOT_B_MATCH);
    expect(csv).not.toContain(LOT_A_OTHER);
  } finally {
    for (const runId of runIds.reverse()) {
      await deleteRun(runId).catch(() => undefined);
    }
    for (const machineId of machineIds.reverse()) {
      await deleteMachine(machineId).catch(() => undefined);
    }
  }
});