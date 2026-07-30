/**
 * Pure SO₂ summary helpers — no React/browser dependencies so they can be
 * unit-tested with Vitest in a Node environment.
 */

/**
 * Compute the cumulative cellar SO₂ contribution in mg/L by summing each
 * sulfiting operation's per-event dose rate independently:
 *
 *   Σ (so2_quantity_g[i] × 1000 / effectiveVolume[i])
 *
 * Volume priority per operation:
 *   1. vessel_capacity_litres — the actual stored capacity of the linked vessel
 *   2. volume_moved_litres    — the volume recorded on the op (fallback)
 *
 * Operations that lack any valid volume are excluded from the mg/L sum (they
 * still contribute to the gram total returned by totalG).
 * Invalid numeric values (NaN, zero or negative volumes) are skipped
 * defensively to prevent propagating garbage into the compliance indicator.
 *
 * @param ops — Array of cellar op rows (Record<string, unknown> compatible).
 * @returns { totalG, cumulativeMgL, volumeSource } — cumulativeMgL is null
 *          when no operation had a usable volume. volumeSource indicates which
 *          volume field(s) were used: "vessel" | "volume_moved" | "mixed" | null.
 */
export function sumCellarSo2(ops: Record<string, unknown>[]): {
  totalG: number;
  cumulativeMgL: number | null;
  volumeSource: "vessel" | "volume_moved" | "mixed" | null;
} {
  let totalG = 0;
  let cumulativeMgL: number | null = null;
  let usedVessel = false;
  let usedVolumeMoved = false;

  for (const op of ops) {
    const g = parseFloat(String(op.so2_quantity_g ?? ""));
    if (isNaN(g)) continue;
    totalG += g;

    // Prefer vessel capacity; fall back to volume moved
    const capacityRaw = op.vessel_capacity_litres;
    const capacity = capacityRaw != null ? parseFloat(String(capacityRaw)) : NaN;

    let vol: number;
    let sourceIsVessel: boolean;

    if (!isNaN(capacity) && capacity > 0) {
      vol = capacity;
      sourceIsVessel = true;
    } else {
      if (op.volume_moved_litres == null) continue;
      const moved = parseFloat(String(op.volume_moved_litres));
      if (isNaN(moved) || moved <= 0) continue;
      vol = moved;
      sourceIsVessel = false;
    }

    cumulativeMgL = (cumulativeMgL ?? 0) + (g * 1000) / vol;
    if (sourceIsVessel) usedVessel = true;
    else usedVolumeMoved = true;
  }

  let volumeSource: "vessel" | "volume_moved" | "mixed" | null = null;
  if (usedVessel && usedVolumeMoved) volumeSource = "mixed";
  else if (usedVessel) volumeSource = "vessel";
  else if (usedVolumeMoved) volumeSource = "volume_moved";

  return { totalG, cumulativeMgL, volumeSource };
}
