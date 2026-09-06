export const CHEMISTRY_SPREAD_THRESHOLDS = {
  ta: 1.5,
  potentialAlcohol: 1.0,
} as const;

export type ChemistrySpreadWarning = {
  blockId: string;
  blockName: string;
  taSd: number | null;
  potentialAlcoholSd: number | null;
};

function getPopulationStandardDeviation(values: number[]) {
  if (values.length === 0) return null;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
}

export function getChemistrySpreadWarnings(
  rows: Record<string, unknown>[],
  blocks: Record<string, unknown>[],
): ChemistrySpreadWarning[] {
  const rowsByBlock = new globalThis.Map<string, Record<string, unknown>[]>();
  for (const row of rows) {
    if (row.blockId == null || row.blockId === "") continue;
    const blockKey = String(row.blockId);
    const blockRows = rowsByBlock.get(blockKey) ?? [];
    blockRows.push(row);
    rowsByBlock.set(blockKey, blockRows);
  }

  return [...rowsByBlock.entries()]
    .map(([blockId, blockRows]) => {
      const taValues = blockRows
        .map(row => parseFloat(String(row.titratableAcidityGl ?? "")))
        .filter(value => !isNaN(value));
      const potentialAlcoholValues = blockRows
        .map(row => parseFloat(String(row.potentialAlcohol ?? "")))
        .filter(value => !isNaN(value));
      const taSd = getPopulationStandardDeviation(taValues);
      const potentialAlcoholSd = getPopulationStandardDeviation(potentialAlcoholValues);
      return {
        blockId,
        blockName: String(blocks.find(block => String(block.id) === blockId)?.blockName ?? blockId),
        taSd: taSd != null && taSd > CHEMISTRY_SPREAD_THRESHOLDS.ta ? taSd : null,
        potentialAlcoholSd: potentialAlcoholSd != null && potentialAlcoholSd > CHEMISTRY_SPREAD_THRESHOLDS.potentialAlcohol
          ? potentialAlcoholSd
          : null,
      };
    })
    .filter(warning => warning.taSd != null || warning.potentialAlcoholSd != null)
    .sort((a, b) => a.blockName.localeCompare(b.blockName));
}