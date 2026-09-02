export type HarvestPrintBlockSummary = {
  key: string;
  blockId: number | null;
  label: string;
  totalKg: number;
};

/**
 * Select the linked block with the greatest positive harvest yield.
 * Invalid, unlinked, and zero-yield rows cannot be top performers.
 */
export function getTopHarvestBlockKey(
  rows: readonly HarvestPrintBlockSummary[],
): string | null {
  return rows
    .filter(row =>
      typeof row.blockId === "number"
      && Number.isFinite(row.blockId)
      && row.blockId > 0
      && row.totalKg > 0
    )
    .slice()
    .sort((a, b) => {
      const yieldDifference = b.totalKg - a.totalKg;
      return yieldDifference !== 0
        ? yieldDifference
        : a.label.localeCompare(b.label);
    })[0]?.key ?? null;
}