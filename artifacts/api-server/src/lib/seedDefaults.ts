import { db, rolesTable, modulesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const SYSTEM_ROLES = [
  { name: "BDE Super Admin", description: "Full platform access — BDE staff only", isSystemRole: true },
  { name: "Client Admin", description: "Full access to tenant management", isSystemRole: true },
  { name: "Farm Manager", description: "Full access to assigned farms", isSystemRole: true },
  { name: "Farm Staff", description: "Limited access based on permissions", isSystemRole: true },
];

const MODULES = [
  { key: "red-tractor-compliance", name: "Red Tractor Compliance", description: "Core compliance tracking and audit management", monthlyPricePence: 2500 },
  { key: "field-crop-management", name: "Field & Crop Management", description: "Field mapping, crop rotation, planting and harvest records", monthlyPricePence: 2000 },
  { key: "sprays-inputs", name: "Sprays & Inputs", description: "Spray applications, product tracking, nutrient management plans", monthlyPricePence: 1500 },
  { key: "soil-management", name: "Soil Management", description: "Soil test records, nutrient analysis", monthlyPricePence: 1000 },
  { key: "equipment-management", name: "Equipment & Vehicle Management", description: "Equipment register, maintenance logs, calibration records", monthlyPricePence: 1500 },
  { key: "livestock-management", name: "Livestock Management", description: "Herd/flock register, movements, medicines, feed and water records", monthlyPricePence: 3000, requiresSector: "livestock" },
  { key: "biosecurity", name: "Biosecurity & Visitors", description: "Visitor log, pest control, cleaning and disinfection records", monthlyPricePence: 1000 },
  { key: "staff-training", name: "Staff & Training", description: "Training records, certificates, competency tracking", monthlyPricePence: 1000 },
  { key: "risk-waste", name: "Risk & Waste Management", description: "Risk assessments, COSHH, waste disposal records", monthlyPricePence: 1000 },
  { key: "inspections", name: "Inspections & Audits", description: "Inspection records, non-conformances, corrective actions", monthlyPricePence: 1500 },
  { key: "environmental", name: "Environmental Features", description: "Environmental features mapping, agri-environment scheme records", monthlyPricePence: 1000 },
  { key: "haulage-transport", name: "Transport & Haulage", description: "Haulage records, load tracking", monthlyPricePence: 1000 },
  { key: "stock-suppliers", name: "Stock & Supplier Tracking", description: "Supplier management, stock deliveries, stock levels", monthlyPricePence: 1500 },
  { key: "financial-records", name: "Financial Records", description: "Financial transactions, VAT tracking, export reports", monthlyPricePence: 2000 },
  { key: "document-management", name: "Document Management", description: "Document storage, linked records, object storage", monthlyPricePence: 1000 },
  { key: "weather-tracking", name: "Weather Tracking", description: "Weather stations, automated readings, field-level data", monthlyPricePence: 1500 },
];

export async function seedDefaults() {
  for (const role of SYSTEM_ROLES) {
    const existing = await db.select().from(rolesTable).where(eq(rolesTable.name, role.name)).limit(1);
    if (existing.length === 0) {
      await db.insert(rolesTable).values(role);
    }
  }

  for (const mod of MODULES) {
    const existing = await db.select().from(modulesTable).where(eq(modulesTable.key, mod.key)).limit(1);
    if (existing.length === 0) {
      await db.insert(modulesTable).values(mod);
    }
  }

  console.log("Default roles and modules seeded");
}
