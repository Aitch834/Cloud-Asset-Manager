import nodemailer from "nodemailer";
import { generateSetupGuidePdf, type SetupGuideOptions } from "./setup-guide-pdf";

const SMTP_HOST = "smtp-relay.brevo.com";
const SMTP_PORT = 587;
const SMTP_USER = "a558bc001@smtp-brevo.com";
const SMTP_PASS = process.env.SMTP_PASS ?? null;
const SMTP_FROM = process.env.SMTP_FROM ?? "noreply@bdefarmtrac.co.uk";
const SMTP_FROM_NAME = "BDE Farm Trac";

function createTransport() {
  if (!SMTP_PASS) {
    console.warn("[MAILER] SMTP_PASS is not set — email sending is disabled.");
    return null;
  }
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
