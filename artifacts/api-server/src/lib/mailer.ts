import nodemailer from "nodemailer";
import { generateSetupGuidePdf, type SetupGuideOptions } from "./setup-guide-pdf";

export interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  body: string;
  replyTo?: string;
  attachments?: Array<{ filename: string; content: Buffer; contentType: string }>;
}

export async function sendAdminEmail(opts: SendEmailOptions): Promise<{ sent: boolean; reason?: string }> {
  const transport = createTransport();
  if (!transport) {
    return { sent: false, reason: "SMTP not configured (SMTP_PASS missing)" };
  }

  const html = wrapInBrandedLayout(opts.body);

  try {
    const info = await transport.sendMail({
      from: `"${SMTP_FROM_NAME}" <${SMTP_FROM}>`,
      to: opts.toName ? `"${opts.toName}" <${opts.to}>` : opts.to,
      subject: opts.subject,
      html,
      replyTo: opts.replyTo ?? SMTP_FROM,
      attachments: opts.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    });
    console.log(`[MAILER] SMTP response: ${info.response}`);
    console.log(`[MAILER] Message ID: ${info.messageId}`);
    console.log(`[MAILER] Accepted: ${JSON.stringify(info.accepted)}`);
    if (info.rejected && (info.rejected as string[]).length > 0) {
      console.warn(`[MAILER] Rejected by relay: ${JSON.stringify(info.rejected)}`);
      return { sent: false, reason: `Relay rejected recipient(s): ${JSON.stringify(info.rejected)}` };
    }
    console.log(`[MAILER] Admin email sent to ${opts.to} — "${opts.subject}"`);
    return { sent: true };
  } catch (err) {
    console.error("[MAILER] Failed to send admin email:", err);
    return { sent: false, reason: String(err) };
  }
}

export async function sendTicketConfirmationEmail(opts: {
  toEmail: string;
  toName: string;
  ticketRef: string;
  ticketSubject: string;
  category: string;
  source?: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const firstName = opts.toName.split(" ")[0] || opts.toName;
  const isManual = opts.source && opts.source !== "app";
  const openingLine = isManual
    ? `<p>Hi ${firstName},</p><p>Thanks for speaking with us today. As discussed, we've raised a support ticket on your behalf and one of our team will follow up within <strong>one business day</strong> (Mon–Fri).</p>`
    : `<p>Hi ${firstName},</p><p>Thank you for contacting BDE Farm Trac support. We've received your request and one of our team will be in touch within <strong>one business day</strong> (Mon–Fri).</p>`;
  const body = `
    ${openingLine}
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8f5ee;border-radius:6px;margin:20px 0;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;">Your ticket reference</p>
        <p style="margin:0 0 12px;font-size:26px;font-weight:bold;color:#1a1a1a;letter-spacing:0.05em;">${opts.ticketRef}</p>
        <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;">Subject</p>
        <p style="margin:0 0 12px;font-size:14px;color:#374151;">${opts.ticketSubject}</p>
        <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;">Category</p>
        <p style="margin:0;font-size:14px;color:#374151;">${opts.category}</p>
      </td></tr>
    </table>
    <p>Please keep your ticket reference <strong>${opts.ticketRef}</strong> handy — include it in any follow-up emails to help us locate your case quickly.</p>
    <p>If your issue is urgent, you can also call us directly. Our team is UK-based and available Monday to Friday.</p>
    <p>Kind regards,<br>BDE Farm Trac Support Team<br><small style="color:#6b7280;">Barnett Davies Enterprises Ltd · hello@bdefarmtrac.co.uk</small></p>
  `;
  return sendAdminEmail({
    to: opts.toEmail,
    toName: opts.toName,
    subject: `Support Ticket Raised — ${opts.ticketRef}`,
    body,
    replyTo: "hello@bdefarmtrac.co.uk",
  });
}

export async function sendNewTicketInternalAlert(opts: {
  ticketRef: string;
  ticketId: number;
  name: string;
  email: string;
  subject: string;
  description: string;
  source: string;
  tenantSlug?: string | null;
  farmId?: number | null;
  attachments?: Array<{ filename: string; content: Buffer; contentType: string }>;
}): Promise<{ sent: boolean; reason?: string }> {
  const notifyAddress = process.env.SUPPORT_NOTIFY_EMAIL ?? "hello@bdefarmtrac.co.uk";
  const farmInfo = opts.tenantSlug
    ? `<p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;">Farm / Tenant</p>
       <p style="margin:0 0 12px;font-size:14px;color:#374151;">${opts.tenantSlug}${opts.farmId ? ` (Farm ID: ${opts.farmId})` : ""}</p>`
    : "";
  const sourceLabel = !opts.source || opts.source === "app"
    ? "via the customer portal"
    : `manually by support (source: ${opts.source.replace("_", " ")})`;
  const body = `
    <p>A new support ticket has been raised ${sourceLabel}.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;border-radius:6px;margin:20px 0;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;">Ticket Reference</p>
        <p style="margin:0 0 12px;font-size:22px;font-weight:bold;color:#1a1a1a;">${opts.ticketRef}</p>
        <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;">From</p>
        <p style="margin:0 0 12px;font-size:14px;color:#374151;">${opts.name} &lt;${opts.email}&gt;</p>
        <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;">Subject</p>
        <p style="margin:0 0 12px;font-size:14px;color:#374151;">${opts.subject}</p>
        ${farmInfo}
        <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;">Source</p>
        <p style="margin:0 0 12px;font-size:14px;color:#374151;">${opts.source}</p>
        <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;">Description</p>
        <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.6;white-space:pre-wrap;">${opts.description}</p>
      </td></tr>
    </table>
    <p style="margin:24px 0;">
      <a href="https://bdefarmtrac.co.uk/admin-portal/support" style="display:inline-block;padding:12px 24px;background:#1a6b3a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px;">View in Admin Portal →</a>
    </p>
  `;
  return sendAdminEmail({
    to: notifyAddress,
    subject: `New Support Ticket ${opts.ticketRef} — ${opts.subject}`,
    body,
    ...(opts.attachments?.length ? { attachments: opts.attachments } : {}),
  });
}

export async function sendTicketReplyEmail(opts: {
  toEmail: string;
  toName: string;
  ticketId: number;
  ticketSubject: string;
  replyText: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const body = `
    <p>Hi ${opts.toName.split(" ")[0] || opts.toName},</p>
    <p>We've replied to your support request:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;border-radius:6px;margin:16px 0;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;">Your request: ${opts.ticketSubject}</p>
        <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.6;white-space:pre-wrap;">${opts.replyText}</p>
      </td></tr>
    </table>
    <p>If you have further questions, please reply to this email and we'll be happy to help.</p>
    <p>Kind regards,<br>BDE Farm Trac Support Team</p>
  `;
  return sendAdminEmail({
    to: opts.toEmail,
    toName: opts.toName,
    subject: `Re: ${opts.ticketSubject} [Ticket #${opts.ticketId}]`,
    body,
  });
}

export async function sendCustomerReplyAlert(opts: {
  ticketRef: string;
  ticketId: number;
  customerName: string;
  subject: string;
  replyText: string;
  tenantSlug?: string | null;
  farmId?: number | null;
}): Promise<{ sent: boolean; reason?: string }> {
  const notifyAddress = process.env.SUPPORT_NOTIFY_EMAIL ?? "hello@bdefarmtrac.co.uk";
  const farmInfo = opts.tenantSlug
    ? `<p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;">Farm / Tenant</p>
       <p style="margin:0 0 12px;font-size:14px;color:#374151;">${opts.tenantSlug}${opts.farmId ? ` (Farm ID: ${opts.farmId})` : ""}</p>`
    : "";
  const body = `
    <p>A customer has replied to an existing support ticket via the BDE Farm Trac dashboard.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;border-radius:6px;margin:20px 0;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;">Ticket Reference</p>
        <p style="margin:0 0 12px;font-size:22px;font-weight:bold;color:#1a1a1a;">${opts.ticketRef}</p>
        <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;">From</p>
        <p style="margin:0 0 12px;font-size:14px;color:#374151;">${opts.customerName}</p>
        <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;">Subject</p>
        <p style="margin:0 0 12px;font-size:14px;color:#374151;">${opts.subject}</p>
        ${farmInfo}
        <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;">Customer Reply</p>
        <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.6;white-space:pre-wrap;">${opts.replyText}</p>
      </td></tr>
    </table>
    <p style="margin:24px 0;">
      <a href="https://bdefarmtrac.co.uk/admin-portal/support" style="display:inline-block;padding:12px 24px;background:#1a6b3a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px;">View in Admin Portal →</a>
    </p>
  `;
  return sendAdminEmail({
    to: notifyAddress,
    subject: `Customer Reply — ${opts.ticketRef} · ${opts.subject}`,
    body,
  });
}

function wrapInBrandedLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#1a6b3a;padding:28px 40px;">
            <p style="margin:0;font-size:20px;font-weight:bold;color:#ffffff;">BDE Farm Trac</p>
            <p style="margin:4px 0 0;font-size:11px;color:#a7d9b8;">Red Tractor Compliance Platform</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;font-size:14px;color:#374151;line-height:1.7;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 40px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">
              © BDE Farm Trac · <a href="https://bdefarmtrac.co.uk" style="color:#1a6b3a;text-decoration:none;">bdefarmtrac.co.uk</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const SMTP_HOST = process.env.SMTP_HOST ?? "smtp-relay.brevo.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? "587", 10);
const SMTP_USER = process.env.SMTP_USER ?? "a558bc001@smtp-brevo.com";
const SMTP_PASS = process.env.SMTP_PASS ?? null;
const SMTP_FROM = process.env.SMTP_FROM ?? "noreply@bdefarmtrac.co.uk";
const SMTP_FROM_NAME = "BDE Farm Trac";

function createTransport() {
  if (!SMTP_PASS) {
    console.warn("[MAILER] SMTP_PASS is not set — email sending is disabled.");
    return null;
  }
  console.log(`[MAILER] Using SMTP: ${SMTP_USER}@${SMTP_HOST}:${SMTP_PORT}, from: ${SMTP_FROM}`);
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export async function sendSetupGuideEmail(opts: SetupGuideOptions): Promise<{ sent: boolean; reason?: string }> {
  const transport = createTransport();
  if (!transport) {
    return { sent: false, reason: "SMTP not configured (SMTP_PASS missing)" };
  }

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generateSetupGuidePdf(opts);
  } catch (err) {
    console.error("[MAILER] PDF generation failed:", err);
    return { sent: false, reason: "PDF generation failed" };
  }

  const moduleList = opts.moduleKeys
    .filter(Boolean)
    .map((k) => {
      const names: Record<string, string> = {
        "fields-crops": "Fields & Crops",
        "spray-records": "Spray Applications",
        "nvz-compliance": "NVZ Compliance",
        "harvest-records": "Harvest Records",
        "equipment-management": "Equipment & Fleet",
        "livestock-management": "Livestock Management",
        "livestock-movements": "Livestock Movements",
        "livestock-medicine": "Medicine Records",
        "staff-training": "Staff & Training",
        "biosecurity": "Biosecurity & Visitors",
        "inspections-compliance": "Inspections & Compliance",
        "financial-records": "Financial Records",
        "business-reports": "Business Reports",
        "biofuel-rtfo": "Biofuel / RTFO",
        "soil-tests": "Soil Tests",
      };
      return names[k] ?? k;
    })
    .join(", ");

  const filename = `BDE-Farm-Trac-Setup-Guide-${opts.farmName.replace(/[^a-z0-9]+/gi, "-")}.pdf`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1a6b3a;padding:32px 40px;">
            <p style="margin:0;font-size:22px;font-weight:bold;color:#ffffff;">BDE Farm Trac</p>
            <p style="margin:4px 0 0;font-size:12px;color:#a7d9b8;">Red Tractor Compliance Platform</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <h1 style="margin:0 0 8px;font-size:20px;color:#1a1a1a;">Your Setup Guide is attached</h1>
            <p style="margin:0 0 24px;font-size:14px;color:#4b5563;line-height:1.6;">
              Hi${opts.farmManager ? ` ${opts.farmManager.split(" ")[0]}` : ""},<br><br>
              Thank you for activating your BDE Farm Trac modules for <strong>${opts.farmName}</strong>.
              We've prepared a personalised Quick Setup Guide — it's attached to this email as a PDF.
            </p>

            <!-- Module list -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8f5ee;border-radius:6px;margin-bottom:24px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 8px;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;">Modules activated</p>
                  <p style="margin:0;font-size:13px;color:#1a1a1a;">${moduleList || "See attached guide"}</p>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 16px;font-size:14px;color:#4b5563;line-height:1.6;">
              The guide has one section per module, each with a numbered checklist of exactly what to enter first — in the right order — so you can get up and running as quickly as possible.
            </p>

            <p style="margin:0 0 24px;font-size:14px;color:#4b5563;line-height:1.6;">
              If you have any questions, you can reach us through the Help Centre or Support section inside BDE Farm Trac, or by replying to this email.
            </p>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1a6b3a;border-radius:6px;">
                  <a href="https://bdefarmtrac.co.uk" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;">
                    Open BDE Farm Trac →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.5;">
              This email was sent to ${opts.tenantEmail} for the account <strong>${opts.tenantName}</strong>
              (${opts.farmName}${opts.cphNumber ? `, CPH ${opts.cphNumber}` : ""}).
              © BDE Farm Trac. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await transport.sendMail({
      from: `"${SMTP_FROM_NAME}" <${SMTP_FROM}>`,
      to: opts.tenantEmail,
      subject: `Your BDE Farm Trac Setup Guide — ${opts.farmName}`,
      html,
      attachments: [
        {
          filename,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    console.log(`[MAILER] Setup guide sent to ${opts.tenantEmail} for farm ${opts.farmName}`);
    return { sent: true };
  } catch (err) {
    console.error("[MAILER] Failed to send setup guide email:", err);
    return { sent: false, reason: String(err) };
  }
}

export async function sendWelcomeEmail(opts: {
  to: string;
  firstName: string | null;
}): Promise<{ sent: boolean; reason?: string }> {
  const greeting = opts.firstName ? `Hi ${opts.firstName},` : "Welcome aboard,";
  const body = `
    <p>${greeting}</p>
    <p>Your <strong>BDE Farm Trac</strong> account is all set up. We're delighted to have you as part of our community of UK farmers achieving Red Tractor compliance.</p>
    <p style="margin:24px 0;">
      <a href="https://bdefarmtrac.co.uk/dashboard" style="display:inline-block;padding:12px 28px;background:#1a6b3a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px;">Open Your Dashboard →</a>
    </p>
    <p><strong>What to do next:</strong></p>
    <ul style="padding-left:20px;line-height:2;">
      <li>Complete your farm setup using the on-screen wizard</li>
      <li>Add your first farm records (fields, livestock, spray applications)</li>
      <li>Invite your farm manager or agronomist to collaborate</li>
      <li>Set up SMS alerts so you never miss a compliance deadline</li>
    </ul>
    <p>If you have any questions, just reply to this email — our team is based in the UK and responds within one business day.</p>
    <p>Kind regards,<br>The BDE Farm Trac Team<br><small style="color:#6b7280;">Barnett Davies Enterprises Ltd</small></p>
  `;
  return sendAdminEmail({
    to: opts.to,
    subject: "Welcome to BDE Farm Trac 🌱",
    body,
  });
}

export async function sendLeadConfirmationEmail(opts: {
  to: string;
  contactName: string;
  businessName: string;
  modulesInterested: string[];
}): Promise<{ sent: boolean; reason?: string }> {
  const firstName = opts.contactName.split(" ")[0] || opts.contactName;
  const moduleList = opts.modulesInterested.length > 0
    ? `<ul style="padding-left:20px;line-height:2;">${opts.modulesInterested.map((m) => `<li>${m}</li>`).join("")}</ul>`
    : "";

  const body = `
    <p>Hi ${firstName},</p>
    <p>Thank you for registering your interest in <strong>BDE Farm Trac</strong> for <em>${opts.businessName}</em>. We've received your details and a member of our team will be in touch within <strong>one business day</strong>.</p>
    ${moduleList ? `<p>You expressed interest in the following modules:</p>${moduleList}` : ""}
    <p>In the meantime, you can explore our platform on the website to see what's included:</p>
    <p style="margin:24px 0;">
      <a href="https://bdefarmtrac.co.uk/features" style="display:inline-block;padding:12px 28px;background:#1a6b3a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px;">View Features →</a>
    </p>
    <p>Kind regards,<br>The BDE Farm Trac Team<br><small style="color:#6b7280;">Barnett Davies Enterprises Ltd · hello@bdefarmtrac.co.uk</small></p>
  `;
  return sendAdminEmail({
    to: opts.to,
    toName: opts.contactName,
    subject: `Thanks for your interest in BDE Farm Trac, ${firstName}`,
    body,
    replyTo: "hello@bdefarmtrac.co.uk",
  });
}

export interface WeeklyDigestItem {
  category: string;
  label: string;
  dueDate: string;
  severity: "critical" | "warning";
}

export async function sendSectorAlertIssuedEmail(opts: {
  to: string;
  toName?: string;
  sectorLabel: string;
  level: string;
  counties?: string | null;
  message?: string | null;
  issuedAt: Date;
}): Promise<{ sent: boolean; reason?: string }> {
  const levelLabel = opts.level.charAt(0).toUpperCase() + opts.level.slice(1);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const levelColor = opts.level === "critical" ? "#dc2626" : opts.level === "high" ? "#d97706" : "#1a6b3a";

  const countiesRow = opts.counties?.trim()
    ? `<tr>
        <td style="padding:8px 12px;font-size:12px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;">County scope</td>
        <td style="padding:8px 12px;font-size:14px;color:#374151;">${opts.counties.trim()}</td>
       </tr>`
    : `<tr>
        <td style="padding:8px 12px;font-size:12px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;">County scope</td>
        <td style="padding:8px 12px;font-size:14px;color:#374151;">All counties</td>
       </tr>`;

  const messageBlock = opts.message?.trim()
    ? `<p style="margin:16px 0;font-size:14px;color:#1a1a1a;line-height:1.6;background:#fff8ec;border-left:4px solid ${levelColor};padding:12px 16px;border-radius:0 4px 4px 0;">${opts.message.trim()}</p>`
    : "";

  const greeting = opts.toName ? `Hi ${opts.toName.split(" ")[0]},` : "Hello,";

  const body = `
    <p>${greeting}</p>
    <p>A new <strong>${opts.sectorLabel}</strong> sector alert has been issued on the BDE Farm Trac platform. Please review the details below and take any appropriate action.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff3cd;border-radius:6px;margin:20px 0;border:1px solid #fbbf24;">
      <tr>
        <td style="padding:16px 20px 4px;">
          <p style="margin:0;font-size:11px;font-weight:bold;color:#92400e;text-transform:uppercase;letter-spacing:0.05em;">New sector alert</p>
          <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#1a1a1a;">${opts.sectorLabel}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 20px 16px;">
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding:8px 12px;font-size:12px;font-weight:bold;color:#92400e;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;">Alert level</td>
              <td style="padding:8px 12px;font-size:14px;font-weight:bold;color:${levelColor};">${levelLabel}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;font-size:12px;font-weight:bold;color:#92400e;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;">Issued</td>
              <td style="padding:8px 12px;font-size:14px;color:#374151;">${formatDate(opts.issuedAt)}</td>
            </tr>
            ${countiesRow}
          </table>
        </td>
      </tr>
    </table>

    ${messageBlock}

    <p>Please log in to your BDE Farm Trac dashboard to view the full alert details and any recommended actions. You will receive a separate notification when this alert is lifted.</p>
    <p style="margin:24px 0;">
      <a href="https://bdefarmtrac.co.uk/dashboard" style="display:inline-block;padding:12px 28px;background:#1a6b3a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px;">Open Dashboard →</a>
    </p>
    <p>Kind regards,<br>The BDE Farm Trac Team<br><small style="color:#6b7280;">Barnett Davies Enterprises Ltd</small></p>
  `;

  return sendAdminEmail({
    to: opts.to,
    toName: opts.toName,
    subject: `Sector Alert Issued — ${opts.sectorLabel}`,
    body,
  });
}

export async function sendSectorAlertAllClearEmail(opts: {
  to: string;
  toName?: string;
  sectorLabel: string;
  level: string;
  issuedAt: Date;
  endedAt: Date;
  endedReason?: string | null;
}): Promise<{ sent: boolean; reason?: string }> {
  const levelLabel = opts.level.charAt(0).toUpperCase() + opts.level.slice(1);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const durationMs = opts.endedAt.getTime() - opts.issuedAt.getTime();
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const durationLabel = durationHours > 0
    ? `${durationHours} hour${durationHours !== 1 ? "s" : ""}${durationMins > 0 ? ` ${durationMins} minute${durationMins !== 1 ? "s" : ""}` : ""}`
    : `${durationMins} minute${durationMins !== 1 ? "s" : ""}`;

  const reasonRow = opts.endedReason?.trim()
    ? `<tr>
        <td style="padding:8px 12px;font-size:12px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;">Resolution reason</td>
        <td style="padding:8px 12px;font-size:14px;color:#374151;">${opts.endedReason.trim()}</td>
       </tr>`
    : "";

  const greeting = opts.toName ? `Hi ${opts.toName.split(" ")[0]},` : "Hello,";

  const body = `
    <p>${greeting}</p>
    <p>We are writing to let you know that the <strong>${opts.sectorLabel}</strong> sector alert that was previously issued for your farm has now been <strong style="color:#1a6b3a;">lifted</strong>. Normal operations may resume.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8f5ee;border-radius:6px;margin:20px 0;">
      <tr>
        <td style="padding:16px 20px 4px;">
          <p style="margin:0;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;">Alert cleared</p>
          <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#1a1a1a;">${opts.sectorLabel}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 20px 16px;">
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding:8px 12px;font-size:12px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;">Alert level</td>
              <td style="padding:8px 12px;font-size:14px;color:#374151;">${levelLabel}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;font-size:12px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;">Issued</td>
              <td style="padding:8px 12px;font-size:14px;color:#374151;">${formatDate(opts.issuedAt)}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;font-size:12px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;">Lifted</td>
              <td style="padding:8px 12px;font-size:14px;color:#374151;">${formatDate(opts.endedAt)}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;font-size:12px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;">Duration</td>
              <td style="padding:8px 12px;font-size:14px;color:#374151;">${durationLabel}</td>
            </tr>
            ${reasonRow}
          </table>
        </td>
      </tr>
    </table>

    <p>Thank you for your vigilance during this alert period. If you have any questions, please contact our support team or review the Notifications section of your dashboard.</p>
    <p style="margin:24px 0;">
      <a href="https://bdefarmtrac.co.uk/dashboard" style="display:inline-block;padding:12px 28px;background:#1a6b3a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px;">Open Dashboard →</a>
    </p>
    <p>Kind regards,<br>The BDE Farm Trac Team<br><small style="color:#6b7280;">Barnett Davies Enterprises Ltd</small></p>
  `;

  return sendAdminEmail({
    to: opts.to,
    toName: opts.toName,
    subject: `Sector Alert Lifted — ${opts.sectorLabel}`,
    body,
  });
}

export async function sendWeeklyDigestEmail(opts: {
  to: string;
  toName: string;
  farmName: string;
  items: WeeklyDigestItem[];
}): Promise<{ sent: boolean; reason?: string }> {
  const firstName = opts.toName.split(" ")[0] || opts.toName;
  const criticalCount = opts.items.filter((i) => i.severity === "critical").length;

  const rows = opts.items
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .map((item) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#6b7280;">${item.category}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;font-weight:500;">${item.label}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right;">
          <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:bold;
            background:${item.severity === "critical" ? "#fee2e2" : "#fef9c3"};
            color:${item.severity === "critical" ? "#991b1b" : "#92400e"};">
            ${item.dueDate}
          </span>
        </td>
      </tr>
    `).join("");

  const body = `
    <p>Hi ${firstName},</p>
    <p>Here is your weekly compliance summary for <strong>${opts.farmName}</strong>.
    ${criticalCount > 0 ? `<br><strong style="color:#991b1b;">${criticalCount} item${criticalCount > 1 ? "s" : ""} require immediate attention.</strong>` : ""}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin:20px 0;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:bold;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Category</th>
          <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:bold;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Item</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:bold;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Due</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <p style="margin:24px 0;">
      <a href="https://bdefarmtrac.co.uk/dashboard" style="display:inline-block;padding:12px 28px;background:#1a6b3a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px;">Open Dashboard →</a>
    </p>
    <p style="font-size:12px;color:#9ca3af;">You are receiving this because you are listed as a manager for ${opts.farmName}. To unsubscribe, update your alert preferences in Account Settings.</p>
  `;

  return sendAdminEmail({
    to: opts.to,
    toName: opts.toName,
    subject: `Weekly Compliance Summary — ${opts.farmName}`,
    body,
  });
}
