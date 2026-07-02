/**
 * Black-grass "Five-in-Five" cultural control scoring.
 *
 * Scores a field's rotation over its last 5 recorded seasons against the five
 * recognised cultural control pillars for black-grass (and other grass-weed)
 * resistance management:
 *   1. Rotational ploughing      — primary inversion cultivation used that season
 *   2. Delayed autumn drilling   — drilling after a "stale seedbed" cut-off date
 *   3. Spring cropping           — a spring-sown crop breaks the autumn germination window
 *   4. Higher seed rate          — denser crop competition suppresses black-grass
 *   5. Fallow / cover crop       — a "reset" season with no autumn cash crop
 *
 * Also flags herbicide mode-of-action (MOA/HRAC group) repetition risk, since
 * repeating the same MOA on grass weeds year after year accelerates resistance.
 *
 * All inputs are read from data farmers already record (crop assignments,
 * field operations, seed drilling records, land use, spray applications) — no
 * separate data entry is required to compute a score, beyond optionally
 * flagging herbicide products with their MOA group and marking risk fields.
 */
import { db, fieldCropAssignmentsTable, fieldSeasonLandUseTable, seedDrillingRecordsTable, fieldOperationsTable, sprayApplicationsTable, sprayProductsTable, fieldsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

const PLOUGHING_OPERATION_TYPES = new Set(["ploughing", "subsoiling", "mole_ploughing"]);
const FALLOW_LAND_USE_KEYWORDS = ["fallow", "sfi", "stewardship", "cover crop", "cover_crop"];
// A conventional benchmark seed rate for winter wheat in the UK is ~180kg/ha;
// black-grass guidance recommends pushing well above this to boost crop competition.
const HIGHER_SEED_RATE_THRESHOLD_KG_HA = 220;
// Drilling after this month/day in the autumn window is considered "delayed"
// (lets an extra stale-seedbed flush of black-grass be sprayed off pre-drilling).
const DELAYED_DRILLING_CUTOFF_MONTH = 10; // October (1-indexed)
const DELAYED_DRILLING_CUTOFF_DAY = 1;
const SEASONS_WINDOW = 5;
const MOA_REPETITION_RISK_YEARS = 3;

export type PillarKey = "ploughing" | "delayedDrilling" | "springCropping" | "higherSeedRate" | "fallowCover";

export interface SeasonPillarResult {
  year: number;
  season: string | null;
  pillars: Record<PillarKey, boolean>;
  pillarsUsedCount: number;
  herbicideMoaGroupsUsed: string[];
}

export interface FieldFiveInFiveScore {
  fieldId: number;
  fieldName: string;
  blackgrassRiskField: boolean;
  seasons: SeasonPillarResult[];
  distinctPillarsUsed: PillarKey[];
  distinctPillarCount: number;
  moaRepetitionRisk: boolean;
  moaRepeatedGroup: string | null;
}

function isSpringSeason(season: string | null): boolean {
  return !!season && /spring/i.test(season);
}

function isFallowLandUse(landUse: string): boolean {
  const lower = landUse.toLowerCase();
  return FALLOW_LAND_USE_KEYWORDS.some((kw) => lower.includes(kw));
}

function isDelayedDrilling(drillingDate: Date, season: string | null): boolean {
  // Delayed-drilling only meaningfully applies to autumn/winter cropping —
  // spring crops are drilled in spring regardless and shouldn't be penalised.
  if (isSpringSeason(season)) return false;
  const month = drillingDate.getMonth() + 1;
  const day = drillingDate.getDate();
  if (month > DELAYED_DRILLING_CUTOFF_MONTH) return true;
  if (month === DELAYED_DRILLING_CUTOFF_MONTH && day >= DELAYED_DRILLING_CUTOFF_DAY) return true;
  return false;
}

/**
 * Computes the Five-in-Five pillar score for a single field, looking back
 * across its last SEASONS_WINDOW distinct (year, season) crop assignments.
 */
export async function computeFieldFiveInFiveScore(farmId: number, fieldId: number): Promise<FieldFiveInFiveScore | null> {
  const [field] = await db.select().from(fieldsTable).where(and(eq(fieldsTable.id, fieldId), eq(fieldsTable.farmId, farmId)));
  if (!field) return null;

  const assignments = await db
    .select()
    .from(fieldCropAssignmentsTable)
    .where(eq(fieldCropAssignmentsTable.fieldId, fieldId))
    .orderBy(desc(fieldCropAssignmentsTable.year))
    .limit(SEASONS_WINDOW);

  const landUseRecords = await db
    .select()
    .from(fieldSeasonLandUseTable)
    .where(and(eq(fieldSeasonLandUseTable.fieldId, fieldId), eq(fieldSeasonLandUseTable.farmId, farmId)))
    .orderBy(desc(fieldSeasonLandUseTable.year))
    .limit(SEASONS_WINDOW);

  const years = new Set<number>();
  for (const a of assignments) if (a.year != null) years.add(a.year);
  for (const l of landUseRecords) years.add(l.year);
  const seasonYears = Array.from(years).sort((a, b) => b - a).slice(0, SEASONS_WINDOW);

  const operations = await db.select().from(fieldOperationsTable).where(eq(fieldOperationsTable.fieldId, fieldId));
  const drillingRecords = await db.select().from(seedDrillingRecordsTable).where(eq(seedDrillingRecordsTable.fieldId, fieldId));
  const applications = await db
    .select({
      applicationDate: sprayApplicationsTable.applicationDate,
      herbicideMoaGroup: sprayProductsTable.herbicideMoaGroup,
      category: sprayProductsTable.category,
    })
    .from(sprayApplicationsTable)
    .innerJoin(sprayProductsTable, eq(sprayApplicationsTable.productId, sprayProductsTable.id))
    .where(eq(sprayApplicationsTable.fieldId, fieldId));

  const seasons: SeasonPillarResult[] = seasonYears.map((year) => {
    const assignment = assignments.find((a) => a.year === year);
    const landUse = landUseRecords.filter((l) => l.year === year);
    const season = assignment?.season ?? landUse[0]?.season ?? null;

    const yearOps = operations.filter((o) => o.operationDate.getFullYear() === year);
    const ploughing = yearOps.some((o) => PLOUGHING_OPERATION_TYPES.has(o.operationType));

    const yearDrilling = drillingRecords.filter((d) => d.drillingDate.getFullYear() === year);
    const delayedDrilling = yearDrilling.some((d) => isDelayedDrilling(d.drillingDate, season));
    const higherSeedRate = yearDrilling.some((d) => {
      const rate = d.seedRate != null ? parseFloat(String(d.seedRate)) : null;
      return rate != null && !isNaN(rate) && rate >= HIGHER_SEED_RATE_THRESHOLD_KG_HA;
    }) || (assignment?.seedRate != null && parseFloat(String(assignment.seedRate)) >= HIGHER_SEED_RATE_THRESHOLD_KG_HA);

    const springCropping = isSpringSeason(season);
    const fallowCover = landUse.some((l) => isFallowLandUse(l.landUse));

    const yearApplications = applications.filter((a) => a.applicationDate.getFullYear() === year);
    const herbicideMoaGroupsUsed = Array.from(
      new Set(
        yearApplications
          .filter((a) => a.category?.toLowerCase() === "herbicide" && a.herbicideMoaGroup)
          .map((a) => a.herbicideMoaGroup as string)
      )
    );

    const pillars: Record<PillarKey, boolean> = {
      ploughing,
      delayedDrilling,
      springCropping,
      higherSeedRate,
      fallowCover,
    };

    return {
      year,
      season,
      pillars,
      pillarsUsedCount: Object.values(pillars).filter(Boolean).length,
      herbicideMoaGroupsUsed,
    };
  });

  const distinctPillarsUsed = (Object.keys(seasons[0]?.pillars ?? {
    ploughing: false, delayedDrilling: false, springCropping: false, higherSeedRate: false, fallowCover: false,
  }) as PillarKey[]).filter((key) => seasons.some((s) => s.pillars[key]));

  // MOA repetition risk: same single MOA group used as the *only* herbicide
  // group on this field for MOA_REPETITION_RISK_YEARS or more consecutive
  // seasons (seasons are already sorted most-recent-first).
  let moaRepetitionRisk = false;
  let moaRepeatedGroup: string | null = null;
  let streakGroup: string | null = null;
  let streakLength = 0;
  for (const s of seasons) {
    const singleGroup = s.herbicideMoaGroupsUsed.length === 1 ? s.herbicideMoaGroupsUsed[0] : null;
    if (singleGroup && singleGroup === streakGroup) {
      streakLength += 1;
    } else if (singleGroup) {
      streakGroup = singleGroup;
      streakLength = 1;
    } else {
      streakGroup = null;
      streakLength = 0;
    }
    if (streakLength >= MOA_REPETITION_RISK_YEARS) {
      moaRepetitionRisk = true;
      moaRepeatedGroup = streakGroup;
      break;
    }
  }

  return {
    fieldId: field.id,
    fieldName: field.name,
    blackgrassRiskField: field.blackgrassRiskField,
    seasons,
    distinctPillarsUsed,
    distinctPillarCount: distinctPillarsUsed.length,
    moaRepetitionRisk,
    moaRepeatedGroup,
  };
}

export interface FarmFiveInFiveSummary {
  totalRiskFields: number;
  fieldsMeetingTarget: number;
  targetPillarCount: number;
  fields: FieldFiveInFiveScore[];
}

/**
 * Farm-wide rollup across all fields flagged as black-grass risk fields —
 * intended for the Season Reports summary card.
 */
export async function computeFarmFiveInFiveSummary(farmId: number, targetPillarCount = 3): Promise<FarmFiveInFiveSummary> {
  const riskFields = await db.select().from(fieldsTable).where(and(eq(fieldsTable.farmId, farmId), eq(fieldsTable.blackgrassRiskField, true), eq(fieldsTable.isActive, true)));

  const fields: FieldFiveInFiveScore[] = [];
  for (const f of riskFields) {
    const score = await computeFieldFiveInFiveScore(farmId, f.id);
    if (score) fields.push(score);
  }

  const fieldsMeetingTarget = fields.filter((f) => f.distinctPillarCount >= targetPillarCount).length;

  return {
    totalRiskFields: fields.length,
    fieldsMeetingTarget,
    targetPillarCount,
    fields,
  };
}
