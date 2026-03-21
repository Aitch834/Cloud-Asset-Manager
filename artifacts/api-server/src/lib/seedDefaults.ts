import { db, rolesTable, modulesTable, tenantsTable, farmsTable, subscriptionsTable } from "@workspace/db";
import { cropsTable, fieldCropAssignmentsTable, fieldsTable, livestockMovementsTable, fieldOperationsTable } from "@workspace/db/schema";
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
  { key: "livestock-management", name: "Livestock Management", description: "Herd/flock register, movements, medicines, feed, water quality testing with lab certificate storage, mortality and vet health plans", monthlyPricePence: 3000 },
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
  { key: "dairy-management", name: "Dairy Management", description: "Milk recording (SCC, yield, TBC), mastitis records, calving records with colostrum management, body condition scoring, mobility scoring, bulk tank records, and dry cow therapy documentation", monthlyPricePence: 2500 },
  { key: "workshop-management", name: "Workshop & Asset Management", description: "Unique asset numbers, QR code labels, job cards for repairs and servicing, service schedules, downtime tracking and fleet overview", monthlyPricePence: 2000 },
  { key: "sms-alerts", name: "SMS Text Alerts", description: "Receive critical compliance alerts by text message — unnotified livestock movements, expired staff certificates, water quality failures, and overdue non-conformances", monthlyPricePence: 400 },
  { key: "business-reports", name: "Business Reports", description: "Gross margin analysis, P&L statement, input cost breakdown, grain position, subsidy summary, year-on-year comparison and asset register with depreciation", monthlyPricePence: 500 },
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
  await seedFieldOperations(farm.id);
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

async function seedFieldOperations(farmId: number) {
  const existing = await db.select().from(fieldOperationsTable).where(eq(fieldOperationsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;

  const yr = new Date().getFullYear();
  const prevYr = yr - 1;

  const fieldRows = await db.select({ id: fieldsTable.id, name: fieldsTable.name, areaHa: fieldsTable.areaHa }).from(fieldsTable).where(eq(fieldsTable.farmId, farmId)).limit(8);

  const getField = (name: string) => fieldRows.find((f) => f.name?.toLowerCase().includes(name.toLowerCase())) ?? fieldRows[0];

  const ops: (typeof fieldOperationsTable.$inferInsert)[] = [
    {
      farmId,
      fieldId: getField("Home")?.id ?? fieldRows[0]?.id ?? null,
      fieldName: getField("Home")?.name ?? "Home Field",
      operationDate: new Date(`${prevYr}-09-18`),
      operationType: "ploughing",
      implement: "Lemken Diamant 11 5-furrow",
      workingDepthCm: 27,
      passes: 1,
      areaHa: getField("Home")?.areaHa ?? "18.40",
      operator: "Tom Barker",
      notes: "Good soil conditions, turned in wheat stubble. Headlands completed last.",
    },
    {
      farmId,
      fieldId: getField("North")?.id ?? fieldRows[1]?.id ?? null,
      fieldName: getField("North")?.name ?? "North Block",
      operationDate: new Date(`${prevYr}-09-25`),
      operationType: "subsoiling",
      implement: "Sumo Trio 5m",
      workingDepthCm: 40,
      passes: 1,
      areaHa: getField("North")?.areaHa ?? "22.10",
      operator: "Tom Barker",
      notes: "Compaction evident at 35cm — broke through pan successfully.",
    },
    {
      farmId,
      fieldId: getField("Home")?.id ?? fieldRows[0]?.id ?? null,
      fieldName: getField("Home")?.name ?? "Home Field",
      operationDate: new Date(`${prevYr}-10-02`),
      operationType: "power_harrowing",
      implement: "Horsch Joker 6RT",
      workingDepthCm: 8,
      passes: 1,
      areaHa: getField("Home")?.areaHa ?? "18.40",
      operator: "Tom Barker",
      notes: "Pre-drilling consolidation — good tilth achieved.",
    },
    {
      farmId,
      fieldId: getField("South")?.id ?? fieldRows[2]?.id ?? null,
      fieldName: getField("South")?.name ?? "South Meadow",
      operationDate: new Date(`${prevYr}-10-10`),
      operationType: "lime_spreading",
      implement: "Amazone ZGB 8200 spreader",
      workingDepthCm: null,
      passes: 1,
      areaHa: getField("South")?.areaHa ?? "14.60",
      quantity: "4.0",
      quantityUnit: "t/ha",
      operator: "BDE Contracting Ltd",
      notes: "Ground limestone applied per soil test rec. pH was 5.8 targeting 6.5.",
    },
    {
      farmId,
      fieldId: getField("North")?.id ?? fieldRows[1]?.id ?? null,
      fieldName: getField("North")?.name ?? "North Block",
      operationDate: new Date(`${prevYr}-10-15`),
      operationType: "cambridge_rolling",
      implement: "8m Cambridge roll set",
      workingDepthCm: null,
      passes: 1,
      areaHa: getField("North")?.areaHa ?? "22.10",
      operator: "Tom Barker",
      notes: "Post-drilling consolidation. Rolled within 24hrs of drilling.",
    },
    {
      farmId,
      fieldId: getField("South")?.id ?? fieldRows[2]?.id ?? null,
      fieldName: getField("South")?.name ?? "South Meadow",
      operationDate: new Date(`${yr}-02-20`),
      operationType: "tine_harrowing",
      implement: "Vaderstad Carrier 500",
      workingDepthCm: 5,
      passes: 1,
      areaHa: getField("South")?.areaHa ?? "14.60",
      operator: "Tom Barker",
      notes: "Spring tine pass on established OSR — removed debris, improved airflow.",
    },
    {
      farmId,
      fieldId: getField("Home")?.id ?? fieldRows[0]?.id ?? null,
      fieldName: getField("Home")?.name ?? "Home Field",
      operationDate: new Date(`${yr}-03-05`),
      operationType: "slug_pellets",
      implement: "Accord Optima HD drill slug pellet unit",
      workingDepthCm: null,
      passes: 1,
      areaHa: getField("Home")?.areaHa ?? "18.40",
      quantity: "7",
      quantityUnit: "kg/ha",
      operator: "Tom Barker",
      notes: "Ferric phosphate pellets applied post-drilling. High slug pressure observed.",
    },
    {
      farmId,
      fieldId: getField("North")?.id ?? fieldRows[1]?.id ?? null,
      fieldName: getField("North")?.name ?? "North Block",
      operationDate: new Date(`${yr}-03-12`),
      operationType: "rolling",
      implement: "10m flat roll",
      workingDepthCm: null,
      passes: 1,
      areaHa: getField("North")?.areaHa ?? "22.10",
      operator: "Tom Barker",
      notes: "Spring rolling — winter barley had been frosted up slightly.",
    },
  ];

  await db.insert(fieldOperationsTable).values(ops);
  console.log("[SEED] Dev field operations seeded for farm:", farmId);
}
