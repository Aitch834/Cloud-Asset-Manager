type ProjectLinkedRecord = {
  agriEnvProjectId?: number | null;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildAccountantPackPrintTitle(
  farmName: string,
  periodLabel: string,
  enterpriseLabel: string | null,
  projectLabel: string | null,
): string {
  return `Accountant's Financial Pack — ${[
    farmName,
    periodLabel,
    enterpriseLabel,
    projectLabel,
  ].filter((value): value is string => !!value).map(escapeHtml).join(" — ")}`;
}

export function filterAccountantPackRecords<
  TTransaction extends ProjectLinkedRecord,
  TPurchase,
>(
  transactions: TTransaction[],
  purchases: TPurchase[],
  projectId: number | null,
): { transactions: TTransaction[]; purchases: TPurchase[] } {
  if (projectId == null) {
    return { transactions, purchases };
  }

  return {
    transactions: transactions.filter(record => Number(record.agriEnvProjectId) === projectId),
    purchases: [],
  };
}

export function shouldResetAccountantPackProjectFilter(
  projectFilter: string,
  selectedProjectExists: boolean,
  projectsSettled: boolean,
  transactionsSettled: boolean,
): boolean {
  return projectFilter !== "all"
    && projectsSettled
    && transactionsSettled
    && !selectedProjectExists;
}