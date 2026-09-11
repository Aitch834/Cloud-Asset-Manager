export type FullPlCategoryTotal = {
  cat: string;
  total: number;
};

export function buildFullPlCsvRows(
  incomeByCategory: FullPlCategoryTotal[],
  expenseByCategory: FullPlCategoryTotal[],
  periodLabel: string,
): unknown[][] {
  const toGbp = (pence: number) => (pence / 100).toFixed(2);
  const totalIncome = incomeByCategory.reduce((sum, row) => sum + row.total, 0);
  const totalExpense = expenseByCategory.reduce((sum, row) => sum + row.total, 0);

  return [
    ["Category", "Type", "Amount (£)", "Period"],
    ...incomeByCategory.map(row => [row.cat, "Income", toGbp(row.total), periodLabel]),
    ...expenseByCategory.map(row => [row.cat, "Expense", toGbp(row.total), periodLabel]),
    ["Total Income", "Income", toGbp(totalIncome), periodLabel],
    ["Total Expenditure", "Expense", toGbp(totalExpense), periodLabel],
    ["Net Profit / Loss", "Net", toGbp(totalIncome - totalExpense), periodLabel],
  ];
}