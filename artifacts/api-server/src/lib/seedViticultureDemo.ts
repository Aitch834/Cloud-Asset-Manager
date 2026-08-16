import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent viticulture demo-data seed.
 * Populates Highfield Farm (id=1) with a realistic 3.15 ha English estate vineyard.
 * Safe to run on every startup — skips if vine_register rows already exist for this farm.
 */
export async function seedViticultureDemo(): Promise<void> {
  const FARM_ID = 1;
  const FSA_REF = "VR-ENG-2010-00142";

  // Guard: skip if already seeded
  const existing = await db.execute(sql`
    SELECT COUNT(*) AS count FROM vine_register WHERE farm_id = ${FARM_ID}
  `);
  const existingRows = existing.rows as Array<{ count: string }>;
  if (Number(existingRows[0]?.count ?? 0) > 0) {
    console.log("[VITICULTURE-SEED] Demo data already present — skipping.");
    return;
  }

  console.log("[VITICULTURE-SEED] Seeding viticulture demo data for Highfield Farm…");

  await db.execute(sql`BEGIN`);
  try {
    // ── 1. Farm FSA ref ──────────────────────────────────────────────────────
    await db.execute(sql`
      UPDATE farms SET fsa_vine_register_ref = ${FSA_REF} WHERE id = ${FARM_ID}
    `);
    console.log("[VITICULTURE-SEED] ✓ Farm FSA vine register ref set");

    // ── 2. Vineyard Blocks ───────────────────────────────────────────────────
    const blocksRes = await db.execute(sql`
      INSERT INTO vineyard_blocks (farm_id, block_name, block_ref, field_parcel_ref, aspect, soil_type, notes)
      VALUES
        (${FARM_ID}, 'Top Field South',  'TFS', 'RU-4120-3881-AB', 'South',           'Chalk over clay loam',      'Primary Chardonnay block — best-drained site on the farm. 12% slope.'),
        (${FARM_ID}, 'Middle Slope',     'MDS', 'RU-4120-3882-BC', 'South-southwest',  'Sandy loam over greensand', 'Early-ripening Pinot Noir block. Gently undulating, 8% slope.'),
        (${FARM_ID}, 'West Bank',        'WBK', 'RU-4120-3883-CD', 'Southwest',        'Silty loam over clay',      'Sheltered by mature hedgerow on north side. Aromatic whites.'),
        (${FARM_ID}, 'Home Field',       'HFD', 'RU-4120-3884-DE', 'South',            'Clay loam over marl',       'Original planting — oldest block on farm. Reliable cropper.')
      RETURNING id, block_name
    `);
    const blocks = blocksRes.rows as Array<{ id: number; block_name: string }>;
    const [TFS, MDS, WBK, HFD] = blocks;
    console.log("[VITICULTURE-SEED] ✓ 4 vineyard blocks created");

    // ── 3. Plantings ─────────────────────────────────────────────────────────
    const plantingsRes = await db.execute(sql`
      INSERT INTO vineyard_block_plantings
        (block_id, farm_id, variety, clone, rootstock, planting_year, planted_date,
         number_of_vines, row_spacing_m, vine_spacing_m, training_system, trellis_type,
         area_ha, is_organic, status, notes)
      VALUES
        (${TFS.id}, ${FARM_ID}, 'Chardonnay',   'CH16',  '3309C', 2012, '2012-03-20',  2800, 2.50, 1.20, 'Double Guyot', 'VSP — 3 catch wires',   0.8500, false, 'active', 'VIVC 4551. Clone CH16 — selected for Sussex conditions. Excellent acidity retention.'),
        (${MDS.id}, ${FARM_ID}, 'Pinot Noir',   '115',   'SO4',   2015, '2015-04-08',  3100, 2.40, 1.10, 'Double Guyot', 'VSP — 4 catch wires',   1.2000, false, 'active', 'VIVC 9282. Clone 115 for English climate — good colour development at moderate Brix.'),
        (${WBK.id}, ${FARM_ID}, 'Bacchus',      'FR 52', '5BB',   2018, '2018-04-15',  1800, 2.50, 1.20, 'Double Guyot', 'VSP — 3 catch wires',   0.6500, false, 'active', 'VIVC 870. German cross (Silvaner × Riesling) × Müller-Thurgau. Herbaceous aromatics.'),
        (${HFD.id}, ${FARM_ID}, 'Seyval Blanc', null,    '5BB',   2010, '2010-03-28',  1400, 2.50, 1.20, 'Double Guyot', 'VSP — 3 catch wires',   0.4500, false, 'active', 'VIVC 11345. Original planting by previous owners. Reliable high-acid base wine for Traditional Method.')
      RETURNING id, block_id
    `);
    const plantings = plantingsRes.rows as Array<{ id: number; block_id: number }>;
    const [pCHD, pPN, pBAC, pSEY] = plantings;
    console.log("[VITICULTURE-SEED] ✓ 4 plantings created");

    // ── 4. Vine Register ─────────────────────────────────────────────────────
    await db.execute(sql`
      INSERT INTO vine_register
        (farm_id, block_id, planting_id, fsa_vine_register_ref, registered_variety,
         registered_area_ha, date_registered, date_amended, gi_classification,
         wine_colour, variety_colour, vivc_number, mother_variety, father_variety, notes)
      VALUES
        (${FARM_ID}, ${TFS.id}, ${pCHD.id}, ${FSA_REF}, 'Chardonnay',   0.8500, '2012-06-14', '2019-04-02', 'English Wine PDO', 'Sparkling White', 'White (green-yellow)', '4551',  'Pinot Noir',   'Gouais Blanc',       'Primary base wine for Traditional Method sparkling. Registered at planting.'),
        (${FARM_ID}, ${MDS.id}, ${pPN.id},  ${FSA_REF}, 'Pinot Noir',   1.2000, '2015-07-20', '2021-03-15', 'English Wine PDO', 'Sparkling Rosé',  'Black (blue-black)',   '9282',  'Pinot Meunier','Pinot Noir seedling', 'Dual-use: rosé base wine and pinot noir still. Registered on first fruiting year.'),
        (${FARM_ID}, ${WBK.id}, ${pBAC.id}, ${FSA_REF}, 'Bacchus',       0.6500, '2018-08-10', null,         'English Wine PGI', 'White',           'White (green-yellow)', '870',   'Silvaner',     'Riesling',           'Still white — unoaked. First registered 2018. No amendments to date.'),
        (${FARM_ID}, ${HFD.id}, ${pSEY.id}, ${FSA_REF}, 'Seyval Blanc',  0.4500, '2010-06-30', '2016-09-12', 'English Wine PGI', 'Sparkling White', 'White (green-yellow)', '11345', 'Seibel 5656',  'Rayon d''Or',        'Historical planting. Registered by previous landowner; ref transferred on farm sale 2016.')
    `);
    console.log("[VITICULTURE-SEED] ✓ 4 vine register entries created");

    // ── 5. Phenology 2024 ────────────────────────────────────────────────────
    type PhenRow = [number, number, number, string, string, string, number, string, number, string];
    const phenRows: PhenRow[] = [
      [FARM_ID, TFS.id, pCHD.id, '2024-04-09', 'BBCH 07', 'Bud burst — first green visible',           50, 'J. Hartley', 11.2, 'Cool start to season. Delayed by 5 days vs 2023 average.'],
      [FARM_ID, TFS.id, pCHD.id, '2024-05-15', 'BBCH 53', 'Inflorescence clearly visible',             90, 'J. Hartley', 16.8, 'Good canopy development. No frost events recorded.'],
      [FARM_ID, TFS.id, pCHD.id, '2024-06-20', 'BBCH 65', 'Full flowering',                            85, 'J. Hartley', 19.5, 'Flowering period 12 days — slightly extended. Good fruit set expected.'],
      [FARM_ID, TFS.id, pCHD.id, '2024-08-08', 'BBCH 81', 'Beginning of véraison',                    40, 'J. Hartley', 22.1, 'Colour change beginning. 15% bunch weight estimated.'],
      [FARM_ID, MDS.id, pPN.id,  '2024-04-07', 'BBCH 07', 'Bud burst — first green visible',           55, 'J. Hartley', 10.9, 'Pinot 2 days ahead of Chardonnay as expected for site.'],
      [FARM_ID, MDS.id, pPN.id,  '2024-06-18', 'BBCH 65', 'Full flowering',                            90, 'J. Hartley', 20.1, 'Excellent flowering conditions. Compact, well-set bunches.'],
      [FARM_ID, MDS.id, pPN.id,  '2024-08-05', 'BBCH 81', 'Beginning of véraison',                    60, 'J. Hartley', 23.4, 'Good colour development starting across whole block.'],
      [FARM_ID, MDS.id, pPN.id,  '2024-09-12', 'BBCH 89', 'Berries ripe for harvest',                100, 'J. Hartley', 18.7, 'Full ripeness achieved. Sugar/acid balance confirmed by lab.'],
      [FARM_ID, WBK.id, pBAC.id, '2024-04-11', 'BBCH 07', 'Bud burst — first green visible',           45, 'S. Hartley', 11.5, 'West Bank slightly later — sheltered aspect retains cool night temps.'],
      [FARM_ID, WBK.id, pBAC.id, '2024-09-18', 'BBCH 89', 'Berries ripe for harvest',                100, 'S. Hartley', 17.2, 'Aromatics intense. Lab: 20.8 Brix. Targeting pick 1 Oct.'],
    ];
    for (const r of phenRows) {
      await db.execute(sql`
        INSERT INTO vineyard_phenology
          (farm_id, block_id, planting_id, observation_date, bbch_stage, bbch_description, percentage_reached, observer, temperature_c, notes)
        VALUES (${r[0]},${r[1]},${r[2]},${r[3]},${r[4]},${r[5]},${r[6]},${r[7]},${r[8]},${r[9]})
      `);
    }
    console.log(`[VITICULTURE-SEED] ✓ ${phenRows.length} phenology observations created`);

    // ── 6. Spray Diary 2024 ──────────────────────────────────────────────────
    type SprayRow = [number, number, string, string, string, string, string, number, string, number, string, number, number, string, number, number, number, number, string, string, string];
    const sprays: SprayRow[] = [
      [FARM_ID, TFS.id, '2024-05-28', 'Fantic F',     '19099', 'Mandipropamid + Folpet',   'Downy mildew fungicide',   0.600, 'L/ha', 0.510, 'L',  0.85, 400, 'Air-blast / Vineyard Sprayer', 12, 21, 3.2, 18.4, 'Cloudy, dry',     'J. Hartley', 'PA1/PA6/PA2'],
      [FARM_ID, MDS.id, '2024-05-28', 'Fantic F',     '19099', 'Mandipropamid + Folpet',   'Downy mildew fungicide',   0.600, 'L/ha', 0.720, 'L',  1.20, 400, 'Air-blast / Vineyard Sprayer', 12, 21, 3.2, 18.4, 'Cloudy, dry',     'J. Hartley', 'PA1/PA6/PA2'],
      [FARM_ID, TFS.id, '2024-06-10', 'Vivando',      '16945', 'Metrafenone',              'Powdery mildew fungicide', 0.500, 'L/ha', 0.425, 'L',  0.85, 400, 'Air-blast / Vineyard Sprayer',  4,  0, 2.8, 21.2, 'Sunny, light wind','J. Hartley', 'PA1/PA6/PA2'],
      [FARM_ID, MDS.id, '2024-06-10', 'Vivando',      '16945', 'Metrafenone',              'Powdery mildew fungicide', 0.500, 'L/ha', 0.600, 'L',  1.20, 400, 'Air-blast / Vineyard Sprayer',  4,  0, 2.8, 21.2, 'Sunny, light wind','J. Hartley', 'PA1/PA6/PA2'],
      [FARM_ID, WBK.id, '2024-06-10', 'Vivando',      '16945', 'Metrafenone',              'Powdery mildew fungicide', 0.500, 'L/ha', 0.325, 'L',  0.65, 400, 'Air-blast / Vineyard Sprayer',  4,  0, 2.8, 21.2, 'Sunny, light wind','J. Hartley', 'PA1/PA6/PA2'],
      [FARM_ID, TFS.id, '2024-06-25', 'Cuprokylt FL', '14748', 'Copper oxychloride',       'Downy mildew — copper',    2.000, 'kg/ha',1.700, 'kg', 0.85, 500, 'Air-blast / Vineyard Sprayer',  4,  0, 4.1, 17.8, 'Overcast, calm',  'J. Hartley', 'PA1/PA6/PA2'],
      [FARM_ID, MDS.id, '2024-07-15', 'Serenade ASO', '17543', 'Bacillus subtilis QST713', 'Botrytis biocontrol',      4.000, 'L/ha', 4.800, 'L',  1.20, 400, 'Air-blast / Vineyard Sprayer',  4,  0, 1.9, 16.5, 'Humid, overcast', 'S. Hartley', 'PA1/PA6'],
      [FARM_ID, WBK.id, '2024-07-15', 'Serenade ASO', '17543', 'Bacillus subtilis QST713', 'Botrytis biocontrol',      4.000, 'L/ha', 2.600, 'L',  0.65, 400, 'Air-blast / Vineyard Sprayer',  4,  0, 1.9, 16.5, 'Humid, overcast', 'S. Hartley', 'PA1/PA6'],
      [FARM_ID, HFD.id, '2024-08-02', 'Fantic F',     '19099', 'Mandipropamid + Folpet',   'Downy mildew fungicide',   0.600, 'L/ha', 0.270, 'L',  0.45, 400, 'Air-blast / Vineyard Sprayer', 12, 21, 2.5, 19.1, 'Partly cloudy',   'J. Hartley', 'PA1/PA6/PA2'],
    ];
    for (const r of sprays) {
      await db.execute(sql`
        INSERT INTO vineyard_spray_diary
          (farm_id, block_id, application_date, product_name, mapp_number, active_ingredient, product_type,
           rate_per_hectare, rate_unit, total_quantity_applied, quantity_unit, area_treated_ha, water_volume_l_per_ha,
           application_method, reentry_period_hours, harvest_interval_days,
           wind_speed_mph, temperature_celsius, weather_conditions, operator_name, operator_certificate_no)
        VALUES (${r[0]},${r[1]},${r[2]},${r[3]},${r[4]},${r[5]},${r[6]},${r[7]},${r[8]},${r[9]},${r[10]},${r[11]},${r[12]},${r[13]},${r[14]},${r[15]},${r[16]},${r[17]},${r[18]},${r[19]},${r[20]})
      `);
    }
    console.log(`[VITICULTURE-SEED] ✓ ${sprays.length} spray diary entries created`);

    // ── 7. Scouting 2024 ─────────────────────────────────────────────────────
    type ScoutRow = [number, number, number, string, string, number, number, number, number, boolean, boolean, number, number, string, boolean, string | null, string, string];
    const scouts: ScoutRow[] = [
      [FARM_ID, TFS.id, pCHD.id, '2024-06-05', 'J. Hartley', 1, 0, 0, 0, false, false, 0, 0, 'Monitor weekly. Conditions marginal for downy.',          false, null,        '2024-06-12', 'Low-level downy mildew risk following wet spell 1–3 Jun. Canopy open — good airflow.'],
      [FARM_ID, MDS.id, pPN.id,  '2024-06-19', 'J. Hartley', 2, 1, 0, 1, false, false, 1, 0, 'Spray Fantic F on next pass. Increase canopy management.',true,  'Fantic F',  '2024-06-26', 'Downy pressure low but powdery starting on upper leaves. Leafhopper activity noted — watch closely.'],
      [FARM_ID, TFS.id, pCHD.id, '2024-07-10', 'S. Hartley', 1, 2, 1, 0, false, false, 0, 1, 'Applied Vivando and leaf strip E–W rows.',                true,  'Vivando',   '2024-07-17', 'Powdery mildew moderate on sun-exposed clusters. Spider mite flare on water-stressed vines in NW corner. Leaf removal carried out.'],
      [FARM_ID, WBK.id, pBAC.id, '2024-07-22', 'S. Hartley', 0, 0, 2, 0, false, false, 0, 0, 'Monitor botrytis closely — tight bunches, humid site.',   false, null,        '2024-07-29', 'Botrytis pressure moderate in bunch zone — dense canopy. Desuckering required urgently.'],
      [FARM_ID, MDS.id, pPN.id,  '2024-08-14', 'J. Hartley', 0, 0, 1, 0, false, false, 0, 0, 'Serenade applied 10 Aug. Botrytis retreating.',           false, null,        '2024-08-28', 'Biocontrol effective — botrytis back to trace level. Véraison proceeding well. Good pre-harvest canopy.'],
      [FARM_ID, HFD.id, pSEY.id, '2024-09-02', 'J. Hartley', 0, 0, 1, 0, false, false, 0, 0, 'Watch botrytis — tight Seyval bunches vulnerable.',       false, null,        '2024-09-16', 'Some botrytis visible in interior bunches. Recommend harvest before further rain events.'],
    ];
    for (const r of scouts) {
      await db.execute(sql`
        INSERT INTO vineyard_scouting
          (farm_id, block_id, planting_id, scout_date, scouted_by,
           downy_mildew_pressure, powdery_mildew_pressure, botrytis_pressure, phomopsis_pressure,
           eutypa_dieback_sighted, vine_weevil_sighted, leafhopper_pressure, spider_mite_pressure,
           action_taken, spray_applied, spray_product, next_scout_date, notes)
        VALUES (${r[0]},${r[1]},${r[2]},${r[3]},${r[4]},${r[5]},${r[6]},${r[7]},${r[8]},${r[9]},${r[10]},${r[11]},${r[12]},${r[13]},${r[14]},${r[15]},${r[16]},${r[17]})
      `);
    }
    console.log(`[VITICULTURE-SEED] ✓ ${scouts.length} scouting records created`);

    // ── 8. Vineyard Operations ────────────────────────────────────────────────
    type OpRow = [number, number, number, string, string, string | null, number | null, number | null, number | null, number | null, string | null, string, string | null, string | null, number, string];
    const ops: OpRow[] = [
      [FARM_ID, TFS.id, pCHD.id, '2024-01-22', 'Winter pruning',  'Double Guyot', 8, 8, 0.285, null, null, 'J. Hartley', null, null, 6.0, 'Pre-season pruning. Cane weight 285 g/m — excellent balance. All wood burnt on site.'],
      [FARM_ID, MDS.id, pPN.id,  '2024-01-29', 'Winter pruning',  'Double Guyot', 8, 8, 0.310, null, null, 'J. Hartley', null, null, 7.5, 'Pinot Noir pruning weight slightly above target — suggests mild overcropping in 2023. Thin to 8 buds.'],
      [FARM_ID, WBK.id, pBAC.id, '2024-02-05', 'Winter pruning',  'Double Guyot', 7, 7, 0.260, null, null, 'S. Hartley', null, null, 4.0, 'Good balance. West Bank always prunes cleaner — better air drainage.'],
      [FARM_ID, HFD.id, pSEY.id, '2024-02-12', 'Winter pruning',  'Double Guyot', 8, 8, 0.240, null, null, 'S. Hartley', null, null, 3.5, 'Oldest vines on farm — wood denser. No disease noted in 14-year-old cordons.'],
      [FARM_ID, TFS.id, pCHD.id, '2024-05-20', 'Shoot thinning',  null, null, null, null, 30, null, 'J. Hartley', null, null, 5.5, 'Removed 30% of shoots to open canopy. Retained all primary shoots with inflorescences.'],
      [FARM_ID, MDS.id, pPN.id,  '2024-05-21', 'Shoot thinning',  null, null, null, null, 25, null, 'J. Hartley', null, null, 7.0, 'Mid-slope block. Less aggressive thinning — naturall lower vigour on this soil.'],
      [FARM_ID, TFS.id, pCHD.id, '2024-07-03', 'Leaf removal',    null, null, null, null, null, 'East and west — primary leaf layer, bunch zone', 'J. Hartley', null, null, 9.0, 'Leaf stripped E & W faces of bunch zone to improve airflow and light exposure.'],
      [FARM_ID, MDS.id, pPN.id,  '2024-07-04', 'Leaf removal',    null, null, null, null, null, 'East face — bunch zone', 'J. Hartley', null, null, 8.5, 'Pinot Noir leaf strip east face only — protect Rosé colour development from sunscald.'],
    ];
    for (const r of ops) {
      await db.execute(sql`
        INSERT INTO vineyard_operations
          (farm_id, block_id, planting_id, operation_date, operation_type, pruning_system,
           buds_per_vine_target, buds_per_vine_actual, pruning_weight_kg_per_vine,
           shoots_removed_pct, leaves_removed_zone, operator_name, contractor_name, machine_used, hours_worked, notes)
        VALUES (${r[0]},${r[1]},${r[2]},${r[3]},${r[4]},${r[5]},${r[6]},${r[7]},${r[8]},${r[9]},${r[10]},${r[11]},${r[12]},${r[13]},${r[14]},${r[15]})
      `);
    }
    console.log(`[VITICULTURE-SEED] ✓ ${ops.length} vineyard operations created`);

    // ── 9. Harvest 2024 & 2023 ───────────────────────────────────────────────
    type HarvestRow = [number, number, number, number, string, string, number, number, number, number, number, number, number, string, boolean, number, string, null, null, string, string];
    const harvests: HarvestRow[] = [
      [FARM_ID, MDS.id, pPN.id,  2024, '2024-09-26', 'Hand-picked — 6 kg lugs', 9460,  3.051, 7.883, 22.30, 3.32, 6.90, 12.90, 'Excellent', false, 0, 'Estate winery', null, null, 'J. Hartley', 'Earliest Pinot Noir harvest on record. Superb colour, good TA for base wine.'],
      [FARM_ID, TFS.id, pCHD.id, 2024, '2024-09-28', 'Hand-picked — 6 kg lugs', 7280,  2.600, 8.565, 21.80, 3.27, 7.60, 12.60, 'Excellent', false, 0, 'Estate winery', null, null, 'J. Hartley', 'Clean, cool harvest morning. Grapes in perfect condition. No botrytis observed on arrival.'],
      [FARM_ID, WBK.id, pBAC.id, 2024, '2024-10-01', 'Hand-picked — 6 kg lugs', 3900,  2.167, 6.000, 20.50, 3.18, 8.80, 11.90, 'Good',      false, 0, 'Estate winery', null, null, 'S. Hartley', 'Bacchus harvest slightly lower yield — drier July restricted berry set. Aromatics excellent.'],
      [FARM_ID, HFD.id, pSEY.id, 2024, '2024-10-08', 'Hand-picked — 6 kg lugs', 3640,  2.600, 8.089, 19.80, 3.15, 9.20, 11.50, 'Good',      true,  3, 'Estate winery', null, null, 'J. Hartley', '3% botrytis on tight interior bunches — sorted on picking table. Overall quality good.'],
      [FARM_ID, TFS.id, pCHD.id, 2023, '2023-10-02', 'Hand-picked — 6 kg lugs', 6810,  2.432, 8.012, 20.80, 3.24, 8.10, 12.10, 'Good',      false, 0, 'Estate winery', null, null, 'J. Hartley', 'Cool 2023 vintage. Extended hang time required. Good acidity — ideal for Traditional Method.'],
      [FARM_ID, MDS.id, pPN.id,  2023, '2023-09-29', 'Hand-picked — 6 kg lugs', 8920,  2.878, 7.433, 21.40, 3.29, 7.20, 12.40, 'Good',      false, 0, 'Estate winery', null, null, 'J. Hartley', 'Pinot Noir 2023 — balanced vintage. Good base wine character for rosé production.'],
      [FARM_ID, WBK.id, pBAC.id, 2023, '2023-10-06', 'Hand-picked — 6 kg lugs', 4250,  2.361, 6.538, 20.20, 3.21, 8.40, 11.70, 'Good',      false, 0, 'Estate winery', null, null, 'S. Hartley', '2023 Bacchus harvest — fully aromatic, clean. Exceptional sauvignon-like character this year.'],
      [FARM_ID, HFD.id, pSEY.id, 2023, '2023-10-14', 'Hand-picked — 6 kg lugs', 3840,  2.743, 8.533, 19.20, 3.12, 9.60, 11.20, 'Fair',      true,  8, 'Estate winery', null, null, 'J. Hartley', '8% botrytis 2023 — wet autumn. Secondary sort required. Still made a crisp, clean base wine.'],
    ];
    for (const r of harvests) {
      await db.execute(sql`
        INSERT INTO vineyard_harvest
          (farm_id, block_id, planting_id, vintage_year, harvest_date, harvest_method,
           yield_kg, yield_kg_per_vine, yield_tonnes_per_ha,
           brix, ph, titratable_acidity_gl, potential_alcohol,
           grape_condition, botrytis_present, botrytis_percentage,
           destination_winery_type, destination_winery, destination_winery_contact_id,
           operator_name, notes)
        VALUES (${r[0]},${r[1]},${r[2]},${r[3]},${r[4]},${r[5]},${r[6]},${r[7]},${r[8]},${r[9]},${r[10]},${r[11]},${r[12]},${r[13]},${r[14]},${r[15]},${r[16]},${r[17]},${r[18]},${r[19]},${r[20]})
      `);
    }
    console.log(`[VITICULTURE-SEED] ✓ ${harvests.length} harvest records created`);

    // ── 10. Soil Analysis ────────────────────────────────────────────────────
    await db.execute(sql`
      INSERT INTO vineyard_soil_analysis
        (farm_id, block_id, status, request_date, requested_by, analysis_type,
         collection_date, collected_by, dispatch_date, lab_name, sample_reference,
         results_received_date, analysis_date,
         ph, organic_matter_pct, phosphorus_mg_l, potassium_mg_l, magnesium_mg_l,
         calcium_mg_l, iron_mg_l, manganese_mg_l, boron_mg_l, nitrogen_mg_l, sulphur_mg_l,
         cec_cmol_kg, recommendations, notes)
      VALUES
        (${FARM_ID}, ${TFS.id}, 'complete', '2024-03-01', 'J. Hartley', 'Standard vineyard nutrient + pH',
         '2024-03-08', 'J. Hartley', '2024-03-10', 'NRM Laboratories', 'NRM-24-08421',
         '2024-03-24', '2024-03-22',
         7.2, 3.4, 42.0, 180.0, 85.0, 3200.0, 18.5, 12.2, 0.42, 4.8, 14.0,
         18.5, 'Potassium adequate. Magnesium on low side — consider foliar Epsom application pre-véraison. pH ideal for Chardonnay. No lime required.', 'Pre-season soil survey. Samples taken at 6 grid points, 0–30 cm depth.'),
        (${FARM_ID}, ${MDS.id}, 'complete', '2024-03-01', 'J. Hartley', 'Standard vineyard nutrient + pH',
         '2024-03-08', 'J. Hartley', '2024-03-10', 'NRM Laboratories', 'NRM-24-08422',
         '2024-03-24', '2024-03-22',
         7.4, 2.8, 38.0, 165.0, 72.0, 2900.0, 14.2, 9.8, 0.38, 4.2, 11.5,
         16.2, 'Magnesium deficiency likely — recommend 15 kg/ha kieserite March and foliar Mg spray at BBCH53. pH fine. K borderline — monitor post-season.', 'Sandy loam naturally lower CEC — nutrients leach faster. Irrigation mulch may help.')
    `);
    console.log("[VITICULTURE-SEED] ✓ 2 soil analysis records created");

    // ── 11. Winery Vessels ───────────────────────────────────────────────────
    const vesselsRes = await db.execute(sql`
      INSERT INTO winery_vessels
        (farm_id, vessel_ref, vessel_type, capacity_litres, material, year_purchased,
         manufacturer, location, current_contents, current_volume_litres, status, notes)
      VALUES
        (${FARM_ID}, 'T-01', 'stainless-tank', 5000,  'Stainless steel 316L',   2011, 'GEA Flex-Line',   'Main Cellar — Bay A', 'Highfield Blanc de Blancs 2024 base — Chardonnay',  4650.00, 'active', 'Variable-capacity floating lid. Temperature-controlled 12°C.'),
        (${FARM_ID}, 'T-02', 'stainless-tank', 5000,  'Stainless steel 316L',   2011, 'GEA Flex-Line',   'Main Cellar — Bay A', 'Highfield Pinot Noir Rosé 2024 base',               4820.00, 'active', 'As T-01. Used for rosé base and red production alternately.'),
        (${FARM_ID}, 'T-03', 'stainless-tank', 3000,  'Stainless steel 316L',   2015, 'GEA Flex-Line',   'Main Cellar — Bay B', 'Highfield Bacchus 2024',                            2980.00, 'active', 'Smaller vessel — used for aromatic whites requiring cold stabilisation.'),
        (${FARM_ID}, 'T-04', 'stainless-tank', 2000,  'Stainless steel 316L',   2015, 'GEA Flex-Line',   'Main Cellar — Bay B', 'Highfield Seyval Blanc 2024 base wine',             1920.00, 'active', 'Seyval Blanc and blending tank. Dual-valve for topping.'),
        (${FARM_ID}, 'T-05', 'stainless-tank', 10000, 'Stainless steel 316L',   2019, 'GEA Flex-Line',   'Main Cellar — Bay C', 'Empty — sanitised and sealed',                      null,    'active', 'Large tank — used for blending Traditional Method cuvées pre-bottling.'),
        (${FARM_ID}, 'B-01', 'oak-barrel',     225,   'French oak (Allier)',    2022, 'François Frères', 'Barrel Store',        'Chardonnay 2024 — barrel-fermented portion',         210.00, 'active', '1st fill. Medium+ toast. Used for 15% barrel-fermented component of Highfield Reserve Blanc.'),
        (${FARM_ID}, 'B-02', 'oak-barrel',     225,   'French oak (Bourgogne)', 2021, 'Taransaud',       'Barrel Store',        'Chardonnay 2023 — aged on lees through 2024',        185.00, 'active', '2nd fill. Moderate toast. Batonnage every 2 weeks through winter 2023–24.')
      RETURNING id, vessel_ref
    `);
    const vMap: Record<string, number> = {};
    (vesselsRes.rows as Array<{ id: number; vessel_ref: string }>).forEach(v => { vMap[v.vessel_ref] = v.id; });
    console.log("[VITICULTURE-SEED] ✓ 7 winery vessels created");

    // ── 12. Winery Batch Settings ────────────────────────────────────────────
    await db.execute(sql`
      INSERT INTO winery_batch_settings (farm_id, prefix, year_format, padding_digits, next_sequence)
      VALUES (${FARM_ID}, 'HF', 'YY', 3, 9)
      ON CONFLICT (farm_id) DO NOTHING
    `);

    // ── 13. Pressing Records 2024 & 2023 ────────────────────────────────────
    const pressingsRes = await db.execute(sql`
      INSERT INTO winery_pressing_records
        (farm_id, press_date, vintage_year, batch_ref, wine_colour, press_type,
         grapes_pressed_kg, free_run_litres, press_wine_litres, total_juice_litres, press_efficiency_l_per_kg,
         juice_brix, juice_ph, juice_ta_gl, juice_turbidity, free_run_separated,
         additions_at_press, settling_method, settling_vessel, settling_hours,
         is_organic, operator_name, notes)
      VALUES
        (${FARM_ID}, '2024-09-26', 2024, 'HF-24-001', 'Rosé',  'pneumatic-bladder', 9460,  4810, 1650, 6460, 0.683, 22.10, 3.30, 7.00, 'slight', true,  '50 mg/kg SO₂ at intake as KMS', 'static-cold', 'T-02', 18, false, 'J. Hartley', 'Pinot Noir whole-bunch pressed for rosé base. Free-run separated for premium rosé cuvée. Lightly pink — 90 min skin contact pre-press.'),
        (${FARM_ID}, '2024-09-28', 2024, 'HF-24-002', 'White', 'pneumatic-bladder', 7280,  4180, 980,  5160, 0.709, 21.60, 3.26, 7.70, 'slight', true,  '40 mg/kg SO₂ at intake as KMS', 'static-cold', 'T-01', 16, false, 'J. Hartley', 'Chardonnay whole-bunch. 15% (630 L) transferred to B-01 for barrel fermentation. Remainder to T-01.'),
        (${FARM_ID}, '2024-10-01', 2024, 'HF-24-003', 'White', 'pneumatic-bladder', 3900,  2350, 570,  2920, 0.749, 20.40, 3.17, 8.90, 'clear', true,  '30 mg/kg SO₂ at intake as KMS', 'static-cold', 'T-03', 14, false, 'S. Hartley', 'Bacchus pressed cold. Exceptional free-run clarity. Retained fruity aromatics. Minimum SO₂ protocol.'),
        (${FARM_ID}, '2024-10-08', 2024, 'HF-24-004', 'White', 'pneumatic-bladder', 3640,  2050, 590,  2640, 0.725, 19.70, 3.14, 9.30, 'slight', true,  '50 mg/kg SO₂ at intake as KMS', 'static-cold', 'T-04', 16, false, 'J. Hartley', 'Seyval Blanc — slightly higher SO₂ at press due to botrytis fraction (3%). Settled overnight. Good clean juice.'),
        (${FARM_ID}, '2023-09-29', 2023, 'HF-23-001', 'Rosé',  'pneumatic-bladder', 8920,  4560, 1540, 6100, 0.684, 21.20, 3.28, 7.30, 'slight', true,  '50 mg/kg SO₂ at intake as KMS', 'static-cold', null,   18, false, 'J. Hartley', '2023 Pinot Noir pressing for rosé base. Settled to T-02. Good colour extraction from skin contact.'),
        (${FARM_ID}, '2023-10-02', 2023, 'HF-23-002', 'White', 'pneumatic-bladder', 6810,  3920, 890,  4810, 0.706, 20.70, 3.23, 8.20, 'turbid',true,  '40 mg/kg SO₂ at intake as KMS', 'static-cold', null,   20, false, 'J. Hartley', '2023 Chardonnay — slightly turbid juice due to rain day before harvest. Extended settling 20h. Clarified well.'),
        (${FARM_ID}, '2023-10-06', 2023, 'HF-23-003', 'White', 'pneumatic-bladder', 4250,  2560, 620,  3180, 0.748, 20.10, 3.20, 8.50, 'clear', true,  '30 mg/kg SO₂ at intake as KMS', 'static-cold', null,   14, false, 'S. Hartley', '2023 Bacchus. Exceptional aromatic profile — cassis and elder. Clean pressing. To tank immediately post-settling.')
      RETURNING id, batch_ref
    `);
    const pMap: Record<string, number> = {};
    (pressingsRes.rows as Array<{ id: number; batch_ref: string }>).forEach(p => { pMap[p.batch_ref] = p.id; });
    console.log("[VITICULTURE-SEED] ✓ 7 pressing records created");

    // ── 14. Fermentation Records ─────────────────────────────────────────────
    await db.execute(sql`
      INSERT INTO winery_fermentation_records
        (farm_id, vintage_year, batch_ref, wine_colour, vessel_id, pressing_record_id,
         start_date, fermentation_type, yeast_strain, inoculation_date, inoculation_temp_c,
         start_brix, end_brix, end_date, end_sg, residual_sugar_gl,
         max_temp_c, min_temp_c, nutrient_additions, so2_at_fermentation_mg_l, so2_from_pressing,
         end_ph, end_ta_gl, volume_litres, operator_name, notes)
      VALUES
        (${FARM_ID}, 2024, 'HF-24-001', 'Rosé',  ${vMap['T-02']}, ${pMap['HF-24-001']}, '2024-09-28', 'inoculated', 'Lalvin EC-1118', '2024-09-28', 14.0, 22.10, -0.8, '2024-10-14', 0.9942, 2.10, 18.0, 11.0, 'Fermaid-O 20 g/hL at 1/3 depletion; DAP 10 g/hL at inoculation', 35.00, true,  3.22, 7.40, 4810.00, 'J. Hartley', 'Traditional Method base wine fermentation. Completed to near dryness. Cold-stabilised at 5°C for 7 days post-fermentation.'),
        (${FARM_ID}, 2024, 'HF-24-002', 'White', ${vMap['T-01']}, ${pMap['HF-24-002']}, '2024-10-01', 'inoculated', 'Lalvin CY3079',  '2024-10-01', 12.0, 21.60, -0.6, '2024-10-28', 0.9940, 1.80, 16.5, 10.0, 'Fermaid-O 20 g/hL at 1/3 depletion',                              30.00, true,  3.19, 7.80, 4530.00, 'J. Hartley', 'Tank Chardonnay — reductive style, retaining freshness and apple character. 15% barrel-fermented separately in B-01.'),
        (${FARM_ID}, 2024, 'HF-24-003', 'White', ${vMap['T-03']}, ${pMap['HF-24-003']}, '2024-10-04', 'inoculated', 'Oenoferm Freddo','2024-10-04', 10.0, 20.40, -0.4, '2024-10-26', 0.9938, 1.60, 14.0,  8.0, 'Fermaid-O 15 g/hL at 1/3 depletion',                              20.00, true,  3.12, 9.10, 2920.00, 'S. Hartley', 'Bacchus cold fermentation — preserving terpene aromatics. Oenoferm Freddo selected for aromatic enhancement under cool conditions.'),
        (${FARM_ID}, 2024, 'HF-24-004', 'White', ${vMap['T-04']}, ${pMap['HF-24-004']}, '2024-10-11', 'inoculated', 'Lalvin EC-1118', '2024-10-11', 12.0, 19.70, -0.5, '2024-10-30', 0.9939, 1.70, 16.0, 10.0, 'Fermaid-O 20 g/hL at 1/3 depletion; DAP 10 g/hL at inoculation', 35.00, true,  3.08, 9.50, 2640.00, 'J. Hartley', 'Seyval Blanc — neutral yeast for clean base wine character. Targeting high-acid Traditional Method reserve.'),
        (${FARM_ID}, 2023, 'HF-23-001', 'Rosé',  ${vMap['T-02']}, ${pMap['HF-23-001']}, '2023-10-02', 'inoculated', 'Lalvin EC-1118', '2023-10-02', 14.0, 21.20, -0.7, '2023-10-18', 0.9941, 1.90, 17.5, 11.0, 'Fermaid-O 20 g/hL; DAP 10 g/hL',                                 35.00, true,  3.21, 7.50, 4560.00, 'J. Hartley', '2023 vintage Pinot rosé base. Fermented to dry. Cold stabilised. Now on lees until tirage.'),
        (${FARM_ID}, 2023, 'HF-23-002', 'White', ${vMap['T-01']}, ${pMap['HF-23-002']}, '2023-10-06', 'inoculated', 'Lalvin CY3079',  '2023-10-06', 12.0, 20.70, -0.5, '2023-11-02', 0.9939, 1.80, 16.0, 10.0, 'Fermaid-O 20 g/hL',                                              30.00, true,  3.18, 8.30, 4810.00, 'J. Hartley', '2023 Chardonnay. Extended fermentation due to cool October temperatures. Fine — retained good character.')
    `);
    console.log("[VITICULTURE-SEED] ✓ 6 fermentation records created");

    // ── 15. SO₂ Tests ────────────────────────────────────────────────────────
    type So2Row = [number, string, number, string, string, number, string, string, null, null, null, number, number, number, boolean, number, number, string, string];
    const so2rows: So2Row[] = [
      [FARM_ID, '2024-11-05', 2024, 'HF-24-001', 'Rosé',  vMap['T-02'], 'post-fermentation', 'on-site-ripper', null, null, null, 18.0, 62.0, 200.0, true,  3.22, 7.40, 'Levels satisfactory. No adjustment required at this stage.',          'J. Hartley'],
      [FARM_ID, '2024-11-05', 2024, 'HF-24-002', 'White', vMap['T-01'], 'post-fermentation', 'on-site-ripper', null, null, null, 16.0, 58.0, 200.0, true,  3.19, 7.80, 'Free SO₂ slightly low — added 15 mg/L as Potassium Metabisulphite.',  'J. Hartley'],
      [FARM_ID, '2024-11-05', 2024, 'HF-24-003', 'White', vMap['T-03'], 'post-fermentation', 'on-site-ripper', null, null, null, 14.0, 45.0, 200.0, true,  3.12, 9.10, 'Low SO₂ — aromatic wine, deliberate low-SO₂ protocol. Topped with N₂.','S. Hartley'],
      [FARM_ID, '2024-02-12', 2023, 'HF-23-002', 'White', vMap['T-01'], 'pre-bottling',      'on-site-ripper', null, null, null, 28.0, 88.0, 200.0, true,  3.20, 8.10, 'Pre-bottling check. Target 30 mg/L free — adjusted up by 2 mg/L.',    'J. Hartley'],
      [FARM_ID, '2024-02-14', 2023, 'HF-23-003', 'White', vMap['T-03'], 'pre-bottling',      'on-site-ripper', null, null, null, 26.0, 72.0, 200.0, true,  3.16, 8.60, 'Bacchus — within target. No addition needed.',                        'S. Hartley'],
    ];
    for (const r of so2rows) {
      await db.execute(sql`
        INSERT INTO winery_so2_tests
          (farm_id, test_date, vintage_year, batch_ref, wine_colour, vessel_id,
           test_stage, test_method, equipment_id, lab_name, lab_ref,
           free_so2_mg_l, total_so2_mg_l, max_permitted_mg_l, so2_compliant, ph, titratable_acidity_gl,
           action_taken, operator_name)
        VALUES (${r[0]},${r[1]},${r[2]},${r[3]},${r[4]},${r[5]},${r[6]},${r[7]},${r[8]},${r[9]},${r[10]},${r[11]},${r[12]},${r[13]},${r[14]},${r[15]},${r[16]},${r[17]},${r[18]})
      `);
    }
    console.log(`[VITICULTURE-SEED] ✓ ${so2rows.length} SO₂ test records created`);

    // ── 16. Cellar Operations ────────────────────────────────────────────────
    type CellarRow = [number, string, number, string, string, number | null, number | null, number | null, number | null, null, null, string | null, number | null, number | null, number | null, null, null, null, null, null, string, string, string];
    const cellarOps: CellarRow[] = [
      [FARM_ID, '2024-11-08', 2024, 'HF-24-001-RK1', 'racking',            vMap['T-02'], null,         4810.00, 2.0,  null, null, null, null, 18.0, 24.0, null, null, null, null, null, 'Rosé',  'J. Hartley', 'First racking off gross lees. Lees depth 2 cm. Wine brilliant clarity post-racking. Batch: HF-24-001 (Pinot Noir Rosé base).'],
      [FARM_ID, '2024-11-10', 2024, 'HF-24-002-RK1', 'racking',            vMap['T-01'], null,         4530.00, 1.8,  null, null, null, null, 16.0, 28.0, null, null, null, null, null, 'White', 'J. Hartley', 'Chardonnay first racking. Creamy lees — excellent material for barrel work. Batch: HF-24-002.'],
      [FARM_ID, '2024-12-03', 2024, 'HF-24-002-SO1', 'sulfiting',          null,         null,         null,    null, null, null, 'Potassium Metabisulphite (KMS)', 25.0, 16.0, 31.0, null, null, null, null, null, 'White', 'J. Hartley', 'Free SO₂ adjustment on HF-24-002 (Chardonnay) — added 15 mg/L free. Achieved 31 mg/L free post-addition. Sealed under N₂.'],
      [FARM_ID, '2025-01-14', 2024, 'HF-24-001-CS1', 'cold-stabilisation', null,         null,         null,    null, null, null, null, null, null, null, null, null, null, null, null, 'Rosé',  'J. Hartley', 'Cold stabilisation on HF-24-001 (Pinot Rosé) — chilled to −2°C for 10 days. Crystals formed and removed. Tartrate stable confirmed by conductivity test.'],
      [FARM_ID, '2024-11-12', 2024, 'HF-24-003-RK1', 'racking',            vMap['T-03'], null,         2920.00, 1.2,  null, null, null, null, 14.0, 22.0, null, null, null, null, null, 'White', 'S. Hartley', 'Bacchus first racking. Wine bright, excellent aromatics retained. Very short lees contact — aromatic variety.'],
      [FARM_ID, '2023-12-18', 2023, 'HF-23-002-RK2', 'racking',            vMap['T-01'], vMap['T-05'], 4650.00, 1.5,  null, null, null, null, null, null, null, null, null, null, null, 'White', 'J. Hartley', '2023 Chardonnay — second racking, transferred to T-05 for blending trial with barrel component from B-02.'],
      [FARM_ID, '2024-01-20', 2023, 'HF-23-001-CS1', 'cold-stabilisation', null,         null,         null,    null, null, null, null, null, null, null, null, null, null, null, null, 'Rosé',  'J. Hartley', '2023 Pinot Rosé — cold stabilised Jan 2024 ahead of tirage bottling programme.'],
    ];
    for (const r of cellarOps) {
      await db.execute(sql`
        INSERT INTO winery_cellar_ops
          (farm_id, op_date, vintage_year, batch_ref, op_type,
           from_vessel_id, to_vessel_id, volume_moved_litres, lees_depth_cm,
           top_up_volume_litres, top_up_source,
           so2_product, so2_quantity_g, free_so2_before_mg_l, free_so2_after_mg_l,
           fining_agent, fining_dose, contact_time_hours, filter_type, filter_pore_um,
           wine_colour, operator_name, notes)
        VALUES (${r[0]},${r[1]},${r[2]},${r[3]},${r[4]},${r[5]},${r[6]},${r[7]},${r[8]},${r[9]},${r[10]},${r[11]},${r[12]},${r[13]},${r[14]},${r[15]},${r[16]},${r[17]},${r[18]},${r[19]},${r[20]},${r[21]},${r[22]})
      `);
    }
    console.log(`[VITICULTURE-SEED] ✓ ${cellarOps.length} cellar operations created`);

    // ── 17. Bottling Records (2023 vintage — complete) ───────────────────────
    await db.execute(sql`
      INSERT INTO winery_bottling_records
        (farm_id, bottling_date, vintage_year, batch_ref, lot_code, wine_colour,
         source_vessel_id, volume_bottled_litres, bottle_size_ml, bottles_produced, cases_produced,
         closure_type, cork_grade, label_batch,
         free_so2_mg_l, total_so2_mg_l, actual_abv_pct, residual_sugar_gl, ph, titratable_acidity_gl,
         is_organic, operator_name, notes)
      VALUES
        (${FARM_ID}, '2024-03-18', 2023, 'HF-23-002', 'LOT-24-0318-A', 'White', ${vMap['T-01']},
         3820.00, 750, 5093, 424, 'natural-cork', 'DIAM 3', 'LBL-CHD-2023-A',
         30.0, 92.0, 12.10, 2.20, 3.20, 8.10,
         false, 'J. Hartley', 'Highfield Estate Chardonnay 2023. Bottled March 2024. Label: Highfield Estate. Back label: English Wine PDO. Ready from August 2024.'),
        (${FARM_ID}, '2024-03-20', 2023, 'HF-23-001', 'LOT-24-0320-A', 'Rosé',  ${vMap['T-02']},
         4480.00, 750, 5973, 498, 'natural-cork', 'DIAM 3', 'LBL-ROS-2023-A',
         28.0, 88.0, 12.40, 2.80, 3.21, 7.50,
         false, 'J. Hartley', 'Highfield Estate Pinot Noir Rosé 2023. Bottled March 2024. Pale salmon. Strawberry and raspberry notes. Ready immediately.'),
        (${FARM_ID}, '2024-04-08', 2023, 'HF-23-003', 'LOT-24-0408-A', 'White', ${vMap['T-03']},
         2900.00, 750, 3867, 322, 'natural-cork', 'DIAM 3', 'LBL-BAC-2023-A',
         26.0, 78.0, 11.90, 4.10, 3.16, 8.60,
         false, 'S. Hartley', 'Highfield Estate Bacchus 2023. Elderflower, gooseberry and white peach. Slight residual to balance high TA. Ready from summer 2024.')
    `);
    console.log("[VITICULTURE-SEED] ✓ 3 bottling records created");

    // ── 18. Excise Return 2023 ───────────────────────────────────────────────
    await db.execute(sql`
      INSERT INTO winery_excise_returns
        (farm_id, hmrc_return_ref, period_start, period_end,
         opening_stock_l, closing_stock_l,
         total_litres_produced, total_litres_removed_uk, total_litres_exported,
         total_litres_domestic_consumption, total_litres_tastings,
         nominal_abv_pct, duty_rate_per_100_l, total_duty_payable,
         submitted_date, paid_date, status, small_producer_relief, annual_production_l, notes)
      VALUES
        (${FARM_ID}, 'HMRC-APR-2024-HF001', '2024-01-01', '2024-03-31',
         14200.00, 2900.00,
         0.00, 11100.00, 0.00, 180.00, 120.00,
         12.20, 244.72, 27163.92,
         '2024-04-15', '2024-04-20', 'submitted', true, 11200.00,
         'Q1 2024 return. Small Producer Relief (SPR) applied — annual production below 4,500 hL threshold. SPR rate at 12.0–14.5% ABV: £244.72/100L. All wine is still wine for duty purposes.')
    `);
    console.log("[VITICULTURE-SEED] ✓ 1 excise return created");

    // ── 19. Tasting Sessions ─────────────────────────────────────────────────
    await db.execute(sql`
      INSERT INTO winery_tasting_sessions
        (farm_id, session_date, session_type, session_name, visitor_count,
         wines_shown_count, volume_per_person_ml, total_volume_l,
         staff_name, ticket_price_gbp, revenue_gbp, notes)
      VALUES
        (${FARM_ID}, '2024-07-13', 'public-tour',  'Summer Saturday Vineyard Walk & Tasting',    18, 4, 150, 2.70, 'S. Hartley', 22.00, 396.00,  'Sold out. Walk through all 4 blocks then tasting of Bacchus 22, Rosé 23, Chardonnay 23 and tank sample of Chardonnay 24. Excellent feedback.'),
        (${FARM_ID}, '2024-07-20', 'public-tour',  'Summer Saturday Vineyard Walk & Tasting',    20, 4, 150, 3.00, 'S. Hartley', 22.00, 440.00,  'Full capacity. Waitlist of 8. Strong interest in wine club membership — 4 sign-ups on day.'),
        (${FARM_ID}, '2024-09-14', 'harvest-event','Harvest Festival Weekend — Saturday',         32, 5, 120, 3.84, 'J. Hartley', 35.00, 1120.00, 'Harvest weekend event. Guests assisted with hand-picking in Bacchus block. 5-wine tasting including rosé tank sample. Press viewing. Outstanding reviews on social media.'),
        (${FARM_ID}, '2024-09-15', 'harvest-event','Harvest Festival Weekend — Sunday',           28, 5, 120, 3.36, 'S. Hartley', 35.00, 980.00,  'Second day of harvest weekend. Slightly smaller group. Pinot Noir harvest pick for guests. Excellent cellar tour engagement.'),
        (${FARM_ID}, '2024-11-30', 'trade',        'Vineyard Magazine Trade Tasting',              8, 3, 100, 0.80, 'J. Hartley',  0.00,   0.00,  'Press and trade visit for editorial feature. Poured Bacchus 23, Rosé 23, Chardonnay 23. Outstanding feedback from MW in attendance.')
    `);
    console.log("[VITICULTURE-SEED] ✓ 5 tasting sessions created");

    // ── 20. Winery Licence ───────────────────────────────────────────────────
    await db.execute(sql`
      INSERT INTO winery_licences
        (farm_id, licence_number, licence_type, local_authority, dps_name,
         dps_personal_licence_number, dps_personal_licence_expiry,
         granted_date, review_date, conditions, status, notes)
      VALUES
        (${FARM_ID}, 'LA/2011/0042817', 'Premises Licence — On & Off Sales', 'East Sussex County Council',
         'James Hartley', 'PL-ESX-2018-4421', '2028-06-30',
         '2011-08-15', '2025-08-15',
         'No sales of alcohol after 10pm. Noise monitoring required for harvest events. Max 40 persons for ticketed events without additional consent.',
         'active',
         'Licence covers winery, cellar door and vineyard events. Annual review due August 2025. DPS requalification completed June 2023.')
    `);
    console.log("[VITICULTURE-SEED] ✓ 1 winery licence created");

    // ── 21. Bottling Machines ─────────────────────────────────────────────────
    const machinesRes = await db.execute(sql`
      INSERT INTO winery_bottling_machines (farm_id, machine_ref, machine_type, manufacturer, model, serial_number, commissioned_date, notes)
      VALUES
        (${FARM_ID}, 'FILLER-01', 'filler',   'Enos',         'Monobloc 8-8-1', 'EN-2019-00481', '2019-09-01', 'Gravity-fill monobloc: 8-head filler, 8-head rinser, 1-head corker. Rated to 1,200 bph at 750 ml. Used for all still wine runs.'),
        (${FARM_ID}, 'LABEL-01',  'labeller', 'PE Labellers', 'Alpha 8 WS',     'PE-2021-10291', '2021-03-15', 'Wrap-around labeller. Handles 330 ml–1.5 L. Dedicated to front + back + neck foil application.')
      RETURNING id, machine_ref
    `);
    const mMap: Record<string, number> = {};
    (machinesRes.rows as Array<{ id: number; machine_ref: string }>).forEach(m => { mMap[m.machine_ref] = m.id; });

    // CIP records for FILLER-01
    await db.execute(sql`
      INSERT INTO winery_bottling_machine_cleans (farm_id, machine_id, clean_date, timing, chemical_used, concentration_pct, contact_time_mins, temperature_c, rinse_confirmed, operator_name, notes)
      VALUES
        (${FARM_ID}, ${mMap['FILLER-01']}, '2024-09-25', 'pre-run',  'Diversol BX', 2.00, 20, 40.0, true,  'J. Hartley', 'Pre-bottling CIP before Pinot Noir rosé run (HF-24-001). Full circuit rinse confirmed.'),
        (${FARM_ID}, ${mMap['FILLER-01']}, '2024-09-27', 'pre-run',  'Diversol BX', 2.00, 20, 40.0, true,  'J. Hartley', 'Pre-bottling CIP before Chardonnay run (HF-24-002). Flushed with RO water post-sanitise.'),
        (${FARM_ID}, ${mMap['FILLER-01']}, '2024-10-07', 'post-run', 'Steri-7 Xtra', 1.50, 15, 25.0, true,  'S. Hartley', 'Post-run clean after Seyval Blanc bottling. All heads disassembled and soaked overnight.')
    `);

    // CIP records for LABEL-01
    await db.execute(sql`
      INSERT INTO winery_bottling_machine_cleans (farm_id, machine_id, clean_date, timing, chemical_used, concentration_pct, contact_time_mins, temperature_c, rinse_confirmed, operator_name, notes)
      VALUES
        (${FARM_ID}, ${mMap['LABEL-01']}, '2024-09-25', 'pre-run', 'IPA 70%',     70.00, 5,  20.0, true, 'J. Hartley', 'Wipe-down of label applicator rollers and glue heads before rosé run.'),
        (${FARM_ID}, ${mMap['LABEL-01']}, '2024-09-27', 'pre-run', 'IPA 70%',     70.00, 5,  20.0, true, 'J. Hartley', 'Pre-run wipe-down before Chardonnay labelling run.')
    `);

    // Maintenance records for FILLER-01
    await db.execute(sql`
      INSERT INTO winery_bottling_machine_maintenance (farm_id, machine_id, maintenance_date, maintenance_type, description, carried_out_by, next_service_due, notes)
      VALUES
        (${FARM_ID}, ${mMap['FILLER-01']}, '2024-01-15', 'planned-service', 'Annual factory service — filler valves reseated, drip tray gaskets replaced, all pneumatic seals inspected', 'Enos UK Service (contractor)', '2025-01-15', 'Full service certificate issued. All 8 filling valves inspected — 2 drip tray gaskets replaced. Next annual service booked for Jan 2025.'),
        (${FARM_ID}, ${mMap['FILLER-01']}, '2024-09-24', 'filter-change',   'Replaced in-line filtration cartridges (0.45 µm sterile membrane) ahead of harvest bottling season', 'J. Hartley',               '2025-03-24', 'Pre-harvest filter change as per annual protocol. New Pall Supor EX cartridges installed. Integrity test passed.')
    `);

    // Maintenance records for LABEL-01
    await db.execute(sql`
      INSERT INTO winery_bottling_machine_maintenance (farm_id, machine_id, maintenance_date, maintenance_type, description, carried_out_by, next_service_due, notes)
      VALUES
        (${FARM_ID}, ${mMap['LABEL-01']}, '2024-03-10', 'inspection',       'Annual inspection — glue head alignment checked, applicator roller surface assessed, label roll tension calibrated', 'PE Labellers UK (contractor)', '2025-03-10', 'Inspection certificate issued. Glue head nozzle diameter within tolerance. Label positioning ±0.3 mm — within spec.'),
        (${FARM_ID}, ${mMap['LABEL-01']}, '2024-09-22', 'nozzle-replacement','Front-label glue nozzle replaced after intermittent misfeed noted during pre-season test run', 'J. Hartley', null, 'Nozzle OEM part #PE-GL-007. Feed alignment re-calibrated post-replacement. Test run of 50 bottles — no further misfeed.')
    `);
    console.log("[VITICULTURE-SEED] ✓ 2 bottling machines + 5 CIP records + 4 maintenance entries created");

    await db.execute(sql`COMMIT`);
    console.log("[VITICULTURE-SEED] ✅ Viticulture demo data seeded successfully for Highfield Farm.");
    console.log("[VITICULTURE-SEED]    4 blocks · 4 plantings · 4 vine register entries · 10 phenology records");
    console.log("[VITICULTURE-SEED]    9 spray diary entries · 6 scouting records · 8 vineyard operations");
    console.log("[VITICULTURE-SEED]    8 harvest records (2023 + 2024) · 2 soil analyses");
    console.log("[VITICULTURE-SEED]    7 vessels · 7 pressing records · 6 fermentation records");
    console.log("[VITICULTURE-SEED]    5 SO₂ tests · 7 cellar ops · 3 bottling records · 1 excise return");
    console.log("[VITICULTURE-SEED]    5 tasting sessions · 1 winery licence");

  } catch (err) {
    await db.execute(sql`ROLLBACK`);
    const message = err instanceof Error ? err.message : String(err);
    console.error("[VITICULTURE-SEED] ✗ Seed failed — rolled back:", message);
    throw err;
  }
}
