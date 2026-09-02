/**
 * Shared barrel / vessel alert classification helpers.
 *
 * Single source of truth used by both the Record screen and the
 * useBarrelAlertCount hook.
 *
 * Barrel thresholds are resolved in this order: farm override → platform
 * default (`barrel_idle_days_default` / `barrel_neutral_fills_default`) →
 * the hardcoded constants below. The constants protect offline and
 * unavailable-config cases.
 */

/** Final fallback: days a barrel must be empty before it is flagged as idle. */
export const IDLE_BARREL_DAYS = 90;

/** Final fallback: fill number at which a barrel is approaching neutral oak influence. */
export const APPROACHING_NEUTRAL_FILLS = 4;

/** Final fallback for total barrel maintenance spend before retirement. */
export const BARREL_RETIREMENT_THRESHOLD_PENCE = 60000;

/**
 * Mobile threshold fallback chain: farm override → platform default → hardcoded
 * constant. The platform default is supplied by the cached public config hook.
 */
export function resolveBarrelAlertThreshold(
  farmOverride: unknown,
  platformDefault: unknown,
  hardcodedFallback: number,
): number {
  for (const value of [farmOverride, platformDefault]) {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return hardcodedFallback;
}

/**
 * Resolves the retirement threshold using the same units and precedence as the
 * dashboard: farm override in GBP, then platform default in pence, then £600.
 */
export function resolveBarrelRetirementThresholdPence(
  farmOverrideGbp: unknown,
  platformDefaultPence: unknown,
): number {
  const farmGbp = Number(farmOverrideGbp);
  if (Number.isInteger(farmGbp) && farmGbp > 0) return farmGbp * 100;

  const platformPence = Number(platformDefaultPence);
  if (Number.isInteger(platformPence) && platformPence > 0) return platformPence;

  return BARREL_RETIREMENT_THRESHOLD_PENCE;
}

export function isBarrelType(vesselType: string | null): boolean {
  const t = (vesselType ?? "").toLowerCase();
  return t.includes("barrel") || t.includes("barrique");
}

export function isIdleBarrel(
  emptySince: string | null,
  idleBarrelDaysOverride?: number | null,
): boolean {
  if (!emptySince) return false;
  const threshold = idleBarrelDaysOverride ?? IDLE_BARREL_DAYS;
  const diffDays =
    (Date.now() - new Date(emptySince).getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > threshold;
}

export function isApproachingNeutral(
  fillNumber: number | null,
  approachingNeutralFillsOverride?: number | null,
): boolean {
  const threshold = approachingNeutralFillsOverride ?? APPROACHING_NEUTRAL_FILLS;
  return fillNumber != null && fillNumber >= threshold;
}
