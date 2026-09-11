export type YieldCrossTabCell = {
  kg: number | null | undefined;
  pickCount: number;
};

export type YieldCrossTabFooterRow = {
  areaHa: number | null | undefined;
  cells: Record<string, Pick<YieldCrossTabCell, "kg"> | null | undefined>;
};

export type YieldCrossTabFooterCell = {
  kg: number;
  tha: number | null;
};

/**
 * A single pick is only worth flagging when it produced a real yield.
 * Zero/null yields render as "—" and must remain unhighlighted.
 */
export function isSinglePickYieldCell(
  cell: YieldCrossTabCell | null | undefined,
): boolean {
  return cell != null && typeof cell.kg === "number" && cell.kg > 0 && cell.pickCount === 1;
}

/**
 * Calculate a vintage footer using only positive-yield blocks in the area
 * denominator. A recorded zero/null yield must not reduce the displayed t/ha.
 */
export function calculateYieldCrossTabFooter(
  vintage: string,
  rows: YieldCrossTabFooterRow[],
): YieldCrossTabFooterCell {
  let kg = 0;
  let areaHa = 0;

  for (const row of rows) {
    const cellKg = row.cells[vintage]?.kg;
    const positiveKg = typeof cellKg === "number" && Number.isFinite(cellKg) && cellKg > 0
      ? cellKg
      : 0;
    kg += positiveKg;
    if (positiveKg > 0 && typeof row.areaHa === "number" && Number.isFinite(row.areaHa) && row.areaHa > 0) {
      areaHa += row.areaHa;
    }
  }

  return {
    kg,
    tha: areaHa > 0 && kg > 0 ? kg / 1000 / areaHa : null,
  };
}