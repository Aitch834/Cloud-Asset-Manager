// ─── pH & TA stage summary — single source of truth ───────────────────────────
// The on-screen batch-trail panel, the printed batch-trail PDF and the batch-trail
// CSV export all derive their pH/TA stage progression from these helpers. Any
// change to the stage logic (new stage, different dedup/sort rule) is made here
// once and every output picks it up together — they can no longer drift apart.
//
// Model:
// - Three primary stages come from the pressing record (juice_ph / juice_ta_gl),
//   the latest fermentation end readings (end_ph / end_ta_gl, most recent
//   end_date) and the latest bottling readings (ph / titratable_acidity_gl,
//   most recent bottling_date).
// - SO₂ test readings (most recent test per stage) supplement the primary
//   stages: they fill null pH/TA on existing stages and add extra stages
//   (post-racking, pre-bottling, other) of their own.

export const PH_TA_STAGE_ORDER = [
  "at-pressing",
  "post-fermentation",
  "post-racking",
  "pre-bottling",
  "at-bottling",
  "other",
] as const;
export type PhTaStageKey = (typeof PH_TA_STAGE_ORDER)[number];

export interface PhTaReading {
  ph: number | null;
  ta: number | null;
}

export interface PhTaPrimaryStages {
  /** Pressing juice readings */
  pressing: PhTaReading;
  /** Latest fermentation end readings */
  fermentation: PhTaReading;
  /** Latest bottling readings */
  bottling: PhTaReading;
}

export interface PhTaStagePoint extends PhTaReading {
  key: PhTaStageKey;
}

type Rec = Record<string, unknown>;

const num = (v: unknown): number | null => (v == null ? null : parseFloat(String(v)));

/**
 * Extract the three primary-source stage readings:
 * pressing juice, latest fermentation end, latest bottling.
 */
export function computePrimaryPhTa(pressing: Rec, fermentation: Rec[], bottling: Rec[]): PhTaPrimaryStages {
  const fermWithPh = [...fermentation]
    .filter(r => r.end_ph != null || r.end_ta_gl != null)
    .sort((a, b) => (a.end_date && b.end_date ? new Date(String(b.end_date)).getTime() - new Date(String(a.end_date)).getTime() : 0));
  const fermRecord = fermWithPh[0] ?? null;

  const bottlingWithPh = [...bottling]
    .filter(r => r.ph != null || r.titratable_acidity_gl != null)
    .sort((a, b) => (a.bottling_date && b.bottling_date ? new Date(String(b.bottling_date)).getTime() - new Date(String(a.bottling_date)).getTime() : 0));
  const bottlingRecord = bottlingWithPh[0] ?? null;

  return {
    pressing:     { ph: num(pressing.juice_ph), ta: num(pressing.juice_ta_gl) },
    fermentation: { ph: num(fermRecord?.end_ph), ta: num(fermRecord?.end_ta_gl) },
    bottling:     { ph: num(bottlingRecord?.ph), ta: num(bottlingRecord?.titratable_acidity_gl) },
  };
}

/**
 * Most recent pH/TA reading per SO₂ test stage (tests with neither value are skipped).
 */
export function so2TestReadingsByStage(so2Tests: Rec[]): Partial<Record<PhTaStageKey, PhTaReading>> {
  const byStage: Partial<Record<PhTaStageKey, PhTaReading>> = {};
  const sorted = [...so2Tests].sort((a, b) =>
    new Date(String(b.test_date ?? "0")).getTime() - new Date(String(a.test_date ?? "0")).getTime()
  );
  for (const t of sorted) {
    const stageKey = String(t.test_stage ?? "") as PhTaStageKey;
    if (!stageKey || byStage[stageKey]) continue; // keep most recent only
    const tPh = num(t.ph);
    const tTa = num(t.titratable_acidity_gl);
    if (tPh == null && tTa == null) continue;
    byStage[stageKey] = { ph: tPh, ta: tTa };
  }
  return byStage;
}

/**
 * Ordered stage points for the pH & TA analytical history.
 *
 * Merges the three primary stages with SO₂ test readings (when provided):
 * tests fill nulls on existing stages and add new stages of their own.
 * Only stages with at least one value are returned, in PH_TA_STAGE_ORDER.
 */
export function computePhTaStagePoints(primary: PhTaPrimaryStages, so2Tests?: Rec[]): PhTaStagePoint[] {
  const stagePoints: Partial<Record<PhTaStageKey, PhTaReading>> = {
    "at-pressing":       { ...primary.pressing },
    "post-fermentation": { ...primary.fermentation },
    "at-bottling":       { ...primary.bottling },
  };

  if (so2Tests && so2Tests.length > 0) {
    const byStage = so2TestReadingsByStage(so2Tests);
    for (const stageKey of PH_TA_STAGE_ORDER) {
      const test = byStage[stageKey];
      if (!test) continue;
      const existing = stagePoints[stageKey];
      if (existing) {
        // Supplement only where the primary source has no value
        if (existing.ph == null) existing.ph = test.ph;
        if (existing.ta == null) existing.ta = test.ta;
      } else {
        stagePoints[stageKey] = { ph: test.ph, ta: test.ta };
      }
    }
  }

  return PH_TA_STAGE_ORDER
    .filter(k => stagePoints[k] && (stagePoints[k]!.ph != null || stagePoints[k]!.ta != null))
    .map(k => ({ key: k, ph: stagePoints[k]!.ph, ta: stagePoints[k]!.ta }));
}
