import { describe, expect, it } from "vitest";
import { buildViticultureBlockSummaryFooterRow } from "./csv";

describe("buildViticultureBlockSummaryFooterRow", () => {
  it("keeps the full footer aligned while aggregating split-vintage picks", () => {
    const rows: Record<string, unknown>[] = [
      { blockId: 1, vintageYear: 2024, yieldKg: 1000, brix: 10, ph: 3.1, titratableAcidityGl: 6, potentialAlcohol: 11 },
      { blockId: 1, vintageYear: 2025, yieldKg: 500, brix: 12, ph: 3.3, titratableAcidityGl: 5, potentialAlcohol: 12 },
      { blockId: 2, vintageYear: 2025, yieldKg: 1500, brix: 14, ph: 3.2, titratableAcidityGl: 7, potentialAlcohol: 13 },
      { blockId: 1, vintageYear: 2025, yieldKg: 0, brix: 16, ph: 3.4, titratableAcidityGl: 4, potentialAlcohol: 14 },
    ];
    const footer = buildViticultureBlockSummaryFooterRow(rows, blockId => (
      String(blockId) === "1" ? 2.5 : 1.5
    ));

    expect(footer).toEqual([
      "",
      "All blocks",
      "",
      "4.00",
      4,
      "3000.0",
      "0.75",
      "13.0",
      "3.25",
      "5.50",
      "12.50",
    ]);
    expect(footer).toHaveLength(11);
  });
});