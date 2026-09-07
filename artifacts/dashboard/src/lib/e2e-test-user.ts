export const SHARED_E2E_TEST_EMAIL = "e2e-dashboard@bde-test.example.com";

const LEGACY_E2E_TEST_EMAIL = /^e2e-1277-\d+@bde-test\.example\.com$/i;

export interface ClerkUserRecord {
  id: string;
  email_addresses?: Array<{ email_address?: string | null }>;
}

export interface ReusableClerkTestUser {
  id: string;
  email: string;
}

/**
 * Select the persistent dashboard E2E identity from Clerk's user list.
 *
 * The legacy pattern is included so a run can adopt a user left behind by the
 * old per-run setup without creating another account first.
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