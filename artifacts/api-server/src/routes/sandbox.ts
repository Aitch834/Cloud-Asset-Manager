import { Router, type IRouter, type Request, type Response } from "express";
import { db, tenantsTable, farmsTable, userTenantsTable } from "@workspace/db";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuth, requireTenant } from "../middlewares/roleMiddleware";
import pg from "pg";

const router: IRouter = Router();

const ADMIN_SECRET = process.env.ADMIN_PORTAL_SECRET ?? null;

function checkAdminSecret(req: Request, res: Response): boolean {
  const provided = req.headers["x-admin-secret"] as string | undefined;
  if (!ADMIN_SECRET || provided !== ADMIN_SECRET) {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }
  return true;
}

// GET /tenants/current/sandbox-info
// Returns sandbox status for the current tenant context.
router.get(
  "/tenants/current/sandbox-info",
  requireAuth,
  requireTenant,
  async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.tenantId!;

    const [tenant] = await db
      .select({
        id: tenantsTable.id,
        isSandbox: tenantsTable.isSandbox,
        sandboxOfTenantId: tenantsTable.sandboxOfTenantId,
      })
      .from(tenantsTable)
      .where(eq(tenantsTable.id, tenantId))
      .limit(1);

    if (!tenant) {
      res.status(404).json({ error: "Tenant not found" });
      return;
    }

    let liveTenant: { id: number; name: string; slug: string } | null = null;
    if (tenant.isSandbox && tenant.sandboxOfTenantId) {
      const [live] = await db
        .select({ id: tenantsTable.id, name: tenantsTable.name, slug: tenantsTable.slug })
        .from(tenantsTable)
        .where(eq(tenantsTable.id, tenant.sandboxOfTenantId))
        .limit(1);
      liveTenant = live ?? null;
    }

    let sandboxTenant: { id: number; name: string; slug: string } | null = null;
    if (!tenant.isSandbox) {
      const [sandbox] = await db
        .select({ id: tenantsTable.id, name: tenantsTable.name, slug: tenantsTable.slug })
        .from(tenantsTable)
        .where(
          and(
            eq(tenantsTable.sandboxOfTenantId, tenantId),
            eq(tenantsTable.isActive, true),
          ),
        )
        .limit(1);
      sandboxTenant = sandbox ?? null;
    }

    res.json({
      isSandbox: tenant.isSandbox,
      sandboxOfTenantId: tenant.sandboxOfTenantId,
      liveTenant,
      sandboxTenant,
    });
  },
);

// POST /admin/tenants/:tenantId/create-sandbox
// Admin portal: create a sandbox for the given tenant.
router.post(
  "/admin/tenants/:tenantId/create-sandbox",
  async (req: Request, res: Response): Promise<void> => {
    if (!checkAdminSecret(req, res)) return;

    const tenantId = parseInt(req.params.tenantId, 10);
    if (isNaN(tenantId)) {
      res.status(400).json({ error: "Invalid tenantId" });
      return;
    }

    const [tenant] = await db
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.id, tenantId))
      .limit(1);

    if (!tenant) {
      res.status(404).json({ error: "Tenant not found" });
      return;
    }

    if (tenant.isSandbox) {
      res.status(400).json({ error: "This tenant is already a sandbox" });
      return;
    }

    const existing = await db
      .select({ id: tenantsTable.id, slug: tenantsTable.slug })
      .from(tenantsTable)
      .where(
        and(
          eq(tenantsTable.sandboxOfTenantId, tenantId),
          eq(tenantsTable.isActive, true),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({
        error: "A sandbox already exists for this tenant",
        sandboxId: existing[0].id,
        sandboxSlug: existing[0].slug,
      });
      return;
    }

    const sandboxSlug = `${tenant.slug}-sandbox`;

    const slugConflict = await db
      .select({ id: tenantsTable.id })
      .from(tenantsTable)
      .where(eq(tenantsTable.slug, sandboxSlug))
      .limit(1);

    if (slugConflict.length > 0) {
      res.status(409).json({ error: `Slug '${sandboxSlug}' is already taken` });
      return;
    }

    const [sandboxTenant] = await db
      .insert(tenantsTable)
      .values({
        name: `${tenant.name} (Sandbox)`,
        slug: sandboxSlug,
        contactEmail: tenant.contactEmail,
        contactPhone: tenant.contactPhone ?? null,
        address: tenant.address ?? null,
        isActive: true,
        isSandbox: true,
        sandboxOfTenantId: tenant.id,
      })
      .returning();

    const liveMembers = await db
      .select()
      .from(userTenantsTable)
      .where(
        and(
          eq(userTenantsTable.tenantId, tenantId),
          eq(userTenantsTable.isActive, true),
        ),
      );

    if (liveMembers.length > 0) {
      await db.insert(userTenantsTable).values(
        liveMembers.map((m) => ({
          userId: m.userId,
          tenantId: sandboxTenant.id,
          isActive: true,
          isSuperAdmin: m.isSuperAdmin,
          roleId: m.roleId ?? null,
          receiveAlerts: m.receiveAlerts ?? false,
        })),
      );
    }

    console.log(
      `[SANDBOX] Created sandbox tenant '${sandboxSlug}' (id ${sandboxTenant.id}) for live tenant '${tenant.slug}' (id ${tenantId}) with ${liveMembers.length} users copied`,
    );

    res.json({
      sandbox: {
        id: sandboxTenant.id,
        name: sandboxTenant.name,
        slug: sandboxTenant.slug,
        isSandbox: sandboxTenant.isSandbox,
        sandboxOfTenantId: sandboxTenant.sandboxOfTenantId,
        createdAt: sandboxTenant.createdAt,
      },
    });
  },
);

// POST /tenants/current/sandbox/reset
// Wipe all operational records for every farm in the sandbox, keeping farm
// structure (the farms rows themselves, farm members, GPS/LIS credentials,
// subscriptions, platform config).  Only sandbox tenants can call this.
router.post(
  "/tenants/current/sandbox/reset",
  requireAuth,
  requireTenant,
  async (req: Request, res: Response): Promise<void> => {
    if (!req.isSandbox) {
      res.status(400).json({ error: "Only sandbox tenants can be reset" });
      return;
    }

    if (!req.isSuperAdmin) {
      res.status(403).json({ error: "Only super-admins can reset a sandbox" });
      return;
    }

    const tenantId = req.tenantId!;

    const farmRows = await db
      .select({ id: farmsTable.id })
      .from(farmsTable)
      .where(eq(farmsTable.tenantId, tenantId));

    const farmIds = farmRows.map((f) => f.id);

    if (farmIds.length === 0) {
      res.json({ deleted: 0, tablesCleared: 0, farmCount: 0 });
      return;
    }

    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

    try {
      const infoRes = await pool.query<{ tablename: string }>(
        `SELECT DISTINCT c.table_name AS tablename
         FROM information_schema.columns c
         WHERE c.column_name = 'farm_id'
           AND c.table_schema = 'public'
           AND c.table_name NOT IN (
             'farms',
             'subscriptions',
             'farm_members',
             'gps_integrations',
             'sensor_integrations',
             'lis_credentials',
             'lip_credentials',
             'eid_cymru_credentials',
             'scot_eid_credentials',
             'teltonika_credentials',
             'john_deere_credentials',
             'webfleet_credentials',
             'agco_credentials',
             'timesheet_reminder_settings'
           )
         ORDER BY c.table_name`,
      );

      const tables = infoRes.rows.map((r) => r.tablename);
      const farmIdsLiteral = farmIds.map((_, i) => `$${i + 1}`).join(", ");
      let totalDeleted = 0;

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        for (const table of tables) {
          const r = await client.query(
            `DELETE FROM "${table}" WHERE farm_id IN (${farmIdsLiteral})`,
            farmIds,
          );
          totalDeleted += r.rowCount ?? 0;
        }

        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }

      console.log(
        `[SANDBOX] Reset sandbox tenant ${tenantId}: cleared ${totalDeleted} rows across ${tables.length} tables for ${farmIds.length} farm(s)`,
      );

      res.json({
        deleted: totalDeleted,
        tablesCleared: tables.length,
        farmCount: farmIds.length,
      });
    } finally {
      await pool.end();
    }
  },
);

export default router;
