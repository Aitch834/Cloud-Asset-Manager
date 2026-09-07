import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const apiBase = process.env.API_BASE_URL ?? "http://localhost:80/api";
const devBypass = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const testMarker = `barrel-clean-summary-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

type CandidateFarm = { farm_id: number; tenant_slug: string };
type SummaryRow = {
  vessel_id: number | string;
  clean_count: number | string;
  last_clean_date: string;
  last_contact_time_min: number | string | null;
  last_water_temp_c: number | string | null;
};

const candidates = await db.execute(sql`
  SELECT DISTINCT v.farm_id, t.slug AS tenant_slug
  FROM winery_vessels v
  JOIN farms f ON f.id = v.farm_id
  JOIN tenants t ON t.id = f.tenant_id
  WHERE LOWER(v.vessel_type) LIKE '%barrel%'
     OR LOWER(v.vessel_type) LIKE '%barrique%'
  ORDER BY v.farm_id
  LIMIT 1
`);

const farm = candidates.rows[0] as CandidateFarm | undefined;
if (!farm) throw new Error("The barrel cleaning summary test needs a farm with winery vessels.");

const createdVesselIds: number[] = [];
try {
  const vessels = await db.execute(sql`
    INSERT INTO winery_vessels (farm_id, vessel_ref, vessel_type, status, notes)
    VALUES
      (${farm.farm_id}, ${`${testMarker}-measured`}, 'Barrel', 'active', ${testMarker}),
      (${farm.farm_id}, ${`${testMarker}-blank`}, 'Barrel', 'active', ${testMarker})
    RETURNING id
  `);
  createdVesselIds.push(...vessels.rows.map(row => Number(row.id)));
  const [measuredVesselId, blankVesselId] = createdVesselIds;

  await db.execute(sql`
    INSERT INTO winery_vessel_cleans
      (farm_id, vessel_id, clean_date, clean_type, water_temp_c, contact_time_min, operator_name, notes)
    VALUES
      (${farm.farm_id}, ${measuredVesselId}, '2099-01-01', 'Test older', 40.5, 10, 'Regression test', ${testMarker}),
      (${farm.farm_id}, ${measuredVesselId}, '2099-01-02', 'Test latest', 71.5, 25, 'Regression test', ${testMarker}),
      (${farm.farm_id}, ${blankVesselId}, '2099-01-02', 'Test blank latest', NULL, NULL, 'Regression test', ${testMarker})
  `);

  const response = await fetch(
    `${apiBase}/farms/${farm.farm_id}/winery-vessels-clean-summary`,
    {
      headers: {
        "x-dev-bypass": devBypass,
        "x-tenant-slug": farm.tenant_slug,
      },
    },
  );
  if (!response.ok) throw new Error(`Cleaning summary request failed (${response.status}).`);

  const body = await response.json() as { records?: SummaryRow[] };
  const records = body.records ?? [];
  const measured = records.find(row => Number(row.vessel_id) === measuredVesselId);
  const blank = records.find(row => Number(row.vessel_id) === blankVesselId);

  if (!measured) throw new Error("Cleaning summary omitted the measured test vessel.");
  if (Number(measured.last_contact_time_min) !== 25 || Number(measured.last_water_temp_c) !== 71.5) {
    throw new Error("Cleaning summary did not return the latest clean's contact time and water temperature.");
  }
  if (!blank) throw new Error("Cleaning summary omitted the blank-measurement test vessel.");
  if (blank.last_contact_time_min !== null || blank.last_water_temp_c !== null) {
    throw new Error("Cleaning summary did not preserve blank latest-clean measurements as null.");
  }

  console.log("Barrel cleaning summary integration passed.");
} finally {
  await db.execute(sql`DELETE FROM winery_vessel_cleans WHERE notes = ${testMarker}`);
  await db.execute(sql`DELETE FROM winery_vessels WHERE notes = ${testMarker}`);
}