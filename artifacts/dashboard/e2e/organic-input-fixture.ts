import type { Client } from "pg";

export const ORGANIC_INPUT_FIXTURE_MARKER =
  "dashboard-e2e:organic-input-register-export";
export const ORGANIC_INPUT_FIXTURE_PRODUCT =
  "E2E Derogation Seed Treatment";
export const ORGANIC_INPUT_FIXTURE_EXPIRY_ISO = "2026-12-31";
export const ORGANIC_INPUT_FIXTURE_EXPIRY_UK = "31/12/2026";
export const ORGANIC_INPUT_FIXTURE_CROP_YEAR = 2026;

export type OrganicInputFixtureFarm = {
  tenantSlug: string;
  farmId: number;
  farmName: string;
};

/**
 * Keep one clearly tagged organic input on the shared E2E tenant. The fixture is
 * deliberately persistent: global teardown retains the shared Clerk identity,
 * and retaining this row makes quota-constrained authenticated checks repeatable.
 */
export async function provisionOrganicInputFixture(
  db: Client,
  tenantId: number,
  tenantSlug: string,
): Promise<OrganicInputFixtureFarm> {
  const farmResult = await db.query<{ id: number; name: string }>(
    `SELECT id, name
       FROM farms
      WHERE tenant_id = $1
      ORDER BY id
      LIMIT 1`,
    [tenantId],
  );
  const farm = farmResult.rows[0];
  if (!farm) {
    throw new Error(
      `No farm is available for the E2E tenant ${tenantSlug}; cannot provision the organic export fixture`,
    );
  }

  const moduleResult = await db.query<{ id: number }>(
    "SELECT id FROM modules WHERE key = 'organic-compliance' LIMIT 1",
  );
  const moduleId = moduleResult.rows[0]?.id;
  if (!moduleId) {
    throw new Error(
      "The organic-compliance module is missing; cannot provision the organic export fixture",
    );
  }

  await db.query(
    `INSERT INTO subscriptions (tenant_id, farm_id, module_id, status, created_at, updated_at)
     SELECT $1, $2, $3, 'active', NOW(), NOW()
      WHERE NOT EXISTS (
        SELECT 1
          FROM subscriptions
         WHERE tenant_id = $1
           AND farm_id = $2
           AND module_id = $3
           AND (
             status = 'active'
             OR (status = 'trial' AND (current_period_end IS NULL OR current_period_end > NOW()))
           )
      )`,
    [tenantId, farm.id, moduleId],
  );

  // Remove only duplicate copies carrying the E2E marker, then update-or-create
  // the retained fixture. Ordinary farm records are never matched or changed.
  await db.query(
    `DELETE FROM organic_inputs
      WHERE farm_id = $1
        AND notes = $2
        AND id NOT IN (
          SELECT MIN(id)
            FROM organic_inputs
           WHERE farm_id = $1 AND notes = $2
        )`,
    [farm.id, ORGANIC_INPUT_FIXTURE_MARKER],
  );

  const fixtureValues = [
    farm.id,
    ORGANIC_INPUT_FIXTURE_MARKER,
    ORGANIC_INPUT_FIXTURE_PRODUCT,
    ORGANIC_INPUT_FIXTURE_CROP_YEAR,
    ORGANIC_INPUT_FIXTURE_EXPIRY_ISO,
  ];
  const updated = await db.query(
    `UPDATE organic_inputs
        SET product_name = $3,
            input_type = 'Seed Treatment',
            supplier = 'E2E Organic Supplies',
            po_reference = 'PO-E2E-1928',
            grn_reference = 'GRN-E2E-1928',
            approval_status = 'derogation',
            certifier_approval_ref = 'DER-E2E-1928',
            crop_year = $4,
            date_of_use = '2026-09-01',
            quantity_amount = '25',
            quantity_unit = 'kg',
            field_id = NULL,
            field_name = 'North Field',
            justification = 'Deterministic authenticated browser export fixture',
            certifier_notified = true,
            applied_by = 'E2E Tester',
            derogation_expiry_date = $5,
            notes = $2
      WHERE farm_id = $1 AND notes = $2`,
    fixtureValues,
  );

  if (updated.rowCount === 0) {
    await db.query(
      `INSERT INTO organic_inputs
        (farm_id, product_name, input_type, supplier, po_reference, grn_reference,
         approval_status, certifier_approval_ref, crop_year, date_of_use,
         quantity_amount, quantity_unit, field_name, justification,
         certifier_notified, applied_by, derogation_expiry_date, notes)
       VALUES
        ($1, $3, 'Seed Treatment', 'E2E Organic Supplies', 'PO-E2E-1928',
         'GRN-E2E-1928', 'derogation', 'DER-E2E-1928', $4, '2026-09-01',
         '25', 'kg', 'North Field', 'Deterministic authenticated browser export fixture',
         true, 'E2E Tester', $5, $2)`,
      fixtureValues,
    );
  }

  return { tenantSlug, farmId: farm.id, farmName: farm.name };
}