/**
 * Playwright global teardown — removes only transient state from the test
 * process. The Clerk identity and tenant mapping are intentionally persistent
 * so the next run does not consume another development-tenant user slot.
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

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

export default async function globalTeardown() {
  const clerkUserId = fs.existsSync(STATE_FILE)
    ? fs.readFileSync(STATE_FILE, "utf-8").trim()
    : "";

  // A failed setup can leave either marker behind. Removing both is
  // idempotent and does not touch the persistent Clerk user or tenant mapping.
  fs.rmSync(STATE_FILE, { force: true });
  fs.rmSync(EMAIL_FILE, { force: true });

  if (clerkUserId) {
    console.log(
      `[e2e] Retaining persistent Clerk test user ${clerkUserId}; ` +
        "its tenant mapping is reused by the next run",
    );
  }
}