import { Router, type IRouter, type Request, type Response } from "express";
import { db, tenantsTable, farmsTable, subscriptionsTable, modulesTable, userTenantsTable, usersTable, supportTicketsTable, supportTicketMessagesTable } from "@workspace/db";
import { eq, and, count, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/roleMiddleware";

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

  res.json({
    stats: {
      totalTenants: tenantCount.count,
      totalFarms: farmCount.count,
      activeSubscriptions: activeSubCount.count,
      totalUsers: userCount.count,
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

export default router;
