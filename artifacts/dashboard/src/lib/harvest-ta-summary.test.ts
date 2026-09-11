import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getSeasonTaAverageFromBlockAverages } from "./harvest-ta-summary";

describe("getSeasonTaAverageFromBlockAverages", () => {
  it("averages the per-block TA averages rather than weighting every harvest record equally", () => {
    const records = [
      { blockId: 1, titratableAcidityGl: "4" },
      { blockId: 1, titratableAcidityGl: "6" },
      { blockId: 2, titratableAcidityGl: "9" },
    ];

    expect(getSeasonTaAverageFromBlockAverages(records)).toBe(7);
    expect(getSeasonTaAverageFromBlockAverages(records)).not.toBeCloseTo(19 / 3);
  });

  it("returns null when no harvest record has a TA value", () => {
    const records = [
      { blockId: 1, titratableAcidityGl: null },
      { blockId: 2, titratableAcidityGl: "" },
    ];

    expect(getSeasonTaAverageFromBlockAverages(records)).toBeNull();
  });

  it("keeps the on-screen Yield Summary by Block footer wired to the shared TA average and fallback", () => {
    const source = readFileSync(
      resolve(fileURLToPath(new URL(".", import.meta.url)), "../components/ViticulturalReports.tsx"),
      "utf8",
    );
    const onScreenSummary = source.slice(
      source.indexOf("{/* Per-block yield summary (single-vintage mode only) */}"),
      source.indexOf("{/* Disease pressure season peak summary (single-vintage mode only) */}"),
    );

    expect(onScreenSummary).toContain(
      "const summAvgTa = getSeasonTaAverageFromBlockAverages(vintageHarvest);",
    );
    expect(onScreenSummary).toContain(
      '{summAvgTa != null ? summAvgTa.toFixed(1) : "—"}',
    );
  });
});
