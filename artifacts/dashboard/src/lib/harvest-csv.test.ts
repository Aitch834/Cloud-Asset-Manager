import { describe, expect, it } from "vitest";
import { deriveTonnesPerHa } from "./csv";
import {
  buildHarvestChemistryCsvSection,
  buildHarvestCsvContent,
  buildHarvestYieldByVarietyCsvSection,
  buildWineGBSurveyCsvSection,
} from "./harvest-csv";

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
  it("marks positive yield without usable area and explains how to add the area", () => {
    const section = buildHarvestYieldByVarietyCsvSection(
      [
        { blockId: 10, yieldKg: 750 },
        { blockId: 11, yieldKg: 0 },
      ],
      [
        { id: 10, variety: "Bacchus", areaHa: null },
        { id: 11, variety: "Seyval Blanc", areaHa: 0 },
      ],
    );

    expect(section).toContain('"Bacchus","","750.0","†","","","",""');
    expect(section).toContain('"Seyval Blanc","","","","","","",""');
    expect(section).not.toContain('"Seyval Blanc","","","†"');
    expect(section.at(-1)).toBe(
      '"† Block area not set — add it in Block Settings to see yield per hectare"',
    );
  });
});

describe("WineGB harvest survey CSV", () => {
  it("keeps yield in kg/ha for each variety and the total", () => {
    const section = buildWineGBSurveyCsvSection(
      [
        { blockId: 1, yieldKg: 600 },
        { blockId: 1, yieldKg: 400 },
        { blockId: 2, yieldKg: 2_000 },
      ],
      [
        { id: 1, variety: "Chardonnay", areaHa: 2 },
        { id: 2, variety: "Pinot Noir", areaHa: 3 },
      ],
    );

    expect(section[0]).toBe(
      '"Variety","Area Under Vine (ha)","Total Harvested (kg)","Yield (kg/ha)","Avg Brix °","Avg pH","Avg TA (g/L)","Avg Potential Alcohol %"',
    );
    expect(section).toContain('"Chardonnay","2.00","1000.0","500","","","",""');
    expect(section).toContain('"Pinot Noir","3.00","2000.0","667","","","",""');
    expect(section).toContain('"TOTAL","5.00","3000.0","600","","","",""');
  });
});

describe("harvest chemistry CSV", () => {
  const rows = [
    { blockId: 1, vintageYear: "2025", brix: 18, ph: 3.1, titratableAcidityGl: 7, potentialAlcohol: 10.2 },
    { blockId: 2, vintageYear: "2025", brix: 20, ph: 3.3, titratableAcidityGl: 6, potentialAlcohol: 11.4 },
    { blockId: 1, vintageYear: "2026", brix: null, ph: null, titratableAcidityGl: null, potentialAlcohol: null },
    { blockId: null, vintageYear: "2025", brix: 30, ph: 4, titratableAcidityGl: 3, potentialAlcohol: 17 },
    { blockId: "", vintageYear: "2026", brix: 31, ph: 4.1, titratableAcidityGl: 2, potentialAlcohol: 18 },
  ];
  const metrics = [
    ["Brix by Vintage", "Avg Brix °", "brix", 1],
    ["pH by Vintage", "Avg pH", "ph", 2],
    ["TA by Vintage", "Avg TA (g/L)", "titratableAcidityGl", 2],
    ["Potential Alcohol by Vintage", "Avg Pot. Alc %", "potentialAlcohol", 2],
  ] as const;

  it.each(metrics)(
    "keeps %s rows aligned when a vintage has blank readings",
    (title, averageLabel, field, precision) => {
      const section = buildHarvestChemistryCsvSection(
        rows,
        ["2025", "2026"],
        [1, 2],
        blockId => `Block ${blockId}`,
        title,
        averageLabel,
        row => {
          const value = Number(row[field]);
          return row[field] == null || Number.isNaN(value) ? null : value;
        },
        precision,
      );
      const dataLines = section.slice(2);
      const columnCounts = dataLines.map(line => line.split(",").length);

      expect(new Set(columnCounts)).toEqual(new Set([4]));
      expect(section.at(-2)?.split(",")[2]).toBe('""');
      expect(section.at(-1)).toBe('"Picks","2","1 (single pick)","3"');
    },
  );
});