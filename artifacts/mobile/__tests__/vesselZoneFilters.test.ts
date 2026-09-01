import {
  getVesselZoneFilterOptions,
  toggleVesselZoneFilter,
} from "../lib/utils/vesselZoneFilters";

describe("vessel zone filter options", () => {
  it("only offers the flagged drill-down when an alert flag is active", () => {
    expect(getVesselZoneFilterOptions(false)).toEqual(["show-all"]);
    expect(getVesselZoneFilterOptions(true)).toEqual(["show-all", "show-flagged"]);
  });

  it("keeps regular zone taps as independent toggles", () => {
    expect(toggleVesselZoneFilter([], "North")).toEqual(["North"]);
    expect(toggleVesselZoneFilter(["North"], "South")).toEqual(["North", "South"]);
    expect(toggleVesselZoneFilter(["North", "South"], "North")).toEqual(["South"]);
  });
});