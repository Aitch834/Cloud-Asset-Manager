import {
  formatHarvestInterval,
  getHarvestIntervalExpiryDate,
  isHarvestIntervalActive,
} from "../lib/harvestInterval";

describe("harvest interval dates", () => {
  it("adds calendar days across the UK autumn DST fallback", () => {
    const previousTimezone = process.env.TZ;
    process.env.TZ = "Europe/London";

    try {
      const expiry = getHarvestIntervalExpiryDate("2026-10-20", 10);

      expect(expiry?.toLocaleDateString("en-GB")).toBe("30/10/2026");
      expect(formatHarvestInterval("2026-10-20", 10, new Date("2026-10-29T12:00:00"))).toBe(
        "10d — expires 30/10/2026",
      );
    } finally {
      process.env.TZ = previousTimezone;
    }
  });

  it("marks the interval expired on its expiry date", () => {
    const expiry = getHarvestIntervalExpiryDate("2026-09-01", 1);

    expect(isHarvestIntervalActive(expiry!, new Date("2026-09-02T12:00:00"))).toBe(false);
    expect(formatHarvestInterval("2026-09-01", 1, new Date("2026-09-02T12:00:00"))).toBe(
      "1d — expired 02/09/2026",
    );
  });
});