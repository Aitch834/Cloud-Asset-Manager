export const SMS_CATEGORIES: ReadonlyArray<{
  key: string;
  label: string;
  description: string;
  moduleGates: ReadonlyArray<string>;
}> = [
  {
    key: "livestock",
    label: "Livestock & Animals",
    description: "Welfare alerts, withdrawal breaches, notifiable disease, herd health follow-ups.",
    moduleGates: [
      "livestock-management", "livestock",
      "beef-production", "sheep-production", "goat-production", "venison-production",
      "pig-production", "poultry-production",
      "organic-livestock",
    ],
  },
  {
    key: "dairy",
    label: "Dairy",
    description: "ABR test results, mastitis records, mobility scoring alerts.",
    moduleGates: [
      "dairy-management",
      "sheep-dairy", "goat-dairy",
      "organic-dairy", "organic-sheep-dairy", "organic-goat-dairy",
    ],
  },
  {
    key: "arable",
    label: "Arable & Crops",
    description: "IPM pest/disease threshold alerts, irrigation advisories, field scouting flags.",
    moduleGates: [
      "field-crop-management", "crop-management",
      "fresh-produce", "organic-fresh-produce",
      "water-irrigation",
      "organic-arable",
    ],
  },
  {
    key: "viticulture",
    label: "Viticulture & Winery",
    description: "Vineyard and winery compliance alerts.",
    moduleGates: ["viticulture"],
  },
  {
    key: "tasks",
    label: "Task Assignments & Reminders",
    description: "Notifications when tasks are assigned to you, and timesheet submission reminders.",
    moduleGates: [],
  },
  {
    key: "regulatory",
    label: "Regulatory Compliance",
    description: "Withdrawal period breaches, biosecurity declarations, SSAFO inspections, RIDDOR incidents.",
    moduleGates: [],
  },
  {
    key: "quality",
    label: "Quality & Non-conformances",
    description: "Non-conformance records, corrective actions, feed intake rejections.",
    moduleGates: [],
  },
  {
    key: "stock",
    label: "Stock & Supplies",
    description: "Stock-low and stock-out alerts across feed, medicines, and supplies.",
    moduleGates: [],
  },
];
