/**
 * Playwright global teardown — removes only transient state from the test
 * process. The Clerk identity is intentionally persistent so the next run
 * does not consume another development-tenant user slot.
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATE_FILE = path.join(__dirname, ".test-user-id");
const EMAIL_FILE = path.join(__dirname, ".test-user-email");

export default async function globalTeardown() {
  const clerkUserId = fs.existsSync(STATE_FILE)
    ? fs.readFileSync(STATE_FILE, "utf-8").trim()
    : "";
  fs.rmSync(STATE_FILE, { force: true });
  fs.rmSync(EMAIL_FILE, { force: true });

  if (!clerkUserId) return;

  console.log(
    `[e2e] Retaining persistent Clerk test user ${clerkUserId}; ` +
      "its tenant mapping is reused by the next run",
  );
}
