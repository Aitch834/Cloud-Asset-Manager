import { Router, type IRouter, type Request, type Response } from "express";
import { db, tenantsTable, farmsTable, subscriptionsTable, modulesTable, userTenantsTable, usersTable, supportTicketsTable, supportTicketMessagesTable, adminEmailsSentTable, emailTemplatesTable, leadsTable, rolesTable, invoicesTable, platformConfigTable, platformAuditLogTable, helpArticlesTable } from "@workspace/db";
import { eq, and, count, desc, sql, asc } from "drizzle-orm";
import { requireAuth } from "../middlewares/roleMiddleware";
import { generateSetupGuidePdf } from "../lib/setup-guide-pdf";
import { sendSetupGuideEmail, sendAdminEmail, sendTicketReplyEmail } from "../lib/mailer";
import { fetchInbox, fetchEmail, markAsRead, markAsUnread, deleteEmail, isImapConfigured } from "../lib/imap";

const router: IRouter = Router();

// ─── Audit Log Helper ─────────────────────────────────────────────────────────

async function writeAuditLog(
  actorUserId: string,
  action: string,
  metadata?: Record<string, unknown>,
  targetTenantId?: number,
  targetFarmId?: number,
): Promise<void> {
  try {
    await db.insert(platformAuditLogTable).values({
      actorUserId,
      action,
      targetTenantId: targetTenantId ?? null,
      targetFarmId: targetFarmId ?? null,
      metadata: metadata ?? null,
    });
  } catch (err) {
    // Never let audit log failures surface to the user — log and continue.
    console.error("[audit] Failed to write audit log:", err);
  }
}

async function checkPlatformAdmin(req: Request, res: Response): Promise<boolean> {
  if (req.isSuperAdmin) return true;

  if (!req.userId) {
    res.status(401).json({ error: "Authentication required" });
    return false;
  }

  const superAdminMembership = await db
    .select()
    .from(userTenantsTable)
    .where(
      and(
        eq(userTenantsTable.userId, req.userId),
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
      roleName: rolesTable.name,
      isActive: userTenantsTable.isActive,
      receiveAlerts: userTenantsTable.receiveAlerts,
      email: usersTable.email,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
    })
    .from(userTenantsTable)
    .innerJoin(usersTable, eq(userTenantsTable.userId, usersTable.id))
    .leftJoin(rolesTable, eq(rolesTable.id, userTenantsTable.roleId))
    .where(eq(userTenantsTable.tenantId, tenantId));

  res.json({ tenant, farms, subscriptions: subs, users });
});

router.patch("/admin/tenants/:tenantId/users/:userId/alerts", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const tenantId = parseInt(req.params.tenantId as string, 10);
  const userId = req.params.userId;
  const { receiveAlerts } = req.body as { receiveAlerts: boolean };

  if (typeof receiveAlerts !== "boolean") {
    res.status(400).json({ error: "receiveAlerts must be a boolean" });
    return;
  }

  await db
    .update(userTenantsTable)
    .set({ receiveAlerts })
    .where(and(eq(userTenantsTable.tenantId, tenantId), eq(userTenantsTable.userId, userId as any)));

  res.json({ success: true });
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

  const churnedResult = await db.execute(sql`
    SELECT COUNT(*) AS churned FROM tenants WHERE cancelled_at IS NOT NULL
  `);
  const churnedTenants = Number((churnedResult.rows[0] as { churned: string })?.churned ?? 0);
  const total = Number(tenantCount.count);
  const churnRatePct = total > 0 ? Math.round((churnedTenants / total) * 1000) / 10 : 0;

  const sourceResult = await db.execute(sql`
    SELECT COALESCE(source, 'Unknown') AS source, COUNT(*) AS cnt
    FROM registration_leads
    GROUP BY source
    ORDER BY cnt DESC
  `);
  const leadSourceBreakdown = (sourceResult.rows as { source: string; cnt: string }[]).map((r) => ({
    source: r.source,
    count: Number(r.cnt),
  }));

  const moduleResult = await db.execute(sql`
    SELECT m.key AS module_key, m.name AS module_name, COUNT(s.id)::int AS active_count
    FROM modules m
    LEFT JOIN subscriptions s ON s.module_id = m.id AND s.status = 'active'
    WHERE m.is_active = true
    GROUP BY m.id, m.key, m.name
    ORDER BY active_count DESC, m.name ASC
  `);
  const moduleAdoption = (moduleResult.rows as { module_key: string; module_name: string; active_count: number }[]).map((r) => ({
    moduleKey: r.module_key,
    moduleName: r.module_name,
    activeCount: Number(r.active_count),
  }));

  res.json({
    stats: {
      totalTenants: tenantCount.count,
      totalFarms: farmCount.count,
      activeSubscriptions: activeSubCount.count,
      totalUsers: userCount.count,
      mrrPence,
      churnedTenants,
      churnRatePct,
      leadSourceBreakdown,
      moduleAdoption,
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
    senderId: req.userId || "system",
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

    // Audit every SQL query run by an admin — do not await, fire-and-forget.
    void writeAuditLog(req.userId!, "sql_query", {
      query: cleanQuery,
      rowCount: rows.length,
      durationMs,
    });

    res.json({ columns, rows, rowCount: rows.length, durationMs, limited: rows.length === safeLimit });
  } catch (err: unknown) {
    console.error("[admin/sql] query error:", err);
    res.status(400).json({ error: "Query failed. Check the server logs for details." });
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

  // Audit the impersonation — this is a high-value event.
  void writeAuditLog(req.userId!, "impersonate", {
    impersonatedUserId: targetUser.id,
    impersonatedEmail: targetUser.email,
    tenantId,
  }, typeof tenantId === "number" ? tenantId : undefined);

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
    res.status(502).json({ error: "Unable to connect to mail server. Check server logs for details." });
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
    res.status(502).json({ error: "Failed to fetch email. Check server logs for details." });
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
    res.status(502).json({ error: "Failed to update email status. Check server logs for details." });
  }
});

router.delete("/admin/inbox/:uid", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const uid = parseInt(req.params.uid as string, 10);
  if (isNaN(uid)) { res.status(400).json({ error: "Invalid UID" }); return; }

  try {
    await deleteEmail(uid);
    void writeAuditLog(req.userId!, "email_delete", { uid });
    res.json({ deleted: true });
  } catch (err) {
    console.error("[IMAP] deleteEmail error:", err);
    res.status(502).json({ error: "Failed to delete email. Check server logs for details." });
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
    res.status(502).json({ error: "Failed to send reply. Check server logs for details." });
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

// ─── Leads / Pipeline ──────────────────────────────────────────────────────

router.get("/admin/leads", async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const leads = await db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt));
  res.json({ leads });
});

router.patch("/admin/leads/:id", async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid lead ID" }); return; }

  const { status, notes, source } = req.body as { status?: string; notes?: string; source?: string };
  const allowed = ["new", "contacted", "demo-booked", "signed-up", "not-interested"];
  if (status && !allowed.includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (status !== undefined) {
    updates.status = status;
    if (status !== "new") updates.lastContactedAt = new Date();
  }
  if (notes !== undefined) updates.notes = notes;
  if (source !== undefined) updates.source = source || null;

  const [updated] = await db.update(leadsTable).set(updates).where(eq(leadsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Lead not found" }); return; }
  res.json({ lead: updated });
});

// ─── Tenant Management (churn, referral, etc.) ───────────────────────────────

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

router.patch("/admin/tenants/:tenantId", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const tenantId = parseInt(req.params.tenantId as string, 10);
  if (isNaN(tenantId)) { res.status(400).json({ error: "Invalid tenant ID" }); return; }

  const { isActive, cancelReason, cancelledAt, referredBy } = req.body as {
    isActive?: boolean;
    cancelReason?: string;
    cancelledAt?: string | null;
    referredBy?: string | null;
  };

  const updates: Record<string, unknown> = {};
  if (isActive !== undefined) updates.isActive = isActive;
  if (cancelReason !== undefined) updates.cancelReason = cancelReason || null;
  if (cancelledAt !== undefined) updates.cancelledAt = cancelledAt ? new Date(cancelledAt) : null;
  if (referredBy !== undefined) updates.referredBy = referredBy || null;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No valid fields to update" });
    return;
  }

  const [updated] = await db.update(tenantsTable).set(updates).where(eq(tenantsTable.id, tenantId)).returning();
  if (!updated) { res.status(404).json({ error: "Tenant not found" }); return; }
  res.json({ tenant: updated });
});

router.post("/admin/tenants/:tenantId/referral-code", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const tenantId = parseInt(req.params.tenantId as string, 10);
  if (isNaN(tenantId)) { res.status(400).json({ error: "Invalid tenant ID" }); return; }

  const [existing] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, tenantId)).limit(1);
  if (!existing) { res.status(404).json({ error: "Tenant not found" }); return; }

  if (existing.referralCode) {
    res.json({ referralCode: existing.referralCode });
    return;
  }

  let code = generateReferralCode();
  let attempts = 0;
  while (attempts < 10) {
    const conflict = await db.select({ id: tenantsTable.id }).from(tenantsTable).where(eq(tenantsTable.referralCode, code)).limit(1);
    if (conflict.length === 0) break;
    code = generateReferralCode();
    attempts++;
  }

  const [updated] = await db.update(tenantsTable).set({ referralCode: code }).where(eq(tenantsTable.id, tenantId)).returning();
  res.json({ referralCode: updated.referralCode });
});

router.get("/admin/referrals", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const tenants = await db.select({
    id: tenantsTable.id,
    name: tenantsTable.name,
    slug: tenantsTable.slug,
    referralCode: tenantsTable.referralCode,
    referredBy: tenantsTable.referredBy,
    isActive: tenantsTable.isActive,
    cancelledAt: tenantsTable.cancelledAt,
    createdAt: tenantsTable.createdAt,
  }).from(tenantsTable).orderBy(asc(tenantsTable.name));

  const referralMap: Record<string, number> = {};
  for (const t of tenants) {
    if (t.referralCode) referralMap[t.referralCode] = 0;
  }
  for (const t of tenants) {
    if (t.referredBy && referralMap[t.referredBy] !== undefined) {
      referralMap[t.referredBy]++;
    }
  }

  const result = tenants.map((t) => ({
    ...t,
    referralCount: t.referralCode ? (referralMap[t.referralCode] ?? 0) : 0,
  }));

  res.json({ tenants: result });
});

// ─── Invoices ────────────────────────────────────────────────────────────────

async function nextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const existing = await db
    .select({ num: invoicesTable.invoiceNumber })
    .from(invoicesTable)
    .where(sql`invoice_number LIKE ${"BDE-" + year + "-%"}`)
    .orderBy(desc(invoicesTable.invoiceNumber))
    .limit(1);
  let seq = 1;
  if (existing.length > 0) {
    const parts = existing[0].num.split("-");
    seq = parseInt(parts[parts.length - 1], 10) + 1;
  }
  return `BDE-${year}-${String(seq).padStart(4, "0")}`;
}

const BASE_FEE_PENCE = 1500;

router.get("/admin/invoices", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const { tenantId, status } = req.query;
  let q = db
    .select({
      invoice: invoicesTable,
      tenantName: tenantsTable.name,
      tenantSlug: tenantsTable.slug,
    })
    .from(invoicesTable)
    .innerJoin(tenantsTable, eq(invoicesTable.tenantId, tenantsTable.id))
    .$dynamic();
  const filters = [];
  if (tenantId) filters.push(eq(invoicesTable.tenantId, parseInt(tenantId as string, 10)));
  if (status) filters.push(eq(invoicesTable.status, status as string));
  if (filters.length) q = q.where(and(...filters)) as typeof q;
  const rows = await q.orderBy(desc(invoicesTable.invoiceDate));
  res.json({ invoices: rows.map(r => ({ ...r.invoice, tenantName: r.tenantName, tenantSlug: r.tenantSlug })) });
});

router.get("/admin/invoices/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const id = parseInt(req.params.id as string, 10);
  const [row] = await db
    .select({ invoice: invoicesTable, tenantName: tenantsTable.name, tenantSlug: tenantsTable.slug })
    .from(invoicesTable)
    .innerJoin(tenantsTable, eq(invoicesTable.tenantId, tenantsTable.id))
    .where(eq(invoicesTable.id, id))
    .limit(1);
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ invoice: { ...row.invoice, tenantName: row.tenantName, tenantSlug: row.tenantSlug } });
});

router.post("/admin/invoices/generate/:tenantId", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const tenantId = parseInt(req.params.tenantId as string, 10);
  const { billingPeriodStart, billingPeriodEnd, vatRatePct = 20, notes } = req.body;

  const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, tenantId)).limit(1);
  if (!tenant) { res.status(404).json({ error: "Tenant not found" }); return; }

  const subs = await db
    .select({ moduleName: modulesTable.name, pricePence: modulesTable.monthlyPricePence, farmId: subscriptionsTable.farmId, farmName: farmsTable.name })
    .from(subscriptionsTable)
    .innerJoin(modulesTable, eq(subscriptionsTable.moduleId, modulesTable.id))
    .innerJoin(farmsTable, eq(subscriptionsTable.farmId, farmsTable.id))
    .where(and(eq(subscriptionsTable.tenantId, tenantId), eq(subscriptionsTable.status, "active")));

  const periodLabel = billingPeriodStart
    ? new Date(billingPeriodStart).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const lineItems: { description: string; quantity: number; unitPricePence: number; netPence: number }[] = [
    { description: `Platform base fee — ${periodLabel}`, quantity: 1, unitPricePence: BASE_FEE_PENCE, netPence: BASE_FEE_PENCE },
  ];
  for (const sub of subs) {
    lineItems.push({
      description: `${sub.moduleName} — ${sub.farmName} (${periodLabel})`,
      quantity: 1,
      unitPricePence: sub.pricePence,
      netPence: sub.pricePence,
    });
  }
  const netAmountPence = lineItems.reduce((a, i) => a + i.netPence, 0);
  const vatAmountPence = Math.round(netAmountPence * (vatRatePct / 100));
  const grossAmountPence = netAmountPence + vatAmountPence;

  const invoiceDate = new Date();
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + 14);

  const invoiceNumber = await nextInvoiceNumber();

  const [invoice] = await db.insert(invoicesTable).values({
    tenantId,
    invoiceNumber,
    status: "draft",
    billingPeriodStart: billingPeriodStart ? new Date(billingPeriodStart) : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    billingPeriodEnd: billingPeriodEnd ? new Date(billingPeriodEnd) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    invoiceDate,
    dueDate,
    billingName: tenant.name,
    billingAddress: (tenant as any).address ?? null,
    billingEmail: tenant.contactEmail,
    lineItems,
    netAmountPence,
    vatRatePct: vatRatePct as number,
    vatAmountPence,
    grossAmountPence,
    notes: notes ?? null,
  }).returning();
  res.status(201).json({ invoice });
});

router.post("/admin/invoices", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const { tenantId, billingPeriodStart, billingPeriodEnd, lineItems, vatRatePct = 20, notes, billingName, billingEmail, billingAddress } = req.body;
  if (!tenantId || !lineItems?.length) { res.status(400).json({ error: "tenantId and lineItems required" }); return; }

  const netAmountPence = (lineItems as { netPence: number }[]).reduce((a, i) => a + i.netPence, 0);
  const vatAmountPence = Math.round(netAmountPence * (vatRatePct / 100));
  const grossAmountPence = netAmountPence + vatAmountPence;
  const invoiceNumber = await nextInvoiceNumber();
  const invoiceDate = new Date();
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + 14);

  const [invoice] = await db.insert(invoicesTable).values({
    tenantId, invoiceNumber, status: "draft",
    billingPeriodStart: new Date(billingPeriodStart),
    billingPeriodEnd: new Date(billingPeriodEnd),
    invoiceDate, dueDate,
    billingName, billingEmail, billingAddress: billingAddress ?? null,
    lineItems, netAmountPence, vatRatePct, vatAmountPence, grossAmountPence,
    notes: notes ?? null,
  }).returning();
  res.status(201).json({ invoice });
});

router.patch("/admin/invoices/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const id = parseInt(req.params.id as string, 10);
  const { status, paymentMethod, paymentReference, notes, paidAt, sentAt } = req.body;
  const updates: Partial<typeof invoicesTable.$inferInsert> = {};
  if (status !== undefined) updates.status = status;
  if (paymentMethod !== undefined) updates.paymentMethod = paymentMethod;
  if (paymentReference !== undefined) updates.paymentReference = paymentReference;
  if (notes !== undefined) updates.notes = notes;
  if (paidAt !== undefined) updates.paidAt = paidAt ? new Date(paidAt) : null;
  if (sentAt !== undefined) updates.sentAt = sentAt ? new Date(sentAt) : null;
  if (status === "paid" && !paidAt) updates.paidAt = new Date();
  if (status === "sent" && !sentAt) updates.sentAt = new Date();
  const [invoice] = await db.update(invoicesTable).set(updates).where(eq(invoicesTable.id, id)).returning();
  if (!invoice) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ invoice });
});

router.delete("/admin/invoices/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const id = parseInt(req.params.id as string, 10);
  const [inv] = await db.select().from(invoicesTable).where(eq(invoicesTable.id, id)).limit(1);
  if (!inv) { res.status(404).json({ error: "Not found" }); return; }
  if (inv.status !== "draft" && inv.status !== "void") {
    res.status(400).json({ error: "Only draft or void invoices can be deleted" }); return;
  }
  await db.delete(invoicesTable).where(eq(invoicesTable.id, id));
  res.json({ success: true });
});

const PLATFORM_CONFIG_DEFAULTS: Record<string, { label: string; description: string; value: string }> = {
  nvz_tile_url: {
    label: "NVZ Map Tile URL",
    description: "ArcGIS tile template URL for the Environment Agency Nitrate Vulnerable Zone overlay. Use {z}, {y}, {x} placeholders. Change this here if the EA service path changes without redeploying the app.",
    value: "https://environment.data.gov.uk/arcgis/rest/services/EA/NVZ2017/MapServer/tile/{z}/{y}/{x}",
  },
};

router.get("/platform-config", async (_req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(platformConfigTable);
  const byKey: Record<string, string> = {};
  for (const row of rows) byKey[row.key] = row.value;
  const merged: Record<string, string> = {};
  for (const [key, def] of Object.entries(PLATFORM_CONFIG_DEFAULTS)) {
    merged[key] = byKey[key] ?? def.value;
  }
  res.json({ config: merged });
});

router.get("/admin/platform-config", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const rows = await db.select().from(platformConfigTable);
  const byKey: Record<string, { value: string; updatedAt: Date }> = {};
  for (const row of rows) byKey[row.key] = { value: row.value, updatedAt: row.updatedAt };
  const items = Object.entries(PLATFORM_CONFIG_DEFAULTS).map(([key, def]) => ({
    key,
    label: def.label,
    description: def.description,
    defaultValue: def.value,
    currentValue: byKey[key]?.value ?? null,
    updatedAt: byKey[key]?.updatedAt ?? null,
  }));
  res.json({ items });
});

router.put("/admin/platform-config/:key", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const { key } = req.params as { key: string };
  if (!PLATFORM_CONFIG_DEFAULTS[key]) {
    res.status(400).json({ error: "Unknown config key" });
    return;
  }
  const { value } = req.body as { value?: string };
  if (typeof value !== "string" || !value.trim()) {
    res.status(400).json({ error: "value is required" });
    return;
  }
  const def = PLATFORM_CONFIG_DEFAULTS[key];
  await db.insert(platformConfigTable)
    .values({ key, value: value.trim(), label: def.label, description: def.description, updatedAt: new Date() })
    .onConflictDoUpdate({ target: platformConfigTable.key, set: { value: value.trim(), updatedAt: new Date() } });
  res.json({ success: true, key, value: value.trim() });
});

router.delete("/admin/platform-config/:key", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const { key } = req.params as { key: string };
  if (!PLATFORM_CONFIG_DEFAULTS[key]) { res.status(400).json({ error: "Unknown config key" }); return; }
  await db.delete(platformConfigTable).where(eq(platformConfigTable.key, key));
  res.json({ success: true });
});

router.post("/admin/tenants/:tenantId/farms/:farmId/start-trial", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const tenantId = parseInt(req.params.tenantId as string, 10);
  const farmId = parseInt(req.params.farmId as string, 10);
  const trialDays: number = typeof req.body.trialDays === "number" && req.body.trialDays > 0 ? req.body.trialDays : 30;

  const [farm] = await db
    .select()
    .from(farmsTable)
    .where(and(eq(farmsTable.id, farmId), eq(farmsTable.tenantId, tenantId)))
    .limit(1);

  if (!farm) {
    res.status(404).json({ error: "Farm not found for this tenant" });
    return;
  }

  const modules = await db.select().from(modulesTable).where(eq(modulesTable.isActive, true));

  const existing = await db
    .select({ moduleId: subscriptionsTable.moduleId, status: subscriptionsTable.status })
    .from(subscriptionsTable)
    .where(and(eq(subscriptionsTable.farmId, farmId), eq(subscriptionsTable.tenantId, tenantId)));

  const blockedModuleIds = new Set(
    existing.filter((s) => s.status === "active" || s.status === "trial").map((s) => s.moduleId),
  );

  const trialStart = new Date();
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + trialDays);

  const toInsert = modules.filter((m) => !blockedModuleIds.has(m.id));

  if (toInsert.length > 0) {
    await db.insert(subscriptionsTable).values(
      toInsert.map((m) => ({
        tenantId,
        farmId,
        moduleId: m.id,
        status: "trial",
        currentPeriodStart: trialStart,
        currentPeriodEnd: trialEnd,
      })),
    );
  }

  await writeAuditLog(
    req.userId!,
    "start_trial",
    { tenantId, farmId, trialDays, modulesProvisioned: toInsert.length, trialEndsAt: trialEnd.toISOString() },
    tenantId,
    farmId,
  );

  res.json({ success: true, modulesProvisioned: toInsert.length, trialEndsAt: trialEnd.toISOString() });
});

router.post("/admin/seed-demo-data", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  try {
    const { seedDemoData } = await import("../lib/seedDemoData");
    await seedDemoData();
    res.json({ success: true, message: "Demo data seeded successfully" });
  } catch (err) {
    console.error("[SEED] Failed:", err);
    res.status(500).json({ error: "Seed failed", details: String(err) });
  }
});

// ─── Help Centre Management ───────────────────────────────────────────────────

router.get("/admin/help-articles", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const articles = await db.select().from(helpArticlesTable).orderBy(helpArticlesTable.sortOrder, helpArticlesTable.id);
  res.json({ articles });
});

router.post("/admin/help-articles", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const { title, slug, category, content, excerpt, published, sortOrder } = req.body as Record<string, unknown>;
  if (!title || !slug || !category) { res.status(400).json({ error: "title, slug and category are required" }); return; }
  const [article] = await db.insert(helpArticlesTable).values({
    title: String(title),
    slug: String(slug),
    category: String(category),
    content: content ? String(content) : "",
    excerpt: excerpt ? String(excerpt) : null,
    published: published === true || published === "true",
    sortOrder: sortOrder != null ? Number(sortOrder) : 0,
    updatedAt: new Date(),
  }).returning();
  res.json({ article });
});

router.put("/admin/help-articles/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const { title, slug, category, content, excerpt, published, sortOrder } = req.body as Record<string, unknown>;
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (title !== undefined) updates.title = String(title);
  if (slug !== undefined) updates.slug = String(slug);
  if (category !== undefined) updates.category = String(category);
  if (content !== undefined) updates.content = String(content);
  if (excerpt !== undefined) updates.excerpt = excerpt ? String(excerpt) : null;
  if (published !== undefined) updates.published = published === true || published === "true";
  if (sortOrder !== undefined) updates.sortOrder = Number(sortOrder);
  const [article] = await db.update(helpArticlesTable).set(updates).where(eq(helpArticlesTable.id, id)).returning();
  if (!article) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ article });
});

router.delete("/admin/help-articles/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(helpArticlesTable).where(eq(helpArticlesTable.id, id));
  res.json({ success: true });
});

router.post("/admin/help-articles/seed-defaults", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const { DEFAULT_HELP_ARTICLES } = await import("../lib/defaultHelpArticles");
  let inserted = 0;
  for (const a of DEFAULT_HELP_ARTICLES) {
    const existing = await db.select({ id: helpArticlesTable.id }).from(helpArticlesTable).where(eq(helpArticlesTable.slug, a.slug)).limit(1);
    if (existing.length === 0) {
      await db.insert(helpArticlesTable).values({ ...a, updatedAt: new Date() });
      inserted++;
    }
  }
  res.json({ success: true, inserted, skipped: DEFAULT_HELP_ARTICLES.length - inserted });
});

export default router;
