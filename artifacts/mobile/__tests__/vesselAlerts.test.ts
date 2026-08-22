import {
  APPROACHING_NEUTRAL_FILLS,
  IDLE_BARREL_DAYS,
  resolveBarrelAlertThreshold,
} from "../lib/utils/vesselAlerts";

describe("resolveBarrelAlertThreshold", () => {
  it("uses a valid farm override ahead of the platform default", () => {
    expect(resolveBarrelAlertThreshold(45, 60, IDLE_BARREL_DAYS)).toBe(45);
  });

  it("uses the platform default when the farm has no override", () => {
    expect(resolveBarrelAlertThreshold(null, "60", IDLE_BARREL_DAYS)).toBe(60);
  });

  it("uses the hardcoded fallback when configuration is invalid or unavailable", () => {
    expect(resolveBarrelAlertThreshold(undefined, "4.5", APPROACHING_NEUTRAL_FILLS)).toBe(
      APPROACHING_NEUTRAL_FILLS,
    );
    expect(resolveBarrelAlertThreshold("", "0", IDLE_BARREL_DAYS)).toBe(IDLE_BARREL_DAYS);
  });
});