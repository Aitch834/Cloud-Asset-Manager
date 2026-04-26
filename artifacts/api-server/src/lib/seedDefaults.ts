import { db, rolesTable, modulesTable, tenantsTable, farmsTable, subscriptionsTable } from "@workspace/db";
import { cropsTable, fieldCropAssignmentsTable, fieldsTable, livestockMovementsTable, fieldOperationsTable, fuelTanksTable, fuelDeliveriesTable, fuelUsageTable, fuelStorageInspectionsTable, feedDeliveriesTable, feedStockLevelsTable, suppliersTable, gridEnergyMetersTable, gridEnergyReadingsTable, grainStorageBinsTable, sprayProductsTable, sprayApplicationsTable, grainSalesTable, livestockDeadweightSalesTable, livestockMartSalesTable, financialTransactionsTable, cropContractsTable, farmGrantsTable, cropStockLevelsTable, cropStockMovementsTable } from "@workspace/db/schema";
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
  { key: "pig-production", name: "Pig Production", description: "Medicine records, medication book, feed & nutrition, mortality, slaughter records, movements and vet visits for pig enterprises", monthlyPricePence: 2500 },
  { key: "poultry-production", name: "Poultry Production", description: "Flock register, daily welfare checks, medicine records, mortality, thinning & depletion, litter & environment and Salmonella NCP testing", monthlyPricePence: 2500 },
  { key: "horticulture", name: "Horticulture & Fresh Produce", description: "Crop records, spray records with PHI, soil & substrate, harvest records, worker welfare and traceability for fresh produce growers", monthlyPricePence: 2000 },
  { key: "carbon-sustainability", name: "Carbon & Sustainability", description: "Farm carbon footprint, renewable energy, biodiversity actions, soil carbon and sustainability goals tracking", monthlyPricePence: 1000 },
  { key: "farm-diversification", name: "Farm Diversification", description: "Activities register, farm shop, hygiene inspections, equine register, renewables income and shooting records", monthlyPricePence: 1500 },
  { key: "water-irrigation", name: "Water & Irrigation Management", description: "Water source register, abstraction log, irrigation events, water quality testing and infrastructure maintenance", monthlyPricePence: 1000 },
  { key: "fuel-energy", name: "Fuel & Energy Management", description: "Red diesel tank register, delivery log, usage recording linked to machinery and field operations, oil storage compliance inspections — HMRC-compliant records for rebated fuel", monthlyPricePence: 800 },
  { key: "feed-management", name: "Feed Management", description: "Feed delivery goods-received records with UFAS/FEMAS traceability, feed stock levels per species, medicated feed withdrawal tracking, and supplier approval number recording", monthlyPricePence: 800 },
  { key: "organic-compliance", name: "Organic Compliance", description: "Certification records, field conversion status, inspector visits and restricted input log — complementary to Soil Association / OF&G portal", monthlyPricePence: 1200 },
  { key: "organic-livestock", name: "Organic Livestock", description: "Conversion period tracking, organic feed sourcing with ≥95% compliance monitoring, outdoor access and stocking records, and doubled withdrawal period management for organic livestock enterprises", monthlyPricePence: 2500 },
  { key: "organic-dairy", name: "Organic Dairy", description: "Dairy herd conversion records, organic milk collection flagging with premium tracking, feed and nutrition compliance, and doubled milk and meat withdrawal period management for organic dairy herds", monthlyPricePence: 2000 },
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
  const allDevFarms = await db.select().from(farmsTable).where(eq(farmsTable.tenantId, tenant.id));

  for (const devFarm of allDevFarms) {
    for (const mod of allModules) {
      const existing = await db.select().from(subscriptionsTable).where(and(
        eq(subscriptionsTable.farmId, devFarm.id),
        eq(subscriptionsTable.tenantId, tenant.id),
        eq(subscriptionsTable.moduleId, mod.id),
      )).limit(1);

      if (existing.length === 0) {
        const periodStart = new Date();
        const periodEnd = new Date(periodStart);
        periodEnd.setFullYear(periodEnd.getFullYear() + 10);
        await db.insert(subscriptionsTable).values({
          tenantId: tenant.id,
          farmId: devFarm.id,
          moduleId: mod.id,
          status: "active",
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
        });
      }
    }
    console.log("[SEED] Dev subscriptions ensured for all modules on farm:", devFarm.id);
  }

  await seedCropData(farm.id);
  await seedMovementData(farm.id);
  await seedFieldOperations(farm.id);
  await seedGrainBins(farm.id);
  await seedCropStockLevels(farm.id);
  await seedSprayData(farm.id);
  await seedGrainSales(farm.id);
  await seedLivestockSales(farm.id);
  await seedFinancialData(farm.id);
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

async function seedSprayData(farmId: number) {
  const existing = await db.select().from(sprayProductsTable).where(eq(sprayProductsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;

  const products = await db.insert(sprayProductsTable).values([
    { farmId, productName: "Roundup ProBio", activeIngredient: "Glyphosate 360 g/L", mappaNumber: "16284", manufacturer: "Bayer CropScience", category: "Herbicide", harvestInterval: 0, maxApplicationsPerSeason: 2, storageRequirements: "Cool, dry, frost-free store. Keep away from food/feed." },
    { farmId, productName: "Atlantis WG", activeIngredient: "Mesosulfuron-methyl 30 g/kg + Iodosulfuron-methyl-sodium 6 g/kg", mappaNumber: "14808", manufacturer: "Bayer CropScience", category: "Herbicide", harvestInterval: 0, maxApplicationsPerSeason: 1, storageRequirements: "Store below 25°C in original container." },
    { farmId, productName: "Proline 275", activeIngredient: "Prothioconazole 275 g/L", mappaNumber: "13654", manufacturer: "Bayer CropScience", category: "Fungicide", harvestInterval: 35, maxApplicationsPerSeason: 2, storageRequirements: "Store in original container at ambient temperature." },
    { farmId, productName: "Aviator 235 Xpro", activeIngredient: "Bixafen 75 g/L + Prothioconazole 150 g/L", mappaNumber: "15797", manufacturer: "Bayer CropScience", category: "Fungicide", harvestInterval: 35, maxApplicationsPerSeason: 2, storageRequirements: "Store in original container. Do not freeze." },
    { farmId, productName: "Kaiso Sorbie 5 WG", activeIngredient: "Lambda-cyhalothrin 50 g/kg", mappaNumber: "11828", manufacturer: "FMC Agro Ltd", category: "Insecticide", harvestInterval: 14, maxApplicationsPerSeason: 2, storageRequirements: "Store in original packaging in cool, dry conditions." },
    { farmId, productName: "Yara Vita Thiotrac", activeIngredient: "Manganese 6% + Sulphur 22%", mappaNumber: null, manufacturer: "Yara UK", category: "Foliar Feed", harvestInterval: 0, maxApplicationsPerSeason: 4, storageRequirements: "Store in frost-free conditions." },
  ]).returning({ id: sprayProductsTable.id, productName: sprayProductsTable.productName });

  const fields = await db.select({ id: fieldsTable.id, name: fieldsTable.name }).from(fieldsTable).where(eq(fieldsTable.farmId, farmId)).limit(4);
  if (fields.length === 0) { console.log("[SEED] No fields found, skipping spray applications"); return; }

  const [herbicide1, herbicide2, fungicide1, fungicide2, insecticide, foliar] = products;
  const f = (name: string) => fields.find(f => f.name?.includes(name)) ?? fields[0];

  await db.insert(sprayApplicationsTable).values([
    {
      farmId, fieldId: fields[0].id, productId: herbicide1.id,
      applicationDate: new Date("2025-10-12T09:30:00Z"),
      applicationRate: "3.0", rateUnit: "L/ha", areaSprayedHa: "12.5",
      waterVolumeLitres: "100", windSpeedKmh: "8.5", windDirection: "SW",
      temperatureC: "9.5", operatorName: "James Davies", certificateNumber: "PA1/PA2 — 004821",
      equipmentUsed: "Amazone UX 4200 Super (24m boom)", reasonForApplication: "Pre-emergence stubble & grassweed control before autumn drilling",
      notes: "Good conditions. Low humidity. Brassica crops in field margin buffer observed.",
    },
    {
      farmId, fieldId: fields[1 % fields.length].id, productId: herbicide2.id,
      applicationDate: new Date("2025-11-08T10:00:00Z"),
      applicationRate: "0.5", rateUnit: "kg/ha", areaSprayedHa: "18.3",
      waterVolumeLitres: "150", windSpeedKmh: "6.0", windDirection: "W",
      temperatureC: "7.0", operatorName: "James Davies", certificateNumber: "PA1/PA2 — 004821",
      equipmentUsed: "Amazone UX 4200 Super (24m boom)", reasonForApplication: "Post-emergence blackgrass & ryegrass control — winter wheat",
      notes: "Applied at GS12-13. Tank mix with Bacara Forte.",
    },
    {
      farmId, fieldId: fields[0].id, productId: fungicide1.id,
      applicationDate: new Date("2025-05-02T08:45:00Z"),
      applicationRate: "0.8", rateUnit: "L/ha", areaSprayedHa: "12.5",
      waterVolumeLitres: "200", windSpeedKmh: "10.0", windDirection: "NW",
      temperatureC: "13.5", operatorName: "James Davies", certificateNumber: "PA1/PA2 — 004821",
      equipmentUsed: "Amazone UX 4200 Super (24m boom)", reasonForApplication: "T2 flag leaf fungicide — septoria and yellow rust control",
      batchNumber: "BL-2025-3847",
    },
    {
      farmId, fieldId: fields[2 % fields.length].id, productId: fungicide2.id,
      applicationDate: new Date("2025-05-18T09:00:00Z"),
      applicationRate: "1.0", rateUnit: "L/ha", areaSprayedHa: "9.8",
      waterVolumeLitres: "200", windSpeedKmh: "7.5", windDirection: "N",
      temperatureC: "16.0", operatorName: "Robert Barnes", certificateNumber: "PA1/PA6 — 009341",
      equipmentUsed: "Amazone UX 4200 Super (24m boom)", reasonForApplication: "T3 ear spray — fusarium and mycotoxin reduction",
      batchNumber: "AX-2025-1122",
    },
    {
      farmId, fieldId: fields[1 % fields.length].id, productId: insecticide.id,
      applicationDate: new Date("2025-04-24T07:30:00Z"),
      applicationRate: "0.075", rateUnit: "kg/ha", areaSprayedHa: "18.3",
      waterVolumeLitres: "150", windSpeedKmh: "5.0", windDirection: "E",
      temperatureC: "11.0", operatorName: "James Davies", certificateNumber: "PA1/PA2 — 004821",
      equipmentUsed: "Amazone UX 4200 Super (24m boom)", reasonForApplication: "Orange blossom midge threshold reached — 2 adults per 5 plants at GS55",
      notes: "Threshold monitoring records available in field note book.",
    },
    {
      farmId, fieldId: fields[0].id, productId: foliar.id,
      applicationDate: new Date("2025-04-03T11:00:00Z"),
      applicationRate: "2.0", rateUnit: "L/ha", areaSprayedHa: "12.5",
      waterVolumeLitres: "150", windSpeedKmh: "9.0", windDirection: "SW",
      temperatureC: "10.5", operatorName: "James Davies", certificateNumber: "PA1/PA2 — 004821",
      equipmentUsed: "Amazone UX 4200 Super (24m boom)", reasonForApplication: "Manganese deficiency — visual symptoms GS30. Previous soil index 0.",
    },
  ]);
  console.log("[SEED] Spray products and applications seeded for farm:", farmId);
}

async function seedGrainSales(farmId: number) {
  const existing = await db.select().from(grainSalesTable).where(eq(grainSalesTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;

  const bins = await db.select({ id: grainStorageBinsTable.id, binName: grainStorageBinsTable.binName }).from(grainStorageBinsTable).where(eq(grainStorageBinsTable.farmId, farmId)).limit(3);
  const binA = bins.find(b => b.binName?.includes("Bay A")) ?? bins[0];
  const binB = bins.find(b => b.binName?.includes("Bay B")) ?? bins[0];

  await db.insert(grainSalesTable).values([
    {
      farmId, saleDate: new Date("2024-09-05T10:00:00Z"), saleType: "spot",
      buyer: "Frontier Agriculture", merchantRef: "FR-2024-OAK-001",
      commodity: "Winter Wheat", variety: "KWS Zyatt", tonnage: "185.5",
      pricePerTonnePence: 18500, grossValuePence: 3431750, deductionsPence: 34317,
      netValuePence: 3397433, moisture: "13.8", specificWeight: "76.2",
      protein: "11.8", screenings: "1.2", gradeAchieved: "Group 3 Feed Wheat",
      deliveryDate: new Date("2024-09-12T08:00:00Z"), deliveryLocation: "Frontier — Sleaford Depot",
      haulierName: "Tanfield Haulage", vehicleReg: "LK21 BNA",
      weighbridgeTicket: "WB-2024-09-1843", invoiceNumber: "FR-INV-2024-7701",
      paymentDate: new Date("2024-10-05T00:00:00Z"), cropYear: "2024/25",
      field: "Home Field", storeBinId: binA?.id ?? null, storeBin: binA?.binName ?? "Bay A",
    },
    {
      farmId, saleDate: new Date("2024-10-14T10:00:00Z"), saleType: "forward",
      buyer: "Gleadell Agriculture", merchantRef: "GL-2024-OAK-F12",
      commodity: "Winter Wheat", variety: "KWS Zyatt", tonnage: "200.0",
      pricePerTonnePence: 19200, grossValuePence: 3840000, deductionsPence: 38400,
      netValuePence: 3801600, moisture: "14.1", specificWeight: "75.8",
      protein: "11.5", screenings: "1.5", gradeAchieved: "Group 4 Feed Wheat",
      deliveryDate: new Date("2024-11-01T08:00:00Z"), deliveryLocation: "Gleadell — Boston",
      haulierName: "Tanfield Haulage", vehicleReg: "YD22 XMF",
      weighbridgeTicket: "WB-2024-10-2211", invoiceNumber: "GL-INV-2024-4418",
      paymentDate: new Date("2024-11-15T00:00:00Z"), cropYear: "2024/25",
      field: "Top Field", storeBinId: binA?.id ?? null, storeBin: binA?.binName ?? "Bay A",
    },
    {
      farmId, saleDate: new Date("2025-01-20T10:00:00Z"), saleType: "spot",
      buyer: "Openfield", merchantRef: "OF-2025-OAK-003",
      commodity: "Winter Barley", variety: "KWS Irina", tonnage: "97.3",
      pricePerTonnePence: 17400, grossValuePence: 1693020, deductionsPence: 16930,
      netValuePence: 1676090, moisture: "13.2", specificWeight: "68.5",
      gradeAchieved: "Feed Barley", deliveryDate: new Date("2025-01-27T08:00:00Z"),
      deliveryLocation: "Openfield — Lincoln", haulierName: "Tanfield Haulage",
      weighbridgeTicket: "WB-2025-01-0487", invoiceNumber: "OF-INV-2025-0219",
      paymentDate: new Date("2025-02-17T00:00:00Z"), cropYear: "2024/25",
      field: "Long Meadow", storeBinId: binB?.id ?? null, storeBin: binB?.binName ?? "Bay B",
    },
    {
      farmId, saleDate: new Date("2025-02-11T10:00:00Z"), saleType: "forward",
      buyer: "Frontier Agriculture", merchantRef: "FR-2025-OAK-F04",
      commodity: "Oilseed Rape", variety: "Extase", tonnage: "54.8",
      pricePerTonnePence: 41500, grossValuePence: 2274200, deductionsPence: 45484,
      netValuePence: 2228716, moisture: "8.5", protein: null,
      gradeAchieved: "EU Spec (2% impurities)", deliveryDate: new Date("2025-02-20T08:00:00Z"),
      deliveryLocation: "Frontier — Sleaford Depot", haulierName: "Tanfield Haulage",
      weighbridgeTicket: "WB-2025-02-0801", invoiceNumber: "FR-INV-2025-1102",
      paymentDate: new Date("2025-03-14T00:00:00Z"), cropYear: "2024/25",
      field: "Bottom Pasture", storeBinId: binB?.id ?? null, storeBin: binB?.binName ?? "Bay B",
    },
    {
      farmId, saleDate: new Date("2025-03-28T10:00:00Z"), saleType: "pool",
      buyer: "Openfield Pool", merchantRef: "OF-POOL-2025-OAK",
      commodity: "Winter Wheat", variety: "KWS Zyatt", tonnage: "120.0",
      pricePerTonnePence: null, grossValuePence: null, deductionsPence: null,
      netValuePence: null, cropYear: "2024/25", field: "Home Field",
      storeBinId: binA?.id ?? null, storeBin: binA?.binName ?? "Bay A",
      notes: "Pool allocation — advance payment received. Final settlement due Aug 2025.",
    },
  ]);

  const contracts = await db.insert(cropContractsTable).values([
    {
      farmId,
      contractType: "forward", cropYear: "2024 Harvest",
      buyer: "Frontier Agriculture", commodity: "Winter Wheat", variety: "KWS Zyatt",
      qualitySpec: "Group 3/4 Feed, min 76 SWt, max 15% moisture",
      quantityTonnes: "200", contractedPricePence: 19200, totalValuePence: 3840000,
      contractDate: new Date("2024-06-15T00:00:00Z"),
      deliveryWindowStart: new Date("2024-10-01T00:00:00Z"),
      deliveryWindowEnd: new Date("2024-10-31T00:00:00Z"),
      deliveryLocation: "Gleadell — Boston", status: "fulfilled",
      contractReference: "FR-FWD-2024-OAK-001",
      callOffWindowNotes: "Full tonnage in one movement. Weighbridge ticket WB-24-10-047.",
      notes: "Harvest forward. Filled in full Oct 14.",
    },
    {
      farmId,
      contractType: "forward", cropYear: "2025 Harvest",
      buyer: "Gleadell Agriculture", commodity: "Winter Barley",
      qualitySpec: "Feed, min 62 SWt, max 16% moisture",
      quantityTonnes: "150", contractedPricePence: 17800, totalValuePence: 2670000,
      contractDate: new Date("2025-03-01T00:00:00Z"),
      deliveryWindowStart: new Date("2025-08-01T00:00:00Z"),
      deliveryWindowEnd: new Date("2025-08-31T00:00:00Z"),
      deliveryLocation: "Gleadell — Boston", status: "active",
      contractReference: "GL-FWD-2025-OAK-002",
      callOffWindowNotes: "Full tonnage Aug–Sep harvest. Call-off at farm gate.",
      notes: "2025 harvest forward contract. Awaiting outturn.",
    },
    {
      farmId,
      contractType: "pool", cropYear: "2024 Harvest",
      buyer: "Openfield Agriculture", commodity: "Oilseed Rape", variety: "DK Exstorm",
      qualitySpec: "HEAR/LLEAR: 1000ppm erucic acid max. Max 9% moisture, max 2% admixture.",
      quantityTonnes: "112.5",
      advancePaymentPence: 30000, // £300/t advance
      poolLevyPence: 150,         // £1.50/t pool levy
      poolClosingDate: new Date("2024-11-30T00:00:00Z"),
      poolSettlementDate: new Date("2025-04-30T00:00:00Z"),
      deliveryLocation: "Openfield — Hemswell",
      status: "active",
      contractReference: "OF-POOL-2024-OAK-001",
      notes: "Full-pool position. Advance payment received £300/t Oct 2024. Pool closes 30 Nov. Awaiting pool bonus declaration.",
    },
  ]).returning();

  // Link the forward wheat call-off to the Frontier contract
  const frontierContract = contracts.find(c => c.contractReference === "FR-FWD-2024-OAK-001");
  const openFieldContract = contracts.find(c => c.contractReference === "OF-POOL-2024-OAK-001");
  const grainSalesList = await db.select().from(grainSalesTable).where(eq(grainSalesTable.farmId, farmId));

  const forwardWheatSale = grainSalesList.find(s => s.saleType === "forward" && s.commodity === "Winter Wheat");
  if (frontierContract && forwardWheatSale) {
    await db.update(grainSalesTable).set({ linkedContractId: frontierContract.id }).where(eq(grainSalesTable.id, forwardWheatSale.id));
  }

  // Add pool allocation record linked to the Openfield pool
  if (openFieldContract) {
    await db.insert(grainSalesTable).values({
      farmId, saleDate: new Date("2024-10-01T00:00:00Z"),
      saleType: "pool", buyer: "Openfield Agriculture", commodity: "Oilseed Rape", variety: "DK Exstorm",
      tonnage: "112.50", pricePerTonnePence: 30000, grossValuePence: 3375000, netValuePence: 3375000,
      linkedContractId: openFieldContract.id, cropYear: "2024 Harvest",
      merchantRef: "OF-POOL-2024-OAK-001",
      notes: "Full pool allocation — advance payment £300/t. Awaiting pool bonus.",
    });
  }

  console.log("[SEED] Grain sales and crop contracts seeded for farm:", farmId);
}

async function seedLivestockSales(farmId: number) {
  const existingDW = await db.select().from(livestockDeadweightSalesTable).where(eq(livestockDeadweightSalesTable.farmId, farmId)).limit(1);
  if (existingDW.length > 0) return;

  await db.insert(livestockDeadweightSalesTable).values([
    {
      farmId, killDate: new Date("2024-11-14T00:00:00Z"),
      processor: "ABP Food Group — Ellesmere", species: "cattle", breed: "Limousin x Charolais",
      headCount: 12, totalDeadweightKg: "3516.0", averageDeadweightKg: "293.0",
      pricePerKgPence: 512, gradeClassification: "R4L", fatClass: "4L",
      conformationClass: "R", killSheetRef: "ABP-2024-11-OAK-001",
      grossValuePence: 1800192, transportDeductionPence: 14400, levyDeductionPence: 6600,
      netPaymentPence: 1779192, paymentDate: new Date("2024-11-28T00:00:00Z"),
      redTractorAssured: true, organicCertified: false,
      animalIds: "UK141091 200847,UK141091 200851,UK141091 200864,UK141091 200878,UK141091 200882,UK141091 200891,UK141091 200903,UK141091 200917,UK141091 200924,UK141091 200938,UK141091 200945,UK141091 200953",
      notes: "Good grade out. 10/12 graded R4. 2 x O3L — hung for extra day.",
    },
    {
      farmId, killDate: new Date("2025-01-23T00:00:00Z"),
      processor: "ABP Food Group — Ellesmere", species: "cattle", breed: "Limousin x Charolais",
      headCount: 8, totalDeadweightKg: "2352.0", averageDeadweightKg: "294.0",
      pricePerKgPence: 520, gradeClassification: "R4L", fatClass: "4L",
      conformationClass: "R", killSheetRef: "ABP-2025-01-OAK-004",
      grossValuePence: 1223040, transportDeductionPence: 9600, levyDeductionPence: 4400,
      netPaymentPence: 1209040, paymentDate: new Date("2025-02-06T00:00:00Z"),
      redTractorAssured: true, organicCertified: false,
      animalIds: "UK141091 201044,UK141091 201052,UK141091 201067,UK141091 201079,UK141091 201083,UK141091 201091,UK141091 201107,UK141091 201112",
    },
    {
      farmId, killDate: new Date("2025-03-12T00:00:00Z"),
      processor: "Foyle Meats — Merthyr", species: "cattle", breed: "Hereford x Friesian",
      headCount: 6, totalDeadweightKg: "1602.0", averageDeadweightKg: "267.0",
      pricePerKgPence: 498, gradeClassification: "O4L", fatClass: "4L",
      conformationClass: "O", killSheetRef: "FM-2025-03-OAK-002",
      grossValuePence: 797796, transportDeductionPence: 7200, levyDeductionPence: 3300,
      netPaymentPence: 787296, paymentDate: new Date("2025-03-27T00:00:00Z"),
      redTractorAssured: true, organicCertified: false,
      notes: "Culled cows — native breed culls from beef suckler herd.",
    },
  ]);

  await db.insert(livestockMartSalesTable).values([
    {
      farmId, saleDate: new Date("2024-10-02T09:00:00Z"),
      martName: "Newark & Notts Agricultural Society", martLocation: "Newark Livestock Market",
      species: "cattle", category: "store", headCount: 24,
      averageLiveweightKg: "380.0", priceType: "per_head",
      pricePerUnitPence: 132500, grossValuePence: 3180000,
      commissionPence: 95400, levyPence: 13200, transportCostPence: 24000,
      otherCostsPence: 3600, netPaymentPence: 3043800,
      buyerName: "H.T. Moore & Son", buyerNumber: "NWK-04421",
      auctioneerRef: "NWK-2024-10-OAK-001",
      paymentDate: new Date("2024-10-04T00:00:00Z"),
      animalIds: "UK141091 198831,UK141091 198845,UK141091 198867,UK141091 198872",
      notes: "24 mixed Limousin x store bullocks. Well-presented, strong trade. Average sold £1,325/head.",
    },
    {
      farmId, saleDate: new Date("2025-02-19T09:00:00Z"),
      martName: "Bakewell Livestock Market", martLocation: "Bakewell, Derbyshire",
      species: "cattle", category: "breeding", headCount: 5,
      averageLiveweightKg: "620.0", priceType: "per_head",
      pricePerUnitPence: 285000, grossValuePence: 1425000,
      commissionPence: 42750, levyPence: 5500, transportCostPence: 15000,
      otherCostsPence: 2500, netPaymentPence: 1359250,
      buyerName: "R. Whitfield Farms", buyerNumber: "BKW-00318",
      auctioneerRef: "BKW-2025-02-OAK-009",
      paymentDate: new Date("2025-02-21T00:00:00Z"),
      notes: "5 x in-calf Limousin suckler cows scanned 3-5 months. Sold to pedigree breeder.",
    },
  ]);
  console.log("[SEED] Livestock deadweight and mart sales seeded for farm:", farmId);
}

async function seedFinancialData(farmId: number) {
  const existing = await db.select().from(financialTransactionsTable).where(eq(financialTransactionsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;

  const today = new Date();
  const d = (y: number, m: number, day: number) => new Date(`${y}-${String(m).padStart(2,"0")}-${String(day).padStart(2,"0")}T00:00:00Z`);

  await db.insert(financialTransactionsTable).values([
    { farmId, transactionType: "income", category: "Crop Sales", description: "Winter wheat — spot sale to Frontier Agriculture (185.5t @ £185/t)", amountPence: 3397433, transactionDate: d(2024,10,5), reference: "FR-INV-2024-7701", vendorCustomer: "Frontier Agriculture", paymentMethod: "Bank Transfer", vatRate: "0", vatAmountPence: 0 },
    { farmId, transactionType: "income", category: "Livestock Sales", description: "12 x Limousin x Charolais finished cattle — ABP Ellesmere (DW)", amountPence: 1779192, transactionDate: d(2024,11,28), reference: "ABP-2024-11-OAK-001", vendorCustomer: "ABP Food Group", paymentMethod: "Bank Transfer", vatRate: "0", vatAmountPence: 0 },
    { farmId, transactionType: "income", category: "Livestock Sales", description: "24 x store bullocks — Newark Livestock Market", amountPence: 3043800, transactionDate: d(2024,10,4), reference: "NWK-2024-10-OAK-001", vendorCustomer: "Newark Livestock Market", paymentMethod: "Bank Transfer", vatRate: "0", vatAmountPence: 0 },
    { farmId, transactionType: "income", category: "Crop Sales", description: "Oilseed rape — forward call-off to Frontier Agriculture (54.8t @ £415/t)", amountPence: 2228716, transactionDate: d(2025,3,14), reference: "FR-INV-2025-1102", vendorCustomer: "Frontier Agriculture", paymentMethod: "Bank Transfer", vatRate: "0", vatAmountPence: 0 },
    { farmId, transactionType: "income", category: "Agri-Environment Scheme", description: "Sustainable Farming Incentive — Quarter 4 2024 payment", amountPence: 1875000, transactionDate: d(2025,1,15), reference: "SFI-2024-Q4-OAK", vendorCustomer: "Rural Payments Agency", paymentMethod: "BACS", vatRate: "0", vatAmountPence: 0 },
    { farmId, transactionType: "expense", category: "Fertiliser", description: "Spring fertiliser order — ammonium nitrate 34.5% (40t bulk)", amountPence: 940000, transactionDate: d(2025,2,18), reference: "CF-2025-0294", vendorCustomer: "CF Fertilisers (Billingham)", paymentMethod: "Direct Debit", vatRate: "20", vatAmountPence: 156667, notes: "Delivered 3 March 2025 to main yard. 20t to Home Field, 20t to Long Meadow." },
    { farmId, transactionType: "expense", category: "Seeds & Seed Treatments", description: "Winter wheat seed — KWS Zyatt 50t @ £445/t treated", amountPence: 2225000, transactionDate: d(2024,7,22), reference: "SDW-2024-OAK-0882", vendorCustomer: "Seedways Ltd", paymentMethod: "Bank Transfer", vatRate: "0", vatAmountPence: 0, notes: "Treated with Redigo Deter. Collected from Sleaford depot 29 July." },
    { farmId, transactionType: "expense", category: "Pesticides & Herbicides", description: "Spring spray order — fungicides, herbicides, insecticide", amountPence: 387400, transactionDate: d(2025,3,4), reference: "AGR-2025-1174", vendorCustomer: "Agrovista UK Ltd", paymentMethod: "Direct Debit", vatRate: "20", vatAmountPence: 64567 },
    { farmId, transactionType: "expense", category: "Fuel", description: "Red diesel — 10,000L delivery to main yard tank", amountPence: 1130000, transactionDate: d(2025,1,9), reference: "CPS-2025-0143", vendorCustomer: "Crown Petroleum Services", paymentMethod: "Direct Debit", vatRate: "20", vatAmountPence: 188333 },
    { farmId, transactionType: "expense", category: "Machinery & Equipment", description: "Combine service & repair — header knife section + feeder house bearing", amountPence: 285000, transactionDate: d(2024,8,30), reference: "PON-2024-OAK-3841", vendorCustomer: "Pontacs Ltd (New Holland dealer)", paymentMethod: "Bank Transfer", vatRate: "20", vatAmountPence: 47500 },
    { farmId, transactionType: "expense", category: "Veterinary & Medicine", description: "Vet visit x3 + TB testing — herd of 48 cattle", amountPence: 142500, transactionDate: d(2025,2,28), reference: "CLT-VET-2025-0221", vendorCustomer: "Cliffe Veterinary Group", paymentMethod: "Direct Debit", vatRate: "20", vatAmountPence: 23750 },
    { farmId, transactionType: "expense", category: "Labour", description: "Contract labour — harvest season (Aug–Sep 2024, 8 weeks)", amountPence: 640000, transactionDate: d(2024,10,1), reference: "PAYROLL-AUG-SEP-2024", vendorCustomer: "In-house payroll", paymentMethod: "BACS", vatRate: "0", vatAmountPence: 0, notes: "Includes harvest overtime. 2 x seasonal workers via AgriRecruit." },
  ]);

  const existingGrants = await db.select().from(farmGrantsTable).where(eq(farmGrantsTable.farmId, farmId)).limit(1);
  if (existingGrants.length > 0) { console.log("[SEED] Grants already seeded for farm:", farmId); return; }

  await db.insert(farmGrantsTable).values([
    {
      farmId, schemeName: "Sustainable Farming Incentive", schemeType: "SFI",
      itemReferenceCode: "CMOR1 + CSAM1 + CAHL1", itemDescription: "Moorland (CMOR1) — 48ha; Soil organic matter testing (CSAM1) — 120ha; High ambition arable and horticultural land (CAHL1) — 320ha",
      applicationReference: "SFI-2024-0049321-OAK", applicationDate: "2024-03-15",
      approvalDate: "2024-04-20", purchaseDeadline: null, claimDeadline: "2025-03-31",
      grantAmountPence: 7500000, status: "active",
      notes: "Annual payment split quarterly. On track. Area commitment audit due Jan 2026.",
    },
    {
      farmId, schemeName: "Countryside Stewardship — Higher Tier", schemeType: "CS",
      itemReferenceCode: "HT — WT1 + HT — HL2", itemDescription: "Creation of in-field grass margins (WT1) — 3.2ha; Maintenance of traditional orchards (HL2) — 0.8ha",
      applicationReference: "CS-HT-2023-0017882", applicationDate: "2023-07-01",
      approvalDate: "2023-10-15", purchaseDeadline: null, claimDeadline: "2026-12-31",
      grantAmountPence: 2240000, status: "active",
      notes: "5-year agreement. NVC assessment required by year 3. Compliance visit passed Nov 2024.",
    },
    {
      farmId, schemeName: "Farming Equipment & Technology Fund", schemeType: "FETF",
      itemReferenceCode: "FETF-NO-TILL-001", itemDescription: "No-till direct drill (John Deere 750A) — 50% grant towards purchase",
      applicationReference: "FETF-2024-OAK-0841", applicationDate: "2024-09-12",
      approvalDate: "2024-11-20", purchaseDeadline: "2025-06-30", claimDeadline: "2025-07-31",
      grantAmountPence: 1875000, actualCostPence: 3750000, status: "approved",
      notes: "Grant approved for 50% of £37,500 purchase. Equipment ordered, delivery March 2025. Claim to be submitted by July 31.",
    },
  ]);
  console.log("[SEED] Financial transactions and grants seeded for farm:", farmId);
}

async function seedGrainBins(farmId: number) {
  const existing = await db.select().from(grainStorageBinsTable).where(eq(grainStorageBinsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  // Red Tractor compliance: each registered location holds one commodity/variety/crop year.
  // Bay B is physically divided by moveable boards — each section is a separate registered location.
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
      notes: "Grain Pro temperature cables. Threshold 14°C. Dedicated wheat bay.",
    },
    {
      farmId,
      binName: "Main Store — Bay B — Barley Section",
      binType: "flat_bottom",
      capacityTonnes: "150",
      aerationSystem: true,
      temperatureMonitoring: true,
      sensorCount: 2,
      notes: "Separated from OSR section by moveable boards. Barley only — one variety per fill.",
    },
    {
      farmId,
      binName: "Main Store — Bay B — OSR Section",
      binType: "flat_bottom",
      capacityTonnes: "150",
      aerationSystem: true,
      temperatureMonitoring: true,
      sensorCount: 2,
      notes: "Separated from barley section by moveable boards. OSR only — one variety per fill.",
    },
    {
      farmId,
      binName: "Main Store — Bay C (Long-Term)",
      binType: "flat_bottom",
      capacityTonnes: "280",
      aerationSystem: true,
      temperatureMonitoring: true,
      sensorCount: 4,
      notes: "Propionic acid applicator fitted. Carryover / long-term storage.",
    },
  ]);
  console.log("[SEED] Grain storage bins seeded for farm:", farmId);
}

async function seedCropStockLevels(farmId: number) {
  const bins = await db.select().from(grainStorageBinsTable).where(eq(grainStorageBinsTable.farmId, farmId));
  if (bins.length === 0) return;

  const existing = await db.select().from(cropStockLevelsTable).where(eq(cropStockLevelsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;

  // Red Tractor compliance: one location, one commodity, one variety, one crop year.
  const bayA      = bins.find(b => b.binName.includes("Bay A"))?.id;
  const bayBarley = bins.find(b => b.binName.includes("Barley Section"))?.id;
  const bayOSR    = bins.find(b => b.binName.includes("OSR Section"))?.id;
  const bayC      = bins.find(b => b.binName.includes("Bay C"))?.id;
  if (!bayA || !bayBarley || !bayOSR || !bayC) return;

  const levels = await db.insert(cropStockLevelsTable).values([
    { farmId, binId: bayA,      commodity: "Winter Wheat",  variety: "KWS Zyatt",   cropYear: "2024 Harvest", quantityTonnes: "268.500", notes: "Milling wheat — Frontier contract WS-2024-0891" },
    { farmId, binId: bayBarley, commodity: "Winter Barley", variety: "SY Kingsbarn", cropYear: "2024 Harvest", quantityTonnes:  "95.200", notes: "Feed barley — spot sale to ABP" },
    { farmId, binId: bayOSR,    commodity: "Oilseed Rape",  variety: "DK Exstorm",   cropYear: "2024 Harvest", quantityTonnes: "112.500", notes: "OSR — Openfield pool contract" },
    { farmId, binId: bayC,      commodity: "Winter Wheat",  variety: "KWS Zyatt",   cropYear: "2023 Harvest", quantityTonnes:  "28.000", notes: "Old-crop carryover — awaiting movement" },
  ]).returning();

  const [l1, l2, l3, l4] = levels;
  await db.insert(cropStockMovementsTable).values([
    // Bay A — KWS Zyatt wheat: four harvest loads
    { farmId, binId: bayA, cropStockLevelId: l1.id, movementType: "harvest_in",  direction: "in",  commodity: "Winter Wheat",  variety: "KWS Zyatt",   cropYear: "2024 Harvest", quantityTonnes:  "68.500", referenceType: "harvest_record", performedBy: "James Barnett", notes: "Home Farm North — Day 1", movedAt: new Date("2024-08-07T08:30:00Z") },
    { farmId, binId: bayA, cropStockLevelId: l1.id, movementType: "harvest_in",  direction: "in",  commodity: "Winter Wheat",  variety: "KWS Zyatt",   cropYear: "2024 Harvest", quantityTonnes:  "71.200", referenceType: "harvest_record", performedBy: "James Barnett", notes: "Home Farm North — Day 2", movedAt: new Date("2024-08-08T09:00:00Z") },
    { farmId, binId: bayA, cropStockLevelId: l1.id, movementType: "harvest_in",  direction: "in",  commodity: "Winter Wheat",  variety: "KWS Zyatt",   cropYear: "2024 Harvest", quantityTonnes:  "65.300", referenceType: "harvest_record", performedBy: "James Barnett", notes: "Top Field — Day 3", movedAt: new Date("2024-08-09T07:45:00Z") },
    { farmId, binId: bayA, cropStockLevelId: l1.id, movementType: "harvest_in",  direction: "in",  commodity: "Winter Wheat",  variety: "KWS Zyatt",   cropYear: "2024 Harvest", quantityTonnes:  "63.500", referenceType: "harvest_record", performedBy: "James Barnett", notes: "Top Field — Day 4", movedAt: new Date("2024-08-12T10:15:00Z") },
    { farmId, binId: bayA, cropStockLevelId: l1.id, movementType: "drying_loss", direction: "out", commodity: "Winter Wheat",  variety: "KWS Zyatt",   cropYear: "2024 Harvest", quantityTonnes:   "1.500", referenceType: "adjustment",     performedBy: "James Barnett", notes: "Moisture reduction 15% → 14%", movedAt: new Date("2024-08-20T09:00:00Z") },
    { farmId, binId: bayA, cropStockLevelId: l1.id, movementType: "dispatch_out",direction: "out", commodity: "Winter Wheat",  variety: "KWS Zyatt",   cropYear: "2024 Harvest", quantityTonnes:  "31.500", referenceType: "grain_sale",     performedBy: "Tom Davies",    notes: "Frontier Ag Ltd — WS-2024-0891 Part 1", movedAt: new Date("2024-09-05T13:00:00Z") },
    { farmId, binId: bayA, cropStockLevelId: l1.id, movementType: "dispatch_out",direction: "out", commodity: "Winter Wheat",  variety: "KWS Zyatt",   cropYear: "2024 Harvest", quantityTonnes:  "24.500", referenceType: "grain_sale",     performedBy: "Tom Davies",    notes: "Frontier Ag Ltd — WS-2024-0891 Part 2", movedAt: new Date("2024-09-18T07:30:00Z") },
    { farmId, binId: bayA, cropStockLevelId: l1.id, movementType: "dispatch_out",direction: "out", commodity: "Winter Wheat",  variety: "KWS Zyatt",   cropYear: "2024 Harvest", quantityTonnes:  "10.500", referenceType: "grain_sale",     performedBy: "Tom Davies",    notes: "Gleadell — spot sale GS-2025-117", movedAt: new Date("2025-01-14T08:00:00Z") },
    // Bay B Barley — SY Kingsbarn: two harvest days
    { farmId, binId: bayBarley, cropStockLevelId: l2.id, movementType: "harvest_in", direction: "in", commodity: "Winter Barley", variety: "SY Kingsbarn", cropYear: "2024 Harvest", quantityTonnes: "52.700", referenceType: "harvest_record", performedBy: "James Barnett", notes: "Mill Field — Day 1", movedAt: new Date("2024-07-31T07:00:00Z") },
    { farmId, binId: bayBarley, cropStockLevelId: l2.id, movementType: "harvest_in", direction: "in", commodity: "Winter Barley", variety: "SY Kingsbarn", cropYear: "2024 Harvest", quantityTonnes: "42.500", referenceType: "harvest_record", performedBy: "James Barnett", notes: "Mill Field — Day 2", movedAt: new Date("2024-08-01T08:00:00Z") },
    // Bay B OSR — DK Exstorm: single harvest
    { farmId, binId: bayOSR, cropStockLevelId: l3.id, movementType: "harvest_in", direction: "in", commodity: "Oilseed Rape", variety: "DK Exstorm", cropYear: "2024 Harvest", quantityTonnes: "112.500", referenceType: "harvest_record", performedBy: "Tom Davies", notes: "20-acre OSR field — full harvest", movedAt: new Date("2024-08-02T14:00:00Z") },
    // Bay C — old-crop KWS Zyatt: opening balance then partial dispatch
    { farmId, binId: bayC, cropStockLevelId: l4.id, movementType: "harvest_in",  direction: "in",  commodity: "Winter Wheat", variety: "KWS Zyatt", cropYear: "2023 Harvest", quantityTonnes:  "85.000", referenceType: "harvest_record", performedBy: "James Barnett", notes: "2023 harvest opening balance", movedAt: new Date("2023-09-01T09:00:00Z") },
    { farmId, binId: bayC, cropStockLevelId: l4.id, movementType: "dispatch_out", direction: "out", commodity: "Winter Wheat", variety: "KWS Zyatt", cropYear: "2023 Harvest", quantityTonnes:  "57.000", referenceType: "grain_sale",     performedBy: "Tom Davies",    notes: "Gleadell — old-crop sold forward", movedAt: new Date("2024-02-15T08:30:00Z") },
  ]);
  console.log("[SEED] Crop stock levels + movements seeded for farm:", farmId);
}
