/**
 * E2E: Overview chip count updates immediately after unlink
 *
 * Verifies that when a scouting or spray-diary record is unlinked from its
 * block on the respective tab, navigating back to the Overview tab immediately
 * reflects the incremented unlinked count (chip appears or counter rises by 1)
 * — without a full page reload.
 *
 * The test exercises the TanStack Query cache refresh that both unlinkMutation
 * onSuccess handlers perform:
 *   • ScoutingTab   → refetchQueries(["vineyard-scouting",  farmId])
 *   • SprayDiaryTab → refetchQueries(["vineyard-spray-diary", farmId])
 *
 * Both query keys are shared with OverviewTab's useCrud calls, so the chip
 * count in UnlinkedRecordsBar must update immediately on SPA tab switch.
 *
 * Authentication — correct order
 * ───────────────────────────────
 * @clerk/testing/playwright's `clerk.signIn()` is the correct API for
 * programmatic sign-in. It:
 *   1. Internally calls setupClerkTestingToken (CAPTCHA bypass via context.route)
 *   2. Waits for window.Clerk to load on the current page
 *   3. Creates a sign-in token via the Clerk Backend API (uses CLERK_SECRET_KEY)
 *   4. Evaluates window.Clerk sign-in via ticket strategy
 *   5. Waits for window.Clerk.user !== null
 *
 * So the page MUST be navigated first (so window.Clerk is loaded), then
 * clerk.signIn() is called. After that, Clerk stores the session in browser
 * storage, and subsequent reloads preserve the session.
 *
 * Tab navigation
 * ──────────────
 * usePersistedTab reads `viticulture-active-tab-${farmId}` on first mount.
 * We pre-set this key in localStorage before each reload so the page opens
 * on the correct tab without needing a button click for initial routing.
 * After the unlink we click "Overview" tab button to perform an SPA navigation
 * without a full page reload — that's the cache-update path under test.
 */

import { test, expect } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — viticulture module enabled

/** Unique sentinel so rows can be found without relying on position */
const RUN_TAG = `E2E-1277-${Date.now()}`;
const PHENOLOGY_RUN_TAG = `E2E-1695-${Date.now()}`;

// ─── State-file helpers ───────────────────────────────────────────────────────

const __filename2 = fileURLToPath(import.meta.url);
const __dirname2 = path.dirname(__filename2);

function getStateFile(name: string): string {
  const f = path.join(__dirname2, name);
  if (!fs.existsSync(f))
    throw new Error(`global-setup did not run — ${name} missing`);
  return fs.readFileSync(f, "utf-8").trim();
}

// ─── API helpers (dev-bypass, no Clerk auth needed) ──────────────────────────

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

async function devFetch(url: string, init: RequestInit = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers as Record<string, string>),
      "x-dev-bypass": DEV_BYPASS,
      "x-tenant-slug": TENANT_SLUG,
    },
  });
  if (!res.ok) throw new Error(`${init.method ?? "GET"} ${url} → ${res.status}: ${await res.text()}`);
  return res.json() as Promise<Record<string, unknown>>;
}

async function getFirstBlockId(): Promise<number> {
  const data = await devFetch(`${apiBase()}/api/farms/${FARM_ID}/vineyard-blocks`);
  const records = (data.records ?? data.data ?? []) as Array<Record<string, unknown>>;
  const active = records.filter((b) => b.isActive !== false);
  if (!active.length) throw new Error(`Farm ${FARM_ID} has no active vineyard blocks`);
  return active[0].id as number;
}

async function getFirstActiveBlock(): Promise<{ id: number; blockName: string }> {
  const data = await devFetch(`${apiBase()}/api/farms/${FARM_ID}/vineyard-blocks`);
  const records = (data.records ?? data.data ?? []) as Array<Record<string, unknown>>;
  const active = records.filter((b) => b.isActive !== false);
  if (!active.length) throw new Error(`Farm ${FARM_ID} has no active vineyard blocks`);
  return { id: active[0].id as number, blockName: String(active[0].blockName ?? active[0].id) };
}

async function createLinkedScoutingRecord(blockId: number): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const { record } = (await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/vineyard-scouting`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scoutDate: today,
        scoutedBy: RUN_TAG,
        blockId,
        downyMildewPressure: 0,
        powderyMildewPressure: 0,
        botrytisPressure: 0,
        phomopsisPressure: 0,
        leafhopperPressure: 0,
        spiderMitePressure: 0,
      }),
    },
  )) as { record: { id: number } };
  return record.id;
}

async function createUnlinkedPhenologyRecord(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const { record } = (await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/vineyard-phenology`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        observationDate: today,
        observer: PHENOLOGY_RUN_TAG,
        bbchStage: "09",
        bbchDescription: "E2E block reassignment",
      }),
    },
  )) as { record: { id: number } };
  return record.id;
}

async function createLinkedSprayRecord(blockId: number): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const { record } = (await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/vineyard-spray-diary`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationDate: today,
        productName: `E2E-Spray-${RUN_TAG}`,
        blockId,
        operatorName: RUN_TAG,
      }),
    },
  )) as { record: { id: number } };
  return record.id;
}

async function deleteRecord(url: string) {
  await devFetch(url, { method: "DELETE" });
}

// ─── Auth + navigation ────────────────────────────────────────────────────────

/**
 * Authenticate via Clerk and open the viticulture page on `tabId`.
 *
 * Order:
 *  1. page.goto("/dashboard/") — loads app; window.Clerk initialises
 *  2. clerk.signIn({ page, emailAddress }) — clerk SDK must be loaded first;
 *     internally sets up CAPTCHA bypass + signs in via ticket strategy
 *  3. Seed localStorage (tenant slug, farm id, active viticulture tab)
 *  4. page.reload() — Zustand picks up seeded farm/tenant; usePersistedTab
 *     opens on tabId automatically (no button click needed)
 *  5. Click "Viticulture" sidebar link — rendered once module fetch completes
 */
async function signInAndOpenViticultureTab(
  page: import("@playwright/test").Page,
  tabId: string,
) {
  // 1. Navigate — Clerk SDK loads on the page
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");

  // 2. Sign in — must happen after window.Clerk is loaded
  await clerk.signIn({ page, emailAddress: getStateFile(".test-user-email") });

  // 3. Seed localStorage
  await page.evaluate(
    ([slug, farmId, tab]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug as string);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, tab as string);
    },
    [TENANT_SLUG, FARM_ID, tabId] as [string, number, string],
  );

  // 4. Reload — Zustand re-reads seeded state; usePersistedTab opens tabId
  await page.reload({ waitUntil: "networkidle" });

  // 5. Click Viticulture sidebar link. The sidebar renders two identical links
  //    (mobile nav + desktop nav); .first() avoids the strict-mode violation.
  await page.getByRole("link", { name: "Viticulture", exact: true }).first().click();
  await page.waitForLoadState("networkidle");
}

/**
 * Switch viticulture tab via localStorage + reload, so TanStack Query
 * re-fetches and picks up API-injected test records.
 */
async function reloadOnViticultureTab(
  page: import("@playwright/test").Page,
  tabId: string,
) {
  await page.evaluate(
    ([farmId, tab]) => {
      localStorage.setItem(`viticulture-active-tab-${farmId}`, tab as string);
    },
    [FARM_ID, tabId] as [number, string],
  );
  await page.reload({ waitUntil: "networkidle" });
}

/**
 * Read the integer count from an UnlinkedRecordsBar chip whose label matches
 * `chipLabel`. Returns 0 when the chip is not visible.
 *
 * IMPORTANT: The viticulture tab bar also contains buttons labelled "Disease
 * Scouting" and "Spray Diary", so `page.getByRole("button")` alone would pick
 * those first. UnlinkedRecordsBar chips are styled with `rounded-full`; tab
 * bar buttons are not. Scoping to `button.rounded-full` isolates the chips.
 */
async function readOverviewChipCount(
  page: import("@playwright/test").Page,
  chipLabel: RegExp,
): Promise<number> {
  // `button.rounded-full` matches only the chip buttons in UnlinkedRecordsBar,
  // not the viticulture tab-bar buttons that share the same text labels.
  const chip = page.locator("button.rounded-full").filter({ hasText: chipLabel });
  const isVisible = await chip.first().isVisible({ timeout: 10_000 }).catch(() => false);
  if (!isVisible) return 0;
  const badgeSpan = chip.first().locator("span").last();
  const text = await badgeSpan.textContent({ timeout: 3_000 }).catch(() => "0");
  return parseInt(text ?? "0", 10) || 0;
}

/**
 * SPA-navigate to the Overview tab inside the viticulture page.
 * Must be called while the viticulture page is already open.
 *
 * waitForLoadState("networkidle") is NOT sufficient here because it can
 * resolve before React schedules and completes the OverviewTab mount and its
 * useCrud fetches. We instead wait for a stat card label that is always
 * rendered on the Overview tab ("Active Blocks"), which guarantees the tab
 * has fully rendered and data fetches are complete.
 */
async function clickOverviewTab(page: import("@playwright/test").Page) {
  const btn = page.locator("button", { hasText: /^Overview$/ }).first();
  await expect(btn).toBeVisible({ timeout: 10_000 });
  await btn.click();
  // Wait for an Overview-specific stat card — ensures tab is fully rendered.
  // exact:true is required; getByText is case-insensitive by default and would
  // also match "All active blocks on vine register".
  await expect(page.getByText("Active Blocks", { exact: true })).toBeVisible({ timeout: 20_000 });
}

/**
 * SPA-navigate to a named viticulture tab without changing the document URL
 * or reloading the page.
 */
async function clickViticultureTab(
  page: import("@playwright/test").Page,
  tabName: string,
) {
  const btn = page.locator("button", { hasText: new RegExp(`^${tabName}$`) }).first();
  await expect(btn).toBeVisible({ timeout: 10_000 });
  await btn.click();
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe("Overview chip count — unlink path", () => {
  /**
   * Scenario A: Disease Scouting unlink
   *
   * 1. Create a scouting record LINKED to a block via API.
   * 2. Open Overview; note the Disease Scouting chip count.
   * 3. Switch to Scouting tab (reload); API-injected row appears.
   * 4. Hover → "Remove block link" → confirm "Unlink".
   * 5. Verify row shows "Not linked".
   * 6. SPA-navigate to Overview tab.
   * 7. Assert chip count = initial + 1 (proves cache update, not a reload).
   */
  test("scouting unlink increments Overview chip count immediately", async ({ page }) => {
    const blockId = await getFirstBlockId();
    const scoutingId = await createLinkedScoutingRecord(blockId);

    try {
      // Open Overview; read baseline
      await signInAndOpenViticultureTab(page, "overview");
      const initialCount = await readOverviewChipCount(page, /disease scouting/i);

      // Reload on Scouting tab so the API-injected row is fetched
      await reloadOnViticultureTab(page, "scouting");

      const row = page.locator("tr", { hasText: RUN_TAG });
      await expect(row).toBeVisible({ timeout: 15_000 });

      // Hover → unlink
      await row.hover();
      const unlinkBtn = row.getByTitle("Remove block link");
      await expect(unlinkBtn).toBeVisible({ timeout: 5_000 });
      await unlinkBtn.click({ force: true });

      // Confirm dialog
      const dialog = page
        .locator('[role="dialog"]')
        .filter({ hasText: "Remove block link?" });
      await expect(dialog).toBeVisible({ timeout: 5_000 });
      await dialog.getByRole("button", { name: /^unlink$/i }).click();
      await page.waitForLoadState("networkidle");

      // Row must now show "Not linked"
      await expect(row.getByText("Not linked")).toBeVisible({ timeout: 10_000 });

      // SPA navigate to Overview — no page reload
      await clickOverviewTab(page);

      // Chip count must have risen by exactly 1 (from cache refetch, not reload)
      const afterCount = await readOverviewChipCount(page, /disease scouting/i);
      expect(
        afterCount,
        `Disease Scouting chip must be ${initialCount + 1} after unlinking (was ${initialCount})`,
      ).toBe(initialCount + 1);

      await expect(
        page.locator("button.rounded-full").filter({ hasText: /disease scouting/i }).first(),
      ).toBeVisible({
        message: "Disease Scouting chip must be visible in Overview unlinked bar",
      });
    } finally {
      await deleteRecord(
        `${apiBase()}/api/farms/${FARM_ID}/vineyard-scouting/${scoutingId}`,
      ).catch(() => {});
    }
  });

  /**
   * Scenario B: Spray Diary unlink — same flow for the Spray Diary tab.
   */
  test("spray diary unlink increments Overview chip count immediately", async ({ page }) => {
    const blockId = await getFirstBlockId();
    const sprayId = await createLinkedSprayRecord(blockId);

    try {
      // Open Overview; read baseline
      await signInAndOpenViticultureTab(page, "overview");
      const initialCount = await readOverviewChipCount(page, /spray diary/i);

      // Reload on Spray Diary tab so the API-injected row is fetched
      await reloadOnViticultureTab(page, "spray-diary");

      const row = page.locator("tr", { hasText: RUN_TAG });
      await expect(row).toBeVisible({ timeout: 15_000 });

      // Hover → unlink
      await row.hover();
      const unlinkBtn = row.getByTitle("Remove block link");
      await expect(unlinkBtn).toBeVisible({ timeout: 5_000 });
      await unlinkBtn.click({ force: true });

      // Confirm dialog
      const dialog = page
        .locator('[role="dialog"]')
        .filter({ hasText: "Remove block link?" });
      await expect(dialog).toBeVisible({ timeout: 5_000 });
      await dialog.getByRole("button", { name: /^unlink$/i }).click();
      await page.waitForLoadState("networkidle");

      // Row must now show "Not linked"
      await expect(row.getByText("Not linked")).toBeVisible({ timeout: 10_000 });

      // SPA navigate to Overview — no page reload
      await clickOverviewTab(page);

      // Chip count must have risen by exactly 1 (from cache refetch, not reload)
      const afterCount = await readOverviewChipCount(page, /spray diary/i);
      expect(
        afterCount,
        `Spray Diary chip must be ${initialCount + 1} after unlinking (was ${initialCount})`,
      ).toBe(initialCount + 1);

      await expect(
        page.locator("button.rounded-full").filter({ hasText: /spray diary/i }).first(),
      ).toBeVisible({
        message: "Spray Diary chip must be visible in Overview unlinked bar",
      });
    } finally {
      await deleteRecord(
        `${apiBase()}/api/farms/${FARM_ID}/vineyard-spray-diary/${sprayId}`,
      ).catch(() => {});
    }
  });
});

test.describe("Overview chip count — phenology block assignment", () => {
  /**
   * A phenology observation starts unlinked, then is assigned to a block from
   * the edit dialog. The Overview tab is reached with an in-page tab click
   * only; no page navigation or manual refresh is allowed after the save.
   */
  test("phenology block assignment decrements the Overview chip immediately", async ({ page }) => {
    const block = await getFirstActiveBlock();
    const phenologyId = await createUnlinkedPhenologyRecord();

    try {
      // The Overview query sees the API-seeded unlinked observation.
      await signInAndOpenViticultureTab(page, "overview");
      const initialCount = await readOverviewChipCount(page, /phenology/i);
      expect(initialCount, "seeded phenology observation must appear as unlinked").toBeGreaterThan(0);

      // Move to Phenology via the tab bar, not a page reload.
      await clickViticultureTab(page, "Phenology");
      const row = page.locator("tr", { hasText: PHENOLOGY_RUN_TAG });
      await expect(row).toBeVisible({ timeout: 15_000 });

      // DataTable actions are View, Edit, Delete; click Edit.
      await row.getByRole("button").nth(1).click();
      const dialog = page
        .locator('[role="dialog"]')
        .filter({ hasText: "Edit Phenology Observation" });
      await expect(dialog).toBeVisible({ timeout: 5_000 });

      // The first combobox in the edit dialog is the Block selector.
      await dialog.getByRole("combobox").first().click();
      await page.getByRole("option", { name: block.blockName, exact: true }).click();
      await dialog.getByRole("button", { name: /^save$/i }).click();

      await expect(dialog).toBeHidden({ timeout: 10_000 });
      await expect(row.getByText(block.blockName, { exact: true })).toBeVisible({ timeout: 10_000 });

      // Return to Overview with the SPA tab control. The shared query cache
      // must already contain the refetched record before this component mounts.
      await clickOverviewTab(page);
      const afterCount = await readOverviewChipCount(page, /phenology/i);
      expect(
        afterCount,
        `Phenology chip must be ${initialCount - 1} after assigning the block (was ${initialCount})`,
      ).toBe(initialCount - 1);
      const phenologyChip = page
        .locator("button.rounded-full")
        .filter({ hasText: /phenology/i })
        .first();
      if (initialCount === 1) {
        await expect(phenologyChip).toBeHidden();
      } else {
        await expect(phenologyChip).toBeVisible();
      }
    } finally {
      await deleteRecord(
        `${apiBase()}/api/farms/${FARM_ID}/vineyard-phenology/${phenologyId}`,
      ).catch(() => {});
    }
  });
});
