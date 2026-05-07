import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable, farmsTable, userTenantsTable, tenantsTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { requireAuth } from "../middlewares/roleMiddleware";

const router: IRouter = Router();

// GET /api/auth/user — lightweight user profile used by the mobile FarmContext
router.get("/auth/user", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;

  if (req.isBypassMode) {
    const [dbUser] = await db
      .select({ id: usersTable.id, email: usersTable.email, firstName: usersTable.firstName, lastName: usersTable.lastName })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    res.json({
      user: dbUser
        ? { id: dbUser.id, email: dbUser.email, firstName: dbUser.firstName, lastName: dbUser.lastName }
        : { id: userId, email: "dev@bde-farmtrac.com", firstName: "Dev", lastName: "User" },
    });
    return;
  }

  const [user] = await db
    .select({ id: usersTable.id, email: usersTable.email, firstName: usersTable.firstName, lastName: usersTable.lastName })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ user });
});

// GET /api/my-farms — returns all farms accessible to the authenticated mobile user
router.get("/my-farms", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;

  const memberships = await db
    .select({ tenantId: userTenantsTable.tenantId })
    .from(userTenantsTable)
    .where(eq(userTenantsTable.userId, userId));

  if (memberships.length === 0) {
    res.json({ farms: [] });
    return;
  }

  const tenantIds = memberships.map((m) => m.tenantId);

  const [farmRows, tenantRows] = await Promise.all([
    db
      .select({
        id: farmsTable.id,
        name: farmsTable.name,
        tenantId: farmsTable.tenantId,
        sectorArable: farmsTable.sectorArable,
        sectorBeef: farmsTable.sectorBeef,
        sectorDairy: farmsTable.sectorDairy,
        sectorPigs: farmsTable.sectorPigs,
        sectorPoultry: farmsTable.sectorPoultry,
      })
      .from(farmsTable)
      .where(inArray(farmsTable.tenantId, tenantIds)),
    db
      .select({ id: tenantsTable.id, slug: tenantsTable.slug })
      .from(tenantsTable)
      .where(inArray(tenantsTable.id, tenantIds)),
  ]);

  const slugMap = new Map(tenantRows.map((t) => [t.id, t.slug]));

  const farms = farmRows.map((f) => ({
    id: f.id,
    name: f.name,
    tenantSlug: slugMap.get(f.tenantId) ?? "",
    sectorArable: f.sectorArable ?? false,
    sectorBeef: f.sectorBeef ?? false,
    sectorDairy: f.sectorDairy ?? false,
    sectorPigs: f.sectorPigs ?? false,
    sectorPoultry: f.sectorPoultry ?? false,
  }));

  res.json({ farms });
});

export default router;
