/**
 * Playwright global setup — prepares the persistent Clerk test identity and
 * maps it to the development tenant so the E2E tests can authenticate as a
 * super-admin.
 *
 * The user's Clerk ID is written to e2e/.test-user-id so each test file can
 * read it without repeating the setup.
 */

import { clerkSetup } from "@clerk/testing/playwright";
import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const TENANT_SLUG = "oakfield-farms";

export { TENANT_SLUG };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATE_FILE = path.join(__dirname, ".test-user-id");
const EMAIL_FILE = path.join(__dirname, ".test-user-email");
const DEFAULT_TEST_EMAIL = "e2e-dashboard@bde-test.example.com";
const CLERK_USERS_PAGE_SIZE = 100;

type ClerkUser = {
  id: string;
  created_at?: number;
  email_addresses?: Array<{ email_address?: string }>;
};

type ClerkUsersResponse =
  | ClerkUser[]
  | { data?: ClerkUser[]; total_count?: number };

function getUserEmails(user: ClerkUser): string[] {
  return (user.email_addresses ?? [])
    .map((address) => address.email_address?.trim().toLowerCase())
    .filter((email): email is string => Boolean(email));
}

async function listClerkUsers(secretKey: string): Promise<ClerkUser[]> {
  const users: ClerkUser[] = [];

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

function findUserByEmail(
  users: ClerkUser[],
  email: string,
): ClerkUser | undefined {
  return users.find((user) => getUserEmails(user).includes(email));
}

function findLegacyTestUser(users: ClerkUser[]): ClerkUser | undefined {
  return users.find((user) =>
    getUserEmails(user).some(
      (email) =>
        email.startsWith("e2e-") && email.endsWith("@bde-test.example.com"),
    ),
  );
}

export default async function globalSetup() {
  // ── 1. Configure Clerk for testing mode ──────────────────────────────────
  await clerkSetup();

  // ── 2. Create a Clerk test user via the Backend API ───────────────────────
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  if (!clerkSecretKey) throw new Error("CLERK_SECRET_KEY must be set");

  let clerkUserId: string;
  const configuredEmail = (
    process.env.PLAYWRIGHT_CLERK_USER_EMAIL ?? DEFAULT_TEST_EMAIL
  ).trim().toLowerCase();
  let mappedEmail = configuredEmail;
  let reusedExistingUser = false;

  // Look up the reserved identity before creating anything. This makes every
  // normal run independent of the Clerk development-user quota.
  let users = await listClerkUsers(clerkSecretKey);
  let reusable = findUserByEmail(users, configuredEmail);

  // Older runs used timestamped addresses. Reuse one of those as well rather
  // than attempting a create when a recoverable E2E identity already exists.
  if (!reusable) reusable = findLegacyTestUser(users);

  if (reusable) {
    clerkUserId = reusable.id;
    mappedEmail = getUserEmails(reusable).find(
      (email) => email === configuredEmail,
    ) ?? getUserEmails(reusable)[0] ?? configuredEmail;
    reusedExistingUser = true;
  } else {
    const createRes = await fetch("https://api.clerk.com/v1/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clerkSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: [configuredEmail],
        first_name: "E2E",
        last_name: "Dashboard Tester",
        skip_password_requirement: true,
      }),
    });

    if (createRes.ok) {
      const clerkUser = (await createRes.json()) as { id: string };
      clerkUserId = clerkUser.id;
    } else {
      const body = await createRes.text();
      const isQuotaError =
        createRes.status === 403 &&
        /quota|user_quota_exceeded/i.test(body);

      // A concurrent run may have created the reserved identity between the
      // lookup and POST. Refresh before treating the failure as fatal.
      users = await listClerkUsers(clerkSecretKey);
      reusable = findUserByEmail(users, configuredEmail);

      if (reusable) {
        clerkUserId = reusable.id;
        mappedEmail = getUserEmails(reusable).find(
          (email) => email === configuredEmail,
        ) ?? configuredEmail;
        reusedExistingUser = true;
      } else if (isQuotaError) {
        // Older runs used timestamped addresses. Adopt one of those once so
        // the suite can recover even when the tenant is already full.
        reusable = findLegacyTestUser(users);
        if (!reusable) {
          throw new Error(
            `Failed to create Clerk test user: ${createRes.status} ${body}; ` +
            "the tenant is at quota and no reusable E2E test identity was found",
          );
        }

        clerkUserId = reusable.id;
        mappedEmail = getUserEmails(reusable)[0] ?? configuredEmail;
        reusedExistingUser = true;
        console.warn(
          `[e2e] Adopting legacy test user ${clerkUserId} after Clerk quota response`,
        );
      } else {
        throw new Error(
          `Failed to create Clerk test user: ${createRes.status} ${body}`,
        );
      }
    }
  }

  // Persist the Clerk user ID and email for tests.
  fs.writeFileSync(STATE_FILE, clerkUserId, "utf-8");
  fs.writeFileSync(EMAIL_FILE, mappedEmail, "utf-8");

  // ── 3. Map the Clerk user to the development tenant in Postgres ───────────
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

    // This identity is reserved for dashboard E2E runs. Remove stale
    // cross-tenant mappings so tenant discovery cannot select the wrong farm.
    await db.query(
      "DELETE FROM user_tenants WHERE user_id = $1 AND tenant_id <> $2",
      [clerkUserId, tenantId],
    );

    // user_tenants.user_id stores the Clerk subject ID directly
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

  console.log(
    `[e2e] Test user ${reusedExistingUser ? "reused" : "created"}: ` +
      `${clerkUserId} (${mappedEmail}) → tenant ${TENANT_SLUG}`,
  );
}
