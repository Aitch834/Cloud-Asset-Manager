export interface TransactionWithAgriEnvLink {
  id: number;
  agriEnvProjectId: number | null;
}

/**
 * Apply the visible project link change without waiting for the server.
 *
 * Keeping this as a pure helper makes the optimistic update and its rollback
 * easy to exercise without importing the native screen into unit tests.
 */
export function applyTransactionProjectLink<T extends TransactionWithAgriEnvLink>(
  transactions: readonly T[],
  transactionId: number,
  projectId: number | null,
): T[] {
  return transactions.map((transaction) =>
    transaction.id === transactionId
      ? { ...transaction, agriEnvProjectId: projectId }
      : transaction,
  );
}