/**
 * Playwright global setup — prepares the persistent Clerk test identity and
 * maps it to the development tenant so the E2E tests can authenticate as a
 * super-admin.
 *
 * The shared user's Clerk ID and email are written to run-scoped state files
 * so concurrent Playwright invocations cannot collide. Authenticated specs
 * read the email through the shared sign-in helper.
 */

import { clerkSetup } from "@clerk/testing/playwright";
import { chromium, type FullConfig } from "@playwright/test";
import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import {
  provisionReusableClerkTestUser,
  SHARED_E2E_TEST_EMAIL,
  type ClerkUserRecord,
} from "../src/lib/e2e-test-user";
import { provisionOrganicInputFixture } from "./organic-input-fixture";
import { signInDashboard } from "./auth";

const TENANT_SLUG = "oakfield-farms";
const VITICULTURE_FARM_ID = 5;
const VITICULTURE_FIXTURE_SBI = "E2E-VINEYARD-SBI";
const VITICULTURE_FIXTURE_BLOCK_NAME = "E2E Registration Block";

export { TENANT_SLUG, VITICULTURE_FARM_ID };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATE_FILE = path.join(
  __dirname,
  process.env.PLAYWRIGHT_E2E_USER_ID_FILE ?? ".test-user-id-missing-run-id",
);
const EMAIL_FILE = path.join(
  __dirname,
  process.env.PLAYWRIGHT_E2E_USER_EMAIL_FILE ?? ".test-user-email-missing-run-id",
);

const CLERK_USERS_PAGE_SIZE = 100;

type ClerkUsersResponse =
  | ClerkUserRecord[]
  | { data?: ClerkUserRecord[]; total_count?: number };

async function listClerkUsers(secretKey: string): Promise<ClerkUserRecord[]> {
  const users: ClerkUserRecord[] = [];

  for (let offset = 0; ; offset += CLERK_USERS_PAGE_SIZE) {
    const response = await fetch(
      `https://api.clerk.com/v1/users?limit=${CLERK_USERS_PAGE_SIZE}&offset=${offset}&order_by=-created_at`,
      { headers: { Authorization: `Bearer ${secretKey}` } },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Failed to list Clerk users: ${response.status} ${body}`,
      );
    }

    const payload = (await response.json()) as ClerkUsersResponse;
    const page = Array.isArray(payload) ? payload : payload.data ?? [];
    users.push(...page);

    const totalCount = Array.isArray(payload) ? undefined : payload.total_count;
    if (
      page.length < CLERK_USERS_PAGE_SIZE ||
      (totalCount !== undefined && users.length >= totalCount)
    ) {
      return users;
    }
  }
}

async function createSharedClerkTestUser(
  secretKey: string,
  email: string,
): Promise<{ id: string; email: string }> {
  const createRes = await fetch("https://api.clerk.com/v1/users", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: [email],
      first_name: "E2E",
      last_name: "Dashboard Tester",
      skip_password_requirement: true,
    }),
  });

  if (createRes.ok) {
    const clerkUser = (await createRes.json()) as { id: string };
    return { id: clerkUser.id, email };
  }

  const body = await createRes.text();
  throw new Error(
    `Failed to create Clerk test user: ${createRes.status} ${body}`,
  );
}

async function verifyDashboardAuthentication(
  config: FullConfig,
  emailAddress: string,
): Promise<void> {
  const projectUse = config.projects[0]?.use;
  const browser = await chromium.launch(projectUse?.launchOptions);

  try {
    const context = await browser.newContext({
      baseURL: projectUse?.baseURL,
    });
    const page = await context.newPage();
    await signInDashboard(page, emailAddress);
    await context.close();
  } finally {
    await browser.close();
  }
}

export default async function globalSetup(config: FullConfig) {
  // A process killed before Playwright's global teardown can leave these
  // per-run markers behind. Never let a later failed setup expose stale
  // credentials to a spec or teardown from a previous run.
  fs.rmSync(STATE_FILE, { force: true });
  fs.rmSync(EMAIL_FILE, { force: true });

  // ── 1. Configure Clerk for testing mode ──────────────────────────────────
  await clerkSetup();

  // ── 2. Reuse or provision the persistent Clerk test user ─────────────────
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  if (!clerkSecretKey) throw new Error("CLERK_SECRET_KEY must be set");

  const configuredEmail = (
    process.env.PLAYWRIGHT_CLERK_USER_EMAIL ?? SHARED_E2E_TEST_EMAIL
  ).trim().toLowerCase();

  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();

  try {
    // Provisioning and mapping one shared identity must be atomic across
    // Playwright invocations. Without this lock, two empty-cache runs can each
    // create/select a different Clerk ID for the reserved email, then race on
    // the application's unique users.email constraint.
    await db.query(
      "SELECT pg_advisory_lock(hashtext('dashboard-e2e-clerk-identity'))",
    );

    const provisionedUser = await provisionReusableClerkTestUser({
      preferredEmail: configuredEmail,
      listUsers: () => listClerkUsers(clerkSecretKey),
      createUser: (email) => createSharedClerkTestUser(clerkSecretKey, email),
    });
    const clerkUserId = provisionedUser.id;
    const mappedEmail = provisionedUser.email;

    // ── 3. Map the Clerk user to the development tenant in PostgreSQL ───────
    await db.query("BEGIN");

    const tenantRes = await db.query<{ id: number }>(
      "SELECT id FROM tenants WHERE slug = $1 AND is_active = true LIMIT 1",
      [TENANT_SLUG],
    );
    const tenantId = tenantRes.rows[0]?.id;
    if (!tenantId) {
      throw new Error(`No active E2E tenant found for slug ${TENANT_SLUG}`);
    }

    // Keep the shared winery fixture usable without exercising Stripe. This
    // row is deliberately local-only (no Stripe subscription identifiers), so
    // billing webhooks cannot update or cancel it.
    const viticultureFarmRes = await db.query<{ name: string }>(
      `SELECT name
         FROM farms
        WHERE id = $1 AND tenant_id = $2 AND is_active = true
        LIMIT 1`,
      [VITICULTURE_FARM_ID, tenantId],
    );
    const viticultureFarm = viticultureFarmRes.rows[0];
    if (!viticultureFarm) {
      throw new Error(
        `Stable Viticulture E2E farm ${VITICULTURE_FARM_ID} is missing or inactive ` +
          `for tenant ${TENANT_SLUG}`,
      );
    }

    await db.query(
      `UPDATE farms
          SET sector_viticulture = true,
              sbi_number = COALESCE(NULLIF(BTRIM(sbi_number), ''), $3),
              updated_at = NOW()
        WHERE id = $1 AND tenant_id = $2`,
      [VITICULTURE_FARM_ID, tenantId, VITICULTURE_FIXTURE_SBI],
    );

    await db.query(
      `INSERT INTO vineyard_blocks
         (farm_id, block_name, block_ref, field_parcel_ref, aspect, soil_type, notes)
       SELECT $1, $2, 'E2E-REG', 'E2E-PARCEL-001', 'South', 'Loam',
              'Stable registration fixture for authenticated viticulture browser checks'
        WHERE NOT EXISTS (
          SELECT 1 FROM vineyard_blocks WHERE farm_id = $1
        )`,
      [VITICULTURE_FARM_ID, VITICULTURE_FIXTURE_BLOCK_NAME],
    );

    const viticultureModuleRes = await db.query<{ id: number }>(
      "SELECT id FROM modules WHERE key = 'viticulture' AND is_active = true LIMIT 1",
    );
    const viticultureModuleId = viticultureModuleRes.rows[0]?.id;
    if (!viticultureModuleId) {
      throw new Error("Active Viticulture module is missing from the module catalogue");
    }

    await db.query(
      `WITH activated AS (
         UPDATE subscriptions
            SET status = 'active',
                stripe_subscription_id = NULL,
                stripe_subscription_item_id = NULL,
                current_period_start = NULL,
                current_period_end = NULL,
                updated_at = NOW()
          WHERE tenant_id = $1 AND farm_id = $2 AND module_id = $3
            AND stripe_subscription_id IS NULL
            AND stripe_subscription_item_id IS NULL
          RETURNING id
       )
       INSERT INTO subscriptions
         (tenant_id, farm_id, module_id, status, stripe_subscription_id, stripe_subscription_item_id)
       SELECT $1, $2, $3, 'active', NULL, NULL
        WHERE NOT EXISTS (SELECT 1 FROM activated)`,
      [tenantId, VITICULTURE_FARM_ID, viticultureModuleId],
    );

    const roleRes = await db.query<{ id: number }>("SELECT id FROM roles LIMIT 1");
    const roleId = roleRes.rows[0]?.id;
    if (!roleId) throw new Error("No roles found in database");

    // Tenant discovery joins user_tenants to users. Keep the Clerk test
    // identity represented in the application's user table as well as in the
    // tenant mapping, otherwise an authenticated preview has no organisation
    // to select.
    await db.query(
      `INSERT INTO users (id, email, first_name, last_name, created_at, updated_at)
       VALUES ($1, $2, 'E2E', 'Tester', NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name, updated_at = NOW()`,
      [clerkUserId, mappedEmail],
    );

    // This identity is reserved for dashboard E2E runs. Remove stale
    // cross-tenant mappings so tenant discovery cannot select the wrong farm.
    await db.query(
      "DELETE FROM user_tenants WHERE user_id = $1 AND tenant_id <> $2",
      [clerkUserId, tenantId],
    );

    await db.query(
      `INSERT INTO user_tenants (user_id, tenant_id, role_id, is_super_admin, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, true, true, NOW(), NOW())
       ON CONFLICT (user_id, tenant_id) DO UPDATE SET is_super_admin = true, is_active = true`,
      [clerkUserId, tenantId, roleId],
    );

    const organicFixtureFarm = await provisionOrganicInputFixture(
      db,
      tenantId,
      TENANT_SLUG,
    );
    await db.query("COMMIT");

    // Publish the run identity only after its application mapping commits. If
    // setup fails, specs cannot accidentally consume a half-provisioned user.
    fs.writeFileSync(STATE_FILE, clerkUserId, "utf-8");
    fs.writeFileSync(EMAIL_FILE, mappedEmail, "utf-8");

    // Prove the exact sign-in flow used by authenticated specs creates a Clerk
    // session before any feature test starts. A rejected testing token now
    // fails setup with an authentication-specific error instead of making each
    // spec time out while waiting for unrelated dashboard controls.
    await verifyDashboardAuthentication(config, mappedEmail);

    console.log(
      `[e2e] Test user ${provisionedUser.reused ? "reused" : "created"}: ` +
        `${clerkUserId} (${mappedEmail}) → tenant ${TENANT_SLUG}; ` +
        `Viticulture fixture ${VITICULTURE_FARM_ID} (${viticultureFarm.name}) registration-ready; ` +
        `organic fixture farm ${organicFixtureFarm.farmId}`,
    );
  } catch (error) {
    await db.query("ROLLBACK").catch(() => undefined);
    fs.rmSync(STATE_FILE, { force: true });
    fs.rmSync(EMAIL_FILE, { force: true });
    throw error;
  } finally {
    await db.end();
  }
}