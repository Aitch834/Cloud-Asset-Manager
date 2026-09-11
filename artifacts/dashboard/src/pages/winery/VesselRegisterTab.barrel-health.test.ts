import { describe, expect, it } from "vitest";
import {
  BARREL_HEALTH_PRINT_HEADERS,
  buildBarrelCleaningColumns,
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
  it("prints retirement warnings from maintenance totals above and below the configured threshold", () => {
    const thresholdPence = 60_000;
    const printRows = buildBarrelHealthPrintRows(
      [
        { ...barrelWithNoFillHistory, id: 42, vessel_ref: "B-042" },
        { ...barrelWithNoFillHistory, id: 43, vessel_ref: "B-043" },
      ],
      5,
      thresholdPence,
      new Map([
        [42, thresholdPence + 1],
        [43, thresholdPence],
      ]),
    );
    const warningColumn = BARREL_HEALTH_PRINT_HEADERS.indexOf("Retirement Warning");

    expect(warningColumn).toBeGreaterThan(-1);
    expect(printRows.map(row => row[warningColumn])).toEqual(["Yes", "No"]);
  });

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

  it("keeps latest-clean measurements in fixed CSV columns, including blanks", () => {
    const columns = buildBarrelCleaningColumns(new Map([
      [42, {
        lastCleanDate: "07/09/2026",
        cleanCount: 3,
        lastContactTimeMin: "25",
        lastWaterTempC: "72.5",
      }],
      [43, {
        lastCleanDate: "06/09/2026",
        cleanCount: 1,
        lastContactTimeMin: "",
        lastWaterTempC: "",
      }],
    ]));

    expect(columns.map(column => column.label)).toEqual([
      "Last Clean Date",
      "Total Clean Count",
      "Contact Time (min)",
      "Water Temp (°C)",
    ]);
    expect(columns.map(column => column.fmt({ id: 42 }))).toEqual([
      "07/09/2026",
      "3",
      "25",
      "72.5",
    ]);
    expect(columns.map(column => column.fmt({ id: 43 }))).toEqual([
      "06/09/2026",
      "1",
      "",
      "",
    ]);
    expect(columns.map(column => column.fmt({ id: 44 }))).toEqual([
      "",
      "0",
      "",
      "",
    ]);
  });
});
