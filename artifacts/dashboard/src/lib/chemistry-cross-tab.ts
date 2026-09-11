export type ChemistryCrossTabRow = {
  bname: string;
  vintageCells: Array<number | null>;
  vintageCounts: number[];
  rowAvg: number | null;
};

export type ChemistryCrossTabSort = {
  col: string;
  dir: "asc" | "desc";
} | null;

export function sortChemistryCrossTabRows(
  rows: readonly ChemistryCrossTabRow[],
  sort: ChemistryCrossTabSort,
  uniqueVintages: readonly string[],
): ChemistryCrossTabRow[] {
  if (!sort) return [...rows].sort((a, b) => a.bname.localeCompare(b.bname));

  const direction = sort.dir === "asc" ? 1 : -1;
  const vintageIndex = uniqueVintages.indexOf(sort.col);

  return [...rows].sort((a, b) => {
    if (sort.col === "name") return a.bname.localeCompare(b.bname) * direction;

    const aValue = sort.col === "avg" ? a.rowAvg : a.vintageCells[vintageIndex];
    const bValue = sort.col === "avg" ? b.rowAvg : b.vintageCells[vintageIndex];
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    return (aValue - bValue) * direction;
  });
}

export function getChemistryThinAveragePresentation(
  value: number | null,
  pickCount: number,
) {
  const warned = value != null && pickCount === 1;
  return {
    warned,
    cellClassName: warned ? "bg-amber-50 text-amber-900" : "",
    mark: warned ? "*" : null,
    title: warned ? "Based on 1 pick — treat with caution" : undefined,
    ariaLabel: warned ? "Based on 1 pick" : undefined,
  };
}