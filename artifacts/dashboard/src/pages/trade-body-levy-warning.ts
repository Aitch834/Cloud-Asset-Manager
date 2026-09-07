export interface TradeBodyWarningConfig {
  body: string;
  type: "membership" | "levy" | "statutory" | "assurance";
}

export interface TradeBodySummaryFixture {
  year: number;
  totalsPerBody: Record<string, number>;
}

export function shouldShowMissingLevyWarning(
  config: TradeBodyWarningConfig,
  summary: TradeBodySummaryFixture | undefined,
  selectedYear: number,
  currentYear = new Date().getFullYear(),
): boolean {
  return (
    selectedYear === currentYear &&
    summary?.year === selectedYear &&
    (config.type === "levy" || config.type === "statutory") &&
    !Object.prototype.hasOwnProperty.call(summary.totalsPerBody, config.body)
  );
}