/**
 * Playwright global setup — creates a Clerk test user and maps them to the
 * development tenant so the E2E tests can authenticate as a super-admin.
 *
 * The created user's Clerk ID is written to e2e/.test-user-id so each
 * test file can read it without repeating the setup.
 */

import { clerkSetup } from "@clerk/testing/playwright";
import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const TENANT_ID = 1;            // oakfield-farms — development tenant
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;              // Highfield Vineyard (has viticulture module)

export { TENANT_SLUG, FARM_ID };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATE_FILE = path.join(__dirname, ".test-user-id");
const EMAIL_FILE = path.join(__dirname, ".test-user-email");

export default async function globalSetup() {
  // ── 1. Configure Clerk for testing mode ──────────────────────────────────
  await clerkSetup();

  // ── 2. Create a Clerk test user via the Backend API ───────────────────────
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  if (!clerkSecretKey) throw new Error("CLERK_SECRET_KEY must be set");

  // Create a new test user in Clerk. If an earlier interrupted E2E run left
  // enough generated users behind to hit Clerk's development quota, reuse one
  // of those test-only identities so the suite can run and teardown can remove
  // it normally.
  const testEmail = `e2e-1277-${Date.now()}@bde-test.example.com`;
  const createRes = await fetch("https://api.clerk.com/v1/users", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${clerkSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: [testEmail],
      first_name: "E2E",
      last_name: "Tester1277",
      skip_password_requirement: true,
    }),
  });

  let clerkUserId: string;
  let mappedEmail = testEmail;

  if (createRes.ok) {
    const clerkUser = await createRes.json() as { id: string };
    clerkUserId = clerkUser.id;
  } else {
    const body = await createRes.text();
    const usersRes = await fetch(
      "https://api.clerk.com/v1/users?limit=100&order_by=-created_at",
      { headers: { Authorization: `Bearer ${clerkSecretKey}` } },
    );

    if (!usersRes.ok) {
      throw new Error(
        `Failed to create Clerk test user: ${createRes.status} ${body}; ` +
        `fallback user lookup also failed: ${usersRes.status}`,
      );
    }

    const users = await usersRes.json() as Array<{
      id: string;
      email_addresses?: Array<{ email_address?: string }>;
    }>;
    const reusable = users
      .map(user => ({
        id: user.id,
        email: user.email_addresses?.[0]?.email_address ?? "",
      }))
      .find(user =>
        user.email.startsWith("e2e-") &&
        user.email.endsWith("@bde-test.example.com"),
      );

    if (!reusable) {
      throw new Error(
        `Failed to create Clerk test user: ${createRes.status} ${body}; ` +
        "no reusable E2E test identity was found",
      );
    }

    clerkUserId = reusable.id;
    mappedEmail = reusable.email;
    console.warn(`[e2e] Reusing interrupted-run test user: ${clerkUserId}`);
  }

  // Persist the Clerk user ID and email for tests and teardown
  fs.writeFileSync(STATE_FILE, clerkUserId, "utf-8");
  fs.writeFileSync(EMAIL_FILE, mappedEmail, "utf-8");

  // ── 3. Map the Clerk user to the development tenant in Postgres ───────────
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();

  try {
    // Find a valid role_id to satisfy the NOT NULL constraint on user_tenants
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

    // user_tenants.user_id stores the Clerk subject ID directly
    await db.query(
      `INSERT INTO user_tenants (user_id, tenant_id, role_id, is_super_admin, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, true, true, NOW(), NOW())
       ON CONFLICT (user_id, tenant_id) DO UPDATE SET is_super_admin = true, is_active = true`,
      [clerkUserId, TENANT_ID, roleId],
    );
  } finally {
    await db.end();
  }

  console.log(`[e2e] Test user created: ${clerkUserId} → tenant ${TENANT_SLUG}`);
}
