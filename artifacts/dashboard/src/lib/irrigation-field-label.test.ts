import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { irrigationFieldLabel } from "./irrigation-field-label";

describe("irrigation report field labels", () => {
  it("uses the joined field name for a linked irrigation record", () => {
    expect(irrigationFieldLabel({
      fieldId: 42,
      fieldName: "Long Meadow",
      fieldOrBlockDescription: "Old manual description",
    })).toBe("Long Meadow");
  });

  it("keeps the manual field or block description for an unlinked record", () => {
    expect(irrigationFieldLabel({
      fieldId: null,
      fieldName: null,
      fieldOrBlockDescription: "Glasshouse Block 3",
    })).toBe("Glasshouse Block 3");
  });

  it("keeps the season report API projection joined to the fields table", () => {
    const routeSource = readFileSync(
      resolve(process.cwd(), "../api-server/src/routes/farms.ts"),
      "utf8",
    );
    const queryStart = routeSource.indexOf("// 9. Irrigation events for this farm during the season");
    const queryEnd = routeSource.indexOf("// 10. Monthly rainfall aggregates", queryStart);
    const irrigationQuery = routeSource.slice(queryStart, queryEnd);

    expect(queryStart).toBeGreaterThanOrEqual(0);
    expect(queryEnd).toBeGreaterThan(queryStart);
    expect(irrigationQuery).toContain("fieldName: fieldsTable.name");
    expect(irrigationQuery).toContain(
      ".leftJoin(fieldsTable, eq(irrigationRecordsTable.fieldId, fieldsTable.id))",
    );
  });
});