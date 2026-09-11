import { describe, expect, it } from "vitest";
import {
  buildAccountantPackPrintTitle,
  filterAccountantPackRecords,
  shouldResetAccountantPackProjectFilter,
} from "./accountant-pack-project-filter";

const transactions = [
  { id: 1, transactionType: "income", category: "Grant / Subsidy", amountPence: 125_00, agriEnvProjectId: 10 },
  { id: 2, transactionType: "income", category: "Grant / Subsidy", amountPence: 275_00, agriEnvProjectId: 20 },
  { id: 3, transactionType: "expense", category: "Other", amountPence: 50_00, agriEnvProjectId: null },
];

describe("filterAccountantPackRecords", () => {
  it("keeps every transaction and purchase for the default all-projects view", () => {
    const result = filterAccountantPackRecords(transactions, [{ id: 99 }], null);

    expect(result.transactions.map(record => record.id)).toEqual([1, 2, 3]);
    expect(result.purchases).toEqual([{ id: 99 }]);
  });

  it("isolates one project's records for screen, CSV, and print calculations", () => {
    const result = filterAccountantPackRecords(transactions, [{ id: 99 }], 20);
    const incomeTotal = result.transactions
      .filter(record => record.transactionType === "income")
      .reduce((sum, record) => sum + record.amountPence, 0);

    expect(result.transactions.map(record => record.id)).toEqual([2]);
    expect(incomeTotal).toBe(275_00);
    expect(result.purchases).toEqual([]);
  });

  it("preserves a persisted project while either projects or transactions are loading", () => {
    expect(shouldResetAccountantPackProjectFilter("20", false, true, false)).toBe(false);
    expect(shouldResetAccountantPackProjectFilter("20", false, false, true)).toBe(false);
    expect(shouldResetAccountantPackProjectFilter("20", false, true, true)).toBe(true);
    expect(shouldResetAccountantPackProjectFilter("20", true, true, true)).toBe(false);
  });

  it("names the selected project safely in the generated print title", () => {
    expect(buildAccountantPackPrintTitle(
      "Test & Sons",
      "2026",
      null,
      "SFI </title><script>alert(1)</script>",
    )).toBe(
      "Accountant's Financial Pack — Test &amp; Sons — 2026 — SFI &lt;/title&gt;&lt;script&gt;alert(1)&lt;/script&gt;",
    );
  });
});