/**
 * Comprehensive demo/testing seed for BDE Farm Trac — Lincolnshire County Show demo
 * Covers every sidebar module with realistic Lincolnshire arable + beef + sheep + pigs + poultry data.
 * Safe to run multiple times — all sections are idempotent (check-then-insert).
 */

import { db } from "@workspace/db";
import {
  farmsTable, tenantsTable, farmMembersTable,
  fieldsTable, cropsTable, fieldCropAssignmentsTable, harvestRecordsTable,
  storageLocationsTable, merchantStorageChargesTable, seedDrillingRecordsTable, fieldInspectionsTable, fieldOperationsTable,
  sprayProductsTable, sprayApplicationsTable,
  nutrientManagementPlansTable, nmpFieldEntriesTable, nvzFertiliserApplicationsTable,
  soilTestRecordsTable, soilTestResultsTable,
  equipmentTable, equipmentMaintenanceLogsTable, equipmentCalibrationRecordsTable,
  workshopJobsTable, workshopFireExtinguishersTable,
  grainStorageBinsTable, grainQualityTestsTable,
  trainingCoursesTable, staffTrainingRecordsTable,
  suppliersTable, stockItemsTable, purchaseOrdersTable, purchaseOrderLinesTable,
  stockDeliveriesTable, stockLevelsTable,
  herdFlockRegisterTable, livestockAnimalsTable, livestockMovementsTable,
  livestockMedicineRecordsTable, vetHealthPlansTable, herdHealthEventsTable,
  fallenStockContractorsTable,
  feedDeliveriesTable, feedStockLevelsTable,
  feedContingencyPlansTable, feedRecallIncidentsTable, diseaseIncidentLogTable,
  visitorContractorLogTable, pestControlRecordsTable, cleaningDisinfectionRecordsTable,
  coshhRecordsTable, biosecurityPlansTable,
  riskAssessmentsTable, wasteDisposalRecordsTable, accidentBookTable,
  flyTippingIncidentsTable, unauthorizedEncampmentsTable,
  farmInsuranceTable,
  inspectionRecordsTable, nonconformanceRecordsTable, correctiveActionsTable, farmAssuranceCertsTable,
  environmentalFeaturesTable, agriEnvironmentSchemeRecordsTable,
  sfiAgreementsTable, sfiActionsTable,
  farmLocationsTable,
  grainSalesTable, livestockDeadweightSalesTable, livestockMartSalesTable,
  financialTransactionsTable, cropContractsTable,
  farmGrantsTable,
  haulageRecordsTable, hauliersTable,
  farmPlannerEventsTable,
  weatherStationsTable, weatherReadingsTable,
  documentRecordsTable,
  carbonAuditsTable, carbonReductionActionsTable, renewableEnergyProductionTable,
  diversificationActivitiesTable, shootingAndGameRecordsTable, diversificationIncomeRecordsTable, farmShopProductsTable,
  cropTrialsTable, cropTrialPlotsTable, cropTrialYieldsTable,
  farmAdvisorsTable,
  farmCustomersTable,
  serviceAgreementsTable,
  thirdPartyGrainIntakesTable,
  thirdPartyGrainMovementsTable,
  serviceInvoicesTable,
  serviceInvoiceLinesTable,
} from "@workspace/db/schema";
import {
  poultryHousesTable, poultryFlocksTable, poultryDailyMortalityTable, poultryTreatmentsTable,
  poultryHouseCleanoutsTable, poultryEnvironmentalLogsTable, poultryFciDocumentsTable,
  poultryBroilerWelfareTable, poultryThinningRecordsTable, poultryBiosecurityChecklistTable,
  poultrySchemeRecordsTable,
  pigFlocksTable, pigMovementsTable, pigFciDocumentsTable, pigFeedConsumptionTable,
  pigVetAssessmentsTable, pigStockmanshipChecksTable, pigTailBitingRisksTable,
  pigFarrowingRecordsTable, pigMedicineTreatmentsTable, pigRedTractorChecklistTable,
  pigKillRecordsTable,
} from "@workspace/db/schema";
import { eq, inArray, and } from "drizzle-orm";

const yr = new Date().getFullYear();
const prevYr = yr - 1;
const d = (s: string) => new Date(s);

export async function seedDemoData() {
  console.log("[DEMO SEED] Starting comprehensive demo data seed...");

  const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.slug, "oakfield-farms")).limit(1);
  if (!tenant) { console.error("[DEMO SEED] Dev tenant not found — start server first"); return; }

  const [farm] = await db.select().from(farmsTable).where(eq(farmsTable.tenantId, tenant.id)).limit(1);
  if (!farm) { console.error("[DEMO SEED] Dev farm not found"); return; }

  await db.update(farmsTable).set({
    name: "Highfield Farm",
    address: "Highfield Lane, Heckington, Sleaford",
    postcode: "NG34 9JR",
    cphNumber: "30/215/0042",
    gridReference: "TF 148 439",
    totalAcreage: 820,
    sectorArable: true,
    sectorBeef: true,
    sectorSheep: true,
    sectorDairy: false,
    sectorPigs: true,
    sectorPoultry: true,
  }).where(eq(farmsTable.id, farm.id));

  const farmId = farm.id;
  const tenantId = tenant.id;

  await seedStaff(farmId, tenantId);
  await seedTraining(farmId);
  await seedFarmLocations(farmId);
  await seedFields(farmId);
  await seedCropsAndAssignments(farmId);
  await seedHarvest(farmId);
  await seedStorageLocations(farmId);
  await seedMerchantCharges(farmId);
  await seedFieldInspections(farmId);
  await seedSprayProducts(farmId);
  await seedSprayApplications(farmId);
  await seedNMP(farmId);
  await seedSoilTests(farmId);
  await seedEquipment(farmId);
  await seedWorkshopJobs(farmId);
  await seedSuppliers(farmId);
  await seedStock(farmId);
  await seedHerds(farmId);
  await seedAnimals(farmId);
  await seedMedicineRecords(farmId);
  await seedVetHealthPlan(farmId);
  await seedBiosecurity(farmId);
  await seedCOSHH(farmId);
  await seedRiskAssessments(farmId);
  await seedAccidentBook(farmId);
  await seedWaste(farmId);
  await seedFlyTipping(farmId);
  await seedEncampments(farmId);
  await seedInsurance(farmId);
  await seedInspections(farmId);
  await seedEnvironmental(farmId);
  await seedSFI(farmId);
  await seedGrainSales(farmId);
  await seedLivestockSales(farmId);
  await seedFinancial(farmId);
  await seedCropContracts(farmId);
  await seedGrants(farmId);
  await seedHaulage(farmId);
  await seedPlanner(farmId);
  await seedWeather(farmId);
  await seedDocuments(farmId, tenantId);
  await seedCarbon(farmId);
  await seedDiversification(farmId);
  await seedCropTrials(farmId);
  await seedAdvisors(farmId);
  await seedFeedCompliance(farmId);
  await seedPoultry(farmId);
  await seedPigs(farmId);

  console.log("[DEMO SEED] ✅ Complete. Demo data ready for farmId:", farmId);
}

// ── STAFF ──────────────────────────────────────────────────────────────────
async function seedStaff(farmId: number, tenantId: number) {
  const existing = await db.select().from(farmMembersTable).where(eq(farmMembersTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(farmMembersTable).values([
    { farmId, tenantId, firstName: "James", lastName: "Barnett", email: "james.barnett@highfieldfarm.co.uk", phone: "07712 345678", jobTitle: "Farm Manager", farmRole: "manager", accessType: "full", isActive: true, employedFrom: d("2015-03-01"), nokName: "Sarah Barnett", nokRelationship: "Spouse", nokPhone: "07712 345679" },
    { farmId, tenantId, firstName: "Tom", lastName: "Bradley", email: "tom.bradley@highfieldfarm.co.uk", phone: "07823 456789", jobTitle: "Tractor Driver / Stockman", farmRole: "operator", accessType: "limited", isActive: true, employedFrom: d("2019-09-01"), nokName: "Clare Bradley", nokRelationship: "Spouse", nokPhone: "07823 456780" },
    { farmId, tenantId, firstName: "Rob", lastName: "Clarke", email: "rob.clarke@highfieldfarm.co.uk", phone: "07934 567890", jobTitle: "General Farmhand", farmRole: "operator", accessType: "limited", isActive: true, employedFrom: d("2022-04-01"), nokName: "Dave Clarke", nokRelationship: "Father", nokPhone: "01529 445566" },
    { farmId, tenantId, firstName: "Sophie", lastName: "Whitfield", email: "s.whitfield@frontier-agriculture.com", phone: "07845 678901", jobTitle: "Agronomist (Contractor)", farmRole: "advisor", accessType: "none", isActive: true, notes: "BASIS-qualified agronomist — Frontier Agriculture" },
  ]);
  console.log("[DEMO SEED] Staff seeded");
}

// ── TRAINING ──────────────────────────────────────────────────────────────
async function seedTraining(farmId: number) {
  const existing = await db.select().from(trainingCoursesTable).where(eq(trainingCoursesTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  const courses = await db.insert(trainingCoursesTable).values([
    { farmId, name: "PA1 / PA6 Sprayer Operator Certificate", issuingBody: "NPTC City & Guilds", courseType: "spraying", defaultValidityMonths: 60 },
    { farmId, name: "Livestock Handling — Cattle & Sheep", issuingBody: "Lantra Awards", courseType: "livestock", defaultValidityMonths: 36 },
    { farmId, name: "Manual Handling", issuingBody: "HSE-approved (in-house)", courseType: "health_safety", defaultValidityMonths: 36 },
    { farmId, name: "First Aid at Work (3-day)", issuingBody: "St John Ambulance", courseType: "health_safety", defaultValidityMonths: 36 },
    { farmId, name: "Telehandler / Forklift Safety (RTITB)", issuingBody: "RTITB", courseType: "machinery", defaultValidityMonths: 60 },
    { farmId, name: "Red Tractor Awareness Refresher", issuingBody: "Red Tractor Assurance", courseType: "compliance", defaultValidityMonths: 12 },
  ]).returning();

  const staff = await db.select().from(farmMembersTable).where(eq(farmMembersTable.farmId, farmId));
  if (staff.length < 2 || courses.length < 5) return;

  await db.insert(staffTrainingRecordsTable).values([
    { farmId, userId: "demo-seed-user", trainingTitle: "PA1 / PA6 Sprayer Operator Certificate", courseId: courses[0]!.id, trainingDate: d("2022-03-15"), expiryDate: d("2027-03-15"), competencyAchieved: "pass", assessorName: "NPTC City & Guilds" },
    { farmId, userId: "demo-seed-user", trainingTitle: "First Aid at Work (3-day)", courseId: courses[3]!.id, trainingDate: d("2023-09-05"), expiryDate: d("2026-09-05"), competencyAchieved: "pass", assessorName: "St John Ambulance" },
    { farmId, userId: "demo-seed-user", trainingTitle: "Telehandler / Forklift Safety (RTITB)", courseId: courses[4]!.id, trainingDate: d("2021-11-20"), expiryDate: d("2026-11-20"), competencyAchieved: "pass", assessorName: "RTITB Assessor" },
    { farmId, userId: "demo-seed-user", trainingTitle: "Livestock Handling — Cattle & Sheep", courseId: courses[1]!.id, trainingDate: d("2022-05-10"), expiryDate: d("2025-05-10"), competencyAchieved: "pass", assessorName: "Lantra" },
    { farmId, userId: "demo-seed-user", trainingTitle: "Red Tractor Awareness Refresher", courseId: courses[5]!.id, trainingDate: d(`${yr}-01-15`), expiryDate: d(`${yr + 1}-01-15`), competencyAchieved: "pass", assessorName: "Red Tractor" },
  ]);
  console.log("[DEMO SEED] Training seeded");
}

// ── FARM LOCATIONS ─────────────────────────────────────────────────────────
async function seedFarmLocations(farmId: number) {
  const existing = await db.select().from(farmLocationsTable).where(eq(farmLocationsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(farmLocationsTable).values([
    { farmId, name: "Main Farm Yard", locationType: "yard", description: "Central yard with grain store, workshop, chemical store, livestock buildings.", latitude: 53.0022, longitude: -0.2981 },
    { farmId, name: "Main Grain Store", locationType: "grain_store", description: "1200t grain store — 4 bays. Flat-bottomed steel bins. Aeration and drying.", latitude: 53.0018, longitude: -0.2985 },
    { farmId, name: "North Block Livestock Building", locationType: "livestock_building", description: "600-head capacity cubicle and straw yards. Slurry storage.", latitude: 53.0035, longitude: -0.2960 },
    { farmId, name: "Chemical & Seed Store", locationType: "chemical_store", description: "COSHH-compliant locked store. Bunded floor. 500L drum capacity.", latitude: 53.0020, longitude: -0.2990 },
    { farmId, name: "Farm Workshop", locationType: "workshop", description: "Workshop with pit. Overhead crane 2t. Welding, fabrication, servicing area.", latitude: 53.0023, longitude: -0.2988 },
    { farmId, name: "Heckington Beck Field", locationType: "field", description: "Beck Field — 22ha. Adjacent to Heckington Beck (NVZ). Sugar beet campaign.", latitude: 52.9998, longitude: -0.2950 },
  ]);
  console.log("[DEMO SEED] Farm locations seeded");
}

// ── FIELDS ─────────────────────────────────────────────────────────────────
async function seedFields(farmId: number) {
  const existing = await db.select().from(fieldsTable).where(eq(fieldsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(fieldsTable).values([
    { farmId, name: "Home Field", fieldCode: "HF-001", areaHectares: "24.80", farmableAreaHectares: "24.40", soilType: "medium_loam", currentUse: "arable", isNvz: true, nvzLandType: "arable", notes: "Highest yielding field. RTK-guided precision drilling." },
    { farmId, name: "North Block", fieldCode: "NB-002", areaHectares: "31.40", farmableAreaHectares: "30.80", soilType: "heavy_clay", currentUse: "arable", isNvz: true, nvzLandType: "arable", notes: "Clay soils — drainage improvement 2018. OSR after wheat rotation." },
    { farmId, name: "South Meadow", fieldCode: "SM-003", areaHectares: "18.60", farmableAreaHectares: "18.20", soilType: "sandy_loam", currentUse: "arable", isNvz: true, nvzLandType: "arable", notes: "Sandy soils — responds well to organic matter. Spring barley suited." },
    { farmId, name: "Long Field", fieldCode: "LF-004", areaHectares: "42.10", farmableAreaHectares: "41.50", soilType: "medium_loam", currentUse: "arable", isNvz: true, nvzLandType: "arable", notes: "Largest field. RTK auto-guidance essential. Minor drainage issue NW corner." },
    { farmId, name: "Beck Field", fieldCode: "BF-005", areaHectares: "22.30", farmableAreaHectares: "21.80", soilType: "silty_clay", currentUse: "arable", isNvz: true, nvzLandType: "arable", notes: "Adjacent Heckington Beck — 6m buffer strip maintained. Sugar beet rotation." },
    { farmId, name: "Ten Acre", fieldCode: "TA-006", areaHectares: "4.05", farmableAreaHectares: "3.90", soilType: "sandy_loam", currentUse: "arable", isNvz: true, notes: "Small field. Field beans after wheat in rotation." },
    { farmId, name: "Top Road", fieldCode: "TR-007", areaHectares: "14.80", farmableAreaHectares: "14.50", soilType: "medium_loam", currentUse: "arable", isNvz: true, notes: "Road boundary — wire fence maintained. Winter barley rotation." },
    { farmId, name: "New Drain Field", fieldCode: "ND-008", areaHectares: "19.70", farmableAreaHectares: "19.30", soilType: "heavy_clay", currentUse: "arable", isNvz: true, notes: "Comprehensive drainage scheme 2020. Ready for expansion of arable area." },
  ]);
  console.log("[DEMO SEED] Fields seeded");
}

// ── CROPS & ASSIGNMENTS ────────────────────────────────────────────────────
async function seedCropsAndAssignments(farmId: number) {
  const existing = await db.select().from(cropsTable).where(eq(cropsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  const crops = await db.insert(cropsTable).values([
    { farmId, name: "Winter Wheat (KWS Zyatt)", category: "cereal", variety: "KWS Zyatt" },
    { farmId, name: "Winter OSR (Architect)", category: "oilseed", variety: "Architect" },
    { farmId, name: "Spring Barley (Laureate)", category: "cereal", variety: "Laureate" },
    { farmId, name: "Sugar Beet (Alize KWS)", category: "root_crop", variety: "Alize KWS" },
    { farmId, name: "Winter Barley (KWS Orwell)", category: "cereal", variety: "KWS Orwell" },
    { farmId, name: "Spring Field Beans (Tundra)", category: "pulse", variety: "Tundra" },
  ]).returning();
  const [ww, osr, sb, beet, wb, fb] = crops;

  const fields = await db.select().from(fieldsTable).where(eq(fieldsTable.farmId, farmId));
  const [hf, nb, sm, lf, bf, ta, tr, nd] = fields;
  if (!hf || !nb || !sm || !lf || !bf || !ta || !tr || !nd || !ww || !osr || !sb || !beet || !wb || !fb) return;

  await db.insert(fieldCropAssignmentsTable).values([
    { fieldId: hf.id, cropId: ww.id, plantingDate: d(`${prevYr}-10-08`), expectedHarvestDate: d(`${yr}-08-10`), seedRate: "180", seedUnit: "kg/ha", season: `${prevYr}/${yr}`, year: prevYr },
    { fieldId: nb.id, cropId: osr.id, plantingDate: d(`${prevYr}-08-22`), expectedHarvestDate: d(`${yr}-07-15`), seedRate: "3.5", seedUnit: "kg/ha", season: `${prevYr}/${yr}`, year: prevYr },
    { fieldId: sm.id, cropId: sb.id, plantingDate: d(`${yr}-04-05`), expectedHarvestDate: d(`${yr}-08-20`), seedRate: "175", seedUnit: "kg/ha", season: `${yr}`, year: yr },
    { fieldId: lf.id, cropId: ww.id, plantingDate: d(`${prevYr}-10-12`), expectedHarvestDate: d(`${yr}-08-12`), seedRate: "180", seedUnit: "kg/ha", season: `${prevYr}/${yr}`, year: prevYr },
    { fieldId: bf.id, cropId: beet.id, plantingDate: d(`${yr}-04-15`), expectedHarvestDate: d(`${yr}-10-01`), seedRate: "100000", seedUnit: "seeds/ha", season: `${yr}`, year: yr },
    { fieldId: ta.id, cropId: fb.id, plantingDate: d(`${yr}-03-01`), expectedHarvestDate: d(`${yr}-09-15`), seedRate: "200", seedUnit: "kg/ha", season: `${yr}`, year: yr },
    { fieldId: tr.id, cropId: wb.id, plantingDate: d(`${prevYr}-10-02`), expectedHarvestDate: d(`${yr}-07-25`), seedRate: "165", seedUnit: "kg/ha", season: `${prevYr}/${yr}`, year: prevYr },
    { fieldId: nd.id, cropId: ww.id, plantingDate: d(`${prevYr}-10-20`), expectedHarvestDate: d(`${yr}-08-18`), seedRate: "180", seedUnit: "kg/ha", season: `${prevYr}/${yr}`, year: prevYr },
  ]);

  await db.insert(seedDrillingRecordsTable).values([
    { farmId, fieldId: hf.id, drillingDate: d(`${prevYr}-10-08`), cropName: "Winter Wheat", variety: "KWS Zyatt", seedRate: "180", seedRateUnit: "kg/ha", isTreated: true, treatmentProduct: "Redigo Pro seed treatment", operator: "James Barnett", areaSeededHa: "24.80", soilConditions: "Perfect seedbed. Soil moisture 18%.", notes: "Horsch Avatar 6.16 SD — 12.5cm row spacing." },
    { farmId, fieldId: nb.id, drillingDate: d(`${prevYr}-08-22`), cropName: "Winter OSR", variety: "Architect", seedRate: "3.5", seedRateUnit: "kg/ha", isTreated: true, treatmentProduct: "Cruiser OSR seed treatment", operator: "James Barnett", areaSeededHa: "31.40", soilConditions: "Good conditions — moist seedbed post-stubble cultivations.", notes: "Horsch Avatar cross-slot drill." },
    { farmId, fieldId: sm.id, drillingDate: d(`${yr}-04-05`), cropName: "Spring Barley", variety: "Laureate", seedRate: "175", seedRateUnit: "kg/ha", isTreated: false, operator: "Tom Bradley", areaSeededHa: "18.60", soilConditions: "Sandy soils in good tilth. Dry on top.", notes: "For malting — N rate managed." },
  ]);
  console.log("[DEMO SEED] Crops & assignments seeded");
}

// ── HARVEST ────────────────────────────────────────────────────────────────
async function seedHarvest(farmId: number) {
  const fields = await db.select().from(fieldsTable).where(eq(fieldsTable.farmId, farmId));
  if (fields.length < 4) return;
  const fieldIds = fields.map(f => f.id);
  const allAssignments = await db.select().from(fieldCropAssignmentsTable)
    .where(inArray(fieldCropAssignmentsTable.fieldId, fieldIds));
  if (allAssignments.length === 0) return;

  const existing = await db.select().from(harvestRecordsTable)
    .where(eq(harvestRecordsTable.fieldCropAssignmentId, allAssignments[0]!.id)).limit(1);
  if (existing.length > 0) return;

  const fieldIdToAssignment = new Map(allAssignments.map(a => [a.fieldId, a]));
  const [hf, nb, sm, lf, , , tr, nd] = fields;

  const rows = [
    hf && fieldIdToAssignment.get(hf.id) ? { fieldCropAssignmentId: fieldIdToAssignment.get(hf.id)!.id, harvestDate: d(`${prevYr}-08-14`), yieldTonnes: "233.6", areaHarvestedHa: "24.80", moisturePercent: "14.2", qualityGrade: "milling", operatorName: "James Barnett", notes: "Milling quality achieved. Protein 12.4%. Hagberg 290." } : null,
    nb && fieldIdToAssignment.get(nb.id) ? { fieldCropAssignmentId: fieldIdToAssignment.get(nb.id)!.id, harvestDate: d(`${prevYr}-07-18`), yieldTonnes: "125.0", areaHarvestedHa: "31.40", moisturePercent: "8.8", qualityGrade: "milling_oil", operatorName: "James Barnett", notes: "OSR. Oil content 44.2%. Good standing crop." } : null,
    lf && fieldIdToAssignment.get(lf.id) ? { fieldCropAssignmentId: fieldIdToAssignment.get(lf.id)!.id, harvestDate: d(`${prevYr}-08-16`), yieldTonnes: "378.9", areaHarvestedHa: "41.50", moisturePercent: "15.1", qualityGrade: "feed", operatorName: "Tom Bradley", notes: "Feed wheat. Some septoria pressure." } : null,
    tr && fieldIdToAssignment.get(tr.id) ? { fieldCropAssignmentId: fieldIdToAssignment.get(tr.id)!.id, harvestDate: d(`${prevYr}-07-22`), yieldTonnes: "96.2", areaHarvestedHa: "14.50", moisturePercent: "16.4", qualityGrade: "feed", operatorName: "James Barnett", notes: "Winter barley. Good standing power." } : null,
    nd && fieldIdToAssignment.get(nd.id) ? { fieldCropAssignmentId: fieldIdToAssignment.get(nd.id)!.id, harvestDate: d(`${prevYr}-08-20`), yieldTonnes: "181.2", areaHarvestedHa: "19.30", moisturePercent: "14.8", qualityGrade: "milling", operatorName: "James Barnett", notes: "New Drain Field — first year post-drainage. Excellent." } : null,
    sm && fieldIdToAssignment.get(sm.id) ? { fieldCropAssignmentId: fieldIdToAssignment.get(sm.id)!.id, harvestDate: d(`${yr}-08-20`), yieldTonnes: "126.6", areaHarvestedHa: "18.20", moisturePercent: "15.4", qualityGrade: "malting", operatorName: "James Barnett", notes: "Spring barley Laureate. NN 1.48% — malting spec met." } : null,
  ].filter(Boolean) as { fieldCropAssignmentId: number; harvestDate: Date; yieldTonnes: string; areaHarvestedHa: string; moisturePercent: string; qualityGrade: string; operatorName: string; notes: string }[];

  if (rows.length > 0) await db.insert(harvestRecordsTable).values(rows);
  console.log("[DEMO SEED] Harvest records seeded");
}

// ── STORAGE ─────────────────────────────────────────────────────────────────
async function seedStorageLocations(farmId: number) {
  const existing = await db.select().from(storageLocationsTable).where(eq(storageLocationsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(storageLocationsTable).values([
    { farmId, name: "Main Grain Store — Bay A", type: "grain_store", capacityTonnes: "400", locationDescription: "Main yard — 4-bay flat-bottomed store. Bay A: wheat.", isActive: true, notes: "Aeration fans. Temperature monitoring." },
    { farmId, name: "Main Grain Store — Bay B", type: "grain_store", capacityTonnes: "300", locationDescription: "Bay B: barley / OSR segregated storage.", isActive: true, notes: "120t capacity available for third-party rental (Frontier)." },
    { farmId, name: "Main Grain Store — Bay C", type: "grain_store", capacityTonnes: "280", locationDescription: "Bay C: long-term wheat carry-over.", isActive: true, notes: "Propionic acid treatment for damp grain." },
    { farmId, name: "Seed Store", type: "seed_store", capacityTonnes: "40", locationDescription: "Adjacent to chemical store. Temperature controlled.", isActive: true, notes: "Treated seed only — biosecurity separation maintained." },
    { farmId, name: "Chemical & Fertiliser Store", type: "chemical_store", capacityTonnes: "50", locationDescription: "Locked bunded building south of main yard.", isActive: true, notes: "COSHH compliant. AN separated per REACH regulations." },
    { farmId, name: "Frontier Ag — Deepstore Lincoln", type: "merchant", capacityTonnes: "600", locationDescription: "Frontier Agriculture Deepstore, Newark Road, Lincoln, LN6 3QN", isActive: true, notes: "Off-farm merchant storage contract for surplus wheat and OSR. Temperature controlled facility.", merchantName: "Frontier Agriculture Ltd", merchantContact: "Jake Holt — 07701 123456", merchantContractRef: "FA-GS-2024-0892", storageRatePptWeek: "0.5200", intakeChargePpt: "1.4000", outloadingChargePpt: "1.4000", dryingChargePpt: "8.5000", insuranceRatePptWeek: "0.0600" },
  ]);

  const grainBinExists = await db.select().from(grainStorageBinsTable).where(eq(grainStorageBinsTable.farmId, farmId)).limit(1);
  if (grainBinExists.length === 0) {
    await db.insert(grainStorageBinsTable).values([
      { farmId, binName: "Main Store — Bay A (Wheat)", binType: "flat_bottom", capacityTonnes: "400", dryingSystem: "on-floor drying — 2 x 15kW fans", aerationSystem: true, temperatureMonitoring: true, sensorCount: 6, notes: "Grain Pro temperature cables. Threshold 14°C." },
      { farmId, binName: "Main Store — Bay B (Barley/OSR)", binType: "flat_bottom", capacityTonnes: "300", aerationSystem: true, temperatureMonitoring: true, sensorCount: 4, notes: "Flexible segregation — moveable boards." },
      { farmId, binName: "Main Store — Bay C (Long-Term)", binType: "flat_bottom", capacityTonnes: "280", aerationSystem: true, temperatureMonitoring: true, sensorCount: 4, notes: "Propionic acid applicator fitted." },
    ]);
  }
  console.log("[DEMO SEED] Storage seeded");
}

// ── MERCHANT STORAGE CHARGES ────────────────────────────────────────────────
async function seedMerchantCharges(farmId: number) {
  const existing = await db.select().from(merchantStorageChargesTable).where(eq(merchantStorageChargesTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  const [merchantLoc] = await db.select().from(storageLocationsTable)
    .where(and(eq(storageLocationsTable.farmId, farmId), eq(storageLocationsTable.type, "merchant")))
    .limit(1);
  if (!merchantLoc) return;
  await db.insert(merchantStorageChargesTable).values([
    { farmId, locationId: merchantLoc.id, chargeDate: "2024-08-05", chargeType: "intake", description: "Intake 285t wheat @ £1.40/t", quantityTonnes: "285.00", rateUsed: "1.4000", amountPence: 39900, statementReference: "FA-INV-2024-1108", statementDate: "2024-08-10", isAutoGenerated: false },
    { farmId, locationId: merchantLoc.id, chargeDate: "2024-08-05", chargeType: "drying", description: "Drying 285t wheat to 14.5% @ £8.50/t", quantityTonnes: "285.00", rateUsed: "8.5000", amountPence: 242250, statementReference: "FA-INV-2024-1108", statementDate: "2024-08-10", isAutoGenerated: false },
    { farmId, locationId: merchantLoc.id, chargeDate: "2024-09-30", chargeType: "storage", description: "Storage 8wk × 285t @ £0.52/t/wk", quantityTonnes: "285.00", rateUsed: "0.5200", amountPence: 118560, statementReference: "FA-INV-2024-1215", statementDate: "2024-10-01", isAutoGenerated: true },
    { farmId, locationId: merchantLoc.id, chargeDate: "2024-09-30", chargeType: "insurance", description: "Insurance 8wk × 285t @ £0.06/t/wk", quantityTonnes: "285.00", rateUsed: "0.0600", amountPence: 13680, statementReference: "FA-INV-2024-1215", statementDate: "2024-10-01", isAutoGenerated: true },
    { farmId, locationId: merchantLoc.id, chargeDate: "2024-11-01", chargeType: "outloading", description: "Outloading 285t wheat @ £1.40/t", quantityTonnes: "285.00", rateUsed: "1.4000", amountPence: 39900, statementReference: "FA-INV-2024-1387", statementDate: "2024-11-05", isAutoGenerated: false },
  ]);
  console.log("[DEMO SEED] Merchant charges seeded");
}

// ── FIELD INSPECTIONS ──────────────────────────────────────────────────────
async function seedFieldInspections(farmId: number) {
  const existing = await db.select().from(fieldInspectionsTable).where(eq(fieldInspectionsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(fieldInspectionsTable).values([
    { farmId, fieldName: "Home Field", inspectionDate: d(`${yr}-02-15`), cropType: "Winter Wheat", growthStage: "GS25 — tillering", pestDiseaseObservations: "Low-level yellow rust on lower leaves. Septoria tritici on 10% leaves. No aphids.", actionRequired: "monitor", recommendedAction: "T0 fungicide application at GS30. Monitor rust — variety susceptible.", inspector: "Sophie Whitfield (Frontier Agriculture)", notes: "Good plant population — 310 plants/m2. Some lodging risk if wet spring." },
    { farmId, fieldName: "North Block", inspectionDate: d(`${yr}-02-15`), cropType: "Winter OSR", growthStage: "BBCH 51 — first flower bud visible", pestDiseaseObservations: "Pollen beetle — 15/plant. Just above threshold. Phoma stem canker lesions on 20% plants.", actionRequired: "action_required", recommendedAction: "Pollen beetle spray if below 10°C and >15 beetles at bud. Fungicide at flowering.", inspector: "Sophie Whitfield (Frontier Agriculture)", notes: "OSR looks promising. Good branching." },
    { farmId, fieldName: "South Meadow", inspectionDate: d(`${yr}-04-20`), cropType: "Spring Barley", growthStage: "GS12 — 2 leaves", pestDiseaseObservations: "Clean. No pest or disease pressure noted. Barley yellow dwarf virus risk — BYDV-free aphid counts.", actionRequired: "none", inspector: "James Barnett", notes: "Good even establishment. Target malting spec." },
    { farmId, fieldName: "Long Field", inspectionDate: d(`${yr}-03-10`), cropType: "Winter Wheat", growthStage: "GS30 — stem extension", pestDiseaseObservations: "Septoria tritici — 25% leaf area affected flag -3. Yellow rust trace. Aphid — none.", actionRequired: "action_required", recommendedAction: "T1 fungicide — Revystar XL + CTL. Target flag leaf.", inspector: "Sophie Whitfield (Frontier Agriculture)", notes: "High yield potential. Soil slightly wet NW corner." },
  ]);
  console.log("[DEMO SEED] Field inspections seeded");
}

// ── SPRAY PRODUCTS ─────────────────────────────────────────────────────────
async function seedSprayProducts(farmId: number) {
  const existing = await db.select().from(sprayProductsTable).where(eq(sprayProductsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(sprayProductsTable).values([
    { farmId, productName: "Proline 275 EC", activeIngredient: "Prothioconazole 275 g/l", mappaNumber: "16413", manufacturer: "Bayer CropScience", category: "fungicide", harvestInterval: 35, maxApplicationsPerSeason: 2, storageRequirements: "Locked COSHH store. Frost-free." },
    { farmId, productName: "Roundup ProBio", activeIngredient: "Glyphosate 360 g/l", mappaNumber: "16455", manufacturer: "Bayer CropScience", category: "herbicide", harvestInterval: 7, maxApplicationsPerSeason: 2, storageRequirements: "Locked COSHH store." },
    { farmId, productName: "Revystar XL", activeIngredient: "Mefentrifluconazole 150 g/l + Fluxapyroxad 75 g/l", mappaNumber: "19460", manufacturer: "BASF SE", category: "fungicide", harvestInterval: 35, maxApplicationsPerSeason: 2 },
    { farmId, productName: "Kerb 400 SC", activeIngredient: "Propyzamide 400 g/l", mappaNumber: "16012", manufacturer: "Dow AgroSciences", category: "herbicide", harvestInterval: 90, maxApplicationsPerSeason: 1, storageRequirements: "Apply only in cool conditions (<10°C)." },
    { farmId, productName: "Karate Zeon", activeIngredient: "Lambda-cyhalothrin 100 g/l", mappaNumber: "13967", manufacturer: "Syngenta UK", category: "insecticide", harvestInterval: 14, maxApplicationsPerSeason: 2, storageRequirements: "Buffer zones — 5m untreated. Bee risk — no application near flowering." },
    { farmId, productName: "Hussar OD", activeIngredient: "Iodosulfuron 100 g/l + Mesosulfuron 30 g/l", mappaNumber: "15378", manufacturer: "Bayer CropScience", category: "herbicide", harvestInterval: 112, maxApplicationsPerSeason: 1, storageRequirements: "Sensitive to resistant black-grass — record resistant populations." },
  ]);
  console.log("[DEMO SEED] Spray products seeded");
}

// ── SPRAY APPLICATIONS ─────────────────────────────────────────────────────
async function seedSprayApplications(farmId: number) {
  const existing = await db.select().from(sprayApplicationsTable).where(eq(sprayApplicationsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  const fields = await db.select().from(fieldsTable).where(eq(fieldsTable.farmId, farmId));
  const products = await db.select().from(sprayProductsTable).where(eq(sprayProductsTable.farmId, farmId));
  if (fields.length < 2 || products.length < 3) return;
  const [hf, nb] = fields;
  const [proline, , revystar, , , hussar] = products;
  if (!hf || !nb || !proline || !revystar || !hussar) return;

  await db.insert(sprayApplicationsTable).values([
    { farmId, fieldId: hf.id, productId: proline.id, applicationDate: d(`${yr}-03-25`), applicationRate: "0.8", rateUnit: "L/ha", areaSprayedHa: "24.80", waterVolumeLitres: "200", windSpeedKmh: "8", windDirection: "SW", temperatureC: "12", operatorName: "James Barnett", certificateNumber: "PA1/PA6-JB-2022", equipmentUsed: "Chafer Guardian 4000R 36m", reasonForApplication: "T1 wheat fungicide — septoria and yellow rust control", notes: "All conditions within label recommendations. LERAP maintained." },
    { farmId, fieldId: hf.id, productId: hussar.id, applicationDate: d(`${prevYr}-10-20`), applicationRate: "0.6", rateUnit: "L/ha", areaSprayedHa: "24.80", waterVolumeLitres: "200", windSpeedKmh: "6", windDirection: "W", temperatureC: "9", operatorName: "James Barnett", certificateNumber: "PA1/PA6-JB-2022", equipmentUsed: "Chafer Guardian 4000R 36m", reasonForApplication: "Autumn black-grass and ryegrass herbicide — winter wheat", notes: "Applied at GS11-12. Good soil moisture." },
    { farmId, fieldId: nb.id, productId: revystar.id, applicationDate: d(`${yr}-04-15`), applicationRate: "1.0", rateUnit: "L/ha", areaSprayedHa: "31.40", waterVolumeLitres: "150", windSpeedKmh: "5", windDirection: "NW", temperatureC: "15", operatorName: "James Barnett", certificateNumber: "PA1/PA6-JB-2022", equipmentUsed: "Chafer Guardian 4000R 36m", reasonForApplication: "OSR flowering fungicide — sclerotinia control", notes: "Applied at 20% flowering — optimal timing." },
  ]);
  console.log("[DEMO SEED] Spray applications seeded");
}

// ── NMP & NVZ ─────────────────────────────────────────────────────────────
async function seedNMP(farmId: number) {
  const existing = await db.select().from(nutrientManagementPlansTable).where(eq(nutrientManagementPlansTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  const [nmp] = await db.insert(nutrientManagementPlansTable).values({
    farmId, planYear: yr, preparedBy: "Sophie Whitfield (BASIS)",
    notes: "BSFP Plan — Frontier Agriculture. NVZ restrictions applied to all fields.",
  }).returning();

  const fields = await db.select().from(fieldsTable).where(eq(fieldsTable.farmId, farmId));
  if (!nmp || fields.length < 3) return;

  await db.insert(nmpFieldEntriesTable).values([
    { planId: nmp.id, fieldId: fields[0]!.id, cropType: "Winter Wheat", nitrogenKgHa: "220", phosphorusKgHa: "55", potassiumKgHa: "70", timingNotes: "High yield potential. NVZ limit 210 kgN/ha applied — split programme." },
    { planId: nmp.id, fieldId: fields[1]!.id, cropType: "Winter OSR", nitrogenKgHa: "200", phosphorusKgHa: "80", potassiumKgHa: "100", timingNotes: "Split N application — 100 in autumn, 100 in spring." },
    { planId: nmp.id, fieldId: fields[2]!.id, cropType: "Spring Barley", nitrogenKgHa: "140", phosphorusKgHa: "40", potassiumKgHa: "55", timingNotes: "Malting N rate reduced. Target protein <1.5%." },
  ]);

  const nvzExists = await db.select().from(nvzFertiliserApplicationsTable).where(eq(nvzFertiliserApplicationsTable.farmId, farmId)).limit(1);
  if (nvzExists.length === 0) {
    await db.insert(nvzFertiliserApplicationsTable).values([
      { farmId, fieldId: fields[0]!.id, applicationDate: d(`${yr}-02-15`), productName: "Ammonium Nitrate 34.5% (Nitram)", productType: "inorganic_nitrogen", nitrogenKgHa: "80", applicationMethod: "broadcast", areaAppliedHa: "24.80", totalNitrogenKg: "1984", notes: "First split — pre-stem extension." },
      { farmId, fieldId: fields[0]!.id, applicationDate: d(`${yr}-03-28`), productName: "Ammonium Nitrate 34.5% (Nitram)", productType: "inorganic_nitrogen", nitrogenKgHa: "90", applicationMethod: "broadcast", areaAppliedHa: "24.80", totalNitrogenKg: "2232", notes: "Second split at GS30." },
      { farmId, fieldId: fields[1]!.id, applicationDate: d(`${yr}-03-01`), productName: "Inhibitor-coated Urea (46%N)", productType: "inorganic_nitrogen", nitrogenKgHa: "100", applicationMethod: "broadcast", areaAppliedHa: "31.40", totalNitrogenKg: "3140", notes: "Agrotain-coated urea — N2O emission reduction target." },
    ]);
  }
  console.log("[DEMO SEED] NMP/NVZ seeded");
}

// ── SOIL TESTS ───────────────────────────────────────────────────────────
async function seedSoilTests(farmId: number) {
  const existing = await db.select().from(soilTestRecordsTable).where(eq(soilTestRecordsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  const fields = await db.select().from(fieldsTable).where(eq(fieldsTable.farmId, farmId));
  if (fields.length < 4) return;

  const tests = await db.insert(soilTestRecordsTable).values([
    { farmId, fieldId: fields[0]!.id, sampleDate: d(`${prevYr}-10-20`), sampleDepthCm: 15, laboratory: "NRM Laboratories", sampleReference: "NRM-2025-HF001", sampledBy: "James Barnett", notes: "4-year rotation sample. Grid 2ha." },
    { farmId, fieldId: fields[1]!.id, sampleDate: d(`${prevYr}-10-22`), sampleDepthCm: 15, laboratory: "NRM Laboratories", sampleReference: "NRM-2025-NB001", sampledBy: "James Barnett" },
    { farmId, fieldId: fields[2]!.id, sampleDate: d(`${prevYr}-10-22`), sampleDepthCm: 15, laboratory: "ADAS", sampleReference: "ADAS-2025-SM001", sampledBy: "Tom Bradley", notes: "Sandy soils — OM check." },
    { farmId, fieldId: fields[3]!.id, sampleDate: d(`${prevYr}-10-25`), sampleDepthCm: 15, laboratory: "NRM Laboratories", sampleReference: "NRM-2025-LF001", sampledBy: "James Barnett" },
  ]).returning();

  for (const test of tests) {
    const baseResults = test.sampleReference?.includes("HF001")
      ? [
          { soilTestId: test.id, nutrient: "pH", value: "6.7", unit: "pH", index: "optimal" },
          { soilTestId: test.id, nutrient: "P", value: "22", unit: "mg/l", index: "2" },
          { soilTestId: test.id, nutrient: "K", value: "180", unit: "mg/l", index: "2+" },
          { soilTestId: test.id, nutrient: "Mg", value: "120", unit: "mg/l", index: "2" },
          { soilTestId: test.id, nutrient: "Organic Matter", value: "3.2", unit: "%", index: "moderate" },
          { soilTestId: test.id, nutrient: "Nitrogen Min", value: "45", unit: "kg/ha", index: null },
        ]
      : test.sampleReference?.includes("NB001")
      ? [
          { soilTestId: test.id, nutrient: "pH", value: "6.2", unit: "pH", index: "slightly_low" },
          { soilTestId: test.id, nutrient: "P", value: "18", unit: "mg/l", index: "2" },
          { soilTestId: test.id, nutrient: "K", value: "110", unit: "mg/l", index: "1" },
          { soilTestId: test.id, nutrient: "Mg", value: "85", unit: "mg/l", index: "1" },
          { soilTestId: test.id, nutrient: "Organic Matter", value: "2.8", unit: "%", index: "low" },
          { soilTestId: test.id, nutrient: "Nitrogen Min", value: "38", unit: "kg/ha", index: null },
        ]
      : test.sampleReference?.includes("SM001")
      ? [
          { soilTestId: test.id, nutrient: "pH", value: "6.8", unit: "pH", index: "optimal" },
          { soilTestId: test.id, nutrient: "P", value: "32", unit: "mg/l", index: "3" },
          { soilTestId: test.id, nutrient: "K", value: "160", unit: "mg/l", index: "2" },
          { soilTestId: test.id, nutrient: "Mg", value: "130", unit: "mg/l", index: "2+" },
          { soilTestId: test.id, nutrient: "Organic Matter", value: "2.1", unit: "%", index: "low" },
        ]
      : [
          { soilTestId: test.id, nutrient: "pH", value: "7.0", unit: "pH", index: "optimal" },
          { soilTestId: test.id, nutrient: "P", value: "24", unit: "mg/l", index: "2+" },
          { soilTestId: test.id, nutrient: "K", value: "175", unit: "mg/l", index: "2+" },
          { soilTestId: test.id, nutrient: "Mg", value: "118", unit: "mg/l", index: "2" },
          { soilTestId: test.id, nutrient: "Organic Matter", value: "3.5", unit: "%", index: "moderate" },
        ];
    await db.insert(soilTestResultsTable).values(baseResults);
  }
  console.log("[DEMO SEED] Soil tests seeded");
}

// ── EQUIPMENT ────────────────────────────────────────────────────────────
async function seedEquipment(farmId: number) {
  const existing = await db.select().from(equipmentTable).where(eq(equipmentTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  const machines = await db.insert(equipmentTable).values([
    { farmId, name: "John Deere 8R 350", type: "tractor", make: "John Deere", model: "8R 350", yearOfManufacture: 2022, registrationNumber: "EY22 BJK", serialNumber: "1RW8350RPNN123456", currentHours: 1840, purchaseDate: d("2022-03-15"), purchasePricePence: 28500000, notes: "Main tractor. RTK auto-guidance SF3000.", isActive: true },
    { farmId, name: "Case IH Puma 175 CVX", type: "tractor", make: "Case IH", model: "Puma 175 CVX", yearOfManufacture: 2019, registrationNumber: "LK19 FJT", serialNumber: "ZBF175CVX0KHT4321", currentHours: 4210, purchaseDate: d("2019-05-20"), purchasePricePence: 14200000, notes: "Second tractor. Front loader.", isActive: true },
    { farmId, name: "New Holland CR9.90", type: "combine", make: "New Holland", model: "CR9.90 Elevation", yearOfManufacture: 2020, registrationNumber: "SL70 KMB", serialNumber: "YGCR990-2020-1254", currentHours: 1240, purchaseDate: d("2020-07-01"), purchasePricePence: 42000000, notes: "700hp combine. 40ft MacDon draper header.", isActive: true },
    { farmId, name: "Horsch Avatar 6.16 SD", type: "drill", make: "Horsch", model: "Avatar 6.16 SD", yearOfManufacture: 2021, serialNumber: "AV6SD-2021-0541", purchaseDate: d("2021-09-01"), purchasePricePence: 15800000, notes: "6m strip-till disc drill. Precision fertiliser placement.", isActive: true },
    { farmId, name: "Chafer Guardian 4000R 36m", type: "sprayer", make: "Chafer", model: "Guardian 4000R", yearOfManufacture: 2020, serialNumber: "CG4000-2020-0192", currentHours: 980, purchaseDate: d("2020-04-01"), purchasePricePence: 12500000, notes: "Self-propelled 4000L. GPS section control.", isActive: true },
    { farmId, name: "JCB 535-95 Agri Telehandler", type: "telehandler", make: "JCB", model: "535-95 Agri", yearOfManufacture: 2021, registrationNumber: "EY21 FHB", serialNumber: "JCB5359-2021-0834", currentHours: 2140, purchaseDate: d("2021-02-01"), purchasePricePence: 7800000, isActive: true },
    { farmId, name: "Amazone ZA-V 3200 Super Profis", type: "fertiliser_spreader", make: "Amazone", model: "ZA-V 3200 Super Profis", yearOfManufacture: 2022, serialNumber: "AMZV32-2022-0561", purchaseDate: d("2022-03-01"), purchasePricePence: 2200000, notes: "36m spread width. Section control.", isActive: true },
    { farmId, name: "Land Rover Defender 90 TD4", type: "vehicle", make: "Land Rover", model: "Defender 90 TD4", yearOfManufacture: 2018, registrationNumber: "FP18 XKL", currentHours: 88400, purchaseDate: d("2018-06-15"), purchasePricePence: 3400000, notes: "Farm pickup. MOT due Aug 2026.", isActive: true },
  ]).returning();

  const [jd8r, cih, cr990, , chafer] = machines;
  await db.insert(equipmentMaintenanceLogsTable).values([
    { equipmentId: jd8r!.id, maintenanceType: "scheduled", description: "500hr service — John Deere prescribed schedule. Oil, filters, air filter. All OK.", performedBy: "Agriland John Deere", performedDate: d(`${yr}-01-10`), costPence: 60000, notes: "Next service due 2300hrs." },
    { equipmentId: cih!.id, maintenanceType: "scheduled", description: "250hr service. Full fluid change. Loader pivots greased.", performedBy: "Tom Bradley", performedDate: d(`${prevYr}-12-15`), costPence: 18500, notes: "Next service due 4350hrs." },
    { equipmentId: cr990!.id, maintenanceType: "harvest_end", description: "Post-harvest clean-down and service. Concave wires, sieves, spreader serviced.", performedBy: "NH Dealer — Lincoln", performedDate: d(`${prevYr}-09-15`), costPence: 130000, notes: "Ready for next harvest season." },
    { equipmentId: chafer!.id, maintenanceType: "calibration", description: "Pre-season sprayer calibration. Output verified 200 L/ha at 12 km/h. 3 TT110-03 nozzles replaced.", performedBy: "James Barnett", performedDate: d(`${yr}-03-01`), notes: "All 36 nozzles within 5% of target." },
  ]);

  await db.insert(equipmentCalibrationRecordsTable).values([
    { equipmentId: chafer!.id, calibrationType: "sprayer_output", calibrationDate: d(`${yr}-03-01`), nextDueDate: d(`${yr + 1}-03-01`), calibratedBy: "James Barnett", certificateReference: "CAL-2026-CH001", resultPass: true, notes: "All 36 nozzles within 5% of target. Section control verified." },
    { equipmentId: machines[3]!.id, calibrationType: "seed_metering", calibrationDate: d(`${prevYr}-10-05`), nextDueDate: d(`${yr + 1}-09-30`), calibratedBy: "Horsch Dealer", resultPass: true, notes: "Wheat 180 kg/ha, barley 175 kg/ha — all coulters within 3%." },
  ]);

  await db.insert(workshopFireExtinguishersTable).values([
    { farmId, location: "Main Workshop — door", type: "CO2", capacityKg: "5", serialNumber: "FE-2019-0441", lastServiceDate: d(`${prevYr}-11-01`), nextServiceDue: d(`${yr}-11-01`), notes: "Annual service — Lincolnshire Fire Safety." },
    { farmId, location: "Grain Store — entrance", type: "Powder (ABC)", capacityKg: "9", serialNumber: "FE-2021-0892", lastServiceDate: d(`${prevYr}-11-01`), nextServiceDue: d(`${yr}-11-01`) },
    { farmId, location: "Combine cab", type: "Powder (BC)", capacityKg: "2", serialNumber: "FE-2022-0341", lastServiceDate: d(`${prevYr}-07-01`), nextServiceDue: d(`${yr}-07-01`) },
  ]);
  console.log("[DEMO SEED] Equipment seeded");
}

// ── WORKSHOP JOBS ────────────────────────────────────────────────────────
async function seedWorkshopJobs(farmId: number) {
  const existing = await db.select().from(workshopJobsTable).where(eq(workshopJobsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  const machines = await db.select().from(equipmentTable).where(eq(equipmentTable.farmId, farmId));
  if (machines.length < 2) return;
  const [jd8r, cih, , , chafer] = machines;

  await db.insert(workshopJobsTable).values([
    { farmId, equipmentId: jd8r!.id, jobType: "repair", title: "Front axle oil leak — seal replacement", status: "completed", priority: "high", assignedTo: "Tom Bradley", completedAt: d(`${yr}-01-22`), partsCostPence: 12400, description: "Leak from front axle differential seal. Seal replaced. No further leakage." },
    { farmId, equipmentId: cih!.id, jobType: "servicing", title: "Pre-season loader service", status: "completed", priority: "medium", assignedTo: "Tom Bradley", completedAt: d(`${yr}-02-12`), partsCostPence: 4800, description: "Loader pivot pins greased, hydraulic cylinder seals checked." },
    { farmId, equipmentId: chafer!.id, jobType: "repair", title: "Sprayer boom fold cylinder — seal kit", status: "open", priority: "medium", assignedTo: "James Barnett", partsCostPence: 2200, description: "LH fold cylinder weeping hydraulic fluid. Seal kit on order.", notes: "Machine still operational. ETA 5 days." },
    { farmId, equipmentId: jd8r!.id, jobType: "pre_use_check", title: "Daily walkaround check — JD 8R 350", status: "completed", priority: "low", assignedTo: "Tom Bradley", completedAt: d(`${yr}-03-10`), description: "Tyre pressures, fluids, lights, mirrors — all satisfactory." },
  ]);
  console.log("[DEMO SEED] Workshop jobs seeded");
}

// ── SUPPLIERS ────────────────────────────────────────────────────────────
async function seedSuppliers(farmId: number) {
  const existing = await db.select().from(suppliersTable).where(eq(suppliersTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(suppliersTable).values([
    { farmId, name: "Frontier Agriculture Ltd", supplierType: "agrochemicals", category: "agrochemicals", contactName: "Dan Whitmore", email: "d.whitmore@frontier-agriculture.com", phone: "01529 302001", address: "Lincoln Road, Sleaford, NG34 7SP", accountNumber: "FRONT-00442", isApproved: true, notes: "Main agri-merchant. BASIS reps. UFAS certified." },
    { farmId, name: "Harbro Ltd", supplierType: "feed", category: "feed", contactName: "Mike Chalmers", email: "m.chalmers@harbro.co.uk", phone: "01476 591188", address: "Grantham Road, Colsterworth, NG33 5LH", accountNumber: "HARB-00891", isApproved: true, notes: "Livestock feed. UFAS/FEMAS certified." },
    { farmId, name: "Northern Energy Fuels Ltd", supplierType: "fuel", category: "fuel", contactName: "Peter Smithson", phone: "01522 441100", address: "Whisby Road, Lincoln, LN6 3QT", isApproved: true, notes: "Red diesel supplier." },
    { farmId, name: "Minster Vets", supplierType: "veterinary", category: "vet", contactName: "James Mortimer MRCVS", email: "james@ministervets.co.uk", phone: "01529 302244", address: "Station Road, Heckington, NG34 9AB", isApproved: true, notes: "Farm vet. Annual health plan." },
    { farmId, name: "British Sugar PLC", supplierType: "merchant", category: "merchant", contactName: "Sarah Holt", phone: "01522 880000", address: "Peterborough Road, Bourne, PE10 9NA", isApproved: true, notes: "Sugar beet contract. Quota 1,600t." },
    { farmId, name: "Crisp Malt", supplierType: "merchant", category: "merchant", contactName: "Mark Phillips", phone: "01362 694541", address: "Great Ryburgh, NR21 7AL", isApproved: true, notes: "Malting barley contract." },
    { farmId, name: "ABP Foods — Spalding", supplierType: "abattoir", category: "abattoir", phone: "01775 712233", address: "Wardentree Lane, Spalding, PE11 2TH", isApproved: true, notes: "Primary beef deadweight buyer." },
  ]);
  console.log("[DEMO SEED] Suppliers seeded");
}

// ── STOCK ─────────────────────────────────────────────────────────────────
async function seedStock(farmId: number) {
  const existing = await db.select().from(stockItemsTable).where(eq(stockItemsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;

  const items = await db.insert(stockItemsTable).values([
    { farmId, name: "Roundup ProBio 20L", stockType: "chemical", category: "agrochemical", unit: "litres", reorderLevel: "20", notes: "Locked agrochemical store. MAPP 16455." },
    { farmId, name: "Proline 275 EC", stockType: "chemical", category: "agrochemical", unit: "litres", reorderLevel: "5" },
    { farmId, name: "Ammonium Nitrate 34.5% (Nitram)", stockType: "fertiliser", category: "fertiliser", unit: "tonnes", reorderLevel: "10", notes: "Bulk bag. REACH regulations apply." },
    { farmId, name: "KWS Zyatt Winter Wheat Seed", stockType: "seed", category: "seed", unit: "kg", reorderLevel: "0", notes: "Treated. Germination 98%." },
    { farmId, name: "Harbro Beef Finisher 16%", stockType: "feed", category: "feed", unit: "tonnes", reorderLevel: "5", notes: "UFAS certified." },
    { farmId, name: "Ferric Phosphate Slug Pellets", stockType: "chemical", category: "agrochemical", unit: "kg", reorderLevel: "50", notes: "Ironmax Pro. Wildlife-friendly." },
  ]).returning();

  const suppliers = await db.select().from(suppliersTable).where(eq(suppliersTable.farmId, farmId));
  if (suppliers.length < 2 || items.length < 3) return;
  const [frontier, harbro] = suppliers;

  const [po1] = await db.insert(purchaseOrdersTable).values({
    farmId, supplierId: frontier!.id, poNumber: "PO-2026-0041", orderDate: d(`${yr}-01-15`), status: "received", notes: "Spring chemical order.",
  }).returning();

  if (po1 && items.length >= 2) {
    await db.insert(purchaseOrderLinesTable).values([
      { poId: po1.id, stockItemId: items[0]!.id, quantityOrdered: "60", unitPricePence: 1400 },
      { poId: po1.id, stockItemId: items[1]!.id, quantityOrdered: "10", unitPricePence: 4100 },
    ]);
    await db.insert(stockDeliveriesTable).values({
      farmId, poId: po1.id, supplierId: frontier!.id, stockItemId: items[0]!.id, quantity: "60", grnNumber: "GRN-FR-2026-0441", deliveryDate: d(`${yr}-01-22`), receivedBy: "Tom Bradley", notes: "All items checked. No damage.",
    });
  }

  const [po2] = await db.insert(purchaseOrdersTable).values({
    farmId, supplierId: harbro!.id, poNumber: "PO-2026-0055", orderDate: d(`${yr}-03-01`), status: "partial", notes: "Feed — 3 deliveries/month.",
  }).returning();
  if (po2) {
    await db.insert(stockDeliveriesTable).values({
      farmId, poId: po2.id, supplierId: harbro!.id, stockItemId: items[4]!.id, quantity: "6200", grnNumber: "GRN-HAR-2026-0712", deliveryDate: d(`${yr}-03-10`), receivedBy: "Tom Bradley", notes: "Bulk tanker. 6.2t. UFAS declaration provided.",
    });
  }

  const initialQuantities = ["60", "12", "22.5", "1200", "12.4", "200"];
  for (let i = 0; i < Math.min(items.length, initialQuantities.length); i++) {
    await db.insert(stockLevelsTable).values({ farmId, stockItemId: items[i]!.id, currentQuantity: initialQuantities[i]! });
  }
  console.log("[DEMO SEED] Stock seeded");
}

// ── HERDS & ANIMALS ───────────────────────────────────────────────────────
async function seedHerds(farmId: number) {
  const existing = await db.select().from(herdFlockRegisterTable).where(eq(herdFlockRegisterTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(herdFlockRegisterTable).values([
    { farmId, name: "Highfield Beef Herd", type: "cattle", breed: "Limousin X / Charolais X", herdNumber: "UK301234500042", notes: "Commercial suckler and store beef. Red Tractor assured." },
    { farmId, name: "Highfield Sheep Flock", type: "sheep", breed: "Mule / Texel cross", notes: "240 ewes + followers. Lambing February." },
  ]);
  console.log("[DEMO SEED] Herds seeded");
}

async function seedAnimals(farmId: number) {
  const existing = await db.select().from(livestockAnimalsTable).where(eq(livestockAnimalsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  const herds = await db.select().from(herdFlockRegisterTable).where(eq(herdFlockRegisterTable.farmId, farmId));
  const [beefHerd, sheepFlock] = herds;
  if (!beefHerd) return;

  await db.insert(livestockAnimalsTable).values([
    { farmId, herdId: beefHerd.id, earTagNumber: "UK301234500001", species: "cattle", breed: "Limousin X", sex: "male", dateOfBirth: d("2024-02-14"), status: "active", notes: "Good temperament. Ready for finishing." },
    { farmId, herdId: beefHerd.id, earTagNumber: "UK301234500002", species: "cattle", breed: "Charolais X", sex: "male", dateOfBirth: d("2024-03-01"), status: "active", notes: "Fast growing. Target 600kg LW." },
    { farmId, herdId: beefHerd.id, earTagNumber: "UK301234500003", species: "cattle", breed: "Limousin X", sex: "male", dateOfBirth: d("2024-02-20"), status: "active" },
    { farmId, herdId: beefHerd.id, earTagNumber: "UK301234500004", species: "cattle", breed: "Limousin X", sex: "female", dateOfBirth: d("2024-02-28"), status: "active", notes: "Potential breeding heifer." },
    { farmId, herdId: beefHerd.id, earTagNumber: "UK301234500005", species: "cattle", breed: "Simmental", sex: "female", dateOfBirth: d("2021-03-10"), status: "active", notes: "Suckler cow. Good milker." },
    { farmId, herdId: beefHerd.id, earTagNumber: "UK301234500010", species: "cattle", breed: "Charolais X", sex: "male", dateOfBirth: d("2024-01-30"), status: "sold", notes: "Sold ABP Spalding 18/03/2026." },
    ...(sheepFlock ? [
      { farmId, herdId: sheepFlock.id, earTagNumber: "UK415000001", species: "sheep", breed: "Mule", sex: "female", dateOfBirth: d("2022-02-20"), status: "active", notes: "Twins born 2025." },
      { farmId, herdId: sheepFlock.id, earTagNumber: "UK415000050", species: "sheep", breed: "Beltex X Texel", sex: "male", dateOfBirth: d("2023-09-01"), status: "active", notes: "Terminal sire. 120 ewes." },
    ] : []),
  ]);

  const fcExists = await db.select().from(fallenStockContractorsTable).where(eq(fallenStockContractorsTable.farmId, farmId)).limit(1);
  if (fcExists.length === 0) {
    await db.insert(fallenStockContractorsTable).values({ farmId, name: "NFU Mutual — Fallen Stock Scheme", approvalNumber: "NFAS-LIN-00042", operatorType: "nfas-collector", phone: "0800 121 4151", isActive: true, notes: "Call before 9am for same-day collection. Ref: FS-LIN-0042." });
  }
  console.log("[DEMO SEED] Animals seeded");
}

// ── MEDICINE & VET HEALTH ────────────────────────────────────────────────
async function seedMedicineRecords(farmId: number) {
  const existing = await db.select().from(livestockMedicineRecordsTable).where(eq(livestockMedicineRecordsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  const animals = await db.select().from(livestockAnimalsTable).where(eq(livestockAnimalsTable.farmId, farmId)).limit(4);
  if (animals.length < 2) return;

  await db.insert(livestockMedicineRecordsTable).values([
    { farmId, treatmentScope: "individual", animalId: animals[0]!.id, medicineName: "Baytril 100 mg/ml (Enrofloxacin)", batchNumber: "BAY-2025-4412", withdrawalPeriodDays: 14, withdrawalEndDate: d(`${yr}-02-15`), dosage: "5ml IM", administeredDate: d(`${yr}-02-01`), reason: "Bovine Respiratory Disease (BRD)", administeredBy: "James Barnett", vetName: "James Mortimer MRCVS", notes: "Full recovery 5 days post-treatment." },
    { farmId, treatmentScope: "individual", animalId: animals[1]!.id, medicineName: "Metacam 20mg/ml (Meloxicam)", batchNumber: "MET-2025-8811", withdrawalPeriodDays: 15, withdrawalEndDate: d(`${yr}-02-23`), dosage: "22ml SC", administeredDate: d(`${yr}-02-08`), reason: "NSAID — post-dehorning pain relief", administeredBy: "Tom Bradley", vetName: "James Mortimer MRCVS" },
    { farmId, treatmentScope: "individual", animalId: animals[0]!.id, medicineName: "Bovilis BVD (IBR/BVD vaccine)", batchNumber: "BBD-2025-0441", withdrawalPeriodDays: 0, dosage: "2ml IM", administeredDate: d(`${yr}-01-15`), reason: "Annual BVD/IBR vaccination programme", administeredBy: "James Barnett", notes: "Whole herd vaccination completed." },
  ]);

  await db.insert(herdHealthEventsTable).values([
    { farmId, eventDate: d(`${yr}-01-15`), eventType: "vaccination", title: "Annual BVD/IBR vaccination — whole beef herd", description: "86 head vaccinated. Bovilis BVD administered IM. Certificate issued.", vetName: "James Mortimer MRCVS", recordedBy: "James Barnett" },
    { farmId, eventDate: d(`${yr}-02-01`), eventType: "disease_event", title: "BRD outbreak — North Block building", description: "3 steers treated for BRD. Baytril 100 administered. Ventilation reviewed.", vetName: "James Mortimer MRCVS", actionTaken: "Improve ventilation. Monitor remaining cattle.", recordedBy: "James Barnett" },
    { farmId, eventDate: d(`${yr}-03-10`), eventType: "routine_check", title: "Spring lamb health check — vet visit", description: "Annual flock health check. 240 ewes + followers examined. Overall health excellent.", vetName: "James Mortimer MRCVS", recordedBy: "James Barnett" },
  ]);
  console.log("[DEMO SEED] Medicine records seeded");
}

async function seedVetHealthPlan(farmId: number) {
  const existing = await db.select().from(vetHealthPlansTable).where(eq(vetHealthPlansTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(vetHealthPlansTable).values({
    farmId, planYear: yr, vetName: "James Mortimer MRCVS", practiceName: "Minster Vets, Heckington", planDate: d(`${yr}-01-05`), reviewDate: d(`${yr + 1}-01-05`), isActive: true,
    vaccinationProtocol: "BVD/IBR (Bovilis BVD) annually Jan. Leptospirosis (Spirovac) Feb. Lungworm (Huskvac) at risk cattle. Sheep: clostridial (Heptavac P Plus) pre-lambing.",
    wormingProtocol: "Cattle: Clik Extra pour-on spring. Sheep: Zolvix pour-on at housing — SCOPS protocol. FEC monitoring pre-treatment. No blanket treatment.",
    biosecurityMeasures: "Quarantine all purchased animals 21 days. Double-fence. Blood-test all purchased cattle for BVD PI. Visitor log required.",
    healthPriorities: "BRD in housed cattle. BVD (CHeCS accreditation commenced). Liver fluke — low risk. Black-grass resistance worm monitoring.",
    notes: "CHeCS accreditation programme commenced. Target BVD-free status by end 2026.",
  });
  console.log("[DEMO SEED] Vet health plan seeded");
}

// ── BIOSECURITY ───────────────────────────────────────────────────────────
async function seedBiosecurity(farmId: number) {
  const visitorExists = await db.select().from(visitorContractorLogTable).where(eq(visitorContractorLogTable.farmId, farmId)).limit(1);
  if (visitorExists.length === 0) {
    await db.insert(visitorContractorLogTable).values([
      { farmId, arrivalTime: d(`${yr}-01-08T09:00:00Z`), visitorName: "James Mortimer", company: "Minster Vets", purpose: "vet_visit", vehicleRegistration: "FP18 JKL", biosecurityDeclarationSigned: true, notes: "Annual health plan review." },
      { farmId, arrivalTime: d(`${yr}-01-22T10:30:00Z`), visitorName: "Dan Whitmore", company: "Frontier Agriculture", purpose: "agronomist", vehicleRegistration: "HY22 FPR", biosecurityDeclarationSigned: true, notes: "Crop walk — winter wheat, OSR." },
      { farmId, arrivalTime: d(`${yr}-02-10T08:00:00Z`), visitorName: "Peter Smithson", company: "Northern Energy Fuels", purpose: "delivery", vehicleRegistration: "YN71 ZKB", biosecurityDeclarationSigned: false, notes: "Red diesel delivery — stayed on concrete yard." },
      { farmId, arrivalTime: d(`${yr}-02-18T09:30:00Z`), visitorName: "Mark Hollis", company: "APHA", purpose: "inspection", vehicleRegistration: "DW24 ANJ", biosecurityDeclarationSigned: true, notes: "Routine TB inspection. No issues." },
      { farmId, arrivalTime: d(`${yr}-03-05T10:00:00Z`), visitorName: "Tom Hadley", company: "Red Tractor Assurance", purpose: "audit", vehicleRegistration: "SL23 KMP", biosecurityDeclarationSigned: true, notes: "Annual Red Tractor audit. Certificate renewed." },
      { farmId, arrivalTime: d(`${yr}-03-15T13:00:00Z`), visitorName: "Sarah Holt", company: "British Sugar PLC", purpose: "buyer_visit", vehicleRegistration: "KX22 PLT", biosecurityDeclarationSigned: true, notes: "Pre-campaign assessment." },
      { farmId, arrivalTime: d(`${yr}-04-01T07:30:00Z`), visitorName: "Steve Petch", company: "Sleaford Arable Contractors", purpose: "contractor", vehicleRegistration: "PE22 JTR", biosecurityDeclarationSigned: true, notes: "Pre-season harvesting discussion." },
    ]);
  }

  const pestExists = await db.select().from(pestControlRecordsTable).where(eq(pestControlRecordsTable.farmId, farmId)).limit(1);
  if (pestExists.length === 0) {
    await db.insert(pestControlRecordsTable).values([
      { farmId, pestType: "rats", location: "Grain Store entrance — bait point BP-001", productUsed: "Brodifacoum 0.005% wax block (Racumin)", treatmentMethod: "tamper-proof bait station", treatmentDate: d(`${yr}-01-10`), treatedBy: "James Barnett", followUpDate: d(`${yr}-02-10`), notes: "Fresh droppings. Bait topped up. 2 dead rats removed." },
      { farmId, pestType: "rats", location: "Livestock building perimeter — bait point BP-002", productUsed: "Brodifacoum 0.005% wax block (Racumin)", treatmentMethod: "tamper-proof bait station", treatmentDate: d(`${yr}-01-10`), treatedBy: "James Barnett", followUpDate: d(`${yr}-02-10`), notes: "Bait taken — replaced." },
      { farmId, pestType: "mice", location: "Workshop wall — bait point BP-003", productUsed: "Difenacoum 0.005% block bait (Neokill)", treatmentMethod: "tamper-proof bait station", treatmentDate: d(`${yr}-02-12`), treatedBy: "Tom Bradley", followUpDate: d(`${yr}-03-12`), notes: "Bait taken. Gap in wall sealed." },
      { farmId, pestType: "rats", location: "Grain Store entrance — bait point BP-001", productUsed: "Brodifacoum 0.005% wax block", treatmentMethod: "tamper-proof bait station", treatmentDate: d(`${yr}-03-15`), treatedBy: "James Barnett", followUpDate: d(`${yr}-04-15`), outcome: "Reduced activity — monitoring continuing.", notes: "Bait topped up. Low activity." },
    ]);
  }

  const cleanExists = await db.select().from(cleaningDisinfectionRecordsTable).where(eq(cleaningDisinfectionRecordsTable.farmId, farmId)).limit(1);
  if (cleanExists.length === 0) {
    await db.insert(cleaningDisinfectionRecordsTable).values([
      { farmId, cleanedDate: d(`${yr}-01-15`), area: "Livestock building — North Block (post-movement)", cleaningType: "full_cleandown", productsUsed: "Anigene HLD4V 1:100", cleanedBy: "Tom Bradley", verifiedBy: "James Barnett", notes: "Full clean-down after cattle moved." },
      { farmId, cleanedDate: d(`${yr}-02-28`), area: "Grain store — Bay A after emptying", cleaningType: "routine", productsUsed: "Agrigerm (Peracetic acid) 1:50", cleanedBy: "Rob Clarke", verifiedBy: "James Barnett", notes: "Pre-storage hygiene. Dried 48hr before new crop." },
      { farmId, cleanedDate: d(`${yr}-03-20`), area: "Sprayer tank and boom (post-OSR fungicide)", cleaningType: "product_change", productsUsed: "Omniwash cleaner — product rate", cleanedBy: "James Barnett", notes: "Product change — OSR fungicide to wheat herbicide." },
    ]);
  }

  const planExists = await db.select().from(biosecurityPlansTable).where(eq(biosecurityPlansTable.farmId, farmId)).limit(1);
  if (planExists.length === 0) {
    await db.insert(biosecurityPlansTable).values({
      farmId,
      restrictedAreas: "Livestock buildings, grain store, chemical store, fuel tank area. Visitors must be accompanied at all times in these zones.",
      visitorProcedures: "All visitors log in at farm office. Footwear disinfected at Virkon S dip before entering livestock areas. Farm biosecurity briefing given to first-time visitors.",
      vehicleEntryProcedures: "Delivery vehicles restricted to main yard concrete. Livestock vehicles must not enter production fields. Vehicle wheel dip used after notifiable disease risk events.",
      cleaningProtocols: "Livestock buildings cleaned and disinfected after each batch movement. Grain store fogged annually before harvest. Sprayer cleaned down after each product change.",
      pestManagementApproach: "Monthly bait point inspection. All rodenticides in tamper-proof stations. Dead rodents collected promptly — secondary poisoning risk to raptors noted.",
      diseaseResponsePlan: "Any suspicion of notifiable disease: immediately isolate affected animals, restrict movements, contact APHA (03000 200 301), contact Minster Vets. No livestock movements until APHA instruction.",
      wasteManagementProcedures: "Fallen stock — NFU Mutual scheme. Waste chemicals — PACE Agrabase scheme. Used containers triple-rinsed before disposal.",
      waterSourceProtection: "6m buffer strip on Heckington Beck. No fertiliser or spray within 5m of watercourse. Fuel tank bunding inspected annually.",
      staffResponsibilities: "James Barnett (Farm Manager) — overall biosecurity plan responsibility. Tom Bradley — daily livestock checks and visitor log. Rob Clarke — pest control inspections.",
      footwearHygieneProcedures: "Disinfectant foot dip at all livestock building entrances. Virkon S changed weekly. Dedicated livestock footwear stored in entrance lobby.",
      newAnimalIsolationProcedures: "All purchased animals isolated minimum 21 days. Separate water trough and feed. Veterinary health check before mixing with resident stock.",
      feedSecurityProcedures: "Feed bins secured with padlock. Feed delivery notes checked for UFAS/FEMAS certificate on arrival. Batch numbers recorded.",
      diseaseSuspicionProcedures: "Any unusual death, lameness, respiratory signs, or neurological signs reported to James Barnett immediately. Vet called within 4 hours.",
      farmVetName: "James Mortimer MRCVS",
      farmVetPhone: "01529 302244",
      farmVetEmail: "james@ministervets.co.uk",
      aphaAreaOffice: "APHA Newark",
      aphaPhone: "03000 200 301",
      planAuthor: "James Barnett",
      lastReviewedDate: `${yr}-01-05`,
      nextReviewDate: `${yr + 1}-01-05`,
      versionNumber: "v2.1",
    });
  }
  console.log("[DEMO SEED] Biosecurity seeded");
}

// ── COSHH ─────────────────────────────────────────────────────────────────
async function seedCOSHH(farmId: number) {
  const existing = await db.select().from(coshhRecordsTable).where(eq(coshhRecordsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(coshhRecordsTable).values([
    { farmId, assessmentDate: d(`${yr}-01-15`), substanceName: "Roundup ProBio (Glyphosate 360 g/l)", hazardClassification: "irritant", usageArea: "Arable fields — pre-crop knockdown", storageLocation: "Locked COSHH store — bunded floor", controlMeasures: "Prepare at filling station. Avoid >5 mph wind. PPE mandatory for mixing.", ppe: "Chemical-resistant gloves, safety goggles, full overalls, face shield for mixing", emergencyProcedures: "Skin: wash 15 min. Eyes: irrigate 20 min, seek advice. Inhalation: fresh air.", assessedBy: "James Barnett", reviewDate: d(`${yr + 1}-01-15`) },
    { farmId, assessmentDate: d(`${yr}-01-15`), substanceName: "Anigene HLD4V Disinfectant", hazardClassification: "low", usageArea: "Livestock buildings — routine C&D", storageLocation: "Locked COSHH store", controlMeasures: "Mix in ventilated area. Correct dilution rate. Do not mix with other chemicals.", ppe: "Nitrile gloves, eye protection when mixing", emergencyProcedures: "Skin: wash with water. Eyes: irrigate 15 min.", assessedBy: "James Barnett", reviewDate: d(`${yr + 1}-01-15`) },
    { farmId, assessmentDate: d(`${yr}-01-15`), substanceName: "Brodifacoum Rodenticide (0.005% wax block)", hazardClassification: "toxic", usageArea: "Grain store and livestock buildings pest control", storageLocation: "Locked COSHH store — separate from food-grade areas", controlMeasures: "Tamper-resistant stations only. Records of all use. Dead rodents collected promptly.", ppe: "Heavy-duty gloves when handling. Wash hands before eating.", emergencyProcedures: "Ingestion: do not induce vomiting — Vitamin K1 antidote. Seek immediate medical advice.", assessedBy: "James Barnett", reviewDate: d(`${yr + 1}-01-15`) },
    { farmId, assessmentDate: d(`${yr}-01-15`), substanceName: "Ammonium Nitrate 34.5% (Nitram)", hazardClassification: "oxidiser", usageArea: "Arable fertiliser application", storageLocation: "Separate locked building — REACH compliant", controlMeasures: "Separate locked building — REACH compliant. No naked flames. Keep dry.", ppe: "Dust mask when loading, gloves, eye protection", emergencyProcedures: "Skin: wash. Inhalation: fresh air. Ingestion: urgent medical attention.", assessedBy: "James Barnett", reviewDate: d(`${yr + 1}-01-15`) },
  ]);
  console.log("[DEMO SEED] COSHH seeded");
}

// ── RISK ASSESSMENTS ─────────────────────────────────────────────────────
async function seedRiskAssessments(farmId: number) {
  const existing = await db.select().from(riskAssessmentsTable).where(eq(riskAssessmentsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(riskAssessmentsTable).values([
    { farmId, assessmentDate: d(`${yr}-01-10`), title: "Tractor & Machinery Operation", area: "machinery", riskLevel: "medium", hazardDescription: "Crush injuries from PTO/moving parts. Rollover on slopes. Bystander struck.", controlMeasures: "PTO guards checked before use. No passengers. Seatbelts on ROPS tractors. Spotter when reversing.", assessedBy: "James Barnett", reviewDate: d(`${yr + 1}-01-10`) },
    { farmId, assessmentDate: d(`${yr}-01-10`), title: "Working with Cattle", area: "livestock", riskLevel: "high", hazardDescription: "Crush/kick/headbutt. Cows with calves — increased aggression. Confined space in crush.", controlMeasures: "Cattle crush for all individual procedures. Never work alone. Adequate exit space. No children in cattle areas. Steel toe-cap boots minimum.", assessedBy: "James Barnett", reviewDate: d(`${yr + 1}-01-10`), notes: "Reviewed after near-miss Jan 2025." },
    { farmId, assessmentDate: d(`${yr}-01-10`), title: "Pesticide Application & Storage", area: "chemicals", riskLevel: "medium", hazardDescription: "Skin/eye contact. Inhalation of spray mist. Watercourse contamination.", controlMeasures: "PA6-certificated operators only. COSHH assessments for all products. Buffer strips maintained. Eye wash at filling point.", assessedBy: "James Barnett", reviewDate: d(`${yr + 1}-01-10`) },
    { farmId, assessmentDate: d(`${yr}-01-10`), title: "Grain Store Entry — Engulfment Risk", area: "confined_space", riskLevel: "high", hazardDescription: "Engulfment in flowing grain. Oxygen depletion. Dust inhalation. Falls.", controlMeasures: "Permit-to-enter system. Never enter when auger running. Min 2 persons. Dust mask mandatory. Breathing apparatus available.", assessedBy: "James Barnett", reviewDate: d(`${yr + 1}-01-10`) },
    { farmId, assessmentDate: d(`${yr}-01-10`), title: "Manual Handling — Bale & Sack Lifting", area: "manual_handling", riskLevel: "low", hazardDescription: "Back strain from lifting. Slipping on wet surfaces.", controlMeasures: "Mechanical handling wherever possible. Sacks limited to 25kg. Correct technique training completed.", assessedBy: "James Barnett", reviewDate: d(`${yr + 1}-01-10`) },
  ]);
  console.log("[DEMO SEED] Risk assessments seeded");
}

// ── ACCIDENT BOOK ────────────────────────────────────────────────────────
async function seedAccidentBook(farmId: number) {
  const existing = await db.select().from(accidentBookTable).where(eq(accidentBookTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(accidentBookTable).values([
    { farmId, incidentDate: `${prevYr}-08-22`, incidentLocation: "Grain store — auger area", personName: "Rob Clarke", natureOfIncident: "Near miss — Rob near running auger when grain bridge formed. Sudden flow — Rob moved away in time.", natureOfInjury: "None", firstAidDetails: "Welfare check by James Barnett — no injuries.", riddorReportable: false },
    { farmId, incidentDate: `${yr}-02-08`, incidentLocation: "Livestock building — cattle crush", personName: "Tom Bradley", natureOfIncident: "Kick to lower left leg from Limousin cross steer during ear-tagging.", natureOfInjury: "Bruising to left shin. No fracture confirmed by GP.", firstAidDetails: "Ice pack applied on farm. GP review same day.", riddorReportable: false },
  ]);
  console.log("[DEMO SEED] Accident book seeded");
}

// ── WASTE ────────────────────────────────────────────────────────────────
async function seedWaste(farmId: number) {
  const existing = await db.select().from(wasteDisposalRecordsTable).where(eq(wasteDisposalRecordsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(wasteDisposalRecordsTable).values([
    { farmId, disposalDate: d(`${yr}-01-20`), wasteType: "empty_pesticide_containers", quantity: "24 x 5L containers", disposalMethod: "PACE Agrabase scheme collection", carrierName: "Agrabase Ltd", carrierLicence: "CBDU12345", notes: "Triple-rinsed. Ref: PACE-2026-0441." },
    { farmId, disposalDate: d(`${yr}-02-14`), wasteType: "waste_oil", quantity: "80 litres", disposalMethod: "Licensed carrier collection", carrierName: "Lincolnshire Waste Oils Ltd", carrierLicence: "CBDU54321", notes: "From tractor and combine oil changes." },
    { farmId, disposalDate: d(`${yr}-03-01`), wasteType: "fallen_stock", quantity: "1 cow (750kg)", disposalMethod: "National Fallen Stock Scheme", carrierName: "NFU Mutual Fallen Stock", notes: "Suckler cow — suspected bloat. BCMS notification submitted." },
  ]);
  console.log("[DEMO SEED] Waste seeded");
}

// ── FLY-TIPPING ───────────────────────────────────────────────────────────
async function seedFlyTipping(farmId: number) {
  const existing = await db.select().from(flyTippingIncidentsTable).where(eq(flyTippingIncidentsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(flyTippingIncidentsTable).values({
    farmId, discoveredAt: `${prevYr}-09-10`, locationDescription: "Heckington Lane gateway — farm boundary", wasteTypes: "Domestic waste — 10 black bin bags, broken furniture, loose household rubbish", estimatedQuantity: "~0.5 tonne", councilReported: true, councilRefNumber: "NKDC-FT-2025-0892", policeReported: true, policeRefNumber: "LIN-25-00812", notes: "CCTV installed at gateway. Gate locked at night.",
  });
  console.log("[DEMO SEED] Fly-tipping seeded");
}

// ── ENCAMPMENTS ───────────────────────────────────────────────────────────
async function seedEncampments(farmId: number) {
  const existing = await db.select().from(unauthorizedEncampmentsTable).where(eq(unauthorizedEncampmentsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(unauthorizedEncampmentsTable).values({
    farmId, discoveredAt: `${prevYr}-07-15`, locationDescription: "South Meadow field gateway — south corner", vehicleCount: 6, personCount: 12, landDamageDescription: "Gateway post damaged, tyre tracks across headland", notes: "Section 61 direction served by Lincolnshire Police 16/07/2025. Boulders placed to deter future access.",
  });
  console.log("[DEMO SEED] Encampments seeded");
}

// ── INSURANCE ────────────────────────────────────────────────────────────
async function seedInsurance(farmId: number) {
  const existing = await db.select().from(farmInsuranceTable).where(eq(farmInsuranceTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(farmInsuranceTable).values([
    { farmId, insurer: "NFU Mutual", policyType: "Combined Farm — Buildings, Liability, Property", policyNumber: "NFU-LIN-2026-00442", policyholderName: "James Barnett / Highfield Farm", coverLevelPence: 500000000, startDate: `${yr}-01-01`, expiryDate: `${yr}-12-31`, notes: "Buildings + employer liability £10m. Annual renewal Nov 30." },
    { farmId, insurer: "NFU Mutual", policyType: "Farm Vehicle — John Deere 8R 350", policyNumber: "NFU-VEH-2026-01841", policyholderName: "James Barnett", coverLevelPence: 28500000, startDate: `${yr}-01-01`, expiryDate: `${yr}-12-31`, notes: "Comprehensive. Road transit cover included." },
    { farmId, insurer: "Agri Insurance Ltd", policyType: "Multi-Peril Crop Insurance — Winter Wheat", policyNumber: "AGI-CROP-2026-0892", policyholderName: "Highfield Farm", coverLevelPence: 18000000, startDate: `${yr}-01-01`, expiryDate: `${yr}-11-30`, notes: "Fire, hail, flood. Excess 5%. All wheat fields." },
  ]);
  console.log("[DEMO SEED] Insurance seeded");
}

// ── INSPECTIONS ───────────────────────────────────────────────────────────
async function seedInspections(farmId: number) {
  const existing = await db.select().from(inspectionRecordsTable).where(eq(inspectionRecordsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  const records = await db.insert(inspectionRecordsTable).values([
    { farmId, inspectionDate: d(`${yr}-03-05`), inspectionType: "Red Tractor Combined", inspectorName: "Tom Hadley", inspectionBody: "Red Tractor Assurance", overallResult: "pass", nextInspectionDue: d(`${yr + 1}-03-01`), notes: "Full combined arable + livestock audit. All requirements met. Certificate renewed." },
    { farmId, inspectionDate: d(`${yr}-02-18`), inspectionType: "APHA TB Test", inspectorName: "Mark Hollis (APHA)", inspectionBody: "APHA", overallResult: "pass", nextInspectionDue: d(`${yr + 1}-02-01`), notes: "86 cattle tested — all passed. No reactor animals." },
    { farmId, inspectionDate: d(`${prevYr}-07-20`), inspectionType: "RPA Cross-Compliance Farm Visit", inspectorName: "RPA Field Officer", inspectionBody: "Rural Payments Agency", overallResult: "pass", notes: "SMR 10 (tagging), SMR 9 (soil protection), GAEC checked. Minor advisory." },
  ]).returning();

  if (records[0]) {
    const [nc] = await db.insert(nonconformanceRecordsTable).values({
      farmId, inspectionId: records[0].id, identifiedDate: d(`${prevYr}-03-10`), category: "record_keeping", description: "Medicine withdrawal record — 2 records missing clearance date", severity: "minor", status: "closed", notes: "Complete missing clearance dates. Implement check before each record entry.",
    }).returning();
    if (nc) {
      await db.insert(correctiveActionsTable).values({ nonconformanceId: nc.id, description: "Clearance dates added retrospectively from vet prescriptions. Procedure posted on farm notice board.", assignedTo: "James Barnett", dueDate: d(`${prevYr}-03-24`), completedDate: d(`${prevYr}-03-22`), status: "completed" });
    }
  }

  const certExists = await db.select().from(farmAssuranceCertsTable).where(eq(farmAssuranceCertsTable.farmId, farmId)).limit(1);
  if (certExists.length === 0) {
    await db.insert(farmAssuranceCertsTable).values([
      { farmId, certificationBody: "Red Tractor Assurance", scheme: "Red Tractor Assured — Combinable Crops", certNumber: "RT-CC-2026-LIN-00442", issueDate: d(`${yr}-03-05`), expiryDate: d(`${yr + 1}-03-05`), status: "active" },
      { farmId, certificationBody: "Red Tractor Assurance", scheme: "Red Tractor Assured — Beef & Lamb", certNumber: "RT-BL-2026-LIN-00442", issueDate: d(`${yr}-03-05`), expiryDate: d(`${yr + 1}-03-05`), status: "active" },
      { farmId, certificationBody: "LEAF", scheme: "LEAF Marque", certNumber: "LM-2026-0441", issueDate: d(`${yr}-02-01`), expiryDate: d(`${yr + 1}-02-01`), status: "active" },
    ]);
  }
  console.log("[DEMO SEED] Inspections seeded");
}

// ── ENVIRONMENTAL ────────────────────────────────────────────────────────
async function seedEnvironmental(farmId: number) {
  const existing = await db.select().from(environmentalFeaturesTable).where(eq(environmentalFeaturesTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(environmentalFeaturesTable).values([
    { farmId, featureType: "buffer_strip", description: "Heckington Beck Buffer Strip — 6m grass buffer east of Beck Field", areaHectares: "1.20", lengthMetres: "850", managementPractice: "Cut Jul/Sep. No spray within 5m. SFI AB8 registered." },
    { farmId, featureType: "hedgerow", description: "Long Field eastern hedgerow — hawthorn and blackthorn", lengthMetres: "420", managementPractice: "Cut every 3 years rotational. Last cut autumn 2024." },
    { farmId, featureType: "wildflower_margin", description: "South Meadow — 6m AB8 wildflower margin. Cornflower, poppy, borage, vetch. Sown 2022.", areaHectares: "0.80", managementPractice: "Annual monitoring. Strip mowed Sept for re-growth." },
    { farmId, featureType: "woodland", description: "Home Field south boundary — mixed native tree belt planted 2019. Ash, oak, hawthorn, field maple.", areaHectares: "0.45", managementPractice: "No management until year 10. Natural establishment." },
    { farmId, featureType: "wetland", description: "Beck Field flood meadow — low-lying area. Lapwing nesting 2024.", areaHectares: "2.10", managementPractice: "No cultivation. Seasonal grazing only." },
  ]);

  const agriExists = await db.select().from(agriEnvironmentSchemeRecordsTable).where(eq(agriEnvironmentSchemeRecordsTable.farmId, farmId)).limit(1);
  if (agriExists.length === 0) {
    await db.insert(agriEnvironmentSchemeRecordsTable).values({
      farmId, schemeName: "Sustainable Farming Incentive (SFI) 2024", agreementNumber: "SFI-2024-LIN-00892", startDate: d(`${yr - 1}-05-01`), endDate: d(`${yr + 4}-04-30`), annualPaymentPence: 1840000, obligations: "AB8 (Wildflower margins) 0.8ha, SAM1 (Soil assessments), CIPM1 (IPM), OFC1 (Flood meadow)", status: "active",
    });
  }
  console.log("[DEMO SEED] Environmental seeded");
}

// ── SFI ──────────────────────────────────────────────────────────────────
async function seedSFI(farmId: number) {
  const existing = await db.select().from(sfiAgreementsTable).where(eq(sfiAgreementsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  const [agreement] = await db.insert(sfiAgreementsTable).values({
    farmId, agreementNumber: "SFI-2024-LIN-00892", schemeName: "Sustainable Farming Incentive 2024", agreementStartDate: `${yr - 1}-05-01`, agreementEndDate: `${yr + 4}-04-30`, totalAnnualPayment: "18400.00", status: "active",
  }).returning();
  if (!agreement) return;

  await db.insert(sfiActionsTable).values([
    { farmId, agreementId: agreement.id, actionCode: "AB8", actionTitle: "Flower-rich grassland margins", eligibleAreaHa: "0.80", annualPaymentPerHa: "641.00", annualPaymentAmount: "512.80", notes: "South Meadow headland. Sown spring 2023." },
    { farmId, agreementId: agreement.id, actionCode: "SAM1", actionTitle: "Soil assessment and management plan", eligibleAreaHa: "170.70", annualPaymentPerHa: "6.00", annualPaymentAmount: "1024.20", notes: "All arable fields. Soil assessments due annually." },
    { farmId, agreementId: agreement.id, actionCode: "CIPM1", actionTitle: "Integrated pest management plan", eligibleAreaHa: "170.70", annualPaymentPerHa: "15.00", annualPaymentAmount: "2560.50", notes: "IPM plan reviewed annually with agronomist." },
    { farmId, agreementId: agreement.id, actionCode: "OFC1", actionTitle: "Manage flood risk on in-field features", eligibleAreaHa: "2.10", annualPaymentPerHa: "97.00", annualPaymentAmount: "203.70", notes: "Beck Field flood meadow. No cultivation, seasonal grazing." },
  ]);
  console.log("[DEMO SEED] SFI seeded");
}

// ── GRAIN SALES ────────────────────────────────────────────────────────────
async function seedGrainSales(farmId: number) {
  const existing = await db.select().from(grainSalesTable).where(eq(grainSalesTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(grainSalesTable).values([
    { farmId, saleDate: d(`${yr}-01-15`), saleType: "spot", buyer: "Frontier Agriculture Ltd", merchantRef: "FR-MW-2026-0441", commodity: "Winter Wheat", variety: "KWS Zyatt", tonnage: "28.4", pricePerTonnePence: 23200, grossValuePence: 658688, deductionsPence: 2844, netValuePence: 655844, moisture: "14.2", gradeAchieved: "feed", notes: "Spot sale from Bay A store." },
    { farmId, saleDate: d(`${yr}-02-10`), saleType: "forward", buyer: "Allied Mills", merchantRef: "AM-MW-2026-0182", commodity: "Winter Wheat", variety: "KWS Zyatt", tonnage: "29.8", pricePerTonnePence: 23800, grossValuePence: 709240, deductionsPence: 0, netValuePence: 709240, moisture: "13.9", protein: "12.6", gradeAchieved: "milling", notes: "Milling contract delivery. Protein spec met." },
    { farmId, saleDate: d(`${prevYr}-09-05`), saleType: "spot", buyer: "Crisp Malt", merchantRef: "CM-SB-2026-0071", commodity: "Spring Barley", variety: "Laureate", tonnage: "45.2", pricePerTonnePence: 21500, grossValuePence: 971800, deductionsPence: 3000, netValuePence: 968800, moisture: "14.9", gradeAchieved: "malting", notes: "Malting barley delivery — NN 1.48% achieved." },
    { farmId, saleDate: d(`${prevYr}-08-20`), saleType: "spot", buyer: "Frontier Agriculture Ltd", commodity: "Winter OSR", variety: "Architect", tonnage: "30.5", pricePerTonnePence: 48500, grossValuePence: 1479250, deductionsPence: 12500, netValuePence: 1466750, moisture: "8.8", gradeAchieved: "milling_oil", notes: "OSR — oil content 44.2%. Oil premium received." },
  ]);
  console.log("[DEMO SEED] Grain sales seeded");
}

// ── LIVESTOCK SALES ────────────────────────────────────────────────────────
async function seedLivestockSales(farmId: number) {
  const dwExists = await db.select().from(livestockDeadweightSalesTable).where(eq(livestockDeadweightSalesTable.farmId, farmId)).limit(1);
  if (dwExists.length === 0) {
    await db.insert(livestockDeadweightSalesTable).values([
      { farmId, killDate: d(`${yr}-03-18`), processor: "ABP Foods — Spalding", species: "cattle", breed: "Limousin X / Charolais X", headCount: 8, averageDeadweightKg: "360", totalDeadweightKg: "2880", pricePerKgPence: 585, grossValuePence: 16848000, gradeClassification: "R4L", killSheetRef: "ABP-2026-KS-0441", notes: "Clean kill. R4L average. Target weight achieved." },
      { farmId, killDate: d(`${prevYr}-11-15`), processor: "ABP Foods — Spalding", species: "cattle", breed: "Simmental X", headCount: 6, averageDeadweightKg: "390", totalDeadweightKg: "2340", pricePerKgPence: 420, grossValuePence: 9828000, notes: "Cull cows from suckler herd. OTM cattle." },
    ]);
  }

  const martExists = await db.select().from(livestockMartSalesTable).where(eq(livestockMartSalesTable.farmId, farmId)).limit(1);
  if (martExists.length === 0) {
    await db.insert(livestockMartSalesTable).values([
      { farmId, saleDate: d(`${yr}-02-28`), martName: "Newark Market", species: "sheep", headCount: 30, category: "store", averageLiveweightKg: "36", priceType: "per_head", pricePerUnitPence: 9200, grossValuePence: 276000, notes: "Store lambs — good trade. Averaged £92/head." },
      { farmId, saleDate: d(`${prevYr}-10-10`), martName: "Sleaford Livestock Market", species: "cattle", headCount: 12, category: "store", averageLiveweightKg: "380", priceType: "per_head", pricePerUnitPence: 154000, grossValuePence: 1848000, notes: "Sold stores to finisher. Good buyers' demand." },
    ]);
  }
  console.log("[DEMO SEED] Livestock sales seeded");
}

// ── FINANCIAL TRANSACTIONS ────────────────────────────────────────────────
async function seedFinancial(farmId: number) {
  const existing = await db.select().from(financialTransactionsTable).where(eq(financialTransactionsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(financialTransactionsTable).values([
    { farmId, transactionDate: d(`${yr}-01-05`), transactionType: "income", category: "SFI / Subsidy", description: "SFI 2024 — Q1 payment", amountPence: 460000, vatAmountPence: 0, vatRate: "zero", reference: "RPA-SFI-Q1-2026", vendorCustomer: "Rural Payments Agency" },
    { farmId, transactionDate: d(`${yr}-01-22`), transactionType: "expense", category: "Chemicals & Inputs", description: "Spring chemical order — Frontier Agriculture", amountPence: 142000, vatAmountPence: 28400, vatRate: "standard", reference: "PO-2026-0041", vendorCustomer: "Frontier Agriculture Ltd" },
    { farmId, transactionDate: d(`${yr}-02-01`), transactionType: "expense", category: "Veterinary", description: "BVD/IBR vaccination programme — whole herd", amountPence: 62000, vatAmountPence: 0, vatRate: "zero", reference: "MV-INV-2026-0441", vendorCustomer: "Minster Vets" },
    { farmId, transactionDate: d(`${yr}-02-15`), transactionType: "expense", category: "Fertiliser", description: "Ammonium Nitrate 34.5% — 22.5t delivery", amountPence: 445500, vatAmountPence: 0, vatRate: "zero", reference: "FR-INV-2026-0188", vendorCustomer: "Frontier Agriculture Ltd" },
    { farmId, transactionDate: d(`${yr}-03-05`), transactionType: "expense", category: "Professional Fees", description: "Red Tractor audit fee", amountPence: 38000, vatAmountPence: 7600, vatRate: "standard", reference: "RT-INV-2026-0441", vendorCustomer: "Red Tractor Assurance" },
    { farmId, transactionDate: d(`${yr}-03-15`), transactionType: "expense", category: "Seed", description: "Sugar beet seed — British Sugar (24 units)", amountPence: 312000, vatAmountPence: 0, vatRate: "zero", reference: "BS-SEED-2026-0312", vendorCustomer: "British Sugar PLC" },
    { farmId, transactionDate: d(`${yr}-04-01`), transactionType: "income", category: "SFI / Subsidy", description: "SFI 2024 — Q2 payment", amountPence: 460000, vatAmountPence: 0, vatRate: "zero", reference: "RPA-SFI-Q2-2026", vendorCustomer: "Rural Payments Agency" },
    { farmId, transactionDate: d(`${yr}-01-10`), transactionType: "income", category: "Straw Sales", description: "Straw sale — 40 x 500kg round bales", amountPence: 120000, vatAmountPence: 0, vatRate: "zero", reference: "STRAW-2026-001", vendorCustomer: "J. Hadley Equestrian, Heckington" },
    { farmId, transactionDate: d(`${yr}-02-05`), transactionType: "expense", category: "Machinery — Repairs", description: "JD 8R axle seal repair — Agriland dealer", amountPence: 60400, vatAmountPence: 12080, vatRate: "standard", reference: "JD-INV-2026-0092", vendorCustomer: "Agriland Lincolnshire" },
    { farmId, transactionDate: d(`${yr}-01-12`), transactionType: "expense", category: "Insurance", description: "NFU Mutual — combined farm policy premium", amountPence: 880000, vatAmountPence: 0, vatRate: "exempt", reference: "NFU-2026-00442", vendorCustomer: "NFU Mutual" },
    { farmId, transactionDate: d(`${yr}-03-20`), transactionType: "expense", category: "Contracting", description: "Silage contracting — McHugh Agri", amountPence: 84000, vatAmountPence: 16800, vatRate: "standard", reference: "MH-INV-2026-0441", vendorCustomer: "McHugh Agricultural Contractors" },
    { farmId, transactionDate: d(`${yr}-04-10`), transactionType: "income", category: "Diversification", description: "Farmhouse holiday let — Easter week", amountPence: 280000, vatAmountPence: 0, vatRate: "exempt", reference: "SYKES-2026-0441", vendorCustomer: "Sykes Cottages" },
  ]);
  console.log("[DEMO SEED] Financial transactions seeded");
}

// ── CROP CONTRACTS ────────────────────────────────────────────────────────
async function seedCropContracts(farmId: number) {
  const existing = await db.select().from(cropContractsTable).where(eq(cropContractsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(cropContractsTable).values([
    { farmId, buyer: "Allied Mills", commodity: "Winter Wheat (KWS Zyatt)", variety: "KWS Zyatt", qualitySpec: "Protein >13%, Hagberg >250, Moisture <15%", quantityTonnes: "200", contractedPricePence: 23800, contractDate: d(`${prevYr}-06-01`), deliveryWindowStart: d(`${yr}-08-01`), deliveryWindowEnd: d(`${yr}-10-31`), deliveryLocation: "Allied Mills Northampton", status: "open", contractReference: "AM-MW-2026-0182" },
    { farmId, buyer: "Crisp Malt", commodity: "Spring Barley (Laureate)", variety: "Laureate", qualitySpec: "NN <1.5%, Germination >95%, Skinned <1%", quantityTonnes: "120", contractedPricePence: 22000, contractDate: d(`${prevYr}-07-01`), deliveryWindowStart: d(`${yr}-09-01`), deliveryWindowEnd: d(`${yr}-11-30`), deliveryLocation: "Crisp Malt Great Ryburgh", status: "open", contractReference: "CM-SB-2026-0071" },
    { farmId, buyer: "British Sugar PLC", commodity: "Sugar Beet (Alize KWS)", qualitySpec: "Campaign delivery — tare allowances apply", quantityTonnes: "1600", contractedPricePence: 4200, contractDate: d(`${yr}-01-15`), deliveryWindowStart: d(`${yr}-09-15`), deliveryWindowEnd: d(`${yr + 1}-01-31`), deliveryLocation: "Delivered by British Sugar lorries", status: "open", contractReference: "BS-HIGHFIELD-2026-042" },
  ]);
  console.log("[DEMO SEED] Crop contracts seeded");
}

// ── GRANTS ────────────────────────────────────────────────────────────────
async function seedGrants(farmId: number) {
  const existing = await db.select().from(farmGrantsTable).where(eq(farmGrantsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(farmGrantsTable).values([
    { farmId, schemeName: "Sustainable Farming Incentive (SFI) 2024", schemeType: "agri_environment", status: "active", applicationDate: `${yr - 1}-04-15`, approvalDate: `${yr - 1}-05-01`, grantAmountPence: 9200000, applicationReference: "SFI-2024-LIN-00892", notes: "5-year SFI agreement. Actions: AB8, SAM1, CIPM1, OFC1." },
    { farmId, schemeName: "FETF 2025 — Livestock Monitoring System", schemeType: "capital_grant", status: "received", applicationDate: `${prevYr}-06-01`, approvalDate: `${prevYr}-10-15`, grantAmountPence: 640000, applicationReference: "FETF-2025-00892", notes: "£6,400 grant — remote livestock monitoring (EID readers + bolus tags). 50% co-fund." },
    { farmId, schemeName: "Countryside Stewardship Mid-Tier (Historic)", schemeType: "agri_environment", status: "completed", grantAmountPence: 24500000, applicationReference: "CS-MT-2019-LIN-00441", notes: "5-year agreement completed Dec 2023. Transitioned to SFI." },
    { farmId, schemeName: "Slurry Infrastructure Grant (SIG)", schemeType: "capital_grant", status: "pending", applicationDate: `${yr}-02-01`, grantAmountPence: 2800000, applicationReference: "SIG-2026-APP-00712", notes: "Application for covered slurry store — 6 month capacity. Decision expected Q3 2026." },
  ]);
  console.log("[DEMO SEED] Grants seeded");
}

// ── HAULAGE ───────────────────────────────────────────────────────────────
async function seedHaulage(farmId: number) {
  const haulierExists = await db.select().from(hauliersTable).where(eq(hauliersTable.farmId, farmId)).limit(1);
  if (haulierExists.length === 0) {
    await db.insert(hauliersTable).values([
      { farmId, companyName: "J. Haigh Haulage Ltd", contactName: "John Haigh", phone: "07711 122334", vehicleTypes: "curtainsider artic", operatorLicence: "OF0012345", notes: "Main haulier. Grain and livestock." },
      { farmId, companyName: "ABP Transport Ltd", phone: "01775 712233", vehicleTypes: "livestock trailer", notes: "Livestock collections for ABP deadweight." },
      { farmId, companyName: "Sleaford Agricultural Haulage", contactName: "Steve Petch", phone: "07712 223344", vehicleTypes: "grain trailer", notes: "Local short-haul grain." },
    ]);
  }

  const haulageExists = await db.select().from(haulageRecordsTable).where(eq(haulageRecordsTable.farmId, farmId)).limit(1);
  if (haulageExists.length === 0) {
    await db.insert(haulageRecordsTable).values([
      { farmId, loadType: "grain", commodity: "Winter Wheat", grade: "feed", weightTonnes: "28.4", origin: "Highfield Farm — Bay A", destination: "Frontier Agriculture, Sleaford", departureDate: d(`${yr}-01-15`), vehicleRegistration: "YR73 BXK", driverName: "John Haigh", haulierCompany: "J. Haigh Haulage Ltd", weighbridgeTicketNo: "WT-FR-2026-0441", costPence: 45440, deliveryStatus: "delivered", notes: "Weight confirmed on weighbridge." },
      { farmId, loadType: "grain", commodity: "Winter Wheat", grade: "milling", weightTonnes: "29.8", origin: "Highfield Farm — Bay A", destination: "Allied Mills, Northampton", departureDate: d(`${yr}-02-10`), vehicleRegistration: "YR73 BXK", driverName: "John Haigh", haulierCompany: "J. Haigh Haulage Ltd", costPence: 65560, deliveryStatus: "delivered" },
      { farmId, loadType: "livestock", commodity: "Finished beef cattle", weightTonnes: "4.8", origin: "Highfield Farm — North Block", destination: "ABP Foods Spalding", departureDate: d(`${yr}-03-18`), vehicleRegistration: "YX21 ELP", driverName: "ABP Driver", haulierCompany: "ABP Transport Ltd", deliveryStatus: "delivered", notes: "8 head. Journey 45 min. Welfare checked at loading." },
    ]);
  }
  console.log("[DEMO SEED] Haulage seeded");
}

// ── PLANNER EVENTS ────────────────────────────────────────────────────────
async function seedPlanner(farmId: number) {
  const existing = await db.select().from(farmPlannerEventsTable).where(eq(farmPlannerEventsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(farmPlannerEventsTable).values([
    { farmId, title: "T1 Wheat Fungicide — Home Field & Long Field", eventDate: d(`${yr}-03-25`), colour: "green", description: "Apply Proline 275 EC at 0.8 L/ha. Condition: temp >8°C, wind <5mph." },
    { farmId, title: "Annual TB Test — Whole Herd (86 head)", eventDate: d(`${yr}-04-15`), colour: "red", description: "APHA TB test — Minster Vets attending. Cattle handling 7am start." },
    { farmId, title: "Spring Barley Top-dressing (N)", eventDate: d(`${yr}-04-18`), colour: "blue", description: "AN 34.5% at 140 kg N/ha — South Meadow. Amazone spreader." },
    { farmId, title: "Red Tractor Harvest Audit", eventDate: d(`${yr}-07-20`), colour: "orange", description: "Annual combined arable + livestock Red Tractor inspection." },
    { farmId, title: "Sugar Beet Campaign — British Sugar", eventDate: d(`${yr}-09-15`), colour: "violet", description: "British Sugar Beck Field contract starts. Lorry collections begin." },
    { farmId, title: "SFI Annual Claim — RPA Portal Deadline", eventDate: d(`${yr}-03-31`), colour: "red", description: "Complete SFI annual claim on RPA portal. Include AB8 and SAM1 evidence. Deadline 31 March." },
    { farmId, title: "Winter Wheat Sowing — Home Field", eventDate: d(`${yr}-10-05`), colour: "green", description: "KWS Zyatt at 175 kg/ha. Horsch Avatar drill. Conditions permitting." },
    { farmId, title: "NFU Mutual Insurance Renewal", eventDate: d(`${yr}-11-30`), colour: "slate", description: "Annual farm insurance renewal. Review combined buildings, liability, vehicles policy." },
    { farmId, title: "Sheep — Annual Drenching Programme", eventDate: d(`${yr}-05-15`), colour: "blue", description: "Anthelmintic — Zolvix pour-on. Whole flock 240 ewes + followers. FEC pre-treatment." },
    { farmId, title: "Lincolnshire County Show — BDE Demo", eventDate: d(`${yr}-06-18`), colour: "violet", description: "Lincolnshire County Show — BDE Farm Trac demonstration stand. Showground, Lincoln." },
  ]);
  console.log("[DEMO SEED] Planner seeded");
}

// ── WEATHER ───────────────────────────────────────────────────────────────
async function seedWeather(farmId: number) {
  const existing = await db.select().from(weatherStationsTable).where(eq(weatherStationsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  const [station] = await db.insert(weatherStationsTable).values({
    farmId, name: "Highfield Farm — Home Yard AWS", stationType: "automatic", manufacturer: "Davis Instruments", model: "Vantage Pro2 Plus", serialNumber: "DVS-VP2-2022-0441", installDate: d("2022-06-15"), isActive: true, notes: "Temp, rain, wind, humidity, solar radiation recorded.",
  }).returning();
  if (!station) return;

  const months = [
    { m: `${yr}-01`, temp: 4.2, rain: 68, wind: 12 },
    { m: `${yr}-02`, temp: 6.1, rain: 42, wind: 10 },
    { m: `${yr}-03`, temp: 9.4, rain: 28, wind: 8 },
  ];
  for (const mo of months) {
    for (let day = 1; day <= 28; day++) {
      const dateStr = `${mo.m}-${String(day).padStart(2, "0")}T08:00:00Z`;
      const windDirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
      try {
        await db.insert(weatherReadingsTable).values({
          stationId: station.id, farmId,
          readingTimestamp: new Date(dateStr),
          temperatureC: String((mo.temp + (Math.random() * 4 - 2)).toFixed(1)),
          rainfallMm: day % 5 === 0 ? String((mo.rain / 6).toFixed(1)) : "0.0",
          windSpeedKmh: String((mo.wind + Math.random() * 6).toFixed(1)),
          windDirection: windDirs[day % 8],
          humidityPercent: String((65 + Math.random() * 25).toFixed(1)),
          entryMode: "automatic",
        });
      } catch (_) { }
    }
  }
  console.log("[DEMO SEED] Weather seeded");
}

// ── DOCUMENTS ─────────────────────────────────────────────────────────────
async function seedDocuments(farmId: number, _tenantId: number) {
  const existing = await db.select().from(documentRecordsTable).where(eq(documentRecordsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(documentRecordsTable).values([
    { farmId, title: "Red Tractor Certificate — 2026", documentType: "certificate", issueDate: d(`${yr}-03-05`), expiryDate: d(`${yr + 1}-03-05`), referenceNumber: "RT-CC-2026-LIN-00442", uploadedBy: "James Barnett", notes: "Combined Red Tractor Assurance certificate — arable and livestock. Valid to 05/03/2027." },
    { farmId, title: "NRM Soil Analysis Report — 2025", documentType: "report", issueDate: d(`${prevYr}-11-15`), referenceNumber: "NRM-2025-0441", uploadedBy: "James Barnett", notes: "NRM Laboratories comprehensive soil analysis. Fields HF-001, NB-002, SM-003, LF-004." },
    { farmId, title: "SFI Agreement 2024 — Signed Copy", documentType: "agreement", issueDate: d(`${yr - 1}-05-01`), referenceNumber: "SFI-2024-LIN-00892", uploadedBy: "James Barnett", notes: "Signed SFI 5-year agreement." },
    { farmId, title: "Vet Health Plan 2026 — Cattle & Sheep", documentType: "health_plan", issueDate: d(`${yr}-01-05`), expiryDate: d(`${yr + 1}-01-05`), uploadedBy: "James Barnett", notes: "Annual farm health plan — James Mortimer MRCVS, Minster Vets." },
    { farmId, title: "Risk Assessment Register 2026", documentType: "risk_assessment", issueDate: d(`${yr}-01-10`), expiryDate: d(`${yr + 1}-01-10`), uploadedBy: "James Barnett", notes: "Consolidated risk assessments — machinery, livestock, chemicals, confined spaces." },
    { farmId, title: "Harbro Feed Declaration — HAR-B-2026-0312", documentType: "feed_declaration", issueDate: d(`${yr}-03-10`), uploadedBy: "Tom Bradley", notes: "UFAS/FEMAS feed declaration — Beef Finisher Blend 16% March 2026." },
    { farmId, title: "LEAF Marque Certificate 2026", documentType: "certificate", issueDate: d(`${yr}-02-01`), expiryDate: d(`${yr + 1}-02-01`), referenceNumber: "LM-2026-0441", uploadedBy: "James Barnett", notes: "LEAF Marque — Linked Environment and Farming certification." },
  ]);
  console.log("[DEMO SEED] Documents seeded");
}

// ── CARBON & SUSTAINABILITY ───────────────────────────────────────────────
async function seedCarbon(farmId: number) {
  const existing = await db.select().from(carbonAuditsTable).where(eq(carbonAuditsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(carbonAuditsTable).values({
    farmId, auditYear: yr, auditDate: `${yr}-02-01`, conductedBy: "Sophie Whitfield (Frontier Agriculture)", auditTool: "Farm Carbon Toolkit (FCT) v4.1",
    totalScope1TonnesCo2e: "718.4", totalScope2TonnesCo2e: "84.2", totalScope3TonnesCo2e: "39.8",
    totalTonnesCo2e: "842.4", sequestrationTonnesCo2e: "124.8", netTonnesCo2e: "717.6",
    intensityPerTonneProd: "4.2", reductionTargetPct: "10.0",
    notes: "Scope 1 + 2 emissions. Hedgerows, woodland, grassland sequestration. Target: 10% reduction by 2028.",
  });

  await db.insert(carbonReductionActionsTable).values([
    { farmId, actionTitle: "Transition to inhibitor-coated urea fertiliser", category: "fertiliser", description: "Replace AN with Agrotain urea on OSR and spring crops to reduce N2O emissions.", targetReductionTonnesCo2e: "45.0", status: "in_progress", plannedStartDate: `${yr}-01-01` },
    { farmId, actionTitle: "Solar PV installation — South Grain Store roof", category: "energy", description: "50kWp system on grain store roof. Reduce grid electricity consumption.", targetReductionTonnesCo2e: "18.5", status: "planned", plannedStartDate: `${yr + 1}-03-01` },
    { farmId, actionTitle: "Cover cropping — autumn following sugar beet", category: "soil", description: "Winter rye cover on Beck Field post-beet. Locks soil carbon, prevents run-off.", targetReductionTonnesCo2e: "22.0", status: "in_progress", plannedStartDate: `${yr - 1}-10-01` },
  ]);

  await db.insert(renewableEnergyProductionTable).values({
    farmId, productionYear: prevYr, periodStart: `${prevYr}-01-01`, periodEnd: `${prevYr}-12-31`,
    technologyType: "Solar PV", systemName: "Workshop roof 10kWp array",
    installedCapacityKw: "10.0", generationKwh: "8400", selfConsumedKwh: "5200", exportedKwh: "3200",
    exportTariffPencePerKwh: "4.11", exportRevenueGbp: "131.52",
    co2AvoidedTonnes: "2.14", fitRocReference: "FIT-2026-00441",
    notes: "Existing 10kWp on workshop roof. FIT scheme — expires 2028.",
  });
  console.log("[DEMO SEED] Carbon seeded");
}

// ── DIVERSIFICATION ───────────────────────────────────────────────────────
async function seedDiversification(farmId: number) {
  const existing = await db.select().from(diversificationActivitiesTable).where(eq(diversificationActivitiesTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(diversificationActivitiesTable).values([
    { farmId, activityName: "Third-Party Grain Storage Rental", activityType: "storage_rental", startDate: "2022-01-01", status: "active", annualTurnover: "840.00", notes: "120t Bay B capacity rented to Frontier Agriculture at £7/t/year." },
    { farmId, activityName: "Straw Sales — Round Bales", activityType: "direct_sales", startDate: "2020-01-01", status: "active", annualTurnover: "1200.00", notes: "Surplus wheat and barley straw to equine and livestock units." },
    { farmId, activityName: "Syndicate Rough Shooting — North Block", activityType: "shooting", startDate: "2019-09-01", status: "active", annualTurnover: "2400.00", notes: "8-gun pheasant/partridge syndicate. Season October–February." },
    { farmId, activityName: "Farmhouse Holiday Let", activityType: "holiday_let", startDate: "2023-07-01", status: "active", annualTurnover: "3200.00", notes: "4-bed farmhouse via Sykes Cottages. Peak June–August." },
  ]);

  const shootExists = await db.select().from(shootingAndGameRecordsTable).where(eq(shootingAndGameRecordsTable.farmId, farmId)).limit(1);
  if (shootExists.length === 0) {
    await db.insert(shootingAndGameRecordsTable).values([
      { farmId, shootDate: `${prevYr}-11-08`, shootType: "driven", organiser: "North Block Syndicate", numberOfGuns: 8, bagsPheasant: 68, bagsOther: 4, totalBag: 72, gameDealer: "Bourne Game Dealers", incomeLeaseFee: "600.00", notes: "First shoot of the season. 68 pheasants, 4 woodpigeon." },
      { farmId, shootDate: `${prevYr}-12-06`, shootType: "driven", organiser: "North Block Syndicate", numberOfGuns: 8, bagsPheasant: 82, bagsPartridge: 12, totalBag: 94, gameDealer: "Bourne Game Dealers", incomeLeaseFee: "600.00", notes: "Good day — best of season." },
    ]);
  }

  const incomeExists = await db.select().from(diversificationIncomeRecordsTable).where(eq(diversificationIncomeRecordsTable.farmId, farmId)).limit(1);
  if (incomeExists.length === 0) {
    const activities = await db.select().from(diversificationActivitiesTable).where(eq(diversificationActivitiesTable.farmId, farmId));
    const storage = activities.find(a => a.activityName.toLowerCase().includes("storage"));
    const straw = activities.find(a => a.activityName.toLowerCase().includes("straw"));
    const shooting = activities.find(a => a.activityName.toLowerCase().includes("shooting"));
    const holiday = activities.find(a => a.activityName.toLowerCase().includes("farmhouse"));
    await db.insert(diversificationIncomeRecordsTable).values([
      { farmId, activityId: holiday?.id, incomeDate: `${yr}-04-12`, incomeType: "Holiday Accommodation", description: "Easter week booking — 4 nights", amountNet: "2800.00", vatRate: "exempt", customerName: "Sykes Cottages", invoiceRef: "SYKES-2026-0441" },
      { farmId, activityId: holiday?.id, incomeDate: `${yr}-03-08`, incomeType: "Holiday Accommodation", description: "March long weekend", amountNet: "1200.00", vatRate: "exempt", customerName: "Sykes Cottages", invoiceRef: "SYKES-2026-0389" },
      { farmId, activityId: shooting?.id, incomeDate: `${prevYr}-11-08`, incomeType: "Shoot Day / Let", description: "First driven shoot of the season", amountNet: "600.00", vatRate: "standard", vatAmount: "120.00", customerName: "North Block Syndicate", invoiceRef: "SHOOT-001" },
      { farmId, activityId: shooting?.id, incomeDate: `${prevYr}-12-06`, incomeType: "Shoot Day / Let", description: "December syndicate day", amountNet: "600.00", vatRate: "standard", vatAmount: "120.00", customerName: "North Block Syndicate", invoiceRef: "SHOOT-002" },
      { farmId, activityId: storage?.id, incomeDate: `${yr}-03-31`, incomeType: "Storage Let", description: "Q1 grain storage rental — 120t", amountNet: "210.00", vatRate: "standard", vatAmount: "42.00", customerName: "Frontier Agriculture Ltd", invoiceRef: "FRON-Q1" },
      { farmId, activityId: straw?.id, incomeDate: `${yr}-02-14`, incomeType: "Farm Shop Sales", description: "48 x round bales wheat straw", amountNet: "720.00", vatRate: "zero", vatAmount: "0.00", customerName: "Hawthorn Equestrian Centre", invoiceRef: "STRAW-001" },
      { farmId, activityId: holiday?.id, incomeDate: `${prevYr}-08-01`, incomeType: "Holiday Accommodation", description: "August peak week", amountNet: "1800.00", vatRate: "exempt", customerName: "Sykes Cottages", invoiceRef: "SYKES-PREV-0712" },
    ]);
  }
  const shopExists = await db.select().from(farmShopProductsTable).where(eq(farmShopProductsTable.farmId, farmId)).limit(1);
  if (shopExists.length === 0) {
    await db.insert(farmShopProductsTable).values([
      { farmId, productName: "Free Range Eggs", category: "Dairy & Eggs", unitOfSale: "dozen", pricePerUnit: "2.80", currentStock: "36", reorderLevel: "12", countryOfOrigin: "United Kingdom", bestBeforeDays: 28, storageRequirements: "Refrigerated 0-4°C", active: true, description: "Free range eggs from our laying flock. Collected daily." },
      { farmId, productName: "Rump Steak (500g)", category: "Meat & Poultry", unitOfSale: "500g pack", pricePerUnit: "9.50", currentStock: "18", reorderLevel: "6", countryOfOrigin: "United Kingdom", bestBeforeDays: 7, storageRequirements: "Refrigerated 0-4°C, vacuum sealed", active: true, description: "Dry-aged Hereford beef, 28-day matured." },
      { farmId, productName: "Beef Mince (500g)", category: "Meat & Poultry", unitOfSale: "500g pack", pricePerUnit: "5.50", currentStock: "24", reorderLevel: "8", countryOfOrigin: "United Kingdom", bestBeforeDays: 7, storageRequirements: "Refrigerated 0-4°C", active: true },
      { farmId, productName: "Homemade Jam — Strawberry", category: "Jams & Preserves", unitOfSale: "340g jar", pricePerUnit: "3.50", currentStock: "48", reorderLevel: "12", countryOfOrigin: "United Kingdom", bestBeforeDays: 365, storageRequirements: "Cool dry place", active: true, description: "Made with our own strawberries. No artificial preservatives." },
      { farmId, productName: "Homemade Jam — Blackcurrant", category: "Jams & Preserves", unitOfSale: "340g jar", pricePerUnit: "3.50", currentStock: "36", reorderLevel: "12", countryOfOrigin: "United Kingdom", bestBeforeDays: 365, storageRequirements: "Cool dry place", active: true },
      { farmId, productName: "Wildflower Honey", category: "Honey", unitOfSale: "454g jar", pricePerUnit: "7.50", currentStock: "20", reorderLevel: "6", countryOfOrigin: "United Kingdom", storageRequirements: "Cool dry place", active: true, description: "Raw wildflower honey from our on-site hives." },
      { farmId, productName: "New Potatoes (1kg)", category: "Fruit & Vegetables", unitOfSale: "1kg bag", pricePerUnit: "1.80", currentStock: "50", reorderLevel: "20", countryOfOrigin: "United Kingdom", bestBeforeDays: 14, storageRequirements: "Cool dark place", active: true, description: "Washed new potatoes freshly lifted from the field." },
      { farmId, productName: "Wheat Flour — Stoneground (1.5kg)", category: "Cereals & Bread", unitOfSale: "1.5kg bag", pricePerUnit: "2.50", currentStock: "4", reorderLevel: "10", countryOfOrigin: "United Kingdom", bestBeforeDays: 365, storageRequirements: "Cool dry place", active: false, description: "Stoneground wholemeal wheat flour from our own crop." },
    ]);
  }
  console.log("[DEMO SEED] Diversification seeded");
}

// ── CROP TRIALS ───────────────────────────────────────────────────────────
async function seedCropTrials(farmId: number) {
  const existing = await db.select().from(cropTrialsTable).where(eq(cropTrialsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  const fields = await db.select().from(fieldsTable).where(eq(fieldsTable.farmId, farmId));
  const [trial] = await db.insert(cropTrialsTable).values({
    farmId, fieldId: fields[2]?.id, trialName: "Spring Barley Variety Trial 2026 — Laureate vs Planet vs RGT Asteroid", season: `${yr}`, cropName: "Spring Barley", trialPurpose: "Compare yield and malting quality of 3 spring barley varieties under Lincolnshire conditions.", trialsBody: "NIAB TAG", contactName: "Sophie Whitfield", startDate: `${yr}-04-05`, endDate: `${yr}-08-30`, notes: "NIAB TAG regional trial. 6 replicates per variety. Plot 20m x 6m.",
  }).returning();
  if (!trial) return;

  const plots = await db.insert(cropTrialPlotsTable).values([
    { trialId: trial.id, farmId, plotNumber: "1", treatmentLabel: "Laureate — untreated", isControl: true, areaHa: "0.0120" },
    { trialId: trial.id, farmId, plotNumber: "2", treatmentLabel: "Laureate — full fungicide programme", areaHa: "0.0120" },
    { trialId: trial.id, farmId, plotNumber: "3", treatmentLabel: "Planet — untreated", isControl: true, areaHa: "0.0120" },
    { trialId: trial.id, farmId, plotNumber: "4", treatmentLabel: "Planet — full fungicide programme", areaHa: "0.0120" },
    { trialId: trial.id, farmId, plotNumber: "5", treatmentLabel: "RGT Asteroid — untreated", isControl: true, areaHa: "0.0120" },
    { trialId: trial.id, farmId, plotNumber: "6", treatmentLabel: "RGT Asteroid — full fungicide programme", areaHa: "0.0120" },
  ]).returning();

  await db.insert(cropTrialYieldsTable).values([
    { trialId: trial.id, farmId, plotId: plots[0]?.id, harvestDate: `${yr}-08-20`, yieldTha: "6.820", moisturePercent: "15.8", notes: "Laureate untreated — rhynchosporium present." },
    { trialId: trial.id, farmId, plotId: plots[1]?.id, harvestDate: `${yr}-08-20`, yieldTha: "7.440", moisturePercent: "15.1", notes: "Laureate treated — clean crop." },
    { trialId: trial.id, farmId, plotId: plots[2]?.id, harvestDate: `${yr}-08-20`, yieldTha: "6.550", moisturePercent: "16.2" },
    { trialId: trial.id, farmId, plotId: plots[3]?.id, harvestDate: `${yr}-08-20`, yieldTha: "7.210", moisturePercent: "15.4" },
    { trialId: trial.id, farmId, plotId: plots[4]?.id, harvestDate: `${yr}-08-20`, yieldTha: "7.620", moisturePercent: "14.9", notes: "RGT Asteroid — impressive standing power." },
    { trialId: trial.id, farmId, plotId: plots[5]?.id, harvestDate: `${yr}-08-20`, yieldTha: "8.100", moisturePercent: "14.5", notes: "RGT Asteroid treated — top yielder." },
  ]);
  console.log("[DEMO SEED] Crop trials seeded");
}

// ── FARM ADVISORS ─────────────────────────────────────────────────────────
async function seedAdvisors(farmId: number) {
  const existing = await db.select().from(farmAdvisorsTable).where(eq(farmAdvisorsTable.farmId, farmId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(farmAdvisorsTable).values([
    { farmId, invitedByUserId: "demo-seed-user", advisorName: "Sophie Whitfield", advisorRole: "Agronomist (Arable)", advisorEmail: "s.whitfield@frontier-agriculture.com", token: "demo-advisor-token-001", status: "accepted", moduleAccess: ["crops", "spray_records", "soil_monitoring", "tasks"], notes: "BASIS-qualified. Monthly crop walks." },
    { farmId, invitedByUserId: "demo-seed-user", advisorName: "James Mortimer MRCVS", advisorRole: "Farm Vet", advisorEmail: "james@ministervets.co.uk", token: "demo-advisor-token-002", status: "accepted", moduleAccess: ["livestock", "biosecurity", "tasks"], notes: "Farm vet. Annual health plan." },
  ]);
  console.log("[DEMO SEED] Advisors seeded");
}

// ── FEED COMPLIANCE ───────────────────────────────────────────────────────
async function seedFeedCompliance(farmId: number) {
  const planExists = await db.select().from(feedContingencyPlansTable).where(eq(feedContingencyPlansTable.farmId, farmId)).limit(1);
  if (planExists.length === 0) {
    await db.insert(feedContingencyPlansTable).values({
      farmId,
      minimumStockDaysTarget: 14,
      dailyConsumptionKg: "180",
      alertThresholdKg: "2520",
      primarySupplierName: "Harbro Ltd",
      primarySupplierPhone: "01476 591188",
      primarySupplierEmail: "m.chalmers@harbro.co.uk",
      alternativeSuppliers: JSON.stringify([{ name: "Wynnstay Group — Grantham", phone: "01476 562200", notes: "Emergency fallback supplier." }]),
      emergencyContacts: JSON.stringify([
        { name: "James Barnett", role: "Farm Manager", phone: "07712 345678" },
        { name: "James Mortimer MRCVS", role: "Farm Vet", phone: "01529 302244" },
      ]),
      triggerConditions: "Triggered when current feed stock falls below 7-day supply, or when supplier notifies of supply disruption of >3 days.",
      immediateActions: "1. Contact Harbro for estimated delivery timeline. 2. If >7 days, contact Wynnstay for emergency supply. 3. Reduce daily ration by 10% to extend stock. 4. Notify vet if nutritional status at risk.",
      rationingProcedures: "Reduce finisher ration from 3.5 kg/head/day to 3.1 kg/head/day. Increase roughage allowance. Monitor daily. Contact vet if body condition score drops.",
      planAuthor: "James Barnett",
      lastReviewedDate: `${yr}-01-05`,
      nextReviewDate: `${yr + 1}-01-05`,
      versionNumber: "v1.0",
    });
  }

  const recallExists = await db.select().from(feedRecallIncidentsTable).where(eq(feedRecallIncidentsTable.farmId, farmId)).limit(1);
  if (recallExists.length === 0) {
    await db.insert(feedRecallIncidentsTable).values({
      farmId, raisedDate: d(`${prevYr}-11-12`), raisedBy: "James Barnett",
      productName: "Harbro Beef Finisher Blend 14%", supplierName: "Harbro Ltd", feedBatchRef: "HAR-B-2025-0712",
      reasonForConcern: "Elevated mycotoxin (deoxynivalenol) levels detected — exceeded EU limit of 5 mg/kg. Harbro-issued voluntary recall.",
      feedWithdrawn: true, withdrawalDate: `${prevYr}-11-12`,
      estimatedAnimalsAffected: 48, animalHealthImpactObserved: false,
      actionsTaken: "1. Immediate withdrawal from feeders. 2. 1,400kg isolated. 3. Harbro notified 12/11/2025. 4. Animals monitored 7 days — no adverse effects. 5. Batch collected by Harbro 15/11/2025.",
      feedDisposalMethod: "Returned to Harbro for authorised disposal",
      concernType: "supplier_recall",
    });
  }

  const diseaseExists = await db.select().from(diseaseIncidentLogTable).where(eq(diseaseIncidentLogTable.farmId, farmId)).limit(1);
  if (diseaseExists.length === 0) {
    await db.insert(diseaseIncidentLogTable).values([
      { farmId, incidentDate: d(`${yr}-02-01`), incidentType: "illness_outbreak", species: "cattle", animalCount: 3, symptomsObserved: "Elevated temperature (>39.5°C), nasal discharge, laboured breathing, off feed", suspectedDiagnosis: "Bovine Respiratory Disease (BRD)", confirmedDiagnosis: "BRD — Mannheimia haemolytica (culture result)", isNotifiableDisease: false, vetCalled: true, vetName: "James Mortimer MRCVS", vetCallDate: `${yr}-02-01`, vetVisitDate: `${yr}-02-02`, treatmentGiven: "Baytril 100 IM x 3 days", isolationApplied: true, isolationLocation: "Isolation pen — North Block east end", status: "resolved", resolvedDate: `${yr}-02-10`, outcomeSummary: "All 3 animals recovered. Full health by day 5." },
      { farmId, incidentDate: d(`${prevYr}-11-20`), incidentType: "illness_outbreak", species: "sheep", animalCount: 6, symptomsObserved: "Crusty lesions on lips, nostrils, and gums in growing lambs", suspectedDiagnosis: "Orf (Contagious Ecthyma)", confirmedDiagnosis: "Orf — clinical diagnosis confirmed by vet", isNotifiableDisease: false, vetCalled: true, vetName: "James Mortimer MRCVS", treatmentGiven: "Topical oxytetracycline spray. Self-limiting condition.", status: "resolved", resolvedDate: `${prevYr}-12-04`, outcomeSummary: "Self-limiting. Resolved in 14 days. Zoonotic risk noted — PPE worn.", lessonLearned: "All staff reminded to wear gloves when handling affected animals — orf is zoonotic." },
    ]);
  }
  console.log("[DEMO SEED] Feed compliance seeded");

  // ─── Farm Services ──────────────────────────────────────────────────────────
  const farmCustExists = await db.select().from(farmCustomersTable).where(eq(farmCustomersTable.farmId, farmId)).limit(1);
  if (farmCustExists.length === 0) {
    const [cust1] = await db.insert(farmCustomersTable).values([
      { farmId, name: "J R & S Atkinson & Sons", contactName: "Robert Atkinson", contactPhone: "07711 234567", contactEmail: "r.atkinson@atkinsonfarm.co.uk", address: "Willow Farm, Digby, Lincoln, LN4 3LZ", holdingNumber: "30/220/0015", vatNumber: "GB 312 4891 23", notes: "Long-standing neighbours — grain storage relationship since 2018. Two deliveries per harvest season." },
      { farmId, name: "Meldrum Contracting Ltd", contactName: "David Meldrum", contactPhone: "07890 321654", contactEmail: "david@meldrumcontracting.co.uk", address: "Unit 4, Ruskington Business Park, NG34 9AT", vatNumber: "GB 445 7821 07", notes: "Contracting company — we provide grain storage + drying for harvested crops across their client farms." },
      { farmId, name: "T & M Houlden Partnership", contactName: "Tim Houlden", contactPhone: "01529 412338", contactEmail: "tim@houldenfarming.co.uk", address: "Grange Farm, Aswarby, Sleaford, NG34 8SP", holdingNumber: "30/310/0022", notes: "Small family partnership. Short-term land rental (20 ha). They also use our drying facilities." },
    ]).returning();

    const custIds = await db.select().from(farmCustomersTable).where(eq(farmCustomersTable.farmId, farmId));
    const [c1, c2, c3] = custIds;

    // Agreements
    const [agr1] = await db.insert(serviceAgreementsTable).values([
      { farmId, customerId: c1.id, agreementType: "grain_storage", title: "Atkinson Grain Storage Agreement 2024/25", referenceNumber: "SA-2024-001", startDate: `${prevYr}-07-01`, endDate: `${yr}-06-30`, status: "active", maxTonnesContracted: "600", storageRatePptWeek: "0.52", intakeChargePpt: "1.40", outloadingChargePpt: "1.40", dryingChargePpt: "8.50", notes: "Segregated storage in Bay A of Main Grain Store. Red Tractor approved lot references required for each delivery." },
      { farmId, customerId: c2.id, agreementType: "drying_service", title: "Meldrum Drying & Storage Contract 2024", referenceNumber: "SA-2024-002", startDate: `${prevYr}-07-01`, endDate: `${yr}-03-31`, status: "active", maxTonnesContracted: "400", storageRatePptWeek: "0.48", intakeChargePpt: "1.20", outloadingChargePpt: "1.20", dryingChargePpt: "7.80", notes: "Must supply separate lot reference for each client farm batch. TASCC requirements apply." },
      { farmId, customerId: c3.id, agreementType: "land_rental", title: "Houlden Partnership — 20 ha Rented Land", referenceNumber: "SA-2024-003", startDate: `${prevYr}-10-01`, endDate: `${yr + 2}-09-30`, status: "active", areaHa: "20.00", annualRentPence: 720000, rentPerHaPence: 36000, paymentFrequency: "annual", nextPaymentDate: `${yr}-10-01`, notes: "Block Fields 12–14 (north parcel). 3-year FBT. VAT excluded." },
    ]).returning();

    const agrIds = await db.select().from(serviceAgreementsTable).where(eq(serviceAgreementsTable.farmId, farmId));
    const agr = agrIds[0];

    // Grain intakes
    const [gi1] = await db.insert(thirdPartyGrainIntakesTable).values([
      { farmId, customerId: c1.id, agreementId: agrIds[0].id, intakeDate: `${prevYr}-08-05`, commodity: "Winter Wheat", variety: "KWS Zyatt", quantityTonnes: "182.50", moisturePercent: "14.8", screeningsPercent: "1.9", specificWeightKgHl: "77.2", grade: "Group 1", lotReference: "LOT-ATK-WW-2024-001", deliveryNoteRef: "DN-ATK-1041", vehicleReg: "LN22 WXP", haulier: "Atkinson in-house", bayOrBin: "Bay A — North end", status: "in_store", notes: "First delivery of 2024 harvest. Good spec." },
      { farmId, customerId: c1.id, agreementId: agrIds[0].id, intakeDate: `${prevYr}-08-12`, commodity: "Winter Wheat", variety: "KWS Zyatt", quantityTonnes: "215.80", moisturePercent: "15.6", screeningsPercent: "2.1", specificWeightKgHl: "76.8", grade: "Group 1", lotReference: "LOT-ATK-WW-2024-002", deliveryNoteRef: "DN-ATK-1057", vehicleReg: "LN22 WXP", haulier: "Atkinson in-house", bayOrBin: "Bay A — South end", status: "in_store", notes: "Second delivery. Marginally higher moisture — check drying requirements." },
      { farmId, customerId: c2.id, agreementId: agrIds[1].id, intakeDate: `${prevYr}-08-20`, commodity: "Winter Barley", variety: "KWS Orwell", quantityTonnes: "94.20", moisturePercent: "16.2", screeningsPercent: "1.4", specificWeightKgHl: "68.5", grade: "Malting", lotReference: "LOT-MEL-WB-2024-001", deliveryNoteRef: "DN-MEL-0312", vehicleReg: "PE71 HXA", haulier: "Fenland Haulage Ltd", bayOrBin: "Bay C", status: "partially_removed", notes: "Meldrum client — Thornton Farm batch. To be dried to 14.5% before outloading." },
    ]).returning();

    // Grain movement
    const giAll = await db.select().from(thirdPartyGrainIntakesTable).where(eq(thirdPartyGrainIntakesTable.farmId, farmId));
    const meldrumIntake = giAll.find((g) => g.lotReference?.includes("MEL"));
    if (meldrumIntake) {
      await db.insert(thirdPartyGrainMovementsTable).values({
        farmId, intakeId: meldrumIntake.id, movementDate: `${prevYr}-09-10`, movementType: "outloading",
        quantityTonnes: "48.00", destination: "Frontier Ag Sleaford (malting contract)", vehicleReg: "PE71 HXA",
        haulier: "Fenland Haulage Ltd", deliveryNoteRef: "DON-MEL-0088", notes: "First part-load outloaded to Frontier for malting contract. Balance remains in store.",
      });
    }

    // Invoices
    const [inv1] = await db.insert(serviceInvoicesTable).values({
      farmId, customerId: c1.id, agreementId: agrIds[0].id, invoiceNumber: "SVC-2024-001",
      invoiceDate: `${prevYr}-10-01`, dueDate: `${prevYr}-10-31`, status: "paid",
      subtotalPence: 214200, vatRatePercent: "20", vatPence: 42840, totalPence: 257040,
      paymentDate: `${prevYr}-10-22`, paymentMethod: "BACS", paymentReference: "ATKINSON OCT24",
      notes: "Storage charges Q1: 398.3t x 0.52/t/week x 13 weeks (Jul–Sep). Intake charges: 398.3t @ £1.40/t.",
    }).returning();
    await db.insert(serviceInvoiceLinesTable).values([
      { invoiceId: inv1.id, description: "Grain storage — 398.3t x 13 weeks @ £0.52/t/wk", quantity: "398.3", unit: "t", unitPricePence: 676, lineTotalPence: 179832 },
      { invoiceId: inv1.id, description: "Intake handling — 398.3t @ £1.40/t", quantity: "398.3", unit: "t", unitPricePence: 140, lineTotalPence: 27762 },
      { invoiceId: inv1.id, description: "Out-of-hours weekend weighbridge supervision", quantity: "1", unit: "visit", unitPricePence: 6500, lineTotalPence: 6500 },
    ]);

    const [inv2] = await db.insert(serviceInvoicesTable).values({
      farmId, customerId: c2.id, agreementId: agrIds[1].id, invoiceNumber: "SVC-2024-002",
      invoiceDate: `${prevYr}-10-01`, dueDate: `${prevYr}-10-31`, status: "sent",
      subtotalPence: 98640, vatRatePercent: "20", vatPence: 19728, totalPence: 118368,
      notes: "Storage + drying charges for Meldrum batch Aug–Sep 2024.",
    }).returning();
    await db.insert(serviceInvoiceLinesTable).values([
      { invoiceId: inv2.id, description: "Drying — 94.2t (16.2% to 14.5%) @ £7.80/t", quantity: "94.2", unit: "t", unitPricePence: 780, lineTotalPence: 73476 },
      { invoiceId: inv2.id, description: "Intake handling — 94.2t @ £1.20/t", quantity: "94.2", unit: "t", unitPricePence: 120, lineTotalPence: 11304 },
      { invoiceId: inv2.id, description: "Storage — 46.2t x 6 weeks @ £0.48/t/wk", quantity: "46.2", unit: "t", unitPricePence: 288, lineTotalPence: 13858 },
    ]);

    await db.update(serviceInvoicesTable).set({ subtotalPence: 214200, vatPence: 42840, totalPence: 257040 }).where(eq(serviceInvoicesTable.id, inv1.id));
    await db.update(serviceInvoicesTable).set({ subtotalPence: 98640, vatPence: 19728, totalPence: 118368 }).where(eq(serviceInvoicesTable.id, inv2.id));

    console.log("[DEMO SEED] Farm services seeded");
  } else {
    console.log("[DEMO SEED] Farm services already seeded — skipping");
  }
}

// ─── POULTRY PRODUCTION ───────────────────────────────────────────────────────
async function seedPoultry(farmId: number) {
  const existing = await db.select().from(poultryHousesTable).where(eq(poultryHousesTable.farmId, farmId)).limit(1);
  if (existing.length > 0) { console.log("[DEMO SEED] Poultry already seeded — skipping"); return; }

  // Today reference for relative dates
  const today = new Date();
  const ago = (days: number) => { const dt = new Date(today); dt.setDate(dt.getDate() - days); return dt.toISOString().slice(0, 10); };
  const fwd = (days: number) => { const dt = new Date(today); dt.setDate(dt.getDate() + days); return dt.toISOString().slice(0, 10); };

  // ── Houses ─────────────────────────────────────────────────────────────────
  const [house1, house2] = await db.insert(poultryHousesTable).values([
    {
      farmId, houseName: "Broiler House 1", houseType: "broiler", species: "broiler_chicken",
      productionSystem: "indoor_intensive", approvedCapacity: 40000,
      lengthM: "120.0", widthM: "18.0", ventilationType: "tunnel",
      waterSystem: "nipple_drinker", notes: "East side of yard. Feed silos B1/B2. Tunnel-ventilated with 24 fans.",
    },
    {
      farmId, houseName: "Broiler House 2", houseType: "broiler", species: "broiler_chicken",
      productionSystem: "indoor_intensive", approvedCapacity: 40000,
      lengthM: "120.0", widthM: "18.0", ventilationType: "tunnel",
      waterSystem: "nipple_drinker", notes: "West side of yard. Feed silos B3/B4. Replaced 2022.",
    },
  ]).returning();

  // ── Flocks ─────────────────────────────────────────────────────────────────
  // Flock A — completed 28 days ago in House 1
  const [flockA] = await db.insert(poultryFlocksTable).values({
    farmId, houseId: house1!.id,
    flockNumber: `HF-BH1-${prevYr}-07`,
    species: "broiler_chicken", breed: "Ross 308", productionSystem: "indoor_intensive",
    placementDate: ago(70), placementCount: 39800,
    hatcheryName: "Cobb-Vantress Hatchery, Telford",
    hatcheryApprovalNumber: "GB-H-2341",
    status: "completed",
    depletionDate: ago(28), depletionCount: 39125, depletionReason: "final_clear",
    notes: "Good flock. Footpad dermatitis minor. Minor ammonia spike week 4 — fans adjusted.",
  }).returning();

  // Flock B — active, placed 23 days ago in House 2
  const [flockB] = await db.insert(poultryFlocksTable).values({
    farmId, houseId: house2!.id,
    flockNumber: `HF-BH2-${yr}-01`,
    species: "broiler_chicken", breed: "Ross 308", productionSystem: "indoor_intensive",
    placementDate: ago(23), placementCount: 40000,
    hatcheryName: "Cobb-Vantress Hatchery, Telford",
    hatcheryApprovalNumber: "GB-H-2341",
    status: "active",
    notes: "Current crop. Day 23. Growth on track.",
  }).returning();

  // ── Daily Mortality — Flock A (days 1–42, sampled) ────────────────────────
  const mortalityA = [];
  for (let day = 1; day <= 42; day++) {
    const base = day <= 5 ? 12 : day <= 14 ? 5 : day <= 28 ? 3 : 2;
    const count = Math.max(0, base + Math.floor(Math.random() * 3 - 1));
    const running = Math.min(day * base, 320);
    mortalityA.push({
      farmId, flockId: flockA!.id,
      recordDate: ago(70 - day),
      mortalityCount: count, culledCount: day === 8 ? 2 : 0,
      runningTotalMortality: running,
      mortalityPercentage: String((running / 39800 * 100).toFixed(2)),
      mainCause: day <= 5 ? "transit_stress" : "no_obvious_cause",
    });
  }
  await db.insert(poultryDailyMortalityTable).values(mortalityA);

  // Daily mortality — Flock B (last 23 days active)
  const mortalityB = [];
  for (let day = 1; day <= 23; day++) {
    const count = day <= 3 ? 8 : day <= 7 ? 4 : 2;
    const running = 8 * 3 + 4 * 4 + (Math.max(0, day - 7)) * 2;
    mortalityB.push({
      farmId, flockId: flockB!.id,
      recordDate: ago(23 - day),
      mortalityCount: count, culledCount: 0,
      runningTotalMortality: running,
      mortalityPercentage: String((running / 40000 * 100).toFixed(2)),
      mainCause: day <= 3 ? "transit_stress" : "no_obvious_cause",
    });
  }
  await db.insert(poultryDailyMortalityTable).values(mortalityB);

  // ── Treatments ─────────────────────────────────────────────────────────────
  // Flock A — Amoxicillin course (completed, withdrawal clear)
  await db.insert(poultryTreatmentsTable).values([
    {
      farmId, flockId: flockA!.id,
      treatmentDate: ago(58),
      numberOfBirdsTreated: 39800, productName: "Amoxinsol 500 mg/g Oral Powder",
      activeIngredient: "Amoxicillin trihydrate", condition: "Respiratory disease (suspected E. coli)",
      routeOfAdministration: "oral_water", doseRate: "15 mg/kg/day",
      durationDays: 5, batchNumber: "AX240318",
      expiryDate: `${yr + 1}-03-18`,
      administeredBy: "Tom Bradley", prescribingVetName: "Dr. Richard Holloway",
      prescribingVetPractice: "Sleaford Poultry Vets", prescriptionObtained: true,
      withdrawalPeriodDays: 2, withdrawalClearDate: ago(53),
      notes: "Treatment started day 13 of crop. Good response — mortality reduced within 48h.",
    },
    {
      farmId, flockId: flockB!.id,
      treatmentDate: ago(5),
      numberOfBirdsTreated: 40000, productName: "Tylan Soluble (Tylosin)",
      activeIngredient: "Tylosin tartrate", condition: "Mycoplasma — routine prophylactic pulse",
      routeOfAdministration: "oral_water", doseRate: "500 mg/l drinking water",
      durationDays: 3, batchNumber: "TY250109",
      expiryDate: `${yr + 1}-01-09`,
      administeredBy: "James Barnett", prescribingVetName: "Dr. Richard Holloway",
      prescribingVetPractice: "Sleaford Poultry Vets", prescriptionObtained: true,
      withdrawalPeriodDays: 5, withdrawalClearDate: fwd(0),
      notes: "Day 18 pulse per veterinary health plan protocol.",
    },
  ]);

  // ── House Cleanout — Flock A ───────────────────────────────────────────────
  const [cleanoutA] = await db.insert(poultryHouseCleanoutsTable).values({
    farmId, houseId: house1!.id, flockId: flockA!.id,
    cleanoutStartDate: ago(27), cleanoutEndDate: ago(22),
    litterRemovalDate: ago(27),
    disinfectantUsed: "Virkon S", disinfectantSupplier: "Lanxess Biosecurity",
    disinfectantApprovalNumber: "UK-BA-2019-0012",
    applicationMethod: "fogging_and_manual_spray", contactTimeMins: 30,
    swabsTaken: true, swabResults: "Salmonella negative. Campylobacter negative.",
    standingTimeDays: 14, completedBy: "Tom Bradley",
    notes: "Full clean between flocks. 14-day standdown ahead of new placement.",
  }).returning();

  // ── Environmental Logs — Flock B (last 14 days) ───────────────────────────
  const envLogs = [];
  for (let d2 = 14; d2 >= 1; d2--) {
    const age = 23 - d2;
    const targetTemp = age < 7 ? 32 : age < 14 ? 28 : 24;
    envLogs.push({
      farmId, flockId: flockB!.id,
      logDate: ago(d2), logTime: "07:00",
      temperatureMin: String((targetTemp - 1.2).toFixed(1)),
      temperatureMax: String((targetTemp + 1.5).toFixed(1)),
      humidity: String((65 + Math.random() * 10 - 5).toFixed(1)),
      co2Ppm: 1200 + Math.floor(Math.random() * 400),
      ammoniaPpm: String((d2 > 10 ? 6.5 : d2 > 5 ? 9.2 : 11.4).toFixed(1)),
      ventilationRate: age < 7 ? "minimum" : "stepped_25pct",
      lightingHours: String(age < 3 ? 23 : 18),
      stockingDensity: String((40000 * 2.1 / (120 * 18)).toFixed(2)),
      alarmActivated: false,
    });
  }
  await db.insert(poultryEnvironmentalLogsTable).values(envLogs);

  // ── FCI Documents — Flock A ───────────────────────────────────────────────
  // First thinning FCI
  await db.insert(poultryFciDocumentsTable).values([
    {
      farmId, flockId: flockA!.id,
      documentDate: ago(39), catchingDate: ago(38),
      destinationAbattoir: "2 Sisters Food Group, Scunthorpe",
      numberOfBirds: 14000, catchingContractor: "Lincs Catching Services Ltd",
      anyDiseaseOrCondition: false, medicationsLast7Days: false,
      withdrawalPeriodClear: true, lastFeedWithdrawalHours: 10,
      signedByFarmer: true,
      notes: "First thinning. 14,000 birds @ ~2.0kg target. Feed withdrawn 22:00 day prior.",
    },
    {
      farmId, flockId: flockA!.id,
      documentDate: ago(28), catchingDate: ago(28),
      destinationAbattoir: "2 Sisters Food Group, Scunthorpe",
      numberOfBirds: 25125, catchingContractor: "Lincs Catching Services Ltd",
      anyDiseaseOrCondition: false, medicationsLast7Days: false,
      withdrawalPeriodClear: true, lastFeedWithdrawalHours: 12,
      signedByFarmer: true,
      notes: "Final clear. Remaining birds 25,125. Good grade-out reported by processor.",
    },
  ]);

  // ── Broiler Welfare (BWI) ──────────────────────────────────────────────────
  await db.insert(poultryBroilerWelfareTable).values([
    {
      farmId, flockId: flockA!.id,
      assessmentDate: ago(32), assessedBy: "James Barnett",
      ageAtAssessmentDays: 38, sampleSize: 100,
      footpadDermatitisScore: "Score 1", footpadDermatitisPercent: "12.0",
      hockBurnScore: "Score 0", hockBurnPercent: "4.0",
      gaitScore: "Score 0-1", breastBlisterPercent: "2.0",
      plumageScore: "Good", soiledPlumagePercent: "6.0",
      overallOutcome: "Pass — Minor Footpad Dermatitis",
      actionsTaken: "Increased litter management frequency. Extra drinker checks.",
      notes: "Below trigger threshold. No corrective action required. Monitoring continues.",
    },
  ]);

  // ── Thinning Records — Flock A ────────────────────────────────────────────
  await db.insert(poultryThinningRecordsTable).values([
    {
      farmId, flockId: flockA!.id,
      thinningDate: ago(38), thinningNumber: 1, birdsRemoved: 14000,
      targetLiveWeightKg: "2.00", averageLiveWeightKg: "2.02",
      destinationAbattoir: "2 Sisters Food Group, Scunthorpe",
      catchingContractorName: "Lincs Catching Services Ltd",
      catchingStartTime: "01:00", catchingEndTime: "04:30",
      doasAtLoading: 3, transportVehicleReg: "YX22 DTK",
      catchingConditions: "calm", notes: "Night catch. Birds settled well. 3 DOAs at loading.",
    },
  ]);

  // ── Biosecurity Checklist — Flock A Cleanout ──────────────────────────────
  await db.insert(poultryBiosecurityChecklistTable).values({
    farmId, houseId: house1!.id, previousFlockId: flockA!.id,
    cleanoutStartDate: ago(27), cleanoutEndDate: ago(22),
    downtimeDays: 14,
    catchingComplete: true, litterRemoved: true,
    litterDisposalMethod: "land_spread_with_FACTS_advice",
    dryCleanComplete: true, washComplete: true,
    disinfectionComplete: true, disinfectantUsed: "Virkon S",
    disinfectantApproved: true, disinfectantDilutionRate: "1:100",
    fumigationComplete: false, verminControlComplete: true,
    verminControlDetails: "Rodenticide bait stations replenished. No evidence of activity.",
    waterSystemFlushComplete: true, waterSystemDisinfected: true,
    feedSystemCleaned: true, ventilationChecked: true, heatingChecked: true,
    footbathsInstalled: true, vehicleRestrictions: true,
    visitorLogInPlace: true, independentAuditCompleted: false,
    overallComplianceStatus: "complete",
    schemeCertificationScheme: "Red Tractor Poultry",
    completedBy: "Tom Bradley",
    notes: "Full cleanout protocol completed. Swab results negative. House ready for restock.",
  });

  // ── Scheme Records ────────────────────────────────────────────────────────
  await db.insert(poultrySchemeRecordsTable).values([
    {
      farmId,
      scheme: "Red Tractor Poultry Assurance",
      certificateNumber: "RT-P-2024-18847",
      assessmentDate: ago(180),
      assessorName: "Martin Webb",
      assessorOrganisation: "NSF Red Tractor",
      outcomeStatus: "pass",
      nonConformancesCount: 1,
      nonConformanceDetails: "NC-01: Stockmanship check records incomplete for 3 days in March.",
      correctiveActionRequired: true,
      correctiveActionDeadline: ago(150),
      correctiveActionNotes: "Daily stockmanship log template printed and pinned in porch. Resolved.",
      nextAssessmentDue: fwd(185),
      documentReference: "RT-P-2024-18847-CERT",
      notes: "Passed. One minor NC on stockmanship records. Corrective action confirmed by assessor.",
    },
    {
      farmId,
      scheme: "RSPCA Assured (formerly Freedom Food)",
      certificateNumber: "RA-2024-34129",
      assessmentDate: ago(245),
      assessorName: "Helen Rycroft",
      assessorOrganisation: "RSPCA Assured",
      outcomeStatus: "pass",
      nonConformancesCount: 0,
      correctiveActionRequired: false,
      nextAssessmentDue: fwd(120),
      notes: "Clean pass. Assessor noted good enrichment provision and litter management.",
    },
  ]);

  console.log("[DEMO SEED] Poultry production seeded — 2 houses, 2 flocks, mortality, treatments, BWI, cleanouts, biosecurity, scheme records");
}

// ─── PIG PRODUCTION ───────────────────────────────────────────────────────────
async function seedPigs(farmId: number) {
  const existing = await db.select().from(pigFlocksTable).where(eq(pigFlocksTable.farmId, farmId)).limit(1);
  if (existing.length > 0) { console.log("[DEMO SEED] Pigs already seeded — skipping"); return; }

  const today = new Date();
  const ago = (days: number) => { const dt = new Date(today); dt.setDate(dt.getDate() - days); return dt.toISOString().slice(0, 10); };
  const fwd = (days: number) => { const dt = new Date(today); dt.setDate(dt.getDate() + days); return dt.toISOString().slice(0, 10); };

  // ── Pig Groups / Flocks ───────────────────────────────────────────────────
  const [sowGroup, weanerGroup, finisherGroup] = await db.insert(pigFlocksTable).values([
    {
      farmId, flockName: "Sow Herd — Main Unit",
      productionType: "breeding_sows", breed: "Large White × Landrace",
      cphNumber: "30/215/0042", herdNumber: "UK302150042",
      currentCount: 182, location: "Farrowing Suite & Dry Sow House",
      notes: "180-sow farrow-to-finish unit. AI programme with JSR Genetics. Approx 2.4 litters/sow/year.",
    },
    {
      farmId, flockName: "Weaner Pen Group — Block A",
      productionType: "weaners", breed: "Large White × Landrace × Duroc",
      cphNumber: "30/215/0042", herdNumber: "UK302150042",
      currentCount: 284, location: "Weaner House — Block A (6–12 weeks)",
      notes: "Post-weaning group. Weaned at 28 days. Target 30kg by week 12.",
    },
    {
      farmId, flockName: "Finisher Pen Group — Block B",
      productionType: "finishers", breed: "Large White × Landrace × Duroc",
      cphNumber: "30/215/0042", herdNumber: "UK302150042",
      currentCount: 380, location: "Finisher House — Block B (12–24 weeks)",
      notes: "Finishing group. Target 100–105kg deadweight. SPP scheme via Cranswick.",
    },
  ]).returning();

  // ── Pig Movements ─────────────────────────────────────────────────────────
  const [mov1, mov2] = await db.insert(pigMovementsTable).values([
    {
      farmId, movementDate: ago(42),
      movementType: "on", fromLocation: "JSR Genetics Breeding Unit",
      toLocation: "Highfield Farm — Weaner House Block A",
      fromCph: "30/198/0017", toCph: "30/215/0042",
      numberOfAnimals: 284,
      eaml2Reference: `EAML2-${yr}-0421`,
      transporterName: "Lincolnshire Livestock Transport",
      vehicleRegistration: "FJ22 PLK",
      cleaningDeclaration: true,
      notes: "Delivery of weaner batch from JSR. All animals healthy on arrival. No casualties in transit.",
    },
    {
      farmId, movementDate: ago(7),
      movementType: "off", fromLocation: "Highfield Farm — Finisher House Block B",
      toLocation: "Cranswick Country Foods, Malton",
      fromCph: "30/215/0042", toCph: "abattoir",
      numberOfAnimals: 180,
      eaml2Reference: `EAML2-${yr}-0587`,
      transporterName: "Lincolnshire Livestock Transport",
      vehicleRegistration: "FJ22 PLK",
      cleaningDeclaration: true,
      notes: "First draft of finisher batch. 180 pigs @ ~104kg estimated. No withdrawal issues.",
    },
  ]).returning();

  // ── FCI Documents ─────────────────────────────────────────────────────────
  await db.insert(pigFciDocumentsTable).values({
    farmId, movementId: mov2!.id,
    documentDate: ago(8), batchReference: `FCI-${yr}-0587`,
    destinationAbattoir: "Cranswick Country Foods, Malton",
    numberOfPigs: 180,
    veterinaryMedicinesLast60Days: true,
    medicineDetails: "Tylan 200 — administered day 38 of finishing period. Withdrawal clear.",
    withdrawalPeriodClear: true,
    feedWithdrawalHours: 12,
    lambnessCasualtyStatus: "no_casualties",
    signedByFarmer: true,
    notes: "Signed by James Barnett. All records reviewed. No health concerns. FCI filed with haulier.",
  });

  // ── Feed Consumption — last 14 days ──────────────────────────────────────
  const feedEntries = [];
  for (let d2 = 14; d2 >= 1; d2--) {
    feedEntries.push({
      farmId, consumptionDate: ago(d2),
      penName: "Finisher Block B", feedType: "Finisher Pellet (16% CP, 13.5 MJ/kg DE)",
      quantityKg: String((380 * 2.4 + Math.random() * 20 - 10).toFixed(1)),
      batchLotNumber: "FEED-2026-0312-B",
      appliedToFlockId: finisherGroup!.id,
    });
    feedEntries.push({
      farmId, consumptionDate: ago(d2),
      penName: "Weaner Block A", feedType: "Weaner Meal (20% CP, 14.0 MJ/kg DE)",
      quantityKg: String((284 * 0.9 + Math.random() * 10 - 5).toFixed(1)),
      batchLotNumber: "FEED-2026-0198-W",
      appliedToFlockId: weanerGroup!.id,
    });
    feedEntries.push({
      farmId, consumptionDate: ago(d2),
      penName: "Sow & Farrowing Suite", feedType: "Sow Lactation Nuts (17% CP)",
      quantityKg: String((182 * 2.8 + Math.random() * 15 - 7).toFixed(1)),
      batchLotNumber: "FEED-2026-0201-S",
      appliedToFlockId: sowGroup!.id,
    });
  }
  await db.insert(pigFeedConsumptionTable).values(feedEntries);

  // ── Vet Assessment ────────────────────────────────────────────────────────
  await db.insert(pigVetAssessmentsTable).values([
    {
      farmId, assessmentDate: ago(28),
      vetName: "Dr. Sarah Baines BVSc MRCVS",
      practiceName: "Meadow Veterinary Practice, Grantham",
      flockId: finisherGroup!.id,
      bodyConditionScore: "3.2",
      lameness: "minimal — 2 pigs with mild gait issues identified, separated",
      respiratoryHealth: "good — no coughing or nasal discharge observed",
      skinCondition: "good — minor scratching on 3 finishers, no mange suspected",
      tailBiting: "low — minor pen A3 damage, straw increased",
      mortalityRate: "0.42",
      findings: "Herd in generally good health. Minimal respiratory challenge. BCS consistent across sow group. Recommend increasing enrichment in finisher block B pen A3.",
      recommendations: "1. Increase straw provision in pen A3 daily. 2. Continue Tylan pulse at day 38 per HHP. 3. Monitor 2 lame finishers — separate if worsening. 4. Review ventilation settings as temps rise in May.",
      nextReviewDate: fwd(60),
    },
  ]);

  // ── Stockmanship Checks — last 14 days ───────────────────────────────────
  const stockChecks = [];
  for (let d2 = 14; d2 >= 1; d2--) {
    const hasMortality = d2 === 9;
    stockChecks.push({
      farmId, checkDate: ago(d2),
      checkedBy: d2 % 3 === 0 ? "Tom Bradley" : "James Barnett",
      flockId: finisherGroup!.id,
      mortalitiesFound: hasMortality ? 1 : 0,
      injuredFound: 0,
      waterSystemOk: true, feedSystemOk: true, ventilationOk: true,
      temperatureOk: true, lightingOk: true, beddingOk: true,
      overallWelfare: "good",
      actionsRequired: hasMortality ? "1 finisher found dead in pen B7. Likely twisted gut. Carcass removed and recorded." : null,
    });
  }
  await db.insert(pigStockmanshipChecksTable).values(stockChecks);

  // ── Tail Biting Risk Assessments ──────────────────────────────────────────
  await db.insert(pigTailBitingRisksTable).values([
    {
      farmId, assessmentDate: ago(90),
      assessedBy: "James Barnett", flockId: finisherGroup!.id,
      riskLevel: "low",
      tailsDockedAtBirth: false, tailLengthAdequate: true,
      stockingDensityOk: true, enrichmentProvided: true,
      enrichmentTypes: "Straw in racks, hanging chains, mineral lick, root vegetables twice weekly",
      feedingSystemOk: true, healthStatusOk: true,
      mixingFrequency: "once_at_weaning_only",
      currentBiting: false, bitingLevel: null,
      monitoringFrequency: "daily",
      reviewDate: fwd(90),
      notes: "Routine quarterly assessment. Low risk maintained. Good enrichment provision.",
    },
    {
      farmId, assessmentDate: ago(14),
      assessedBy: "James Barnett", flockId: finisherGroup!.id,
      riskLevel: "medium",
      tailsDockedAtBirth: false, tailLengthAdequate: true,
      stockingDensityOk: true, enrichmentProvided: true,
      enrichmentTypes: "Straw, chains, jute sacks",
      feedingSystemOk: true, healthStatusOk: true,
      mixingFrequency: "stable_groups",
      currentBiting: true, bitingLevel: "minor — pen A3 only",
      interventionsTaken: "Extra straw added to pen A3. Chain enrichment moved. Identified and separated 1 biter. Area monitored twice daily.",
      monitoringFrequency: "twice_daily_pen_A3",
      reviewDate: ago(7),
      notes: "Minor tail biting incident in pen A3. Triggered by temporary feed system issue (blocked trough, resolved). Responding well to intervention.",
    },
  ]);

  // ── Farrowing Records ─────────────────────────────────────────────────────
  await db.insert(pigFarrowingRecordsTable).values([
    {
      farmId, farrowingDate: ago(18), sowEarTag: "UK302150042-0042",
      sowBreed: "Large White × Landrace", parityNumber: 3, flockId: sowGroup!.id,
      totalBornAlive: 14, totalBornDead: 1, totalMummified: 0,
      fostersIn: 1, fostersOut: 2, averageBirthWeightKg: "1.42",
      weaningDate: fwd(10), pigletsWeanedCount: 12, averageWeaningWeightKg: "7.8",
      farrowingEase: "normal", assistanceRequired: false, colostrumManaged: true,
      notes: "Good litter. 1 stillborn (small/mummified). 2 piglets fostered to sow UK042 who had 11 born.",
    },
    {
      farmId, farrowingDate: ago(16), sowEarTag: "UK302150042-0071",
      sowBreed: "Large White × Landrace", parityNumber: 5, flockId: sowGroup!.id,
      totalBornAlive: 16, totalBornDead: 2, totalMummified: 1,
      fostersIn: 0, fostersOut: 4, averageBirthWeightKg: "1.35",
      weaningDate: fwd(12), pigletsWeanedCount: 11, averageWeaningWeightKg: "8.1",
      farrowingEase: "normal", assistanceRequired: false, colostrumManaged: true,
      notes: "Large litter — fostered 4 piglets. Good milking sow.",
    },
    {
      farmId, farrowingDate: ago(12), sowEarTag: "UK302150042-0103",
      sowBreed: "Large White × Landrace", parityNumber: 2, flockId: sowGroup!.id,
      totalBornAlive: 11, totalBornDead: 0, totalMummified: 0,
      fostersIn: 2, fostersOut: 0, averageBirthWeightKg: "1.51",
      weaningDate: fwd(16), pigletsWeanedCount: 13,
      farrowingEase: "difficult", assistanceRequired: true,
      assistanceDetails: "Posterior presentation. Vet called — assisted delivery. Sow and piglets healthy post-farrowing.",
      colostrumManaged: true,
      notes: "Second parity. Assisted farrowing. Vet on-farm within 45 mins. Good outcome.",
    },
    {
      farmId, farrowingDate: ago(4), sowEarTag: "UK302150042-0058",
      sowBreed: "Large White × Landrace", parityNumber: 4, flockId: sowGroup!.id,
      totalBornAlive: 13, totalBornDead: 1, totalMummified: 0,
      fostersIn: 0, fostersOut: 0, averageBirthWeightKg: "1.48",
      farrowingEase: "normal", assistanceRequired: false, colostrumManaged: true,
      notes: "Recent farrowing. Piglets active and nursing well.",
    },
  ]);

  // ── Medicine Treatments ────────────────────────────────────────────────────
  await db.insert(pigMedicineTreatmentsTable).values([
    {
      farmId, treatmentDate: ago(45), flockId: finisherGroup!.id,
      batchOrPenRef: "Finisher Pen B4–B6",
      numberOfAnimals: 60, medicineProductName: "Tylan 200 (Tylosin)",
      activeIngredient: "Tylosin", manufacturer: "Elanco",
      productBatchNumber: "TY250112", expiryDate: `${yr + 1}-01-12`,
      administrationRoute: "intramuscular_injection",
      quantityUsed: "180", unitOfMeasure: "ml",
      diagnosisReason: "Enzootic pneumonia — coughing observed in pen B4-B6. Vet-directed.",
      prescribingVetName: "Dr. Sarah Baines", prescribingVetPractice: "Meadow Veterinary Practice",
      prescriptionObtained: true, administeredBy: "James Barnett",
      withdrawalPeriodMeatDays: 28, withdrawalEndDate: ago(17),
      notes: "Pens B4-B6 treated over 3 days. Good response. Coughing resolved by day 5.",
    },
    {
      farmId, treatmentDate: ago(6), flockId: sowGroup!.id,
      batchOrPenRef: "Farrowing Pen F3",
      numberOfAnimals: 1, medicineProductName: "Metricure (Cefapirin)",
      activeIngredient: "Cefapirin benzathine", manufacturer: "MSD Animal Health",
      productBatchNumber: "MC250205", expiryDate: `${yr + 1}-02-05`,
      administrationRoute: "intrauterine",
      quantityUsed: "19", unitOfMeasure: "ml",
      diagnosisReason: "Post-farrowing uterine infection (metritis) — sow UK302150042-0103",
      prescribingVetName: "Dr. Sarah Baines", prescribingVetPractice: "Meadow Veterinary Practice",
      prescriptionObtained: true, administeredBy: "James Barnett",
      withdrawalPeriodMeatDays: 10, withdrawalEndDate: fwd(4),
      notes: "Sow in pen F3. Single dose. Sow recovering well. Withdrawal period extends to slaughter clearance.",
    },
  ]);

  // ── Red Tractor Pig Checklist ─────────────────────────────────────────────
  await db.insert(pigRedTractorChecklistTable).values({
    farmId, assessmentDate: ago(155),
    assessorName: "David Hardwick",
    assessorOrganisation: "NSF Red Tractor",
    certificateNumber: "RT-PIG-2025-04421",
    certificateExpiryDate: fwd(210),
    animalWelfarePlanInPlace: true, vetVisitRecordsComplete: true,
    medicineRecordsComplete: true, feedRecordsComplete: true,
    movementRecordsComplete: true, biosecurityPlanInPlace: true,
    waterQualityTested: true, manureManagementPlan: true,
    tailBitingRiskAssessment: true, enrichmentProvided: true,
    muckspreaderCalibrated: true, staffTrainingRecords: true,
    staffCompetencyAssessed: true, houseConditionAdequate: true,
    lightingCompliant: true, spaceAllowanceCompliant: true,
    feedSystemCompliant: true, mortalityRecordsComplete: true,
    abattoirFeedbackActedOn: true, eaml2RecordsComplete: true,
    overallStatus: "pass",
    nonConformancesCount: 1,
    nonConformanceDetails: "NC-01: Tail biting risk assessment records gap Jan–Feb 2025 (2 months). Corrective action: monthly assessments now documented on farm calendar.",
    correctiveActionDeadline: ago(125),
    nextAssessmentDue: fwd(210),
    notes: "Passed. Clean farm, good welfare ethos. One minor NC on tail biting records frequency. All other areas fully compliant.",
  });

  // ── Pig Kill Records (previous batches) ───────────────────────────────────
  await db.insert(pigKillRecordsTable).values([
    {
      farmId, killDate: new Date(`${prevYr}-10-14`),
      processor: "Cranswick Country Foods, Malton", headCount: 200,
      totalDeadweightKg: "20860.00", averageDeadweightKg: "104.30",
      pricePerKgPence: 218, grossValuePence: 4547480, levelDeductionPence: 40000,
      transportDeductionPence: 18000, otherDeductionsPence: 5000,
      netPaymentPence: 4484480, paymentDate: new Date(`${prevYr}-10-28`),
      averageP2BackfatMm: "10.2", averageMuscleDepthMm: "64.0",
      leanMeatPct: "57.40", gradeOut: "R",
      sppPriceKgPence: 215, sppVariancePence: 57580,
      killSheetRef: `CRW-${prevYr}-8842`,
      herdMark: "UK302150042",
      premiumScheme: "Red Tractor", premiumPence: 42000,
      notes: "Good kill. Majority graded R. 8 pigs graded O. P2 average 10.2mm — good lean.",
    },
    {
      farmId, killDate: new Date(`${prevYr}-12-09`),
      processor: "Cranswick Country Foods, Malton", headCount: 190,
      totalDeadweightKg: "19418.00", averageDeadweightKg: "102.20",
      pricePerKgPence: 214, grossValuePence: 4155452, levelDeductionPence: 38000,
      transportDeductionPence: 18000, otherDeductionsPence: 0,
      netPaymentPence: 4099452, paymentDate: new Date(`${prevYr}-12-23`),
      averageP2BackfatMm: "11.1", averageMuscleDepthMm: "62.5",
      leanMeatPct: "56.80", gradeOut: "R",
      sppPriceKgPence: 210, sppVariancePence: 77520,
      killSheetRef: `CRW-${prevYr}-9301`,
      herdMark: "UK302150042",
      premiumScheme: "Red Tractor", premiumPence: 38000,
      notes: "Pre-Christmas kill. Slightly heavier — a few pigs graded O. Still profitable.",
    },
    {
      farmId, killDate: new Date(ago(7)),
      processor: "Cranswick Country Foods, Malton", headCount: 180,
      totalDeadweightKg: "18846.00", averageDeadweightKg: "104.70",
      pricePerKgPence: 221, grossValuePence: 4164966, levelDeductionPence: 36000,
      transportDeductionPence: 18000, otherDeductionsPence: 0,
      netPaymentPence: 4110966, paymentDate: new Date(fwd(14)),
      averageP2BackfatMm: "9.8", averageMuscleDepthMm: "65.2",
      leanMeatPct: "58.10", gradeOut: "R+",
      sppPriceKgPence: 218, sppVariancePence: 55380,
      killSheetRef: `CRW-${yr}-0587`,
      herdMark: "UK302150042",
      premiumScheme: "Red Tractor", premiumPence: 41400,
      notes: "Most recent kill — awaiting payment. Best P2 result this year at 9.8mm. Excellent lean meat %.",
    },
  ]);

  console.log("[DEMO SEED] Pig production seeded — 3 groups, movements, medicine, farrowing, feed, stockmanship, tail biting, vet, Red Tractor, 3 kill records");
}
