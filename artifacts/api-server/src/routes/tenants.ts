import { Router, type IRouter, type Request, type Response } from "express";
import { db, tenantsTable, farmsTable, userTenantsTable, userInvitationsTable, rolesTable, staffFarmAssignmentsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireTenant, requireClientAdmin } from "../middlewares/roleMiddleware";
import crypto from "crypto";

const router: IRouter = Router();

router.get("/tenants/mine", requireAuth, async (req: Request, res: Response): Promise<void> => {
  // Dev bypass: return all tenants so the test dashboard can select any
  if (req.isBypassMode) {
    const allTenants = await db
      .select({ id: tenantsTable.id, name: tenantsTable.name, slug: tenantsTable.slug })
      .from(tenantsTable)
      .where(eq(tenantsTable.isActive, true));

    res.json({
      tenants: allTenants.map((t) => ({
        tenantId: t.id,
        roleId: null,
        isSuperAdmin: true,
        tenantName: t.name,
        tenantSlug: t.slug,
      })),
    });
    return;
  }

  const userTenantRows = await db
    .select({
      tenantId: userTenantsTable.tenantId,
      roleId: userTenantsTable.roleId,
      isSuperAdmin: userTenantsTable.isSuperAdmin,
      tenantName: tenantsTable.name,
      tenantSlug: tenantsTable.slug,
      isSandbox: tenantsTable.isSandbox,
      sandboxOfTenantId: tenantsTable.sandboxOfTenantId,
    })
    .from(userTenantsTable)
    .innerJoin(tenantsTable, eq(userTenantsTable.tenantId, tenantsTable.id))
    .where(and(eq(userTenantsTable.userId, req.userId!), eq(userTenantsTable.isActive, true)));

  res.json({ tenants: userTenantRows });
});

router.post("/tenants", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { name, slug, contactEmail, contactPhone, address } = req.body;

  if (!name || !slug || !contactEmail) {
    res.status(400).json({ error: "name, slug, and contactEmail are required" });
    return;
  }

  const existing = await db.select().from(tenantsTable).where(eq(tenantsTable.slug, slug)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Tenant slug already exists" });
    return;
  }

  const clientAdminRole = await db
    .select()
    .from(rolesTable)
    .where(and(eq(rolesTable.name, "Client Admin"), eq(rolesTable.isSystemRole, true)))
    .limit(1);
  let roleId: number;
  if (clientAdminRole.length === 0) {
    const [newRole] = await db.insert(rolesTable).values({ name: "Client Admin", description: "Full access to tenant management", isSystemRole: true }).returning();
    roleId = newRole.id;
  } else {
    roleId = clientAdminRole[0].id;
  }

  const [tenant] = await db.insert(tenantsTable).values({ name, slug, contactEmail, contactPhone, address }).returning();

  await db.insert(userTenantsTable).values({
    userId: req.userId!,
    tenantId: tenant.id,
    roleId,
    isSuperAdmin: false,
    receiveAlerts: true,
  });

  res.status(201).json({ tenant });
});

router.get("/tenants/current", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, req.tenantId!)).limit(1);
  res.json({ tenant });
});

router.put("/tenants/current", requireAuth, requireTenant, requireClientAdmin, async (req: Request, res: Response): Promise<void> => {
  const { name, contactEmail, contactPhone, address } = req.body;

  const [updated] = await db
    .update(tenantsTable)
    .set({ name, contactEmail, contactPhone, address })
    .where(eq(tenantsTable.id, req.tenantId!))
    .returning();

  res.json({ tenant: updated });
});

router.post("/tenants/current/farms", requireAuth, requireTenant, requireClientAdmin, async (req: Request, res: Response): Promise<void> => {
  const {
    name, address, postcode, cphNumber, gridReference, totalAcreage,
    sectorArable, sectorBeef, sectorSheep, sectorDairy, sectorPigs, sectorPoultry,
    sectorEggs, sectorGoats, sectorEquine, sectorHorticulture, sectorViticulture, sectorFreshProduce,
    sectorDeer, redTractorId,
  } = req.body;

  if (!name) {
    res.status(400).json({ error: "Farm name is required" });
    return;
  }

  const [farm] = await db.insert(farmsTable).values({
    tenantId: req.tenantId!,
    name,
    address,
    postcode,
    cphNumber,
    gridReference,
    totalAcreage,
    sectorArable: sectorArable ?? false,
    sectorBeef: sectorBeef ?? false,
    sectorSheep: sectorSheep ?? false,
    sectorDairy: sectorDairy ?? false,
    sectorPigs: sectorPigs ?? false,
    sectorPoultry: sectorPoultry ?? false,
    sectorEggs: sectorEggs ?? false,
    sectorGoats: sectorGoats ?? false,
    sectorEquine: sectorEquine ?? false,
    sectorHorticulture: sectorHorticulture ?? false,
    sectorViticulture: sectorViticulture ?? false,
    sectorFreshProduce: sectorFreshProduce ?? false,
    sectorDeer: sectorDeer ?? false,
    redTractorId: redTractorId || null,
  }).returning();

  res.status(201).json({ farm });
});

router.get("/tenants/current/farms", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farms = await db.select().from(farmsTable).where(and(eq(farmsTable.tenantId, req.tenantId!), eq(farmsTable.isActive, true)));
  res.json({ farms });
});

router.put("/tenants/current/farms/:farmId", requireAuth, requireTenant, requireClientAdmin, async (req: Request, res: Response): Promise<void> => {
  const farmId = parseInt(req.params.farmId as string, 10);

  // Only apply fields that were actually provided in the body. Setting
  // omitted fields to undefined would make Drizzle skip them anyway, but
  // being explicit here guarantees no sector flag (or other field) can be
  // silently reset when a caller sends a partial payload.
  const updatableFields = [
    "name", "address", "postcode", "cphNumber", "gridReference", "totalAcreage",
    "sectorArable", "sectorBeef", "sectorSheep", "sectorDairy", "sectorPigs", "sectorPoultry",
    "sectorEggs", "sectorGoats", "sectorEquine", "sectorHorticulture", "sectorViticulture",
    "sectorFreshProduce", "sectorDeer",
  ] as const;

  const updates: Record<string, unknown> = {};
  for (const field of updatableFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  if (req.body.redTractorId !== undefined) updates.redTractorId = req.body.redTractorId || null;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No updatable fields provided" });
    return;
  }

  const [updated] = await db
    .update(farmsTable)
    .set(updates)
    .where(and(eq(farmsTable.id, farmId), eq(farmsTable.tenantId, req.tenantId!)))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Farm not found" });
    return;
  }

  res.json({ farm: updated });
});

router.post("/tenants/current/invitations", requireAuth, requireTenant, requireClientAdmin, async (req: Request, res: Response): Promise<void> => {
  const { email, roleId } = req.body;

  if (!email || !roleId) {
    res.status(400).json({ error: "email and roleId are required" });
    return;
  }

  const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, roleId)).limit(1);
  if (!role) {
    res.status(400).json({ error: "Invalid role" });
    return;
  }
  if (!role.isSystemRole && role.tenantId !== req.tenantId!) {
    res.status(403).json({ error: "Role does not belong to this tenant" });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [invitation] = await db.insert(userInvitationsTable).values({
    tenantId: req.tenantId!,
    email,
    roleId,
    token,
    invitedBy: req.userId!,
    expiresAt,
  }).returning();

  res.status(201).json({ invitation });
});

router.get("/tenants/current/invitations", requireAuth, requireTenant, requireClientAdmin, async (req: Request, res: Response): Promise<void> => {
  const invitations = await db.select().from(userInvitationsTable).where(eq(userInvitationsTable.tenantId, req.tenantId!));
  res.json({ invitations });
});

router.post("/tenants/current/staff-assignments", requireAuth, requireTenant, requireClientAdmin, async (req: Request, res: Response): Promise<void> => {
  const { userId, farmId, roleId } = req.body;

  if (!userId || !farmId) {
    res.status(400).json({ error: "userId and farmId are required" });
    return;
  }

  const [farm] = await db
    .select()
    .from(farmsTable)
    .where(and(eq(farmsTable.id, farmId), eq(farmsTable.tenantId, req.tenantId!)))
    .limit(1);
  if (!farm) {
    res.status(400).json({ error: "Farm does not belong to this tenant" });
    return;
  }

  const [userMembership] = await db
    .select()
    .from(userTenantsTable)
    .where(and(eq(userTenantsTable.userId, userId), eq(userTenantsTable.tenantId, req.tenantId!), eq(userTenantsTable.isActive, true)))
    .limit(1);
  if (!userMembership) {
    res.status(400).json({ error: "User is not a member of this tenant" });
    return;
  }

  if (roleId) {
    const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, roleId)).limit(1);
    if (!role) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }
    if (!role.isSystemRole && role.tenantId !== req.tenantId!) {
      res.status(403).json({ error: "Role does not belong to this tenant" });
      return;
    }
  }

  const [assignment] = await db.insert(staffFarmAssignmentsTable).values({
    userId,
    farmId,
    tenantId: req.tenantId!,
    roleId: roleId ?? null,
  }).returning();

  res.status(201).json({ assignment });
});

router.get("/tenants/current/staff-assignments", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const assignments = await db
    .select()
    .from(staffFarmAssignmentsTable)
    .where(and(eq(staffFarmAssignmentsTable.tenantId, req.tenantId!), eq(staffFarmAssignmentsTable.isActive, true)));

  res.json({ assignments });
});

export default router;
