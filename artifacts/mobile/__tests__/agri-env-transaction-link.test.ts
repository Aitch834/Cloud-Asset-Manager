import fs from "node:fs";
import path from "node:path";

import {
  applyTransactionProjectLink,
  type TransactionWithAgriEnvLink,
} from "../lib/agri-env-transaction-link";

const screenSource = fs.readFileSync(
  path.resolve(__dirname, "../app/agri-env-projects.tsx"),
  "utf8",
);

const transactions: TransactionWithAgriEnvLink[] = [
  { id: 101, agriEnvProjectId: null },
  { id: 102, agriEnvProjectId: 7 },
];

describe("agri-environment transaction project links", () => {
  it("shows a newly selected project immediately without changing other payments", () => {
    expect(applyTransactionProjectLink(transactions, 101, 12)).toEqual([
      { id: 101, agriEnvProjectId: 12 },
      { id: 102, agriEnvProjectId: 7 },
    ]);
  });

  it("removes a project link immediately when unlinking", () => {
    expect(applyTransactionProjectLink(transactions, 102, null)).toEqual([
      { id: 101, agriEnvProjectId: null },
      { id: 102, agriEnvProjectId: null },
    ]);
  });

  it("leaves the transaction list unchanged when the requested id is absent", () => {
    expect(applyTransactionProjectLink(transactions, 999, 12)).toEqual(transactions);
  });

  it("rolls optimistic updates back after a failed PATCH", () => {
    const optimistic = applyTransactionProjectLink(transactions, 101, 12);
    expect(applyTransactionProjectLink(optimistic, 101, null)).toEqual(transactions);
  });
});

describe("transaction-link screen wiring", () => {
  it("applies the optimistic link before awaiting the PATCH and rolls it back on error", () => {
    const optimisticUpdate = screenSource.indexOf(
      "setTransactions((prev) => applyTransactionProjectLink(prev, txId, projectId))",
    );
    const closesSheet = screenSource.indexOf("setLinkingTx(null)", optimisticUpdate);
    const request = screenSource.indexOf("const res = await apiFetch(", optimisticUpdate);
    const rollback = screenSource.indexOf(
      "setTransactions((prev) => applyTransactionProjectLink(prev, txId, previousProjectId))",
      request,
    );

    expect(optimisticUpdate).toBeGreaterThanOrEqual(0);
    expect(closesSheet).toBeGreaterThan(optimisticUpdate);
    expect(closesSheet).toBeLessThan(request);
    expect(request).toBeGreaterThan(optimisticUpdate);
    expect(rollback).toBeGreaterThan(request);
    expect(screenSource).toContain('Alert.alert("Error", "Could not update the project link. Please try again.")');
  });

  it("uses the farm-scoped project list and real link endpoint", () => {
    expect(screenSource).toContain(
      "apiFetch(`/api/farms/${currentFarm.id}/agri-env-projects`)",
    );
    expect(screenSource).toContain(
      "financial-transactions/${txId}/link-agri-env",
    );
    expect(screenSource).toContain('body: JSON.stringify({ agriEnvProjectId: projectId })');
    expect(screenSource).toContain("projects.map(p =>");
  });

  it("exposes link, unlink, project-option, and confirm controls for mobile checks", () => {
    expect(screenSource).toContain("agri-env-link-transaction-${tx.id}");
    expect(screenSource).toContain("agri-env-unlink-transaction-${tx.id}");
    expect(screenSource).toContain("agri-env-project-option-${p.id}");
    expect(screenSource).toContain('testID="agri-env-confirm-transaction-link"');
  });
});