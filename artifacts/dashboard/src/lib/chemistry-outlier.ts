export type ChemistryOutlierStats = {
  mean: number;
  sd: number;
};

export const CHEMISTRY_CROSS_TAB_OUTLIER_CELL_STYLE =
  ";background:#fef3c7;color:#92400e;font-weight:600;-webkit-print-color-adjust:exact;print-color-adjust:exact";

export const CHEMISTRY_CROSS_TAB_OUTLIER_LEGEND =
  "&#9888; Amber cell = TA or Pot. Alc. vintage average deviates more than 1 standard deviation from the block&rsquo;s all-vintage average";

export function isChemistryCrossVintageOutlierMetric(metricLabel: string): boolean {
  return metricLabel === "Avg TA (g/L)" || metricLabel === "Avg Pot. Alc %";
}

/**
 * Calculates population statistics across the displayed vintage averages for
 * one block and one chemistry metric.
 *
 * This is intentionally different from the detailed harvest table, where the
 * comparison is between individual picks within one block/vintage group.
 */
export function buildChemistryCrossVintageStats(
  vintageAverages: number[],
): ChemistryOutlierStats | null {
  if (vintageAverages.length < 2) return null;

  const mean = vintageAverages.reduce((sum, value) => sum + value, 0) / vintageAverages.length;
  const sd = Math.sqrt(
    vintageAverages.reduce((sum, value) => sum + (value - mean) ** 2, 0) / vintageAverages.length,
  );
  return { mean, sd };
}

export function isChemistryCrossVintageOutlier(
  value: number | null,
  stats: ChemistryOutlierStats | null | undefined,
): boolean {
  return value != null
    && stats != null
    && stats.sd > 0
    && Math.abs(value - stats.mean) > stats.sd;
}