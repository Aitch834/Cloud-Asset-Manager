import { Client } from "pg";
import { TENANT_SLUG } from "./global-setup";

export type ActiveViticultureFarm = {
  tenantSlug: string;
  farmId: number;
  farmName: string;
};

export async function requireActiveViticultureFarm(): Promise<ActiveViticultureFarm> {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();

  try {
    const result = await db.query<{
      tenant_slug: string;
      farm_id: number;
      farm_name: string;
    }>(
      `SELECT t.slug AS tenant_slug, f.id AS farm_id, f.name AS farm_name
       FROM tenants t
       JOIN farms f ON f.tenant_id = t.id
       JOIN subscriptions s ON s.farm_id = f.id AND s.tenant_id = t.id
       JOIN modules m ON m.id = s.module_id
       WHERE t.slug = $1
         AND t.is_active = true
         AND f.is_active = true
         AND (
           s.status = 'active'
           OR (
             s.status = 'trial'
             AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
           )
         )
         AND m.key IN ('viticulture', 'organic-viticulture')
         AND m.is_active = true
         AND f.sector_viticulture = true
         AND EXISTS (
           SELECT 1
           FROM vineyard_blocks vb
           WHERE vb.farm_id = f.id
         )
       ORDER BY f.id
       LIMIT 1`,
      [TENANT_SLUG],
    );

    const farm = result.rows[0];
    if (!farm) {
      throw new Error(
        `Viticulture E2E setup failed: tenant ${TENANT_SLUG} has no active farm with ` +
          "the Viticulture sector enabled, an active Viticulture subscription, and a vineyard block.",
      );
    }

    return {
      tenantSlug: farm.tenant_slug,
      farmId: farm.farm_id,
      farmName: farm.farm_name,
    };
  } finally {
    await db.end();
  }
}

export const getActiveViticultureFarm = requireActiveViticultureFarm;