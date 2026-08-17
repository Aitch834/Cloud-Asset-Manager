import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent content-correction migrations for the help_articles table.
 *
 * Safe to run on every startup — each block checks for a specific content
 * fingerprint before updating, so it no-ops once already applied and never
 * overwrites administrator-authored changes that don't match the fingerprint.
 */
export async function runHelpArticleMigrations(): Promise<void> {
  // ── Fix: SMS Alerts — Configuring article was seeded with Botrytis content ──
  //
  // When TITLES[235] was added ("SMS Alerts — Configuring Alert Categories…")
  // no matching CONTENT entry existed at that index, so the seed endpoint
  // inserted the next entry in the array (Harvest Botrytis Advisory) under
  // the SMS article's slug. This migration detects that mismatch via the
  // Botrytis fingerprint and replaces the content with the correct text.
  //
  // Safe: only runs when the fingerprint matches. If an admin has manually
  // edited this article the content will no longer contain "Botrytis cinerea"
  // and this block is a no-op.
  const SMS_SLUG =
    "sms-alerts-configuring-alert-categories-per-member-settings-and-alert-history-log";

  const SMS_EXCERPT =
    "How to configure SMS alert categories, control which farm members receive each alert type, and review the alert history log in BDE Farm Trac.";

  const SMS_CONTENT = `<h2>SMS Alerts — Configuring Alert Categories, Per-Member Settings and Alert History Log</h2>
<p>The SMS Alerts module lets your farm send automated text message notifications to relevant team members when compliance-critical events occur — withdrawal periods expiring, inspection deadlines approaching, NVZ closed periods opening, and more. This article explains how to configure which alert categories are active and which team members receive each type.</p>
<h3>Navigating to SMS Alerts configuration</h3>
<p>Go to <strong>Account &amp; Notifications</strong> (your account icon in the top-right corner, then <strong>Notifications</strong>) to manage your personal SMS alert preferences. Farm-level alert category settings — controlling which alert types are enabled across the whole farm — are found under <strong>Platform Add-ons → SMS Alerts → Config</strong> tab. A subscription to the Platform Add-ons module is required for SMS Alerts to be active.</p>
<h3>Enabling and disabling alert categories</h3>
<p>On the <strong>Config</strong> tab, scroll to the <strong>Alert Categories</strong> section. Each alert type is listed with a toggle:</p>
<ul>
<li><strong>Medicine Withdrawal Reminders:</strong> fires when a livestock medicine record has an approaching or expiring withdrawal end date.</li>
<li><strong>NVZ Closed Period Alerts:</strong> sent when the NVZ spreading closed period is about to open or close.</li>
<li><strong>Inspection Deadline Reminders:</strong> sent when a recorded inspection or non-conformance resolution deadline is within the configured lead time.</li>
<li><strong>Labour Timesheet Notifications:</strong> sent to managers when staff submit timesheets, and to staff when timesheets are approved or leave requests are decided.</li>
<li><strong>Sector Alerts:</strong> regulatory and disease alerts relevant to your farm's sector, issued when APHA, DEFRA, or sector bodies post an advisory.</li>
<li><strong>Task Due Reminders:</strong> sent to the assigned team member when a task board item is approaching its due date.</li>
</ul>
<p>Toggle each category on or off. Changes take effect immediately — no save button is required.</p>
<h3>Per-member settings</h3>
<p>Each farm member controls their own SMS opt-in from <strong>Account &amp; Notifications → Notifications</strong>. The page shows every active alert category and a toggle for each. Members can opt in to some categories and out of others — for example, a herd manager may opt in to withdrawal reminders and task reminders but opt out of labour timesheet notifications.</p>
<p>Farm administrators can view which members are opted in to which categories from <strong>Platform Add-ons → SMS Alerts → Config → Member Settings</strong>. This read-only panel shows a grid of members versus alert categories, with a green tick where a member is opted in. Individual member settings can only be changed by the member themselves from their own Account &amp; Notifications page.</p>
<h3>SMS number setup</h3>
<p>Each member must have a valid UK mobile number saved to their profile for SMS delivery. If a number is missing, the member's row in the Member Settings panel shows an amber warning. The member can add or update their number from <strong>Account &amp; Notifications → Profile → Mobile Number</strong>.</p>
<h3>Alert history log</h3>
<p>Navigate to <strong>Platform Add-ons → SMS Alerts → History</strong> tab to see a full timestamped log of every SMS sent by the platform. Each row shows the recipient name and number, the alert category, the triggering record (e.g. which medicine withdrawal, which task, which inspection), the message sent, and the delivery status (Delivered, Failed, or Pending). Use this log to confirm that a reminder was sent and received, or to investigate a reported missed alert.</p>
<p>Failed deliveries are retried automatically up to three times over 24 hours. If delivery continues to fail, check that the recipient's mobile number is correct and that their carrier supports SMS from the platform's sending number.</p>`;

  // Only update when BOTH the excerpt AND content exactly match the known-bad
  // seeded values (the Harvest Botrytis Advisory article that was incorrectly
  // placed at this slug).  An admin who edited either the excerpt or the body
  // independently will not match both predicates and their changes are preserved.
  const WRONG_EXCERPT =
    "How the botrytis advisory and automatic task-raise prompt work in BDE Farm Trac's Viticulture harvest records.";

  // Unique opening of the wrong content — collision-resistant alongside the excerpt.
  const WRONG_CONTENT_PREFIX =
    "<h2>Harvest Botrytis Advisory — Amber Quality Alert and Task Raising on High Botrytis or Poor Condition</h2>";

  const wrongRow = await db.execute(sql`
    SELECT id FROM help_articles
    WHERE slug    = ${SMS_SLUG}
      AND excerpt = ${WRONG_EXCERPT}
      AND content LIKE ${WRONG_CONTENT_PREFIX + "%"}
    LIMIT 1
  `);

  if ((wrongRow as { rows: unknown[] }).rows.length > 0) {
    await db.execute(sql`
      UPDATE help_articles
      SET
        excerpt    = ${SMS_EXCERPT},
        content    = ${SMS_CONTENT},
        updated_at = now()
      WHERE slug    = ${SMS_SLUG}
        AND excerpt = ${WRONG_EXCERPT}
        AND content LIKE ${WRONG_CONTENT_PREFIX + "%"}
    `);
    console.log(
      "[HELP-ARTICLE-MIGRATE] Corrected SMS Alerts — Configuring article (was showing Botrytis content)",
    );
  }
}
