import type { Client } from "pg";

export const ANALYTICS_FIXTURE_FARM_NAME =
  "[E2E RESERVED] Analytics Print Fixture";
export const ANALYTICS_FIXTURE_YEAR = new Date().getUTCFullYear();

const VITICULTURE_MARKER = "dashboard-e2e:analytics-print:viticulture";
const LIVESTOCK_MARKER = "dashboard-e2e:analytics-print:livestock";
const POULTRY_FLOCK_NUMBER = "E2E-ANALYTICS-PRINT";

export type AnalyticsChartFixture = {
  tenantSlug: string;
  farmId: number;
  year: number;
};

/**
 * Provision one persistent, clearly reserved farm for the cross-module print
 * check. Every mutable history row is selected by its E2E marker, so reruns
 * repair the fixture without touching records entered by users.
 */
export async function provisionAnalyticsChartFixture(
  db: Client,
  tenantId: number,
  tenantSlug: string,
): Promise<AnalyticsChartFixture> {
  await db.query(
    "SELECT pg_advisory_xact_lock(hashtext('dashboard-e2e-analytics-print-fixture'))",
  );

  const existingFarm = await db.query<{ id: number }>(
    `SELECT id
       FROM farms
      WHERE tenant_id = $1 AND name = $2
      ORDER BY id
      LIMIT 1`,
    [tenantId, ANALYTICS_FIXTURE_FARM_NAME],
  );

  let farmId = existingFarm.rows[0]?.id;
  if (!farmId) {
    const insertedFarm = await db.query<{ id: number }>(
      `INSERT INTO farms
        (tenant_id, name, sector_viticulture, sector_beef, sector_poultry,
         is_active, created_at, updated_at)
       VALUES ($1, $2, true, true, true, true, NOW(), NOW())
       RETURNING id`,
      [tenantId, ANALYTICS_FIXTURE_FARM_NAME],
    );
    farmId = insertedFarm.rows[0]?.id;
  }
  if (!farmId) {
    throw new Error("Failed to create the reserved analytics print fixture farm");
  }

  await db.query(
    `UPDATE farms
        SET sector_viticulture = true,
            sector_beef = true,
            sector_poultry = true,
            is_active = true,
            updated_at = NOW()
      WHERE id = $1 AND tenant_id = $2 AND name = $3`,
    [farmId, tenantId, ANALYTICS_FIXTURE_FARM_NAME],
  );

  const modules = await db.query<{ id: number; key: string }>(
    `SELECT id, key
       FROM modules
      WHERE key = ANY($1::text[]) AND is_active = true`,
    [["viticulture", "livestock-management", "poultry-production"]],
  );
  const moduleIds = new Map(modules.rows.map((module) => [module.key, module.id]));
  for (const moduleKey of [
    "viticulture",
    "livestock-management",
    "poultry-production",
  ]) {
    const moduleId = moduleIds.get(moduleKey);
    if (!moduleId) {
      throw new Error(
        `The ${moduleKey} module is missing; cannot provision analytics print fixture`,
      );
    }
    await db.query(
      `INSERT INTO subscriptions
        (tenant_id, farm_id, module_id, status, created_at, updated_at)
       SELECT $1, $2, $3, 'active', NOW(), NOW()
        WHERE NOT EXISTS (
          SELECT 1
            FROM subscriptions
           WHERE tenant_id = $1 AND farm_id = $2 AND module_id = $3
             AND status = 'active'
        )`,
      [tenantId, farmId, moduleId],
    );
  }

  await db.query(
    `DELETE FROM vineyard_harvest
      WHERE farm_id = $1 AND notes = $2
        AND id NOT IN (
          SELECT MIN(id) FROM vineyard_harvest
           WHERE farm_id = $1 AND notes = $2
        )`,
    [farmId, VITICULTURE_MARKER],
  );
  const vineyardValues = [
    farmId,
    VITICULTURE_MARKER,
    ANALYTICS_FIXTURE_YEAR,
    `${ANALYTICS_FIXTURE_YEAR}-09-01`,
  ];
  const updatedHarvest = await db.query(
    `UPDATE vineyard_harvest
        SET vintage_year = $3,
            harvest_date = $4,
            yield_kg = '1250',
            grape_condition = 'Good'
      WHERE farm_id = $1 AND notes = $2`,
    vineyardValues,
  );
  if (updatedHarvest.rowCount === 0) {
    await db.query(
      `INSERT INTO vineyard_harvest
        (farm_id, vintage_year, harvest_date, yield_kg, grape_condition, notes)
       VALUES ($1, $3, $4, '1250', 'Good', $2)`,
      vineyardValues,
    );
  }

  await db.query(
    `DELETE FROM livestock_mortality
      WHERE farm_id = $1 AND notes = $2
        AND id NOT IN (
          SELECT MIN(id) FROM livestock_mortality
           WHERE farm_id = $1 AND notes = $2
        )`,
    [farmId, LIVESTOCK_MARKER],
  );
  const mortalityValues = [
    farmId,
    LIVESTOCK_MARKER,
    `${ANALYTICS_FIXTURE_YEAR}-03-15T12:00:00.000Z`,
  ];
  const updatedMortality = await db.query(
    `UPDATE livestock_mortality
        SET species = 'cattle',
            date_of_death = $3,
            cause_of_death = 'E2E fixture cause',
            disposal_method = 'fallen-stock-collector',
            status = 'reported'
      WHERE farm_id = $1 AND notes = $2`,
    mortalityValues,
  );
  if (updatedMortality.rowCount === 0) {
    await db.query(
      `INSERT INTO livestock_mortality
        (farm_id, species, date_of_death, cause_of_death, disposal_method,
         status, notes)
       VALUES
        ($1, 'cattle', $3, 'E2E fixture cause', 'fallen-stock-collector',
         'reported', $2)`,
      mortalityValues,
    );
  }

  await db.query(
    `DELETE FROM poultry_flocks
      WHERE farm_id = $1 AND flock_number = $2
        AND id NOT IN (
          SELECT MIN(id) FROM poultry_flocks
           WHERE farm_id = $1 AND flock_number = $2
        )`,
    [farmId, POULTRY_FLOCK_NUMBER],
  );
  const poultryValues = [
    farmId,
    POULTRY_FLOCK_NUMBER,
    `${ANALYTICS_FIXTURE_YEAR}-02-10`,
    POULTRY_FLOCK_NUMBER,
  ];
  const updatedFlock = await db.query(
    `UPDATE poultry_flocks
        SET species = 'chicken',
            production_system = 'free-range',
            placement_date = $3,
            placement_count = 500,
            status = 'active',
            notes = $4
      WHERE farm_id = $1 AND flock_number = $2`,
    poultryValues,
  );
  if (updatedFlock.rowCount === 0) {
    await db.query(
      `INSERT INTO poultry_flocks
        (farm_id, flock_number, species, production_system, placement_date,
         placement_count, status, notes)
       VALUES ($1, $2, 'chicken', 'free-range', $3, 500, 'active', $4)`,
      poultryValues,
    );
  }

  return { tenantSlug, farmId, year: ANALYTICS_FIXTURE_YEAR };
}