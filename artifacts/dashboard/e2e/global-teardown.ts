/**
 * Playwright global teardown — removes the Clerk test user created in
 * global-setup.ts and the corresponding user_tenants row.
 */

import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATE_FILE = path.join(__dirname, ".test-user-id");
const EMAIL_FILE = path.join(__dirname, ".test-user-email");

export default async function globalTeardown() {
  if (!fs.existsSync(STATE_FILE)) return;

  const clerkUserId = fs.readFileSync(STATE_FILE, "utf-8").trim();
  fs.rmSync(STATE_FILE, { force: true });
  fs.rmSync(EMAIL_FILE, { force: true });

  if (!clerkUserId) return;

  // ── Remove DB mapping ─────────────────────────────────────────────────────
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    await db.query("DELETE FROM user_tenants WHERE user_id = $1", [clerkUserId]);
  } finally {
    await db.end();
  }

  // ── Delete the Clerk user via the Backend API ─────────────────────────────
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  if (!clerkSecretKey) return;

  const delRes = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${clerkSecretKey}` },
  });

  if (delRes.ok) {
    console.log(`[e2e] Test user deleted: ${clerkUserId}`);
  } else {
    console.warn(`[e2e] Could not delete Clerk test user ${clerkUserId}: ${delRes.status}`);
  }
}
