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

export function isIdleBarrel(emptySince: string | null): boolean {
  if (!emptySince) return false;
  const diffDays =
    (Date.now() - new Date(emptySince).getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > IDLE_BARREL_DAYS;
}

export function isApproachingNeutral(fillNumber: number | null): boolean {
  return fillNumber != null && fillNumber >= APPROACHING_NEUTRAL_FILLS;
}
