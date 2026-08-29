/**
 * E2E: VineRegisterTab — block-picker reminder toast (Task #1267)
 *
 * Guards the two paths that fire (or suppress) the "Block selection still
 * pending" toast when a dialog is opened while the inline block-change picker
 * is active.
 *
 * Path A — dismiss View dialog
 *   1. Open the block-change picker on a vine-register row.
 *   2. Open the View dialog for that row.
 *   3. Close the View dialog (Close button / Escape).
 *   4. Assert exactly one "Block selection still pending" toast appears.
 *
 * Path B — View → Edit flow
 *   1. Open the block-change picker on a vine-register row.
 *   2. Open the View dialog for that row.
 *   3. Click the Edit button inside the View dialog.
 *   4. Assert no toast fires when the View dialog closes.
 *   5. Close the Edit dialog.
 *   6. Assert exactly one "Block selection still pending" toast appears.
 *
 * Path C — switch viticulture tabs
 *   1. Open the block-change picker on a vine-register row.
 *   2. Switch to the Operations sub-tab.
 *   3. Assert the picker is cleared and the reminder toast appears.
 *
 * The guard lives in:
 *   artifacts/dashboard/src/pages/viticulture/VineRegisterTab.tsx
 *   — pickerWasActive state, skipViewCloseToastRef ref
 *   — handleView, openEdit, View/Edit dialog onOpenChange handlers
 *   — unmount cleanup for tab navigation
 *
 * Data strategy: two vineyard blocks and one vine-register entry are injected
 * via dev-bypass API. All seed data is deleted in a finally block.
 */

import { test, expect } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "fs";
import * as path from "path";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — has viticulture module

/**
 * Unique variety name so we can find the seeded row without relying on
 * position or any pre-existing data.
 */
const VINE_VARIETY = `E2E-1267-${Date.now()}`;

/** Clerk user ID written by global-setup.ts */
function getTestUserId(): string {
  const stateFile = path.join(__dirname, ".test-user-id");
  if (!fs.existsSync(stateFile))
    throw new Error("global-setup did not run — .test-user-id missing");
  return fs.readFileSync(stateFile, "utf-8").trim();
}

// ─── API helpers ──────────────────────────────────────────────────────────────

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

async function apiPost(url: string, body: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-dev-bypass": DEV_BYPASS,
      "x-tenant-slug": TENANT_SLUG,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${url} → ${res.status}: ${await res.text()}`);
  return res.json() as Promise<Record<string, unknown>>;
}

async function apiDelete(url: string): Promise<void> {
  const res = await fetch(url, {
    method: "DELETE",
    headers: { "x-dev-bypass": DEV_BYPASS, "x-tenant-slug": TENANT_SLUG },
  });
  if (!res.ok) throw new Error(`DELETE ${url} → ${res.status}`);
}

/** Create a minimal vineyard block and return its id. */
async function createBlock(blockName: string): Promise<number> {
  const { block } = await apiPost(
    `${apiBase()}/api/farms/${FARM_ID}/vineyard-blocks`,
    { blockName, variety: "Chardonnay" },
  ) as { block: { id: number } };
  return block.id;
}

/** Delete a vineyard block (cascade-deletes its planting record). */
async function deleteBlock(blockId: number): Promise<void> {
  await apiDelete(`${apiBase()}/api/farms/${FARM_ID}/vineyard-blocks/${blockId}`);
}

/** Create a vine-register entry linked to a block and return its id. */
async function createVineRegisterEntry(blockId: number): Promise<number> {
  const { record } = await apiPost(
    `${apiBase()}/api/farms/${FARM_ID}/vine-register`,
    { registeredVariety: VINE_VARIETY, blockId, registeredAreaHa: "0.10" },
  ) as { record: { id: number } };
  return record.id;
}

/** Delete a vine-register entry. */
async function deleteVineRegisterEntry(entryId: number): Promise<void> {
  await apiDelete(`${apiBase()}/api/farms/${FARM_ID}/vine-register/${entryId}`);
}

// ─── Navigation helper ────────────────────────────────────────────────────────

async function navigateToVineRegisterTab(page: import("@playwright/test").Page) {
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");

  // Seed localStorage so the Zustand store pre-selects Highfield Vineyard.
  await page.evaluate(([slug, farmId]) => {
    localStorage.setItem("farmtrac_tenantSlug", slug);
    localStorage.setItem(
      "farmtrac-storage",
      JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
    );
  }, [TENANT_SLUG, FARM_ID] as [string, number]);

  // Hard-reload so the patched fetch + Zustand hydration pick up seeded state.
  await page.reload({ waitUntil: "networkidle" });

  // Navigate to the Viticulture section.
  await page.getByRole("link", { name: /viticulture/i }).click();
  await page.waitForLoadState("networkidle");

  // Click the "Vine Register" sub-tab if it is not already active.
  const vineRegTab = page.getByRole("button", { name: /vine register/i });
  if (await vineRegTab.isVisible({ timeout: 5_000 })) await vineRegTab.click();

  // Reload so the API-injected seed row appears in the query cache.
  await page.reload({ waitUntil: "networkidle" });

  // Re-click the sub-tab after the reload.
  const vineRegTab2 = page.getByRole("button", { name: /vine register/i });
  if (await vineRegTab2.isVisible({ timeout: 5_000 })) await vineRegTab2.click();
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe("VineRegisterTab — block-picker reminder toast", () => {
  /**
   * Path A: dismiss View dialog while picker is active → toast fires once.
   *
   * Regression guard: if the View onOpenChange handler loses its
   * `pickerWasActive && !skipViewCloseToastRef.current` branch, or the
   * branch condition is inverted, this test will fail.
   */
  test("A — dismiss View dialog fires 'Block selection still pending' toast", async ({ page }) => {
    await setupClerkTestingToken({ page, userId: getTestUserId() });

    // ── Seed: two blocks + one vine-register row linked to block A ──────────
    const blockAId = await createBlock(`E2E-1267-A-${Date.now()}`);
    const blockBId = await createBlock(`E2E-1267-B-${Date.now()}`);
    const entryId = await createVineRegisterEntry(blockAId);

    try {
      await navigateToVineRegisterTab(page);

      // ── Find the seeded row in the table ────────────────────────────────
      const row = page.locator("tr", { hasText: VINE_VARIETY });
      await expect(row).toBeVisible({ timeout: 15_000 });

      // ── Open the inline block-change picker ──────────────────────────────
      // The ArrowLeftRight button is opacity-0 until hovered; use force:true.
      const changeBlockBtn = row.getByTitle("Change block link");
      await changeBlockBtn.click({ force: true });

      // Confirm the picker Select (drop-down trigger) is now visible.
      const pickerTrigger = row.locator('[role="combobox"]');
      await expect(pickerTrigger).toBeVisible({
        message: "Inline block-change picker must appear after clicking ArrowLeftRight",
      });

      // ── Open the View dialog via the Eye button (first icon button in row) ─
      // The Eye button is the first size="icon" button rendered by DataTable.
      // It comes before the Edit and Delete buttons.
      const eyeBtn = row.locator("button").first();
      await eyeBtn.click();

      const viewDialog = page.locator('[role="dialog"]').filter({ hasText: "Vine Register Entry" });
      await expect(viewDialog).toBeVisible({
        message: "View dialog must open when the Eye button is clicked",
      });

      // ── Close the View dialog via its Close button ───────────────────────
      await viewDialog.getByRole("button", { name: "Close" }).click();
      await expect(viewDialog).not.toBeVisible();

      // ── Assert the reminder toast fires ─────────────────────────────────
      await expect(page.getByText("Block selection still pending")).toBeVisible({
        timeout: 4_000,
        message: "Toast must fire when the View dialog is dismissed while the picker is active",
      });
    } finally {
      // Clean up seed data in the correct order (entry first, then blocks).
      await deleteVineRegisterEntry(entryId).catch(() => undefined);
      await deleteBlock(blockAId).catch(() => undefined);
      await deleteBlock(blockBId).catch(() => undefined);
    }
  });

  /**
   * Path B: View → Edit flow fires toast only on Edit-close, not View-close.
   *
   * Regression guard: if skipViewCloseToastRef is lost, or the Edit button's
   * onClick stops setting it before calling setViewing(null), the toast fires
   * on View-close (wrong path) instead of Edit-close (correct path).
   */
  test("B — View→Edit flow: no toast on View-close, toast fires on Edit-close", async ({ page }) => {
    await setupClerkTestingToken({ page, userId: getTestUserId() });

    // ── Seed ─────────────────────────────────────────────────────────────────
    const blockAId = await createBlock(`E2E-1267-C-${Date.now()}`);
    const blockBId = await createBlock(`E2E-1267-D-${Date.now()}`);
    const entryId = await createVineRegisterEntry(blockAId);

    try {
      await navigateToVineRegisterTab(page);

      const row = page.locator("tr", { hasText: VINE_VARIETY });
      await expect(row).toBeVisible({ timeout: 15_000 });

      // ── Open the inline block-change picker ──────────────────────────────
      const changeBlockBtn = row.getByTitle("Change block link");
      await changeBlockBtn.click({ force: true });

      const pickerTrigger = row.locator('[role="combobox"]');
      await expect(pickerTrigger).toBeVisible({
        message: "Inline block-change picker must appear after clicking ArrowLeftRight",
      });

      // ── Open the View dialog ─────────────────────────────────────────────
      const eyeBtn = row.locator("button").first();
      await eyeBtn.click();

      const viewDialog = page.locator('[role="dialog"]').filter({ hasText: "Vine Register Entry" });
      await expect(viewDialog).toBeVisible({
        message: "View dialog must open when the Eye button is clicked",
      });

      // ── Click the Edit button inside the View dialog ──────────────────────
      // This sets skipViewCloseToastRef = true, then calls openEdit + setViewing(null).
      await viewDialog.getByRole("button", { name: "Edit" }).click();

      // The View dialog must close immediately.
      await expect(viewDialog).not.toBeVisible({
        message: "View dialog must close after clicking Edit",
      });

      // ── Assert NO toast fires while View closes / Edit opens ──────────────
      // Give React one render cycle to settle before checking.
      await page.waitForTimeout(500);
      await expect(page.getByText("Block selection still pending")).not.toBeVisible({
        message: "Toast must NOT fire when View dialog closes via the Edit button",
      });

      // ── Edit dialog must now be open ─────────────────────────────────────
      const editDialog = page
        .locator('[role="dialog"]')
        .filter({ hasText: /Edit Vine Register Entry/i });
      await expect(editDialog).toBeVisible({
        message: "Edit dialog must open after clicking Edit in the View dialog",
      });

      // ── Close the Edit dialog ─────────────────────────────────────────────
      // Press Escape — equivalent to the user dismissing without saving.
      await page.keyboard.press("Escape");
      await expect(editDialog).not.toBeVisible();

      // ── Assert the reminder toast fires on Edit-close ─────────────────────
      await expect(page.getByText("Block selection still pending")).toBeVisible({
        timeout: 4_000,
        message: "Toast must fire when the Edit dialog is dismissed while the picker is active",
      });
    } finally {
      await deleteVineRegisterEntry(entryId).catch(() => undefined);
      await deleteBlock(blockAId).catch(() => undefined);
      await deleteBlock(blockBId).catch(() => undefined);
    }
  });

  /**
   * Path C: switching viticulture tabs while the picker is active → toast fires
   * and the inline picker is no longer present after VineRegisterTab unmounts.
   */
  test("C — switching tabs while picker is active fires toast and clears picker", async ({ page }) => {
    await setupClerkTestingToken({ page, userId: getTestUserId() });

    const blockAId = await createBlock(`E2E-1267-E-${Date.now()}`);
    const blockBId = await createBlock(`E2E-1267-F-${Date.now()}`);
    const entryId = await createVineRegisterEntry(blockAId);

    try {
      await navigateToVineRegisterTab(page);

      const row = page.locator("tr", { hasText: VINE_VARIETY });
      await expect(row).toBeVisible({ timeout: 15_000 });

      const changeBlockBtn = row.getByTitle("Change block link");
      await changeBlockBtn.click({ force: true });

      const pickerTrigger = row.locator('[role="combobox"]');
      await expect(pickerTrigger).toBeVisible({
        message: "Inline block-change picker must appear before switching tabs",
      });

      await page.getByRole("button", { name: /pruning & canopy/i }).click();

      await expect(page.getByText("Block selection still pending")).toBeVisible({
        timeout: 4_000,
        message: "Switching viticulture tabs must remind the grower about the pending block change",
      });
      await expect(pickerTrigger).not.toBeVisible({
        message: "The block-change picker must be cleared when Vine Register unmounts",
      });
    } finally {
      await deleteVineRegisterEntry(entryId).catch(() => undefined);
      await deleteBlock(blockAId).catch(() => undefined);
      await deleteBlock(blockBId).catch(() => undefined);
    }
  });
});
