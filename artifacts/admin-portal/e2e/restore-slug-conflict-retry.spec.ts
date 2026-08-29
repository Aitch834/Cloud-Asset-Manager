/**
 * E2E: Ad Template restore — slug-conflict error persists on retry
 *
 * Confirms that when an admin clicks "Restore" on an archived template whose
 * slug is already held by an active template (→ 409), the slug-conflict error
 * banner appears, and then reappears correctly if they click Restore a second
 * time without refreshing the page.
 *
 * Scenario:
 *   1. Create template A with a unique slug and archive it (API, dev-bypass).
 *   2. Create template B with the same slug (now active, slug is taken).
 *   3. Open the admin portal Ad PDF Generator page (auth via sessionStorage shim).
 *   4. Click "Restore" on template A → assert error text containing "slug" or
 *      "active template" is visible on screen.
 *   5. Click "Restore" on template A again → assert the same error text is
 *      still visible after the retry (it must not disappear or be replaced by
 *      a generic fallback).
 *
 * Data strategy: templates are created and torn down via the dev-bypass API so
 * the test is hermetic and does not rely on any pre-existing data.
 *
 * Prerequisites:
 *   - DATABASE_URL in env
 *   - Admin-portal workflow running (artifacts/admin-portal: web)
 *   - API server workflow running  (artifacts/api-server: API Server)
 */

import { test, expect } from "@playwright/test";
import { Client } from "pg";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";

/** The admin portal reads this sessionStorage key to skip its login screen. */
const ADMIN_SECRET_PLACEHOLDER = "e2e-test-secret";
const DEV_BYPASS_USER_ID = "dev-bypass-user";

/** Unique tag so cleanup by template name works even if a previous run leaked. */
const TAG = `E2ERestore1436-${Date.now()}`;

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

const DEV_BYPASS_HEADERS = {
  "Content-Type": "application/json",
  "x-dev-bypass": DEV_BYPASS,
};

// ─── API helpers ─────────────────────────────────────────────────────────────

async function apiCall(
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; json: unknown }> {
  const res = await fetch(`${apiBase()}${path}`, {
    method,
    headers: DEV_BYPASS_HEADERS,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json: unknown = null;
  try { json = await res.json(); } catch { /* non-JSON */ }
  return { status: res.status, json };
}

// ─── Fixture state ────────────────────────────────────────────────────────────

let templateAId: number | null = null;
let templateBId: number | null = null;
let insertedUser = false;
let insertedMembershipTenantId: number | null = null;

async function setupSuperAdminFixture() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for the super-admin fixture");
  }

  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    const roleResult = await db.query<{ id: number }>(
      `SELECT id FROM roles
       WHERE name = 'BDE Super Admin' AND is_system_role = true
       LIMIT 1`,
    );
    const roleId = roleResult.rows[0]?.id;
    if (!roleId) throw new Error("BDE Super Admin system role is not seeded");

    const userResult = await db.query(
      `INSERT INTO users (id, email, first_name, last_name)
       VALUES ($1, 'dev-bypass@test.local', 'DevBypass', 'Test')
       ON CONFLICT (id) DO NOTHING
       RETURNING id`,
      [DEV_BYPASS_USER_ID],
    );
    insertedUser = (userResult.rowCount ?? 0) > 0;

    const tenantResult = await db.query<{ id: number }>(
      "SELECT id FROM tenants ORDER BY id LIMIT 1",
    );
    const tenantId = tenantResult.rows[0]?.id;
    if (!tenantId) throw new Error("At least one tenant is required");

    const membershipResult = await db.query(
      `INSERT INTO user_tenants
         (user_id, tenant_id, role_id, is_super_admin, is_active)
       VALUES ($1, $2, $3, true, true)
       ON CONFLICT (user_id, tenant_id) DO NOTHING
       RETURNING tenant_id`,
      [DEV_BYPASS_USER_ID, tenantId, roleId],
    );
    if ((membershipResult.rowCount ?? 0) > 0) {
      insertedMembershipTenantId = tenantId;
    }
  } finally {
    await db.end();
  }
}

async function teardown() {
  if (!process.env.DATABASE_URL) return;

  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    for (const id of [templateAId, templateBId]) {
      if (id !== null) {
        await db.query("DELETE FROM ad_templates WHERE id = $1", [id]);
      }
    }
    if (insertedMembershipTenantId !== null) {
      await db.query(
        "DELETE FROM user_tenants WHERE user_id = $1 AND tenant_id = $2",
        [DEV_BYPASS_USER_ID, insertedMembershipTenantId],
      );
    }
    if (insertedUser) {
      await db.query("DELETE FROM users WHERE id = $1", [DEV_BYPASS_USER_ID]);
    }
  } finally {
    await db.end();
  }
}

// ─── Test ─────────────────────────────────────────────────────────────────────

test.describe("Ad Template restore — slug-conflict error persists on retry", () => {
  const sharedSlug = `_e2e-restore-retry-${Date.now()}`;

  test.beforeAll(async () => {
    await setupSuperAdminFixture();

    // ── Create and archive template A ────────────────────────────────────────
    const createA = await apiCall("POST", "/api/admin/ad-templates", {
      name: `${TAG} — Template A`,
      slug: sharedSlug,
      widthMm: 210,
      heightMm: 297,
      htmlBody: "<html><body>E2E-RESTORE-RETRY-A</body></html>",
    });
    if (createA.status !== 201) {
      throw new Error(
        `Failed to create template A: ${createA.status} ${JSON.stringify(createA.json)}`,
      );
    }
    templateAId = (createA.json as { id: number }).id;

    const archiveA = await apiCall("DELETE", `/api/admin/ad-templates/${templateAId}`);
    if (archiveA.status !== 200) {
      throw new Error(
        `Failed to archive template A: ${archiveA.status} ${JSON.stringify(archiveA.json)}`,
      );
    }

    // ── Create template B with the same slug (slug is now taken) ─────────────
    const createB = await apiCall("POST", "/api/admin/ad-templates", {
      name: `${TAG} — Template B`,
      slug: sharedSlug,
      widthMm: 210,
      heightMm: 297,
      htmlBody: "<html><body>E2E-RESTORE-RETRY-B</body></html>",
    });
    if (createB.status !== 201) {
      throw new Error(
        `Failed to create template B: ${createB.status} ${JSON.stringify(createB.json)}`,
      );
    }
    templateBId = (createB.json as { id: number }).id;
  });

  test.afterAll(async () => {
    await teardown();
  });

  test("slug-conflict error banner appears and reappears on a second Restore click", async ({ page }) => {
    let restoreRequestCount = 0;
    let releaseSecondRestore!: () => void;
    let markSecondRestoreStarted!: () => void;
    const secondRestoreRelease = new Promise<void>((resolve) => {
      releaseSecondRestore = resolve;
    });
    const secondRestoreStarted = new Promise<void>((resolve) => {
      markSecondRestoreStarted = resolve;
    });

    // ── 1. Inject admin secret into sessionStorage before the app boots ───────
    //    The admin portal App.tsx checks sessionStorage["bde_admin_secret"] on
    //    mount; any truthy value skips the login screen entirely.
    //    addInitScript runs before any page script, so the React app sees the
    //    value immediately on its first render.
    await page.addInitScript((secret) => {
      sessionStorage.setItem("bde_admin_secret", secret);
    }, ADMIN_SECRET_PLACEHOLDER);

    // The UI normally authenticates with x-admin-secret. For local E2E, inject
    // the same dev-bypass identity used to create the fixtures above.
    await page.route("**/api/admin/**", async (route) => {
      const isRestoreRequest =
        route.request().method() === "POST" &&
        route.request().url().endsWith(
          `/api/admin/ad-templates/${templateAId}/restore`,
        );
      if (isRestoreRequest) {
        restoreRequestCount++;
        if (restoreRequestCount === 2) {
          markSecondRestoreStarted();
          await secondRestoreRelease;
        }
      }
      await route.continue({
        headers: {
          ...route.request().headers(),
          "x-dev-bypass": DEV_BYPASS,
        },
      });
    });

    // ── 2. Navigate to the Ad PDF Generator page ──────────────────────────────
    await page.goto(`${apiBase()}/admin-portal/ad-pdf`);

    // Wait until the template library heading is visible — confirms the page
    // has authenticated and rendered the template list.
    await expect(
      page.getByRole("heading", { name: "Template library" }),
    ).toBeVisible();

    // ── 3. Locate the "Restore" button for template A in the template list ────
    //    The list row contains the template name as text; the sibling "Restore"
    //    button is the action for that row.
    const templateAName = `${TAG} — Template A`;

    // Find the row that contains Template A's name, then get the Restore button
    // inside it.
    const templateARow = page
      .getByText(templateAName, { exact: true })
      .locator("xpath=../..");

    const restoreBtn = templateARow.getByRole("button", { name: /restore/i });
    await expect(restoreBtn).toBeVisible();

    // ── 4. First Restore click — must show the slug-conflict error ────────────
    const firstConflictResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/api/admin/ad-templates/${templateAId}/restore`) &&
        response.request().method() === "POST",
    );
    await restoreBtn.click();
    expect((await firstConflictResponse).status()).toBe(409);

    // The error banner is rendered at the bottom of the template library section
    // whenever restoreMutation.isError is true.  The message from the API
    // includes "slug" or "active template".
    const errorBanner = page.getByText(
      /Another active template already uses that slug/i,
    );
    await expect(errorBanner).toBeVisible({
      timeout: 8_000,
    });

    const firstErrorText = await errorBanner.first().textContent();
    expect(firstErrorText).toBeTruthy();

    // ── 5. Second Restore click — error must reappear after the retry ─────────
    //    TanStack Query transitions the mutation through isPending → isError.
    //    During isPending the banner is hidden; we must wait for isError again.
    const secondConflictResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/api/admin/ad-templates/${templateAId}/restore`) &&
        response.request().method() === "POST",
    );
    await restoreBtn.click();
    await secondRestoreStarted;

    // Prove this is not the first attempt's stale banner: React Query clears
    // isError while the deliberately-held second mutation is pending.
    await expect(errorBanner).toBeHidden();

    releaseSecondRestore();
    expect((await secondConflictResponse).status()).toBe(409);

    // The second 409 must put the mutation back into its error state and render
    // the actionable slug-conflict warning again.
    await expect(errorBanner).toBeVisible({
      timeout: 8_000,
    });

    const secondErrorText = await errorBanner.first().textContent();
    expect(secondErrorText).toBeTruthy();

    // The slug-conflict message must remain informative — not a generic fallback.
    expect(
      /slug|active template/i.test(secondErrorText ?? ""),
    ).toBe(true);
  });
});
