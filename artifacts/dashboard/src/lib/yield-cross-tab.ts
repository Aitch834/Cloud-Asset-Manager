export type YieldCrossTabCell = {
  kg: number | null | undefined;
  pickCount: number;
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