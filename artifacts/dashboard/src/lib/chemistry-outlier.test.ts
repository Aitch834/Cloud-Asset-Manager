import { describe, expect, it } from "vitest";
import {
  CHEMISTRY_CROSS_TAB_OUTLIER_CELL_STYLE,
  CHEMISTRY_CROSS_TAB_OUTLIER_LEGEND,
  buildChemistryCrossVintageStats,
  isChemistryCrossVintageOutlier,
  isChemistryCrossVintageOutlierMetric,
} from "./chemistry-outlier";

describe("chemistry cross-vintage outliers", () => {
  it("flags a vintage average beyond one population SD and supplies the amber print style", () => {
    const stats = buildChemistryCrossVintageStats([10, 10, 20]);

    expect(stats).not.toBeNull();
    expect(isChemistryCrossVintageOutlier(20, stats)).toBe(true);
    expect(isChemistryCrossVintageOutlier(10, stats)).toBe(false);
    expect(CHEMISTRY_CROSS_TAB_OUTLIER_CELL_STYLE).toContain("background:#fef3c7");
    expect(CHEMISTRY_CROSS_TAB_OUTLIER_CELL_STYLE).toContain("print-color-adjust:exact");
  });

  it("does not flag a non-outlier, a value at exactly one SD, or a value with no variation", () => {
    const stats = buildChemistryCrossVintageStats([10, 20]);

    expect(stats).not.toBeNull();
    expect(isChemistryCrossVintageOutlier(10, stats)).toBe(false);
    expect(isChemistryCrossVintageOutlier(20, stats)).toBe(false);
    expect(isChemistryCrossVintageOutlier(10, buildChemistryCrossVintageStats([10, 10, 10]))).toBe(false);
  });

  it("does not produce stats when fewer than two vintage averages are available", () => {
    expect(buildChemistryCrossVintageStats([10])).toBeNull();
    expect(isChemistryCrossVintageOutlier(20, null)).toBe(false);
  });

  it("limits cross-tab shading to TA and Pot. Alc. and explains the all-vintage comparison", () => {
    expect(isChemistryCrossVintageOutlierMetric("Avg TA (g/L)")).toBe(true);
    expect(isChemistryCrossVintageOutlierMetric("Avg Pot. Alc %")).toBe(true);
    expect(isChemistryCrossVintageOutlierMetric("Avg Brix °")).toBe(false);
    expect(isChemistryCrossVintageOutlierMetric("Avg pH")).toBe(false);
    expect(CHEMISTRY_CROSS_TAB_OUTLIER_LEGEND).toContain("block&rsquo;s all-vintage average");
    expect(CHEMISTRY_CROSS_TAB_OUTLIER_LEGEND).not.toContain("for that vintage");
  });
});