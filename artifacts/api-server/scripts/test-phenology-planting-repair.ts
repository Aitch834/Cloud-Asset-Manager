import assert from "node:assert/strict";
import { db, pool } from "@workspace/db";
import { sql } from "drizzle-orm";
import { repairPhenologyPlantingLinks } from "../src/lib/viticultureMigrations";

async function main(): Promise<void> {
  const suffix = `${process.pid}-${Date.now()}`;

  await db.transaction(async tx => {
    const tenantResult = await tx.execute(sql`
      INSERT INTO tenants (name, slug, contact_email)
      VALUES (${"Phenology repair test"}, ${`phenology-repair-${suffix}`}, ${`phenology-${suffix}@example.test`})
      RETURNING id
    `);
    const tenantId = Number(tenantResult.rows[0].id);

    const farmResult = await tx.execute(sql`
      INSERT INTO farms (tenant_id, name)
      VALUES
        (${tenantId}, ${"Repair farm"}),
        (${tenantId}, ${"Other farm"})
      RETURNING id
    `);
    const farmId = Number(farmResult.rows[0].id);
    const otherFarmId = Number(farmResult.rows[1].id);

    const blockResult = await tx.execute(sql`
      INSERT INTO vineyard_blocks (farm_id, block_name)
      VALUES
        (${farmId}, ${"Historical block"}),
        (${farmId}, ${"Different block"}),
        (${otherFarmId}, ${"Other farm block"})
      RETURNING id
    `);
    const blockId = Number(blockResult.rows[0].id);
    const differentBlockId = Number(blockResult.rows[1].id);
    const otherFarmBlockId = Number(blockResult.rows[2].id);

    const plantingResult = await tx.execute(sql`
      INSERT INTO vineyard_block_plantings (block_id, farm_id, variety, status)
      VALUES
        (${blockId}, ${farmId}, ${"Retired variety"}, ${"removed"}),
        (${blockId}, ${farmId}, ${"Current variety"}, ${"active"}),
        (${differentBlockId}, ${farmId}, ${"Wrong block variety"}, ${"active"}),
        (${otherFarmBlockId}, ${otherFarmId}, ${"Other farm variety"}, ${"active"})
      RETURNING id
    `);
    const retiredPlantingId = Number(plantingResult.rows[0].id);
    const activePlantingId = Number(plantingResult.rows[1].id);
    const wrongBlockPlantingId = Number(plantingResult.rows[2].id);
    const otherFarmPlantingId = Number(plantingResult.rows[3].id);

    const phenologyResult = await tx.execute(sql`
      INSERT INTO vineyard_phenology
        (farm_id, block_id, planting_id, observation_date, bbch_stage, notes)
      VALUES
        (${farmId}, ${blockId}, ${retiredPlantingId}, ${"2024-05-01"}, ${"09"}, ${"valid historical"}),
        (${farmId}, ${blockId}, ${wrongBlockPlantingId}, ${"2026-05-01"}, ${"09"}, ${"wrong block"}),
        (${farmId}, ${blockId}, ${otherFarmPlantingId}, ${"2026-05-02"}, ${"10"}, ${"wrong farm"}),
        (${farmId}, ${null}, ${activePlantingId}, ${"2026-05-03"}, ${"11"}, ${"no block"}),
        (${farmId}, ${blockId}, ${activePlantingId}, ${"2026-05-04"}, ${"12"}, ${"already correct"})
      RETURNING id, notes
    `);
    const idsByNote = new Map(phenologyResult.rows.map(row => [String(row.notes), Number(row.id)]));

    const corrected = await repairPhenologyPlantingLinks(tx);
    assert.equal(corrected, 3, "only the mismatched and blockless rows should be corrected");

    const repaired = await tx.execute(sql`
      SELECT id, planting_id
      FROM vineyard_phenology
      WHERE id IN (${sql.join([...idsByNote.values()].map(id => sql`${id}`), sql`, `)})
    `);
    const plantingById = new Map(repaired.rows.map(row => [Number(row.id), row.planting_id === null ? null : Number(row.planting_id)]));

    assert.equal(plantingById.get(idsByNote.get("valid historical")!), retiredPlantingId);
    assert.equal(plantingById.get(idsByNote.get("wrong block")!), activePlantingId);
    assert.equal(plantingById.get(idsByNote.get("wrong farm")!), activePlantingId);
    assert.equal(plantingById.get(idsByNote.get("no block")!), null);
    assert.equal(plantingById.get(idsByNote.get("already correct")!), activePlantingId);
    assert.equal(await repairPhenologyPlantingLinks(tx), 0, "a second repair run must be a no-op");

    tx.rollback();
  }).catch(error => {
    if (error instanceof Error && error.name === "DrizzleError" && error.message.includes("Rollback")) return;
    throw error;
  });

  console.log("Phenology planting repair regression passed.");
}

main()
  .catch(error => {
    console.error("Phenology planting repair regression failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });