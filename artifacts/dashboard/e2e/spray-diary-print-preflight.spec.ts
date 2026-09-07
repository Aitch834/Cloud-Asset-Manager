import { signInDashboard } from "./auth";
/**
 * E2E: Spray Diary — print pre-flight dialog
 *
 * Confirms the Radix Dialog that guards against printing unlinked spray records
 * actually mounts in the browser, that both action buttons work, and that the
 * dialog is skipped entirely when no unlinked records are present in the print
 * set.
 *
 * Five scenarios:
 *
 *   A — Clicking Print with an unlinked record in the print set opens the
 *       pre-flight dialog (title "record isn't linked to a block" visible).
 *
 *   B — Clicking "Link first" in the pre-flight dialog closes it and opens the
 *       bulk-link dialog.
 *
 *   C — A failed bulk-link PUT keeps the dialog open and displays its inline
 *       mutation error.
 *
 *   D — Clicking "Print anyway" in the pre-flight dialog calls window.open()
 *       (the print popup appears / a new page/popup is emitted).
 *
 *   E — When the print-block filter is set to a block that has only linked
 *       records, clicking Print skips the dialog entirely and goes straight to
 *       printing.
 *
 * Prerequisites (handled by global-setup.ts):
 *   - CLERK_SECRET_KEY, VITE_CLERK_PUBLISHABLE_KEY, DATABASE_URL in env
 *   - Dashboard workflow running (artifacts/dashboard: web)
 *   - API server running (artifacts/api-server: API Server)
 *
 * Data strategy: spray diary rows are injected and torn down via the dev-bypass
 * API so the test is hermetic and does not rely on pre-existing data.
 */

import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — has viticulture module

/** Unique sentinel so we can locate our injected rows without relying on position */
const PRODUCT_TAG = `E2EPrint-1274-${Date.now()}`;

/** Clerk user ID written by global-setup.ts */
function getTestUserId(): string {
  const stateFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_ID_FILE!);
  if (!fs.existsSync(stateFile))
    throw new Error("global-setup did not run — .test-user-id missing");
  return fs.readFileSync(stateFile, "utf-8").trim();
}

// ─── API helpers ─────────────────────────────────────────────────────────────

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

async function apiPost(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-dev-bypass": DEV_BYPASS,
      "x-tenant-slug": TENANT_SLUG,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok)
    throw new Error(`POST ${url} → ${res.status}: ${await res.text()}`);
  return res.json() as Promise<Record<string, unknown>>;
}

async function apiDelete(url: string) {
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "x-dev-bypass": DEV_BYPASS,
      "x-tenant-slug": TENANT_SLUG,
    },
  });
  if (!res.ok) throw new Error(`DELETE ${url} → ${res.status}`);
}

/** Create a spray diary record.  Pass blockId: null for an unlinked record. */
async function createSprayRecord(blockId: number | null): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const { record } = (await apiPost(
    `${apiBase()}/api/farms/${FARM_ID}/vineyard-spray-diary`,
    {
      applicationDate: today,
      productName: PRODUCT_TAG,
      blockId,
    },
  )) as { record: { id: number } };
  return record.id;
}

async function deleteSprayRecord(id: number) {
  await apiDelete(
    `${apiBase()}/api/farms/${FARM_ID}/vineyard-spray-diary/${id}`,
  );
}

async function getFirstVineyardBlock(): Promise<{ id: number; blockName: string }> {
  const res = await fetch(
    `${apiBase()}/api/farms/${FARM_ID}/vineyard-blocks`,
    {
      headers: {
        "x-dev-bypass": DEV_BYPASS,
        "x-tenant-slug": TENANT_SLUG,
      },
    },
  );
  if (!res.ok)
    throw new Error(`GET vineyard-blocks → ${res.status}`);
  const body = (await res.json()) as {
    blocks: { id: number; blockName: string }[];
  };
  const firstBlock = body.blocks?.[0];
  if (!firstBlock)
    throw new Error("No vineyard blocks found on farm 5 — test cannot run");
  return firstBlock;
}

// ─── Navigation helper ────────────────────────────────────────────────────────

async function navigateToSprayDiaryTab(page: import("@playwright/test").Page) {
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");

  // Seed localStorage so the fetch interceptor attaches x-tenant-slug on all
  // API calls and the Zustand store pre-selects Highfield Vineyard (farm 5).
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

  // Hard-reload so the patched window.fetch and Zustand hydration pick up the
  // seeded state before the first API call is made.
  await page.reload({ waitUntil: "networkidle" });

  // Navigate to Viticulture
  await page.getByRole("link", { name: /viticulture/i }).click();
  await page.waitForLoadState("networkidle");

  // Click the Spray Diary sub-tab if it is not already active
  const sprayTab = page.getByRole("button", { name: /spray diary/i });
  if (await sprayTab.isVisible({ timeout: 3_000 })) await sprayTab.click();

  // Reload so the API-injected test record appears in the query cache
  await page.reload({ waitUntil: "networkidle" });

  // Re-click Spray Diary tab after reload
  const sprayTab2 = page.getByRole("button", { name: /spray diary/i });
  if (await sprayTab2.isVisible({ timeout: 3_000 })) await sprayTab2.click();
}

/** Find the Print button in the Spray Diary toolbar. */
function printButton(page: import("@playwright/test").Page) {
  // The toolbar has exactly one "Print" button (CSV and Diary Export are
  // labelled differently).
  return page.getByRole("button", { name: /^print$/i }).or(
    page.locator("button", { hasText: /^print$/i }),
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe("Spray Diary — print pre-flight dialog", () => {
  /**
   * Scenario A — Pre-flight dialog appears when an unlinked record is in the
   * print set.
   */
  test("A — clicking Print with an unlinked record opens the pre-flight dialog", async ({
    page,
  }) => {
    await signInDashboard(page);

    // Inject an unlinked spray record (blockId: null)
    const sprayId = await createSprayRecord(null);

    try {
      await navigateToSprayDiaryTab(page);

      const row = page.locator("tr", { hasText: PRODUCT_TAG });
      await expect(row).toBeVisible({ timeout: 15_000 });

      // Switch the year filter to "All years" so the row is definitely included
      const yearTrigger = page.locator("button[role='combobox']", {
        hasText: /^\d{4}$|^all years$/i,
      });
      // If the trigger shows a specific year, open and pick "All years"
      if (await yearTrigger.isVisible({ timeout: 2_000 })) {
        const triggerText = await printBlockTrigger.textContent();
        if (triggerText && /^\d{4}$/.test(triggerText.trim())) {
          await yearTrigger.click();
          await page.getByRole("option", { name: /all years/i }).click();
        }
      }

      // Ensure the "Print: all blocks" filter is active so unlinked records
      // are included in printRows.
      const printBlockTrigger = page.locator("button[role='combobox']", {
        hasText: /print:/i,
      });
      if (await printBlockTrigger.isVisible({ timeout: 2_000 })) {
        const triggerText = await printBlockTrigger.textContent();
        if (triggerText && !/all blocks/i.test(triggerText)) {
          await printBlockTrigger.click();
          await page
            .getByRole("option", { name: /print: all blocks/i })
            .click();
        }
      }

      // Click the Print button
      const btn = printButton(page);
      await expect(btn).toBeEnabled({ timeout: 5_000 });
      await btn.click();

      // The pre-flight dialog must appear
      const dialog = page
        .locator('[role="dialog"]')
        .filter({ hasText: /record.*isn't linked to a block/i });
      await expect(dialog).toBeVisible({
        timeout: 5_000,
        message: "Pre-flight dialog must mount when unlinked records are in the print set",
      });

      // The dialog title must describe the unlinked count
      await expect(
        dialog.getByText(/record isn't linked to a block/i),
      ).toBeVisible({
        message: "Dialog title must say how many records aren't linked",
      });

      // The dialog body must explain the consequence
      await expect(
        dialog.getByText(/without a block name in the printed report/i),
      ).toBeVisible({
        message: "Dialog description must warn that records will print without a block name",
      });

      // Both action buttons must be present
      await expect(
        dialog.getByRole("button", { name: /link first/i }),
      ).toBeVisible({ message: '"Link first" button must be visible in the pre-flight dialog' });
      await expect(
        dialog.getByRole("button", { name: /print anyway/i }),
      ).toBeVisible({ message: '"Print anyway" button must be visible in the pre-flight dialog' });

      // Close the dialog (Escape) before the next scenario
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
    } finally {
      await deleteSprayRecord(sprayId);
    }
  });

  /**
   * Scenario B — "Link first" dismisses the pre-flight dialog and opens the
   * bulk-link dialog.
   */
  test('B — "Link first" closes the pre-flight dialog and opens the bulk-link dialog', async ({
    page,
  }) => {
    await signInDashboard(page);

    const sprayId = await createSprayRecord(null);

    try {
      await navigateToSprayDiaryTab(page);

      const row = page.locator("tr", { hasText: PRODUCT_TAG });
      await expect(row).toBeVisible({ timeout: 15_000 });

      await printButton(page).click();

      const preflightDialog = page
        .locator('[role="dialog"]')
        .filter({ hasText: /record.*isn't linked to a block/i });
      await expect(preflightDialog).toBeVisible({ timeout: 5_000 });
      await preflightDialog.getByRole("button", { name: /link first/i }).click();

      const bulkDialog = page
        .locator('[role="dialog"]')
        .filter({ hasText: /link unlinked spray records/i });
      await expect(bulkDialog).toBeVisible({
        timeout: 5_000,
        message: 'Bulk-link dialog must open after clicking "Link first"',
      });

      // The injected product name must appear in the bulk-link list
      await expect(bulkDialog.getByText(PRODUCT_TAG)).toBeVisible({
        message: "Injected unlinked record must appear in the bulk-link dialog",
      });

      // Close the bulk-link dialog
      await page.keyboard.press("Escape");
      await expect(bulkDialog).not.toBeVisible();
    } finally {
      await deleteSprayRecord(sprayId);
    }
  });

  /**
   * Scenario C — a failed bulk-link save keeps the dialog open and renders the
   * inline DialogMutationError instead of leaving the user with only a toast.
   */
  test("C — failed bulk-link save keeps the dialog open and shows an inline error", async ({
    page,
  }) => {
    await signInDashboard(page);

    const firstBlock = blocksBody.blocks?.[0];
    const sprayId = await createSprayRecord(null);

    try {
      await navigateToSprayDiaryTab(page);

      const row = page.locator("tr", { hasText: PRODUCT_TAG });
      await expect(row).toBeVisible({ timeout: 15_000 });

      await printButton(page).click();

      const preflightDialog = page
        .locator('[role="dialog"]')
        .filter({ hasText: /record.*isn't linked to a block/i });
      await expect(preflightDialog).toBeVisible({ timeout: 5_000 });
      await preflightDialog.getByRole("button", { name: /link first/i }).click();

      const bulkDialog = page
        .locator('[role="dialog"]')
        .filter({ hasText: /link unlinked spray records/i });
      await expect(bulkDialog).toBeVisible({ timeout: 5_000 });

      // Choose a real block so the Save button sends a PUT for the injected row.
      const injectedRecord = bulkDialog
        .getByText(PRODUCT_TAG, { exact: true })
        .locator("..");
      await injectedRecord.getByRole("combobox").click();
      await page
        .getByRole("option")
        .filter({ hasText: firstBlock.blockName })
        .first()
        .click();

      // Fail the actual link request.  The mutation should reject, not close the
      // dialog, so growers can see the error and retry.
      let intercepted = false;
      await page.route(
        `**/api/farms/${FARM_ID}/vineyard-spray-diary/${sprayId}`,
        async route => {
          intercepted = true;
          await route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({ error: "Forced e2e failure" }),
          });
        },
      );

      await bulkDialog.getByRole("button", { name: /^save 1 link$/i }).click();

      await expect.poll(
        () => intercepted,
        { message: "Bulk-link Save must issue the record PUT request" },
      ).toBe(true);
      await expect(bulkDialog).toBeVisible({
        message: "Bulk-link dialog must stay open after a failed save",
      });
      await expect(
        bulkDialog.getByTestId("dialog-error"),
      ).toBeVisible({
        message: "Failed bulk-link save must render the inline dialog error",
      });
      await expect(
        bulkDialog.getByText(/some links could not be saved/i),
      ).toBeVisible();
    } finally {
      await page.unroute(
        `**/api/farms/${FARM_ID}/vineyard-spray-diary/${sprayId}`,
      );
      await deleteSprayRecord(sprayId);
    }
  });

  /**
   * Scenario D — "Print anyway" causes window.open() to fire (a new popup /
   * page is opened by the print helper).
   */
  test('"Print anyway" triggers a print popup (window.open is called)', async ({
    page,
  }) => {
    await signInDashboard(page);

    const sprayId = await createSprayRecord(null);

    try {
      await navigateToSprayDiaryTab(page);

      const row = page.locator("tr", { hasText: PRODUCT_TAG });
      await expect(row).toBeVisible({ timeout: 15_000 });

      await printButton(page).click();

      const preflightDialog = page
        .locator('[role="dialog"]')
        .filter({ hasText: /record.*isn't linked to a block/i });
      await expect(preflightDialog).toBeVisible({ timeout: 5_000 });

      // Listen for the popup that printSprayRecords opens via window.open()
      const popupPromise = page.waitForEvent("popup", { timeout: 10_000 });

      // Click "Print anyway"
      await preflightDialog
        .getByRole("button", { name: /print anyway/i })
        .click();

      // Pre-flight dialog must close
      await expect(preflightDialog).not.toBeVisible({
        message: "Pre-flight dialog must close after clicking Print anyway",
      });

      // The print popup must appear (printSprayRecords opens a new window)
      const popup = await popupPromise;
      expect(popup).toBeTruthy();
      await popup.close();
    } finally {
      await deleteSprayRecord(sprayId);
    }
  });

  /**
   * Scenario E — When the print-block filter is scoped to a specific block that
   * has only linked records, clicking Print skips the dialog entirely.
   *
   * Strategy: inject a record that IS linked to a block, then set the
   * printBlockFilter to that block's ID.  With only linked records in printRows
   * the guard condition `printRows.some(r => !r.blockId)` is false, so the
   * dialog must not mount.
   */
  test("D — clicking Print with all-linked print set skips the dialog entirely", async ({
    page,
  }) => {
    await signInDashboard(page);

    // We need to know a block ID that exists on this farm.  Fetch one via the
    // API before injecting the linked spray record.
    const blocksRes = await fetch(
      `${apiBase()}/api/farms/${FARM_ID}/vineyard-blocks`,
      {
        headers: {
          "x-dev-bypass": DEV_BYPASS,
          "x-tenant-slug": TENANT_SLUG,
        },
      },
    );
    if (!blocksRes.ok)
      throw new Error(`GET vineyard-blocks → ${blocksRes.status}`);
    const blocksBody = (await blocksRes.json()) as {
      blocks: { id: number; blockName: string }[];
    };
    const firstBlock = blocksBody.blocks?.[0];
    if (!firstBlock)
      throw new Error("No vineyard blocks found on farm 5 — test cannot run");

    const linkedId = await createSprayRecord(firstBlock.id);
    const unlinkedId = await createSprayRecord(null);

    try {
      await navigateToSprayDiaryTab(page);

      const linkedRow = page.locator("tr", { hasText: PRODUCT_TAG });
      await expect(linkedRow.first()).toBeVisible({ timeout: 15_000 });

      // Set the print-block filter to firstBlock so only linked records appear
      // in printRows (the unlinked record has blockId: null and will not match
      // String(null) === String(firstBlock.id)).
      const printBlockTrigger = page.locator("button[role='combobox']", {
        hasText: /print:/i,
      });
      if (await printBlockTrigger.isVisible({ timeout: 3_000 })) {
        await printBlockTrigger.click();
        // Pick the specific block by name
        const blockOption = page
          .getByRole("option")
          .filter({ hasText: firstBlock.blockName });
        if (await blockOption.isVisible({ timeout: 2_000 })) {
          await blockOption.click();
        }
      }

      // Listen for the popup (direct print — no dialog)
      const popupPromise = page.waitForEvent("popup", { timeout: 10_000 });

      // Click Print
      const btn = printButton(page);
      await expect(btn).toBeEnabled({ timeout: 5_000 });
      await btn.click();

      // The pre-flight dialog must NOT appear
      const preflightDialog = page
        .locator('[role="dialog"]')
        .filter({ hasText: /record.*isn't linked to a block/i });
      await expect(preflightDialog).not.toBeVisible({
        timeout: 2_000,
        message:
          "Pre-flight dialog must NOT appear when all print-set records are linked to a block",
      });

      // The print popup must appear immediately (dialog was skipped)
      const popup = await popupPromise;
      expect(popup).toBeTruthy();
      await popup.close();
    } finally {
      await deleteSprayRecord(linkedId);
      await deleteSprayRecord(unlinkedId);
    }
  });
});
