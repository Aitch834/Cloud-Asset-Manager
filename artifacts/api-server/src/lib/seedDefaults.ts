import { db, rolesTable, modulesTable, tenantsTable, farmsTable, subscriptionsTable } from "@workspace/db";
import { cropsTable, fieldCropAssignmentsTable, fieldsTable, livestockMovementsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

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
  { key: "livestock-management", name: "Livestock Management", description: "Herd/flock register, movements, medicines, feed and water records", monthlyPricePence: 3000 },
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
  { key: "biofuel-rtfo", name: "Biofuel / RTFO Compliance", description: "RTFO sustainability declarations, field eligibility, GHG traceability, and audit pack generation for farms supplying biofuel feedstocks", monthlyPricePence: 3000 },
  { key: "sms-alerts", name: "SMS Text Alerts", description: "Receive critical compliance alerts by text message — unnotified movements, expired certificates, and overdue non-conformances", monthlyPricePence: 400 },
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

  if (process.env.NODE_ENV === "development") {
    await seedDevData();
  }
}

async function seedDevData() {
  const DEV_TENANT_SLUG = "oakfield-farms";
  const DEV_FARM_NAME = "Oakfield Arable & Beef Farm";

  let [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.slug, DEV_TENANT_SLUG)).limit(1);
  if (!tenant) {
    [tenant] = await db.insert(tenantsTable).values({
      name: "Oakfield Farms Ltd",
      slug: DEV_TENANT_SLUG,
      isActive: true,
    }).returning();
    console.log("[SEED] Created dev tenant:", DEV_TENANT_SLUG);
  }

  let [farm] = await db.select().from(farmsTable).where(and(
    eq(farmsTable.tenantId, tenant.id),
    eq(farmsTable.name, DEV_FARM_NAME),
  )).limit(1);

  if (!farm) {
    [farm] = await db.insert(farmsTable).values({
      tenantId: tenant.id,
      name: DEV_FARM_NAME,
      address: "Oakfield Lane, Ripon, North Yorkshire",
      postcode: "HG4 2RB",
      cphNumber: "32/541/0072",
      gridReference: "SE 354 742",
      totalAcreage: 648,
      sectorArable: true,
      sectorBeef: true,
      sectorDairy: false,
      sectorPigs: false,
      sectorPoultry: false,
      sectorHorticulture: false,
      isActive: true,
    }).returning();
    console.log("[SEED] Created dev farm:", DEV_FARM_NAME);
  }

  const allModules = await db.select().from(modulesTable);
  for (const mod of allModules) {
    const existing = await db.select().from(subscriptionsTable).where(and(
      eq(subscriptionsTable.farmId, farm.id),
      eq(subscriptionsTable.tenantId, tenant.id),
      eq(subscriptionsTable.moduleId, mod.id),
    )).limit(1);

    if (existing.length === 0) {
      const periodStart = new Date();
      const periodEnd = new Date(periodStart);
      periodEnd.setFullYear(periodEnd.getFullYear() + 10);
      await db.insert(subscriptionsTable).values({
        tenantId: tenant.id,
        farmId: farm.id,
        moduleId: mod.id,
        status: "active",
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      });
    }
  }
  console.log("[SEED] Dev subscriptions ensured for all modules on farm:", farm.id);

  await seedCropData(farm.id);
  await seedMovementData(farm.id);
}

async function seedCropData(farmId: number) {
  const DEV_CROPS = [
    { name: "Winter Wheat", variety: "KWS Zyatt", category: "Combinable Crops" },
    { name: "Oil Seed Rape", variety: "Extase", category: "Oilseeds" },
    { name: "Spring Barley", variety: "Laureate", category: "Combinable Crops" },
    { name: "Field Beans", variety: "Lynx", category: "Pulses" },
  ];

  const existingCrops = await db.select().from(cropsTable).where(eq(cropsTable.farmId, farmId));
  if (existingCrops.length > 0) return;

  const seededCrops = await db.insert(cropsTable).values(
    DEV_CROPS.map(c => ({ ...c, farmId }))
  ).returning();

  const fields = await db.select().from(fieldsTable).where(eq(fieldsTable.farmId, farmId));
  if (fields.length === 0) return;

  const currentYear = new Date().getFullYear();
  const assignments = [
    { fieldId: fields[0]?.id, cropId: seededCrops[0]?.id, plantingDate: new Date(`${currentYear - 1}-10-12`), expectedHarvestDate: new Date(`${currentYear}-08-20`), season: `Winter ${currentYear - 1}/${String(currentYear).slice(2)}`, year: currentYear },
    { fieldId: fields[1]?.id, cropId: seededCrops[1]?.id, plantingDate: new Date(`${currentYear - 1}-09-05`), expectedHarvestDate: new Date(`${currentYear}-07-25`), season: `Winter ${currentYear - 1}/${String(currentYear).slice(2)}`, year: currentYear },
    { fieldId: fields[2]?.id, cropId: seededCrops[2]?.id, plantingDate: new Date(`${currentYear}-04-03`), expectedHarvestDate: new Date(`${currentYear}-08-15`), season: `Spring ${currentYear}`, year: currentYear },
  ].filter(a => a.fieldId && a.cropId);

  if (assignments.length > 0) {
    await db.insert(fieldCropAssignmentsTable).values(assignments as typeof fieldCropAssignmentsTable.$inferInsert[]);
  }
  console.log("[SEED] Dev crop data seeded for farm:", farmId);
}

async function seedMovementData(farmId: number) {
  const existing = await db.select().from(livestockMovementsTable).where(eq(livestockMovementsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;

  const yr = new Date().getFullYear();
  const movements = [
    {
      farmId,
      movementType: "on",
      movementDate: new Date(`${yr}-02-14`),
      fromLocation: "32/541/0018 — Harrogate Auction Mart",
      toLocation: "32/541/0072",
      numberOfAnimals: 24,
      licenceNumber: "AML2-2026-00147",
      transporterDetails: "J. Haigh Haulage, HG4 8TP, YR73 BXK",
      reason: "Purchase — store cattle",
      notes: "24 Limousin cross store bullocks purchased at Harrogate",
    },
    {
      farmId,
      movementType: "off",
      movementDate: new Date(`${yr}-03-04`),
      fromLocation: "32/541/0072",
      toLocation: "ABP Malton Abattoir — 21/223/0001",
      numberOfAnimals: 8,
      licenceNumber: "AML2-2026-00291",
      transporterDetails: "ABP Transport Ltd, YO17 7DL, YX21 ELP",
      reason: "Slaughter — finished beef",
      notes: "8 finished Charolais cross steers dispatched to ABP Malton",
    },
    {
      farmId,
      movementType: "between",
      movementDate: new Date(`${yr}-03-10`),
      fromLocation: "32/541/0072 — Home Farm",
      toLocation: "32/541/0091 — North Block",
      numberOfAnimals: 12,
      licenceNumber: null,
      transporterDetails: null,
      reason: "Grazing rotation",
      notes: "12 suckler cows moved to North Block for spring grazing",
    },
  ];

  await db.insert(livestockMovementsTable).values(movements);
  console.log("[SEED] Dev movement records seeded for farm:", farmId);
}
