export const SHARED_E2E_TEST_EMAIL = "e2e-dashboard@bde-test.example.com";

const LEGACY_E2E_TEST_EMAIL = /^e2e-\d+-\d+@bde-test\.example\.com$/i;

export interface ClerkUserRecord {
  id: string;
  email_addresses?: Array<{ email_address?: string | null }>;
}

export interface ReusableClerkTestUser {
  id: string;
  email: string;
}

export interface ProvisionedClerkTestUser extends ReusableClerkTestUser {
  reused: boolean;
}

/**
 * Select the persistent dashboard E2E identity from Clerk's user list.
 *
 * The legacy pattern is intentionally limited to the test-only domain and the
 * old e2e-<task>-<timestamp> shape. This lets a run adopt identities leaked by
 * any interrupted historical dashboard suite without selecting real users.
 */
export function findReusableClerkTestUser(
  users: ClerkUserRecord[],
  preferredEmail = SHARED_E2E_TEST_EMAIL,
): ReusableClerkTestUser | null {
  const candidates = users.flatMap((user) =>
    (user.email_addresses ?? [])
      .map((address) => address.email_address?.trim() ?? "")
      .filter((email): email is string => Boolean(email))
      .map((email) => ({ id: user.id, email })),
  );

  const sharedUser = candidates.find(
    (candidate) => candidate.email.toLowerCase() === preferredEmail.toLowerCase(),
  );
  if (sharedUser) return sharedUser;

  return (
    candidates
      .filter((candidate) => LEGACY_E2E_TEST_EMAIL.test(candidate.email))
      .sort((a, b) => a.email.localeCompare(b.email))[0] ?? null
  );
}

/**
 * Reuse the reserved identity before attempting creation. If creation loses a
 * race or hits quota, refresh once so an identity created by another run (or a
 * legacy generated identity at capacity) can still be adopted.
 */
export async function provisionReusableClerkTestUser({
  preferredEmail = SHARED_E2E_TEST_EMAIL,
  listUsers,
  createUser,
}: {
  preferredEmail?: string;
  listUsers: () => Promise<ClerkUserRecord[]>;
  createUser: (email: string) => Promise<ReusableClerkTestUser>;
}): Promise<ProvisionedClerkTestUser> {
  const existing = findReusableClerkTestUser(
    await listUsers(),
    preferredEmail,
  );
  if (existing) return { ...existing, reused: true };

  try {
    const created = await createUser(preferredEmail);
    return { ...created, reused: false };
  } catch (error) {
    const refreshed = findReusableClerkTestUser(
      await listUsers(),
      preferredEmail,
    );
    if (refreshed) return { ...refreshed, reused: true };

    const message = error instanceof Error ? error.message : String(error);
    const isQuotaError = /quota|user_quota_exceeded/i.test(message);
    throw new Error(
      isQuotaError
        ? `${message}; the tenant is at quota and no reusable E2E test identity was found`
        : message,
    );
  }
}
