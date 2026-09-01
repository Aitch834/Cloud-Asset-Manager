import { describe, expect, it } from "vitest";
import {
  AGRI_ENV_GRANT_CSV_HEADERS,
  buildAgriEnvProjectCsvRows,
} from "./business-reports-csv";

describe("Gross Margin agri-environment CSV rows", () => {
  it("exports grant balances for a single claimed project", () => {
    const rows = buildAgriEnvProjectCsvRows([
      {
        schemeName: "Sustainable Farming Incentive",
        yearClaimedPence: 25000,
        totalGrantValuePence: 100000,
        allTimeClaimedPence: 40000,
      },
    ]);

    expect(AGRI_ENV_GRANT_CSV_HEADERS).toEqual([
      "Claimed this year",
      "Total grant value",
      "All-time claimed",
      "Remaining grant value",
    ]);
    expect(rows).toEqual([[
      "  ↳ Sustainable Farming Incentive",
      "£250.00",
      "£1,000.00",
      "£400.00",
      "£600.00",
    ]]);
  });

  it("uses placeholders when grant totals are unavailable", () => {
    expect(buildAgriEnvProjectCsvRows([{
      schemeName: "Countryside Stewardship",
      yearClaimedPence: 12500,
      totalGrantValuePence: null,
      allTimeClaimedPence: null,
    }])).toEqual([[
      "  ↳ Countryside Stewardship",
      "£125.00",
      "—",
      "—",
      "—",
    ]]);
  });
});