import { Router, type IRouter } from "express";
import { db, leadsTable } from "@workspace/db";
import { CreateLeadBody } from "@workspace/api-zod";
import { sendLeadConfirmationEmail } from "../lib/mailer";

const router: IRouter = Router();

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
