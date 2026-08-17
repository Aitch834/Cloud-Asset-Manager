/**
 * Agri-environment scheme double-count detection helpers.
 *
 * Both GrossMarginTab and PLTab contain identical logic for deciding whether to
 * show the "Possible double-count detected" warning.  Extracting it here makes
 * the rule unit-testable without rendering the full page component.
 *
 * Rule (Task #1135):
 *   Show the warning when ALL of the following are true:
 *     1. There are agri-env milestone claims in the selected year (agriEnvYearTotal > 0).
 *     2. At least one "Agri-Environment Scheme" or "Vineyard Agri-Environment Scheme"
 *        income transaction has no agriEnvProjectId (i.e. is *unlinked*).
 *
 *   Linked transactions (agriEnvProjectId set) are already excluded from the
 *   financial income total and therefore cannot cause double-counting — the
 *   warning must not fire for them.
 */

export const AGRI_ENV_CATS = [
  "Agri-Environment Scheme",
  "Vineyard Agri-Environment Scheme",
] as const;

export type AgriEnvCat = (typeof AGRI_ENV_CATS)[number];

export interface FinancialTx {
  category?: string | null;
  transactionType?: string | null;
  amountPence?: number | null;
  agriEnvProjectId?: number | null;
}

export interface DoubleCountResult {
  /** All income transactions that belong to an agri-env category. */
  agriEnvSchemeTxs: FinancialTx[];
  /** Sum of amountPence for *unlinked* agri-env income transactions. */
  unlinkedTotal: number;
  /** True when the warning banner should be shown. */
  hasDoubleCountRisk: boolean;
}

/**
 * Determines whether the double-count warning should be displayed.
 *
 * @param costs           Raw financial transaction rows from the API.
 * @param agriEnvYearTotal  Sum of yearClaimedPence across all agriEnvSummary
 *                          projects for the selected year.
 */
export function agriEnvDoubleCountRisk(
  costs: FinancialTx[],
  agriEnvYearTotal: number,
): DoubleCountResult {
  const agriEnvSchemeTxs = costs.filter(
    (t) =>
      AGRI_ENV_CATS.includes(t.category as AgriEnvCat) &&
      t.transactionType === "income",
  );

  const unlinkedTotal = agriEnvSchemeTxs
    .filter((t) => !t.agriEnvProjectId)
    .reduce((s, t) => s + (t.amountPence ?? 0), 0);

  const hasDoubleCountRisk = agriEnvYearTotal > 0 && unlinkedTotal > 0;

  return { agriEnvSchemeTxs, unlinkedTotal, hasDoubleCountRisk };
}

/**
 * Computes the financial income total used by GrossMarginTab.
 *
 * Linked agri-env income transactions are excluded here because their value is
 * already counted via agriEnvYearTotal (milestone claims).  Unlinked ones are
 * included because they have not been reconciled yet.
 */
export function calcGrossMarginTxIncomeTotal(costs: FinancialTx[]): number {
  return costs
    .filter(
      (t) =>
        t.transactionType === "income" &&
        !(AGRI_ENV_CATS.includes(t.category as AgriEnvCat) && t.agriEnvProjectId),
    )
    .reduce((s, t) => s + (t.amountPence ?? 0), 0);
}
