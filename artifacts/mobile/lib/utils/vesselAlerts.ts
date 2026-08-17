/**
 * Shared barrel / vessel alert classification helpers.
 *
 * Single source of truth used by both the Record screen and the
 * useBarrelAlertCount hook — edit thresholds here only.
 */

/** Number of days a barrel must be empty before it is flagged as idle. */
export const IDLE_BARREL_DAYS = 90;

/** Fill number at which a barrel is considered to be approaching neutral oak influence. */
export const APPROACHING_NEUTRAL_FILLS = 4;

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
