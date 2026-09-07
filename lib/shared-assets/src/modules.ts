export interface SalesModule {
  id: string;
  label: string;
}

/**
 * Canonical sales-facing module IDs and labels.
 *
 * Pricing, lead-capture forms, and sales lead details must all derive their
 * labels from this catalogue so a module can never degrade to a technical ID.
 */
export const SALES_MODULES: readonly SalesModule[] = [
  { id: "red-tractor-compliance", label: "Red Tractor Compliance" },
  { id: "field-crop-management", label: "Field & Crop Management" },
  { id: "crop-trials", label: "Crop Trials" },
  { id: "sprays-inputs", label: "Sprays & Inputs" },
  { id: "soil-management", label: "Soil Management" },
  { id: "equipment-workshop", label: "Equipment, Workshop & Fuel" },
  { id: "livestock-management", label: "Livestock & Feed Management" },
  { id: "biosecurity", label: "Biosecurity & Visitors" },
  { id: "organic-compliance", label: "Organic Compliance" },
  { id: "organic-livestock", label: "Organic Livestock" },
  { id: "organic-dairy", label: "Organic Dairy" },
  { id: "organic-fresh-produce", label: "Organic Fresh Produce" },
  { id: "organic-arable", label: "Organic Arable" },
  { id: "staff-training", label: "Staff & Training" },
  { id: "safety-risk-audits", label: "Safety, Risk & Audits" },
  { id: "environment-sustainability", label: "Environment & Sustainability" },
  { id: "water-irrigation", label: "Water & Irrigation Management" },
  { id: "finance-business", label: "Finance & Business" },
  { id: "weather-tracking", label: "Weather Tracking" },
  { id: "platform-addons", label: "Platform Add-ons" },
  { id: "biofuel-rtfo", label: "Biofuel / RTFO Compliance" },
  { id: "report-builder", label: "Report Builder" },
  { id: "data-api", label: "Data API Access" },
  { id: "sheep-production", label: "Sheep Production" },
  { id: "goat-production", label: "Goat Production" },
  { id: "venison-production", label: "Venison Production" },
  { id: "organic-venison", label: "Organic Venison" },
  { id: "beef-production", label: "Beef Production" },
  { id: "pig-production", label: "Pig Production" },
  { id: "poultry-production", label: "Poultry Production" },
  { id: "organic-poultry", label: "Organic Poultry" },
  { id: "fresh-produce", label: "Fresh Produce" },
  { id: "viticulture", label: "Viticulture" },
  { id: "organic-viticulture", label: "Organic Viticulture" },
  { id: "farm-diversification", label: "Farm Diversification" },
  { id: "grain-crop-storage", label: "Grain & Crop Storage" },
  { id: "farm-services-contracting", label: "Farm Services & Contracting" },
  { id: "resource-planner", label: "Resource Planner" },
] as const;

export const SALES_MODULE_LABELS: Readonly<Record<string, string>> =
  Object.freeze({
    ...Object.fromEntries(SALES_MODULES.map(({ id, label }) => [id, label])),
    // Historical lead value retained for records created before the canonical
    // finance-business ID was introduced.
    finance: "Finance & Business",
  });

export function salesModuleLabel(id: string): string {
  return SALES_MODULE_LABELS[id] ?? `Unknown module (${id})`;
}