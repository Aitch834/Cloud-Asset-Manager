/**
 * E2E: tenant contact edits propagate back to the customer list.
 *
 * Data strategy: create one isolated tenant and remove it after the suite. The
 * test primes the customer-list cache before editing so it covers the in-app
 * detail-to-list navigation path rather than relying on a full page reload.
 */

import { expect, test, type Page, type Request } from "@playwright/test";
import { Client } from "pg";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const ADMIN_SECRET_PLACEHOLDER = "e2e-test-secret";
const DEV_BYPASS_USER_ID = "dev-bypass-user";
const FIXTURE_TAG = `E2EContactRefresh-${Date.now()}-${process.pid}`;
const ORIGINAL_NAME = `${FIXTURE_TAG} Original`;
const UPDATED_NAME = `${FIXTURE_TAG} Updated`;

let tenantId: number | null = null;
let insertedBypassUser = false;

function appBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

async function setupFixture() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for the contact refresh fixture");
  }

  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    const roleResult = await db.query<{ id: number }>(
      `SELECT id FROM roles
       WHERE is_system_role = true
       ORDER BY id
       LIMIT 1`,
    );
    const roleId = roleResult.rows[0]?.id;
    if (!roleId) throw new Error("A system role is required for the contact refresh fixture");

    const tenantResult = await db.query<{ id: number }>(
      `INSERT INTO tenants (name, slug, contact_email)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [
        ORIGINAL_NAME,
        `${FIXTURE_TAG.toLowerCase()}-${Date.now()}`,
        `${FIXTURE_TAG.toLowerCase()}@test.local`,
      ],
    );
    tenantId = tenantResult.rows[0].id;

    const bypassUserResult = await db.query(
      `INSERT INTO users (id, email, first_name, last_name)
       VALUES ($1, 'dev-bypass@test.local', 'DevBypass', 'Test')
       ON CONFLICT (id) DO NOTHING
       RETURNING id`,
      [DEV_BYPASS_USER_ID],
    );
    insertedBypassUser = (bypassUserResult.rowCount ?? 0) > 0;

    await db.query(
      `INSERT INTO user_tenants
         (user_id, tenant_id, role_id, is_super_admin, is_active)
       VALUES ($1, $2, $3, true, true)
       ON CONFLICT (user_id, tenant_id) DO NOTHING`,
      [DEV_BYPASS_USER_ID, tenantId, roleId],
    );
  } finally {
    await db.end();
  }
}

async function teardownFixture() {
  if (!process.env.DATABASE_URL) return;

  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    if (tenantId !== null) {
      await db.query("DELETE FROM user_tenants WHERE tenant_id = $1", [tenantId]);
      await db.query("DELETE FROM tenants WHERE id = $1", [tenantId]);
    }
    if (insertedBypassUser) {
      await db.query("DELETE FROM users WHERE id = $1", [DEV_BYPASS_USER_ID]);
    }
  } finally {
    await db.end();
  }
}

async function authenticate(
  page: Page,
  beforeAdminRequest?: (request: Request) => Promise<void>,
) {
  await page.addInitScript((secret) => {
    sessionStorage.setItem("bde_admin_secret", secret);
  }, ADMIN_SECRET_PLACEHOLDER);

  await page.route("**/api/admin/**", async (route) => {
    await beforeAdminRequest?.(route.request());
    await route.continue({
      headers: {
        ...route.request().headers(),
        "x-dev-bypass": DEV_BYPASS,
      },
    });
  });
}

test.describe("customer contact list refresh", () => {
  test.beforeAll(setupFixture);
  test.afterAll(teardownFixture);

  test("shows an edited contact name after returning through the in-app customer link", async ({ page }) => {
    let tenantListRequestCount = 0;
    let markRefreshStarted!: () => void;
    let releaseRefresh!: () => void;
    const refreshStarted = new Promise<void>((resolve) => {
      markRefreshStarted = resolve;
    });
    const refreshRelease = new Promise<void>((resolve) => {
      releaseRefresh = resolve;
    });

    await authenticate(page, async (request) => {
      const isTenantListRequest =
        request.method() === "GET" &&
        new URL(request.url()).pathname === "/api/admin/tenants";
      if (!isTenantListRequest) return;

      tenantListRequestCount += 1;
      if (tenantListRequestCount === 2) {
        markRefreshStarted();
        await refreshRelease;
      }
    });
    await page.goto(`${appBase()}/admin-portal/customers`);

    const originalCustomerLink = page.getByRole("link").filter({ hasText: ORIGINAL_NAME });
    await expect(originalCustomerLink).toBeVisible();
    await originalCustomerLink.click();
    await expect(page).toHaveURL(new RegExp(`/admin-portal/customers/${tenantId}$`));

    await page.getByRole("button", { name: "Edit contact", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Edit Contact Details" })).toBeVisible();
    await page.getByPlaceholder("e.g. John Smith").fill(UPDATED_NAME);

    const updateResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/api/admin/tenants/${tenantId}`) &&
        response.request().method() === "PATCH",
    );
    await page.getByRole("button", { name: "Save Changes" }).click();
    expect((await updateResponse).status()).toBe(200);
    await expect(page.getByRole("heading", { name: UPDATED_NAME })).toBeVisible();

    await page.getByText("Back to Customers", { exact: true }).click();
    await expect(page).toHaveURL(/\/admin-portal\/customers$/);
    await refreshStarted;

    try {
      await expect(page.getByRole("link").filter({ hasText: UPDATED_NAME })).toBeVisible();
      await expect(page.getByText(ORIGINAL_NAME, { exact: true })).toHaveCount(0);
    } finally {
      releaseRefresh();
    }
  });
});