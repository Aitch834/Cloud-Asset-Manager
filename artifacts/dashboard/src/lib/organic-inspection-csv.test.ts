import { describe, expect, it } from "vitest";
import { buildCsv } from "./csv";
import { parseCsvText } from "./bottling-csv";
import {
  buildOrganicInspectionCsvRows,
  ORGANIC_INSPECTION_CSV_HEADERS,
} from "./organic-inspection-csv";

describe("Organic Inspection Register CSV export", () => {
  it("exports every required audit column with the seeded inspection value", () => {
    const csv = buildCsv(
      buildOrganicInspectionCsvRows([
        {
          inspectionDate: "2026-08-20",
          certifier: "Soil Association",
          inspectorName: "Avery Inspector",
          outcome: "Non-conformance – Minor",
          certificateReference: "SA-AUDIT-1966",
          nextDueDate: "2027-08-20",
          nonConformances: "Record-keeping gap",
          actions: "Update the inspection log",
          notes: "Complete audit export fixture",
        },
      ]),
    );
    const [headers, values] = parseCsvText(csv.replace(/^\uFEFF/, ""));

    expect(headers).toEqual(ORGANIC_INSPECTION_CSV_HEADERS);
    expect(values).toHaveLength(ORGANIC_INSPECTION_CSV_HEADERS.length);
    expect(values.every(value => value.trim().length > 0)).toBe(true);
    expect(values).toEqual([
      "20/08/2026",
      "Soil Association",
      "Avery Inspector",
      "Non-conformance – Minor",
      "SA-AUDIT-1966",
      "20/08/2027",
      "Record-keeping gap",
      "Update the inspection log",
      "Complete audit export fixture",
    ]);
  });
});