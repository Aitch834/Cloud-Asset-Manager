import {
  getActiveHarvestIntervalWarnings,
  getHarvestIntervalWarningKey,
  isHarvestIntervalSaveBlocked,
  type SprayDiaryRecord,
} from "../lib/vineHarvestIntervalHelpers";

const sprays: SprayDiaryRecord[] = [
  {
    id: 1,
    applicationDate: "2026-08-28",
    blockId: 12,
    productName: "Example Fungicide",
    harvestIntervalDays: 14,
  },
  {
    id: 2,
    applicationDate: "2026-08-01",
    blockId: 12,
    productName: "Expired Product",
    harvestIntervalDays: 7,
  },
  {
    id: 3,
    applicationDate: "2026-08-31",
    blockId: 99,
    productName: "Other Block Product",
    harvestIntervalDays: 14,
  },
];

describe("vine harvest interval warnings", () => {
  it("returns active products for the selected block with their expiry dates", () => {
    expect(getActiveHarvestIntervalWarnings(sprays, 12, "2026-09-02")).toEqual([
      {
        id: 1,
        productName: "Example Fungicide",
        expiryDate: "2026-09-11",
      },
    ]);
  });

  it("does not warn for intervals that have expired by the harvest date", () => {
    expect(getActiveHarvestIntervalWarnings(sprays, 12, "2026-09-11")).toEqual([]);
  });

  it("requires acknowledgement only when current warning data contains an active interval", () => {
    const warnings = getActiveHarvestIntervalWarnings(sprays, 12, "2026-09-02");
    expect(isHarvestIntervalSaveBlocked(warnings, "")).toBe(true);
    expect(isHarvestIntervalSaveBlocked(warnings, getHarvestIntervalWarningKey(warnings))).toBe(false);
  });

  it("keeps offline entry available when the advisory lookup has no usable data", () => {
    expect(isHarvestIntervalSaveBlocked([], "")).toBe(false);
  });
});
