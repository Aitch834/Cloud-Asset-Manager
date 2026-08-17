import { describe, it, expect } from "vitest";
import {
  agriEnvDoubleCountRisk,
  calcGrossMarginTxIncomeTotal,
  type FinancialTx,
} from "./agri-env-double-count";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mkTx = (
  overrides: Partial<FinancialTx> & { category: string; transactionType: string },
): FinancialTx => ({
  amountPence: 10_000_00, // £1,000 default
  agriEnvProjectId: null,
  ...overrides,
});

const agriEnvIncome = (
  opts: { amountPence?: number; agriEnvProjectId?: number | null } = {},
): FinancialTx =>
  mkTx({ category: "Agri-Environment Scheme", transactionType: "income", ...opts });

const vineyardAgriEnvIncome = (
  opts: { amountPence?: number; agriEnvProjectId?: number | null } = {},
): FinancialTx =>
  mkTx({ category: "Vineyard Agri-Environment Scheme", transactionType: "income", ...opts });

const cropSaleIncome = (amountPence = 50_000_00): FinancialTx =>
  mkTx({ category: "Crop Sales", transactionType: "income", amountPence });

const expenseTx = (): FinancialTx =>
  mkTx({ category: "Agri-Environment Scheme", transactionType: "expense" });

const MILESTONE_YEAR_TOTAL = 5_000_00; // £500 milestone claims in the year
const NO_MILESTONES = 0;

// ---------------------------------------------------------------------------
// agriEnvDoubleCountRisk — GrossMarginTab and PLTab share this logic
// ---------------------------------------------------------------------------

describe("agriEnvDoubleCountRisk — warning conditions", () => {
  // ── Case 1: warning shown ──────────────────────────────────────────────────

  it("sets hasDoubleCountRisk when there is an unlinked agri-env income tx alongside milestone claims", () => {
    const costs = [agriEnvIncome()];
    const { hasDoubleCountRisk } = agriEnvDoubleCountRisk(costs, MILESTONE_YEAR_TOTAL);
    expect(hasDoubleCountRisk).toBe(true);
  });

  it("sets hasDoubleCountRisk for an unlinked Vineyard Agri-Environment Scheme tx too", () => {
    const costs = [vineyardAgriEnvIncome()];
    const { hasDoubleCountRisk } = agriEnvDoubleCountRisk(costs, MILESTONE_YEAR_TOTAL);
    expect(hasDoubleCountRisk).toBe(true);
  });

  it("sets hasDoubleCountRisk when there is a mix of linked and unlinked agri-env txs", () => {
    // One linked (safe), one unlinked (still risky)
    const costs = [
      agriEnvIncome({ agriEnvProjectId: 1 }),
      agriEnvIncome({ agriEnvProjectId: null }),
    ];
    const { hasDoubleCountRisk } = agriEnvDoubleCountRisk(costs, MILESTONE_YEAR_TOTAL);
    expect(hasDoubleCountRisk).toBe(true);
  });

  // ── Case 2: warning absent when all txs are linked ────────────────────────

  it("clears hasDoubleCountRisk when every agri-env income tx has agriEnvProjectId set", () => {
    const costs = [agriEnvIncome({ agriEnvProjectId: 42 })];
    const { hasDoubleCountRisk } = agriEnvDoubleCountRisk(costs, MILESTONE_YEAR_TOTAL);
    expect(hasDoubleCountRisk).toBe(false);
  });

  it("clears hasDoubleCountRisk when multiple txs are all linked to projects", () => {
    const costs = [
      agriEnvIncome({ agriEnvProjectId: 1 }),
      vineyardAgriEnvIncome({ agriEnvProjectId: 2 }),
    ];
    const { hasDoubleCountRisk } = agriEnvDoubleCountRisk(costs, MILESTONE_YEAR_TOTAL);
    expect(hasDoubleCountRisk).toBe(false);
  });

  // ── Case 3: warning absent when there are no milestone claims ─────────────

  it("clears hasDoubleCountRisk when agriEnvYearTotal is zero even if unlinked txs exist", () => {
    const costs = [agriEnvIncome()];
    const { hasDoubleCountRisk } = agriEnvDoubleCountRisk(costs, NO_MILESTONES);
    expect(hasDoubleCountRisk).toBe(false);
  });

  // ── Case 4: no agri-env transactions at all ───────────────────────────────

  it("returns no risk when costs contains no agri-env transactions", () => {
    const costs = [cropSaleIncome()];
    const { hasDoubleCountRisk, agriEnvSchemeTxs, unlinkedTotal } = agriEnvDoubleCountRisk(
      costs,
      MILESTONE_YEAR_TOTAL,
    );
    expect(hasDoubleCountRisk).toBe(false);
    expect(agriEnvSchemeTxs).toHaveLength(0);
    expect(unlinkedTotal).toBe(0);
  });

  it("returns no risk when costs is empty", () => {
    const { hasDoubleCountRisk } = agriEnvDoubleCountRisk([], MILESTONE_YEAR_TOTAL);
    expect(hasDoubleCountRisk).toBe(false);
  });

  // ── Case 5: expense transactions are not counted ──────────────────────────

  it("ignores agri-env expense transactions — they cannot cause double-counting", () => {
    // An expense with the agri-env category should never trigger the warning
    const costs = [expenseTx()];
    const { hasDoubleCountRisk } = agriEnvDoubleCountRisk(costs, MILESTONE_YEAR_TOTAL);
    expect(hasDoubleCountRisk).toBe(false);
  });
});

describe("agriEnvDoubleCountRisk — derived values", () => {
  it("includes all agri-env income txs in agriEnvSchemeTxs regardless of link status", () => {
    const costs = [
      agriEnvIncome({ agriEnvProjectId: 1 }),   // linked
      agriEnvIncome({ agriEnvProjectId: null }), // unlinked
      vineyardAgriEnvIncome(),                   // unlinked vineyard
      cropSaleIncome(),                          // unrelated — must not appear
    ];
    const { agriEnvSchemeTxs } = agriEnvDoubleCountRisk(costs, MILESTONE_YEAR_TOTAL);
    expect(agriEnvSchemeTxs).toHaveLength(3);
  });

  it("sums only unlinked txs into unlinkedTotal", () => {
    const costs = [
      agriEnvIncome({ amountPence: 30_000, agriEnvProjectId: 7 }),  // linked — excluded
      agriEnvIncome({ amountPence: 10_000, agriEnvProjectId: null }), // unlinked
      vineyardAgriEnvIncome({ amountPence: 5_000, agriEnvProjectId: null }), // unlinked
    ];
    const { unlinkedTotal } = agriEnvDoubleCountRisk(costs, MILESTONE_YEAR_TOTAL);
    expect(unlinkedTotal).toBe(15_000);
  });
});

// ---------------------------------------------------------------------------
// calcGrossMarginTxIncomeTotal
// ---------------------------------------------------------------------------

describe("calcGrossMarginTxIncomeTotal", () => {
  it("includes all non-agri-env income in the total", () => {
    const costs = [cropSaleIncome(100_000)];
    expect(calcGrossMarginTxIncomeTotal(costs)).toBe(100_000);
  });

  it("includes unlinked agri-env income (not yet reconciled) in the total", () => {
    const costs = [agriEnvIncome({ amountPence: 20_000, agriEnvProjectId: null })];
    expect(calcGrossMarginTxIncomeTotal(costs)).toBe(20_000);
  });

  it("excludes linked agri-env income — already represented by milestone claim", () => {
    const costs = [agriEnvIncome({ amountPence: 20_000, agriEnvProjectId: 3 })];
    expect(calcGrossMarginTxIncomeTotal(costs)).toBe(0);
  });

  it("excludes linked vineyard agri-env income too", () => {
    const costs = [vineyardAgriEnvIncome({ amountPence: 15_000, agriEnvProjectId: 9 })];
    expect(calcGrossMarginTxIncomeTotal(costs)).toBe(0);
  });

  it("handles a mix: linked excluded, unlinked and other income included", () => {
    const costs = [
      cropSaleIncome(50_000),
      agriEnvIncome({ amountPence: 20_000, agriEnvProjectId: 1 }),  // linked — excluded
      agriEnvIncome({ amountPence: 10_000, agriEnvProjectId: null }), // unlinked — included
    ];
    expect(calcGrossMarginTxIncomeTotal(costs)).toBe(60_000);
  });

  it("ignores expense transactions", () => {
    const costs = [expenseTx()];
    expect(calcGrossMarginTxIncomeTotal(costs)).toBe(0);
  });

  it("returns 0 for an empty cost list", () => {
    expect(calcGrossMarginTxIncomeTotal([])).toBe(0);
  });
});
