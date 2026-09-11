/**
 * Regression test for overdue milestone email recipient preferences.
 *
 * Run with:
 *   pnpm --filter @workspace/api-server run test:agri-env-milestone-email-preferences
 */

import assert from "node:assert/strict";
import { db, pool } from "@workspace/db";
import { sql } from "drizzle-orm";
import { getMilestoneOverdueEmailRecipients } from "../src/lib/alertingJob.js";

async function main(): Promise<void> {
  const suffix = `${Date.now()}-${process.pid}`;
  const tenantSlug = `milestone-email-preferences-${suffix}`;
  const selectedEmail = `milestone-alerts-on-${suffix}@example.test`;
  const optedOutEmail = `milestone-alerts-off-${suffix}@example.test`;
  const inactiveEmail = `milestone-alerts-inactive-${suffix}@example.test`;
  const userIds = {
    selected: `milestone-alerts-on-${suffix}`,
    optedOut: `milestone-alerts-off-${suffix}`,
    inactive: `milestone-alerts-inactive-${suffix}`,
    noEmail: `milestone-alerts-no-email-${suffix}`,
  };

  let tenantId: number | undefined;
  let roleId: number | undefined;

  try {
    const tenantRows = await db.execute(sql`
      INSERT INTO tenants (name, slug, contact_email)
      VALUES (
        ${`Milestone email preference test ${suffix}`},
        ${tenantSlug},
        ${`milestone-tenant-${suffix}@example.test`}
      )
      RETURNING id
    `);
    tenantId = Number((tenantRows.rows[0] as { id: number }).id);

    const roleRows = await db.execute(sql`
      INSERT INTO roles (tenant_id, name, is_system_role)
      VALUES (${tenantId}, ${`Milestone email preference role ${suffix}`}, false)
      RETURNING id
    `);
    roleId = Number((roleRows.rows[0] as { id: number }).id);

    await db.execute(sql`
      INSERT INTO users (id, email, first_name, last_name)
      VALUES
        (${userIds.selected}, ${selectedEmail}, ${"Alerts"}, ${"Enabled"}),
        (${userIds.optedOut}, ${optedOutEmail}, ${"Alerts"}, ${"Disabled"}),
        (${userIds.inactive}, ${inactiveEmail}, ${"Inactive"}, ${"User"}),
        (${userIds.noEmail}, NULL, ${"Missing"}, ${"Email"})
    `);

    await db.execute(sql`
      INSERT INTO user_tenants
        (user_id, tenant_id, role_id, is_active, receive_alerts)
      VALUES
        (${userIds.selected}, ${tenantId}, ${roleId}, true, true),
        (${userIds.optedOut}, ${tenantId}, ${roleId}, true, false),
        (${userIds.inactive}, ${tenantId}, ${roleId}, false, true),
        (${userIds.noEmail}, ${tenantId}, ${roleId}, true, true)
    `);

    const recipients = await getMilestoneOverdueEmailRecipients(tenantId);

    assert.deepEqual(
      recipients,
      [{
        email: selectedEmail,
        firstName: "Alerts",
        lastName: "Enabled",
      }],
      "overdue milestone email must include only active tenant users with receiveAlerts=true and an email",
    );
    assert.ok(
      !recipients.some((recipient) => recipient.email === optedOutEmail),
      "receiveAlerts=false must exclude an active user from overdue milestone email",
    );

    console.log("✓ overdue milestone email preference guard passed");
    console.log(`  selected: ${selectedEmail}`);
    console.log(`  receiveAlerts=false: ${optedOutEmail} excluded`);
    console.log("  inactive and missing-email users: excluded");
  } finally {
    if (tenantId !== undefined) {
      await db.execute(sql`DELETE FROM user_tenants WHERE tenant_id = ${tenantId}`);
    }
    await db.execute(sql`
      DELETE FROM users
      WHERE id IN (
        ${userIds.selected},
        ${userIds.optedOut},
        ${userIds.inactive},
        ${userIds.noEmail}
      )
    `);
    if (roleId !== undefined) {
      await db.execute(sql`DELETE FROM roles WHERE id = ${roleId}`);
    }
    if (tenantId !== undefined) {
      await db.execute(sql`DELETE FROM tenants WHERE id = ${tenantId}`);
    }
    await pool.end();
  }
}

main().catch((err) => {
  console.error("✗ overdue milestone email preference guard failed");
  console.error(err);
  process.exitCode = 1;
});