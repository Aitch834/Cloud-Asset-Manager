import assert from "node:assert/strict";
import nodemailer from "nodemailer";

// The mailer reads these at module initialisation. A fake SMTP password enables
// sendAdminEmail while the patched transport keeps this test entirely offline.
process.env.SMTP_PASS = "sector-alert-email-age-test";
process.env.SESSION_SECRET ??= "sector-alert-email-age-test-session-secret";

type CapturedMessage = {
  html?: string;
  subject?: string;
  to?: string;
};

const capturedMessages: CapturedMessage[] = [];
const fakeTransport = {
  async sendMail(message: CapturedMessage) {
    capturedMessages.push(message);
    return {
      response: "250 test transport",
      messageId: "<sector-alert-email-age-test>",
      accepted: [message.to ?? "test@example.com"],
      rejected: [],
    };
  },
};

const originalCreateTransport = nodemailer.createTransport;
nodemailer.createTransport = (() => fakeTransport) as typeof nodemailer.createTransport;

const { sendSectorAlertIssuedEmail, sendSectorAlertAllClearEmail } = await import("../src/lib/mailer.js");

const DAY_MS = 86_400_000;
const now = Date.now();

function latestHtml(): string {
  const html = capturedMessages.at(-1)?.html;
  assert.ok(html, "expected the fake transport to receive rendered HTML");
  return html;
}

async function assertIssuedEmailAge(issuedAt: Date, expectedAge: string): Promise<void> {
  capturedMessages.length = 0;
  const result = await sendSectorAlertIssuedEmail({
    to: "advisor@example.com",
    toName: "Alex Advisor",
    sectorLabel: "Arable",
    level: "high",
    counties: "Kent",
    message: "Review the latest sector guidance.",
    issuedAt,
  });

  assert.equal(result.sent, true);
  assert.match(latestHtml(), new RegExp(`\\(issued ${expectedAge}\\)`));
}

async function assertAllClearEmailAge(issuedAt: Date, expectedAge: string): Promise<void> {
  capturedMessages.length = 0;
  const result = await sendSectorAlertAllClearEmail({
    to: "advisor@example.com",
    toName: "Alex Advisor",
    sectorLabel: "Arable",
    level: "high",
    issuedAt,
    endedAt: new Date(now),
    endedReason: "Official guidance withdrawn.",
  });

  assert.equal(result.sent, true);
  assert.match(latestHtml(), new RegExp(`\\(issued ${expectedAge}\\)`));
}

try {
  await assertIssuedEmailAge(new Date(now), "today");
  await assertIssuedEmailAge(new Date(now - 3 * DAY_MS), "3 days ago");
  await assertIssuedEmailAge(new Date(now + DAY_MS), "today");

  await assertAllClearEmailAge(new Date(now), "today");
  await assertAllClearEmailAge(new Date(now - 3 * DAY_MS), "3 days ago");
  await assertAllClearEmailAge(new Date(now + DAY_MS), "today");

  console.log("Sector alert email age checks passed for issued and all-clear templates.");
} finally {
  nodemailer.createTransport = originalCreateTransport;
}