import {
  APPROACHING_NEUTRAL_FILLS,
  BARREL_RETIREMENT_THRESHOLD_PENCE,
  IDLE_BARREL_DAYS,
  isApproachingNeutral,
  isBarrelType,
  isIdleBarrel,
  resolveBarrelAlertThreshold,
  resolveBarrelRetirementThresholdPence,
} from "../lib/utils/vesselAlerts";

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-01-15T12:00:00.000Z");

function emptySinceDaysAgo(days: number): string {
  return new Date(NOW.getTime() - days * DAY_MS).toISOString();
}

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

describe("resolveBarrelRetirementThresholdPence", () => {
  it("converts a valid farm GBP override to pence ahead of the platform default", () => {
    expect(resolveBarrelRetirementThresholdPence("750", 90000)).toBe(75000);
  });

  it("uses the platform pence default when the farm has no valid override", () => {
    expect(resolveBarrelRetirementThresholdPence(null, "85000")).toBe(85000);
  });

  it("uses the £600 fallback when neither configured value is valid", () => {
    expect(resolveBarrelRetirementThresholdPence("", "0")).toBe(
      BARREL_RETIREMENT_THRESHOLD_PENCE,
    );
  });
});

describe("isBarrelType", () => {
  it("recognises barrels and barriques without classifying other vessels", () => {
    expect(isBarrelType("Oak barrel")).toBe(true);
    expect(isBarrelType("Barrique")).toBe(true);
    expect(isBarrelType("Stainless steel tank")).toBe(false);
    expect(isBarrelType("Amphora")).toBe(false);
  });
});

describe("isIdleBarrel", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("uses the default threshold and only flags barrels older than it", () => {
    expect(isIdleBarrel(emptySinceDaysAgo(IDLE_BARREL_DAYS))).toBe(false);
    expect(
      isIdleBarrel(
        new Date(NOW.getTime() - IDLE_BARREL_DAYS * DAY_MS - 1).toISOString(),
      ),
    ).toBe(true);
  });

  it("uses a farm-specific threshold override", () => {
    expect(isIdleBarrel(emptySinceDaysAgo(30), 30)).toBe(false);
    expect(isIdleBarrel(emptySinceDaysAgo(31), 30)).toBe(true);
  });

  it("falls back to the default threshold for a null override", () => {
    expect(isIdleBarrel(emptySinceDaysAgo(IDLE_BARREL_DAYS), null)).toBe(false);
    expect(
      isIdleBarrel(
        new Date(NOW.getTime() - IDLE_BARREL_DAYS * DAY_MS - 1).toISOString(),
        null,
      ),
    ).toBe(true);
  });

  it("does not flag a barrel without an empty-since date", () => {
    expect(isIdleBarrel(null)).toBe(false);
  });
});

describe("isApproachingNeutral", () => {
  it("uses the default threshold and includes the boundary", () => {
    expect(isApproachingNeutral(APPROACHING_NEUTRAL_FILLS - 1)).toBe(false);
    expect(isApproachingNeutral(APPROACHING_NEUTRAL_FILLS)).toBe(true);
  });

  it("uses a farm-specific threshold override", () => {
    expect(isApproachingNeutral(6, 7)).toBe(false);
    expect(isApproachingNeutral(7, 7)).toBe(true);
  });

  it("falls back to the default threshold for a null override", () => {
    expect(isApproachingNeutral(APPROACHING_NEUTRAL_FILLS, null)).toBe(true);
    expect(isApproachingNeutral(APPROACHING_NEUTRAL_FILLS - 1, null)).toBe(false);
  });

  it("does not flag a barrel without a fill number", () => {
    expect(isApproachingNeutral(null)).toBe(false);
  });
});
