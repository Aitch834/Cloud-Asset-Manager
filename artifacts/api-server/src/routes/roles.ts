import { Router, type IRouter, type Request, type Response } from "express";
import { db, rolesTable, permissionsTable, modulesTable } from "@workspace/db";
import { eq, and, or, isNull } from "drizzle-orm";
import { requireAuth, requireTenant, requireClientAdmin } from "../middlewares/roleMiddleware";

const router: IRouter = Router();

router.get("/roles", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const roles = await db
    .select()
    .from(rolesTable)
    .where(
      or(
        eq(rolesTable.isSystemRole, true),
        eq(rolesTable.tenantId, req.tenantId!)
      )
    );
  res.json({ roles });
});

router.post("/roles", requireAuth, requireTenant, requireClientAdmin, async (req: Request, res: Response): Promise<void> => {
  const { name, description } = req.body;

  if (!name) {
    res.status(400).json({ error: "Role name is required" });
    return;
  }

  const [role] = await db.insert(rolesTable).values({ name, description, isSystemRole: false, tenantId: req.tenantId! }).returning();
  res.status(201).json({ role });
});

router.get("/modules", requireAuth, async (_req: Request, res: Response): Promise<void> => {
  const modules = await db.select().from(modulesTable).where(eq(modulesTable.isActive, true));
  res.json({ modules });
});

router.get("/roles/:roleId/permissions", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const roleId = parseInt(req.params.roleId as string, 10);

  const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, roleId)).limit(1);
  if (!role) {
    res.status(404).json({ error: "Role not found" });
    return;
  }
  if (!role.isSystemRole && role.tenantId !== req.tenantId!) {
    res.status(403).json({ error: "Not authorized to view this role" });
    return;
  }

  const permissions = await db
    .select({
      id: permissionsTable.id,
      roleId: permissionsTable.roleId,
      moduleId: permissionsTable.moduleId,
      farmId: permissionsTable.farmId,
      moduleName: modulesTable.name,
      canRead: permissionsTable.canRead,
      canWrite: permissionsTable.canWrite,
      canDelete: permissionsTable.canDelete,
      canApprove: permissionsTable.canApprove,
    })
    .from(permissionsTable)
    .innerJoin(modulesTable, eq(permissionsTable.moduleId, modulesTable.id))
    .where(eq(permissionsTable.roleId, roleId));

  res.json({ permissions });
});

router.put("/roles/:roleId/permissions/:moduleId", requireAuth, requireTenant, requireClientAdmin, async (req: Request, res: Response): Promise<void> => {
  const roleId = parseInt(req.params.roleId as string, 10);
  const moduleId = parseInt(req.params.moduleId as string, 10);
  const { farmId, canRead, canWrite, canDelete, canApprove } = req.body;
  const farmIdValue = farmId ? parseInt(String(farmId), 10) : null;

  const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, roleId)).limit(1);
  if (!role) {
    res.status(404).json({ error: "Role not found" });
    return;
  }
  if (role.isSystemRole) {
    res.status(403).json({ error: "Cannot modify permissions on system roles" });
    return;
  }
  if (role.tenantId !== req.tenantId!) {
    res.status(403).json({ error: "Not authorized to modify this role" });
    return;
  }

  const whereClause = farmIdValue
    ? and(eq(permissionsTable.roleId, roleId), eq(permissionsTable.moduleId, moduleId), eq(permissionsTable.farmId, farmIdValue))
    : and(eq(permissionsTable.roleId, roleId), eq(permissionsTable.moduleId, moduleId), isNull(permissionsTable.farmId));

  const existing = await db
    .select()
    .from(permissionsTable)
    .where(whereClause)
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(permissionsTable)
      .set({ canRead, canWrite, canDelete, canApprove })
      .where(eq(permissionsTable.id, existing[0].id))
      .returning();
    res.json({ permission: updated });
  } else {
    const [created] = await db
      .insert(permissionsTable)
      .values({
        roleId,
        moduleId,
        farmId: farmIdValue,
        canRead: canRead ?? true,
        canWrite: canWrite ?? false,
        canDelete: canDelete ?? false,
        canApprove: canApprove ?? false,
      })
      .returning();
    res.status(201).json({ permission: created });
  }
});

export default router;
