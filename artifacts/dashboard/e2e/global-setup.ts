/**
 * Playwright global setup — prepares the persistent Clerk test identity and
 * maps it to the development tenant so the E2E tests can authenticate as a
 * super-admin.
 *
 * The shared user's Clerk ID is written to e2e/.test-user-id so each test
 * file can read it without repeating the setup.
 */

import { clerkSetup } from "@clerk/testing/playwright";
import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import {
  provisionReusableClerkTestUser,
  SHARED_E2E_TEST_EMAIL,
  type ClerkUserRecord,
} from "../src/lib/e2e-test-user";

const TENANT_SLUG = "oakfield-farms";

export { TENANT_SLUG };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATE_FILE = path.join(__dirname, ".test-user-id");
const EMAIL_FILE = path.join(__dirname, ".test-user-email");

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

export default async function globalSetup() {
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

  const provisionedUser = await provisionReusableClerkTestUser({
    preferredEmail: configuredEmail,
    listUsers: () => listClerkUsers(clerkSecretKey),
    createUser: (email) => createSharedClerkTestUser(clerkSecretKey, email),
  });
  const clerkUserId = provisionedUser.id;
  const mappedEmail = provisionedUser.email;
  const reusedExistingUser = provisionedUser.reused;

  // ── 3. Map the Clerk user to the development tenant in PostgreSQL ─────────
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();

  try {
    await db.query("BEGIN");

    const tenantRes = await db.query<{ id: number }>(
      "SELECT id FROM tenants WHERE slug = $1 AND is_active = true LIMIT 1",
      [TENANT_SLUG],
    );
    const tenantId = tenantRes.rows[0]?.id;
    if (!tenantId) {
      throw new Error(`No active E2E tenant found for slug ${TENANT_SLUG}`);
    }

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
    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await db.end();
  }

  // Publish the run identity only after its application mapping commits. If
  // setup fails, specs cannot accidentally consume a half-provisioned user.
  fs.writeFileSync(STATE_FILE, clerkUserId, "utf-8");
  fs.writeFileSync(EMAIL_FILE, mappedEmail, "utf-8");

  console.log(
    `[e2e] Test user ${reusedExistingUser ? "reused" : "created"}: ` +
      `${clerkUserId} (${mappedEmail}) → tenant ${TENANT_SLUG}`,
  );
}