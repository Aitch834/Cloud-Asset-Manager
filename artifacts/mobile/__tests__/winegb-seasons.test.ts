import {
  buildWinegbSeasonYears,
  isWinegbMutationResultCurrent,
} from "@/lib/winegbSeasons";

describe("WineGB mobile season selection", () => {
  it("includes historic years supplied by submission and harvest history even without phenology records", () => {
    expect(buildWinegbSeasonYears(
      2026,
      [2025, 2023],
      ["2024-05-18"],
    )).toEqual(["2026", "2025", "2024", "2023"]);
  });

  it("does not apply a mutation result after the selected season changes", () => {
    expect(isWinegbMutationResultCurrent(2024, 2025)).toBe(false);
    expect(isWinegbMutationResultCurrent(2024, 2024)).toBe(true);
  });
});