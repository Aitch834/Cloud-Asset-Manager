import { describe, expect, it } from "vitest";
import { csvSafeValue } from "./csv-safety";

describe("CSV spreadsheet safety", () => {
  it("neutralizes formula-like maintenance values", () => {
    const maintenanceRecord = {
      cooperage_name: "=HYPERLINK(\"https://example.com\")",
      operator_name: "\t+cmd|' /C calc'!A0",
      notes: "  -2+3 and \n@external",
    };

    expect(csvSafeValue(maintenanceRecord.cooperage_name)).toBe(
      "'=HYPERLINK(\"https://example.com\")",
    );
    expect(csvSafeValue(maintenanceRecord.operator_name)).toBe(
      "'\t+cmd|' /C calc'!A0",
    );
    expect(csvSafeValue(maintenanceRecord.notes)).toBe(
      "'  -2+3 and \n@external",
    );
  });

  it("leaves ordinary maintenance text unchanged", () => {
    expect(csvSafeValue("Stave repair")).toBe("Stave repair");
    expect(csvSafeValue("No issues found")).toBe("No issues found");
  });
});