import { db, rolesTable, modulesTable, tenantsTable, farmsTable, subscriptionsTable } from "@workspace/db";
import { cropsTable, fieldCropAssignmentsTable, fieldsTable, livestockMovementsTable, fieldOperationsTable, fuelTanksTable, fuelDeliveriesTable, fuelUsageTable, fuelStorageInspectionsTable, feedDeliveriesTable, feedStockLevelsTable, suppliersTable, gridEnergyMetersTable, gridEnergyReadingsTable, grainStorageBinsTable } from "@workspace/db/schema";
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
  { key: "risk-waste", name: "Health, Safety & Risk Management", description: "Risk assessments, COSHH records, PAT testing, fire extinguisher register, accident book, waste disposal, fly-tipping and encampment records", monthlyPricePence: 1000 },
  { key: "inspections", name: "Inspections & Audits", description: "Inspection records, non-conformances, corrective actions", monthlyPricePence: 1500 },
  { key: "environmental", name: "Environmental Features", description: "Environmental features mapping, agri-environment scheme records", monthlyPricePence: 1000 },
  { key: "haulage-transport", name: "Transport & Haulage", description: "Haulage records, load tracking", monthlyPricePence: 1000 },
  { key: "stock-suppliers", name: "Trade Contacts & Stock", description: "Trade contact management, stock deliveries, stock levels", monthlyPricePence: 1500 },
  { key: "financial-records", name: "Financial Records", description: "Financial transactions, VAT tracking, export reports", monthlyPricePence: 2000 },
  { key: "document-management", name: "Document Management", description: "Document storage, linked records, object storage", monthlyPricePence: 1000 },
  { key: "weather-tracking", name: "Weather Tracking", description: "Weather stations, automated readings, field-level data", monthlyPricePence: 1500 },
  { key: "biofuel-rtfo", name: "Biofuel / RTFO Compliance", description: "RTFO sustainability declarations, field eligibility, GHG traceability, and audit pack generation for farms supplying biofuel feedstocks", monthlyPricePence: 3000 },
  { key: "dairy-management", name: "Dairy Management", description: "Milk recording (SCC, yield, TBC), mastitis records, calving records with colostrum management, body condition scoring, mobility scoring, bulk tank records, and dry cow therapy documentation", monthlyPricePence: 2500 },
  { key: "workshop-management", name: "Workshop & Asset Management", description: "Unique asset numbers, QR code labels, job cards for repairs and servicing, service schedules, downtime tracking and fleet overview", monthlyPricePence: 2000 },
  { key: "sms-alerts", name: "SMS Text Alerts", description: "Receive critical compliance alerts by text message — unnotified livestock movements, expired staff certificates, water quality failures, and overdue non-conformances", monthlyPricePence: 400 },
  { key: "business-reports", name: "Business Reports", description: "Gross margin analysis, P&L statement, input cost breakdown, grain position, subsidy summary, year-on-year comparison and asset register with depreciation", monthlyPricePence: 500 },
  { key: "pig_production", name: "Pig Production", description: "Medicine records, medication book, feed & nutrition, mortality, slaughter records, movements and vet visits for pig enterprises", monthlyPricePence: 2500 },
  { key: "poultry_production", name: "Poultry Production", description: "Flock register, daily welfare checks, medicine records, mortality, thinning & depletion, litter & environment and Salmonella NCP testing", monthlyPricePence: 2500 },
  { key: "horticulture", name: "Horticulture & Fresh Produce", description: "Crop records, spray records with PHI, soil & substrate, harvest records, worker welfare and traceability for fresh produce growers", monthlyPricePence: 2000 },
  { key: "carbon_sustainability", name: "Carbon & Sustainability", description: "Farm carbon footprint, renewable energy, biodiversity actions, soil carbon and sustainability goals tracking", monthlyPricePence: 1000 },
  { key: "farm_diversification", name: "Farm Diversification", description: "Activities register, farm shop, hygiene inspections, equine register, renewables income and shooting records", monthlyPricePence: 1500 },
  { key: "water_irrigation", name: "Water & Irrigation Management", description: "Water source register, abstraction log, irrigation events, water quality testing and infrastructure maintenance", monthlyPricePence: 1000 },
  { key: "fuel-energy", name: "Fuel & Energy Management", description: "Red diesel tank register, delivery log, usage recording linked to machinery and field operations, oil storage compliance inspections — HMRC-compliant records for rebated fuel", monthlyPricePence: 800 },
  { key: "feed-management", name: "Feed Management", description: "Feed delivery goods-received records with UFAS/FEMAS traceability, feed stock levels per species, medicated feed withdrawal tracking, and supplier approval number recording", monthlyPricePence: 800 },
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
  await seedGrainBins(farm.id);
  await seedFuelData(farm.id);
  await seedLpgAndHeatingOilTanks(farm.id);
  await seedGridEnergyData(farm.id);
  await seedFeedDeliveryData(farm.id);
  await seedFeedStockData(farm.id);
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

  const fieldRows = await db.select({ id: fieldsTable.id, name: fieldsTable.name, areaHa: fieldsTable.areaHectares }).from(fieldsTable).where(eq(fieldsTable.farmId, farmId)).limit(8);

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

async function seedFuelData(farmId: number) {
  const existing = await db.select().from(fuelTanksTable).where(eq(fuelTanksTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;

  const yr = new Date().getFullYear();

  const [tank1] = await db.insert(fuelTanksTable).values({
    farmId,
    name: "Main Yard Tank",
    fuelType: "red_diesel",
    capacityLitres: "10000",
    currentStockLitres: "3240",
    location: "Main Yard — adjacent to workshop",
    isBunded: true,
    bundCapacityLitres: "11000",
    tankMaterial: "steel",
    installDate: "2017-04-01",
    lastInspectionDate: `${yr - 1}-11-14`,
    nextInspectionDue: `${yr}-11-14`,
    notes: "Primary on-farm fuel tank. Bunded steel tank, fill point locked.",
    isActive: true,
  }).returning();

  const [tank2] = await db.insert(fuelTanksTable).values({
    farmId,
    name: "North Block Field Tank",
    fuelType: "red_diesel",
    capacityLitres: "3000",
    currentStockLitres: "820",
    location: "North Block — south corner",
    isBunded: false,
    tankMaterial: "plastic",
    installDate: "2020-07-15",
    lastInspectionDate: `${yr - 1}-11-14`,
    nextInspectionDue: `${yr}-11-14`,
    notes: "Secondary tank for field operations. Requires bunding assessment — flagged for upgrade.",
    isActive: true,
  }).returning();

  if (!tank1 || !tank2) return;

  await db.insert(fuelDeliveriesTable).values([
    {
      farmId, tankId: tank1.id, fuelType: "red_diesel",
      deliveryDate: new Date(`${yr}-01-08`),
      quantityLitres: "5000",
      unitPricePence: 78,
      totalCostPence: 390000,
      invoiceReference: "NRG-2026-00441",
      deliveryNoteNumber: "DN-441-A",
      supplierName: "Northern Energy Fuels Ltd",
      driverName: "P. Smithson",
      qualifyingUse: "agriculture",
      notes: "Winter stock-up delivery. Tank was at 15% when filled.",
    },
    {
      farmId, tankId: tank1.id, fuelType: "red_diesel",
      deliveryDate: new Date(`${yr}-03-03`),
      quantityLitres: "3000",
      unitPricePence: 76,
      totalCostPence: 228000,
      invoiceReference: "NRG-2026-00812",
      deliveryNoteNumber: "DN-812-A",
      supplierName: "Northern Energy Fuels Ltd",
      driverName: "P. Smithson",
      qualifyingUse: "agriculture",
      notes: "Spring cultivations top-up.",
    },
    {
      farmId, tankId: tank2.id, fuelType: "red_diesel",
      deliveryDate: new Date(`${yr}-02-20`),
      quantityLitres: "1500",
      unitPricePence: 78,
      totalCostPence: 117000,
      invoiceReference: "NRG-2026-00631",
      deliveryNoteNumber: "DN-631-B",
      supplierName: "Northern Energy Fuels Ltd",
      qualifyingUse: "agriculture",
      notes: "Field tank topped up for spring drilling.",
    },
  ]);

  await db.insert(fuelUsageTable).values([
    { farmId, tankId: tank1.id, usageDate: new Date(`${yr}-01-15`), quantityLitres: "380", purpose: "Ploughing — Home Field", qualifyingActivity: "agriculture", recordedBy: "James Davidson", notes: "John Deere 8R350 — full day ploughing" },
    { farmId, tankId: tank1.id, usageDate: new Date(`${yr}-01-22`), quantityLitres: "310", purpose: "Ploughing — South Field", qualifyingActivity: "agriculture", recordedBy: "James Davidson" },
    { farmId, tankId: tank1.id, usageDate: new Date(`${yr}-02-05`), quantityLitres: "240", purpose: "Power harrowing — seedbed preparation", qualifyingActivity: "agriculture", recordedBy: "Robert Thornton" },
    { farmId, tankId: tank1.id, usageDate: new Date(`${yr}-02-12`), quantityLitres: "180", purpose: "Cattle handling & feeding — livestock operations", qualifyingActivity: "agriculture", recordedBy: "Tom Bradley", notes: "Telehandler and JCB loader" },
    { farmId, tankId: tank2.id, usageDate: new Date(`${yr}-03-08`), quantityLitres: "420", purpose: "Spring drilling — North Block winter barley", qualifyingActivity: "agriculture", recordedBy: "Robert Thornton", notes: "Horsch Avatar drill — full day 3-pass" },
    { farmId, tankId: tank1.id, usageDate: new Date(`${yr}-03-15`), quantityLitres: "290", purpose: "Spraying — pre-emergence herbicide", qualifyingActivity: "agriculture", recordedBy: "James Davidson" },
  ]);

  await db.insert(fuelStorageInspectionsTable).values([
    {
      farmId, tankId: tank1.id,
      inspectionDate: `${yr - 1}-11-14`,
      inspector: "James Davidson",
      overallResult: "pass",
      bundingOk: true,
      labellingOk: true,
      spillKitPresent: true,
      spillKitComplete: true,
      tankConditionOk: true,
      pipeworkOk: true,
      fillPointLocked: true,
      overfillProtectionOk: true,
      drainageRiskOk: true,
      nextInspectionDue: `${yr}-11-14`,
      notes: "Annual inspection — all items satisfactory. Minor surface rust on fill point — monitored.",
    },
    {
      farmId, tankId: tank2.id,
      inspectionDate: `${yr - 1}-11-14`,
      inspector: "James Davidson",
      overallResult: "advisory",
      bundingOk: false,
      labellingOk: true,
      spillKitPresent: true,
      spillKitComplete: false,
      tankConditionOk: true,
      pipeworkOk: true,
      fillPointLocked: false,
      overfillProtectionOk: true,
      drainageRiskOk: false,
      issuesFound: "Tank not bunded. Spill kit missing absorbent pads. No fill point lock fitted. Located close to field drain — drainage risk.",
      actionsRequired: "1. Source bunding solution (quote requested from Fuel Tank Shop). 2. Replace spill kit pads. 3. Fit fill point padlock. Timeline: before next delivery.",
      nextInspectionDue: `${yr}-05-14`,
      notes: "Follow-up inspection due in 6 months due to advisory items.",
    },
  ]);

  // LPG bulk tank
  await db.insert(fuelTanksTable).values({
    farmId,
    name: "Livestock Building LPG Tank",
    fuelType: "lpg_bulk",
    capacityLitres: "2000",
    currentStockLitres: "740",
    location: "Rear of livestock building — north side",
    isBunded: false,
    tankMaterial: "steel",
    installDate: "2019-06-12",
    nextInspectionDue: `${yr + 1}-06-12`,
    notes: "Calor Gas bulk propane tank. Used for livestock building space heating and hot water. DSEAR zone 2 area marked. Quarterly visual check carried out.",
    isActive: true,
  });

  // Heating oil tank
  await db.insert(fuelTanksTable).values({
    farmId,
    name: "Farmhouse Heating Oil Tank",
    fuelType: "heating_oil",
    capacityLitres: "1500",
    currentStockLitres: "680",
    location: "East side of farmhouse",
    isBunded: true,
    bundCapacityLitres: "1650",
    tankMaterial: "plastic",
    installDate: "2014-09-03",
    nextInspectionDue: `${yr}-09-03`,
    notes: "Plastic bunded heating oil (kerosene) tank serving farmhouse and cottage. Oil Storage Regs 2001 apply.",
    isActive: true,
  });

  console.log("[SEED] Fuel tanks, deliveries, usage and inspections seeded for farm:", farmId);
}

async function seedLpgAndHeatingOilTanks(farmId: number) {
  const existingLpg = await db.select().from(fuelTanksTable).where(and(eq(fuelTanksTable.farmId, farmId), eq(fuelTanksTable.fuelType, "lpg_bulk"))).limit(1);
  if (existingLpg.length === 0) {
    await db.insert(fuelTanksTable).values({
      farmId,
      name: "Livestock Building LPG Tank",
      fuelType: "lpg_bulk",
      capacityLitres: "2000",
      currentStockLitres: "740",
      location: "Rear of livestock building — north side",
      isBunded: false,
      tankMaterial: "steel",
      installDate: "2019-06-12",
      nextInspectionDue: `${new Date().getFullYear() + 1}-06-12`,
      notes: "Calor Gas bulk propane tank. Used for livestock building space heating and hot water. DSEAR zone 2 area marked. Quarterly visual check carried out.",
      isActive: true,
    });
  }

  const existingHeating = await db.select().from(fuelTanksTable).where(and(eq(fuelTanksTable.farmId, farmId), eq(fuelTanksTable.fuelType, "heating_oil"))).limit(1);
  if (existingHeating.length === 0) {
    await db.insert(fuelTanksTable).values({
      farmId,
      name: "Farmhouse Heating Oil Tank",
      fuelType: "heating_oil",
      capacityLitres: "1500",
      currentStockLitres: "680",
      location: "East side of farmhouse",
      isBunded: true,
      bundCapacityLitres: "1650",
      tankMaterial: "plastic",
      installDate: "2014-09-03",
      nextInspectionDue: `${new Date().getFullYear()}-09-03`,
      notes: "Plastic bunded heating oil (kerosene) tank serving farmhouse and cottage. Oil Storage Regs 2001 apply.",
      isActive: true,
    });
  }
  console.log("[SEED] LPG and heating oil tanks checked/seeded for farm:", farmId);
}

async function seedGridEnergyData(farmId: number) {
  const existing = await db.select().from(gridEnergyMetersTable).where(eq(gridEnergyMetersTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;

  const yr = new Date().getFullYear();

  const [elecMeter] = await db.insert(gridEnergyMetersTable).values({
    farmId,
    name: "Main Farm Supply — Electricity",
    meterType: "electricity",
    mpan: "1012345678901",
    supplier: "OVO Energy",
    accountNumber: "OVO-4821937",
    location: "Main yard fusebox",
    tariffName: "Agri Fixed 2yr",
    standingChargePencePerDay: 62,
    unitRatePencePerKwh: 24,
    notes: "Main electricity supply feeding grain store, workshops and yard lighting. Solar export from roof array also recorded here.",
    isActive: true,
  }).returning();

  const [gasMeter] = await db.insert(gridEnergyMetersTable).values({
    farmId,
    name: "Farm Office — Natural Gas",
    meterType: "natural_gas",
    mprn: "8742916",
    supplier: "British Gas Business",
    accountNumber: "BGas-74291-B",
    location: "Farm office building",
    tariffName: "SME Fixed 12m",
    standingChargePencePerDay: 28,
    unitRatePencePerKwh: 7,
    notes: "Natural gas supply to farm office boiler and kitchen. Office and meeting rooms.",
    isActive: true,
  }).returning();

  if (!elecMeter || !gasMeter) return;

  // Electricity readings — quarterly
  await db.insert(gridEnergyReadingsTable).values([
    {
      farmId, meterId: elecMeter.id,
      readingDate: `${yr - 1}-12-31`,
      meterReading: "48210",
      consumptionKwh: "8450",
      exportKwh: "1240",
      costPence: 218400,
      readingType: "actual",
      billingPeriodStart: `${yr - 1}-10-01`,
      billingPeriodEnd: `${yr - 1}-12-31`,
      invoiceReference: "OVO-Q4-2025",
      recordedBy: "James Davidson",
      notes: "Q4 — includes grain drying season peak load",
    },
    {
      farmId, meterId: elecMeter.id,
      readingDate: `${yr}-03-31`,
      meterReading: "50140",
      consumptionKwh: "1930",
      exportKwh: "820",
      costPence: 51840,
      readingType: "actual",
      billingPeriodStart: `${yr}-01-01`,
      billingPeriodEnd: `${yr}-03-31`,
      invoiceReference: "OVO-Q1-2026",
      recordedBy: "James Davidson",
      notes: "Q1 — lower consumption outside grain drying season",
    },
  ]);

  // Gas readings — quarterly
  await db.insert(gridEnergyReadingsTable).values([
    {
      farmId, meterId: gasMeter.id,
      readingDate: `${yr - 1}-12-31`,
      meterReading: "3842",
      consumptionKwh: "2810",
      costPence: 21840,
      readingType: "actual",
      billingPeriodStart: `${yr - 1}-10-01`,
      billingPeriodEnd: `${yr - 1}-12-31`,
      invoiceReference: "BGas-Q4-2025",
      recordedBy: "James Davidson",
      notes: "Q4 — winter heating demand",
    },
    {
      farmId, meterId: gasMeter.id,
      readingDate: `${yr}-03-31`,
      meterReading: "4218",
      consumptionKwh: "2644",
      costPence: 19520,
      readingType: "actual",
      billingPeriodStart: `${yr}-01-01`,
      billingPeriodEnd: `${yr}-03-31`,
      invoiceReference: "BGas-Q1-2026",
      recordedBy: "James Davidson",
    },
  ]);

  console.log("[SEED] Grid energy meters and readings seeded for farm:", farmId);
}

async function seedFeedDeliveryData(farmId: number) {
  const existing = await db.select().from(feedDeliveriesTable).where(eq(feedDeliveriesTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;

  const yr = new Date().getFullYear();

  const feedSuppliers = await db.select().from(suppliersTable)
    .where(and(eq(suppliersTable.farmId, farmId), eq(suppliersTable.supplierType, "feed")))
    .limit(1);

  let supplierId: number | null = null;
  if (feedSuppliers.length === 0) {
    const [fs] = await db.insert(suppliersTable).values({
      farmId,
      name: "Yorkshire Feeds Ltd",
      contactName: "Mark Thistlethwaite",
      email: "mark@yorkshirefeeds.co.uk",
      phone: "01748 822 445",
      address: "Mill Lane, Ripon, HG4 1PP",
      category: "Feed & Nutrition",
      supplierType: "feed",
      accountNumber: "YFL-0842",
      isApproved: true,
      approvedDate: new Date(`${yr - 1}-03-15`),
      ufasNumber: "UFAS-2024-004821",
      certificationBody: "ABN AMRO — UFAS Scheme",
      certificationExpiry: new Date(`${yr + 1}-03-31`),
      notes: "Primary compound feed supplier. UFAS certified. Delivers to farm direct.",
      isActive: true,
    }).returning();
    supplierId = fs.id;
  } else {
    supplierId = feedSuppliers[0].id;
  }

  await db.insert(feedDeliveriesTable).values([
    {
      farmId, supplierId,
      deliveryDate: new Date(`${yr}-01-10`),
      supplierName: "Yorkshire Feeds Ltd",
      ufasNumberOnNote: "UFAS-2024-004821",
      deliveryNoteNumber: "YFL-DN-2026-0041",
      invoiceReference: "YFL-INV-2026-0041",
      feedType: "compound_pellets",
      productName: "Beef Finisher 18% — Nuts",
      batchNumber: "BF18-2026-01-A",
      lotNumber: "LOT-0041",
      quantityKg: "3000",
      costPence: 87000,
      storageLocation: "Grain store — Bay 4",
      bestBeforeDate: `${yr}-07-10`,
      medicatedFeed: false,
      speciesIntended: "cattle",
      receivedBy: "Tom Bradley",
      notes: "Delivered on 26t artic. Bay 4 silo refilled. Stock checked and correct.",
    },
    {
      farmId, supplierId,
      deliveryDate: new Date(`${yr}-01-10`),
      supplierName: "Yorkshire Feeds Ltd",
      ufasNumberOnNote: "UFAS-2024-004821",
      deliveryNoteNumber: "YFL-DN-2026-0042",
      invoiceReference: "YFL-INV-2026-0042",
      feedType: "mineral_supplement",
      productName: "Dalton Mineral Bucket — Beef",
      batchNumber: "MB-BEEF-2601",
      quantityKg: "200",
      costPence: 28000,
      storageLocation: "Feed store — Shelf 3",
      medicatedFeed: false,
      speciesIntended: "cattle",
      receivedBy: "Tom Bradley",
      notes: "4 x 50kg mineral buckets for beef herd.",
    },
    {
      farmId, supplierId,
      deliveryDate: new Date(`${yr}-02-14`),
      supplierName: "Yorkshire Feeds Ltd",
      ufasNumberOnNote: "UFAS-2024-004821",
      deliveryNoteNumber: "YFL-DN-2026-0118",
      invoiceReference: "YFL-INV-2026-0118",
      feedType: "compound_pellets",
      productName: "Beef Finisher 18% — Nuts",
      batchNumber: "BF18-2026-02-B",
      lotNumber: "LOT-0118",
      quantityKg: "5000",
      costPence: 145000,
      storageLocation: "Grain store — Bay 4",
      bestBeforeDate: `${yr}-08-14`,
      medicatedFeed: false,
      speciesIntended: "cattle",
      receivedBy: "Robert Thornton",
      notes: "Large delivery ahead of store cattle coming in Feb.",
    },
    {
      farmId, supplierId,
      deliveryDate: new Date(`${yr}-03-06`),
      supplierName: "Yorkshire Feeds Ltd",
      ufasNumberOnNote: "UFAS-2024-004821",
      deliveryNoteNumber: "YFL-DN-2026-0241",
      invoiceReference: "YFL-INV-2026-0241",
      feedType: "straights",
      productName: "Soya Hipro 48%",
      batchNumber: "SH48-2026-03-A",
      quantityKg: "1500",
      costPence: 52500,
      storageLocation: "Feed store — Bin 2",
      medicatedFeed: false,
      speciesIntended: "cattle",
      receivedBy: "James Davidson",
      notes: "Additional protein supplement for intensive beef finishers.",
    },
  ]);

  console.log("[SEED] Feed delivery records seeded for farm:", farmId);
}

async function seedFeedStockData(farmId: number) {
  const existing = await db.select().from(feedStockLevelsTable).where(eq(feedStockLevelsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;

  // Expected delivery date — 3 days from now
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const expectedDate = deliveryDate.toISOString().substring(0, 10);

  await db.insert(feedStockLevelsTable).values([
    {
      farmId,
      feedType: "compound_pellets",
      productName: "Beef Finisher 18% — Nuts",
      storageLocation: "Grain store — Bay 4",
      currentStockKg: "2840",
      capacityKg: "8000",
      reorderThresholdKg: "500",
      speciesIntended: "cattle",
      supplierName: "Yorkshire Feeds Ltd (01748 822 445)",
      awaitingDelivery: false,
      notes: "Main finishing ration for beef cattle. Silo topped up Jan and Feb.",
    },
    {
      farmId,
      feedType: "straights",
      productName: "Soya Hipro 48%",
      storageLocation: "Feed store — Bin 2",
      currentStockKg: "850",
      capacityKg: "2000",
      reorderThresholdKg: "200",
      speciesIntended: "cattle",
      supplierName: "Yorkshire Feeds Ltd (01748 822 445)",
      awaitingDelivery: false,
      notes: "Protein supplement blended into TMR for finishing steers.",
    },
    {
      farmId,
      feedType: "mineral_bucket",
      productName: "Dalton Mineral Bucket — Beef",
      storageLocation: "Feed store — Shelf 3",
      currentStockKg: "60",
      reorderThresholdKg: "100",
      speciesIntended: "cattle",
      supplierName: "Yorkshire Feeds Ltd (01748 822 445)",
      awaitingDelivery: false,
      notes: "Lick buckets for grazing cattle. 60 kg = 1.5 buckets remaining.",
    },
    {
      farmId,
      feedType: "compound_pellets",
      productName: "High Fibre Calf Nuts",
      storageLocation: "Cattle shed — Bin 1",
      currentStockKg: "0",
      reorderThresholdKg: "150",
      speciesIntended: "cattle",
      supplierName: "Yorkshire Feeds Ltd (01748 822 445)",
      awaitingDelivery: false,
      notes: "Weaning ration for calves. Bin is empty — needs ordering.",
    },
    {
      farmId,
      feedType: "compound_pellets",
      productName: "Sheep & Lamb Nut 16%",
      storageLocation: "Sheep shed — Feed room",
      currentStockKg: "180",
      reorderThresholdKg: "300",
      speciesIntended: "sheep",
      supplierName: "Dalesbred Farm Supplies (01423 561 200)",
      awaitingDelivery: true,
      expectedDeliveryDate: expectedDate,
      notes: "Flushing ration for ewes. Order placed with Dalesbred — 1 tonne arriving shortly.",
    },
    {
      farmId,
      feedType: "hay_straw",
      productName: "Meadow Hay — Round Bales",
      storageLocation: "Hay barn",
      currentStockKg: "3600",
      capacityKg: "18000",
      reorderThresholdKg: "2000",
      speciesIntended: "mixed",
      supplierName: "R. Postlethwaite & Sons (01765 689 140)",
      awaitingDelivery: false,
      notes: "Approx 24 x 150kg bales. Sufficient to end of housing season.",
    },
    {
      farmId,
      feedType: "silage",
      productName: "Wholecrop Silage — Clamp 1",
      storageLocation: "Silage clamp — West",
      currentStockKg: "42000",
      capacityKg: "120000",
      reorderThresholdKg: "8000",
      speciesIntended: "cattle",
      awaitingDelivery: false,
      notes: "Self-produced. Cut May/June. D-value 67.2, dry matter 32%. Analysed by NRM.",
    },
    {
      farmId,
      feedType: "liquid_feed",
      productName: "Molasses — Liquid Feed",
      storageLocation: "Feed store — Liquid tank",
      currentStockKg: "420",
      capacityKg: "1000",
      reorderThresholdKg: "150",
      speciesIntended: "cattle",
      supplierName: "Billington's Agriculture (0113 270 4400)",
      awaitingDelivery: false,
      notes: "Palatability enhancer blended into TMR at 1.5 kg/head/day.",
    },
  ]);

  console.log("[SEED] Feed stock records seeded for farm:", farmId);
}

async function seedGrainBins(farmId: number) {
  const existing = await db.select().from(grainStorageBinsTable).where(eq(grainStorageBinsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(grainStorageBinsTable).values([
    {
      farmId,
      binName: "Main Store — Bay A (Wheat)",
      binType: "flat_bottom",
      capacityTonnes: "400",
      dryingSystem: "on-floor drying — 2 x 15kW fans",
      aerationSystem: true,
      temperatureMonitoring: true,
      sensorCount: 6,
      notes: "Grain Pro temperature cables. Threshold 14°C.",
    },
    {
      farmId,
      binName: "Main Store — Bay B (Barley/OSR)",
      binType: "flat_bottom",
      capacityTonnes: "300",
      aerationSystem: true,
      temperatureMonitoring: true,
      sensorCount: 4,
      notes: "Flexible segregation — moveable boards.",
    },
    {
      farmId,
      binName: "Main Store — Bay C (Long-Term)",
      binType: "flat_bottom",
      capacityTonnes: "280",
      aerationSystem: true,
      temperatureMonitoring: true,
      sensorCount: 4,
      notes: "Propionic acid applicator fitted.",
    },
  ]);
  console.log("[SEED] Grain storage bins seeded for farm:", farmId);
}
