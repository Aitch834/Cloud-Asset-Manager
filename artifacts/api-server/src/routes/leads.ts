import { Router, type IRouter } from "express";
import { db, leadsTable } from "@workspace/db";
import { CreateLeadBody } from "@workspace/api-zod";
import { sendLeadConfirmationEmail, sendAdminEmail } from "../lib/mailer";

// Minimal HTML escaper — prevents injection into notification email templates
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Allowlist of sector labels that may be passed via ?sector= from the Sectors page CTAs
const VALID_SECTORS = new Set([
  "Beef & Dairy",
  "Sheep & Goat",
  "Arable",
  "Viticulture",
  "Mixed Farming",
  "Agricultural Contracting",
]);

const router: IRouter = Router();

// Simple validator for the website Register Interest form fields
function parseRegisterInterestBody(body: unknown): {
  ok: true;
  data: {
    firstName: string; lastName: string; email: string; phone?: string;
    farmName: string; holdingNumber?: string; county?: string; farmType?: string;
    numberOfHoldings?: string; modules: string[]; heardVia?: string; message?: string;
    sector?: string;
  };
} | { ok: false } {
  if (!body || typeof body !== "object") return { ok: false };
  const b = body as Record<string, unknown>;
  if (typeof b.firstName !== "string" || !b.firstName.trim()) return { ok: false };
  if (typeof b.lastName !== "string" || !b.lastName.trim()) return { ok: false };
  if (typeof b.email !== "string" || !b.email.includes("@")) return { ok: false };
  if (typeof b.farmName !== "string" || !b.farmName.trim()) return { ok: false };
  return {
    ok: true,
    data: {
      firstName: b.firstName.trim(),
      lastName: b.lastName.trim(),
      email: b.email.trim(),
      phone: typeof b.phone === "string" ? b.phone : undefined,
      farmName: b.farmName.trim(),
      holdingNumber: typeof b.holdingNumber === "string" ? b.holdingNumber : undefined,
      county: typeof b.county === "string" ? b.county : undefined,
      farmType: typeof b.farmType === "string" ? b.farmType : undefined,
      numberOfHoldings: typeof b.numberOfHoldings === "string" ? b.numberOfHoldings : undefined,
      modules: Array.isArray(b.modules) ? (b.modules as unknown[]).filter((m): m is string => typeof m === "string") : [],
      heardVia: typeof b.heardVia === "string" ? b.heardVia : undefined,
      message: typeof b.message === "string" ? b.message : undefined,
      // Only accept sector values from the known allowlist; silently drop anything else
      sector: typeof b.sector === "string" && VALID_SECTORS.has(b.sector.trim()) ? b.sector.trim() : undefined,
    },
  };
}

// Internal BDE notification when a new lead comes in
async function sendLeadInternalAlert(lead: {
  id: number;
  contactName: string;
  businessName: string;
  email: string;
  phone: string | null;
  farmCount: number;
  modulesInterested: string[] | null;
  message: string | null;
  source: string | null;
  notes: string | null;
  createdAt: Date;
}) {
  const notifyAddress = process.env.LEADS_NOTIFY_EMAIL ?? "hello@bdefarmtrac.co.uk";
  const modules = (lead.modulesInterested ?? []).map(esc).join(", ") || "None selected";
  const extraRows = lead.notes
    ? lead.notes.split("\n").map(line => {
        const [label, ...rest] = line.split(": ");
        return `<tr><td style="padding:4px 0;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap;padding-right:16px;">${esc(label)}</td><td style="padding:4px 0;font-size:14px;color:#374151;">${esc(rest.join(": "))}</td></tr>`;
      }).join("")
    : "";

  const body = `
    <p>A new Register Interest submission has arrived — lead #${lead.id}.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;border-radius:6px;margin:20px 0;">
      <tr><td style="padding:20px 24px;">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding:4px 0;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap;padding-right:16px;">Contact</td>
            <td style="padding:4px 0;font-size:14px;color:#374151;font-weight:600;">${esc(lead.contactName)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap;padding-right:16px;">Email</td>
            <td style="padding:4px 0;font-size:14px;color:#374151;"><a href="mailto:${esc(lead.email)}">${esc(lead.email)}</a></td>
          </tr>
          ${lead.phone ? `<tr><td style="padding:4px 0;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap;padding-right:16px;">Phone</td><td style="padding:4px 0;font-size:14px;color:#374151;">${esc(lead.phone)}</td></tr>` : ""}
          <tr>
            <td style="padding:4px 0;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap;padding-right:16px;">Business</td>
            <td style="padding:4px 0;font-size:14px;color:#374151;">${esc(lead.businessName)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap;padding-right:16px;">Holdings</td>
            <td style="padding:4px 0;font-size:14px;color:#374151;">${lead.farmCount}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap;padding-right:16px;">Modules</td>
            <td style="padding:4px 0;font-size:14px;color:#374151;">${modules}</td>
          </tr>
          ${lead.source ? `<tr><td style="padding:4px 0;font-size:11px;font-weight:bold;color:#1a6b3a;text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap;padding-right:16px;">Heard via</td><td style="padding:4px 0;font-size:14px;color:#374151;">${esc(lead.source)}</td></tr>` : ""}
          ${extraRows}
        </table>
      </td></tr>
    </table>
    ${lead.message ? `<p style="background:#fff8e1;border-left:3px solid #f59e0b;padding:12px 16px;border-radius:4px;font-size:14px;color:#374151;margin:0 0 20px;">${esc(lead.message)}</p>` : ""}
    <p style="font-size:13px;color:#6b7280;">View and manage this lead in the <a href="https://bdefarmtrac.co.uk/admin-portal/leads">Admin Portal → Leads Pipeline</a>.</p>
    <p>Kind regards,<br>BDE Farm Trac System<br><small style="color:#6b7280;">Barnett Davies Enterprises Ltd · hello@bdefarmtrac.co.uk</small></p>
  `;

  return sendAdminEmail({
    to: notifyAddress,
    subject: `New Register Interest — ${esc(lead.contactName)} (${esc(lead.businessName)})`,
    body,
    replyTo: lead.email,
  });
}

// Website Register Interest form submission
router.post("/register-interest", async (req, res): Promise<void> => {
  const parsed = parseRegisterInterestBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: "Please check the form and try again." });
    return;
  }

  const d = parsed.data;
  const contactName = `${d.firstName} ${d.lastName}`.trim();
  const farmCount = Math.max(1, parseInt(d.numberOfHoldings ?? "1", 10) || 1);

  // Pack extra context fields into notes so they're visible in the admin portal
  const noteParts: string[] = [];
  if (d.farmType) noteParts.push(`Farm type: ${d.farmType}`);
  if (d.county) noteParts.push(`County: ${d.county}`);
  if (d.holdingNumber) noteParts.push(`CPH number: ${d.holdingNumber}`);
  const notes = noteParts.length > 0 ? noteParts.join("\n") : null;

  try {
    const [lead] = await db.insert(leadsTable).values({
      businessName: d.farmName,
      contactName,
      email: d.email,
      phone: d.phone || null,
      farmCount,
      modulesInterested: d.modules,
      message: d.message || null,
      source: d.heardVia || null,
      sector: d.sector || null,
      notes,
    }).returning();

    console.log(`[LEAD] New Register Interest submission #${lead.id} from ${lead.email} (${lead.businessName})`);

    // Fire both emails in parallel; neither blocks the response
    Promise.all([
      sendLeadConfirmationEmail({
        to: lead.email,
        contactName: lead.contactName,
        businessName: lead.businessName,
        modulesInterested: lead.modulesInterested ?? [],
      }).then((r) => {
        if (r.sent) console.log(`[LEAD] Confirmation email sent to ${lead.email}`);
        else console.warn(`[LEAD] Confirmation email not sent: ${r.reason}`);
      }),
      sendLeadInternalAlert(lead).then((r) => {
        if (r.sent) console.log(`[LEAD] Internal alert sent for lead #${lead.id}`);
        else console.warn(`[LEAD] Internal alert not sent: ${r.reason}`);
      }),
    ]).catch((err) => console.error("[LEAD] Email error:", err));

    res.status(201).json({ id: lead.id });
  } catch (err) {
    console.error("Register Interest error:", err);
    res.status(500).json({ error: "Failed to submit registration. Please try again." });
  }
});

// Internal API route (used by admin portal lead import / CRM integrations)
router.post("/leads", async (req, res): Promise<void> => {
  const parsed = CreateLeadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [lead] = await db.insert(leadsTable).values({
      businessName: parsed.data.businessName,
      contactName: parsed.data.contactName,
      email: parsed.data.email,
      phone: parsed.data.phone ?? null,
      farmCount: parsed.data.farmCount,
      modulesInterested: parsed.data.modulesInterested,
      message: parsed.data.message ?? null,
      sector: parsed.data.sector ?? null,
    }).returning();

    console.log(`[LEAD] New registration lead #${lead.id} from ${lead.email}`);

    sendLeadConfirmationEmail({
      to: lead.email,
      contactName: lead.contactName,
      businessName: lead.businessName,
      modulesInterested: lead.modulesInterested ?? [],
    }).then((r) => {
      if (r.sent) console.log(`[LEAD] Confirmation email sent to ${lead.email}`);
      else console.warn(`[LEAD] Confirmation email not sent: ${r.reason}`);
    }).catch((err) => console.error("[LEAD] Confirmation email error:", err));

    res.status(201).json({
      id: lead.id,
      businessName: lead.businessName,
      contactName: lead.contactName,
      email: lead.email,
      phone: lead.phone,
      farmCount: lead.farmCount,
      modulesInterested: lead.modulesInterested,
      message: lead.message,
      createdAt: lead.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("Lead creation error:", err);
    res.status(500).json({ error: "Failed to submit registration. Please try again." });
  }
});

export default router;
