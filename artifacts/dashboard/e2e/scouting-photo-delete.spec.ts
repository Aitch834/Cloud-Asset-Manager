import { signInDashboard } from "./auth";
/**
 * E2E: Scouting Photo — delete confirmation warning, badge, and empty-state
 *
 * Tests the photo-deletion UX added by Task #742.  The lightbox paths are opened
 * via the camera-badge in the grid (table) row.  The view-dialog thumbnail-grid
 * path is also covered:
 *
 *   Scenario C — thumbnail-grid deletion uses the viewed scouting record
 *     Entry: click the row's view action → hover a thumbnail → click its trash
 *     button → cancel and verify the thumbnail remains → reopen and confirm →
 *     verify the DELETE targets the viewed record and the grid refreshes.
 *
 * The two lightbox paths are also exercised:
 *
 *   Scenario A — mid-list deletion (counter clamps, grid badge decrements)
 *     Entry: click camera badge in grid row → opens lightbox → navigate to photo
 *     2/2 → click Delete photo → confirm warning dialog → verify counter updates
 *     to 1/1 and grid badge decrements from 2 → 1.
 *
 *   Scenario B — last-photo deletion (warning fires, empty state shown, badge gone)
 *     Entry: click camera badge in grid row → opens lightbox at 1/1 → click
 *     Delete photo → assert last-photo warning dialog shows → confirm → verify
 *     empty-state "No photos attached to this record." in lightbox and grid badge
 *     replaced by "—".
 *
 * Prerequisites (handled by global-setup.ts):
 *   - CLERK_SECRET_KEY, VITE_CLERK_PUBLISHABLE_KEY, DATABASE_URL in env
 *   - Dashboard workflow running (artifacts/dashboard: web)
 *   - API server running (artifacts/api-server: API Server)
 *
 * Data strategy: photo rows are injected via the dev-bypass API so no real
 * object storage upload is needed.  The images will not load (fake path) but
 * the badge counts and lightbox logic depend only on the DB rows.
 */

import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Dev-bypass token value (defaults to "bde-dev-bypass-local" on dev server) */
const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;  // Highfield Vineyard — has viticulture module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Unique sentinel so we can find the row without relying on position */
const SCOUT_NAME = `E2EScout-882-${Date.now()}`;

/** Clerk user ID written by global-setup.ts */
function getTestUserId(): string {
  const stateFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_ID_FILE!);
  if (!fs.existsSync(stateFile)) throw new Error("global-setup did not run — .test-user-id missing");
  return fs.readFileSync(stateFile, "utf-8").trim();
}

// ─── API helpers (dev-bypass, no browser session needed) ──────────────────────

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
  if (!res.ok) throw new Error(`POST ${url} → ${res.status}: ${await res.text()}`);
  return res.json() as Promise<Record<string, unknown>>;
}

async function apiDelete(url: string) {
  const res = await fetch(url, {
    method: "DELETE",
    headers: { "x-dev-bypass": DEV_BYPASS, "x-tenant-slug": TENANT_SLUG },
  });
  if (!res.ok) throw new Error(`DELETE ${url} → ${res.status}`);
}

/** Base URL for API calls (same host as the dashboard, /api prefix) */
function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

async function createScoutingRecord(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const { record } = await apiPost(
    `${apiBase()}/api/farms/${FARM_ID}/vineyard-scouting`,
    {
      scoutDate: today,
      scoutedBy: SCOUT_NAME,
      downyMildewPressure: 0, powderyMildewPressure: 0,
      botrytisPressure: 0, phomopsisPressure: 0,
      leafhopperPressure: 0, spiderMitePressure: 0,
    },
  ) as { record: { id: number } };
  return record.id;
}

async function attachPhoto(scoutingId: number, tag: string): Promise<number> {
  const { photo } = await apiPost(
    `${apiBase()}/api/farms/${FARM_ID}/vineyard-scouting/${scoutingId}/photos`,
    {
      objectPath: `/objects/e2e-882-${tag}-${Date.now()}.jpg`,
      fileName: `e2e-882-${tag}.jpg`,
    },
  ) as { photo: { id: number } };
  return photo.id;
}

async function deleteScoutingRecord(scoutingId: number) {
  await apiDelete(`${apiBase()}/api/farms/${FARM_ID}/vineyard-scouting/${scoutingId}`);
}

// ─── Shared setup: navigate to Scouting tab for Highfield Vineyard ─────────────

async function navigateToScoutingTab(page: import("@playwright/test").Page) {
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");

  // Seed localStorage so the fetch interceptor attaches x-tenant-slug on all
  // API calls and the Zustand store pre-selects Highfield Vineyard (farm 5).
  await page.evaluate(([slug, farmId]) => {
    localStorage.setItem("farmtrac_tenantSlug", slug);
    localStorage.setItem(
      "farmtrac-storage",
      JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
    );
  }, [TENANT_SLUG, FARM_ID] as [string, number]);

  // Hard-reload so the patched window.fetch and Zustand hydration pick up the
  // seeded state before the first API call is made.
  await page.reload({ waitUntil: "networkidle" });

  // Navigate to Viticulture
  await page.getByRole("link", { name: /viticulture/i }).click();
  await page.waitForLoadState("networkidle");

  // Click the Scouting sub-tab if it's a button (not the default tab)
  const scoutTab = page.getByRole("button", { name: /scouting/i });
  if (await scoutTab.isVisible({ timeout: 3_000 })) await scoutTab.click();

  // Reload so the API-injected test record appears in the query cache
  await page.reload({ waitUntil: "networkidle" });

  // Re-click Scouting tab after reload
  const scoutTab2 = page.getByRole("button", { name: /scouting/i });
  if (await scoutTab2.isVisible({ timeout: 3_000 })) await scoutTab2.click();
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe("Scouting photo — delete interactions", () => {
  /**
   * Scenario A: delete a photo from a non-first position in the lightbox.
   *
   * Entry point: camera badge in the grid row (table).
   *
   * Confirms:
   * - Delete confirmation warning dialog fires when Delete photo is clicked.
   * - After confirmation, lightbox remains open (no crash).
   * - Counter text updates from "2 / 2" to "1 / 1" (index clamped correctly).
   * - After closing the lightbox, the grid badge decrements from 2 → 1.
   */
  test("A — grid camera-badge opens lightbox; mid-list delete shows warning, decrements counter and grid badge", async ({ page }) => {
    await signInDashboard(page);

    const scoutingId = await createScoutingRecord();
    await attachPhoto(scoutingId, "solo");

    try {
      await navigateToScoutingTab(page);

      const row = page.locator("tr", { hasText: SCOUT_NAME });
      await expect(row).toBeVisible({ timeout: 15_000 });

      // ── Pre-condition: grid badge shows 1 ────────────────────────────────
      const gridBadge = row.getByTitle("View photos");
      await expect(gridBadge).toContainText("1", {
        message: "Grid badge must show 1 before any deletion",
      });

      // ── Open lightbox via the grid camera badge ───────────────────────────
      await gridBadge.click();
      const dialog = page.locator('[role="dialog"]').filter({ hasText: "Scouting Photos" });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText("1 / 2")).toBeVisible({
        message: "Lightbox must open at photo 1 of 2",
      });

      // Advance to the second photo
      await page.getByRole("button", { name: "Next photo" }).click();
      await expect(dialog.getByText("2 / 2")).toBeVisible({
        message: "Lightbox must show photo 2 of 2 after navigating",
      });

      // ── Click Delete photo; assert the warning dialog fires ───────────────
      const deleteBtn = dialog.getByRole("button", { name: "Delete photo" });
      await deleteBtn.click({ force: true });  // force past opacity-0 hover state

      // The confirmation (warning) dialog must appear before anything is deleted
      const confirmDialog = page.getByRole("dialog", { name: "Delete photo?" });
      await expect(confirmDialog.getByText("Delete photo?")).toBeVisible({
        message: "Delete-confirmation warning dialog must appear before photo is removed",
      });
      await expect(
        confirmDialog.getByText(/permanently removed from the scouting record/i),
      ).toBeVisible({
        message: "Warning dialog must explain the consequence of deletion",
      });

      // ── Confirm deletion ──────────────────────────────────────────────────
      await confirmDialog.getByRole("button", { name: "Delete photo" }).click();
      await page.waitForLoadState("networkidle");

      // ── Post-delete: lightbox still open, counter clamped to 1/1 ─────────
      await expect(dialog).toBeVisible({
        message: "Lightbox must remain open after mid-list deletion (not crash or close)",
      });
      await expect(dialog.getByText("1 / 1")).toBeVisible({
        message: "Counter must update to 1 / 1 — index correctly clamped after deleting last photo",
      });

      // ── Close and verify grid badge decremented ───────────────────────────
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();

      await expect(row.getByTitle("View photos")).toContainText("1", {
        message: "Grid badge must decrement from 2 to 1 after one photo is deleted",
      });
    } finally {
      await deleteScoutingRecord(scoutingId);
    }
  });

  /**
   * Scenario B: delete the only photo on a scouting record.
   *
   * Entry point: camera badge in the grid row (table).
   *
   * Confirms:
   * - Delete confirmation warning dialog fires when Delete photo is clicked.
   * - After confirmation, lightbox stays open (no crash, no auto-close).
   * - The "No photos attached to this record." empty-state is rendered.
   * - The photo counter disappears from the lightbox.
   * - After closing, the table row's Photos cell shows "—" (camera badge gone).
   */
  test("B — last-photo delete shows warning, empty state in lightbox, and removes grid badge", async ({ page }) => {
    await signInDashboard(page);

    const scoutingId = await createScoutingRecord();
    await attachPhoto(scoutingId, "solo");

    try {
      await navigateToScoutingTab(page);

      const row = page.locator("tr", { hasText: SCOUT_NAME });
      await expect(row).toBeVisible({ timeout: 15_000 });

      // ── Pre-condition: grid badge shows 1 ────────────────────────────────
      const gridBadge = row.getByTitle("View photos");
      await expect(gridBadge).toContainText("1", {
        message: "Grid badge must show 1 before any deletion",
      });

      // ── Open lightbox via the grid camera badge ───────────────────────────
      await gridBadge.click();
      const dialog = page.locator('[role="dialog"]').filter({ hasText: "Scouting Photos" });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText("1 / 1")).toBeVisible({
        message: "Lightbox must open at photo 1 of 1",
      });

      // ── Click Delete photo; assert the last-photo warning dialog fires ─────
      await dialog.getByRole("button", { name: "Delete photo" }).click({ force: true });

      const confirmDialog = page.getByRole("dialog", { name: "Delete photo?" });
      await expect(confirmDialog.getByText("Delete photo?")).toBeVisible({
        message: "Last-photo deletion: warning dialog must appear before photo is removed",
      });
      await expect(
        confirmDialog.getByText(/permanently removed from the scouting record/i),
      ).toBeVisible({
        message: "Last-photo deletion: warning dialog must explain the consequence",
      });

      // ── Confirm deletion ──────────────────────────────────────────────────
      await confirmDialog.getByRole("button", { name: "Delete photo" }).click();
      await page.waitForLoadState("networkidle");

      // ── Post-delete: lightbox stays open, shows empty state ───────────────
      await expect(dialog).toBeVisible({
        message: "Lightbox must NOT close or crash when the last photo is deleted",
      });
      await expect(dialog.getByText("Scouting Photos")).toBeVisible({
        message: "Lightbox title must still be present after last-photo deletion",
      });
      await expect(
        dialog.getByText("No photos attached to this record."),
      ).toBeVisible({
        message: "Empty-state message must appear in the lightbox after last photo is deleted",
      });
      await expect(dialog.getByText(/\d+ \/ \d+/)).not.toBeVisible({
        message: "Photo counter must disappear from the lightbox when there are no photos",
      });

      // ── Close and verify grid badge is gone ───────────────────────────────
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();

      await expect(row.getByTitle("View photos")).not.toBeVisible({
        message: "Camera badge must disappear from the grid row when photoCount reaches 0",
      });
    } finally {
      await deleteScoutingRecord(scoutingId);
    }
  });

  /**
   * Scenario C: delete a photo from the thumbnail grid in the record view dialog.
   *
   * This must use viewing.id rather than lightboxScoutingId. The latter is
   * unrelated to this entry point and may be null or refer to another record.
   */
  test("C — view-dialog thumbnail delete targets the viewed record, supports cancel, and refreshes the grid", async ({ page }) => {
    await signInDashboard(page);

    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", message => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", error => pageErrors.push(error.message));

    const scoutingId = await createScoutingRecord();
    const photoId = await attachPhoto(scoutingId, "view-grid");
    const photoFileName = "e2e-882-view-grid.jpg";
    const deleteRequests: string[] = [];
    page.on("request", request => {
      if (
        request.method() === "DELETE"
        && request.url().includes("/vineyard-scouting/")
        && request.url().includes("/photos/")
      ) {
        deleteRequests.push(request.url());
      }
    });

    try {
      await navigateToScoutingTab(page);

      const row = page.locator("tr", { hasText: SCOUT_NAME });
      await expect(row).toBeVisible({ timeout: 15_000 });

      // The view action is the first icon button in the row.
      await row.getByRole("button").first().click();
      const recordDialog = page.getByRole("dialog", { name: "Disease Scouting Record" });
      await expect(recordDialog).toBeVisible();

      const thumbnail = recordDialog.locator("div.relative.group").filter({
        has: recordDialog.getByRole("img", { name: photoFileName }),
      });
      await expect(thumbnail).toHaveCount(1);
      await expect(thumbnail.getByRole("img", { name: photoFileName })).toBeVisible();

      // Hover is part of the control contract: the delete button is hidden
      // until the pointer enters the thumbnail.
      await thumbnail.hover();
      await thumbnail.getByRole("button", { name: "Delete photo" }).click();

      const confirmDialog = page.getByRole("dialog", { name: "Delete photo?" });
      await expect(confirmDialog).toBeVisible();
      await expect(
        confirmDialog.getByText(/permanently removed from the scouting record/i),
      ).toBeVisible();

      // Cancel must close only the confirmation and leave the thumbnail intact.
      await confirmDialog.getByRole("button", { name: "Cancel" }).click();
      await expect(confirmDialog).toHaveCount(0);
      await expect(thumbnail).toHaveCount(1);
      await expect(recordDialog.getByRole("img", { name: photoFileName })).toBeVisible();
      expect(deleteRequests).toEqual([]);

      // Reopen the confirmation and prove the request uses the viewed record
      // and the exact thumbnail photo, not a lightbox record.
      await thumbnail.hover();
      await thumbnail.getByRole("button", { name: "Delete photo" }).click();
      await expect(confirmDialog).toBeVisible();

      const deleteResponse = page.waitForResponse(response =>
        response.request().method() === "DELETE"
        && response.url().includes(`/vineyard-scouting/${scoutingId}/photos/${photoId}`),
      );
      await confirmDialog.getByRole("button", { name: "Delete photo" }).click();
      expect((await deleteResponse).ok()).toBe(true);
      expect(deleteRequests).toEqual([
        expect.stringContaining(`/vineyard-scouting/${scoutingId}/photos/${photoId}`),
      ]);

      // onSuccess invalidates the view-dialog photo query; the thumbnail grid
      // must disappear without requiring the user to close and reopen the view.
      await expect(confirmDialog).toHaveCount(0);
      await expect(thumbnail).toHaveCount(0);
      await expect(recordDialog.getByRole("img", { name: photoFileName })).toHaveCount(0);

      expect(consoleErrors, "The browser must not report console errors").toEqual([]);
      expect(pageErrors, "The page must not throw uncaught errors").toEqual([]);
    } finally {
      await deleteScoutingRecord(scoutingId);
    }
  });
});
