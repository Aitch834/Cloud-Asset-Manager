import { resolveHarvestVintage } from "@/lib/harvestVintageSelection";

describe("resolveHarvestVintage", () => {
  const vintages = [2026, 2025, 2024];

  it("restores an available non-current vintage", () => {
    expect(resolveHarvestVintage(2024, vintages)).toBe(2024);
  });

  it("keeps an explicit All vintages preference", () => {
    expect(resolveHarvestVintage(null, vintages)).toBeNull();
  });

  it.each([
    ["missing", undefined],
    ["unavailable", 2023],
    ["invalid numeric value", Number.NaN],
  ])("falls back to the newest vintage for a %s preference", (_label, stored) => {
    expect(resolveHarvestVintage(stored, vintages)).toBe(2026);
  });
});