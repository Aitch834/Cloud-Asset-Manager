import { describe, expect, it } from "vitest";
import {
  BARREL_HEALTH_PRINT_HEADERS,
  buildBarrelCleaningColumns,
  buildBarrelHealthColumns,
  buildBarrelHealthPrintRows,
  exportFullVesselRegisterCsv,
  runFullVesselRegisterCsvExport,
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

describe("full vessel register CSV", () => {
  it("sums cooperage work types in pounds and leaves non-barrel costs blank", async () => {
    const rows = [
      { id: 7, vessel_ref: "B-007", vessel_type: "Oak barrel" },
      { id: 8, vessel_ref: "T-008", vessel_type: "Stainless steel tank" },
    ];
    let captured: {
      rows: Record<string, unknown>[];
      filename: string;
      columns: Array<{ label: string; fmt?: (record: Record<string, unknown>) => string }>;
    } | undefined;

    await exportFullVesselRegisterCsv({
      rows,
      farmName: "Test Vineyard",
      loadMaintenanceSummary: async () => ({
        records: [
          { vessel_id: 7, work_type: "Hoop replacement", total_pence: 1250 },
          { vessel_id: 7, work_type: "Recharring", total_pence: 875 },
          { vessel_id: 8, work_type: "Repair", total_pence: 9999 },
        ],
      }),
      exportCsv: (exportRows, filename, columns) => {
        captured = { rows: exportRows, filename, columns };
      },
    });

    expect(captured?.rows).toBe(rows);
    expect(captured?.filename).toBe("vessels.csv");
    const cooperageColumn = captured?.columns.find(column => column.label === "Total Cooperage Cost (£)");
    expect(cooperageColumn).toBeDefined();
    expect(cooperageColumn?.fmt?.(rows[0])).toBe("21.25");
    expect(cooperageColumn?.fmt?.(rows[1])).toBe("");
  });

  it("does not create a CSV when the maintenance summary request fails", async () => {
    let exportCalls = 0;
    const errorMessages: string[] = [];
    const summaryError = new Error("Could not load barrel maintenance history.");

    const succeeded = await runFullVesselRegisterCsvExport({
      rows: [{ id: 7, vessel_ref: "B-007", vessel_type: "Barrel" }],
      farmName: "Test Vineyard",
      loadMaintenanceSummary: async () => {
        throw summaryError;
      },
      exportCsv: () => {
        exportCalls += 1;
      },
    }, message => errorMessages.push(message));

    expect(succeeded).toBe(false);
    expect(exportCalls).toBe(0);
    expect(errorMessages).toEqual(["Could not load barrel maintenance history."]);
  });
});
