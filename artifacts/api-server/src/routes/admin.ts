import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";
import crypto from "crypto";
import dns from "dns";
import { db, tenantsTable, farmsTable, subscriptionsTable, modulesTable, userTenantsTable, usersTable, supportTicketsTable, supportTicketMessagesTable, adminEmailsSentTable, emailTemplatesTable, leadsTable, rolesTable, invoicesTable, platformConfigTable, platformAuditLogTable, helpArticlesTable, adTemplatesTable, adCopyPresetsTable } from "@workspace/db";
import { eq, and, count, desc, sql, asc, inArray, isNull } from "drizzle-orm";
import { requireAuth } from "../middlewares/roleMiddleware";
import { generateSetupGuidePdf } from "../lib/setup-guide-pdf";
import { sendSetupGuideEmail, sendAdminEmail, sendTicketReplyEmail } from "../lib/mailer";
import { fetchInbox, fetchEmail, fetchAttachment, markAsRead, markAsUnread, deleteEmail, isImapConfigured, listMailboxes, fetchFolder, fetchEmailFromFolder, markFolderEmailRead, permanentlyDeleteFromFolder, moveToInbox, getUnreadCounts } from "../lib/imap";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
});

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

// ─── Public Analytics — no auth required ──────────────────────────────────────

router.post("/analytics/visit", async (req: Request, res: Response): Promise<void> => {
  try {
    const { path, referrer } = req.body as { path?: string; referrer?: string };
    if (!path || typeof path !== "string") { res.status(204).end(); return; }

    const { createHash } = await import("node:crypto");
    const rawIp = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim()
      ?? (req.socket as { remoteAddress?: string }).remoteAddress
      ?? "";
    const ipHash = rawIp
      ? createHash("sha256").update(rawIp + "bde-analytics-salt").digest("hex").slice(0, 16)
      : null;

    await db.execute(sql`
      INSERT INTO website_visits (path, referrer, ip_hash)
      VALUES (${path.slice(0, 500)}, ${referrer ? referrer.slice(0, 500) : null}, ${ipHash})
    `);
  } catch (err) {
    console.error("[analytics] visit record failed:", err);
  }
  res.status(204).end(); // Always 204 — never surface errors to the website
});

// ─── Admin Endpoints ───────────────────────────────────────────────────────────

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

router.get("/admin/system-roles", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const roles = await db.select().from(rolesTable).where(eq(rolesTable.isSystemRole, true));
  res.json({ roles });
});

router.patch("/admin/tenants/:tenantId/users/:userId/role", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const tenantId = parseInt(req.params.tenantId as string, 10);
  const userId = req.params.userId;
  const { roleId } = req.body as { roleId: number | null };

  if (roleId !== null && roleId !== undefined) {
    const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, roleId)).limit(1);
    if (!role) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }
  }

  await db
    .update(userTenantsTable)
    .set({ roleId: roleId !== null && roleId !== undefined ? roleId : sql`NULL` })
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

  // ── Website visit stats ──
  let websiteVisits = { total: 0, today: 0, thisWeek: 0, thisMonth: 0, dailyLast14: [] as { date: string; count: number }[] };
  try {
    const visitTotalsResult = await db.execute(sql`
      SELECT
        COUNT(*)                                                      AS total,
        COUNT(*) FILTER (WHERE visited_at >= CURRENT_DATE)           AS today,
        COUNT(*) FILTER (WHERE visited_at >= DATE_TRUNC('week',  NOW())) AS this_week,
        COUNT(*) FILTER (WHERE visited_at >= DATE_TRUNC('month', NOW())) AS this_month
      FROM website_visits
    `);
    const vt = visitTotalsResult.rows[0] as { total: string; today: string; this_week: string; this_month: string } | undefined;
    if (vt) {
      websiteVisits.total     = Number(vt.total);
      websiteVisits.today     = Number(vt.today);
      websiteVisits.thisWeek  = Number(vt.this_week);
      websiteVisits.thisMonth = Number(vt.this_month);
    }
    const dailyResult = await db.execute(sql`
      SELECT TO_CHAR(DATE(visited_at), 'YYYY-MM-DD') AS visit_date, COUNT(*)::int AS visit_count
      FROM website_visits
      WHERE visited_at >= NOW() - INTERVAL '13 days'
      GROUP BY DATE(visited_at)
      ORDER BY visit_date ASC
    `);
    websiteVisits.dailyLast14 = (dailyResult.rows as { visit_date: string; visit_count: number }[]).map((r) => ({
      date: r.visit_date,
      count: Number(r.visit_count),
    }));
  } catch {
    // Table may not exist yet on first deploy — return zeros gracefully
  }

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
      websiteVisits,
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
      await tx.execute(sql`SET LOCAL ROLE app_readonly`);
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

router.get("/admin/folder-counts", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  if (!(await isImapConfigured())) {
    res.status(503).json({ error: "IMAP not configured (TITAN_IMAP_PASSWORD missing)" });
    return;
  }

  try {
    const counts = await getUnreadCounts(["INBOX", "Spam", "Trash"]);
    res.json({
      counts: {
        inbox: counts["INBOX"] ?? 0,
        spam: counts["Spam"] ?? 0,
        trash: counts["Trash"] ?? 0,
      },
    });
  } catch (err) {
    console.error("[IMAP] getUnreadCounts error:", err);
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

const MAX_ATTACHMENT_BYTES = 35 * 1024 * 1024; // hard cap; mail servers reject messages beyond ~25MB anyway

async function sendAttachment(req: Request, res: Response, folder: string): Promise<void> {
  const uidRaw = String(req.params.uid ?? "");
  const indexRaw = String(req.params.index ?? "");
  if (!/^\d{1,10}$/.test(uidRaw) || !/^\d{1,3}$/.test(indexRaw)) {
    res.status(400).json({ error: "Invalid UID or attachment index" });
    return;
  }
  const uid = parseInt(uidRaw, 10);
  const index = parseInt(indexRaw, 10);

  try {
    const att = await fetchAttachment(folder, uid, index);
    if (att.content.length > MAX_ATTACHMENT_BYTES) {
      res.status(413).json({ error: "Attachment is too large to download through the portal." });
      return;
    }
    const safeName = att.filename.replace(/[\r\n"\\]/g, "_");
    res.setHeader("Content-Type", att.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
    res.setHeader("Content-Length", String(att.content.length));
    res.send(att.content);
  } catch (err) {
    console.error(`[IMAP] fetchAttachment(${folder}, ${uid}, ${index}) error:`, err);
    const notFound = err instanceof Error && err.message === "Attachment not found";
    res.status(notFound ? 404 : 502).json({
      error: notFound ? "Attachment not found." : "Failed to fetch attachment. Check server logs for details.",
    });
  }
}

router.get("/admin/inbox/:uid/attachments/:index", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  await sendAttachment(req, res, "INBOX");
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

router.post("/admin/inbox/:uid/reply", requireAuth, upload.array("attachments"), async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const uid = parseInt(req.params.uid as string, 10);
  if (isNaN(uid)) { res.status(400).json({ error: "Invalid UID" }); return; }

  const { body, subject } = req.body;
  if (!body || typeof body !== "string" || body.trim().length === 0) {
    res.status(400).json({ error: "Reply body is required" });
    return;
  }

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const attachments = files.map((f) => ({
    filename: f.originalname,
    content: f.buffer,
    contentType: f.mimetype,
  }));

  try {
    const original = await fetchEmail(uid);
    const replyTo = original.replyTo || original.fromEmail;
    const replySubject = subject?.trim() || (original.subject.startsWith("Re:") ? original.subject : `Re: ${original.subject}`);

    const result = await sendAdminEmail({
      to: replyTo,
      toName: original.from !== original.fromEmail ? original.from : undefined,
      subject: replySubject,
      body: body.trim(),
      attachments: attachments.length > 0 ? attachments : undefined,
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
      await db.insert(adminEmailsSentTable).values({
        toAddress: replyTo,
        toName: original.from || null,
        subject: replySubject,
        body: body.trim(),
        status: "failed",
        errorMessage: result.reason ?? "Unknown error",
      });
      res.status(500).json({ sent: false, reason: result.reason });
    }
  } catch (err) {
    console.error("[IMAP] reply error:", err);
    res.status(502).json({ error: "Failed to send reply. Check server logs for details." });
  }
});

// ─── Email: Forward ──────────────────────────────────────────────────────────

router.post("/admin/inbox/:uid/forward", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const uid = parseInt(req.params.uid as string, 10);
  if (isNaN(uid)) { res.status(400).json({ error: "Invalid UID" }); return; }

  const { to, body, subject } = req.body;
  if (!to || typeof to !== "string" || !to.trim()) {
    res.status(400).json({ error: "Forward recipient (to) is required" });
    return;
  }
  if (!body || typeof body !== "string" || body.trim().length === 0) {
    res.status(400).json({ error: "Forward body is required" });
    return;
  }

  try {
    const original = await fetchEmail(uid);
    const fwdSubject = subject?.trim() || (original.subject.startsWith("Fwd:") ? original.subject : `Fwd: ${original.subject}`);

    const result = await sendAdminEmail({
      to: to.trim(),
      subject: fwdSubject,
      body: body.trim(),
    });

    if (result.sent) {
      await db.insert(adminEmailsSentTable).values({
        toAddress: to.trim(),
        toName: null,
        subject: fwdSubject,
        body: body.trim(),
        status: "sent",
      });
      res.json({ sent: true });
    } else {
      res.status(500).json({ sent: false, reason: result.reason });
    }
  } catch (err) {
    console.error("[IMAP] forward error:", err);
    res.status(502).json({ error: "Failed to forward email. Check server logs for details." });
  }
});

// ─── Email: Folder Access (Spam / Trash) ─────────────────────────────────────

router.get("/admin/mailboxes", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  if (!(await isImapConfigured())) {
    res.status(503).json({ error: "IMAP not configured" });
    return;
  }
  try {
    const mailboxes = await listMailboxes();
    res.json({ mailboxes });
  } catch (err) {
    console.error("[IMAP] listMailboxes error:", err);
    res.status(502).json({ error: "Unable to list mailboxes." });
  }
});

router.get("/admin/folder/:folder", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  if (!(await isImapConfigured())) {
    res.status(503).json({ error: "IMAP not configured (TITAN_IMAP_PASSWORD missing)" });
    return;
  }
  const folder = decodeURIComponent(req.params.folder as string);
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? "50"), 10) || 50, 200);
    const emails = await fetchFolder(folder, limit);
    res.json({ emails });
  } catch (err) {
    console.error(`[IMAP] fetchFolder(${folder}) error:`, err);
    res.status(502).json({ error: `Unable to open folder "${folder}". It may not exist on this mail server.` });
  }
});

router.get("/admin/folder/:folder/:uid", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const folder = decodeURIComponent(req.params.folder as string);
  const uid = parseInt(req.params.uid as string, 10);
  if (isNaN(uid)) { res.status(400).json({ error: "Invalid UID" }); return; }
  try {
    const email = await fetchEmailFromFolder(folder, uid);
    await markFolderEmailRead(folder, uid);
    res.json({ email });
  } catch (err) {
    console.error(`[IMAP] fetchEmailFromFolder(${folder}, ${uid}) error:`, err);
    res.status(502).json({ error: "Failed to fetch email." });
  }
});

router.get("/admin/folder/:folder/:uid/attachments/:index", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const folder = decodeURIComponent(req.params.folder as string);
  await sendAttachment(req, res, folder);
});

router.patch("/admin/folder/:folder/:uid/read", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const folder = decodeURIComponent(req.params.folder as string);
  const uid = parseInt(req.params.uid as string, 10);
  if (isNaN(uid)) { res.status(400).json({ error: "Invalid UID" }); return; }
  try {
    await markFolderEmailRead(folder, uid);
    res.json({ ok: true });
  } catch (err) {
    console.error(`[IMAP] markFolderEmailRead(${folder}, ${uid}) error:`, err);
    res.status(502).json({ error: "Failed to update email status." });
  }
});

router.delete("/admin/folder/:folder/:uid", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const folder = decodeURIComponent(req.params.folder as string);
  const uid = parseInt(req.params.uid as string, 10);
  if (isNaN(uid)) { res.status(400).json({ error: "Invalid UID" }); return; }
  try {
    await permanentlyDeleteFromFolder(folder, uid);
    void writeAuditLog(req.userId!, "email_delete_folder", { folder, uid });
    res.json({ deleted: true });
  } catch (err) {
    console.error(`[IMAP] permanentlyDeleteFromFolder(${folder}, ${uid}) error:`, err);
    res.status(502).json({ error: "Failed to delete email." });
  }
});

router.post("/admin/folder/:folder/:uid/restore", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const folder = decodeURIComponent(req.params.folder as string);
  const uid = parseInt(req.params.uid as string, 10);
  if (isNaN(uid)) { res.status(400).json({ error: "Invalid UID" }); return; }
  try {
    await moveToInbox(folder, uid);
    void writeAuditLog(req.userId!, "email_restore_to_inbox", { folder, uid });
    res.json({ restored: true });
  } catch (err) {
    console.error(`[IMAP] moveToInbox(${folder}, ${uid}) error:`, err);
    res.status(502).json({ error: "Failed to restore email to inbox." });
  }
});

// ─── Email: SMTP Diagnostic ──────────────────────────────────────────────────

router.get("/admin/emails/config", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  res.json({
    smtpHost: process.env.SMTP_HOST ?? "smtp-relay.brevo.com (default)",
    smtpPort: process.env.SMTP_PORT ?? "587 (default)",
    smtpUser: process.env.SMTP_USER ?? "a558bc001@smtp-brevo.com (hardcoded fallback)",
    smtpPassSet: !!process.env.SMTP_PASS,
    smtpFrom: process.env.SMTP_FROM ?? "noreply@bdefarmtrac.co.uk (default)",
  });
});

router.post("/admin/emails/test", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const { to } = req.body;
  if (!to || typeof to !== "string" || !to.includes("@")) {
    res.status(400).json({ error: "Valid 'to' email address is required" });
    return;
  }
  const result = await sendAdminEmail({
    to: to.trim(),
    subject: "BDE Farm Trac — SMTP Test",
    body: `<p>This is a diagnostic test email sent at ${new Date().toISOString()}.</p><p>If you received this, outbound SMTP is working correctly.</p>`,
  });
  res.status(result.sent ? 200 : 500).json(result);
});

// ─── Email: Compose & Send ────────────────────────────────────────────────────

router.post("/admin/emails/send", requireAuth, upload.array("attachments"), async (req: Request, res: Response): Promise<void> => {
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

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const attachments = files.map((f) => ({
    filename: f.originalname,
    content: f.buffer,
    contentType: f.mimetype,
  }));

  const result = await sendAdminEmail({
    to: to.trim(),
    toName: toName?.trim() || undefined,
    subject: subject.trim(),
    body: body.trim(),
    attachments: attachments.length > 0 ? attachments : undefined,
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
  const { status, paymentMethod, paymentReference, notes, paidAt, sentAt, sentMethod } = req.body;
  const updates: Partial<typeof invoicesTable.$inferInsert> = {};
  if (status !== undefined) updates.status = status;
  if (paymentMethod !== undefined) updates.paymentMethod = paymentMethod;
  if (paymentReference !== undefined) updates.paymentReference = paymentReference;
  if (notes !== undefined) updates.notes = notes;
  if (paidAt !== undefined) updates.paidAt = paidAt ? new Date(paidAt) : null;
  if (sentAt !== undefined) updates.sentAt = sentAt ? new Date(sentAt) : null;
  if (sentMethod !== undefined) updates.sentMethod = sentMethod;
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

// ─── Invoice Email Helpers ────────────────────────────────────────────────────

type InvoiceRow = typeof invoicesTable.$inferSelect;
type LineItem = { description: string; quantity: number; unitPricePence: number; netPence: number };

function generateInvoiceEmailHtml(invoice: InvoiceRow, company: Record<string, string>): string {
  const legalName = company["company.legalName"] || "Barnett Davies Enterprises Ltd";
  const tradingName = company["company.tradingName"] || "BDE Farm Trac";
  const companyEmail = company["company.email"] || "";
  const vatNumber = company["company.vatNumber"] || "";
  const registrationNumber = company["company.registrationNumber"] || "";
  const bankName = company["company.bankName"] || "";
  const bankSortCode = company["company.bankSortCode"] || "";
  const bankAccountNumber = company["company.bankAccountNumber"] || "";
  const bankAccountName = company["company.bankAccountName"] || "";

  const firstName = invoice.billingName.split(" ")[0] || invoice.billingName;
  const items = (invoice.lineItems as LineItem[]) || [];

  const fmtGBP = (pence: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);
  const fmtDt = (d: Date | string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  const lineRows = items.map((item, i) => `
    <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f9fafb"};">
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111827;">${item.description}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;text-align:center;color:#374151;width:50px;">${item.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;text-align:right;color:#374151;width:90px;">${fmtGBP(item.unitPricePence)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;text-align:right;font-weight:600;color:#111827;width:90px;">${fmtGBP(item.netPence)}</td>
    </tr>
  `).join("");

  const bankBlock = bankName ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;margin:24px 0 16px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 10px;font-size:12px;font-weight:bold;color:#14532d;text-transform:uppercase;letter-spacing:0.05em;">Payment by BACS Bank Transfer</p>
        ${bankName ? `<p style="margin:2px 0;font-size:12px;color:#374151;"><strong>Bank:</strong> ${bankName}</p>` : ""}
        ${bankAccountName ? `<p style="margin:2px 0;font-size:12px;color:#374151;"><strong>Account Name:</strong> ${bankAccountName}</p>` : ""}
        ${bankSortCode ? `<p style="margin:2px 0;font-size:12px;color:#374151;"><strong>Sort Code:</strong> ${bankSortCode}</p>` : ""}
        ${bankAccountNumber ? `<p style="margin:2px 0;font-size:12px;color:#374151;"><strong>Account Number:</strong> ${bankAccountNumber}</p>` : ""}
        <p style="margin:10px 0 0;font-size:12px;font-weight:600;color:#14532d;">Payment Reference: ${invoice.invoiceNumber}</p>
      </td></tr>
    </table>
  ` : "";

  const notesBlock = invoice.notes ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fef3c7;border-radius:6px;margin:16px 0;">
      <tr><td style="padding:12px 16px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#92400e;">Notes</p>
        <p style="margin:0;font-size:12px;color:#374151;white-space:pre-wrap;">${invoice.notes}</p>
      </td></tr>
    </table>
  ` : "";

  return `
    <p>Hi ${firstName},</p>
    <p>Please find your invoice from <strong>${legalName}</strong> for the period <strong>${fmtDt(invoice.billingPeriodStart)} to ${fmtDt(invoice.billingPeriodEnd)}</strong>.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#14532d;border-radius:8px;margin:24px 0;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#a7d9b8;text-transform:uppercase;letter-spacing:0.05em;">Invoice ${invoice.invoiceNumber}</p>
        <p style="margin:0;font-size:28px;font-weight:bold;color:#ffffff;">${fmtGBP(invoice.grossAmountPence)}</p>
        <p style="margin:6px 0 0;font-size:12px;color:#d1fae5;">Due by ${fmtDt(invoice.dueDate)}</p>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin:16px 0;">
      <thead>
        <tr style="background:#374151;">
          <th style="padding:9px 12px;font-size:11px;font-weight:600;color:#f9fafb;text-align:left;text-transform:uppercase;letter-spacing:0.05em;">Description</th>
          <th style="padding:9px 12px;font-size:11px;font-weight:600;color:#f9fafb;text-align:center;width:50px;">Qty</th>
          <th style="padding:9px 12px;font-size:11px;font-weight:600;color:#f9fafb;text-align:right;width:90px;">Unit Price</th>
          <th style="padding:9px 12px;font-size:11px;font-weight:600;color:#f9fafb;text-align:right;width:90px;">Net</th>
        </tr>
      </thead>
      <tbody>${lineRows}</tbody>
    </table>

    <table cellpadding="0" cellspacing="0" style="margin-left:auto;margin-right:0;min-width:260px;margin-bottom:8px;">
      <tr>
        <td style="padding:4px 16px 4px 0;font-size:12px;color:#6b7280;">Subtotal (Net)</td>
        <td style="padding:4px 0;font-size:12px;text-align:right;color:#374151;">${fmtGBP(invoice.netAmountPence)}</td>
      </tr>
      <tr>
        <td style="padding:4px 16px 4px 0;font-size:12px;color:#6b7280;">VAT (${invoice.vatRatePct}%)</td>
        <td style="padding:4px 0;font-size:12px;text-align:right;color:#374151;">${fmtGBP(invoice.vatAmountPence)}</td>
      </tr>
      <tr style="border-top:2px solid #e5e7eb;">
        <td style="padding:8px 16px 4px 0;font-size:14px;font-weight:bold;color:#111827;">Total Due (GBP)</td>
        <td style="padding:8px 0 4px;font-size:14px;font-weight:bold;text-align:right;color:#14532d;">${fmtGBP(invoice.grossAmountPence)}</td>
      </tr>
    </table>

    ${bankBlock}
    ${notesBlock}

    <p>${companyEmail ? `If you have any questions about this invoice, please reply to this email or contact us at <a href="mailto:${companyEmail}" style="color:#15803d;">${companyEmail}</a>.` : "If you have any questions about this invoice, please reply to this email."}</p>
    <p>Kind regards,<br><strong>The ${tradingName} Team</strong><br>
    <span style="font-size:11px;color:#9ca3af;">${legalName}${registrationNumber ? " · Company No. " + registrationNumber : ""}${vatNumber ? " · VAT No. " + vatNumber : ""}</span></p>
  `;
}

async function getCompanyConfig(): Promise<Record<string, string>> {
  const rows = await db.select().from(platformConfigTable);
  const out: Record<string, string> = {};
  for (const r of rows) if (r.value) out[r.key] = r.value;
  return out;
}

async function createInvoiceForTenant(
  tenantId: number,
  billingPeriodStart: string,
  billingPeriodEnd: string,
  vatRatePct: number,
  notes?: string
): Promise<typeof invoicesTable.$inferSelect> {
  const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, tenantId)).limit(1);
  if (!tenant) throw new Error("Tenant not found");

  const subs = await db
    .select({ moduleName: modulesTable.name, pricePence: modulesTable.monthlyPricePence, farmId: subscriptionsTable.farmId, farmName: farmsTable.name })
    .from(subscriptionsTable)
    .innerJoin(modulesTable, eq(subscriptionsTable.moduleId, modulesTable.id))
    .innerJoin(farmsTable, eq(subscriptionsTable.farmId, farmsTable.id))
    .where(and(eq(subscriptionsTable.tenantId, tenantId), eq(subscriptionsTable.status, "active")));

  const periodLabel = new Date(billingPeriodStart).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const lineItems: LineItem[] = [
    { description: `Platform base fee — ${periodLabel}`, quantity: 1, unitPricePence: BASE_FEE_PENCE, netPence: BASE_FEE_PENCE },
  ];
  for (const sub of subs) {
    lineItems.push({ description: `${sub.moduleName} — ${sub.farmName} (${periodLabel})`, quantity: 1, unitPricePence: sub.pricePence, netPence: sub.pricePence });
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
    billingPeriodStart: new Date(billingPeriodStart),
    billingPeriodEnd: new Date(billingPeriodEnd),
    invoiceDate,
    dueDate,
    billingName: tenant.name,
    billingAddress: (tenant as any).address ?? null,
    billingEmail: tenant.contactEmail,
    lineItems,
    netAmountPence,
    vatRatePct,
    vatAmountPence,
    grossAmountPence,
    notes: notes ?? null,
  }).returning();
  return invoice;
}

// ─── POST /admin/invoices/bulk-generate ───────────────────────────────────────

router.post("/admin/invoices/bulk-generate", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const { billingPeriodStart, billingPeriodEnd, vatRatePct = 20, notes } = req.body;
  if (!billingPeriodStart || !billingPeriodEnd) { res.status(400).json({ error: "billingPeriodStart and billingPeriodEnd required" }); return; }

  const allTenants = await db.select().from(tenantsTable).where(eq(tenantsTable.isActive, true));

  const generated: Array<{ tenantId: number; tenantName: string; invoiceNumber: string }> = [];
  const skipped: Array<{ tenantId: number; tenantName: string; reason: string }> = [];
  const errors: Array<{ tenantId: number; tenantName: string; error: string }> = [];

  for (const tenant of allTenants) {
    const existing = await db.select({ id: invoicesTable.id }).from(invoicesTable)
      .where(and(
        eq(invoicesTable.tenantId, tenant.id),
        eq(invoicesTable.billingPeriodStart, new Date(billingPeriodStart))
      )).limit(1);

    if (existing.length > 0) {
      skipped.push({ tenantId: tenant.id, tenantName: tenant.name, reason: "Invoice already exists for this period" });
      continue;
    }

    try {
      const invoice = await createInvoiceForTenant(tenant.id, billingPeriodStart, billingPeriodEnd, Number(vatRatePct), notes);
      generated.push({ tenantId: tenant.id, tenantName: tenant.name, invoiceNumber: invoice.invoiceNumber });
    } catch (err) {
      errors.push({ tenantId: tenant.id, tenantName: tenant.name, error: String(err) });
    }
  }

  res.json({ generated, skipped, errors });
});

// ─── POST /admin/invoices/bulk-email ─────────────────────────────────────────

router.post("/admin/invoices/bulk-email", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const { invoiceIds } = req.body as { invoiceIds: number[] };
  if (!invoiceIds?.length) { res.status(400).json({ error: "invoiceIds required" }); return; }

  const company = await getCompanyConfig();
  const tradingName = company["company.tradingName"] || "BDE Farm Trac";
  const fmtGBP = (p: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(p / 100);
  const fmtDt = (d: Date | string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const invList = await db.select().from(invoicesTable).where(inArray(invoicesTable.id, invoiceIds));

  const results: Array<{ invoiceId: number; invoiceNumber: string; billingName: string; sent: boolean; reason?: string }> = [];

  for (const inv of invList) {
    const emailBody = generateInvoiceEmailHtml(inv, company);
    const subject = `Invoice ${inv.invoiceNumber} from ${tradingName} — ${fmtGBP(inv.grossAmountPence)} due ${fmtDt(inv.dueDate)}`;
    const result = await sendAdminEmail({ to: inv.billingEmail, toName: inv.billingName, subject, body: emailBody });

    if (result.sent) {
      await db.update(invoicesTable).set({ status: "sent", sentAt: new Date(), sentMethod: "email" }).where(eq(invoicesTable.id, inv.id));
      await db.insert(adminEmailsSentTable).values({ toAddress: inv.billingEmail, toName: inv.billingName, subject, body: emailBody, status: "sent" });
    } else {
      await db.insert(adminEmailsSentTable).values({ toAddress: inv.billingEmail, toName: inv.billingName, subject, body: emailBody, status: "failed", errorMessage: result.reason ?? null });
    }

    results.push({ invoiceId: inv.id, invoiceNumber: inv.invoiceNumber, billingName: inv.billingName, sent: result.sent, reason: result.reason });
  }

  res.json({ results });
});

// ─── POST /admin/invoices/:id/email ──────────────────────────────────────────

router.post("/admin/invoices/:id/email", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const id = parseInt(req.params.id as string, 10);

  const [inv] = await db.select().from(invoicesTable).where(eq(invoicesTable.id, id)).limit(1);
  if (!inv) { res.status(404).json({ error: "Invoice not found" }); return; }

  const company = await getCompanyConfig();
  const tradingName = company["company.tradingName"] || "BDE Farm Trac";
  const fmtGBP = (p: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(p / 100);
  const fmtDt = (d: Date | string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const subject = `Invoice ${inv.invoiceNumber} from ${tradingName} — ${fmtGBP(inv.grossAmountPence)} due ${fmtDt(inv.dueDate)}`;
  const emailBody = generateInvoiceEmailHtml(inv, company);

  const result = await sendAdminEmail({ to: inv.billingEmail, toName: inv.billingName, subject, body: emailBody });

  if (result.sent) {
    const [updated] = await db.update(invoicesTable)
      .set({ status: "sent", sentAt: new Date(), sentMethod: "email" })
      .where(eq(invoicesTable.id, id)).returning();
    await db.insert(adminEmailsSentTable).values({ toAddress: inv.billingEmail, toName: inv.billingName, subject, body: emailBody, status: "sent" });
    res.json({ sent: true, invoice: updated });
  } else {
    await db.insert(adminEmailsSentTable).values({ toAddress: inv.billingEmail, toName: inv.billingName, subject, body: emailBody, status: "failed", errorMessage: result.reason ?? null });
    res.status(500).json({ sent: false, reason: result.reason });
  }
});

const PLATFORM_CONFIG_DEFAULTS: Record<string, { label: string; description: string; value: string }> = {
  nvz_tile_url: {
    label: "NVZ Map Tile URL",
    description: "ArcGIS tile template URL for the Environment Agency Nitrate Vulnerable Zone overlay. Use {z}, {y}, {x} placeholders. Change this here if the EA service path changes without redeploying the app.",
    value: "https://environment.data.gov.uk/arcgis/rest/services/EA/NVZ2017/MapServer/tile/{z}/{y}/{x}",
  },
  "company.legalName": {
    label: "Legal Business Name",
    description: "Registered company name shown on all platform invoices.",
    value: "Barnett Davies Enterprises Ltd",
  },
  "company.tradingName": {
    label: "Trading / Product Name",
    description: "Sub-label shown beneath the logo on invoices (e.g. the product name).",
    value: "BDE Farm Trac",
  },
  "company.address": {
    label: "Registered Address",
    description: "Full postal address printed on invoices.",
    value: "",
  },
  "company.email": {
    label: "Contact Email",
    description: "Email address shown on invoices for customer queries.",
    value: "hello@bdefarmtrac.co.uk",
  },
  "company.vatNumber": {
    label: "VAT Registration Number",
    description: "VAT number displayed on all VAT invoices.",
    value: "",
  },
  "company.registrationNumber": {
    label: "Companies House Number",
    description: "8-digit Companies House registration number for the invoice footer.",
    value: "",
  },
  "company.bankName": {
    label: "Bank Name",
    description: "Name of the bank for BACS payment details on invoices.",
    value: "",
  },
  "company.bankAccountName": {
    label: "Bank Account Name",
    description: "Account holder name for BACS payment details.",
    value: "",
  },
  "company.bankSortCode": {
    label: "Sort Code",
    description: "Bank sort code in 00-00-00 format.",
    value: "",
  },
  "company.bankAccountNumber": {
    label: "Account Number",
    description: "Bank account number for BACS payments.",
    value: "",
  },
  "company.paymentTermsDays": {
    label: "Payment Terms (Days)",
    description: "Default number of days from invoice date that payment is due.",
    value: "14",
  },
  "company.logoDataUrl": {
    label: "Invoice Logo (Data URL)",
    description: "Base64-encoded image shown top-left on printed invoices. Set via the Company & Billing settings page.",
    value: "",
  },
  "app.version": {
    label: "Application Version",
    description: "The platform version number displayed in the dashboard sidebar and mobile app (e.g. 1.4.17). Update together with Build Number.",
    value: "1.4.17",
  },
  "app.build": {
    label: "Application Build Number",
    description: "The build number appended after the version (e.g. 1245). Increment this on each deployment.",
    value: "1245",
  },
  "hpai.alert_active": {
    label: "HPAI National Alert Active",
    description: "Toggle to 'true' to display an Avian Influenza alert banner on all poultry farm dashboards. Set to 'false' when APHA restrictions are lifted.",
    value: "false",
  },
  "hpai.alert_level": {
    label: "HPAI Alert Level",
    description: "Severity of the national HPAI situation. Values: precautionary | regional | national",
    value: "",
  },
  "hpai.alert_message": {
    label: "HPAI Alert Message",
    description: "Message shown on poultry dashboards when the alert is active. Keep concise — it appears as a banner.",
    value: "",
  },
  "hpai.alert_date": {
    label: "HPAI Alert Date",
    description: "Date the current HPAI national alert was declared (ISO format: YYYY-MM-DD).",
    value: "",
  },
  "hpai.alert_counties": {
    label: "HPAI Alert Counties",
    description: "Comma-separated counties where this HPAI alert applies (e.g. Norfolk,Suffolk,Cambridgeshire). Leave blank to apply nationally to all poultry farms.",
    value: "",
  },
  "arable.alert_active": {
    label: "Arable / Crop Health Alert Active",
    description: "Toggle to 'true' to display a crop health alert banner on arable farm dashboards. Use for APHA phytosanitary notices, AHDB BYDV warnings, or national pest alerts.",
    value: "false",
  },
  "arable.alert_level": {
    label: "Arable Alert Level",
    description: "Severity of the arable/crop health alert. Values: precautionary | regional | national",
    value: "",
  },
  "arable.alert_message": {
    label: "Arable Alert Message",
    description: "Message shown on arable dashboards when the alert is active. Keep concise — it appears as a banner.",
    value: "",
  },
  "arable.alert_date": {
    label: "Arable Alert Date",
    description: "Date the current arable alert was declared (ISO format: YYYY-MM-DD).",
    value: "",
  },
  "arable.alert_counties": {
    label: "Arable Alert Counties",
    description: "Comma-separated counties where this arable alert applies. Leave blank to apply nationally.",
    value: "",
  },
  "horticulture.alert_active": {
    label: "Horticulture / Plant Health Alert Active",
    description: "Toggle to 'true' to display a plant health alert banner on horticulture farm dashboards. Use for APHA Xylella/Phytophthora alerts, Asian hornet notices, or quarantine pest warnings.",
    value: "false",
  },
  "horticulture.alert_level": {
    label: "Horticulture Alert Level",
    description: "Severity of the horticulture/plant health alert. Values: precautionary | regional | national",
    value: "",
  },
  "horticulture.alert_message": {
    label: "Horticulture Alert Message",
    description: "Message shown on horticulture dashboards when the alert is active. Keep concise — it appears as a banner.",
    value: "",
  },
  "horticulture.alert_date": {
    label: "Horticulture Alert Date",
    description: "Date the current horticulture/plant health alert was declared (ISO format: YYYY-MM-DD).",
    value: "",
  },
  "horticulture.alert_counties": {
    label: "Horticulture Alert Counties",
    description: "Comma-separated counties where this horticulture alert applies. Leave blank to apply nationally.",
    value: "",
  },
  "viticulture.alert_active": {
    label: "Viticulture / Vine Disease Alert Active",
    description: "Toggle to 'true' to display a vine disease alert banner on viticulture dashboards. Use for Xylella fastidiosa, Flavescence dorée, or vine moth statutory notices.",
    value: "false",
  },
  "viticulture.alert_level": {
    label: "Viticulture Alert Level",
    description: "Severity of the viticulture/vine disease alert. Values: precautionary | regional | national",
    value: "",
  },
  "viticulture.alert_message": {
    label: "Viticulture Alert Message",
    description: "Message shown on viticulture dashboards when the alert is active. Keep concise — it appears as a banner.",
    value: "",
  },
  "viticulture.alert_date": {
    label: "Viticulture Alert Date",
    description: "Date the current viticulture/vine disease alert was declared (ISO format: YYYY-MM-DD).",
    value: "",
  },
  "viticulture.alert_counties": {
    label: "Viticulture Alert Counties",
    description: "Comma-separated counties where this viticulture/vine alert applies. Leave blank to apply nationally.",
    value: "",
  },
  // ─── Beef / Cattle alerts ────────────────────────────────────────────────────
  "beef.alert_active": {
    label: "Beef / Cattle Alert — Active",
    description: "Toggle to 'true' to display a livestock disease alert banner on beef and cattle dashboards. Use for FMD, BVD, Schmallenberg, or APHA statutory notices affecting cattle.",
    value: "false",
  },
  "beef.alert_level": {
    label: "Beef / Cattle Alert — Level",
    description: "Severity of the beef/cattle disease alert. Values: precautionary | regional | national",
    value: "precautionary",
  },
  "beef.alert_message": {
    label: "Beef / Cattle Alert — Message",
    description: "Message shown on beef dashboards when the alert is active. Keep concise — it appears as a banner.",
    value: "",
  },
  "beef.alert_date": {
    label: "Beef / Cattle Alert — Date",
    description: "Date the current beef/cattle alert was declared (ISO format: YYYY-MM-DD).",
    value: "",
  },
  "beef.alert_counties": {
    label: "Beef / Cattle Alert — Counties",
    description: "Comma-separated counties where this beef/cattle alert applies. Leave blank to apply nationally.",
    value: "",
  },
  // ─── Dairy alerts ────────────────────────────────────────────────────────────
  "dairy.alert_active": {
    label: "Dairy Alert — Active",
    description: "Toggle to 'true' to display a livestock disease alert banner on dairy dashboards. Use for FMD, BVD, Johne's, or APHA statutory notices affecting dairy herds.",
    value: "false",
  },
  "dairy.alert_level": {
    label: "Dairy Alert — Level",
    description: "Severity of the dairy herd disease alert. Values: precautionary | regional | national",
    value: "precautionary",
  },
  "dairy.alert_message": {
    label: "Dairy Alert — Message",
    description: "Message shown on dairy dashboards when the alert is active. Keep concise — it appears as a banner.",
    value: "",
  },
  "dairy.alert_date": {
    label: "Dairy Alert — Date",
    description: "Date the current dairy alert was declared (ISO format: YYYY-MM-DD).",
    value: "",
  },
  "dairy.alert_counties": {
    label: "Dairy Alert — Counties",
    description: "Comma-separated counties where this dairy alert applies. Leave blank to apply nationally.",
    value: "",
  },
  // ─── Pig alerts ──────────────────────────────────────────────────────────────
  "pig.alert_active": {
    label: "Pig Alert — Active",
    description: "Toggle to 'true' to display a disease alert banner on pig dashboards. Use for ASF, PRRS, swine influenza, or APHA statutory notices affecting pigs.",
    value: "false",
  },
  "pig.alert_level": {
    label: "Pig Alert — Level",
    description: "Severity of the pig disease alert. Values: precautionary | regional | national",
    value: "precautionary",
  },
  "pig.alert_message": {
    label: "Pig Alert — Message",
    description: "Message shown on pig dashboards when the alert is active. Keep concise — it appears as a banner.",
    value: "",
  },
  "pig.alert_date": {
    label: "Pig Alert — Date",
    description: "Date the current pig alert was declared (ISO format: YYYY-MM-DD).",
    value: "",
  },
  "pig.alert_counties": {
    label: "Pig Alert — Counties",
    description: "Comma-separated counties where this pig alert applies. Leave blank to apply nationally.",
    value: "",
  },
  // ─── Sheep alerts ────────────────────────────────────────────────────────────
  "sheep.alert_active": {
    label: "Sheep Alert — Active",
    description: "Toggle to 'true' to display a disease alert banner on sheep dashboards. Use for Blue Tongue, FMD, Schmallenberg, Scrapie restriction zones, or APHA statutory notices.",
    value: "false",
  },
  "sheep.alert_level": {
    label: "Sheep Alert — Level",
    description: "Severity of the sheep disease alert. Values: precautionary | regional | national",
    value: "precautionary",
  },
  "sheep.alert_message": {
    label: "Sheep Alert — Message",
    description: "Message shown on sheep dashboards when the alert is active. Keep concise — it appears as a banner.",
    value: "",
  },
  "sheep.alert_date": {
    label: "Sheep Alert — Date",
    description: "Date the current sheep alert was declared (ISO format: YYYY-MM-DD).",
    value: "",
  },
  "sheep.alert_counties": {
    label: "Sheep Alert — Counties",
    description: "Comma-separated counties where this sheep alert applies. Leave blank to apply nationally.",
    value: "",
  },
  // ─── Goat alerts ─────────────────────────────────────────────────────────────
  "goat.alert_active": {
    label: "Goat Alert — Active",
    description: "Toggle to 'true' to display a disease alert banner on goat dashboards. Use for Blue Tongue, Schmallenberg, FMD, or APHA statutory notices affecting goats.",
    value: "false",
  },
  "goat.alert_level": {
    label: "Goat Alert — Level",
    description: "Severity of the goat disease alert. Values: precautionary | regional | national",
    value: "precautionary",
  },
  "goat.alert_message": {
    label: "Goat Alert — Message",
    description: "Message shown on goat dashboards when the alert is active. Keep concise — it appears as a banner.",
    value: "",
  },
  "goat.alert_date": {
    label: "Goat Alert — Date",
    description: "Date the current goat alert was declared (ISO format: YYYY-MM-DD).",
    value: "",
  },
  "goat.alert_counties": {
    label: "Goat Alert — Counties",
    description: "Comma-separated counties where this goat alert applies. Leave blank to apply nationally.",
    value: "",
  },
  "irrigation.costPerMmHa": {
    label: "Irrigation Cost per mm/ha (£)",
    description: "Default pump + abstraction cost (£) per mm applied per hectare, used as the platform-level fallback in the Irrigation Advisor. Farms can override this locally in the Advisor panel.",
    value: "3.50",
  },
  "irrigation.abstractionSource": {
    label: "Default Abstraction Source",
    description: "Default water abstraction source label shown in the Irrigation Advisor (e.g. Borehole, River, Reservoir). Can be overridden per farm.",
    value: "Borehole",
  },
  "brand.adLogoDataUrl": {
    label: "Ad Template — BDE Logo (Data URL)",
    description: "Base64-encoded BDE Farm Trac logo used in ad PDF templates. Upload a PNG or SVG via the Ad PDF Generator page. Falls back to extracting the logo from legacy on-disk template files if blank.",
    value: "",
  },
  "brand.adQrDataUrl": {
    label: "Ad Template — QR Code (Data URL)",
    description: "Base64-encoded QR code pointing to bdefarmtrac.co.uk used in ad PDF templates. Upload a PNG via the Ad PDF Generator page. Falls back to extracting the QR from legacy on-disk template files if blank.",
    value: "",
  },
  // ─── HMRC Alcohol Duty rates (August 2023 reform) ───────────────────────────
  // Update these here whenever HMRC revises rates — no redeployment needed.
  // Source: gov.uk/government/publications/alcohol-duty-rates
  "hmrc.duty.low_abv_rate_per_lpa": {
    label: "HMRC Duty — Low ABV Rate (£/LPA)",
    description: "Alcohol duty rate per litre of pure alcohol for still wine at 3.5–8.4% ABV (August 2023 reform). Update immediately when HMRC publishes a new rate. Current: £9.27/LPA.",
    value: "9.27",
  },
  "hmrc.duty.high_abv_rate_per_lpa": {
    label: "HMRC Duty — High ABV Rate (£/LPA)",
    description: "Alcohol duty rate per litre of pure alcohol for still wine at 8.5–22% ABV (August 2023 reform). Update immediately when HMRC publishes a new rate. Current: £28.50/LPA.",
    value: "28.50",
  },
  "hmrc.duty.abv_band_threshold_pct": {
    label: "HMRC Duty — ABV Band Threshold (%)",
    description: "ABV percentage at which the rate switches from the low band to the high band. Currently 8.5% under the August 2023 reform. Only change this if HMRC restructures the bands.",
    value: "8.5",
  },
  "hmrc.duty.spr_threshold_hl": {
    label: "HMRC Duty — SPR Threshold (hl/year)",
    description: "Annual production ceiling (in hectolitres) below which Small Producer Relief may be claimed. Currently 4,500 hl. Update if HMRC revises the eligibility threshold.",
    value: "4500",
  },
  "hmrc.duty.rates_last_reviewed": {
    label: "HMRC Duty — Rates Last Reviewed Date (YYYY-MM-DD)",
    description: "ISO date (YYYY-MM-DD) when the HMRC alcohol duty rates were last verified or updated. Shown to staff on the Excise Duty tab as a confidence signal. Update this whenever you review or change the rates — especially after each Budget.",
    value: "2023-08-01",
  },
};

router.get("/version", async (_req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(platformConfigTable);
  const byKey: Record<string, string> = {};
  for (const row of rows) byKey[row.key] = row.value;
  const version = byKey["app.version"] ?? PLATFORM_CONFIG_DEFAULTS["app.version"]?.value ?? "1.4.17";
  const build   = byKey["app.build"]   ?? PLATFORM_CONFIG_DEFAULTS["app.build"]?.value   ?? "1245";
  res.json({ version, build, full: `${version} Build ${build}` });
});

// County filter: empty list = national (show to all); farm with no county = fail-open (show alert)
function alertAppliesForCounty(alertCounties: string, farmCounty: string): boolean {
  const list = alertCounties.split(",").map(c => c.trim().toLowerCase()).filter(Boolean);
  if (list.length === 0) return true;
  if (!farmCounty.trim()) return true;
  return list.includes(farmCounty.trim().toLowerCase());
}

async function resolveFarmCounty(farmId: string | undefined): Promise<string> {
  if (!farmId) return "";
  const id = parseInt(farmId, 10);
  if (isNaN(id)) return "";
  const rows = await db.select({ country: farmsTable.country }).from(farmsTable).where(eq(farmsTable.id, id));
  return rows[0]?.country ?? "";
}

router.get("/hpai-alert", async (req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(platformConfigTable);
  const byKey: Record<string, string> = {};
  for (const row of rows) byKey[row.key] = row.value;
  const farmCounty = await resolveFarmCounty(req.query.farmId as string | undefined);
  const isActive = (byKey["hpai.alert_active"] ?? "false") === "true";
  const alertCounties = byKey["hpai.alert_counties"] ?? "";
  res.json({
    active: isActive && alertAppliesForCounty(alertCounties, farmCounty),
    level: byKey["hpai.alert_level"] ?? "",
    message: byKey["hpai.alert_message"] ?? "",
    date: byKey["hpai.alert_date"] ?? "",
    counties: alertCounties,
  });
});

router.get("/arable-alert", async (req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(platformConfigTable);
  const byKey: Record<string, string> = {};
  for (const row of rows) byKey[row.key] = row.value;
  const farmCounty = await resolveFarmCounty(req.query.farmId as string | undefined);
  const isActive = (byKey["arable.alert_active"] ?? "false") === "true";
  const alertCounties = byKey["arable.alert_counties"] ?? "";
  res.json({
    active: isActive && alertAppliesForCounty(alertCounties, farmCounty),
    level: byKey["arable.alert_level"] ?? "",
    message: byKey["arable.alert_message"] ?? "",
    date: byKey["arable.alert_date"] ?? "",
    counties: alertCounties,
  });
});

router.get("/horticulture-alert", async (req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(platformConfigTable);
  const byKey: Record<string, string> = {};
  for (const row of rows) byKey[row.key] = row.value;
  const farmCounty = await resolveFarmCounty(req.query.farmId as string | undefined);
  const isActive = (byKey["horticulture.alert_active"] ?? "false") === "true";
  const alertCounties = byKey["horticulture.alert_counties"] ?? "";
  res.json({
    active: isActive && alertAppliesForCounty(alertCounties, farmCounty),
    level: byKey["horticulture.alert_level"] ?? "",
    message: byKey["horticulture.alert_message"] ?? "",
    date: byKey["horticulture.alert_date"] ?? "",
    counties: alertCounties,
  });
});

router.get("/viticulture-alert", async (req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(platformConfigTable);
  const byKey: Record<string, string> = {};
  for (const row of rows) byKey[row.key] = row.value;
  const farmCounty = await resolveFarmCounty(req.query.farmId as string | undefined);
  const isActive = (byKey["viticulture.alert_active"] ?? "false") === "true";
  const alertCounties = byKey["viticulture.alert_counties"] ?? "";
  res.json({
    active: isActive && alertAppliesForCounty(alertCounties, farmCounty),
    level: byKey["viticulture.alert_level"] ?? "",
    message: byKey["viticulture.alert_message"] ?? "",
    date: byKey["viticulture.alert_date"] ?? "",
    counties: alertCounties,
  });
});

router.get("/beef-alert", async (req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(platformConfigTable);
  const byKey: Record<string, string> = {};
  for (const row of rows) byKey[row.key] = row.value;
  const farmCounty = await resolveFarmCounty(req.query.farmId as string | undefined);
  const isActive = (byKey["beef.alert_active"] ?? "false") === "true";
  const alertCounties = byKey["beef.alert_counties"] ?? "";
  res.json({
    active: isActive && alertAppliesForCounty(alertCounties, farmCounty),
    level: byKey["beef.alert_level"] ?? "",
    message: byKey["beef.alert_message"] ?? "",
    date: byKey["beef.alert_date"] ?? "",
    counties: alertCounties,
  });
});

router.get("/dairy-alert", async (req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(platformConfigTable);
  const byKey: Record<string, string> = {};
  for (const row of rows) byKey[row.key] = row.value;
  const farmCounty = await resolveFarmCounty(req.query.farmId as string | undefined);
  const isActive = (byKey["dairy.alert_active"] ?? "false") === "true";
  const alertCounties = byKey["dairy.alert_counties"] ?? "";
  res.json({
    active: isActive && alertAppliesForCounty(alertCounties, farmCounty),
    level: byKey["dairy.alert_level"] ?? "",
    message: byKey["dairy.alert_message"] ?? "",
    date: byKey["dairy.alert_date"] ?? "",
    counties: alertCounties,
  });
});

router.get("/pig-alert", async (req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(platformConfigTable);
  const byKey: Record<string, string> = {};
  for (const row of rows) byKey[row.key] = row.value;
  const farmCounty = await resolveFarmCounty(req.query.farmId as string | undefined);
  const isActive = (byKey["pig.alert_active"] ?? "false") === "true";
  const alertCounties = byKey["pig.alert_counties"] ?? "";
  res.json({
    active: isActive && alertAppliesForCounty(alertCounties, farmCounty),
    level: byKey["pig.alert_level"] ?? "",
    message: byKey["pig.alert_message"] ?? "",
    date: byKey["pig.alert_date"] ?? "",
    counties: alertCounties,
  });
});

router.get("/sheep-alert", async (req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(platformConfigTable);
  const byKey: Record<string, string> = {};
  for (const row of rows) byKey[row.key] = row.value;
  const farmCounty = await resolveFarmCounty(req.query.farmId as string | undefined);
  const isActive = (byKey["sheep.alert_active"] ?? "false") === "true";
  const alertCounties = byKey["sheep.alert_counties"] ?? "";
  res.json({
    active: isActive && alertAppliesForCounty(alertCounties, farmCounty),
    level: byKey["sheep.alert_level"] ?? "",
    message: byKey["sheep.alert_message"] ?? "",
    date: byKey["sheep.alert_date"] ?? "",
    counties: alertCounties,
  });
});

router.get("/goat-alert", async (req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(platformConfigTable);
  const byKey: Record<string, string> = {};
  for (const row of rows) byKey[row.key] = row.value;
  const farmCounty = await resolveFarmCounty(req.query.farmId as string | undefined);
  const isActive = (byKey["goat.alert_active"] ?? "false") === "true";
  const alertCounties = byKey["goat.alert_counties"] ?? "";
  res.json({
    active: isActive && alertAppliesForCounty(alertCounties, farmCounty),
    level: byKey["goat.alert_level"] ?? "",
    message: byKey["goat.alert_message"] ?? "",
    date: byKey["goat.alert_date"] ?? "",
    counties: alertCounties,
  });
});

router.get("/hmrc-duty-rates", async (_req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(platformConfigTable);
  const byKey: Record<string, string> = {};
  for (const row of rows) byKey[row.key] = row.value;
  const get = (key: string) => byKey[key] ?? PLATFORM_CONFIG_DEFAULTS[key]?.value ?? "";
  // ratesLastUpdated: explicit review-date config key, defaulting to "2023-08-01" (August 2023 reform)
  const reviewDate = get("hmrc.duty.rates_last_reviewed").trim();
  res.json({
    lowAbvRatePerLpa:    parseFloat(get("hmrc.duty.low_abv_rate_per_lpa"))   || 9.27,
    highAbvRatePerLpa:   parseFloat(get("hmrc.duty.high_abv_rate_per_lpa"))  || 28.50,
    abvBandThresholdPct: parseFloat(get("hmrc.duty.abv_band_threshold_pct")) || 8.5,
    sprThresholdHl:      parseFloat(get("hmrc.duty.spr_threshold_hl"))       || 4500,
    // ISO date string of when rates were last reviewed — always populated (defaults to Aug 2023 reform date)
    ratesLastUpdated: reviewDate || null,
    // Informational — effective date of the current rates (not editable via config)
    source: "HMRC Alcohol Duty (August 2023 reform) — gov.uk/government/publications/alcohol-duty-rates",
  });
});

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
  // Read existing value before overwriting (needed for audit trail)
  const existingRows = await db.select().from(platformConfigTable).where(eq(platformConfigTable.key, key));
  const oldValue = existingRows[0]?.value ?? null;
  const def = PLATFORM_CONFIG_DEFAULTS[key];
  await db.insert(platformConfigTable)
    .values({ key, value: value.trim(), label: def.label, description: def.description, updatedAt: new Date() })
    .onConflictDoUpdate({ target: platformConfigTable.key, set: { value: value.trim(), updatedAt: new Date() } });
  // Bust brand-asset cache so the next render picks up the new value immediately
  if (key === "brand.adLogoDataUrl" || key === "brand.adQrDataUrl") {
    _brandAssetCache = null;
  }
  // Audit sector alert config changes so we have a permanent history
  const SECTOR_PREFIXES: Record<string, string> = { "hpai.": "hpai", "arable.": "arable", "horticulture.": "horticulture", "viticulture.": "viticulture", "beef.": "beef", "dairy.": "dairy", "pig.": "pig", "sheep.": "sheep", "goat.": "goat" };
  const sectorEntry = Object.entries(SECTOR_PREFIXES).find(([p]) => key.startsWith(p));
  if (sectorEntry && req.userId) {
    await writeAuditLog(req.userId, "sector_alert_change", { sector: sectorEntry[1], key, oldValue, newValue: value.trim() });
  }
  res.json({ success: true, key, value: value.trim() });
});

router.delete("/admin/platform-config/:key", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const { key } = req.params as { key: string };
  if (!PLATFORM_CONFIG_DEFAULTS[key]) { res.status(400).json({ error: "Unknown config key" }); return; }
  // Read existing value before deleting (needed for audit trail)
  const existingRows = await db.select().from(platformConfigTable).where(eq(platformConfigTable.key, key));
  const oldValue = existingRows[0]?.value ?? null;
  await db.delete(platformConfigTable).where(eq(platformConfigTable.key, key));
  // Bust brand-asset cache so the next render re-fetches from the DB (or on-disk fallback)
  if (key === "brand.adLogoDataUrl" || key === "brand.adQrDataUrl") {
    _brandAssetCache = null;
  }
  // Audit sector alert config changes so we have a permanent history
  const SECTOR_PREFIXES_DEL: Record<string, string> = { "hpai.": "hpai", "arable.": "arable", "horticulture.": "horticulture", "viticulture.": "viticulture", "beef.": "beef", "dairy.": "dairy", "pig.": "pig", "sheep.": "sheep", "goat.": "goat" };
  const sectorEntryDel = Object.entries(SECTOR_PREFIXES_DEL).find(([p]) => key.startsWith(p));
  if (sectorEntryDel && req.userId) {
    await writeAuditLog(req.userId, "sector_alert_change", { sector: sectorEntryDel[1], key, oldValue, newValue: null });
  }
  res.json({ success: true });
});

// ─── HPAI Alert History (legacy — kept for backward compatibility) ─────────────
router.get("/admin/hpai-alert-history", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const rows = await db
    .select()
    .from(platformAuditLogTable)
    .where(inArray(platformAuditLogTable.action, ["hpai_config_change", "sector_alert_change"]))
    .orderBy(desc(platformAuditLogTable.createdAt))
    .limit(500);
  const filtered = rows.filter(r => {
    if (r.action === "hpai_config_change") return true;
    const m = r.metadata as { sector?: string } | null;
    return m?.sector === "hpai";
  });
  res.json({ entries: filtered });
});

// ─── Sector Alert History (all sectors) ──────────────────────────────────────
router.get("/admin/sector-alert-history", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const sectorFilter = req.query.sector as string | undefined;
  const rows = await db
    .select()
    .from(platformAuditLogTable)
    .where(inArray(platformAuditLogTable.action, ["sector_alert_change", "hpai_config_change"]))
    .orderBy(desc(platformAuditLogTable.createdAt))
    .limit(500);
  const filtered = sectorFilter
    ? rows.filter(r => {
        const m = r.metadata as { sector?: string } | null;
        if (r.action === "hpai_config_change") return sectorFilter === "hpai";
        return m?.sector === sectorFilter;
      })
    : rows;
  res.json({ entries: filtered });
});

// ─── Sector Alert Episodes ────────────────────────────────────────────────────

interface SectorAlertEpisodeRow {
  id: number;
  sector: string;
  level: string;
  message: string;
  counties: string;
  issued_at: string;
  issued_by: string;
  ended_at: string | null;
  ended_by: string | null;
  ended_reason: string | null;
  end_notified: boolean;
  created_at: string;
}

const VALID_EPISODE_SECTORS = new Set(["hpai","beef","dairy","sheep","goat","pig","arable","horticulture","viticulture"]);
const VALID_EPISODE_LEVELS  = new Set(["precautionary","regional","national"]);

router.get("/admin/sector-alert-episodes", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const sectorFilter = req.query.sector as string | undefined;
  const activeOnly   = req.query.active === "true";
  const rows = sectorFilter
    ? await db.execute(sql`SELECT id, sector, level, message, counties, issued_at, issued_by, ended_at, ended_by, ended_reason, end_notified, created_at FROM sector_alert_episodes WHERE sector = ${sectorFilter} ORDER BY issued_at DESC LIMIT 200`)
    : await db.execute(sql`SELECT id, sector, level, message, counties, issued_at, issued_by, ended_at, ended_by, ended_reason, end_notified, created_at FROM sector_alert_episodes ORDER BY issued_at DESC LIMIT 200`);
  let episodes = rows.rows as unknown as SectorAlertEpisodeRow[];
  if (activeOnly) episodes = episodes.filter(e => !e.ended_at);
  res.json({ episodes });
});

router.post("/admin/sector-alert-episodes", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const { sector, level, message, date, counties } = req.body as {
    sector?: string; level?: string; message?: string; date?: string; counties?: string;
  };
  if (!sector || !VALID_EPISODE_SECTORS.has(sector)) { res.status(400).json({ error: "Invalid sector" }); return; }
  if (!level  || !VALID_EPISODE_LEVELS.has(level))   { res.status(400).json({ error: "Invalid level" });  return; }

  // Close any existing open episode for this sector first (shouldn't normally happen, but guard)
  await db.execute(sql`
    UPDATE sector_alert_episodes
    SET ended_at = now(), ended_by = ${req.userId ?? "admin"}, ended_reason = 'Superseded by new alert'
    WHERE sector = ${sector} AND ended_at IS NULL
  `);

  // Create the new episode
  const inserted = await db.execute(sql`
    INSERT INTO sector_alert_episodes (sector, level, message, counties, issued_by)
    VALUES (${sector}, ${level}, ${message ?? ""}, ${counties ?? ""}, ${req.userId ?? "admin"})
    RETURNING id, sector, level, message, counties, issued_at, issued_by, ended_at, ended_by, ended_reason, end_notified, created_at
  `);
  const episode = inserted.rows[0] as unknown as SectorAlertEpisodeRow;

  // Mirror into platform config so the dashboard banner fires immediately
  const alertDate = date ?? new Date().toISOString().slice(0, 10);
  const configWrites: [string, string][] = [
    [`${sector}.alert_active`,   "true"],
    [`${sector}.alert_level`,    level],
    [`${sector}.alert_message`,  message ?? ""],
    [`${sector}.alert_date`,     alertDate],
    [`${sector}.alert_counties`, counties ?? ""],
  ];
  for (const [key, value] of configWrites) {
    const def = PLATFORM_CONFIG_DEFAULTS[key];
    if (!def) continue;
    const existing = await db.select().from(platformConfigTable).where(eq(platformConfigTable.key, key));
    const oldValue = existing[0]?.value ?? null;
    await db.insert(platformConfigTable)
      .values({ key, value, label: def.label, description: def.description, updatedAt: new Date() })
      .onConflictDoUpdate({ target: platformConfigTable.key, set: { value, updatedAt: new Date() } });
    if (req.userId) {
      await writeAuditLog(req.userId, "sector_alert_change", { sector, key, oldValue, newValue: value });
    }
  }
  res.status(201).json({ episode });
});

router.put("/admin/sector-alert-episodes/:id/end", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const episodeId = parseInt(req.params.id as string, 10);
  if (isNaN(episodeId)) { res.status(400).json({ error: "Invalid episode id" }); return; }
  const { endedReason } = req.body as { endedReason?: string };

  const existing = await db.execute(sql`SELECT * FROM sector_alert_episodes WHERE id = ${episodeId}`);
  const ep = existing.rows[0] as unknown as SectorAlertEpisodeRow | undefined;
  if (!ep)          { res.status(404).json({ error: "Episode not found" });    return; }
  if (ep.ended_at)  { res.status(400).json({ error: "Episode already ended" }); return; }

  const updated = await db.execute(sql`
    UPDATE sector_alert_episodes
    SET ended_at = now(), ended_by = ${req.userId ?? "admin"}, ended_reason = ${endedReason ?? null}
    WHERE id = ${episodeId}
    RETURNING id, sector, level, message, counties, issued_at, issued_by, ended_at, ended_by, ended_reason, end_notified, created_at
  `);
  const episode = updated.rows[0] as unknown as SectorAlertEpisodeRow;

  // Clear the platform config banner keys
  const configKeys = [
    `${ep.sector}.alert_active`, `${ep.sector}.alert_level`,
    `${ep.sector}.alert_message`, `${ep.sector}.alert_date`, `${ep.sector}.alert_counties`,
  ];
  for (const key of configKeys) {
    const existing2 = await db.select().from(platformConfigTable).where(eq(platformConfigTable.key, key));
    const oldValue = existing2[0]?.value ?? null;
    await db.delete(platformConfigTable).where(eq(platformConfigTable.key, key));
    if (req.userId && oldValue !== null) {
      await writeAuditLog(req.userId, "sector_alert_change", { sector: ep.sector, key, oldValue, newValue: null });
    }
  }
  res.json({ episode });
});

router.get("/admin/alert-subscriptions", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const rows = await db.select().from(platformConfigTable).where(eq(platformConfigTable.key, "alert.subscriptions"));
  let data: Record<string, { enrolled: boolean; date: string }> = {};
  if (rows[0]?.value) {
    try { data = JSON.parse(rows[0].value); } catch { data = {}; }
  }
  res.json({ subscriptions: data });
});

router.put("/admin/alert-subscriptions", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const { subscriptions } = req.body as { subscriptions: Record<string, { enrolled: boolean; date: string }> };
  if (!subscriptions || typeof subscriptions !== "object") { res.status(400).json({ error: "subscriptions must be an object" }); return; }
  const value = JSON.stringify(subscriptions);
  await db
    .insert(platformConfigTable)
    .values({ key: "alert.subscriptions", value, label: "Alert subscription enrolment records (JSON)", updatedAt: new Date() })
    .onConflictDoUpdate({ target: platformConfigTable.key, set: { value, updatedAt: new Date() } });
  void writeAuditLog(req.userId!, "alert_subscriptions_update", {
    enrolledCount: Object.values(subscriptions).filter(v => v.enrolled).length,
    totalCount: Object.keys(subscriptions).length,
  });
  res.json({ ok: true });
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

// ─── Farm data update (admin) ─────────────────────────────────────────────────

router.patch("/admin/tenants/:tenantId/farms/:farmId", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const tenantId = parseInt(req.params.tenantId as string, 10);
  const farmId = parseInt(req.params.farmId as string, 10);
  if (isNaN(tenantId) || isNaN(farmId)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [farm] = await db
    .select({ id: farmsTable.id })
    .from(farmsTable)
    .where(and(eq(farmsTable.id, farmId), eq(farmsTable.tenantId, tenantId)))
    .limit(1);

  if (!farm) { res.status(404).json({ error: "Farm not found for this tenant" }); return; }

  const { name, address, postcode } = req.body as { name?: string; address?: string | null; postcode?: string | null };
  const updates: Record<string, string | null> = {};
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) { res.status(400).json({ error: "Farm name cannot be empty" }); return; }
    updates.name = name.trim();
  }
  // Accept null (field cleared) or string (trimmed; empty string becomes null)
  if (address !== undefined) updates.address = typeof address === "string" ? address.trim() || null : null;
  if (postcode !== undefined) updates.postcode = typeof postcode === "string" ? postcode.trim() || null : null;

  if (Object.keys(updates).length === 0) { res.status(400).json({ error: "No fields to update" }); return; }

  const [updated] = await db
    .update(farmsTable)
    .set(updates)
    .where(and(eq(farmsTable.id, farmId), eq(farmsTable.tenantId, tenantId)))
    .returning({ id: farmsTable.id, name: farmsTable.name, address: farmsTable.address, postcode: farmsTable.postcode });

  if (!updated) { res.status(404).json({ error: "Farm not found" }); return; }

  await writeAuditLog(req.userId!, "admin_update_farm", { tenantId, farmId, updates }, tenantId, farmId);

  res.json({ farm: updated });
});
// ─── Module Management ────────────────────────────────────────────────────────

router.get("/admin/modules", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const modules = await db.select({
    id: modulesTable.id,
    key: modulesTable.key,
    name: modulesTable.name,
    monthlyPricePence: modulesTable.monthlyPricePence,
  }).from(modulesTable).where(eq(modulesTable.isActive, true)).orderBy(modulesTable.name);
  res.json({ modules });
});

router.post("/admin/tenants/:tenantId/farms/:farmId/subscriptions", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const tenantId = parseInt(req.params.tenantId as string, 10);
  const farmId = parseInt(req.params.farmId as string, 10);
  const { moduleId, status = "active", currentPeriodEnd } = req.body as { moduleId: number; status?: string; currentPeriodEnd?: string };

  if (!moduleId) { res.status(400).json({ error: "moduleId required" }); return; }

  const [farm] = await db.select().from(farmsTable)
    .where(and(eq(farmsTable.id, farmId), eq(farmsTable.tenantId, tenantId))).limit(1);
  if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }

  const existing = await db.select().from(subscriptionsTable)
    .where(and(
      eq(subscriptionsTable.farmId, farmId),
      eq(subscriptionsTable.tenantId, tenantId),
      eq(subscriptionsTable.moduleId, moduleId),
    )).limit(1);

  if (existing.length > 0 && (existing[0].status === "active" || existing[0].status === "trial")) {
    res.status(409).json({ error: "Module already active for this farm" });
    return;
  }

  const now = new Date();
  const periodEnd = currentPeriodEnd ? new Date(currentPeriodEnd) : (() => {
    const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d;
  })();

  let sub;
  if (existing.length > 0) {
    await db.update(subscriptionsTable).set({ status, currentPeriodStart: now, currentPeriodEnd: periodEnd })
      .where(eq(subscriptionsTable.id, existing[0].id));
    sub = { ...existing[0], status, currentPeriodStart: now, currentPeriodEnd: periodEnd };
  } else {
    const [inserted] = await db.insert(subscriptionsTable).values({
      tenantId, farmId, moduleId, status,
      currentPeriodStart: now, currentPeriodEnd: periodEnd,
    }).returning();
    sub = inserted;
  }

  await writeAuditLog(req.userId!, "add_module", { tenantId, farmId, moduleId, status }, tenantId, farmId);
  res.status(201).json({ subscription: sub });
});

router.delete("/admin/tenants/:tenantId/subscriptions/:subId", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const tenantId = parseInt(req.params.tenantId as string, 10);
  const subId = parseInt(req.params.subId as string, 10);

  const [sub] = await db.select().from(subscriptionsTable)
    .where(and(eq(subscriptionsTable.id, subId), eq(subscriptionsTable.tenantId, tenantId))).limit(1);
  if (!sub) { res.status(404).json({ error: "Subscription not found" }); return; }

  await db.update(subscriptionsTable).set({ status: "cancelled" }).where(eq(subscriptionsTable.id, subId));
  await writeAuditLog(req.userId!, "remove_module", { tenantId, subId, moduleId: sub.moduleId, farmId: sub.farmId }, tenantId, sub.farmId);
  res.json({ success: true });
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

// ─── Ad Template Library ──────────────────────────────────────────────────────

router.get("/admin/ad-templates", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const includeArchived = req.query.includeArchived === "1";
  const rows = includeArchived
    ? await db.select().from(adTemplatesTable).orderBy(asc(adTemplatesTable.id))
    : await db.select().from(adTemplatesTable)
        .where(isNull(adTemplatesTable.archivedAt))
        .orderBy(asc(adTemplatesTable.id));
  res.json(rows);
});

router.post("/admin/ad-templates", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const { name, slug, widthMm, heightMm, htmlBody, isDefault } = req.body as {
    name?: string; slug?: string; widthMm?: number; heightMm?: number;
    htmlBody?: string; isDefault?: boolean;
  };
  if (!name || !slug || !widthMm || !heightMm || !htmlBody) {
    res.status(400).json({ error: "name, slug, widthMm, heightMm and htmlBody are required" });
    return;
  }
  try {
    const [row] = await db.insert(adTemplatesTable).values({
      name, slug, widthMm: Number(widthMm), heightMm: Number(heightMm),
      htmlBody, isDefault: !!isDefault,
    }).returning();
    res.status(201).json(row);
  } catch (err: unknown) {
    const code = (err as { cause?: { code?: string } }).cause?.code;
    if (code === "23505") {
      res.status(409).json({ error: "An active template with that slug already exists. Archive the existing template first, or choose a different slug." });
    } else {
      console.error("[ad-templates/create]", err);
      res.status(500).json({ error: "Failed to create template" });
    }
  }
});

router.put("/admin/ad-templates/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const id = Number(req.params.id);
  const { name, slug, widthMm, heightMm, htmlBody, isDefault } = req.body as {
    name?: string; slug?: string; widthMm?: number; heightMm?: number;
    htmlBody?: string; isDefault?: boolean;
  };
  if (!name || !slug || !widthMm || !heightMm || !htmlBody) {
    res.status(400).json({ error: "name, slug, widthMm, heightMm and htmlBody are required" });
    return;
  }
  try {
    const [row] = await db.update(adTemplatesTable)
      .set({ name, slug, widthMm: Number(widthMm), heightMm: Number(heightMm),
             htmlBody, isDefault: !!isDefault, updatedAt: new Date() })
      .where(eq(adTemplatesTable.id, id))
      .returning();
    if (!row) { res.status(404).json({ error: "Template not found" }); return; }
    res.json(row);
  } catch (err: unknown) {
    const code = (err as { cause?: { code?: string } }).cause?.code;
    if (code === "23505") {
      res.status(409).json({ error: "An active template with that slug already exists. Archive the existing template first, or choose a different slug." });
    } else {
      console.error("[ad-templates/update]", err);
      res.status(500).json({ error: "Failed to update template" });
    }
  }
});

router.delete("/admin/ad-templates/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const id = Number(req.params.id);
  const [row] = await db.update(adTemplatesTable)
    .set({ archivedAt: new Date() })
    .where(eq(adTemplatesTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Template not found" }); return; }
  res.json({ success: true });
});

router.post("/admin/ad-templates/:id/restore", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const id = Number(req.params.id);
  try {
    const [row] = await db.update(adTemplatesTable)
      .set({ archivedAt: null })
      .where(eq(adTemplatesTable.id, id))
      .returning();
    if (!row) { res.status(404).json({ error: "Template not found" }); return; }
    res.json(row);
  } catch (err: unknown) {
    const code = (err as { cause?: { code?: string } }).cause?.code;
    if (code === "23505") {
      res.status(409).json({ error: "Another active template already uses that slug. Archive or rename it before restoring this one." });
    } else {
      console.error("[ad-templates/restore]", err);
      res.status(500).json({ error: "Failed to restore template" });
    }
  }
});

// ─── Ad Copy Presets ──────────────────────────────────────────────────────────

router.get("/admin/ad-copy-presets", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const rows = await db.select().from(adCopyPresetsTable).orderBy(asc(adCopyPresetsTable.name));
  res.json(rows);
});

router.post("/admin/ad-copy-presets", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const { name, headline, body, accentColor } = req.body as {
    name?: string; headline?: string; body?: string; accentColor?: string;
  };
  if (!name?.trim()) {
    res.status(400).json({ error: "name is required" });
    return;
  }
  try {
    const [row] = await db.insert(adCopyPresetsTable).values({
      name: name.trim(),
      headline: headline?.trim() ?? "",
      body: body?.trim() ?? "",
      accentColor: accentColor?.trim() ?? "",
    }).returning();
    res.status(201).json(row);
  } catch (err: unknown) {
    const pgCode = (err as { cause?: { code?: string } }).cause?.code;
    if (pgCode === "23505") {
      res.status(409).json({ error: `A preset called '${name.trim()}' already exists — choose a different name or delete the old one first` });
      return;
    }
    throw err;
  }
});

router.put("/admin/ad-copy-presets/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const id = Number(req.params.id);
  const { name, headline, body, accentColor } = req.body as {
    name?: string; headline?: string; body?: string; accentColor?: string;
  };
  if (!name?.trim()) {
    res.status(400).json({ error: "name is required" });
    return;
  }
  try {
    const [row] = await db.update(adCopyPresetsTable)
      .set({
        name: name.trim(),
        headline: headline?.trim() ?? "",
        body: body?.trim() ?? "",
        accentColor: accentColor?.trim() ?? "",
      })
      .where(eq(adCopyPresetsTable.id, id))
      .returning();
    if (!row) { res.status(404).json({ error: "Preset not found" }); return; }
    res.json(row);
  } catch (err: unknown) {
    const pgCode = (err as { cause?: { code?: string } }).cause?.code;
    if (pgCode === "23505") {
      res.status(409).json({ error: `A preset called '${name.trim()}' already exists — choose a different name or delete the old one first` });
      return;
    }
    throw err;
  }
});

router.delete("/admin/ad-copy-presets/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  const id = Number(req.params.id);
  const [row] = await db.delete(adCopyPresetsTable)
    .where(eq(adCopyPresetsTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Preset not found" }); return; }
  res.json({ success: true });
});

// ─── Ad brand-asset resolvability status ─────────────────────────────────────
// Returns whether logo and QR can be resolved from DB config or legacy on-disk
// fallback files, so the frontend can warn before a render produces a blank PDF.

router.get("/admin/ad-brand-assets/status", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;
  try {
    // Use the cache-free resolver so this probe does not re-prime _brandAssetCache.
    // If we called loadAdBrandAssets() here it would re-fill the cache after a DELETE,
    // causing the next PDF render to see the stale (pre-delete) value for up to 5 minutes.
    // resolveAdBrandAssets() performs the same DB + legacy on-disk fallback lookup as
    // loadAdBrandAssets() but never writes to _brandAssetCache.
    const { logoUri, qrUri } = await resolveAdBrandAssets();
    res.json({ logoResolvable: !!logoUri, qrResolvable: !!qrUri });
  } catch (err) {
    console.error("[ad-brand-assets/status]", err);
    res.json({ logoResolvable: false, qrResolvable: false });
  }
});

// ─── Ad PDF Generator — Node-native renderer ──────────────────────────────────

const AD_FONT_URLS: Array<[string, string, string, string]> = [
  ["Inter", "normal", "400", "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf"],
  ["Inter", "normal", "500", "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf"],
  ["Inter", "normal", "600", "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf"],
  ["Inter", "normal", "700", "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf"],
  ["Inter", "normal", "800", "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuDyYMZg.ttf"],
  ["Inter", "normal", "900", "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuBWYMZg.ttf"],
  ["Playfair Display", "normal", "700", "https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiukDQ.ttf"],
  ["Playfair Display", "italic",  "700", "https://fonts.gstatic.com/s/playfairdisplay/v40/nuFRD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_k-UbtY.ttf"],
];

const AD_DEFAULT_BG_URL =
  "https://images.pexels.com/photos/943700/pexels-photo-943700.jpeg?auto=compress&cs=tinysrgb&w=1920";

/** Download all Inter + Playfair Display weights and return a CSS @font-face block */
async function buildAdFontCss(): Promise<string> {
  const faces: string[] = [];
  for (const [family, style, weight, url] of AD_FONT_URLS) {
    const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!resp.ok) throw new Error(`Font fetch failed: ${url} (${resp.status})`);
    const buf = Buffer.from(await resp.arrayBuffer());
    const uri = `data:font/truetype;base64,${buf.toString("base64")}`;
    faces.push(
      `@font-face {\n  font-family: '${family}';\n  font-style: ${style};\n  font-weight: ${weight};\n  font-display: swap;\n  src: url('${uri}') format('truetype');\n}`,
    );
  }
  return faces.join("\n");
}

/**
 * Extract the first base64 data-URI src from an img tag.
 * When matchBy="alt" (default), matches on the alt attribute value.
 * When matchBy="class", matches on a CSS class name.
 */
function extractB64Src(html: string, value: string, matchBy: "alt" | "class" = "alt"): string {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let pattern: string;
  if (matchBy === "class") {
    pattern = `<img[^>]*class="[^"]*\\b${escaped}\\b[^"]*"[^>]*src="(data:[^"]+)"|<img[^>]*src="(data:[^"]+)"[^>]*class="[^"]*\\b${escaped}\\b[^"]*"`;
  } else {
    pattern = `<img[^>]*alt="${escaped}"[^>]*src="(data:[^"]+)"|<img[^>]*src="(data:[^"]+)"[^>]*alt="${escaped}"`;
  }
  const m = html.match(new RegExp(pattern));
  return m ? (m[1] ?? m[2] ?? "") : "";
}

/**
 * Read the BDE logo and QR code data-URIs from platform config, falling back
 * to scanning the legacy on-disk ad-templates/ HTML files when the DB rows are blank.
 *
 * This function performs the full resolution WITHOUT touching _brandAssetCache so it
 * can be called from the status endpoint (read-only probe) without side-effects on the
 * cache. loadAdBrandAssets() wraps it and applies the 5-minute cache layer.
 */
async function resolveAdBrandAssets(): Promise<{ logoUri: string; qrUri: string }> {
  // Prefer DB-stored values
  const rows = await db.select().from(platformConfigTable)
    .where(inArray(platformConfigTable.key, ["brand.adLogoDataUrl", "brand.adQrDataUrl"]));
  const byKey: Record<string, string> = {};
  for (const row of rows) byKey[row.key] = row.value;
  let logoUri = byKey["brand.adLogoDataUrl"] ?? "";
  let qrUri   = byKey["brand.adQrDataUrl"]   ?? "";

  // Fallback: scan legacy on-disk HTML files.
  // Try multiple candidate paths to handle all execution contexts:
  //   • pnpm script CWD = artifacts/api-server/
  //   • monorepo-root CWD (some deployment contexts)
  //   • __dirname = dist/ (production esbuild bundle)
  //   • __dirname = src/routes/ (dev tsx)
  if (!logoUri || !qrUri) {
    const candidates = [
      path.resolve(process.cwd(), "scripts/ad-templates"),
      path.resolve(process.cwd(), "artifacts/api-server/scripts/ad-templates"),
      path.resolve(__dirname, "../../scripts/ad-templates"),
      path.resolve(__dirname, "../../../scripts/ad-templates"),
    ];
    const srcDir = candidates.find((d) => fs.existsSync(d));
    if (srcDir) {
      const files = fs.readdirSync(srcDir).filter((f) => f.endsWith(".html"));
      for (const f of files) {
        const html = fs.readFileSync(path.join(srcDir, f), "utf-8");
        if (!logoUri) logoUri = extractB64Src(html, "logo", "class");
        if (!qrUri)   qrUri   = extractB64Src(html, "QR \u2014 bdefarmtrac.co.uk", "alt");
        if (logoUri && qrUri) break;
      }
    }
  }

  return { logoUri, qrUri };
}

// Simple in-memory cache so rapid successive renders reuse the already-fetched URIs
let _brandAssetCache: { logoUri: string; qrUri: string; cachedAt: number } | null = null;
const BRAND_ASSET_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Cached wrapper around resolveAdBrandAssets(). Use this for PDF renders.
 * Use resolveAdBrandAssets() directly for status/probe endpoints that must not
 * re-prime the cache (e.g. after a DELETE the status check should not re-fill
 * _brandAssetCache with stale data before the next render clears it).
 */
async function loadAdBrandAssets(): Promise<{ logoUri: string; qrUri: string }> {
  // Return cached result if still fresh
  if (_brandAssetCache && Date.now() - _brandAssetCache.cachedAt < BRAND_ASSET_CACHE_TTL_MS) {
    return { logoUri: _brandAssetCache.logoUri, qrUri: _brandAssetCache.qrUri };
  }

  const { logoUri, qrUri } = await resolveAdBrandAssets();
  _brandAssetCache = { logoUri, qrUri, cachedAt: Date.now() };
  return { logoUri, qrUri };
}

/**
 * Validate an external image URL before the server fetches it.
 * Blocks non-HTTPS schemes, private/reserved IP ranges, and non-image responses.
 * Returns the fetched buffer on success; throws a descriptive Error on any violation.
 */
const BG_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const BG_FETCH_TIMEOUT_MS = 10_000;     // 10 s

function isPrivateIp(addr: string): boolean {
  // IPv4 private/reserved ranges
  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(addr);
  if (v4) {
    const [, a, b] = v4.map(Number);
    if (
      a === 10 ||
      a === 127 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      (a === 0) ||
      (a === 100 && b >= 64 && b <= 127) || // RFC 6598 shared
      (a === 198 && (b === 18 || b === 19))  // RFC 2544
    ) return true;
    return false;
  }
  // IPv6: loopback, link-local, unique-local
  const lower = addr.toLowerCase().replace(/^\[/, "").replace(/\]$/, "");
  if (lower === "::1") return true;
  if (lower.startsWith("fe80:")) return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
  return false;
}

async function fetchExternalImage(rawUrl: string): Promise<Buffer> {
  let parsed: URL;
  try { parsed = new URL(rawUrl); } catch { throw new Error("Invalid background image URL."); }
  if (parsed.protocol !== "https:") throw new Error("Background image URL must use HTTPS.");

  // Resolve DNS and block private addresses (prevents SSRF to internal services)
  const hostname = parsed.hostname;
  let addresses: dns.LookupAddress[];
  try {
    addresses = await dns.promises.lookup(hostname, { all: true });
  } catch {
    throw new Error(`Cannot resolve background image host: ${hostname}`);
  }
  for (const { address } of addresses) {
    if (isPrivateIp(address)) {
      throw new Error("Background image URL resolves to a private or reserved address.");
    }
  }

  // Fetch with timeout and size cap
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BG_FETCH_TIMEOUT_MS);
  let resp: Response;
  try {
    resp = await fetch(rawUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "BDEFarmTracAdRenderer/1.0" },
      redirect: "follow",
    }) as unknown as Response;
  } catch (err: unknown) {
    throw new Error(`Background image fetch failed: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    clearTimeout(timer);
  }
  if (!(resp as unknown as { ok: boolean }).ok) {
    throw new Error(`Background image fetch failed (HTTP ${(resp as unknown as { status: number }).status}).`);
  }

  // Validate Content-Type is an image
  const ct = (resp as unknown as { headers: { get(k: string): string | null } }).headers.get("content-type") ?? "";
  if (!ct.startsWith("image/")) {
    throw new Error(`Background URL returned non-image content-type: ${ct || "(none)"}`);
  }

  // Enforce size limit
  const chunks: Uint8Array[] = [];
  let total = 0;
  const reader = (resp as unknown as { body: ReadableStream<Uint8Array> | null }).body;
  if (!reader) throw new Error("Background image response had no body.");
  for await (const chunk of reader as AsyncIterable<Uint8Array>) {
    total += chunk.length;
    if (total > BG_MAX_BYTES) throw new Error("Background image exceeds the 10 MB limit.");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Substitute {{font_css}}, {{logo}}, {{qr}}, {{bg}} in a template HTML body.
 * Logo and QR are resolved from DB config (with on-disk fallback).
 * Background image is downloaded from bgUrl (falls back to a default vineyard photo).
 */
// Horizontal defaults (landscape: width > height)
const AD_DEFAULT_HEADLINE_H = "Your vineyard.<br><em>Audit-ready.</em>";
const AD_DEFAULT_BODY_H     = "Vine register, phenology, harvest chemistry, spray logs, PDO&nbsp;/&nbsp;PGI records and excise duty — all in one place, accessible anywhere.";

// Portrait defaults (width ≤ height)
const AD_DEFAULT_HEADLINE_P = "Your<br>vineyard.<br><em>Audit-<br>ready.</em>";
const AD_DEFAULT_BODY_P     = "Vine register, phenology, harvest chemistry, spray logs, PDO&nbsp;/&nbsp;PGI records and excise duty — all in one place.";

const AD_DEFAULT_ACCENT     = "#C49A6C";

async function renderAdTemplate(
  htmlBody: string,
  bgUrl: string,
  opts?: { headline?: string; body?: string; accentColor?: string; widthMm?: number; heightMm?: number },
): Promise<string> {
  // Fonts
  const fontCss = await buildAdFontCss();

  // Logo + QR — from DB config, with on-disk fallback
  const { logoUri, qrUri } = await loadAdBrandAssets();

  // Background image — use SSRF-safe fetch for user-supplied URLs; default URL is internal/trusted
  const effectiveBgUrl = bgUrl.trim() || AD_DEFAULT_BG_URL;
  let bgBuf: Buffer;
  if (bgUrl.trim()) {
    // User-supplied: go through full SSRF validation
    bgBuf = await fetchExternalImage(effectiveBgUrl);
  } else {
    // Default URL (internal constant) — simple fetch, no SSRF risk
    const bgResp = await fetch(effectiveBgUrl);
    if (!bgResp.ok) throw new Error(`Background fetch failed (${bgResp.status})`);
    bgBuf = Buffer.from(await bgResp.arrayBuffer());
  }
  const bgUri = `data:image/jpeg;base64,${bgBuf.toString("base64")}`;

  // Select orientation-appropriate defaults: portrait when width ≤ height
  const isPortrait = (opts?.widthMm ?? 190) <= (opts?.heightMm ?? 133);
  const defaultHeadline = isPortrait ? AD_DEFAULT_HEADLINE_P : AD_DEFAULT_HEADLINE_H;
  const defaultBody     = isPortrait ? AD_DEFAULT_BODY_P     : AD_DEFAULT_BODY_H;

  const headline    = opts?.headline?.trim()    || defaultHeadline;
  const body        = opts?.body?.trim()        || defaultBody;
  const accentColor = opts?.accentColor?.trim() || AD_DEFAULT_ACCENT;

  // Substitute placeholders
  return htmlBody
    .replace(/\{\{font_css\}\}/g,    fontCss)
    .replace(/\{\{logo\}\}/g,        logoUri)
    .replace(/\{\{qr\}\}/g,          qrUri)
    .replace(/\{\{bg\}\}/g,          bgUri)
    .replace(/\{\{headline\}\}/g,    headline)
    .replace(/\{\{body\}\}/g,        body)
    .replace(/\{\{accent_color\}\}/g, accentColor);
}

router.post("/admin/ad-pdf/preview-draft", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const { htmlBody, bgUrl, widthMm, heightMm } = req.body as {
    htmlBody?: string; bgUrl?: string;
    widthMm?: number; heightMm?: number;
  };
  if (!htmlBody || typeof htmlBody !== "string" || !htmlBody.trim()) {
    res.status(400).json({ error: "htmlBody is required" });
    return;
  }

  // Guard: brand assets must be present before starting any render job
  const { logoUri: draftLogoUri, qrUri: draftQrUri } = await loadAdBrandAssets();
  const draftMissing = [...(!draftLogoUri ? ["logo"] : []), ...(!draftQrUri ? ["QR code"] : [])];
  if (draftMissing.length > 0) {
    res.status(422).json({
      error: `Cannot render PDF: the following brand asset(s) are missing — ${draftMissing.join(", ")}. Upload them via Platform Config before generating.`,
      missingAssets: draftMissing,
    });
    return;
  }

  const tmpId  = crypto.randomUUID();
  const tmpDir = path.join(os.tmpdir(), `ad-pdf-draft-${tmpId}`);
  const htmlOut = path.join(tmpDir, "print.html");
  const rgbPdf  = path.join(tmpDir, "rgb.pdf");
  const pngOut  = path.join(tmpDir, "preview.png");

  try {
    fs.mkdirSync(tmpDir, { recursive: true });

    const html = await renderAdTemplate(htmlBody, bgUrl ?? "", {
      widthMm: widthMm ?? 190, heightMm: heightMm ?? 133,
    });
    fs.writeFileSync(htmlOut, html, "utf-8");

    const wpCmd = `python3 -m weasyprint --encoding utf-8 '${htmlOut}' '${rgbPdf}'`;
    const gsCmd = [
      "gs -dBATCH -dNOPAUSE -dQUIET -sDEVICE=png16m",
      "-r150 -dFirstPage=1 -dLastPage=1",
      `-sOutputFile='${pngOut}' '${rgbPdf}'`,
    ].join(" ");
    execSync(
      `nix-shell -p python3Packages.weasyprint ghostscript --run "${wpCmd} && ${gsCmd}"`,
      { timeout: 180_000, stdio: "pipe" },
    );

    const pngBuffer = fs.readFileSync(pngOut);
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", pngBuffer.length);
    res.setHeader("Cache-Control", "no-store");
    res.send(pngBuffer);
  } catch (err: unknown) {
    console.error("[ad-pdf/preview-draft] Generation failed:", err);
    const msg    = err instanceof Error ? err.message : String(err);
    const stderr = (err as { stderr?: Buffer }).stderr;
    res.status(500).json({
      error: "Preview generation failed",
      detail: stderr ? stderr.toString().slice(-800) : msg.slice(0, 500),
    });
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
});

router.get("/admin/ad-pdf/preview", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const { templateId, bgUrl, headline, body, accentColor } = req.query as {
    templateId?: string; bgUrl?: string;
    headline?: string; body?: string; accentColor?: string;
  };
  if (!templateId || isNaN(Number(templateId))) {
    res.status(400).json({ error: "templateId (numeric) is required" });
    return;
  }

  const [template] = await db.select().from(adTemplatesTable)
    .where(eq(adTemplatesTable.id, Number(templateId))).limit(1);
  if (!template) { res.status(404).json({ error: "Template not found" }); return; }
  if (template.archivedAt) { res.status(410).json({ error: "Template has been archived and cannot be rendered." }); return; }

  // Guard: brand assets must be present before starting any render job
  const { logoUri: prevLogoUri, qrUri: prevQrUri } = await loadAdBrandAssets();
  const prevMissing = [...(!prevLogoUri ? ["logo"] : []), ...(!prevQrUri ? ["QR code"] : [])];
  if (prevMissing.length > 0) {
    res.status(422).json({
      error: `Cannot render PDF: the following brand asset(s) are missing — ${prevMissing.join(", ")}. Upload them via Platform Config before generating.`,
      missingAssets: prevMissing,
    });
    return;
  }

  // Snapshot the HTML body at request time — no mid-flight re-fetch during the render
  const snapshotHtmlBody = template.htmlBody;

  const tmpId  = crypto.randomUUID();
  const tmpDir = path.join(os.tmpdir(), `ad-pdf-prev-${tmpId}`);
  const htmlOut = path.join(tmpDir, "print.html");
  const rgbPdf  = path.join(tmpDir, "rgb.pdf");
  const pngOut  = path.join(tmpDir, "preview.png");

  try {
    fs.mkdirSync(tmpDir, { recursive: true });

    // Step 1: Render HTML via Node-native renderer (uses snapshot taken at request time)
    const html = await renderAdTemplate(snapshotHtmlBody, bgUrl ?? "", {
      headline, body, accentColor,
      widthMm: template.widthMm, heightMm: template.heightMm,
    });
    fs.writeFileSync(htmlOut, html, "utf-8");

    // Step 2: WeasyPrint (RGB PDF) + Ghostscript (PNG) — both via nix-shell
    const wpCmd = `python3 -m weasyprint --encoding utf-8 '${htmlOut}' '${rgbPdf}'`;
    const gsCmd = [
      "gs -dBATCH -dNOPAUSE -dQUIET -sDEVICE=png16m",
      "-r150 -dFirstPage=1 -dLastPage=1",
      `-sOutputFile='${pngOut}' '${rgbPdf}'`,
    ].join(" ");
    execSync(
      `nix-shell -p python3Packages.weasyprint ghostscript --run "${wpCmd} && ${gsCmd}"`,
      { timeout: 180_000, stdio: "pipe" },
    );

    // Step 3: Return PNG
    const pngBuffer = fs.readFileSync(pngOut);
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", pngBuffer.length);
    res.setHeader("Cache-Control", "no-store");
    res.send(pngBuffer);
  } catch (err: unknown) {
    console.error("[ad-pdf/preview] Generation failed:", err);
    const msg    = err instanceof Error ? err.message : String(err);
    const stderr = (err as { stderr?: Buffer }).stderr;
    res.status(500).json({
      error: "Preview generation failed",
      detail: stderr ? stderr.toString().slice(-800) : msg.slice(0, 500),
    });
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
});

router.post("/admin/ad-pdf", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdmin(req, res))) return;

  const { templateId, bgUrl, headline, body, accentColor } = req.body as {
    templateId?: number; bgUrl?: string;
    headline?: string; body?: string; accentColor?: string;
  };
  if (!templateId || isNaN(Number(templateId))) {
    res.status(400).json({ error: "templateId (numeric) is required" });
    return;
  }

  const [template] = await db.select().from(adTemplatesTable)
    .where(eq(adTemplatesTable.id, Number(templateId))).limit(1);
  if (!template) { res.status(404).json({ error: "Template not found" }); return; }
  if (template.archivedAt) { res.status(410).json({ error: "Template has been archived and cannot be rendered." }); return; }

  // Guard: brand assets must be present before starting any render job
  const { logoUri: pdfLogoUri, qrUri: pdfQrUri } = await loadAdBrandAssets();
  const pdfMissing = [...(!pdfLogoUri ? ["logo"] : []), ...(!pdfQrUri ? ["QR code"] : [])];
  if (pdfMissing.length > 0) {
    res.status(422).json({
      error: `Cannot render PDF: the following brand asset(s) are missing — ${pdfMissing.join(", ")}. Upload them via Platform Config before generating.`,
      missingAssets: pdfMissing,
    });
    return;
  }

  // Snapshot the HTML body immediately so a mid-flight archive cannot affect this render
  const snapshotHtmlBody = template.htmlBody;

  const tmpId   = crypto.randomUUID();
  const tmpDir  = path.join(os.tmpdir(), `ad-pdf-${tmpId}`);
  const htmlOut = path.join(tmpDir, "print.html");
  const rgbPdf  = path.join(tmpDir, "rgb.pdf");
  const cmykPdf = path.join(tmpDir, "cmyk.pdf");

  // Derive a safe filename from the template name
  const safeName = template.name.replace(/[^a-zA-Z0-9-]/g, "_").replace(/_+/g, "_").slice(0, 60);
  const filename = `BDE-FarmTrac-${safeName}-CMYK.pdf`;

  try {
    fs.mkdirSync(tmpDir, { recursive: true });

    // Step 1: Render HTML via Node-native renderer (uses snapshot taken before any async work)
    const html = await renderAdTemplate(snapshotHtmlBody, bgUrl ?? "", {
      headline, body, accentColor,
      widthMm: template.widthMm, heightMm: template.heightMm,
    });
    fs.writeFileSync(htmlOut, html, "utf-8");

    // Step 2: WeasyPrint (RGB PDF) + Ghostscript (CMYK PDF) — both via nix-shell
    const wpCmd = `python3 -m weasyprint --encoding utf-8 '${htmlOut}' '${rgbPdf}'`;
    const gsCmd = [
      "gs -dBATCH -dNOPAUSE -dQUIET -sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.3",
      "-sProcessColorModel=DeviceCMYK -sColorConversionStrategy=CMYK -dOverrideICC=true",
      `-sOutputFile='${cmykPdf}' '${rgbPdf}'`,
    ].join(" ");
    execSync(
      `nix-shell -p python3Packages.weasyprint ghostscript --run "${wpCmd} && ${gsCmd}"`,
      { timeout: 180_000, stdio: "pipe" },
    );

    // Step 3: Return PDF
    const pdfBuffer = fs.readFileSync(cmykPdf);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err: unknown) {
    console.error("[ad-pdf] Generation failed:", err);
    const msg    = err instanceof Error ? err.message : String(err);
    const stderr = (err as { stderr?: Buffer }).stderr;
    res.status(500).json({
      error: "PDF generation failed",
      detail: stderr ? stderr.toString().slice(-800) : msg.slice(0, 500),
    });
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
});

export default router;
