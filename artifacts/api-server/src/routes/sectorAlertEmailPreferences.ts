import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { verifySectorAlertEmailToken } from "../lib/sectorAlertEmailPreferences";

const router: IRouter = Router();

function tokenFrom(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderPreferencePage(mode: "unsubscribed" | "resubscribed" | "invalid", token?: string): string {
  const isUnsubscribed = mode === "unsubscribed";
  const isResubscribed = mode === "resubscribed";
  const heading = isUnsubscribed
    ? "You’re unsubscribed"
    : isResubscribed
      ? "You’re subscribed again"
      : "This link is not valid";
  const message = isUnsubscribed
    ? "You will no longer receive sector alert emails from BDE Farm Trac. This change applies to this email address across all farms."
    : isResubscribed
      ? "Sector alert emails will be sent to this address again when an alert is lifted."
      : "The email preference link is missing, invalid, or has been altered. Please use the latest link from a BDE Farm Trac sector alert email.";
  const resubscribeForm = isUnsubscribed && token
    ? `
      <form method="get" action="/api/sector-alert/resubscribe" style="margin:28px 0 0;">
        <input type="hidden" name="token" value="${escapeHtml(token)}">
        <button type="submit" style="border:0;border-radius:6px;padding:12px 20px;background:#1a6b3a;color:#fff;font-size:14px;font-weight:bold;cursor:pointer;">Subscribe again</button>
      </form>
    `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${heading} | BDE Farm Trac</title>
</head>
<body style="margin:0;padding:32px 16px;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#374151;">
  <main style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;box-shadow:0 1px 4px rgba(0,0,0,.08);overflow:hidden;">
    <header style="background:#1a6b3a;padding:28px 32px;">
      <p style="margin:0;font-size:20px;font-weight:bold;color:#fff;">BDE Farm Trac</p>
      <p style="margin:4px 0 0;font-size:11px;color:#a7d9b8;">Sector alert email preferences</p>
    </header>
    <section style="padding:32px;">
      <h1 style="margin:0 0 12px;font-size:24px;color:#1a1a1a;">${heading}</h1>
      <p style="margin:0;line-height:1.7;font-size:15px;">${message}</p>
      ${resubscribeForm}
      ${isResubscribed ? `<p style="margin:28px 0 0;font-size:13px;color:#6b7280;">You can use the unsubscribe link in any future sector alert email if you change your mind.</p>` : ""}
      ${isUnsubscribed ? `<p style="margin:28px 0 0;font-size:13px;color:#6b7280;">Changed your mind? Use the button above to receive these emails again.</p>` : ""}
    </section>
  </main>
</body>
</html>`;
}

function sendPreferencePage(res: Response, mode: "unsubscribed" | "resubscribed" | "invalid", token?: string): void {
  res.setHeader("Cache-Control", "no-store");
  res.type("html").send(renderPreferencePage(mode, token));
}

router.get("/sector-alert/unsubscribe", async (req: Request, res: Response): Promise<void> => {
  const token = tokenFrom(req.query.token);
  const email = token ? verifySectorAlertEmailToken(token) : null;
  if (!email) {
    res.status(400);
    sendPreferencePage(res, "invalid");
    return;
  }

  await db.execute(sql`
    INSERT INTO email_unsubscribes (email_norm)
    VALUES (${email})
    ON CONFLICT (email_norm)
    DO UPDATE SET unsubscribed_at = now()
  `);
  sendPreferencePage(res, "unsubscribed", token ?? undefined);
});

async function resubscribe(req: Request, res: Response): Promise<void> {
  const token = tokenFrom(req.query.token ?? req.body?.token);
  const email = token ? verifySectorAlertEmailToken(token) : null;
  if (!email) {
    res.status(400);
    sendPreferencePage(res, "invalid");
    return;
  }

  await db.execute(sql`DELETE FROM email_unsubscribes WHERE email_norm = ${email}`);
  sendPreferencePage(res, "resubscribed");
}

router.get("/sector-alert/resubscribe", resubscribe);
router.post("/sector-alert/resubscribe", resubscribe);

export default router;