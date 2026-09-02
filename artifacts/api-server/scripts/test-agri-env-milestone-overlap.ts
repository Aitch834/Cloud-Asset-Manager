/**
 * Regression test for overlapping overdue agri-environment milestone jobs.
 *
 * The first job is held at the SMTP server while it is delivering. A second
 * job starts during that delivery and must lose the atomic alert lease claim,
 * so the milestone produces one email rather than two.
 *
 * Run with:
 *   pnpm --filter @workspace/api-server run test:agri-env-milestone-overlap
 */

import assert from "node:assert/strict";
import net from "node:net";
import { db, pool } from "@workspace/db";
import { sql } from "drizzle-orm";
import { runAgriEnvMigrations } from "../src/lib/agriEnvMigrations.js";

type CapturedMessage = {
  recipient: string;
  raw: string;
};

class SmtpCaptureServer {
  readonly messages: CapturedMessage[] = [];
  private readonly responseDelayMs = 300;
  private readonly firstMessageStartedPromise: Promise<void>;
  private resolveFirstMessageStarted!: () => void;
  private firstMessageStarted = false;

  private readonly server = net.createServer((socket) => {
    socket.setEncoding("utf8");
    let buffer = "";
    let inData = false;
    let data = "";
    let currentRecipient = "";

    socket.write("220 milestone-overlap-test.local ESMTP ready\r\n");

    const processBuffer = () => {
      while (true) {
        if (inData) {
          const end = buffer.indexOf("\r\n.\r\n");
          if (end === -1) return;

          data += buffer.slice(0, end);
          buffer = buffer.slice(end + 5);
          this.messages.push({ recipient: currentRecipient, raw: data });
          if (!this.firstMessageStarted) {
            this.firstMessageStarted = true;
            this.resolveFirstMessageStarted();
          }
          data = "";
          currentRecipient = "";
          inData = false;
          setTimeout(() => socket.write("250 2.0.0 queued\r\n"), this.responseDelayMs);
          continue;
        }

        const lineEnd = buffer.indexOf("\r\n");
        if (lineEnd === -1) return;
        const line = buffer.slice(0, lineEnd);
        buffer = buffer.slice(lineEnd + 2);
        const command = line.toUpperCase();

        if (command.startsWith("EHLO") || command.startsWith("HELO")) {
          socket.write("250-milestone-overlap-test.local\r\n250-AUTH PLAIN\r\n250 OK\r\n");
        } else if (command.startsWith("AUTH")) {
          socket.write("235 2.7.0 Authentication successful\r\n");
        } else if (command.startsWith("MAIL FROM")) {
          socket.write("250 2.1.0 sender ok\r\n");
        } else if (command.startsWith("RCPT TO")) {
          const match = line.match(/<([^>]+)>/);
          currentRecipient = match?.[1]?.toLowerCase() ?? "";
          socket.write("250 2.1.5 recipient ok\r\n");
        } else if (command === "DATA") {
          inData = true;
          socket.write("354 End data with <CR><LF>.<CR><LF>\r\n");
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

  constructor() {
    this.firstMessageStartedPromise = new Promise<void>((resolve) => {
      this.resolveFirstMessageStarted = resolve;
    });
  }

  async listen(): Promise<number> {
    await new Promise<void>((resolve, reject) => {
      this.server.once("error", reject);
      this.server.listen(0, "127.0.0.1", () => resolve());
    });
    const address = this.server.address();
    assert(address && typeof address !== "string", "SMTP capture server did not open a TCP port");
    return address.port;
  }

  async waitForFirstMessage(timeoutMs = 5_000): Promise<void> {
    await Promise.race([
      this.firstMessageStartedPromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timed out waiting for the first SMTP delivery")), timeoutMs),
      ),
    ]);
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
  const slug = `agri-env-overlap-${suffix}`;
  const userId = `agri-env-overlap-user-${suffix}`;
  const testEmail = `agri-env-overlap-${suffix}@example.test`;
  const smtp = new SmtpCaptureServer();
  const smtpPort = await smtp.listen();

  // mailer.ts reads SMTP settings at module evaluation time.
  process.env.SMTP_HOST = "127.0.0.1";
  process.env.SMTP_PORT = String(smtpPort);
  process.env.SMTP_USER = "agri-env-overlap-test";
  process.env.SMTP_PASS = "agri-env-overlap-test";
  process.env.SMTP_FROM = "test@bdefarmtrac.co.uk";

  let tenantId: number | undefined;
  let farmId: number | undefined;
  let projectId: number | undefined;
  let milestoneId: number | undefined;
  let roleId: number | undefined;

  try {
    await runAgriEnvMigrations();
    // Dynamic import ensures the local SMTP settings are captured by mailer.ts.
    const { checkAgriEnvMilestoneDeadlines } = await import("../src/lib/alertingJob.js");

    const roleRows = await db.execute(sql`
      INSERT INTO roles (name, is_system_role)
      VALUES (${`Agri environment overlap test role ${suffix}`}, true)
      RETURNING id
    `);
    roleId = Number((roleRows.rows[0] as { id: number }).id);

    const tenantRows = await db.execute(sql`
      INSERT INTO tenants (name, slug, contact_email)
      VALUES (${`Agri environment overlap test ${suffix}`}, ${slug}, ${`tenant-${suffix}@example.test`})
      RETURNING id
    `);
    tenantId = Number((tenantRows.rows[0] as { id: number }).id);

    const farmRows = await db.execute(sql`
      INSERT INTO farms (tenant_id, name)
      VALUES (${tenantId}, ${`Overlap test farm ${suffix}`})
      RETURNING id
    `);
    farmId = Number((farmRows.rows[0] as { id: number }).id);

    const projectRows = await db.execute(sql`
      INSERT INTO agri_env_projects (farm_id, scheme_name)
      VALUES (${farmId}, ${"Overlap test scheme"})
      RETURNING id
    `);
    projectId = Number((projectRows.rows[0] as { id: number }).id);

    const milestoneRows = await db.execute(sql`
      INSERT INTO agri_env_milestones (farm_id, project_id, milestone_name, due_date, status)
      VALUES (${farmId}, ${projectId}, ${"Overlapping overdue milestone"}, ${"2020-01-01"}, ${"pending"})
      RETURNING id
    `);
    milestoneId = Number((milestoneRows.rows[0] as { id: number }).id);

    await db.execute(sql`
      INSERT INTO users (id, email, first_name, last_name)
      VALUES (${userId}, ${testEmail}, ${"Overlap"}, ${"Tester"})
    `);
    await db.execute(sql`
      INSERT INTO user_tenants (user_id, tenant_id, role_id, is_active)
      VALUES (${userId}, ${tenantId}, ${roleId}, true)
    `);

    // The first run remains unresolved while the SMTP server delays its 250
    // response. Starting the second run after DATA proves the job overlaps
    // the send path, rather than merely running two sequential jobs.
    const firstRun = checkAgriEnvMilestoneDeadlines();
    await smtp.waitForFirstMessage();
    const secondRun = checkAgriEnvMilestoneDeadlines();
    await Promise.all([firstRun, secondRun]);

    const capturedForTest = smtp.messages.filter((message) => message.recipient === testEmail);
    assert.equal(
      capturedForTest.length,
      1,
      "an overlapping job must produce exactly one email for the milestone recipient",
    );
    assert.match(capturedForTest[0]?.raw ?? "", /Overlapping overdue milestone/);

    const claimedRows = await db.execute(sql`
      SELECT alert_claimed_at, alerted_at
      FROM agri_env_milestones
      WHERE id = ${milestoneId}
    `);
    const claimed = claimedRows.rows[0] as {
      alert_claimed_at: string | null;
      alerted_at: string | null;
    };
    assert.ok(claimed.alert_claimed_at, "the winning run must claim the milestone send lease");
    assert.ok(claimed.alerted_at, "the winning run must finalize alerted_at after delivery");

    // A later run must also be guarded by alerted_at and must not resend.
    await checkAgriEnvMilestoneDeadlines();
    assert.equal(
      smtp.messages.filter((message) => message.recipient === testEmail).length,
      1,
      "a later run must skip a milestone whose alerted_at is already set",
    );

    console.log("✓ agri-environment milestone overlap guard passed");
    console.log("  concurrent runs: 2");
    console.log(`  captured sends for ${testEmail}: 1`);
    console.log("  alert_claimed_at and alerted_at: set");
    console.log("  later run: no additional send");
  } finally {
    if (farmId !== undefined) {
      // notifications.farm_id is intentionally retained rather than cascaded,
      // so remove the notification created by the alerting check first.
      await db.execute(sql`DELETE FROM notifications WHERE farm_id = ${farmId}`);
    }
    if (milestoneId !== undefined) {
      await db.execute(sql`DELETE FROM agri_env_milestones WHERE id = ${milestoneId}`);
    }
    if (projectId !== undefined) {
      await db.execute(sql`DELETE FROM agri_env_projects WHERE id = ${projectId}`);
    }
    if (farmId !== undefined) {
      await db.execute(sql`DELETE FROM farms WHERE id = ${farmId}`);
    }
    if (tenantId !== undefined) {
      await db.execute(sql`DELETE FROM user_tenants WHERE tenant_id = ${tenantId}`);
      await db.execute(sql`DELETE FROM tenants WHERE id = ${tenantId}`);
    }
    await db.execute(sql`DELETE FROM users WHERE id = ${userId}`);
    if (roleId !== undefined) {
      await db.execute(sql`DELETE FROM roles WHERE id = ${roleId}`);
    }
    await smtp.close();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("✗ agri-environment milestone overlap guard failed");
  console.error(err);
  process.exitCode = 1;
});