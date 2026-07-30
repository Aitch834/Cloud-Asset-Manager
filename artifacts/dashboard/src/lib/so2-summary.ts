/**
 * Pure SO₂ summary helpers — no React/browser dependencies so they can be
 * unit-tested with Vitest in a Node environment.
 */

/**
 * Compute the cumulative cellar SO₂ contribution in mg/L by summing each
 * sulfiting operation's per-event dose rate independently:
 *
 *   Σ (so2_quantity_g[i] × 1000 / volume_moved_litres[i])
 *
 * Operations that lack a valid volume are excluded from the mg/L sum (they
 * still contribute to the gram total returned by totalG).
 * Invalid numeric values (NaN, zero or negative volumes) are skipped
 * defensively to prevent propagating garbage into the compliance indicator.
 *
 * @param ops — Array of cellar op rows (Record<string, unknown> compatible).
 * @returns { totalG, cumulativeMgL } — cumulativeMgL is null when no operation
 *          had a usable volume.
 */
export function sumCellarSo2(ops: Record<string, unknown>[]): {
  totalG: number;
  cumulativeMgL: number | null;
} {
  let totalG = 0;
  let cumulativeMgL: number | null = null;

  for (const op of ops) {
    const g = parseFloat(String(op.so2_quantity_g ?? ""));
    if (isNaN(g)) continue;
    totalG += g;

    if (op.volume_moved_litres == null) continue;
    const vol = parseFloat(String(op.volume_moved_litres ?? ""));
    if (isNaN(vol) || vol <= 0) continue;

    cumulativeMgL = (cumulativeMgL ?? 0) + (g * 1000) / vol;
  }

  return { totalG, cumulativeMgL };
}
