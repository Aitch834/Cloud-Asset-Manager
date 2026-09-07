import { describe, expect, it } from "vitest";
import {
  AGRI_ENV_GRANT_CSV_HEADERS,
  PL_CSV_HEADERS,
  buildAgriEnvProjectCsvRows,
  buildPlAgriEnvProjectCsvRows,
} from "./business-reports-csv";

describe("financial agri-environment CSV exports", () => {
  it("keeps the grant balance headers shared by Gross Margin and P&L", () => {
    expect(AGRI_ENV_GRANT_CSV_HEADERS).toEqual([
      "Claimed this year",
      "Total grant value",
      "All-time claimed",
      "Remaining grant value",
    ]);
    expect(PL_CSV_HEADERS.slice(1, -1)).toEqual(AGRI_ENV_GRANT_CSV_HEADERS);
  });

  it.each([
    ["Gross Margin", buildAgriEnvProjectCsvRows, [
      "  ↳ Sustainable Farming Incentive",
      "£250.00",
      "£1,000.00",
      "£400.00",
      "£600.00",
    ]],
    ["P&L", buildPlAgriEnvProjectCsvRows, [
      "  ↳ Sustainable Farming Incentive",
      "£250.00",
      "£1,000.00",
      "£400.00",
      "£600.00",
      "",
    ]],
  ])("calculates remaining grant value in %s rows", (_report, buildRows, expectedRow) => {
    expect(buildRows([{
      schemeName: "Sustainable Farming Incentive",
      yearClaimedPence: 25000,
      totalGrantValuePence: 100000,
      allTimeClaimedPence: 40000,
    }])).toEqual([expectedRow]);
  });

  it.each([
    ["Gross Margin", buildAgriEnvProjectCsvRows, [
      "  ↳ Countryside Stewardship",
      "£125.00",
      "—",
      "—",
      "—",
    ]],
    ["P&L", buildPlAgriEnvProjectCsvRows, [
      "  ↳ Countryside Stewardship",
      "£125.00",
      "—",
      "—",
      "—",
      "",
    ]],
  ])("preserves unavailable-value placeholders in %s rows", (_report, buildRows, expectedRow) => {
    expect(buildRows([{
      schemeName: "Countryside Stewardship",
      yearClaimedPence: 12500,
      totalGrantValuePence: null,
      allTimeClaimedPence: null,
    }])).toEqual([expectedRow]);
  });
});
