/**
 * Creates "Highfield Vineyard" as Farm 3 in the oakfield-farms tenant,
 * with ONLY viticulture + organic-viticulture subscriptions, then copies
 * all viticulture data from Farm 1 into it.
 *
 * Run: node artifacts/api-server/scripts/create-vineyard-demo-farm.mjs
 */
import pg from 'pg';

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

// ── helpers ──────────────────────────────────────────────────────────────────

async function q(sql, params) {
  const r = await client.query(sql, params);
  return r.rows;
}

/** Return columns for a table, excluding the given names. */
async function cols(table, exclude = ['id']) {
  const rows = await q(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema='public' AND table_name=$1
     ORDER BY ordinal_position`,
    [table]
  );
  return rows.map(r => r.column_name).filter(c => !exclude.includes(c));
}

// ── main ─────────────────────────────────────────────────────────────────────

try {
  await client.query('BEGIN');

  // ── 1. Guard: don't create if already exists ─────────────────────────────
  const existing = await q(`SELECT id FROM farms WHERE tenant_id=1 AND name='Highfield Vineyard'`);
  if (existing.length) {
    console.log(`Farm already exists with id=${existing[0].id}. Exiting without changes.`);
    await client.query('ROLLBACK');
    process.exit(0);
  }

  // ── 2. Create Farm 3 ─────────────────────────────────────────────────────
  // Copy viticulture-relevant settings from Farm 1, clear livestock/arable flags
  const [newFarm] = await q(`
    INSERT INTO farms (
      tenant_id, name, address, postcode, country,
      sector_viticulture,
      fsa_vine_register_ref, fsa_wine_production_ref, winegb_membership_number,
      farm_manager, holding_type, latitude, longitude, what3words,
      total_hectares
    )
    SELECT
      tenant_id, 'Highfield Vineyard', address, postcode, country,
      true,
      fsa_vine_register_ref, fsa_wine_production_ref, winegb_membership_number,
      farm_manager, holding_type, latitude, longitude, what3words,
      total_hectares
    FROM farms WHERE id=1
    RETURNING id
  `);
  const farmId = newFarm.id;
  console.log(`✓ Created Farm ${farmId}: Highfield Vineyard`);

  // ── 3. Subscriptions: viticulture + organic-viticulture only ─────────────
  await q(`
    INSERT INTO subscriptions (tenant_id, farm_id, module_id, status, current_period_start, current_period_end)
    SELECT 1, $1, id, 'active', now(), now() + interval '10 years'
    FROM modules WHERE key IN ('viticulture','organic-viticulture')
    ON CONFLICT DO NOTHING
  `, [farmId]);
  console.log(`✓ Created subscriptions: viticulture + organic-viticulture`);

  // ── 4. Copy vineyard_blocks ───────────────────────────────────────────────
  const blockCols = await cols('vineyard_blocks', ['id', 'farm_id']);
  const srcBlocks = await q(`SELECT id, ${blockCols.join(',')} FROM vineyard_blocks WHERE farm_id=1`);
  const blockMap = {}; // old_id → new_id
  for (const b of srcBlocks) {
    const [row] = await q(
      `INSERT INTO vineyard_blocks (farm_id,${blockCols.join(',')})
       VALUES ($1,${blockCols.map((_,i)=>`$${i+2}`).join(',')})
       RETURNING id`,
      [farmId, ...blockCols.map(c => b[c])]
    );
    blockMap[b.id] = row.id;
  }
  console.log(`✓ Copied ${srcBlocks.length} vineyard_blocks`);

  // ── 5. Copy vineyard_block_plantings ─────────────────────────────────────
  const plantCols = await cols('vineyard_block_plantings', ['id', 'farm_id', 'block_id', 'predecessor_planting_id']);
  const srcPlantings = await q(
    `SELECT id, block_id, predecessor_planting_id, ${plantCols.join(',')}
     FROM vineyard_block_plantings WHERE farm_id=1`
  );
  const plantMap = {};
  // First pass: insert without predecessor (self-reference resolved after)
  for (const p of srcPlantings) {
    const [row] = await q(
      `INSERT INTO vineyard_block_plantings (farm_id, block_id, predecessor_planting_id, ${plantCols.join(',')})
       VALUES ($1,$2,NULL,${plantCols.map((_,i)=>`$${i+3}`).join(',')})
       RETURNING id`,
      [farmId, blockMap[p.block_id], ...plantCols.map(c => p[c])]
    );
    plantMap[p.id] = row.id;
  }
  // Second pass: fix predecessor_planting_id references
  for (const p of srcPlantings) {
    if (p.predecessor_planting_id && plantMap[p.predecessor_planting_id]) {
      await q(
        `UPDATE vineyard_block_plantings SET predecessor_planting_id=$1 WHERE id=$2`,
        [plantMap[p.predecessor_planting_id], plantMap[p.id]]
      );
    }
  }
  console.log(`✓ Copied ${srcPlantings.length} vineyard_block_plantings`);

  // ── 6. Copy vineyard_block_boundaries (no farm_id col) ───────────────────
  const bbCols = await cols('vineyard_block_boundaries', ['id', 'block_id']);
  const srcBb = await q(`SELECT id, block_id, ${bbCols.join(',')} FROM vineyard_block_boundaries
    WHERE block_id IN (${Object.keys(blockMap).join(',') || 'NULL'})`);
  for (const bb of srcBb) {
    await q(
      `INSERT INTO vineyard_block_boundaries (block_id,${bbCols.join(',')})
       VALUES ($1,${bbCols.map((_,i)=>`$${i+2}`).join(',')})`,
      [blockMap[bb.block_id], ...bbCols.map(c => bb[c])]
    );
  }
  console.log(`✓ Copied ${srcBb.length} vineyard_block_boundaries`);

  // ── 7. Helper: copy table with block_id + optional planting_id remapping ──
  async function copyBlockTable(table, extraExclude = []) {
    const exclude = ['id', 'farm_id', 'block_id', 'planting_id', ...extraExclude];
    const cs = await cols(table, exclude);
    const hasFarmId = (await cols(table, ['id'])).includes('farm_id');
    const hasPlantingId = (await cols(table, ['id'])).includes('planting_id');
    const src = await q(
      `SELECT id, block_id ${hasPlantingId ? ',planting_id' : ''}, ${cs.join(',')}
       FROM ${table} WHERE farm_id=1`
    );
    const idMap = {};
    for (const row of src) {
      const vals = [
        ...(hasFarmId ? [farmId] : []),
        blockMap[row.block_id] || null,
        ...(hasPlantingId ? [row.planting_id ? (plantMap[row.planting_id] || null) : null] : []),
        ...cs.map(c => row[c])
      ];
      const placeholders = vals.map((_,i) => `$${i+1}`).join(',');
      const colList = [
        ...(hasFarmId ? ['farm_id'] : []),
        'block_id',
        ...(hasPlantingId ? ['planting_id'] : []),
        ...cs
      ];
      const [inserted] = await q(
        `INSERT INTO ${table} (${colList.join(',')}) VALUES (${placeholders}) RETURNING id`,
        vals
      );
      idMap[row.id] = inserted.id;
    }
    console.log(`✓ Copied ${src.length} ${table}`);
    return idMap;
  }

  // ── 8. vine_register ─────────────────────────────────────────────────────
  await copyBlockTable('vine_register');

  // ── 9. vineyard_phenology ────────────────────────────────────────────────
  await copyBlockTable('vineyard_phenology');

  // ── 10. vineyard_operations ──────────────────────────────────────────────
  await copyBlockTable('vineyard_operations');

  // ── 11. vineyard_harvest ─────────────────────────────────────────────────
  // destination_winery_contact_id is a FK to contacts; skip remapping (set NULL for demo)
  await copyBlockTable('vineyard_harvest', ['destination_winery_contact_id']);

  // ── 12. vineyard_block_photos ────────────────────────────────────────────
  await copyBlockTable('vineyard_block_photos');

  // ── 13. pest_trap_captures ───────────────────────────────────────────────
  await copyBlockTable('pest_trap_captures');

  // ── 14. vineyard_soil_analysis ───────────────────────────────────────────
  const soilAnalysisMap = await copyBlockTable('vineyard_soil_analysis');

  // ── 15. vineyard_soil_sample_points (FK: soil_analysis_id) ───────────────
  const sspCols = await cols('vineyard_soil_sample_points', ['id', 'soil_analysis_id', 'farm_id']);
  const srcSsp = await q(
    `SELECT soil_analysis_id, ${sspCols.join(',')} FROM vineyard_soil_sample_points WHERE farm_id=1`
  );
  for (const s of srcSsp) {
    const newAnalysisId = soilAnalysisMap[s.soil_analysis_id];
    if (!newAnalysisId) continue;
    await q(
      `INSERT INTO vineyard_soil_sample_points (soil_analysis_id, farm_id, ${sspCols.join(',')})
       VALUES ($1,$2,${sspCols.map((_,i)=>`$${i+3}`).join(',')})`,
      [newAnalysisId, farmId, ...sspCols.map(c => s[c])]
    );
  }
  console.log(`✓ Copied ${srcSsp.length} vineyard_soil_sample_points`);

  // ── 16. vineyard_spray_diary ─────────────────────────────────────────────
  const sprayDiaryCols = await cols('vineyard_spray_diary', ['id', 'farm_id', 'block_id']);
  const srcSpray = await q(
    `SELECT id, block_id, ${sprayDiaryCols.join(',')} FROM vineyard_spray_diary WHERE farm_id=1`
  );
  const sprayMap = {};
  for (const s of srcSpray) {
    const [row] = await q(
      `INSERT INTO vineyard_spray_diary (farm_id, block_id, ${sprayDiaryCols.join(',')})
       VALUES ($1,$2,${sprayDiaryCols.map((_,i)=>`$${i+3}`).join(',')})
       RETURNING id`,
      [farmId, blockMap[s.block_id] || null, ...sprayDiaryCols.map(c => s[c])]
    );
    sprayMap[s.id] = row.id;
  }
  console.log(`✓ Copied ${srcSpray.length} vineyard_spray_diary`);

  // ── 17. vineyard_spray_diary_photos ──────────────────────────────────────
  const sdpCols = await cols('vineyard_spray_diary_photos', ['id', 'spray_diary_id', 'farm_id']);
  const srcSdp = await q(
    `SELECT spray_diary_id, ${sdpCols.join(',')} FROM vineyard_spray_diary_photos WHERE farm_id=1`
  );
  for (const p of srcSdp) {
    const newDiaryId = sprayMap[p.spray_diary_id];
    if (!newDiaryId) continue;
    await q(
      `INSERT INTO vineyard_spray_diary_photos (spray_diary_id, farm_id, ${sdpCols.join(',')})
       VALUES ($1,$2,${sdpCols.map((_,i)=>`$${i+3}`).join(',')})`,
      [newDiaryId, farmId, ...sdpCols.map(c => p[c])]
    );
  }
  console.log(`✓ Copied ${srcSdp.length} vineyard_spray_diary_photos`);

  // ── 18. vineyard_scouting ────────────────────────────────────────────────
  const scoutingMap = await copyBlockTable('vineyard_scouting');

  // ── 19. vineyard_scouting_photos ─────────────────────────────────────────
  const scpCols = await cols('vineyard_scouting_photos', ['id', 'scouting_id', 'farm_id']);
  const srcScp = await q(
    `SELECT scouting_id, ${scpCols.join(',')} FROM vineyard_scouting_photos WHERE farm_id=1`
  );
  for (const p of srcScp) {
    const newScoutingId = scoutingMap[p.scouting_id];
    if (!newScoutingId) continue;
    await q(
      `INSERT INTO vineyard_scouting_photos (scouting_id, farm_id, ${scpCols.join(',')})
       VALUES ($1,$2,${scpCols.map((_,i)=>`$${i+3}`).join(',')})`,
      [newScoutingId, farmId, ...scpCols.map(c => p[c])]
    );
  }
  console.log(`✓ Copied ${srcScp.length} vineyard_scouting_photos`);

  // ── 20. winery_vessels ───────────────────────────────────────────────────
  const vesselCols = await cols('winery_vessels', ['id', 'farm_id']);
  const srcVessels = await q(
    `SELECT id, ${vesselCols.join(',')} FROM winery_vessels WHERE farm_id=1`
  );
  const vesselMap = {};
  for (const v of srcVessels) {
    const [row] = await q(
      `INSERT INTO winery_vessels (farm_id,${vesselCols.join(',')})
       VALUES ($1,${vesselCols.map((_,i)=>`$${i+2}`).join(',')})
       RETURNING id`,
      [farmId, ...vesselCols.map(c => v[c])]
    );
    vesselMap[v.id] = row.id;
  }
  console.log(`✓ Copied ${srcVessels.length} winery_vessels`);

  // ── 21. Helper: copy table with vessel_id remapping ──────────────────────
  async function copyVesselTable(table, extraExclude = []) {
    const exclude = ['id', 'farm_id', 'vessel_id', ...extraExclude];
    const cs = await cols(table, exclude);
    const src = await q(
      `SELECT id, vessel_id, ${cs.join(',')} FROM ${table} WHERE farm_id=1`
    );
    const idMap = {};
    for (const row of src) {
      const [inserted] = await q(
        `INSERT INTO ${table} (farm_id, vessel_id, ${cs.join(',')})
         VALUES ($1,$2,${cs.map((_,i)=>`$${i+3}`).join(',')})
         RETURNING id`,
        [farmId, vesselMap[row.vessel_id] || null, ...cs.map(c => row[c])]
      );
      idMap[row.id] = inserted.id;
    }
    console.log(`✓ Copied ${src.length} ${table}`);
    return idMap;
  }

  // ── 22. winery_vessel_cleans ─────────────────────────────────────────────
  await copyVesselTable('winery_vessel_cleans');

  // ── 23. winery_barrel_fills ──────────────────────────────────────────────
  await copyVesselTable('winery_barrel_fills');

  // ── 24. winery_fermentation_records ──────────────────────────────────────
  await copyVesselTable('winery_fermentation_records');

  // ── 25. winery_equipment ─────────────────────────────────────────────────
  const equipCols = await cols('winery_equipment', ['id', 'farm_id']);
  const srcEquip = await q(`SELECT id, ${equipCols.join(',')} FROM winery_equipment WHERE farm_id=1`);
  const equipMap = {};
  for (const e of srcEquip) {
    const [row] = await q(
      `INSERT INTO winery_equipment (farm_id,${equipCols.join(',')})
       VALUES ($1,${equipCols.map((_,i)=>`$${i+2}`).join(',')})
       RETURNING id`,
      [farmId, ...equipCols.map(c => e[c])]
    );
    equipMap[e.id] = row.id;
  }
  console.log(`✓ Copied ${srcEquip.length} winery_equipment`);

  // ── 26. winery_equipment_calibrations ────────────────────────────────────
  const calCols = await cols('winery_equipment_calibrations', ['id', 'farm_id', 'equipment_id']);
  const srcCal = await q(
    `SELECT equipment_id, ${calCols.join(',')} FROM winery_equipment_calibrations WHERE farm_id=1`
  );
  for (const c of srcCal) {
    const newEquipId = equipMap[c.equipment_id];
    if (!newEquipId) continue;
    await q(
      `INSERT INTO winery_equipment_calibrations (farm_id, equipment_id, ${calCols.join(',')})
       VALUES ($1,$2,${calCols.map((_,i)=>`$${i+3}`).join(',')})`,
      [farmId, newEquipId, ...calCols.map(col => c[col])]
    );
  }
  console.log(`✓ Copied ${srcCal.length} winery_equipment_calibrations`);

  // ── 27. winery_so2_tests (vessel_id + equipment_id) ──────────────────────
  const so2Cols = await cols('winery_so2_tests', ['id', 'farm_id', 'vessel_id', 'equipment_id']);
  const srcSo2 = await q(
    `SELECT vessel_id, equipment_id, ${so2Cols.join(',')} FROM winery_so2_tests WHERE farm_id=1`
  );
  for (const s of srcSo2) {
    await q(
      `INSERT INTO winery_so2_tests (farm_id, vessel_id, equipment_id, ${so2Cols.join(',')})
       VALUES ($1,$2,$3,${so2Cols.map((_,i)=>`$${i+4}`).join(',')})`,
      [farmId, vesselMap[s.vessel_id] || null, s.equipment_id ? (equipMap[s.equipment_id] || null) : null,
       ...so2Cols.map(c => s[c])]
    );
  }
  console.log(`✓ Copied ${srcSo2.length} winery_so2_tests`);

  // ── 28. winery_cellar_ops (from_vessel_id + to_vessel_id) ────────────────
  const cellarCols = await cols('winery_cellar_ops', ['id', 'farm_id', 'from_vessel_id', 'to_vessel_id']);
  const srcCellar = await q(
    `SELECT from_vessel_id, to_vessel_id, ${cellarCols.join(',')} FROM winery_cellar_ops WHERE farm_id=1`
  );
  for (const row of srcCellar) {
    await q(
      `INSERT INTO winery_cellar_ops (farm_id, from_vessel_id, to_vessel_id, ${cellarCols.join(',')})
       VALUES ($1,$2,$3,${cellarCols.map((_,i)=>`$${i+4}`).join(',')})`,
      [farmId,
       row.from_vessel_id ? (vesselMap[row.from_vessel_id] || null) : null,
       row.to_vessel_id ? (vesselMap[row.to_vessel_id] || null) : null,
       ...cellarCols.map(c => row[c])]
    );
  }
  console.log(`✓ Copied ${srcCellar.length} winery_cellar_ops`);

  // ── 29. winery_pressing_records ──────────────────────────────────────────
  const pressCols = await cols('winery_pressing_records', ['id', 'farm_id']);
  const srcPress = await q(`SELECT id, ${pressCols.join(',')} FROM winery_pressing_records WHERE farm_id=1`);
  const pressMap = {};
  for (const p of srcPress) {
    const [row] = await q(
      `INSERT INTO winery_pressing_records (farm_id,${pressCols.join(',')})
       VALUES ($1,${pressCols.map((_,i)=>`$${i+2}`).join(',')})
       RETURNING id`,
      [farmId, ...pressCols.map(c => p[c])]
    );
    pressMap[p.id] = row.id;
  }
  console.log(`✓ Copied ${srcPress.length} winery_pressing_records`);

  // ── 30. winery_pressing_additions ────────────────────────────────────────
  const addCols = await cols('winery_pressing_additions', ['id', 'farm_id', 'pressing_record_id']);
  const srcAdd = await q(
    `SELECT pressing_record_id, ${addCols.join(',')} FROM winery_pressing_additions WHERE farm_id=1`
  );
  for (const a of srcAdd) {
    const newPressId = pressMap[a.pressing_record_id];
    if (!newPressId) continue;
    await q(
      `INSERT INTO winery_pressing_additions (farm_id, pressing_record_id, ${addCols.join(',')})
       VALUES ($1,$2,${addCols.map((_,i)=>`$${i+3}`).join(',')})`,
      [farmId, newPressId, ...addCols.map(c => a[c])]
    );
  }
  console.log(`✓ Copied ${srcAdd.length} winery_pressing_additions`);

  // ── 31. Farm-level tables (no cross-table FKs) ───────────────────────────
  async function copyFarmTable(table, extraExclude = []) {
    const exclude = ['id', 'farm_id', ...extraExclude];
    const cs = await cols(table, exclude);
    const src = await q(`SELECT ${cs.join(',')} FROM ${table} WHERE farm_id=1`);
    for (const row of src) {
      await q(
        `INSERT INTO ${table} (farm_id,${cs.join(',')})
         VALUES ($1,${cs.map((_,i)=>`$${i+2}`).join(',')})`,
        [farmId, ...cs.map(c => row[c])]
      );
    }
    console.log(`✓ Copied ${src.length} ${table}`);
  }

  // winery_barrel_movements has vessel_id
  await copyVesselTable('winery_barrel_movements');

  // winery_bottling_records has source_vessel_id
  const bottlingCols = await cols('winery_bottling_records', ['id', 'farm_id', 'source_vessel_id']);
  const srcBottling = await q(
    `SELECT source_vessel_id, ${bottlingCols.join(',')} FROM winery_bottling_records WHERE farm_id=1`
  );
  for (const row of srcBottling) {
    await q(
      `INSERT INTO winery_bottling_records (farm_id, source_vessel_id, ${bottlingCols.join(',')})
       VALUES ($1,$2,${bottlingCols.map((_,i)=>`$${i+3}`).join(',')})`,
      [farmId, row.source_vessel_id ? (vesselMap[row.source_vessel_id] || null) : null,
       ...bottlingCols.map(c => row[c])]
    );
  }
  console.log(`✓ Copied ${srcBottling.length} winery_bottling_records`);

  // winery_reception_records has block_id
  const receptionCols = await cols('winery_reception_records', ['id', 'farm_id', 'block_id']);
  const srcReception = await q(
    `SELECT block_id, ${receptionCols.join(',')} FROM winery_reception_records WHERE farm_id=1`
  );
  for (const row of srcReception) {
    await q(
      `INSERT INTO winery_reception_records (farm_id, block_id, ${receptionCols.join(',')})
       VALUES ($1,$2,${receptionCols.map((_,i)=>`$${i+3}`).join(',')})`,
      [farmId, row.block_id ? (blockMap[row.block_id] || null) : null,
       ...receptionCols.map(c => row[c])]
    );
  }
  console.log(`✓ Copied ${srcReception.length} winery_reception_records`);

  await copyFarmTable('winery_tasting_sessions');
  await copyFarmTable('winery_age_verification');
  await copyFarmTable('winery_excise_returns');
  await copyFarmTable('winery_licences');
  await copyFarmTable('winery_batch_settings');

  // ── 32. Commit ────────────────────────────────────────────────────────────
  await client.query('COMMIT');
  console.log(`\n✅ Done. Farm ${farmId} "Highfield Vineyard" is ready.`);
  console.log(`   Subscriptions: viticulture + organic-viticulture only.`);
  console.log(`   Switch to it via the "Switch Farm" button in the test dashboard sidebar.`);

} catch (err) {
  await client.query('ROLLBACK');
  console.error('❌ Error — rolled back:', err.message);
  console.error(err);
  process.exit(1);
} finally {
  await client.end();
}
