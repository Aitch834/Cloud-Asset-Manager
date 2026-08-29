import { buildSmdChartData } from "../lib/irrigationAdvisorChart";

describe("buildSmdChartData", () => {
  const baseOptions = {
    historical: [
      { date: "2026-08-28", smd: 8 },
      { date: "2026-08-29", smd: 10 },
    ],
    currentSmd: 10,
    currentDailyEtcMm: 2,
    fieldCapacity: 150,
    today: "2026-08-29",
  };

  it("does not duplicate today when the API forecast starts today", () => {
    const chart = buildSmdChartData({
      ...baseOptions,
      forecastDailyMm: [
        { date: "2026-08-29", mm: 20 },
        { date: "2026-08-30", mm: 1 },
        { date: "2026-08-31", mm: 3 },
      ],
      forecastRainfall7dMm: null,
    });

    expect(chart.projected.map(point => point.date)).toEqual(["2026-08-30", "2026-08-31"]);
    expect(chart.projected.map(point => point.smd)).toEqual([11, 10]);
  });

  it("generates a consistent tomorrow-through-day-7 fallback series", () => {
    const chart = buildSmdChartData({
      ...baseOptions,
      forecastDailyMm: null,
      forecastRainfall7dMm: 14,
    });

    expect(chart.projected).toHaveLength(7);
    expect(chart.projected[0]).toEqual({ date: "2026-08-30", smd: 10 });
    expect(chart.projected[6]).toEqual({ date: "2026-09-05", smd: 10 });
  });
});