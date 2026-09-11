export interface TradeBodyWarningConfig {
  body: string;
  type: "membership" | "levy" | "statutory" | "assurance";
}

export interface TradeBodySummaryFixture {
  year: number;
  totalsPerBody: Record<string, number>;
}

export function isUsableTradeBodySummary(
  summary: unknown,
  selectedYear: number,
): summary is TradeBodySummaryFixture {
  if (!summary || typeof summary !== "object") return false;

  const candidate = summary as Partial<TradeBodySummaryFixture>;
  return (
    candidate.year === selectedYear &&
    candidate.totalsPerBody !== null &&
    typeof candidate.totalsPerBody === "object" &&
    !Array.isArray(candidate.totalsPerBody)
  );
}

export function getUsableTradeBodySummary(
  summary: unknown,
  selectedYear: number,
  requestFailed: boolean,
): TradeBodySummaryFixture | undefined {
  return !requestFailed && isUsableTradeBodySummary(summary, selectedYear)
    ? summary
    : undefined;
}

export function shouldShowMissingLevyWarning(
  config: TradeBodyWarningConfig,
  summary: TradeBodySummaryFixture | undefined,
  selectedYear: number,
  currentYear = new Date().getFullYear(),
): boolean {
  return (
    selectedYear === currentYear &&
    isUsableTradeBodySummary(summary, selectedYear) &&
    (config.type === "levy" || config.type === "statutory") &&
    !Object.prototype.hasOwnProperty.call(summary.totalsPerBody, config.body)
  );
}