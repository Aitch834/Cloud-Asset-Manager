/**
 * End-to-end regression test for sector alert issue emails.
 *
 * This test uses the production issue-notification function and mailer, but
 * points SMTP at a local capture server so no real advisor receives a test
 * email. It verifies county selection, advisor deduplication, delivery-outbox
 * persistence, the episode completion flag, failed-delivery retry age, and
 * retry deduplication.
 *
 * Run with:
 *   pnpm --filter @workspace/api-server run test:sector-alert-issue
 */

import assert from "node:assert/strict";
import net from "node:net";
import { db, pool } from "@workspace/db";
import { sql } from "drizzle-orm";
import { runSectorAlertMigrations } from "../src/lib/sectorAlertMigrations.js";

type CapturedMessage = {
  recipient: string;
  raw: string;
};

class SmtpCaptureServer {
  rejectData = false;

  private readonly server = net.createServer((socket) => {
    socket.setEncoding("utf8");
    let buffer = "";
    let inData = false;
    let data = "";
    let currentRecipient = "";

    socket.write("220 sector-alert-test.local ESMTP ready\r\n");

    const processBuffer = () => {
      while (true) {
        if (inData) {
          const end = buffer.indexOf("\r\n.\r\n");
          if (end === -1) return;
          data += buffer.slice(0, end);
          buffer = buffer.slice(end + 5);
          this.messages.push({ recipient: currentRecipient, raw: data });
          data = "";
          currentRecipient = "";
          inData = false;
          socket.write("250 2.0.0 queued\r\n");
          continue;
        }

        const lineEnd = buffer.indexOf("\r\n");
        if (lineEnd === -1) return;
        const line = buffer.slice(0, lineEnd);
        buffer = buffer.slice(lineEnd + 2);
        const command = line.toUpperCase();

        if (command.startsWith("EHLO") || command.startsWith("HELO")) {
          socket.write("250-sector-alert-test.local\r\n250-AUTH PLAIN LOGIN\r\n250 OK\r\n");
        } else if (command.startsWith("AUTH")) {
          socket.write("235 2.7.0 Authentication successful\r\n");
        } else if (command.startsWith("MAIL FROM")) {
          socket.write("250 2.1.0 sender ok\r\n");
        } else if (command.startsWith("RCPT TO")) {
          const match = line.match(/<([^>]+)>/);
          currentRecipient = match?.[1]?.toLowerCase() ?? "";
          socket.write("250 2.1.5 recipient ok\r\n");
        } else if (command === "DATA") {
          if (this.rejectData) {
            socket.write("451 4.3.0 temporary test failure\r\n");
          } else {
            inData = true;
            socket.write("354 End data with <CR><LF>.<CR><LF>\r\n");
          }
        } else if (command === "RSET") {
          socket.write("250 2.0.0 reset\r\n");
        } else if (command === "QUIT") {
          socket.write("221 2.0.0 closing connection\r\n");
          socket.end();
        } else {
          socket.write("250 2.0.0 ok\r\n");
        }
      }
    };

    socket.on("data", (chunk) => {
      buffer += chunk;
      processBuffer();
    });
  });

  readonly messages: CapturedMessage[] = [];

  async listen(): Promise<number> {
    await new Promise<void>((resolve, reject) => {
      this.server.once("error", reject);
      this.server.listen(0, "127.0.0.1", () => resolve());
    });
    const address = this.server.address();
    assert(address && typeof address !== "string", "SMTP capture server did not open a TCP port");
    return address.port;
  }

  async close(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.server.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

function uniqueSuffix(): string {
  return `${Date.now()}-${process.pid}`;
}

async function main(): Promise<void> {
  const suffix = uniqueSuffix();
  const testEmail = `sector-alert-e2e-${suffix}@example.test`;
  const secondEmail = `sector-alert-e2e-second-${suffix}@example.test`;
  const revokedEmail = `sector-alert-e2e-revoked-${suffix}@example.test`;
  const outsideCountyEmail = `sector-alert-e2e-outside-${suffix}@example.test`;
  const testCounty = `Sector Alert Test County ${suffix}`;
  const otherCounty = `Sector Alert Other County ${suffix}`;
  const slug = `sector-alert-e2e-${suffix}`;
  const tokenPrefix = `sector-alert-e2e-token-${suffix}`;
  const smtp = new SmtpCaptureServer();
  const smtpPort = await smtp.listen();
  const issuedAt = new Date(Date.now() - (3 * 86_400_000) - (5 * 60_000));

  // mailer.ts reads its SMTP settings at module evaluation time.
  process.env.SMTP_HOST = "127.0.0.1";
  process.env.SMTP_PORT = String(smtpPort);
  process.env.SMTP_USER = "sector-alert-test";
  process.env.SMTP_PASS = "sector-alert-test";
  process.env.SMTP_FROM = "test@bdefarmtrac.co.uk";

  let tenantId: number | undefined;
  let episodeId: number | undefined;
  let relevantFarmId: number | undefined;
  let outsideFarmId: number | undefined;

  try {
    await runSectorAlertMigrations();
    // Dynamic import is intentional: SMTP settings above must be read before
    // alertingJob imports mailer.ts.
    const { runSectorAlertIssueNotifications } = await import("../src/lib/alertingJob.js");

    const tenantRows = await db.execute(sql`
      INSERT INTO tenants (name, slug, contact_email)
      VALUES (${`Sector alert E2E ${suffix}`}, ${slug}, ${`tenant-${suffix}@example.test`})
      RETURNING id
    `);
    tenantId = Number((tenantRows.rows[0] as { id: number }).id);

    const farmRows = await db.execute(sql`
      INSERT INTO farms (tenant_id, name, county)
      VALUES (${tenantId}, ${`Relevant farm ${suffix}`}, ${testCounty})
      RETURNING id
    `);
    relevantFarmId = Number((farmRows.rows[0] as { id: number }).id);

    const outsideRows = await db.execute(sql`
      INSERT INTO farms (tenant_id, name, county)
      VALUES (${tenantId}, ${`Outside farm ${suffix}`}, ${otherCounty})
      RETURNING id
    `);
    outsideFarmId = Number((outsideRows.rows[0] as { id: number }).id);

    await db.execute(sql`
      INSERT INTO farm_advisors
        (farm_id, invited_by_user_id, advisor_email, advisor_name, advisor_role, token, status)
      VALUES
        (${relevantFarmId}, ${"sector-alert-e2e"}, ${testEmail}, ${"Primary advisor"}, ${"Agronomist"}, ${`${tokenPrefix}-primary`}, ${"accepted"}),
        (${relevantFarmId}, ${"sector-alert-e2e"}, ${testEmail.toUpperCase()}, ${"Duplicate casing"}, ${"Agronomist"}, ${`${tokenPrefix}-duplicate`}, ${"accepted"}),
        (${relevantFarmId}, ${"sector-alert-e2e"}, ${secondEmail}, ${"Second advisor"}, ${"Agronomist"}, ${`${tokenPrefix}-second`}, ${"accepted"}),
        (${relevantFarmId}, ${"sector-alert-e2e"}, ${revokedEmail}, ${"Revoked advisor"}, ${"Agronomist"}, ${`${tokenPrefix}-revoked`}, ${"accepted"}),
        (${outsideFarmId}, ${"sector-alert-e2e"}, ${outsideCountyEmail}, ${"Outside county advisor"}, ${"Agronomist"}, ${`${tokenPrefix}-outside`}, ${"accepted"})
    `);
    await db.execute(sql`
      UPDATE farm_advisors
      SET revoked_at = now()
      WHERE token = ${`${tokenPrefix}-revoked`}
    `);

    const episodeRows = await db.execute(sql`
      INSERT INTO sector_alert_episodes (sector, level, message, counties, issued_at, issued_by)
      VALUES (${"arable"}, ${"regional"}, ${"E2E sector alert message"}, ${testCounty}, ${issuedAt}, ${"sector-alert-e2e"})
      RETURNING id
    `);
    episodeId = Number((episodeRows.rows[0] as { id: number }).id);
    assert(episodeId !== undefined, "test episode was not created");

    smtp.rejectData = true;
    await runSectorAlertIssueNotifications(episodeId);

    assert.equal(
      smtp.messages.length,
      0,
      "temporarily rejected SMTP sends must not be recorded as captured deliveries",
    );
    const failedDeliveries = await db.execute(sql`
      SELECT count(*)::int AS count
      FROM sector_alert_email_deliveries
      WHERE episode_id = ${episodeId} AND kind = 'issue'
    `);
    assert.equal(
      Number((failedDeliveries.rows[0] as { count: number }).count),
      0,
      "failed issue sends must not create delivery-outbox rows",
    );
    const failedEpisode = await db.execute(sql`
      SELECT issue_email_notified
      FROM sector_alert_episodes
      WHERE id = ${episodeId}
    `);
    assert.equal(
      (failedEpisode.rows[0] as { issue_email_notified: boolean }).issue_email_notified,
      false,
      "episode must remain incomplete while issue email delivery is pending",
    );

    smtp.rejectData = false;
    await runSectorAlertIssueNotifications(episodeId);

    const firstRecipients = smtp.messages.map((message) => message.recipient).sort();
    assert.deepEqual(
      firstRecipients,
      [testEmail, secondEmail].sort(),
      "only active advisors on farms in the episode county should receive one email each",
    );
    assert.equal(
      smtp.messages.filter((message) => message.raw.length > 0).length,
      2,
      "both accepted deliveries should contain a non-empty email payload",
    );
    assert.equal(
      smtp.messages.every((message) =>
        message.raw.replace(/=\r?\n/g, "").includes("(issued 3 days ago)"),
      ),
      true,
      "retried issue emails must calculate age from the episode's original issued_at",
    );

    const firstDeliveries = await db.execute(sql`
      SELECT email_norm, kind
      FROM sector_alert_email_deliveries
      WHERE episode_id = ${episodeId}
      ORDER BY email_norm
    `);
    assert.deepEqual(
      firstDeliveries.rows,
      [testEmail, secondEmail]
        .sort()
        .map((email_norm) => ({ email_norm, kind: "issue" })),
      "successful issue sends should be recorded in the issue outbox",
    );

    const firstEpisode = await db.execute(sql`
      SELECT issue_email_notified
      FROM sector_alert_episodes
      WHERE id = ${episodeId}
    `);
    assert.equal(
      (firstEpisode.rows[0] as { issue_email_notified: boolean }).issue_email_notified,
      true,
      "episode should be marked complete after all issue emails are sent",
    );

    await runSectorAlertIssueNotifications(episodeId);
    assert.equal(
      smtp.messages.length,
      2,
      "a second job run must not re-send already delivered issue emails",
    );

    const secondDeliveries = await db.execute(sql`
      SELECT count(*)::int AS count
      FROM sector_alert_email_deliveries
      WHERE episode_id = ${episodeId} AND kind = 'issue'
    `);
    assert.equal(
      Number((secondDeliveries.rows[0] as { count: number }).count),
      2,
      "a second job run must not add duplicate issue outbox rows",
    );

    console.log("✓ sector alert issue email flow passed");
    console.log(`  recipients: ${firstRecipients.join(", ")}`);
    console.log("  failed first attempt: no outbox rows and episode remained pending");
    console.log("  retried email age: issued 3 days ago");
    console.log("  issue_email_notified: true");
    console.log("  second run: no additional sends");
  } finally {
    if (episodeId !== undefined) {
      await db.execute(sql`DELETE FROM sector_alert_episodes WHERE id = ${episodeId}`);
    }
    if (relevantFarmId !== undefined || outsideFarmId !== undefined) {
      await db.execute(sql`
        DELETE FROM farm_advisors
        WHERE farm_id IN (${relevantFarmId ?? -1}, ${outsideFarmId ?? -1})
      `);
    }
    if (tenantId !== undefined) {
      await db.execute(sql`DELETE FROM farms WHERE tenant_id = ${tenantId}`);
      await db.execute(sql`DELETE FROM tenants WHERE id = ${tenantId}`);
    }
    await smtp.close();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("✗ sector alert issue email flow failed");
  console.error(err);
  process.exitCode = 1;
});
