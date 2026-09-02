import { describe, expect, it } from "vitest";
import { isBarrelRetirementRisk } from "./barrel-retirement-risk";

describe("isBarrelRetirementRisk", () => {
  it("includes only active over-threshold barrels", () => {
    const thresholdPence = 60_000;
    const barrels = [
      { id: 1, status: "active", maintenance_spend_pence: "60001" },
      { id: 2, status: "retired", maintenance_spend_pence: "90000" },
    ];

    expect(barrels.filter(barrel => isBarrelRetirementRisk(barrel, thresholdPence)))
      .toEqual([barrels[0]]);
  });
});