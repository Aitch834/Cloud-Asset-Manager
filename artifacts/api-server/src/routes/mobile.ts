import { Router, type IRouter, type Request, type Response } from "express";
import { db, farmsTable, userTenantsTable, tenantsTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { requireAuth } from "../middlewares/roleMiddleware";

const router: IRouter = Router();

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
        sectorViticulture: farmsTable.sectorViticulture,
        cphNumber: farmsTable.cphNumber,
        sbiNumber: farmsTable.sbiNumber,
        redTractorId: farmsTable.redTractorId,
        wineGbMembershipNumber: farmsTable.winegbMembershipNumber,
        aphaRegistrationNumber: farmsTable.appaRef,
        fsaWineRegistrationNumber: farmsTable.fsaWineProductionRef,
        vineyardRegisterNumber: farmsTable.fsaVineRegisterRef,
        idleBarrelDays: farmsTable.idleBarrelDays,
        approachingNeutralFills: farmsTable.approachingNeutralFills,
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
    sectorViticulture: f.sectorViticulture ?? false,
    cphNumber: f.cphNumber,
    sbiNumber: f.sbiNumber,
    redTractorId: f.redTractorId,
    wineGbMembershipNumber: f.wineGbMembershipNumber,
    aphaRegistrationNumber: f.aphaRegistrationNumber,
    fsaWineRegistrationNumber: f.fsaWineRegistrationNumber,
    vineyardRegisterNumber: f.vineyardRegisterNumber,
    idleBarrelDays: f.idleBarrelDays ?? null,
    approachingNeutralFills: f.approachingNeutralFills ?? null,
  }));

  res.json({ farms });
});

export default router;
