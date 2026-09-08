import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { BARREL_MAINTENANCE_CSV_COLUMNS, barrelMaintenanceCsvFilename } from "./barrel-maintenance-csv";
import { buildCsvText } from "../pages/winery/shared";

describe("barrel maintenance CSV export", () => {
  it("keeps the vessel reference in the filename", () => {
    expect(barrelMaintenanceCsvFilename({ id: 42, vessel_ref: "BRL 12/A" }))
      .toBe("barrel-maintenance-BRL-12-A.csv");
  });

  it("keeps the six audit columns, UK dates, pound costs, and quoted notes stable", () => {
    const csv = buildCsvText([
      {
        maintenance_date: "2026-09-07T12:00:00.000Z",
        work_type: "Hoop repair",
        cooperage_name: "Smith & Sons",
        cost_pence: 12345,
        operator_name: "A. Cooper",
        notes: 'Tightened hoops, marked "urgent"',
      },
    ], BARREL_MAINTENANCE_CSV_COLUMNS);

    expect(csv).toBe(
      '"Date","Work Type","Cooperage","Cost (£)","Operator","Notes"\n' +
      '"07/09/2026","Hoop repair","Smith & Sons","£123.45","A. Cooper","Tightened hoops, marked ""urgent"""',
    );
  });

  it("exposes Download CSV immediately beside the print action in the detail dialog", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/pages/winery/VesselRegisterTab.tsx"),
      "utf8",
    );

    expect(source).toMatch(
      /handleBarrelMaintenanceCsv\(view\)[\s\S]*?Download CSV[\s\S]*?handleBarrelPrint\(view\)[\s\S]*?Print Barrel History/,
    );
  });
});