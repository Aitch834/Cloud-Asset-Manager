import { describe, expect, it } from "vitest";
import { deriveTonnesPerHa } from "./csv";
import { buildHarvestCsvContent, buildHarvestYieldByVarietyCsvSection } from "./harvest-csv";

describe("deriveTonnesPerHa", () => {
  it("derives t/ha from total kilograms and block area", () => {
    expect(deriveTonnesPerHa(1000, 2)).toBe(0.5);
  });

  it("returns null when block area is missing", () => {
    expect(deriveTonnesPerHa(1000, "")).toBeNull();
    expect(deriveTonnesPerHa(1000, null)).toBeNull();
  });

  it("returns null for zero or invalid inputs", () => {
    expect(deriveTonnesPerHa(0, 2)).toBeNull();
    expect(deriveTonnesPerHa(1000, 0)).toBeNull();
    expect(deriveTonnesPerHa(1000, "not an area")).toBeNull();
  });
});

describe("harvest Yield by Variety CSV", () => {
  const blocks = [
    { id: 1, variety: "Chardonnay", areaHa: 2 },
    { id: 2, variety: "Pinot Noir", areaHa: 3 },
  ];
  const rows = [
    { blockId: 1, yieldKg: 600 },
    { blockId: 1, yieldKg: 400 },
    { blockId: 2, yieldKg: 2_000 },
  ];

  it("uses the t/ha header and calculates per-variety and total t/ha from kg and area", () => {
    const section = buildHarvestYieldByVarietyCsvSection(rows, blocks);

    expect(section[2]).toBe(
      '"Variety","Area (ha)","Total Yield (kg)","Yield (t/ha)","Avg Brix °","Avg pH","Avg TA (g/L)","Avg Pot. Alc %"',
    );
    expect(section).toContain('"Chardonnay","2.00","1000.0","0.50","","","",""');
    expect(section).toContain('"Pinot Noir","3.00","2000.0","0.67","","","",""');
    expect(section).toContain('"TOTAL","5.00","3000.0","0.60","","","",""');
  });

  it.each(["summary", "full"] as const)(
    "keeps the section included in %s export mode",
    mode => {
      const varietyLines = buildHarvestYieldByVarietyCsvSection(rows, blocks);
      const csv = buildHarvestCsvContent(mode, {
        warningLine: "",
        lowPickWarningLine: "",
        summaryTitle: "Yield Summary — by Block",
        summaryHeader: '"Block","Picks"',
        summaryRows: ['"Block 1","2"'],
        crossTabLines: [],
        varietyLines,
        ...(mode === "full"
          ? { detailHeader: '"Harvest Date"', detailBody: '"2026-09-01"' }
          : {}),
      });

      expect(csv).toContain('"Yield by Variety"');
      expect(csv).toContain('"Chardonnay","2.00","1000.0","0.50","","","",""');
    },
  );
});