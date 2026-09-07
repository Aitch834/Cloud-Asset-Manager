import { describe, expect, it } from "vitest";
import {
  BARREL_HEALTH_PRINT_HEADERS,
  buildBarrelHealthColumns,
  buildBarrelHealthPrintRows,
} from "./VesselRegisterTab";

const barrelWithNoFillHistory = {
  id: 42,
  vessel_ref: "B-042",
  vessel_type: "Barrel",
  cellar_zone: "North cellar",
  fill_count: 0,
  maintenance_count: 0,
  is_full: false,
};

describe("barrel health exports", () => {
  it("keeps print headers and row values aligned with the CSV columns", () => {
    expect(BARREL_HEALTH_PRINT_HEADERS).toEqual([
      "Vessel Ref",
      "Type",
      "Cellar Zone",
      "Fill No.",
      "Fill Count",
      "Fill Tier",
      "Is Full",
      "Empty Since",
      "Idle Days",
      "Last Activity",
      "Approaching Neutral",
      "Retirement Warning",
      "Last Clean Date",
    ]);
    expect(BARREL_HEALTH_PRINT_HEADERS.indexOf("Fill Count"))
      .toBe(BARREL_HEALTH_PRINT_HEADERS.indexOf("Fill No.") + 1);
    expect(BARREL_HEALTH_PRINT_HEADERS.indexOf("Fill Count"))
      .toBe(BARREL_HEALTH_PRINT_HEADERS.indexOf("Fill Tier") - 1);

    const printRows = buildBarrelHealthPrintRows(
      [barrelWithNoFillHistory],
      5,
      60000,
      new Map(),
    );
    expect(printRows[0]).toEqual([
      "B-042",
      "Barrel",
      "North cellar",
      "—",
      "0",
      "No records at all",
      "No",
      "—",
      "—",
      "Never",
      "No",
      "No",
      "—",
    ]);

    const csvColumns = buildBarrelHealthColumns(5);
    expect(csvColumns.slice(3, 6).map(column => column.label)).toEqual([
      "Fill Number",
      "Fill Count",
      "Fill Tier",
    ]);
    expect(csvColumns.slice(3, 6).map(column => column.fmt(barrelWithNoFillHistory))).toEqual([
      "",
      "0",
      "No records at all",
    ]);
  });
});