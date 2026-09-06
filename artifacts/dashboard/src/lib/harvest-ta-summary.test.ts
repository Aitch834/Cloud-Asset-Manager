import { describe, expect, it } from "vitest";
import { getSeasonTaAverageFromBlockAverages } from "./harvest-ta-summary";

describe("getSeasonTaAverageFromBlockAverages", () => {
  it("averages the per-block TA averages rather than weighting every harvest record equally", () => {
    const records = [
      { blockId: 1, titratableAcidityGl: "4" },
      { blockId: 1, titratableAcidityGl: "6" },
      { blockId: 2, titratableAcidityGl: "9" },
    ];

    expect(getSeasonTaAverageFromBlockAverages(records)).toBe(7);
    expect(getSeasonTaAverageFromBlockAverages(records)).not.toBeCloseTo(19 / 3);
  });

  it("returns null when no harvest record has a TA value", () => {
    const records = [
      { blockId: 1, titratableAcidityGl: null },
      { blockId: 2, titratableAcidityGl: "" },
    ];

    expect(getSeasonTaAverageFromBlockAverages(records)).toBeNull();
  });
});