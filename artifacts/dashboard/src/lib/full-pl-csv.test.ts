import { describe, expect, it } from "vitest";
import { buildFullPlCsvRows } from "./full-pl-csv";

describe("Full P&L CSV", () => {
  it("keeps all detail rows before the contiguous three-row summary footer", () => {
    const rows = buildFullPlCsvRows(
      [
        { cat: "Crop Sales", total: 125_00 },
        { cat: "Grant / Subsidy", total: 75_00 },
      ],
      [
        { cat: "Fertiliser", total: 40_00 },
        { cat: "Fuel", total: 35_00 },
      ],
      "2026",
    );

    expect(rows).toEqual([
      ["Category", "Type", "Amount (£)", "Period"],
      ["Crop Sales", "Income", "125.00", "2026"],
      ["Grant / Subsidy", "Income", "75.00", "2026"],
      ["Fertiliser", "Expense", "40.00", "2026"],
      ["Fuel", "Expense", "35.00", "2026"],
      ["Total Income", "Income", "200.00", "2026"],
      ["Total Expenditure", "Expense", "75.00", "2026"],
      ["Net Profit / Loss", "Net", "125.00", "2026"],
    ]);
  });
});