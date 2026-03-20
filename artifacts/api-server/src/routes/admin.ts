import { Router, type IRouter, type Request, type Response } from "express";
import { db, tenantsTable, farmsTable, subscriptionsTable, modulesTable, userTenantsTable, usersTable, supportTicketsTable, supportTicketMessagesTable, adminEmailsSentTable, emailTemplatesTable } from "@workspace/db";
import { eq, and, count, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/roleMiddleware";
import { generateSetupGuidePdf } from "../lib/setup-guide-pdf";
import { sendSetupGuideEmail, sendAdminEmail, sendTicketReplyEmail } from "../lib/mailer";
import { fetchInbox, fetchEmail, markAsRead, markAsUnread, deleteEmail, isImapConfigured } from "../lib/imap";

const router: IRouter = Router();

async function checkPlatformAdmin(req: Request, res: Response): Promise<boolean> {
  if (req.isSuperAdmin) return true;

  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return false;
  }

  const superAdminMembership = await db
    .select()
    .from(userTenantsTable)
    .where(
      and(
        eq(userTenantsTable.userId, req.user.id),
        eq(userTenantsTable.isSuperAdmin, true),
        eq(userTenantsTable.isActive, true),
      ),
    )
    .limit(1);

  if (superAdminMembership.length === 0) {
    res.status(403).json({ error: "BDE Super Admin access required" });
    return false;
  }

  return true;
}

router.get("/admin/tenants", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const tenants = await db.select().from(tenantsTable);
  res.json({ tenants });
});

router.get("/admin/tenants/:tenantId", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const tenantId = parseInt(req.params.tenantId as string, 10);
  const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, tenantId)).limit(1);

  if (!tenant) {
    res.status(404).json({ error: "Tenant not found" });
    return;
  }

  const farms = await db.select().from(farmsTable).where(eq(farmsTable.tenantId, tenantId));

  const subs = await db
    .select({
      id: subscriptionsTable.id,
      farmId: subscriptionsTable.farmId,
      moduleId: subscriptionsTable.moduleId,
      moduleName: modulesTable.name,
      status: subscriptionsTable.status,
      currentPeriodEnd: subscriptionsTable.currentPeriodEnd,
    })
    .from(subscriptionsTable)
    .innerJoin(modulesTable, eq(subscriptionsTable.moduleId, modulesTable.id))
    .where(eq(subscriptionsTable.tenantId, tenantId));

  const users = await db
    .select({
      userId: userTenantsTable.userId,
      roleId: userTenantsTable.roleId,
      isActive: userTenantsTable.isActive,
      email: usersTable.email,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
    })
    .from(userTenantsTable)
    .innerJoin(usersTable, eq(userTenantsTable.userId, usersTable.id))
    .where(eq(userTenantsTable.tenantId, tenantId));

  res.json({ tenant, farms, subscriptions: subs, users });
});

router.get("/admin/stats", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const [tenantCount] = await db.select({ count: count() }).from(tenantsTable);
  const [farmCount] = await db.select({ count: count() }).from(farmsTable);
  const [activeSubCount] = await db.select({ count: count() }).from(subscriptionsTable).where(eq(subscriptionsTable.status, "active"));
  const [userCount] = await db.select({ count: count() }).from(usersTable);

  const mrrResult = await db.execute(sql`
    SELECT COALESCE(SUM(m.monthly_price_pence), 0) AS mrr_pence
    FROM subscriptions s
    JOIN modules m ON m.id = s.module_id
    WHERE s.status = 'active'
  `);
  const mrrPence = Number((mrrResult.rows[0] as { mrr_pence: string })?.mrr_pence ?? 0);

  res.json({
    stats: {
      totalTenants: tenantCount.count,
      totalFarms: farmCount.count,
      activeSubscriptions: activeSubCount.count,
      totalUsers: userCount.count,
      mrrPence,
    },
  });
});

router.get("/admin/support-tickets", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const tickets = await db.select().from(supportTicketsTable);
  res.json({ tickets });
});

router.get("/admin/support-tickets/:ticketId", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const ticketId = parseInt(req.params.ticketId as string, 10);
  if (isNaN(ticketId)) { res.status(400).json({ error: "Invalid ticket ID" }); return; }

  const [ticket] = await db.select().from(supportTicketsTable).where(eq(supportTicketsTable.id, ticketId)).limit(1);
  if (!ticket) { res.status(404).json({ error: "Ticket not found" }); return; }

  const messages = await db.select().from(supportTicketMessagesTable).where(eq(supportTicketMessagesTable.ticketId, ticketId)).orderBy(supportTicketMessagesTable.createdAt);

  res.json({ ticket, messages });
});

router.post("/admin/support-tickets/:ticketId/reply", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const ticketId = parseInt(req.params.ticketId as string, 10);
  if (isNaN(ticketId)) { res.status(400).json({ error: "Invalid ticket ID" }); return; }

  const { message } = req.body;
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  const [ticket] = await db.select().from(supportTicketsTable).where(eq(supportTicketsTable.id, ticketId)).limit(1);
  if (!ticket) { res.status(404).json({ error: "Ticket not found" }); return; }

  const [reply] = await db.insert(supportTicketMessagesTable).values({
    ticketId,
    senderType: "admin",
    senderId: req.user?.id || "system",
    message: message.trim(),
  }).returning();

  const emailResult = await sendTicketReplyEmail({
    toEmail: ticket.email,
    toName: ticket.name,
    ticketId,
    ticketSubject: ticket.subject,
    replyText: message.trim(),
  });

  if (emailResult.sent) {
    await db.insert(adminEmailsSentTable).values({
      toAddress: ticket.email,
      toName: ticket.name,
      subject: `Re: ${ticket.subject} [Ticket #${ticketId}]`,
      body: message.trim(),
      ticketId,
      status: "sent",
    });
  } else {
    console.warn(`[MAILER] Ticket reply email failed for ticket #${ticketId}: ${emailResult.reason}`);
    await db.insert(adminEmailsSentTable).values({
      toAddress: ticket.email,
      toName: ticket.name,
      subject: `Re: ${ticket.subject} [Ticket #${ticketId}]`,
      body: message.trim(),
      ticketId,
      status: "failed",
      errorMessage: emailResult.reason ?? "Unknown error",
    });
  }

  res.status(201).json({ message: reply, emailSent: emailResult.sent });
});

router.patch("/admin/support-tickets/:ticketId/status", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const ticketId = parseInt(req.params.ticketId as string, 10);
  if (isNaN(ticketId)) { res.status(400).json({ error: "Invalid ticket ID" }); return; }

  const { status } = req.body;
  if (!status || !["open", "in_progress", "resolved", "closed"].includes(status)) {
    res.status(400).json({ error: "Invalid status. Must be one of: open, in_progress, resolved, closed" });
    return;
  }

  const [updated] = await db.update(supportTicketsTable).set({ status }).where(eq(supportTicketsTable.id, ticketId)).returning();
  if (!updated) { res.status(404).json({ error: "Ticket not found" }); return; }

  res.json({ ticket: updated });
});

router.get("/admin/schema", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const result = await db.execute(sql`
    SELECT
      t.table_name,
      c.column_name,
      c.data_type,
      c.is_nullable
    FROM information_schema.tables t
    JOIN information_schema.columns c
      ON c.table_name = t.table_name AND c.table_schema = t.table_schema
    WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
    ORDER BY t.table_name, c.ordinal_position
  `);

  type SchemaRow = { table_name: string; column_name: string; data_type: string; is_nullable: string };
  const grouped: Record<string, { name: string; type: string; nullable: boolean }[]> = {};
  for (const row of result.rows as SchemaRow[]) {
    if (!grouped[row.table_name]) grouped[row.table_name] = [];
    grouped[row.table_name].push({
      name: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable === "YES",
    });
  }

  res.json({ tables: grouped });
});

router.post("/admin/sql", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const { query, limit = 500 } = req.body;
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    res.status(400).json({ error: "Query is required." });
    return;
  }

  const stripped = query.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--[^\n]*/g, "").trim().toLowerCase();
  if (!stripped.startsWith("select") && !stripped.startsWith("with")) {
    res.status(400).json({ error: "Only SELECT (or WITH…SELECT) queries are permitted." });
    return;
  }

  const dangerous = /\b(insert|update|delete|drop|alter|truncate|create|grant|revoke|pg_read_file|pg_write_file|pg_exec|copy)\b/i;
  if (dangerous.test(query)) {
    res.status(400).json({ error: "Query contains disallowed keywords." });
    return;
  }

  const safeLimit = Math.min(Math.max(1, parseInt(String(limit), 10) || 500), 2000);
  const cleanQuery = query.trim().replace(/;\s*$/, "");
  const wrappedQuery = `SELECT * FROM (${cleanQuery}) AS __bde_q LIMIT ${safeLimit}`;

  const start = Date.now();
  try {
    const result = await db.transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL statement_timeout = '10000'`);
      await tx.execute(sql`SET TRANSACTION READ ONLY`);
      return await tx.execute(sql.raw(wrappedQuery));
    });

    const durationMs = Date.now() - start;
    const rows = result.rows as Record<string, unknown>[];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    res.json({ columns, rows, rowCount: rows.length, durationMs, limited: rows.length === safeLimit });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Query failed.";
    res.status(400).json({ error: msg });
  }
});

router.post("/admin/impersonate", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const { userId, tenantId } = req.body;
  if (!userId || !tenantId) {
    res.status(400).json({ error: "userId and tenantId are required" });
    return;
  }

  const [targetUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!targetUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    impersonation: {
      userId: targetUser.id,
      email: targetUser.email,
      firstName: targetUser.firstName,
      lastName: targetUser.lastName,
      tenantId,
      note: "Client-side should set x-tenant-slug header and x-impersonate-user header for subsequent requests",
    },
  });
});

// ─── Setup Guide PDF ──────────────────────────────────────────────────────────

router.get(
  "/admin/tenants/:tenantId/farms/:farmId/setup-guide.pdf",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    if (!(await checkPlatformAdmin(req, res))) return;

    const tenantId = parseInt(req.params.tenantId as string, 10);
    const farmId = parseInt(req.params.farmId as string, 10);

    const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, tenantId)).limit(1);
    if (!tenant) { res.status(404).json({ error: "Tenant not found" }); return; }

    const [farm] = await db.select().from(farmsTable)
      .where(and(eq(farmsTable.id, farmId), eq(farmsTable.tenantId, tenantId)))
      .limit(1);
    if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }

    const subs = await db
      .select({
        moduleKey: modulesTable.key,
        moduleName: modulesTable.name,
        status: subscriptionsTable.status,
      })
      .from(subscriptionsTable)
      .innerJoin(modulesTable, eq(subscriptionsTable.moduleId, modulesTable.id))
      .where(
        and(
          eq(subscriptionsTable.farmId, farmId),
          eq(subscriptionsTable.status, "active"),
        )
      );

    const moduleKeys = subs.map((s) => s.moduleKey);

    const pdfBuffer = await generateSetupGuidePdf({
      tenantName: tenant.name,
      tenantEmail: tenant.contactEmail,
      farmName: farm.name,
      cphNumber: farm.cphNumber ?? undefined,
      redTractorId: (farm as any).redTractorId ?? undefined,
      farmManager: (farm as any).farmManager ?? undefined,
      postcode: farm.postcode ?? undefined,
      moduleKeys,
      generatedAt: new Date(),
    });

    const filename = `BDE-Farm-Trac-Setup-Guide-${farm.name.replace(/[^a-z0-9]+/gi, "-")}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  }
);

// ─── Send Setup Guide by Email ────────────────────────────────────────────────

router.post(
  "/admin/tenants/:tenantId/farms/:farmId/send-setup-guide",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    if (!(await checkPlatformAdmin(req, res))) return;

    const tenantId = parseInt(req.params.tenantId as string, 10);
    const farmId = parseInt(req.params.farmId as string, 10);

    const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, tenantId)).limit(1);
    if (!tenant) { res.status(404).json({ error: "Tenant not found" }); return; }

    const [farm] = await db.select().from(farmsTable)
      .where(and(eq(farmsTable.id, farmId), eq(farmsTable.tenantId, tenantId)))
      .limit(1);
    if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }

    const subs = await db
      .select({ moduleKey: modulesTable.key })
      .from(subscriptionsTable)
      .innerJoin(modulesTable, eq(subscriptionsTable.moduleId, modulesTable.id))
      .where(and(eq(subscriptionsTable.farmId, farmId), eq(subscriptionsTable.status, "active")));

    const result = await sendSetupGuideEmail({
      tenantName: tenant.name,
      tenantEmail: tenant.contactEmail,
      farmName: farm.name,
      cphNumber: farm.cphNumber ?? undefined,
      redTractorId: (farm as any).redTractorId ?? undefined,
      farmManager: (farm as any).farmManager ?? undefined,
      postcode: farm.postcode ?? undefined,
      moduleKeys: subs.map((s) => s.moduleKey),
      generatedAt: new Date(),
    });

    if (result.sent) {
      res.json({ sent: true, to: tenant.contactEmail });
    } else {
      res.status(500).json({ sent: false, reason: result.reason });
    }
  }
);

// ─── Email: IMAP Inbox ───────────────────────────────────────────────────────

router.get("/admin/inbox", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  if (!(await isImapConfigured())) {
    res.status(503).json({ error: "IMAP not configured (TITAN_IMAP_PASSWORD missing)" });
    return;
  }

  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? "50"), 10) || 50, 200);
    const emails = await fetchInbox(limit);
    res.json({ emails });
  } catch (err) {
    console.error("[IMAP] fetchInbox error:", err);
    res.status(502).json({ error: `IMAP error: ${err instanceof Error ? err.message : String(err)}` });
  }
});

router.get("/admin/inbox/:uid", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const uid = parseInt(req.params.uid as string, 10);
  if (isNaN(uid)) { res.status(400).json({ error: "Invalid UID" }); return; }

  try {
    const email = await fetchEmail(uid);
    res.json({ email });
  } catch (err) {
    console.error("[IMAP] fetchEmail error:", err);
    res.status(502).json({ error: `IMAP error: ${err instanceof Error ? err.message : String(err)}` });
  }
});

router.patch("/admin/inbox/:uid/read", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const uid = parseInt(req.params.uid as string, 10);
  if (isNaN(uid)) { res.status(400).json({ error: "Invalid UID" }); return; }

  const { read } = req.body;

  try {
    if (read === false) {
      await markAsUnread(uid);
    } else {
      await markAsRead(uid);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("[IMAP] markAsRead error:", err);
    res.status(502).json({ error: `IMAP error: ${err instanceof Error ? err.message : String(err)}` });
  }
});

router.delete("/admin/inbox/:uid", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const uid = parseInt(req.params.uid as string, 10);
  if (isNaN(uid)) { res.status(400).json({ error: "Invalid UID" }); return; }

  try {
    await deleteEmail(uid);
    res.json({ deleted: true });
  } catch (err) {
    console.error("[IMAP] deleteEmail error:", err);
    res.status(502).json({ error: `IMAP error: ${err instanceof Error ? err.message : String(err)}` });
  }
});

router.post("/admin/inbox/:uid/reply", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const uid = parseInt(req.params.uid as string, 10);
  if (isNaN(uid)) { res.status(400).json({ error: "Invalid UID" }); return; }

  const { body, subject } = req.body;
  if (!body || typeof body !== "string" || body.trim().length === 0) {
    res.status(400).json({ error: "Reply body is required" });
    return;
  }

  try {
    const original = await fetchEmail(uid);
    const replyTo = original.replyTo || original.fromEmail;
    const replySubject = subject?.trim() || (original.subject.startsWith("Re:") ? original.subject : `Re: ${original.subject}`);

    const result = await sendAdminEmail({
      to: replyTo,
      toName: original.from !== original.fromEmail ? original.from : undefined,
      subject: replySubject,
      body: body.trim(),
    });

    if (result.sent) {
      await markAsRead(uid);
      await db.insert(adminEmailsSentTable).values({
        toAddress: replyTo,
        toName: original.from || null,
        subject: replySubject,
        body: body.trim(),
        status: "sent",
      });
      res.json({ sent: true });
    } else {
      res.status(500).json({ sent: false, reason: result.reason });
    }
  } catch (err) {
    console.error("[IMAP] reply error:", err);
    res.status(502).json({ error: `Error: ${err instanceof Error ? err.message : String(err)}` });
  }
});

// ─── Email: Compose & Send ────────────────────────────────────────────────────

router.post("/admin/emails/send", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const { to, toName, subject, body, templateId } = req.body;
  if (!to || typeof to !== "string" || !to.includes("@")) {
    res.status(400).json({ error: "Valid 'to' email address is required" });
    return;
  }
  if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
    res.status(400).json({ error: "'subject' is required" });
    return;
  }
  if (!body || typeof body !== "string" || body.trim().length === 0) {
    res.status(400).json({ error: "'body' is required" });
    return;
  }

  const result = await sendAdminEmail({
    to: to.trim(),
    toName: toName?.trim() || undefined,
    subject: subject.trim(),
    body: body.trim(),
  });

  const [record] = await db.insert(adminEmailsSentTable).values({
    toAddress: to.trim(),
    toName: toName?.trim() || null,
    subject: subject.trim(),
    body: body.trim(),
    templateId: templateId ? parseInt(String(templateId), 10) : null,
    status: result.sent ? "sent" : "failed",
    errorMessage: result.sent ? null : (result.reason ?? "Unknown error"),
  }).returning();

  if (result.sent) {
    res.json({ sent: true, email: record });
  } else {
    res.status(500).json({ sent: false, reason: result.reason, email: record });
  }
});

router.get("/admin/emails/sent", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const emails = await db
    .select()
    .from(adminEmailsSentTable)
    .orderBy(desc(adminEmailsSentTable.sentAt))
    .limit(200);

  res.json({ emails });
});

// ─── Email Templates ──────────────────────────────────────────────────────────

router.get("/admin/email-templates", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const templates = await db
    .select()
    .from(emailTemplatesTable)
    .orderBy(emailTemplatesTable.category, emailTemplatesTable.name);

  res.json({ templates });
});

router.post("/admin/email-templates", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const { name, category, subject, body } = req.body;
  if (!name || !subject || !body) {
    res.status(400).json({ error: "name, subject and body are required" });
    return;
  }

  const [template] = await db.insert(emailTemplatesTable).values({
    name: name.trim(),
    category: (category ?? "general").trim(),
    subject: subject.trim(),
    body: body.trim(),
  }).returning();

  res.status(201).json({ template });
});

router.put("/admin/email-templates/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid template ID" }); return; }

  const { name, category, subject, body, isActive } = req.body;

  const updates: Partial<typeof emailTemplatesTable.$inferInsert> = { updatedAt: new Date() };
  if (name !== undefined) updates.name = name.trim();
  if (category !== undefined) updates.category = category.trim();
  if (subject !== undefined) updates.subject = subject.trim();
  if (body !== undefined) updates.body = body.trim();
  if (isActive !== undefined) updates.isActive = Boolean(isActive);

  const [updated] = await db
    .update(emailTemplatesTable)
    .set(updates)
    .where(eq(emailTemplatesTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Template not found" }); return; }
  res.json({ template: updated });
});

router.delete("/admin/email-templates/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid template ID" }); return; }

  const [deleted] = await db
    .delete(emailTemplatesTable)
    .where(eq(emailTemplatesTable.id, id))
    .returning();

  if (!deleted) { res.status(404).json({ error: "Template not found" }); return; }
  res.json({ deleted: true });
});

export default router;
