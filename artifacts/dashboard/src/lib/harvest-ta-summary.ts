export type HarvestTaRecord = {
  blockId: number | null;
  titratableAcidityGl: string | number | null;
};

export function getSeasonTaAverageFromBlockAverages(
  records: HarvestTaRecord[],
): number | null {
  const byBlock = new Map<number | "unknown", { sum: number; count: number }>();

  for (const record of records) {
    if (record.titratableAcidityGl == null || record.titratableAcidityGl === "") continue;

    const ta = Number(record.titratableAcidityGl);
    if (!Number.isFinite(ta)) continue;

    const key = record.blockId ?? "unknown";
    const block = byBlock.get(key) ?? { sum: 0, count: 0 };
    block.sum += ta;
    block.count += 1;
    byBlock.set(key, block);
  }

  const blockAverages = [...byBlock.values()].map(block => block.sum / block.count);
  if (blockAverages.length === 0) return null;

  return blockAverages.reduce((sum, average) => sum + average, 0) / blockAverages.length;
}