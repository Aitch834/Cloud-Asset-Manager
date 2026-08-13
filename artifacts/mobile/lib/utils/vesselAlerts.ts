/**
 * Shared barrel / vessel alert classification helpers.
 *
 * Single source of truth used by both the Record screen and the
 * useBarrelAlertCount hook — edit thresholds here only.
 */

export function isBarrelType(vesselType: string | null): boolean {
  const t = (vesselType ?? "").toLowerCase();
  return t.includes("barrel") || t.includes("barrique");
}

export function isIdleBarrel(emptySince: string | null): boolean {
  if (!emptySince) return false;
  const diffDays =
    (Date.now() - new Date(emptySince).getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > 90;
}

export function isApproachingNeutral(fillNumber: number | null): boolean {
  return fillNumber != null && fillNumber >= 4;
}
