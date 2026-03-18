import { Router, type IRouter, type Request, type Response } from "express";
import { db, tenantsTable, farmsTable, subscriptionsTable, modulesTable, userTenantsTable, usersTable, supportTicketsTable, supportTicketMessagesTable } from "@workspace/db";
import { eq, and, count, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/roleMiddleware";
import { generateSetupGuidePdf } from "../lib/setup-guide-pdf";
import { sendSetupGuideEmail } from "../lib/mailer";

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

  // TODO: Send email notification to ticket submitter with reply content
  console.log(`[EMAIL PLACEHOLDER] Reply notification queued for ticket #${ticketId}`);

  res.status(201).json({ message: reply });
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

export default router;
