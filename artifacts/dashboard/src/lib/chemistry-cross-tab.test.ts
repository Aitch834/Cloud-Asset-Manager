import { describe, expect, it } from "vitest";
import {
  getChemistryThinAveragePresentation,
  sortChemistryCrossTabRows,
  type ChemistryCrossTabRow,
  type ChemistryCrossTabSort,
} from "./chemistry-cross-tab";

const vintages = ["2024", "2025"];
const rows: ChemistryCrossTabRow[] = [
  {
    bname: "North",
    vintageCells: [18, 22],
    vintageCounts: [1, 2],
    rowAvg: 20,
  },
  {
    bname: "East",
    vintageCells: [null, 24],
    vintageCounts: [1, 1],
    rowAvg: 24,
  },
  {
    bname: "South",
    vintageCells: [20, 21],
    vintageCounts: [2, 2],
    rowAvg: 20.5,
  },
];

function warningSnapshot(sort: ChemistryCrossTabSort) {
  return sortChemistryCrossTabRows(rows, sort, vintages).map(row => ({
    block: row.bname,
    cells: row.vintageCells.map((value, index) => ({
      value,
      ...getChemistryThinAveragePresentation(value, row.vintageCounts[index] ?? 0),
    })),
  }));
}

describe("chemistry cross-tab thin-average warnings", () => {
  it.each([
    ["block", { col: "name", dir: "asc" } as const, ["East", "North", "South"]],
    ["vintage", { col: "2024", dir: "desc" } as const, ["South", "North", "East"]],
    ["Avg All", { col: "avg", dir: "desc" } as const, ["East", "South", "North"]],
  ])("keeps warning presentation with its block×vintage cell after sorting by %s", (_label, sort, order) => {
    const snapshot = warningSnapshot(sort);
    expect(snapshot.map(row => row.block)).toEqual(order);

    const north = snapshot.find(row => row.block === "North")!;
    expect(north.cells[0]).toMatchObject({
      value: 18,
      warned: true,
      cellClassName: "bg-amber-50 text-amber-900",
      mark: "*",
      title: "Based on 1 pick — treat with caution",
      ariaLabel: "Based on 1 pick",
    });
    expect(north.cells[1]).toMatchObject({
      value: 22,
      warned: false,
      cellClassName: "",
      mark: null,
    });

    const east = snapshot.find(row => row.block === "East")!;
    expect(east.cells[0]).toMatchObject({
      value: null,
      warned: false,
      cellClassName: "",
      mark: null,
    });
    expect(east.cells[0].title).toBeUndefined();
    expect(east.cells[0].ariaLabel).toBeUndefined();
    expect(east.cells[1]).toMatchObject({ value: 24, warned: true, mark: "*" });
  });
});