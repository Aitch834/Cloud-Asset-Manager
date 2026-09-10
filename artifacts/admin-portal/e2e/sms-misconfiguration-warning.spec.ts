/**
 * E2E: SMS misconfiguration warning on the customer detail page
 *
 * Confirms that platform admins can see the warning when a grower has SMS
 * enabled but has explicitly disabled every available category, and that the
 * warning is not shown when at least one category remains enabled or when the
 * tenant does not have an active SMS Alerts add-on. It also
 * protects the category summary's enabled/disabled styling and legacy-null
 * behaviour.
 *
 * Data strategy: create isolated active-add-on and inactive-add-on tenants plus
 * their users directly in PostgreSQL. The fixture is removed after the suite.
 *
 * Prerequisites:
 *   - DATABASE_URL in env
 *   - Admin-portal workflow running
 *   - API server workflow running
 */

import { test, expect, type Page } from "@playwright/test";
import { Client } from "pg";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const ADMIN_SECRET_PLACEHOLDER = "e2e-test-secret";
const DEV_BYPASS_USER_ID = "dev-bypass-user";
const FIXTURE_TAG = `E2ESmsWarning-${Date.now()}-${process.pid}`;
const MISCONFIGURED_USER_ID = `e2e-sms-misconfigured-${Date.now()}-${process.pid}`;
const CONFIGURED_USER_ID = `e2e-sms-configured-${Date.now()}-${process.pid}`;
const LEGACY_USER_ID = `e2e-sms-legacy-${Date.now()}-${process.pid}`;
const INACTIVE_ADDON_USER_ID = `e2e-sms-inactive-addon-${Date.now()}-${process.pid}`;

const SMS_CATEGORIES = {
  livestock: false,
  dairy: false,
  arable: false,
  viticulture: false,
  tasks: false,
  regulatory: false,
  quality: false,
  stock: false,
};

let tenantId: number | null = null;
let farmId: number | null = null;
let subscriptionId: number | null = null;
let inactiveAddonTenantId: number | null = null;
let inactiveAddonFarmId: number | null = null;
let inactiveAddonSubscriptionId: number | null = null;
let insertedUserIds: string[] = [];
let insertedBypassUser = false;

function appBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

async function setupFixture() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for the SMS warning fixture");
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
    if (!roleId) throw new Error("A system role is required for the SMS warning fixture");

    const moduleResult = await db.query<{ id: number }>(
      "SELECT id FROM modules WHERE key = 'sms-alerts' LIMIT 1",
    );
    const smsModuleId = moduleResult.rows[0]?.id;
    if (!smsModuleId) throw new Error("The sms-alerts module is not seeded");

    const tenantResult = await db.query<{ id: number }>(
      `INSERT INTO tenants (name, slug, contact_email)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [
        `${FIXTURE_TAG} Tenant`,
        `${FIXTURE_TAG.toLowerCase()}-${Date.now()}`,
        `${FIXTURE_TAG.toLowerCase()}@test.local`,
      ],
    );
    tenantId = tenantResult.rows[0].id;

    const inactiveAddonTenantResult = await db.query<{ id: number }>(
      `INSERT INTO tenants (name, slug, contact_email)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [
        `${FIXTURE_TAG} Inactive Add-on Tenant`,
        `${FIXTURE_TAG.toLowerCase()}-inactive-${Date.now()}`,
        `${FIXTURE_TAG.toLowerCase()}-inactive@test.local`,
      ],
    );
    inactiveAddonTenantId = inactiveAddonTenantResult.rows[0].id;

    const farmResult = await db.query<{ id: number }>(
      `INSERT INTO farms (tenant_id, name)
       VALUES ($1, $2)
       RETURNING id`,
      [tenantId, `${FIXTURE_TAG} Farm`],
    );
    farmId = farmResult.rows[0].id;

    const inactiveAddonFarmResult = await db.query<{ id: number }>(
      `INSERT INTO farms (tenant_id, name)
       VALUES ($1, $2)
       RETURNING id`,
      [inactiveAddonTenantId, `${FIXTURE_TAG} Inactive Add-on Farm`],
    );
    inactiveAddonFarmId = inactiveAddonFarmResult.rows[0].id;

    const subscriptionResult = await db.query<{ id: number }>(
      `INSERT INTO subscriptions (tenant_id, farm_id, module_id, status)
       VALUES ($1, $2, $3, 'active')
       RETURNING id`,
      [tenantId, farmId, smsModuleId],
    );
    subscriptionId = subscriptionResult.rows[0].id;

    const inactiveAddonSubscriptionResult = await db.query<{ id: number }>(
      `INSERT INTO subscriptions (tenant_id, farm_id, module_id, status)
       VALUES ($1, $2, $3, 'cancelled')
       RETURNING id`,
      [inactiveAddonTenantId, inactiveAddonFarmId, smsModuleId],
    );
    inactiveAddonSubscriptionId = inactiveAddonSubscriptionResult.rows[0].id;

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
       VALUES
         ($1, $2, $4, true, true),
         ($1, $3, $4, true, true)
       ON CONFLICT (user_id, tenant_id) DO NOTHING`,
      [DEV_BYPASS_USER_ID, tenantId, inactiveAddonTenantId, roleId],
    );

    await db.query(
      `INSERT INTO users
         (id, email, first_name, last_name, phone_number, sms_opt_in, sms_categories)
         VALUES
         ($1, $2, 'SMS', 'Misconfigured', '07700900111', 'all', $3),
          ($4, $5, 'SMS', 'Configured', '07700900222', 'all', $6),
           ($7, $8, 'SMS', 'Legacy', '07700900333', 'all', NULL),
           ($9, $10, 'SMS', 'Inactive Add-on', '07700900444', 'all', $11)`,
      [
        MISCONFIGURED_USER_ID,
        `${MISCONFIGURED_USER_ID}@test.local`,
        JSON.stringify(SMS_CATEGORIES),
        CONFIGURED_USER_ID,
        `${CONFIGURED_USER_ID}@test.local`,
        JSON.stringify({ tasks: true, regulatory: false }),
        LEGACY_USER_ID,
        `${LEGACY_USER_ID}@test.local`,
        INACTIVE_ADDON_USER_ID,
        `${INACTIVE_ADDON_USER_ID}@test.local`,
        JSON.stringify(SMS_CATEGORIES),
      ],
    );
    insertedUserIds = [
      MISCONFIGURED_USER_ID,
      CONFIGURED_USER_ID,
      LEGACY_USER_ID,
      INACTIVE_ADDON_USER_ID,
    ];

    await db.query(
      `INSERT INTO user_tenants (user_id, tenant_id, role_id, is_active)
       VALUES
         ($1, $4, $5, true),
         ($2, $4, $5, true),
         ($3, $4, $5, true),
         ($6, $7, $5, true)`,
      [
        MISCONFIGURED_USER_ID,
        CONFIGURED_USER_ID,
        LEGACY_USER_ID,
        tenantId,
        roleId,
        INACTIVE_ADDON_USER_ID,
        inactiveAddonTenantId,
      ],
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
    }
    if (inactiveAddonTenantId !== null) {
      await db.query("DELETE FROM user_tenants WHERE tenant_id = $1", [inactiveAddonTenantId]);
    }
    for (const userId of insertedUserIds) {
      await db.query("DELETE FROM users WHERE id = $1", [userId]);
    }
    if (insertedBypassUser) {
      await db.query("DELETE FROM users WHERE id = $1", [DEV_BYPASS_USER_ID]);
    }
    if (subscriptionId !== null) {
      await db.query("DELETE FROM subscriptions WHERE id = $1", [subscriptionId]);
    }
    if (inactiveAddonSubscriptionId !== null) {
      await db.query("DELETE FROM subscriptions WHERE id = $1", [inactiveAddonSubscriptionId]);
    }
    if (farmId !== null) {
      await db.query("DELETE FROM farms WHERE id = $1", [farmId]);
    }
    if (inactiveAddonFarmId !== null) {
      await db.query("DELETE FROM farms WHERE id = $1", [inactiveAddonFarmId]);
    }
    if (tenantId !== null) {
      await db.query("DELETE FROM tenants WHERE id = $1", [tenantId]);
    }
    if (inactiveAddonTenantId !== null) {
      await db.query("DELETE FROM tenants WHERE id = $1", [inactiveAddonTenantId]);
    }
  } finally {
    await db.end();
  }
}

async function openCustomerDetail(page: Page, customerTenantId = tenantId) {
  await page.addInitScript((secret) => {
    sessionStorage.setItem("bde_admin_secret", secret);
  }, ADMIN_SECRET_PLACEHOLDER);

  await page.route("**/api/admin/**", async (route) => {
    await route.continue({
      headers: {
        ...route.request().headers(),
        "x-dev-bypass": DEV_BYPASS,
      },
    });
  });

  await page.goto(`${appBase()}/admin-portal/customers/${customerTenantId}`);
  await expect(page.getByRole("heading", { name: /^Users \(\d+\)$/ })).toBeVisible();
}

test.describe("SMS misconfiguration warning", () => {
  test.beforeAll(async () => {
    await setupFixture();
  });

  test.afterAll(async () => {
    await teardownFixture();
  });

  test("shows the amber warning when SMS is enabled but every category is off", async ({ page }) => {
    await openCustomerDetail(page);

    const userRow = page
      .getByText(`${MISCONFIGURED_USER_ID}@test.local`, { exact: true })
      .locator("xpath=../../..");
    const warning = userRow.getByText(
      /SMS is enabled but every category is off — you won't receive any text alerts\./i,
    );

    await expect(warning).toBeVisible();
    await expect(warning.locator("..")).toHaveClass(/bg-amber-50/);
  });

  test("does not show the warning when at least one SMS category is enabled", async ({ page }) => {
    await openCustomerDetail(page);

    const userRow = page
      .getByText(`${CONFIGURED_USER_ID}@test.local`, { exact: true })
      .locator("xpath=../../..");
    await expect(
      userRow.getByText(
        /SMS is enabled but every category is off — you won't receive any text alerts\./i,
      ),
    ).toHaveCount(0);
  });

  test("shows enabled, disabled, and omitted categories with their correct status styling", async ({ page }) => {
    await openCustomerDetail(page);

    const userRow = page
      .getByText(`${CONFIGURED_USER_ID}@test.local`, { exact: true })
      .locator("xpath=../../..");
    await expect(userRow.getByText("SMS categories:", { exact: true })).toBeVisible();

    const enabled = userRow.getByText("Task Assignments & Reminders", { exact: true });
    await expect(enabled).toHaveAttribute("title", "Enabled");
    await expect(enabled).toHaveClass(/text-green-700/);
    await expect(enabled).not.toHaveClass(/line-through/);

    const disabled = userRow.getByText("Regulatory Compliance", { exact: true });
    await expect(disabled).toHaveAttribute("title", "Disabled");
    await expect(disabled).toHaveClass(/text-muted-foreground/);
    await expect(disabled).toHaveClass(/line-through/);

    const omitted = userRow.getByText("Quality & Non-conformances", { exact: true });
    await expect(omitted).toHaveAttribute("title", "Enabled");
    await expect(omitted).toHaveClass(/text-green-700/);
    await expect(omitted).not.toHaveClass(/line-through/);
  });

  test("does not render the category summary for a legacy null value", async ({ page }) => {
    await openCustomerDetail(page);

    const userRow = page
      .getByText(`${LEGACY_USER_ID}@test.local`, { exact: true })
      .locator("xpath=../../..");
    await expect(userRow.getByText("SMS categories:", { exact: true })).toHaveCount(0);
  });

  test("does not show the warning when the SMS Alerts add-on is inactive", async ({ page }) => {
    await openCustomerDetail(page, inactiveAddonTenantId);

    const userRow = page
      .getByText(`${INACTIVE_ADDON_USER_ID}@test.local`, { exact: true })
      .locator("xpath=../../..");
    await expect(
      userRow.getByText(
        /SMS is enabled but every category is off — you won't receive any text alerts\./i,
      ),
    ).toHaveCount(0);
  });
});
