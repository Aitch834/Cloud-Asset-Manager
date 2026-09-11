export type HarvestBlockSummaryRow = {
  name: string;
};

const NUMERIC_SUMMARY_COLUMNS = new Set([
  "totalYieldKg",
  "derivedTha",
  "avgBrix",
  "avgPh",
  "avgTa",
  "avgPa",
]);

/**
 * Returns the first named block from rows already ordered by the active
 * summary sort. The administrative unlinked bucket is never badge-eligible.
 */
export function getTopHarvestSummaryBlockName(
  sortedRows: readonly HarvestBlockSummaryRow[],
  sortColumn: string,
): string | null {
  if (!NUMERIC_SUMMARY_COLUMNS.has(sortColumn)) return null;
  return sortedRows.find(row => row.name !== "Not linked")?.name ?? null;
}