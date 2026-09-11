import { describe, expect, it } from "vitest";
import {
  getUsableTradeBodySummary,
  isUsableTradeBodySummary,
  shouldShowMissingLevyWarning,
  type TradeBodySummaryFixture,
  type TradeBodyWarningConfig,
} from "./trade-body-levy-warning";

const CURRENT_YEAR = 2026;

const bodiesResponseFixture: { bodies: TradeBodyWarningConfig[] } = {
  bodies: [
    { body: "ahdb", type: "levy" },
    { body: "rpa", type: "statutory" },
    { body: "nfu", type: "membership" },
    { body: "winegb", type: "membership" },
    { body: "red_tractor", type: "assurance" },
  ],
};

const emptyCurrentYearSummaryFixture: TradeBodySummaryFixture = {
  year: CURRENT_YEAR,
  totalsPerBody: {},
};

describe("statutory levy overview warning", () => {
  it("shows for current-year empty summaries on levy and statutory bodies only", () => {
    const warningByBody = Object.fromEntries(
      bodiesResponseFixture.bodies.map((body) => [
        body.body,
        shouldShowMissingLevyWarning(
          body,
          emptyCurrentYearSummaryFixture,
          CURRENT_YEAR,
          CURRENT_YEAR,
        ),
      ]),
    );

    expect(warningByBody).toEqual({
      ahdb: true,
      rpa: true,
      nfu: false,
      winegb: false,
      red_tractor: false,
    });
  });

  it("does not show for a historical year", () => {
    const historicalYear = CURRENT_YEAR - 1;
    const historicalSummaryFixture: TradeBodySummaryFixture = {
      year: historicalYear,
      totalsPerBody: {},
    };

    for (const body of bodiesResponseFixture.bodies) {
      expect(
        shouldShowMissingLevyWarning(
          body,
          historicalSummaryFixture,
          historicalYear,
          CURRENT_YEAR,
        ),
      ).toBe(false);
    }
  });

  it.each([
    ["failed response", undefined],
    ["missing totals", { year: CURRENT_YEAR }],
    ["invalid totals", { year: CURRENT_YEAR, totalsPerBody: null }],
    ["wrong year", { year: CURRENT_YEAR - 1, totalsPerBody: {} }],
  ])("reports an unavailable summary for a %s without claiming a body has no records", (_label, summary) => {
    expect(isUsableTradeBodySummary(summary, CURRENT_YEAR)).toBe(false);

    for (const body of bodiesResponseFixture.bodies) {
      expect(
        shouldShowMissingLevyWarning(
          body,
          summary as TradeBodySummaryFixture | undefined,
          CURRENT_YEAR,
          CURRENT_YEAR,
        ),
      ).toBe(false);
    }
  });

  it("discards a cached successful summary when the latest request fails", () => {
    const cachedSummary: TradeBodySummaryFixture = {
      year: CURRENT_YEAR,
      totalsPerBody: {},
    };

    const summaryAfterFailedRefetch = getUsableTradeBodySummary(
      cachedSummary,
      CURRENT_YEAR,
      true,
    );

    expect(summaryAfterFailedRefetch).toBeUndefined();
    expect(
      shouldShowMissingLevyWarning(
        bodiesResponseFixture.bodies[0],
        summaryAfterFailedRefetch,
        CURRENT_YEAR,
        CURRENT_YEAR,
      ),
    ).toBe(false);
  });
});