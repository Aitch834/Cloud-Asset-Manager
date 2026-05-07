import { Router, type Request, type Response } from "express";
import { db, notificationsTable, expoPushTokensTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, requireTenant } from "../middlewares/roleMiddleware";

const router: Router = Router();

async function validateFarmAccess(req: Request, res: Response): Promise<number | null> {
  const farmId = parseInt(req.params.farmId as string, 10);
  if (isNaN(farmId)) { res.status(400).json({ error: "Invalid farm ID" }); return null; }
  return farmId;
}

router.get("/farms/:farmId/notifications", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;

  const records = await db
    .select()
    .from(notificationsTable)
    .where(and(
      eq(notificationsTable.farmId, farmId),
      eq(notificationsTable.tenantId, req.tenantId!),
    ))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);

  const unreadCount = records.filter(n => !n.isRead).length;
  res.json({ notifications: records, unreadCount });
});

router.put("/farms/:farmId/notifications/:id/read", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const notifId = parseInt(req.params.id as string, 10);
  if (isNaN(notifId)) { res.status(400).json({ error: "Invalid notification ID" }); return; }

  const [record] = await db
    .update(notificationsTable)
    .set({ isRead: true, readAt: new Date() })
    .where(and(
      eq(notificationsTable.id, notifId),
      eq(notificationsTable.farmId, farmId),
      eq(notificationsTable.tenantId, req.tenantId!),
    ))
    .returning();

  res.json({ notification: record });
});

router.put("/farms/:farmId/notifications/read-all", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;

  await db
    .update(notificationsTable)
    .set({ isRead: true, readAt: new Date() })
    .where(and(
      eq(notificationsTable.farmId, farmId),
      eq(notificationsTable.tenantId, req.tenantId!),
      eq(notificationsTable.isRead, false),
    ));

  res.json({ success: true });
});

router.delete("/farms/:farmId/notifications/:id", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const notifId = parseInt(req.params.id as string, 10);
  if (isNaN(notifId)) { res.status(400).json({ error: "Invalid notification ID" }); return; }

  await db
    .delete(notificationsTable)
    .where(and(
      eq(notificationsTable.id, notifId),
      eq(notificationsTable.farmId, farmId),
      eq(notificationsTable.tenantId, req.tenantId!),
    ));

  res.json({ success: true });
});

// ── Expo Push Token Registration ──

router.post("/farms/:farmId/push-tokens", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;

  const { expoPushToken, platform, deviceName } = req.body as { expoPushToken?: string; platform?: string; deviceName?: string };
  if (!expoPushToken || typeof expoPushToken !== "string") {
    res.status(400).json({ error: "expoPushToken is required" });
    return;
  }

  const userId = req.userId!;
  const existing = await db
    .select({ id: expoPushTokensTable.id })
    .from(expoPushTokensTable)
    .where(eq(expoPushTokensTable.expoPushToken, expoPushToken))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(expoPushTokensTable)
      .set({ isActive: true, lastSeenAt: new Date(), userId, farmId })
      .where(eq(expoPushTokensTable.expoPushToken, expoPushToken));
  } else {
    await db.insert(expoPushTokensTable).values({
      userId,
      farmId,
      expoPushToken,
      platform: platform ?? null,
      deviceName: deviceName ?? null,
      isActive: true,
    });
  }

  res.json({ success: true });
});

router.delete("/farms/:farmId/push-tokens/:token", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;

  const token = decodeURIComponent(req.params.token as string);
  await db
    .update(expoPushTokensTable)
    .set({ isActive: false })
    .where(and(
      eq(expoPushTokensTable.expoPushToken, token),
      eq(expoPushTokensTable.userId, req.userId!),
    ));

  res.json({ success: true });
});

export { router as notificationsRouter };
