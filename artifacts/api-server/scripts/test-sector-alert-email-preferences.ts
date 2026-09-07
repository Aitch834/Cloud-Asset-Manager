/**
 * Regression test for platform-user sector alert email preferences.
 *
 * It creates advisor contacts whose addresses match opted-out and opted-in
 * platform users, then verifies that both issue and all-clear jobs skip the
 * opted-out address while delivering each message to the opted-in address.
 *
 * Run with:
 *   pnpm --filter @workspace/api-server run test:sector-alert-email-preferences
 */

import assert from "node:assert/strict";
import nodemailer from "nodemailer";
import { db, pool } from "@workspace/db";
import { sql } from "drizzle-orm";
import { runSectorAlertMigrations } from "../src/lib/sectorAlertMigrations.js";

type CapturedMessage = {
  to?: string;
  subject?: string;
};

function recipientAddress(to: string | undefined): string {
  const address = to?.match(/<([^>]+)>/)?.[1] ?? to;
  assert.ok(address, "captured email did not include a recipient address");
  return address.toLowerCase();
}

function uniqueSuffix(): string {
  return `${Date.now()}-${process.pid}`;
}

async function main(): Promise<void> {
  const suffix = uniqueSuffix();
  const optedOutEmail = `sector-alert-opted-out-${suffix}@example.test`;
  const optedInEmail = `sector-alert-opted-in-${suffix}@example.test`;
  const optedOutUserId = `sector-alert-opted-out-user-${suffix}`;
  const optedInUserId = `sector-alert-opted-in-user-${suffix}`;
  const slug = `sector-alert-email-preferences-${suffix}`;
  const tokenPrefix = `sector-alert-email-preferences-${suffix}`;
  const county = `Sector Alert Preference Test County ${suffix}`;
  const capturedMessages: CapturedMessage[] = [];
  const fakeTransport = {
    async sendMail(message: CapturedMessage) {
      capturedMessages.push(message);
      return {
        response: "250 test transport",
        messageId: `<sector-alert-email-preferences-${suffix}>`,
        accepted: [message.to ?? "test@example.com"],
        rejected: [],
      };
    },
  };
  const originalCreateTransport = nodemailer.createTransport;
  nodemailer.createTransport = (() => fakeTransport) as typeof nodemailer.createTransport;

  let tenantId: number | undefined;
  let farmId: number | undefined;
  let episodeId: number | undefined;

  process.env.SESSION_SECRET ??= `sector-alert-email-preferences-secret-${suffix}`;

  try {
    await runSectorAlertMigrations();
    // Dynamic import keeps the patched transport in place before mailer.ts is evaluated.
    const {
      runSectorAlertIssueNotifications,
      runSectorAlertAllClearNotifications,
    } = await import("../src/lib/alertingJob.js");

    const tenantRows = await db.execute(sql`
      INSERT INTO tenants (name, slug, contact_email)
      VALUES (${`Sector alert email preferences ${suffix}`}, ${slug}, ${`tenant-${suffix}@example.test`})
      RETURNING id
    `);
    tenantId = Number((tenantRows.rows[0] as { id: number }).id);

    const farmRows = await db.execute(sql`
      INSERT INTO farms (tenant_id, name, county)
      VALUES (${tenantId}, ${`Sector alert preference farm ${suffix}`}, ${county})
      RETURNING id
    `);
    farmId = Number((farmRows.rows[0] as { id: number }).id);

    await db.execute(sql`
      INSERT INTO users (id, email, email_sector_alerts)
      VALUES
        (${optedOutUserId}, ${optedOutEmail}, false),
        (${optedInUserId}, ${optedInEmail}, true)
    `);

    await db.execute(sql`
      INSERT INTO farm_advisors
        (farm_id, invited_by_user_id, advisor_email, advisor_name, advisor_role, token, status)
      VALUES
        (${farmId}, ${optedOutUserId}, ${optedOutEmail.toUpperCase()}, ${"Opted-out advisor"}, ${"Agronomist"}, ${`${tokenPrefix}-opted-out`}, ${"accepted"}),
        (${farmId}, ${optedInUserId}, ${optedInEmail}, ${"Opted-in advisor"}, ${"Agronomist"}, ${`${tokenPrefix}-opted-in`}, ${"accepted"})
    `);

    const episodeRows = await db.execute(sql`
      INSERT INTO sector_alert_episodes
        (sector, level, message, counties, issued_at, issued_by)
      VALUES
        (${"arable"}, ${"high"}, ${"Preference regression test alert"}, ${county}, ${new Date(Date.now() - 86_400_000)}, ${"sector-alert-email-preferences"})
      RETURNING id
    `);
    episodeId = Number((episodeRows.rows[0] as { id: number }).id);

    await runSectorAlertIssueNotifications(episodeId);

    assert.deepEqual(
      capturedMessages.map((message) => recipientAddress(message.to)),
      [optedInEmail],
      "issue email delivery must skip the platform user who opted out",
    );
    const issueDeliveries = await db.execute(sql`
      SELECT email_norm, kind
      FROM sector_alert_email_deliveries
      WHERE episode_id = ${episodeId}
      ORDER BY kind, email_norm
    `);
    assert.deepEqual(
      issueDeliveries.rows,
      [{ email_norm: optedInEmail, kind: "issue" }],
      "issue outbox must contain only the opted-in address",
    );

    capturedMessages.length = 0;
    await db.execute(sql`
      UPDATE sector_alert_episodes
      SET ended_at = now(), ended_reason = ${"Preference regression test complete"}
      WHERE id = ${episodeId}
    `);
    await runSectorAlertAllClearNotifications();

    assert.deepEqual(
      capturedMessages.map((message) => recipientAddress(message.to)),
      [optedInEmail],
      "all-clear email delivery must skip the platform user who opted out",
    );
    const allDeliveries = await db.execute(sql`
      SELECT email_norm, kind
      FROM sector_alert_email_deliveries
      WHERE episode_id = ${episodeId}
      ORDER BY kind, email_norm
    `);
    assert.deepEqual(
      allDeliveries.rows,
      [
        { email_norm: optedInEmail, kind: "clear" },
        { email_norm: optedInEmail, kind: "issue" },
      ],
      "issue and all-clear outboxes must contain only the opted-in address",
    );

    const flags = await db.execute(sql`
      SELECT issue_email_notified, end_email_notified
      FROM sector_alert_episodes
      WHERE id = ${episodeId}
    `);
    assert.deepEqual(
      flags.rows[0],
      { issue_email_notified: true, end_email_notified: true },
      "both email paths should complete after the applicable opted-in delivery",
    );

    console.log("✓ sector alert email preference flow passed");
    console.log(`  issue recipient: ${optedInEmail}`);
    console.log(`  all-clear recipient: ${optedInEmail}`);
    console.log("  opted-out address: skipped by both paths");
  } finally {
    if (episodeId !== undefined) {
      await db.execute(sql`DELETE FROM sector_alert_episodes WHERE id = ${episodeId}`);
    }
    if (farmId !== undefined) {
      await db.execute(sql`DELETE FROM farm_advisors WHERE farm_id = ${farmId}`);
    }
    await db.execute(sql`
      DELETE FROM users
      WHERE id IN (${optedOutUserId}, ${optedInUserId})
    `);
    if (farmId !== undefined) {
      await db.execute(sql`DELETE FROM farms WHERE id = ${farmId}`);
    }
    if (tenantId !== undefined) {
      await db.execute(sql`DELETE FROM tenants WHERE id = ${tenantId}`);
    }
    nodemailer.createTransport = originalCreateTransport;
    await pool.end();
  }
}

main().catch((err) => {
  console.error("✗ sector alert email preference flow failed");
  console.error(err);
  process.exitCode = 1;
});