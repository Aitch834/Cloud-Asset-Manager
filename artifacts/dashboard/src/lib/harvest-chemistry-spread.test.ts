import { describe, expect, it } from "vitest";
import { getChemistrySpreadWarnings } from "./harvest-chemistry-spread";

const blocks = [
  { id: 1, blockName: "North Field" },
  { id: 2, blockName: "South Field" },
];

describe("getChemistrySpreadWarnings", () => {
  it("does not warn when TA and Pot. Alc. SD are exactly at their thresholds", () => {
    const rows = [
      { blockId: 1, titratableAcidityGl: 5, potentialAlcohol: 10 },
      { blockId: 1, titratableAcidityGl: 8, potentialAlcohol: 12 },
    ];

    expect(getChemistrySpreadWarnings(rows, blocks)).toEqual([]);
  });

  it("reports each chemistry metric that exceeds its threshold", () => {
    const rows = [
      { blockId: 1, titratableAcidityGl: 5, potentialAlcohol: 10 },
      { blockId: 1, titratableAcidityGl: 8.2, potentialAlcohol: 12.2 },
    ];

    const [warning] = getChemistrySpreadWarnings(rows, blocks);
    expect(warning).toMatchObject({
      blockId: "1",
      blockName: "North Field",
    });
    expect(warning.taSd).toBeCloseTo(1.6);
    expect(warning.potentialAlcoholSd).toBeCloseTo(1.1);
  });

  it("uses the print payload when visible and print block filters diverge", () => {
    const visibleOnScreenRows = [
      { blockId: 1, titratableAcidityGl: 5, potentialAlcohol: 10 },
      { blockId: 1, titratableAcidityGl: 5.4, potentialAlcohol: 10.2 },
    ];
    const printRows = [
      { blockId: 2, titratableAcidityGl: 5, potentialAlcohol: 10 },
      { blockId: 2, titratableAcidityGl: 8.2, potentialAlcohol: 12.2 },
    ];

    expect(getChemistrySpreadWarnings(visibleOnScreenRows, blocks)).toEqual([]);
    expect(getChemistrySpreadWarnings(printRows, blocks)).toEqual([
      expect.objectContaining({ blockId: "2", blockName: "South Field" }),
    ]);
  });
});