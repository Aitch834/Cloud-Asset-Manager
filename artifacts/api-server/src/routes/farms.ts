import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import {
  biofuelCertificationsTable,
  biofuelFieldDeclarationsTable,
  biofuelDeliveriesTable,
  rtfoBuyersTable,
  farmsTable,
  fieldsTable,
  fieldBoundariesTable,
  cropsTable,
  fieldCropAssignmentsTable,
  harvestRecordsTable,
  cropTransportRecordsTable,
  cropStorageRecordsTable,
  cropDestinationsTable,
  sprayProductsTable,
  sprayApplicationsTable,
  nutrientManagementPlansTable,
  nmpFieldEntriesTable,
  nvzFertiliserApplicationsTable,
  soilTestRecordsTable,
  soilTestResultsTable,
  equipmentTable,
  equipmentMaintenanceLogsTable,
  workshopJobsTable,
  workshopPatTestsTable,
  workshopFireExtinguishersTable,
  equipmentCalibrationRecordsTable,
  herdFlockRegisterTable,
  livestockAnimalsTable,
  livestockMovementsTable,
  livestockMedicineRecordsTable,
  livestockFeedRecordsTable,
  livestockWaterRecordsTable,
  livestockMortalityTable,
  livestockDailyChecksTable,
  vetHealthPlansTable,
  dairyMilkRecordsTable,
  dairyMastitisRecordsTable,
  dairyCalvingRecordsTable,
  dairyBcsRecordsTable,
  dairyMobilityScoringsTable,
  dairyBulkTankRecordsTable,
  dairyDctRecordsTable,
  seedDrillingRecordsTable,
  visitorContractorLogTable,
  pestControlRecordsTable,
  cleaningDisinfectionRecordsTable,
  staffTrainingRecordsTable,
  staffCertificatesTable,
  staffRightToWorkTable,
  staffRtwDocumentsTable,
  riskAssessmentsTable,
  coshhRecordsTable,
  wasteDisposalRecordsTable,
  inspectionRecordsTable,
  nonconformanceRecordsTable,
  correctiveActionsTable,
  environmentalFeaturesTable,
  agriEnvironmentSchemeRecordsTable,
  environmentalAssessmentsTable,
  environmentalManagementEventsTable,
  haulageRecordsTable,
  hauliersTable,
  suppliersTable,
  stockItemsTable,
  purchaseOrdersTable,
  purchaseOrderLinesTable,
  stockDeliveriesTable,
  stockLevelsTable,
  stockMovementsTable,
  financialTransactionsTable,
  documentRecordsTable,
  weatherStationsTable,
  weatherReadingsTable,
  subscriptionsTable,
  modulesTable,
  tenantsTable,
  storageLocationsTable,
  biosecurityPlansTable,
  nvzRiskAssessmentsTable,
  fieldInspectionsTable,
  fieldOperationsTable,
  farmAdvisorsTable,
  farmInspectionSessionsTable,
  externalAccessLogTable,
  farmLocationsTable,
  grainStorageBinsTable,
  equipmentDefectReportsTable,
  grainQualityTestsTable,
  grainTemperatureLogsTable,
  aiReproductionRecordsTable,
  vetPrescriptionRecordsTable,
  sfiAgreementsTable,
  sfiActionsTable,
  slurryStoresTable,
  slurrySpreadingRecordsTable,
  pigFlocksTable,
  pigMovementsTable,
  pigFciDocumentsTable,
  pigFeedRecordsTable,
  pigVetAssessmentsTable,
  pigStockmanshipChecksTable,
  pigTailBitingRisksTable,
  pigFarrowingRecordsTable,
  poultryHousesTable,
  poultryFlocksTable,
  poultryDailyMortalityTable,
  poultryTreatmentsTable,
  poultryHouseCleanoutsTable,
  poultryEnvironmentalLogsTable,
  poultryFciDocumentsTable,
  poultryBroilerWelfareTable,
  poultryThinningRecordsTable,
  horticultureBlocksTable,
  horticultureCropsTable,
  horticultureWaterTestsTable,
  horticultureHarvestRecordsTable,
  horticulturePackhouseRecordsTable,
  allergenManagementRecordsTable,
  carbonAuditsTable,
  carbonEmissionsRecordsTable,
  carbonSequestrationTable,
  carbonReductionActionsTable,
  sustainabilityReportsTable,
  diversificationActivitiesTable,
  farmShopProductsTable,
  farmShopHygieneInspectionsTable,
  equineRecordsTable,
  equineHealthEventsTable,
  renewableEnergyInstallationsTable,
  renewableEnergyMeterReadingsTable,
  shootingAndGameRecordsTable,
  waterAbstractionLicencesTable,
  waterMeterReadingsTable,
  boreholeTestsTable,
  irrigationRecordsTable,
  irrigationEquipmentTable,
  farmMembersTable,
  userInvitationsTable,
  staffFarmAssignmentsTable,
  usersTable,
  rolesTable,
  farmInsuranceTable,
  farmPlannerEventsTable,
  farmGrantsTable,
  farmAssuranceCertsTable,
  cropContractsTable,
} from "@workspace/db";
import { eq, and, desc, sql, lt, gte, isNotNull, lte } from "drizzle-orm";
import { createNonconformanceNotification, createFieldActionNotification, createCriticalRiskNotification, createWaterFailureNotification } from "../lib/alertingJob";
import { requireAuth, requireTenant, requireModuleByKey } from "../middlewares/roleMiddleware";
import { generateSustainabilityDeclaration, generateAuditPack } from "../lib/biofuel-pdfs";

const router: IRouter = Router();

const XERO_ACCOUNT_MAP: Record<string, string> = {
  "seeds": "310",
  "fertiliser": "311",
  "spray": "312",
  "chemicals": "312",
  "feed": "320",
  "veterinary": "330",
  "fuel": "340",
  "machinery": "350",
  "repairs": "351",
  "rent": "360",
  "insurance": "370",
  "wages": "380",
  "utilities": "390",
  "professional-fees": "400",
  "livestock-purchase": "410",
  "livestock-sale": "200",
  "crop-sale": "210",
  "subsidy": "220",
  "general": "499",
};

function mapCategoryToXeroAccount(category: string): string {
  return XERO_ACCOUNT_MAP[category.toLowerCase()] || XERO_ACCOUNT_MAP["general"];
}

function mapVatRateToXeroTax(vatRate: string | null): string {
  if (!vatRate) return "No VAT";
  const rate = vatRate.toLowerCase();
  if (rate === "standard" || rate === "20" || rate === "20%") return "20% (VAT on Income)";
  if (rate === "reduced" || rate === "5" || rate === "5%") return "5% (VAT on Income)";
  if (rate === "zero" || rate === "0" || rate === "0%") return "Zero Rated Income";
  if (rate === "exempt") return "Exempt Income";
  return "No VAT";
}

async function validateFarmAccess(req: Request, res: Response): Promise<number | null> {
  const farmId = parseInt(req.params.farmId as string, 10);
  if (isNaN(farmId)) {
    res.status(400).json({ error: "Invalid farm ID" });
    return null;
  }
  const [farm] = await db
    .select()
    .from(farmsTable)
    .where(and(eq(farmsTable.id, farmId), eq(farmsTable.tenantId, req.tenantId!)))
    .limit(1);
  if (!farm) {
    res.status(404).json({ error: "Farm not found" });
    return null;
  }
  return farmId;
}

function getRecordId(req: Request): number | null {
  const id = parseInt(req.params.recordId as string, 10);
  return isNaN(id) ? null : id;
}

router.get("/farms/:farmId", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.select().from(farmsTable).where(eq(farmsTable.id, farmId));
  if (!record) { res.status(404).json({ error: "Farm not found" }); return; }
  res.json({ record });
});

router.get("/farms/:farmId/dashboard", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;

  const [farm] = await db.select().from(farmsTable).where(eq(farmsTable.id, farmId));

  const subs = await db
    .select({
      id: subscriptionsTable.id,
      farmId: subscriptionsTable.farmId,
      moduleId: subscriptionsTable.moduleId,
      moduleName: modulesTable.name,
      moduleKey: modulesTable.key,
      status: subscriptionsTable.status,
      currentPeriodEnd: subscriptionsTable.currentPeriodEnd,
    })
    .from(subscriptionsTable)
    .innerJoin(modulesTable, eq(subscriptionsTable.moduleId, modulesTable.id))
    .where(and(eq(subscriptionsTable.farmId, farmId), eq(subscriptionsTable.tenantId, req.tenantId!)));

  const activeSubs = subs.filter((s) => s.status === "active");

  const now = new Date();

  const [
    [inspResult],
    [ncCount],
    [overdueInspCount],
    [fieldCount],
    [equipmentCount],
    [sprayCount],
    [inspectionCount],
  ] = await Promise.all([
    db
      .select({ nextDue: inspectionRecordsTable.nextInspectionDue })
      .from(inspectionRecordsTable)
      .where(eq(inspectionRecordsTable.farmId, farmId))
      .orderBy(desc(inspectionRecordsTable.inspectionDate))
      .limit(1),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(nonconformanceRecordsTable)
      .where(and(eq(nonconformanceRecordsTable.farmId, farmId), eq(nonconformanceRecordsTable.status, "open"))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(inspectionRecordsTable)
      .where(and(eq(inspectionRecordsTable.farmId, farmId), lt(inspectionRecordsTable.nextInspectionDue, now))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(fieldsTable)
      .where(and(eq(fieldsTable.farmId, farmId), eq(fieldsTable.isActive, true))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(equipmentTable)
      .where(eq(equipmentTable.farmId, farmId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(sprayApplicationsTable)
      .where(eq(sprayApplicationsTable.farmId, farmId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(inspectionRecordsTable)
      .where(eq(inspectionRecordsTable.farmId, farmId)),
  ]);

  const moduleStats = activeSubs.map((s) => ({
    moduleKey: s.moduleKey,
    moduleName: s.moduleName,
    recordCount: 0,
    lastActivity: null as string | null,
    hasOverdue: false,
  }));

  const totalOverdue = ncCount.count + overdueInspCount.count;
  const complianceScore = totalOverdue === 0 ? 95 : Math.max(50, 95 - totalOverdue * 5);

  res.json({
    farm,
    complianceScore,
    overdueActions: totalOverdue,
    upcomingInspection: inspResult?.nextDue || null,
    fieldCount: fieldCount.count,
    equipmentCount: equipmentCount.count,
    sprayCount: sprayCount.count,
    inspectionCount: inspectionCount.count,
    moduleStats,
    activeSubscriptions: activeSubs.map((s) => ({
      id: s.id,
      farmId: s.farmId,
      moduleId: s.moduleId,
      moduleKey: s.moduleKey,
      moduleName: s.moduleName,
      status: s.status,
      currentPeriodEnd: s.currentPeriodEnd,
    })),
  });
});

router.get("/farms/:farmId/modules", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const subs = await db
    .select({ moduleKey: modulesTable.key })
    .from(subscriptionsTable)
    .innerJoin(modulesTable, eq(subscriptionsTable.moduleId, modulesTable.id))
    .where(and(
      eq(subscriptionsTable.farmId, farmId),
      eq(subscriptionsTable.tenantId, req.tenantId!),
      eq(subscriptionsTable.status, "active")
    ));
  res.json({ activeModuleKeys: subs.map((s) => s.moduleKey) });
});

router.get("/farms/:farmId/activity", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;

  const [sprays, inspections, fields, equipment, soilTests, visitors] = await Promise.all([
    db.select({ id: sprayApplicationsTable.id, createdAt: sprayApplicationsTable.applicationDate, label: sprayApplicationsTable.operatorName })
      .from(sprayApplicationsTable).where(eq(sprayApplicationsTable.farmId, farmId)).orderBy(desc(sprayApplicationsTable.applicationDate)).limit(5),
    db.select({ id: inspectionRecordsTable.id, createdAt: inspectionRecordsTable.inspectionDate, label: inspectionRecordsTable.inspectionType })
      .from(inspectionRecordsTable).where(eq(inspectionRecordsTable.farmId, farmId)).orderBy(desc(inspectionRecordsTable.inspectionDate)).limit(5),
    db.select({ id: fieldsTable.id, createdAt: fieldsTable.createdAt, label: fieldsTable.name })
      .from(fieldsTable).where(eq(fieldsTable.farmId, farmId)).orderBy(desc(fieldsTable.createdAt)).limit(5),
    db.select({ id: equipmentTable.id, createdAt: equipmentTable.createdAt, label: equipmentTable.name })
      .from(equipmentTable).where(eq(equipmentTable.farmId, farmId)).orderBy(desc(equipmentTable.createdAt)).limit(5),
    db.select({ id: soilTestRecordsTable.id, createdAt: soilTestRecordsTable.sampleDate, label: soilTestRecordsTable.sampleReference })
      .from(soilTestRecordsTable).where(eq(soilTestRecordsTable.farmId, farmId)).orderBy(desc(soilTestRecordsTable.sampleDate)).limit(5),
    db.select({ id: visitorContractorLogTable.id, createdAt: visitorContractorLogTable.arrivalTime, label: visitorContractorLogTable.visitorName })
      .from(visitorContractorLogTable).where(eq(visitorContractorLogTable.farmId, farmId)).orderBy(desc(visitorContractorLogTable.arrivalTime)).limit(5),
  ]);

  const activities = [
    ...sprays.map((r) => ({ id: `spray-${r.id}`, module: "sprays", description: `Spray application recorded${r.label ? ` by ${r.label}` : ""}`, createdAt: r.createdAt })),
    ...inspections.map((r) => ({ id: `insp-${r.id}`, module: "inspections", description: `Inspection completed${r.label ? `: ${r.label}` : ""}`, createdAt: r.createdAt })),
    ...fields.map((r) => ({ id: `field-${r.id}`, module: "fields", description: `Field registered: ${r.label ?? "Unnamed"}`, createdAt: r.createdAt })),
    ...equipment.map((r) => ({ id: `equip-${r.id}`, module: "equipment", description: `Equipment added: ${r.label ?? "Unnamed"}`, createdAt: r.createdAt })),
    ...soilTests.map((r) => ({ id: `soil-${r.id}`, module: "soil", description: `Soil test submitted${r.label ? ` (ref: ${r.label})` : ""}`, createdAt: r.createdAt })),
    ...visitors.map((r) => ({ id: `visitor-${r.id}`, module: "visitors", description: `Visitor logged: ${r.label ?? "Unknown"}`, createdAt: r.createdAt })),
  ]
    .filter((a) => a.createdAt)
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 10);

  res.json({ activities });
});

// ─── Fields ─────────────────────────────────────────
router.get("/farms/:farmId/fields", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(fieldsTable).where(eq(fieldsTable.farmId, farmId)).orderBy(desc(fieldsTable.createdAt));
  res.json({ records });
});

router.post("/farms/:farmId/fields", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(fieldsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.get("/farms/:farmId/fields/by-code/:fieldCode", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const { fieldCode } = req.params;
  const [record] = await db.select().from(fieldsTable).where(and(eq(fieldsTable.farmId, farmId), eq(fieldsTable.fieldCode, fieldCode)));
  if (!record) { res.status(404).json({ error: "No field found for this code" }); return; }
  res.json(record);
});

router.get("/farms/:farmId/fields/:recordId", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.select().from(fieldsTable).where(and(eq(fieldsTable.id, recordId), eq(fieldsTable.farmId, farmId)));
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

router.put("/farms/:farmId/fields/:recordId", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(fieldsTable).set(req.body).where(and(eq(fieldsTable.id, recordId), eq(fieldsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

router.delete("/farms/:farmId/fields/:recordId", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.update(fieldsTable).set({ isActive: false }).where(and(eq(fieldsTable.id, recordId), eq(fieldsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Field Boundaries ────────────────────────────────
router.get("/farms/:farmId/fields/:recordId/boundary", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const fieldId = parseInt(req.params.recordId, 10);
  if (isNaN(fieldId)) { res.status(400).json({ error: "Invalid field ID" }); return; }
  const [field] = await db.select({ id: fieldsTable.id }).from(fieldsTable).where(and(eq(fieldsTable.id, fieldId), eq(fieldsTable.farmId, farmId)));
  if (!field) { res.status(404).json({ error: "Field not found" }); return; }
  const [boundary] = await db.select().from(fieldBoundariesTable).where(eq(fieldBoundariesTable.fieldId, fieldId)).orderBy(desc(fieldBoundariesTable.capturedAt)).limit(1);
  res.json({ boundary: boundary ?? null });
});

router.post("/farms/:farmId/fields/:recordId/boundary", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const fieldId = parseInt(req.params.recordId, 10);
  if (isNaN(fieldId)) { res.status(400).json({ error: "Invalid field ID" }); return; }
  const [field] = await db.select({ id: fieldsTable.id }).from(fieldsTable).where(and(eq(fieldsTable.id, fieldId), eq(fieldsTable.farmId, farmId)));
  if (!field) { res.status(404).json({ error: "Field not found" }); return; }
  const { polygonPoints, capturedBy, areaHectares } = req.body as { polygonPoints: unknown; capturedBy?: string; areaHectares?: number };
  if (!polygonPoints || !Array.isArray(polygonPoints) || polygonPoints.length < 3) {
    res.status(400).json({ error: "polygonPoints must be an array of at least 3 points" }); return;
  }
  const [boundary] = await db.insert(fieldBoundariesTable).values({ fieldId, polygonPoints, capturedBy: capturedBy ?? null }).returning();
  if (areaHectares != null && !isNaN(areaHectares)) {
    await db.update(fieldsTable).set({ areaHectares: String(areaHectares) }).where(eq(fieldsTable.id, fieldId));
  }
  res.status(201).json({ boundary });
});

// ─── Crops ──────────────────────────────────────────
router.get("/farms/:farmId/crops", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(cropsTable).where(eq(cropsTable.farmId, farmId)).orderBy(desc(cropsTable.createdAt));
  res.json({ records });
});

router.post("/farms/:farmId/crops", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(cropsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/crops/:recordId", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(cropsTable).set(req.body).where(and(eq(cropsTable.id, recordId), eq(cropsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/crops/:recordId", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(cropsTable).where(and(eq(cropsTable.id, recordId), eq(cropsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Field-Crop Assignments ─────────────────────────
router.get("/farms/:farmId/field-crops", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db
    .select({
      id: fieldCropAssignmentsTable.id,
      fieldId: fieldCropAssignmentsTable.fieldId,
      fieldName: fieldsTable.name,
      fieldReference: fieldsTable.fieldReference,
      areaHectares: fieldsTable.areaHectares,
      cropId: fieldCropAssignmentsTable.cropId,
      cropName: cropsTable.name,
      plantingDate: fieldCropAssignmentsTable.plantingDate,
      expectedHarvestDate: fieldCropAssignmentsTable.expectedHarvestDate,
      season: fieldCropAssignmentsTable.season,
      year: fieldCropAssignmentsTable.year,
      notes: fieldCropAssignmentsTable.notes,
      createdAt: fieldCropAssignmentsTable.createdAt,
      // Earliest actual harvest date recorded against this assignment, if any.
      // Returned as a string (ISO date) or null when no harvest record exists.
      actualHarvestDate: sql<string | null>`(
        SELECT MIN(${harvestRecordsTable.harvestDate})
        FROM ${harvestRecordsTable}
        WHERE ${harvestRecordsTable.fieldCropAssignmentId} = ${fieldCropAssignmentsTable.id}
      )`,
    })
    .from(fieldCropAssignmentsTable)
    .innerJoin(fieldsTable, eq(fieldCropAssignmentsTable.fieldId, fieldsTable.id))
    .innerJoin(cropsTable, eq(fieldCropAssignmentsTable.cropId, cropsTable.id))
    .where(eq(fieldsTable.farmId, farmId))
    .orderBy(desc(fieldCropAssignmentsTable.createdAt));
  res.json({ records });
});

router.post("/farms/:farmId/field-crops", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  if (req.body.fieldId) {
    const [field] = await db.select({ id: fieldsTable.id }).from(fieldsTable).where(and(eq(fieldsTable.id, req.body.fieldId), eq(fieldsTable.farmId, farmId))).limit(1);
    if (!field) { res.status(400).json({ error: "Field not found on this farm" }); return; }
  }
  if (req.body.cropId) {
    const [crop] = await db.select({ id: cropsTable.id }).from(cropsTable).where(and(eq(cropsTable.id, req.body.cropId), eq(cropsTable.farmId, farmId))).limit(1);
    if (!crop) { res.status(400).json({ error: "Crop not found on this farm" }); return; }
  }
  const [record] = await db.insert(fieldCropAssignmentsTable).values(req.body).returning();
  res.status(201).json({ record });
});

// ─── Harvests ───────────────────────────────────────
router.get("/farms/:farmId/harvests", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db
    .select()
    .from(harvestRecordsTable)
    .innerJoin(fieldCropAssignmentsTable, eq(harvestRecordsTable.fieldCropAssignmentId, fieldCropAssignmentsTable.id))
    .innerJoin(fieldsTable, eq(fieldCropAssignmentsTable.fieldId, fieldsTable.id))
    .innerJoin(cropsTable, eq(fieldCropAssignmentsTable.cropId, cropsTable.id))
    .leftJoin(equipmentTable, eq(harvestRecordsTable.equipmentId, equipmentTable.id))
    .where(eq(fieldsTable.farmId, farmId))
    .orderBy(desc(harvestRecordsTable.harvestDate));
  res.json({
    records: records.map((r) => ({
      ...r.harvest_records,
      fieldCropAssignment: r.field_crop_assignments,
      field: r.fields,
      crop: r.crops,
      equipment: r.equipment,
    })),
  });
});

router.post("/farms/:farmId/harvests", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  if (req.body.fieldCropAssignmentId) {
    const [fca] = await db
      .select({ id: fieldCropAssignmentsTable.id })
      .from(fieldCropAssignmentsTable)
      .innerJoin(fieldsTable, eq(fieldCropAssignmentsTable.fieldId, fieldsTable.id))
      .where(and(eq(fieldCropAssignmentsTable.id, req.body.fieldCropAssignmentId), eq(fieldsTable.farmId, farmId)))
      .limit(1);
    if (!fca) { res.status(400).json({ error: "Field crop assignment not found on this farm" }); return; }
  }
  const { equipmentId, operatorName, areaHarvestedHa, ...rest } = req.body;
  const [record] = await db.insert(harvestRecordsTable).values({
    ...rest,
    equipmentId: equipmentId ? Number(equipmentId) : null,
    operatorName: operatorName || null,
    areaHarvestedHa: areaHarvestedHa || null,
  }).returning();
  res.status(201).json({ record });
});

// ─── Harvest Transport Records ───────────────────────
router.get("/farms/:farmId/harvest-transport", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db
    .select()
    .from(cropTransportRecordsTable)
    .innerJoin(harvestRecordsTable, eq(cropTransportRecordsTable.harvestRecordId, harvestRecordsTable.id))
    .innerJoin(fieldCropAssignmentsTable, eq(harvestRecordsTable.fieldCropAssignmentId, fieldCropAssignmentsTable.id))
    .innerJoin(fieldsTable, eq(fieldCropAssignmentsTable.fieldId, fieldsTable.id))
    .innerJoin(cropsTable, eq(fieldCropAssignmentsTable.cropId, cropsTable.id))
    .where(eq(fieldsTable.farmId, farmId))
    .orderBy(desc(cropTransportRecordsTable.departureTime));
  res.json({
    records: records.map((r) => ({
      ...r.crop_transport_records,
      harvest: r.harvest_records,
      field: r.fields,
      crop: r.crops,
    })),
  });
});

router.post("/farms/:farmId/harvest-transport", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const valid = await validateHarvestOwnership(req.body.harvestRecordId, farmId);
  if (!valid) { res.status(400).json({ error: "Harvest record not found on this farm" }); return; }
  const [record] = await db.insert(cropTransportRecordsTable).values(req.body).returning();
  res.status(201).json({ record });
});

router.delete("/farms/:farmId/harvest-transport/:recordId", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = parseInt(req.params.recordId);
  await db.delete(cropTransportRecordsTable).where(eq(cropTransportRecordsTable.id, recordId));
  res.json({ success: true });
});

// ─── Harvest Storage Records ─────────────────────────
router.get("/farms/:farmId/harvest-storage", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db
    .select()
    .from(cropStorageRecordsTable)
    .leftJoin(harvestRecordsTable, eq(cropStorageRecordsTable.harvestRecordId, harvestRecordsTable.id))
    .leftJoin(fieldCropAssignmentsTable, eq(harvestRecordsTable.fieldCropAssignmentId, fieldCropAssignmentsTable.id))
    .leftJoin(cropsTable, eq(fieldCropAssignmentsTable.cropId, cropsTable.id))
    .where(eq(cropStorageRecordsTable.farmId, farmId))
    .orderBy(desc(cropStorageRecordsTable.dateIn));
  res.json({
    records: records.map((r) => ({
      ...r.crop_storage_records,
      harvest: r.harvest_records,
      crop: r.crops,
    })),
  });
});

router.post("/farms/:farmId/harvest-storage", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(cropStorageRecordsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.delete("/farms/:farmId/harvest-storage/:recordId", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = parseInt(req.params.recordId);
  await db.delete(cropStorageRecordsTable).where(and(eq(cropStorageRecordsTable.id, recordId), eq(cropStorageRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Field Operations ──────────────────────────────
router.get("/farms/:farmId/field-operations", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db
    .select()
    .from(fieldOperationsTable)
    .where(eq(fieldOperationsTable.farmId, farmId))
    .orderBy(desc(fieldOperationsTable.operationDate));
  res.json({ records });
});

router.post("/farms/:farmId/field-operations", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const { operationDate, operationType, fieldName, fieldId, implement, workingDepthCm, passes, areaHa, quantity, quantityUnit, operator, notes } = req.body;
  const [record] = await db.insert(fieldOperationsTable).values({
    farmId,
    fieldId: fieldId ? parseInt(fieldId) : null,
    fieldName,
    operationDate: new Date(operationDate),
    operationType,
    implement: implement || null,
    workingDepthCm: workingDepthCm ? parseInt(workingDepthCm) : null,
    passes: passes ? parseInt(passes) : 1,
    areaHa: areaHa || null,
    quantity: quantity || null,
    quantityUnit: quantityUnit || null,
    operator: operator || null,
    notes: notes || null,
  }).returning();
  res.json({ record });
});

router.put("/farms/:farmId/field-operations/:recordId", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = parseInt(req.params.recordId);
  const { operationDate, operationType, fieldName, fieldId, implement, workingDepthCm, passes, areaHa, quantity, quantityUnit, operator, notes } = req.body;
  const [record] = await db.update(fieldOperationsTable).set({
    fieldId: fieldId ? parseInt(fieldId) : null,
    fieldName,
    operationDate: operationDate ? new Date(operationDate) : undefined,
    operationType,
    implement: implement || null,
    workingDepthCm: workingDepthCm ? parseInt(workingDepthCm) : null,
    passes: passes ? parseInt(passes) : 1,
    areaHa: areaHa || null,
    quantity: quantity || null,
    quantityUnit: quantityUnit || null,
    operator: operator || null,
    notes: notes || null,
  }).where(and(eq(fieldOperationsTable.id, recordId), eq(fieldOperationsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/field-operations/:recordId", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = parseInt(req.params.recordId);
  await db.delete(fieldOperationsTable).where(and(eq(fieldOperationsTable.id, recordId), eq(fieldOperationsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Spray Products ────────────────────────────────
router.get("/farms/:farmId/spray-products", requireAuth, requireTenant, requireModuleByKey("sprays-inputs", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(sprayProductsTable).where(eq(sprayProductsTable.farmId, farmId)).orderBy(desc(sprayProductsTable.createdAt));
  res.json({ records });
});

router.post("/farms/:farmId/spray-products", requireAuth, requireTenant, requireModuleByKey("sprays-inputs", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(sprayProductsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/spray-products/:recordId", requireAuth, requireTenant, requireModuleByKey("sprays-inputs", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(sprayProductsTable).set(req.body).where(and(eq(sprayProductsTable.id, recordId), eq(sprayProductsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/spray-products/:recordId", requireAuth, requireTenant, requireModuleByKey("sprays-inputs", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(sprayProductsTable).where(and(eq(sprayProductsTable.id, recordId), eq(sprayProductsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Spray Applications ────────────────────────────
router.get("/farms/:farmId/spray-applications", requireAuth, requireTenant, requireModuleByKey("sprays-inputs", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db
    .select({
      id: sprayApplicationsTable.id,
      farmId: sprayApplicationsTable.farmId,
      fieldId: sprayApplicationsTable.fieldId,
      fieldName: fieldsTable.name,
      productId: sprayApplicationsTable.productId,
      productName: sprayProductsTable.productName,
      productCategory: sprayProductsTable.category,
      applicationDate: sprayApplicationsTable.applicationDate,
      applicationRate: sprayApplicationsTable.applicationRate,
      rateUnit: sprayApplicationsTable.rateUnit,
      areaSprayedHa: sprayApplicationsTable.areaSprayedHa,
      operatorName: sprayApplicationsTable.operatorName,
      reasonForApplication: sprayApplicationsTable.reasonForApplication,
      windSpeedKmh: sprayApplicationsTable.windSpeedKmh,
      windDirection: sprayApplicationsTable.windDirection,
      temperatureC: sprayApplicationsTable.temperatureC,
      batchNumber: sprayApplicationsTable.batchNumber,
      lotNumber: sprayApplicationsTable.lotNumber,
      stockDeliveryId: sprayApplicationsTable.stockDeliveryId,
      notes: sprayApplicationsTable.notes,
      createdAt: sprayApplicationsTable.createdAt,
    })
    .from(sprayApplicationsTable)
    .leftJoin(fieldsTable, eq(sprayApplicationsTable.fieldId, fieldsTable.id))
    .leftJoin(sprayProductsTable, eq(sprayApplicationsTable.productId, sprayProductsTable.id))
    .where(eq(sprayApplicationsTable.farmId, farmId))
    .orderBy(desc(sprayApplicationsTable.applicationDate));
  res.json({ records });
});

router.post("/farms/:farmId/spray-applications", requireAuth, requireTenant, requireModuleByKey("sprays-inputs", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(sprayApplicationsTable).values({ ...req.body, farmId }).returning();

  const rate = parseFloat(req.body.applicationRate);
  const area = parseFloat(req.body.areaSprayedHa);
  if (!isNaN(rate) && !isNaN(area) && area > 0 && req.body.productId) {
    const [product] = await db.select().from(sprayProductsTable).where(eq(sprayProductsTable.id, Number(req.body.productId))).limit(1);
    if (product?.stockItemId) {
      const qtyUsed = rate * area;
      const qtyChange = -qtyUsed;
      await db.insert(stockMovementsTable).values({
        farmId,
        stockItemId: product.stockItemId,
        movementType: "usage",
        quantityChange: String(qtyChange),
        referenceType: "spray_application",
        referenceId: record.id,
        fieldId: req.body.fieldId ? Number(req.body.fieldId) : null,
        performedBy: req.body.operatorName || null,
        notes: `Auto-deducted: spray application on ${req.body.applicationDate}`,
      });
      const [existing] = await db.select().from(stockLevelsTable).where(and(eq(stockLevelsTable.farmId, farmId), eq(stockLevelsTable.stockItemId, product.stockItemId))).limit(1);
      if (existing) {
        await db.update(stockLevelsTable).set({ currentQuantity: String(parseFloat(existing.currentQuantity) + qtyChange), lastUpdated: new Date() }).where(eq(stockLevelsTable.id, existing.id));
      } else {
        await db.insert(stockLevelsTable).values({ farmId, stockItemId: product.stockItemId, currentQuantity: String(qtyChange) });
      }
    }
  }

  res.status(201).json({ record });
});

router.put("/farms/:farmId/spray-applications/:recordId", requireAuth, requireTenant, requireModuleByKey("sprays-inputs", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(sprayApplicationsTable).set(req.body).where(and(eq(sprayApplicationsTable.id, recordId), eq(sprayApplicationsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/spray-applications/:recordId", requireAuth, requireTenant, requireModuleByKey("sprays-inputs", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(sprayApplicationsTable).where(and(eq(sprayApplicationsTable.id, recordId), eq(sprayApplicationsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── NMP Plans ──────────────────────────────────────
router.get("/farms/:farmId/nmp-plans", requireAuth, requireTenant, requireModuleByKey("sprays-inputs", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(nutrientManagementPlansTable).where(eq(nutrientManagementPlansTable.farmId, farmId)).orderBy(desc(nutrientManagementPlansTable.planYear));
  res.json({ records });
});

router.post("/farms/:farmId/nmp-plans", requireAuth, requireTenant, requireModuleByKey("sprays-inputs", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(nutrientManagementPlansTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.get("/farms/:farmId/nmp-plans/:recordId", requireAuth, requireTenant, requireModuleByKey("sprays-inputs", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [plan] = await db.select().from(nutrientManagementPlansTable).where(and(eq(nutrientManagementPlansTable.id, recordId), eq(nutrientManagementPlansTable.farmId, farmId)));
  if (!plan) { res.status(404).json({ error: "Not found" }); return; }
  const entries = await db.select().from(nmpFieldEntriesTable).where(eq(nmpFieldEntriesTable.planId, recordId));
  res.json({ record: { ...plan, fieldEntries: entries } });
});

router.put("/farms/:farmId/nmp-plans/:recordId", requireAuth, requireTenant, requireModuleByKey("sprays-inputs", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(nutrientManagementPlansTable).set(req.body).where(and(eq(nutrientManagementPlansTable.id, recordId), eq(nutrientManagementPlansTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/nmp-plans/:recordId", requireAuth, requireTenant, requireModuleByKey("sprays-inputs", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(nmpFieldEntriesTable).where(eq(nmpFieldEntriesTable.planId, recordId));
  await db.delete(nutrientManagementPlansTable).where(and(eq(nutrientManagementPlansTable.id, recordId), eq(nutrientManagementPlansTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── NMP Field Entries ───────────────────────────────
router.get("/farms/:farmId/nmp-plans/:planId/field-entries", requireAuth, requireTenant, requireModuleByKey("sprays-inputs", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const planId = parseInt(req.params.planId);
  const [plan] = await db.select().from(nutrientManagementPlansTable).where(and(eq(nutrientManagementPlansTable.id, planId), eq(nutrientManagementPlansTable.farmId, farmId))).limit(1);
  if (!plan) { res.status(404).json({ error: "Plan not found" }); return; }
  const entries = await db
    .select({ id: nmpFieldEntriesTable.id, planId: nmpFieldEntriesTable.planId, fieldId: nmpFieldEntriesTable.fieldId, fieldName: fieldsTable.name, nitrogenKgHa: nmpFieldEntriesTable.nitrogenKgHa, phosphorusKgHa: nmpFieldEntriesTable.phosphorusKgHa, potassiumKgHa: nmpFieldEntriesTable.potassiumKgHa, organicManureType: nmpFieldEntriesTable.organicManureType, organicManureRate: nmpFieldEntriesTable.organicManureRate, applicationMethod: nmpFieldEntriesTable.applicationMethod, timingNotes: nmpFieldEntriesTable.timingNotes, createdAt: nmpFieldEntriesTable.createdAt })
    .from(nmpFieldEntriesTable)
    .leftJoin(fieldsTable, eq(nmpFieldEntriesTable.fieldId, fieldsTable.id))
    .where(eq(nmpFieldEntriesTable.planId, planId));
  res.json({ entries });
});

router.post("/farms/:farmId/nmp-plans/:planId/field-entries", requireAuth, requireTenant, requireModuleByKey("sprays-inputs", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const planId = parseInt(req.params.planId);
  const [plan] = await db.select().from(nutrientManagementPlansTable).where(and(eq(nutrientManagementPlansTable.id, planId), eq(nutrientManagementPlansTable.farmId, farmId))).limit(1);
  if (!plan) { res.status(404).json({ error: "Plan not found" }); return; }
  const [entry] = await db.insert(nmpFieldEntriesTable).values({ ...req.body, planId }).returning();
  res.status(201).json({ entry });
});

router.delete("/farms/:farmId/nmp-plans/:planId/field-entries/:entryId", requireAuth, requireTenant, requireModuleByKey("sprays-inputs", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const entryId = parseInt(req.params.entryId);
  await db.delete(nmpFieldEntriesTable).where(eq(nmpFieldEntriesTable.id, entryId));
  res.json({ success: true });
});

// ─── Field-specific NMP entries (all years) ─────────
router.get("/farms/:farmId/fields/:fieldId/nmp-entries", requireAuth, requireTenant, requireModuleByKey("sprays-inputs", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const fieldId = parseInt(req.params.fieldId);
  if (!fieldId) { res.status(400).json({ error: "Invalid field ID" }); return; }
  const entries = await db
    .select({
      id: nmpFieldEntriesTable.id,
      planId: nmpFieldEntriesTable.planId,
      planYear: nutrientManagementPlansTable.planYear,
      preparedBy: nutrientManagementPlansTable.preparedBy,
      approvedDate: nutrientManagementPlansTable.approvedDate,
      cropType: nmpFieldEntriesTable.cropType,
      nitrogenKgHa: nmpFieldEntriesTable.nitrogenKgHa,
      phosphorusKgHa: nmpFieldEntriesTable.phosphorusKgHa,
      potassiumKgHa: nmpFieldEntriesTable.potassiumKgHa,
      organicManureType: nmpFieldEntriesTable.organicManureType,
      organicManureRate: nmpFieldEntriesTable.organicManureRate,
      applicationMethod: nmpFieldEntriesTable.applicationMethod,
      timingNotes: nmpFieldEntriesTable.timingNotes,
      createdAt: nmpFieldEntriesTable.createdAt,
    })
    .from(nmpFieldEntriesTable)
    .innerJoin(nutrientManagementPlansTable, eq(nmpFieldEntriesTable.planId, nutrientManagementPlansTable.id))
    .where(and(eq(nmpFieldEntriesTable.fieldId, fieldId), eq(nutrientManagementPlansTable.farmId, farmId)))
    .orderBy(desc(nutrientManagementPlansTable.planYear));
  res.json({ entries });
});

// ─── NVZ Fertiliser Applications ────────────────────
router.get("/farms/:farmId/nvz-applications", requireAuth, requireTenant, requireModuleByKey("sprays-inputs", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db
    .select({
      id: nvzFertiliserApplicationsTable.id,
      farmId: nvzFertiliserApplicationsTable.farmId,
      fieldId: nvzFertiliserApplicationsTable.fieldId,
      fieldName: fieldsTable.name,
      areaHectares: fieldsTable.areaHectares,
      applicationDate: nvzFertiliserApplicationsTable.applicationDate,
      productName: nvzFertiliserApplicationsTable.productName,
      productType: nvzFertiliserApplicationsTable.productType,
      nitrogenKgHa: nvzFertiliserApplicationsTable.nitrogenKgHa,
      areaAppliedHa: nvzFertiliserApplicationsTable.areaAppliedHa,
      totalNitrogenKg: nvzFertiliserApplicationsTable.totalNitrogenKg,
      applicationMethod: nvzFertiliserApplicationsTable.applicationMethod,
      notes: nvzFertiliserApplicationsTable.notes,
      createdAt: nvzFertiliserApplicationsTable.createdAt,
    })
    .from(nvzFertiliserApplicationsTable)
    .leftJoin(fieldsTable, eq(nvzFertiliserApplicationsTable.fieldId, fieldsTable.id))
    .where(eq(nvzFertiliserApplicationsTable.farmId, farmId))
    .orderBy(desc(nvzFertiliserApplicationsTable.applicationDate));
  res.json({ records });
});

router.post("/farms/:farmId/nvz-applications", requireAuth, requireTenant, requireModuleByKey("sprays-inputs", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const { fieldId, applicationDate, productName, productType, nitrogenKgHa, areaAppliedHa, applicationMethod, notes } = req.body as {
    fieldId: number; applicationDate: string; productName: string; productType: string;
    nitrogenKgHa: number; areaAppliedHa: number; applicationMethod?: string; notes?: string;
  };
  if (!fieldId || !applicationDate || !productName || !productType || nitrogenKgHa == null || areaAppliedHa == null) {
    res.status(400).json({ error: "Missing required fields" }); return;
  }
  const totalNitrogenKg = String((parseFloat(String(nitrogenKgHa)) * parseFloat(String(areaAppliedHa))).toFixed(2));
  const [record] = await db.insert(nvzFertiliserApplicationsTable).values({
    farmId, fieldId, applicationDate: new Date(applicationDate),
    productName, productType,
    nitrogenKgHa: String(nitrogenKgHa), areaAppliedHa: String(areaAppliedHa), totalNitrogenKg,
    applicationMethod: applicationMethod ?? null, notes: notes ?? null,
  }).returning();
  res.status(201).json({ record });
});

router.delete("/farms/:farmId/nvz-applications/:recordId", requireAuth, requireTenant, requireModuleByKey("sprays-inputs", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = parseInt(req.params.recordId);
  await db.delete(nvzFertiliserApplicationsTable).where(and(eq(nvzFertiliserApplicationsTable.id, recordId), eq(nvzFertiliserApplicationsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── NVZ Field Summary (rolling 12-month totals) ────
router.get("/farms/:farmId/nvz/field-summary", requireAuth, requireTenant, requireModuleByKey("sprays-inputs", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);

  const fields = await db.select({
    id: fieldsTable.id, name: fieldsTable.name,
    areaHectares: fieldsTable.areaHectares,
    isNvz: fieldsTable.isNvz, nvzLandType: fieldsTable.nvzLandType,
  }).from(fieldsTable).where(and(eq(fieldsTable.farmId, farmId), eq(fieldsTable.isActive, true)));

  const apps = await db.select({
    fieldId: nvzFertiliserApplicationsTable.fieldId,
    productType: nvzFertiliserApplicationsTable.productType,
    nitrogenKgHa: nvzFertiliserApplicationsTable.nitrogenKgHa,
    areaAppliedHa: nvzFertiliserApplicationsTable.areaAppliedHa,
    totalNitrogenKg: nvzFertiliserApplicationsTable.totalNitrogenKg,
    applicationDate: nvzFertiliserApplicationsTable.applicationDate,
  }).from(nvzFertiliserApplicationsTable)
    .where(and(eq(nvzFertiliserApplicationsTable.farmId, farmId), gte(nvzFertiliserApplicationsTable.applicationDate, cutoff)));

  const summary = fields.map((f) => {
    const fieldApps = apps.filter((a) => a.fieldId === f.id);
    const organicTypes = ["slurry", "fy", "poultry-manure", "organic-n", "digestate", "compost"];
    const totalNKg = fieldApps.reduce((s, a) => s + parseFloat(a.totalNitrogenKg ?? "0"), 0);
    const organicNKg = fieldApps.filter((a) => organicTypes.includes(a.productType)).reduce((s, a) => s + parseFloat(a.totalNitrogenKg ?? "0"), 0);
    const areaHa = parseFloat(String(f.areaHectares ?? "1")) || 1;
    const totalNKgHa = totalNKg / areaHa;
    const organicNKgHa = organicNKg / areaHa;
    return {
      fieldId: f.id, fieldName: f.name, areaHectares: f.areaHectares,
      isNvz: f.isNvz, nvzLandType: f.nvzLandType,
      totalNKg: parseFloat(totalNKg.toFixed(2)),
      organicNKg: parseFloat(organicNKg.toFixed(2)),
      totalNKgHa: parseFloat(totalNKgHa.toFixed(2)),
      organicNKgHa: parseFloat(organicNKgHa.toFixed(2)),
      applicationCount: fieldApps.length,
    };
  });
  res.json({ summary });
});

// ─── Soil Tests ─────────────────────────────────────
router.get("/farms/:farmId/soil-tests", requireAuth, requireTenant, requireModuleByKey("soil-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(soilTestRecordsTable).where(eq(soilTestRecordsTable.farmId, farmId)).orderBy(desc(soilTestRecordsTable.sampleDate));
  res.json({ records });
});

router.post("/farms/:farmId/soil-tests", requireAuth, requireTenant, requireModuleByKey("soil-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const body = req.body;

  // Resolve fieldId — accept either fieldId (dashboard) or fieldName (mobile sync)
  let fieldId: number | null = body.fieldId ? Number(body.fieldId) : null;
  if (!fieldId && body.fieldName) {
    const [found] = await db.select({ id: fieldsTable.id }).from(fieldsTable)
      .where(and(eq(fieldsTable.farmId, farmId), eq(fieldsTable.name, String(body.fieldName))));
    if (found) fieldId = found.id;
  }
  if (!fieldId) { res.status(400).json({ error: "Field is required" }); return; }

  // Map mobile field names → DB column names
  const sampleDate = body.sampleDate || body.dateTaken || new Date().toISOString();
  const laboratory = body.laboratory ?? body.labName ?? null;
  const rawDepth = body.sampleDepthCm ?? body.depth ?? null;
  const sampleDepthCm = rawDepth ? parseInt(String(rawDepth), 10) || null : null;
  const sampledBy = body.sampledBy ? String(body.sampledBy).trim() : null;
  const noteParts: string[] = [];
  if (body.notes) noteParts.push(body.notes);
  if (body.latitude != null && body.longitude != null) noteParts.push(`GPS: ${body.latitude}, ${body.longitude}`);
  const notes = noteParts.length > 0 ? noteParts.join(" | ") : null;

  // Auto-generate reference: SS-YYYY-NNNN per farm per year if none provided
  let sampleReference = body.sampleReference ? String(body.sampleReference).trim() : null;
  if (!sampleReference) {
    const year = new Date(sampleDate).getFullYear();
    const yearStart = new Date(`${year}-01-01T00:00:00Z`).toISOString();
    const yearEnd = new Date(`${year + 1}-01-01T00:00:00Z`).toISOString();
    const existing = await db.select({ ref: soilTestRecordsTable.sampleReference })
      .from(soilTestRecordsTable)
      .where(and(
        eq(soilTestRecordsTable.farmId, farmId),
        sql`${soilTestRecordsTable.createdAt} >= ${yearStart}`,
        sql`${soilTestRecordsTable.createdAt} < ${yearEnd}`,
        sql`${soilTestRecordsTable.sampleReference} LIKE ${"SS-" + year + "-%"}`,
      ));
    const nextNum = existing.length + 1;
    sampleReference = `SS-${year}-${String(nextNum).padStart(4, "0")}`;
  }

  const [record] = await db.insert(soilTestRecordsTable).values({
    farmId, fieldId, sampleDate: new Date(sampleDate).toISOString(),
    sampleReference, status: "sampled", laboratory, sampleDepthCm, sampledBy, notes,
  }).returning();

  // Accept explicit results array (dashboard) or build from mobile nutrient fields
  const incomingResults: Array<Record<string, unknown>> = Array.isArray(body.results) ? body.results : [];
  if (incomingResults.length === 0) {
    const mobileNutrients: Array<{ nutrient: string; field: string; unit: string }> = [
      { nutrient: "pH", field: "ph", unit: "" },
      { nutrient: "Phosphorus (P)", field: "phosphorus", unit: "mg/l" },
      { nutrient: "Potassium (K)", field: "potassium", unit: "mg/l" },
      { nutrient: "Magnesium (Mg)", field: "magnesium", unit: "mg/l" },
      { nutrient: "Organic Matter (OM)", field: "organicMatter", unit: "%" },
    ];
    for (const n of mobileNutrients) {
      const val = body[n.field];
      if (val !== undefined && val !== null && String(val).trim() !== "") {
        incomingResults.push({ nutrient: n.nutrient, value: String(val).trim(), unit: n.unit });
      }
    }
  }
  for (const r of incomingResults) {
    await db.insert(soilTestResultsTable).values({ soilTestId: record.id, nutrient: String(r.nutrient), value: r.value ? String(r.value) : null, unit: r.unit ? String(r.unit) : null, index: r.index ? String(r.index) : null, status: r.status ? String(r.status) : null });
  }

  res.status(201).json({ record });
});

router.get("/farms/:farmId/soil-tests/:recordId", requireAuth, requireTenant, requireModuleByKey("soil-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [test] = await db.select().from(soilTestRecordsTable).where(and(eq(soilTestRecordsTable.id, recordId), eq(soilTestRecordsTable.farmId, farmId)));
  if (!test) { res.status(404).json({ error: "Not found" }); return; }
  const results = await db.select().from(soilTestResultsTable).where(eq(soilTestResultsTable.soilTestId, recordId));
  res.json({ record: { ...test, results } });
});

router.put("/farms/:farmId/soil-tests/:recordId", requireAuth, requireTenant, requireModuleByKey("soil-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const { fieldId, sampleDate, laboratory, sampleReference, sampleDepthCm, sampledBy, notes } = req.body;
  const updates: Record<string, unknown> = {};
  if (fieldId !== undefined) updates.fieldId = Number(fieldId);
  if (sampleDate !== undefined) updates.sampleDate = new Date(sampleDate).toISOString();
  if (laboratory !== undefined) updates.laboratory = laboratory;
  if (sampleReference !== undefined) updates.sampleReference = sampleReference;
  if (sampleDepthCm !== undefined) updates.sampleDepthCm = sampleDepthCm ? parseInt(String(sampleDepthCm), 10) : null;
  if (sampledBy !== undefined) updates.sampledBy = sampledBy;
  if (notes !== undefined) updates.notes = notes;
  const [record] = await db.update(soilTestRecordsTable).set(updates).where(and(eq(soilTestRecordsTable.id, recordId), eq(soilTestRecordsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.patch("/farms/:farmId/soil-tests/:recordId/status", requireAuth, requireTenant, requireModuleByKey("soil-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const { status } = req.body;
  const valid = ["sampled", "sent_to_lab", "results_received", "archived"];
  if (!valid.includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }
  const updates: Record<string, unknown> = { status };
  if (status === "sent_to_lab") updates.sentToLabDate = new Date().toISOString();
  if (status === "results_received") updates.resultsReceivedDate = new Date().toISOString();
  const [record] = await db.update(soilTestRecordsTable).set(updates).where(and(eq(soilTestRecordsTable.id, recordId), eq(soilTestRecordsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/soil-tests/:recordId", requireAuth, requireTenant, requireModuleByKey("soil-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(soilTestResultsTable).where(eq(soilTestResultsTable.soilTestId, recordId));
  await db.delete(soilTestRecordsTable).where(and(eq(soilTestRecordsTable.id, recordId), eq(soilTestRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Soil Test Results (individual nutrient rows) ───
router.post("/farms/:farmId/soil-tests/:recordId/results", requireAuth, requireTenant, requireModuleByKey("soil-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [test] = await db.select({ id: soilTestRecordsTable.id }).from(soilTestRecordsTable).where(and(eq(soilTestRecordsTable.id, recordId), eq(soilTestRecordsTable.farmId, farmId)));
  if (!test) { res.status(404).json({ error: "Not found" }); return; }
  const [result] = await db.insert(soilTestResultsTable).values({ ...req.body, soilTestId: recordId }).returning();
  res.status(201).json({ result });
});

router.delete("/farms/:farmId/soil-tests/:recordId/results/:resultId", requireAuth, requireTenant, requireModuleByKey("soil-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const resultId = parseInt(req.params.resultId, 10);
  if (isNaN(resultId)) { res.status(400).json({ error: "Invalid result ID" }); return; }
  await db.delete(soilTestResultsTable).where(eq(soilTestResultsTable.id, resultId));
  res.json({ success: true });
});

// ─── Equipment ──────────────────────────────────────
router.get("/farms/:farmId/equipment", requireAuth, requireTenant, requireModuleByKey("equipment-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(equipmentTable).where(eq(equipmentTable.farmId, farmId)).orderBy(desc(equipmentTable.createdAt));
  res.json({ records });
});

router.post("/farms/:farmId/equipment", requireAuth, requireTenant, requireModuleByKey("equipment-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(equipmentTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.get("/farms/:farmId/equipment/:recordId", requireAuth, requireTenant, requireModuleByKey("equipment-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [equip] = await db.select().from(equipmentTable).where(and(eq(equipmentTable.id, recordId), eq(equipmentTable.farmId, farmId)));
  if (!equip) { res.status(404).json({ error: "Not found" }); return; }
  const maintenance = await db.select().from(equipmentMaintenanceLogsTable).where(eq(equipmentMaintenanceLogsTable.equipmentId, recordId)).orderBy(desc(equipmentMaintenanceLogsTable.performedDate));
  const calibrations = await db.select().from(equipmentCalibrationRecordsTable).where(eq(equipmentCalibrationRecordsTable.equipmentId, recordId)).orderBy(desc(equipmentCalibrationRecordsTable.calibrationDate));
  res.json({ record: { ...equip, maintenance, calibrations } });
});

router.put("/farms/:farmId/equipment/:recordId", requireAuth, requireTenant, requireModuleByKey("equipment-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(equipmentTable).set(req.body).where(and(eq(equipmentTable.id, recordId), eq(equipmentTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/equipment/:recordId", requireAuth, requireTenant, requireModuleByKey("equipment-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.update(equipmentTable).set({ isActive: false }).where(and(eq(equipmentTable.id, recordId), eq(equipmentTable.farmId, farmId)));
  res.json({ success: true });
});

async function validateEquipmentOwnership(equipmentId: number, farmId: number): Promise<boolean> {
  const [eq_record] = await db.select({ id: equipmentTable.id }).from(equipmentTable).where(and(eq(equipmentTable.id, equipmentId), eq(equipmentTable.farmId, farmId))).limit(1);
  return !!eq_record;
}

router.get("/farms/:farmId/equipment/:recordId/maintenance", requireAuth, requireTenant, requireModuleByKey("equipment-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const valid = await validateEquipmentOwnership(recordId, farmId);
  if (!valid) { res.status(404).json({ error: "Equipment not found" }); return; }
  const records = await db.select().from(equipmentMaintenanceLogsTable).where(eq(equipmentMaintenanceLogsTable.equipmentId, recordId)).orderBy(desc(equipmentMaintenanceLogsTable.performedDate));
  res.json({ records });
});

router.post("/farms/:farmId/equipment/:recordId/maintenance", requireAuth, requireTenant, requireModuleByKey("equipment-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const valid = await validateEquipmentOwnership(recordId, farmId);
  if (!valid) { res.status(404).json({ error: "Equipment not found" }); return; }
  const [record] = await db.insert(equipmentMaintenanceLogsTable).values({ ...req.body, equipmentId: recordId }).returning();
  res.status(201).json({ record });
});

router.get("/farms/:farmId/equipment/:recordId/calibrations", requireAuth, requireTenant, requireModuleByKey("equipment-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const valid = await validateEquipmentOwnership(recordId, farmId);
  if (!valid) { res.status(404).json({ error: "Equipment not found" }); return; }
  const records = await db.select().from(equipmentCalibrationRecordsTable).where(eq(equipmentCalibrationRecordsTable.equipmentId, recordId)).orderBy(desc(equipmentCalibrationRecordsTable.calibrationDate));
  res.json({ records });
});

router.post("/farms/:farmId/equipment/:recordId/calibrations", requireAuth, requireTenant, requireModuleByKey("equipment-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const valid = await validateEquipmentOwnership(recordId, farmId);
  if (!valid) { res.status(404).json({ error: "Equipment not found" }); return; }
  const [record] = await db.insert(equipmentCalibrationRecordsTable).values({ ...req.body, equipmentId: recordId }).returning();
  res.status(201).json({ record });
});

// ─── Livestock Herds ───────────────────────────────
router.get("/farms/:farmId/herds", requireAuth, requireTenant, requireModuleByKey("livestock-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(herdFlockRegisterTable).where(eq(herdFlockRegisterTable.farmId, farmId)).orderBy(desc(herdFlockRegisterTable.createdAt));
  res.json({ records });
});

router.post("/farms/:farmId/herds", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(herdFlockRegisterTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/herds/:recordId", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(herdFlockRegisterTable).set(req.body).where(and(eq(herdFlockRegisterTable.id, recordId), eq(herdFlockRegisterTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/herds/:recordId", requireAuth, requireTenant, requireModuleByKey("livestock-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.update(herdFlockRegisterTable).set({ isActive: false }).where(and(eq(herdFlockRegisterTable.id, recordId), eq(herdFlockRegisterTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Livestock Animals ─────────────────────────────
router.get("/farms/:farmId/animals", requireAuth, requireTenant, requireModuleByKey("livestock-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(livestockAnimalsTable).where(eq(livestockAnimalsTable.farmId, farmId)).orderBy(desc(livestockAnimalsTable.createdAt));
  res.json({ records });
});

router.get("/farms/:farmId/animals/by-code/:animalCode", requireAuth, requireTenant, requireModuleByKey("livestock-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const { animalCode } = req.params;
  const [record] = await db.select().from(livestockAnimalsTable).where(and(eq(livestockAnimalsTable.farmId, farmId), eq(livestockAnimalsTable.animalCode, animalCode)));
  if (!record) { res.status(404).json({ error: "No animal found for this code" }); return; }
  res.json(record);
});

router.post("/farms/:farmId/animals", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(livestockAnimalsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/animals/:recordId", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(livestockAnimalsTable).set(req.body).where(and(eq(livestockAnimalsTable.id, recordId), eq(livestockAnimalsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/animals/:recordId", requireAuth, requireTenant, requireModuleByKey("livestock-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.update(livestockAnimalsTable).set({ status: "removed" }).where(and(eq(livestockAnimalsTable.id, recordId), eq(livestockAnimalsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Livestock Movements ───────────────────────────
router.get("/farms/:farmId/movements", requireAuth, requireTenant, requireModuleByKey("livestock-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(livestockMovementsTable).where(eq(livestockMovementsTable.farmId, farmId)).orderBy(desc(livestockMovementsTable.movementDate));
  res.json({ records });
});

router.post("/farms/:farmId/movements", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(livestockMovementsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

// ─── Livestock Medicine ────────────────────────────
router.get("/farms/:farmId/medicine-records", requireAuth, requireTenant, requireModuleByKey("livestock-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(livestockMedicineRecordsTable).where(eq(livestockMedicineRecordsTable.farmId, farmId)).orderBy(desc(livestockMedicineRecordsTable.administeredDate));
  res.json({ records });
});

router.post("/farms/:farmId/medicine-records", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const year = new Date().getFullYear();
  const [countRow] = await db.select({ count: db.$count(livestockMedicineRecordsTable.id) }).from(livestockMedicineRecordsTable).where(and(eq(livestockMedicineRecordsTable.farmId, farmId)));
  const seq = (Number(countRow?.count ?? 0) + 1).toString().padStart(4, "0");
  const medicineRef = req.body.medicineRef || `MED-${year}-${seq}`;
  const administeredDate = req.body.administeredDate ? new Date(req.body.administeredDate) : new Date();
  const [record] = await db.insert(livestockMedicineRecordsTable).values({ ...req.body, farmId, medicineRef, administeredDate }).returning();
  res.status(201).json({ record });
});

// ─── Livestock Feed ────────────────────────────────
router.get("/farms/:farmId/feed-records", requireAuth, requireTenant, requireModuleByKey("livestock-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(livestockFeedRecordsTable).where(eq(livestockFeedRecordsTable.farmId, farmId)).orderBy(desc(livestockFeedRecordsTable.feedDate));
  res.json({ records });
});

router.post("/farms/:farmId/feed-records", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(livestockFeedRecordsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

// ─── Livestock Water ───────────────────────────────
router.get("/farms/:farmId/water-records", requireAuth, requireTenant, requireModuleByKey("livestock-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(livestockWaterRecordsTable).where(eq(livestockWaterRecordsTable.farmId, farmId)).orderBy(desc(livestockWaterRecordsTable.createdAt));
  res.json({ records });
});

router.post("/farms/:farmId/water-records", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(livestockWaterRecordsTable).values({ ...req.body, farmId }).returning();
  if (req.body.testPass === false || req.body.testPass === "false") {
    try {
      const [farm] = await db.select({ tenantId: farmsTable.tenantId }).from(farmsTable).where(eq(farmsTable.id, farmId)).limit(1);
      if (farm) {
        await createWaterFailureNotification({
          tenantId: farm.tenantId,
          farmId,
          recordId: record.id,
          herdName: req.body.herdName || "Unknown herd",
          waterSource: req.body.waterSource || "Unknown source",
          testResult: req.body.testResult || "fail",
        });
      }
    } catch (err) {
      console.error("[WATER] Failed to create water failure notification:", err);
    }
  }
  res.status(201).json({ record });
});

// ─── Water Record Lab Certificate Attachments ──────
router.get("/farms/:farmId/water-records/:recordId/attachments", requireAuth, requireTenant, requireModuleByKey("livestock-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const docs = await db.select().from(documentRecordsTable).where(
    and(
      eq(documentRecordsTable.farmId, farmId),
      eq(documentRecordsTable.linkedRecordType, "water_quality"),
      eq(documentRecordsTable.linkedRecordId, recordId),
    )
  ).orderBy(desc(documentRecordsTable.createdAt));
  res.json({ attachments: docs });
});

router.post("/farms/:farmId/water-records/:recordId/attachments", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const { title, filePath, mimeType, fileSize, referenceNumber, notes } = req.body as { title: string; filePath: string; mimeType?: string; fileSize?: number; referenceNumber?: string; notes?: string };
  if (!title || !filePath) { res.status(400).json({ error: "title and filePath are required" }); return; }
  const [doc] = await db.insert(documentRecordsTable).values({
    farmId,
    title,
    documentType: "lab_certificate",
    linkedRecordType: "water_quality",
    linkedRecordId: recordId,
    referenceNumber: referenceNumber || null,
    filePath,
    mimeType,
    fileSize,
    notes: notes || null,
  }).returning();
  res.status(201).json({ attachment: doc });
});

router.delete("/farms/:farmId/water-records/:recordId/attachments/:docId", requireAuth, requireTenant, requireModuleByKey("livestock-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const docId = parseInt(req.params.docId, 10);
  if (isNaN(docId)) { res.status(400).json({ error: "Invalid document ID" }); return; }
  await db.delete(documentRecordsTable).where(
    and(
      eq(documentRecordsTable.id, docId),
      eq(documentRecordsTable.farmId, farmId),
      eq(documentRecordsTable.linkedRecordType, "water_quality"),
    )
  );
  res.json({ success: true });
});

// ─── Visitor Log ───────────────────────────────────
router.get("/farms/:farmId/visitors", requireAuth, requireTenant, requireModuleByKey("biosecurity", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(visitorContractorLogTable).where(eq(visitorContractorLogTable.farmId, farmId)).orderBy(desc(visitorContractorLogTable.arrivalTime));
  res.json({ records });
});

router.post("/farms/:farmId/visitors", requireAuth, requireTenant, requireModuleByKey("biosecurity", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(visitorContractorLogTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/visitors/:recordId", requireAuth, requireTenant, requireModuleByKey("biosecurity", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(visitorContractorLogTable).set(req.body).where(and(eq(visitorContractorLogTable.id, recordId), eq(visitorContractorLogTable.farmId, farmId))).returning();
  res.json({ record });
});

// ─── Pest Control ─────────────────────────────────
router.get("/farms/:farmId/pest-control", requireAuth, requireTenant, requireModuleByKey("biosecurity", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(pestControlRecordsTable).where(eq(pestControlRecordsTable.farmId, farmId)).orderBy(desc(pestControlRecordsTable.treatmentDate));
  res.json({ records });
});

router.post("/farms/:farmId/pest-control", requireAuth, requireTenant, requireModuleByKey("biosecurity", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(pestControlRecordsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

// ─── Cleaning & Disinfection ───────────────────────
router.get("/farms/:farmId/cleaning", requireAuth, requireTenant, requireModuleByKey("biosecurity", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(cleaningDisinfectionRecordsTable).where(eq(cleaningDisinfectionRecordsTable.farmId, farmId)).orderBy(desc(cleaningDisinfectionRecordsTable.cleanedDate));
  res.json({ records });
});

router.post("/farms/:farmId/cleaning", requireAuth, requireTenant, requireModuleByKey("biosecurity", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(cleaningDisinfectionRecordsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

// ─── Farm Locations ───────────────────────────────
router.get("/farms/:farmId/farm-locations", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const locations = await db.select().from(farmLocationsTable).where(eq(farmLocationsTable.farmId, farmId)).orderBy(farmLocationsTable.name);
  res.json(locations);
});

router.post("/farms/:farmId/farm-locations", requireAuth, requireTenant, requireModuleByKey("biosecurity", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const { name, locationType, description, notes, isActive, latitude, longitude } = req.body;
  const [location] = await db.insert(farmLocationsTable).values({
    farmId,
    name,
    locationType,
    description: description || null,
    notes: notes || null,
    isActive: isActive !== false,
    latitude: latitude != null ? Number(latitude) : null,
    longitude: longitude != null ? Number(longitude) : null,
  }).returning();
  res.status(201).json(location);
});

router.put("/farms/:farmId/farm-locations/:locationId", requireAuth, requireTenant, requireModuleByKey("biosecurity", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const locationId = parseInt(req.params.locationId);
  const { name, locationType, description, notes, isActive, latitude, longitude } = req.body;
  const [location] = await db.update(farmLocationsTable)
    .set({
      name,
      locationType,
      description: description || null,
      notes: notes || null,
      isActive: isActive !== false,
      latitude: latitude != null ? Number(latitude) : null,
      longitude: longitude != null ? Number(longitude) : null,
    })
    .where(and(eq(farmLocationsTable.id, locationId), eq(farmLocationsTable.farmId, farmId)))
    .returning();
  if (!location) { res.status(404).json({ error: "Not found" }); return; }
  res.json(location);
});

router.delete("/farms/:farmId/farm-locations/:locationId", requireAuth, requireTenant, requireModuleByKey("biosecurity", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const locationId = parseInt(req.params.locationId);
  await db.delete(farmLocationsTable).where(and(eq(farmLocationsTable.id, locationId), eq(farmLocationsTable.farmId, farmId)));
  res.status(204).end();
});

// ─── Staff Training ───────────────────────────────
router.get("/farms/:farmId/training", requireAuth, requireTenant, requireModuleByKey("staff-training", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(staffTrainingRecordsTable).where(eq(staffTrainingRecordsTable.farmId, farmId)).orderBy(desc(staffTrainingRecordsTable.trainingDate));
  res.json({ records });
});

router.post("/farms/:farmId/training", requireAuth, requireTenant, requireModuleByKey("staff-training", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(staffTrainingRecordsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

// ─── Staff Certificates ───────────────────────────
router.get("/farms/:farmId/certificates", requireAuth, requireTenant, requireModuleByKey("staff-training", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(staffCertificatesTable).where(eq(staffCertificatesTable.farmId, farmId)).orderBy(desc(staffCertificatesTable.issueDate));
  res.json({ records });
});

router.post("/farms/:farmId/certificates", requireAuth, requireTenant, requireModuleByKey("staff-training", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(staffCertificatesTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/certificates/:recordId", requireAuth, requireTenant, requireModuleByKey("staff-training", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(staffCertificatesTable).set(req.body).where(and(eq(staffCertificatesTable.id, recordId), eq(staffCertificatesTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/certificates/:recordId", requireAuth, requireTenant, requireModuleByKey("staff-training", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(staffCertificatesTable).where(and(eq(staffCertificatesTable.id, recordId), eq(staffCertificatesTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Right to Work ──────────────────────────────────
router.get("/farms/:farmId/right-to-work", requireAuth, requireTenant, requireModuleByKey("staff-training", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(staffRightToWorkTable).where(eq(staffRightToWorkTable.farmId, farmId)).orderBy(desc(staffRightToWorkTable.checkDate));
  res.json({ records });
});

router.post("/farms/:farmId/right-to-work", requireAuth, requireTenant, requireModuleByKey("staff-training", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(staffRightToWorkTable).values({ ...req.body, farmId }).returning();
  res.json({ record });
});

router.put("/farms/:farmId/right-to-work/:recordId", requireAuth, requireTenant, requireModuleByKey("staff-training", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(staffRightToWorkTable).set(req.body).where(and(eq(staffRightToWorkTable.id, recordId), eq(staffRightToWorkTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/right-to-work/:recordId", requireAuth, requireTenant, requireModuleByKey("staff-training", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(staffRightToWorkTable).where(and(eq(staffRightToWorkTable.id, recordId), eq(staffRightToWorkTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── RTW Document Attachments ──────────────────────
router.get("/farms/:farmId/right-to-work/:recordId/documents", requireAuth, requireTenant, requireModuleByKey("staff-training", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const documents = await db.select().from(staffRtwDocumentsTable).where(and(eq(staffRtwDocumentsTable.rtwId, recordId), eq(staffRtwDocumentsTable.farmId, farmId))).orderBy(staffRtwDocumentsTable.uploadedAt);
  res.json({ documents });
});

router.post("/farms/:farmId/right-to-work/:recordId/documents", requireAuth, requireTenant, requireModuleByKey("staff-training", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const { fileName, objectPath } = req.body;
  if (!fileName || !objectPath) { res.status(400).json({ error: "fileName and objectPath are required" }); return; }
  const [doc] = await db.insert(staffRtwDocumentsTable).values({ rtwId: recordId, farmId, fileName, objectPath }).returning();
  res.status(201).json({ document: doc });
});

router.delete("/farms/:farmId/right-to-work/:recordId/documents/:docId", requireAuth, requireTenant, requireModuleByKey("staff-training", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  const docId = parseInt(req.params.docId, 10);
  if (!recordId || isNaN(docId)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(staffRtwDocumentsTable).where(and(eq(staffRtwDocumentsTable.id, docId), eq(staffRtwDocumentsTable.rtwId, recordId), eq(staffRtwDocumentsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Certificate Document Attachment ──────────────
router.patch("/farms/:farmId/certificates/:recordId/document", requireAuth, requireTenant, requireModuleByKey("staff-training", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const { documentPath, documentName } = req.body;
  if (!documentPath || !documentName) { res.status(400).json({ error: "documentPath and documentName are required" }); return; }
  const [record] = await db.update(staffCertificatesTable).set({ documentPath, documentName }).where(and(eq(staffCertificatesTable.id, recordId), eq(staffCertificatesTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/certificates/:recordId/document", requireAuth, requireTenant, requireModuleByKey("staff-training", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.update(staffCertificatesTable).set({ documentPath: null, documentName: null }).where(and(eq(staffCertificatesTable.id, recordId), eq(staffCertificatesTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Risk Assessments ──────────────────────────────
router.get("/farms/:farmId/risk-assessments", requireAuth, requireTenant, requireModuleByKey("risk-waste", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(riskAssessmentsTable).where(eq(riskAssessmentsTable.farmId, farmId)).orderBy(desc(riskAssessmentsTable.assessmentDate));
  res.json({ records });
});

router.post("/farms/:farmId/risk-assessments", requireAuth, requireTenant, requireModuleByKey("risk-waste", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(riskAssessmentsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });

  const riskLevel = record.riskLevel;
  if (riskLevel === "critical" || riskLevel === "high") {
    const [farm] = await db.select({ tenantId: farmsTable.tenantId }).from(farmsTable).where(eq(farmsTable.id, farmId)).limit(1);
    if (farm) {
      await createCriticalRiskNotification({
        tenantId: farm.tenantId,
        farmId,
        assessmentId: record.id,
        title: record.title,
        hazardDescription: record.hazardDescription,
        riskLevel,
        assessedBy: record.assessedBy ?? "",
      });
    }
  }
});

router.put("/farms/:farmId/risk-assessments/:recordId", requireAuth, requireTenant, requireModuleByKey("risk-waste", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(riskAssessmentsTable).set(req.body).where(and(eq(riskAssessmentsTable.id, recordId), eq(riskAssessmentsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/risk-assessments/:recordId", requireAuth, requireTenant, requireModuleByKey("risk-waste", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(riskAssessmentsTable).where(and(eq(riskAssessmentsTable.id, recordId), eq(riskAssessmentsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── COSHH ─────────────────────────────────────────
router.get("/farms/:farmId/coshh", requireAuth, requireTenant, requireModuleByKey("biosecurity", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(coshhRecordsTable).where(eq(coshhRecordsTable.farmId, farmId)).orderBy(desc(coshhRecordsTable.assessmentDate));
  res.json({ records });
});

router.post("/farms/:farmId/coshh", requireAuth, requireTenant, requireModuleByKey("biosecurity", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(coshhRecordsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/coshh/:recordId", requireAuth, requireTenant, requireModuleByKey("biosecurity", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(coshhRecordsTable).set(req.body).where(and(eq(coshhRecordsTable.id, recordId), eq(coshhRecordsTable.farmId, farmId))).returning();
  res.json({ record });
});

// ─── Waste Disposal ────────────────────────────────
router.get("/farms/:farmId/waste", requireAuth, requireTenant, requireModuleByKey("risk-waste", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(wasteDisposalRecordsTable).where(eq(wasteDisposalRecordsTable.farmId, farmId)).orderBy(desc(wasteDisposalRecordsTable.disposalDate));
  res.json({ records });
});

router.post("/farms/:farmId/waste", requireAuth, requireTenant, requireModuleByKey("risk-waste", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(wasteDisposalRecordsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

// ─── Inspections ───────────────────────────────────
router.get("/farms/:farmId/inspections", requireAuth, requireTenant, requireModuleByKey("inspections", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(inspectionRecordsTable).where(eq(inspectionRecordsTable.farmId, farmId)).orderBy(desc(inspectionRecordsTable.inspectionDate));
  res.json({ records });
});

router.post("/farms/:farmId/inspections", requireAuth, requireTenant, requireModuleByKey("inspections", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(inspectionRecordsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.get("/farms/:farmId/inspections/:recordId", requireAuth, requireTenant, requireModuleByKey("inspections", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [inspection] = await db.select().from(inspectionRecordsTable).where(and(eq(inspectionRecordsTable.id, recordId), eq(inspectionRecordsTable.farmId, farmId)));
  if (!inspection) { res.status(404).json({ error: "Not found" }); return; }
  const ncs = await db.select().from(nonconformanceRecordsTable).where(eq(nonconformanceRecordsTable.inspectionId, recordId));
  const ncIds = ncs.map((nc) => nc.id);
  let actions: typeof correctiveActionsTable.$inferSelect[] = [];
  if (ncIds.length > 0) {
    actions = await db.select().from(correctiveActionsTable);
    actions = actions.filter((a) => ncIds.includes(a.nonconformanceId));
  }
  res.json({ record: { ...inspection, nonconformances: ncs, correctiveActions: actions } });
});

router.put("/farms/:farmId/inspections/:recordId", requireAuth, requireTenant, requireModuleByKey("inspections", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(inspectionRecordsTable).set(req.body).where(and(eq(inspectionRecordsTable.id, recordId), eq(inspectionRecordsTable.farmId, farmId))).returning();
  res.json({ record });
});

// ─── Non-conformances ──────────────────────────────
router.get("/farms/:farmId/nonconformances", requireAuth, requireTenant, requireModuleByKey("inspections", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(nonconformanceRecordsTable).where(eq(nonconformanceRecordsTable.farmId, farmId)).orderBy(desc(nonconformanceRecordsTable.identifiedDate));
  res.json({ records });
});

router.post("/farms/:farmId/nonconformances", requireAuth, requireTenant, requireModuleByKey("inspections", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(nonconformanceRecordsTable).values({ ...req.body, farmId }).returning();
  createNonconformanceNotification({
    tenantId: req.tenantId!,
    farmId,
    ncId: record.id,
    description: record.description || "Unnamed issue",
  }).catch(() => {});
  res.status(201).json({ record });
});

router.put("/farms/:farmId/nonconformances/:recordId", requireAuth, requireTenant, requireModuleByKey("inspections", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(nonconformanceRecordsTable).set(req.body).where(and(eq(nonconformanceRecordsTable.id, recordId), eq(nonconformanceRecordsTable.farmId, farmId))).returning();
  res.json({ record });
});

// ─── Corrective Actions ────────────────────────────
async function validateCorrectiveActionOwnership(recordId: number, farmId: number): Promise<boolean> {
  const result = await db
    .select({ id: correctiveActionsTable.id })
    .from(correctiveActionsTable)
    .innerJoin(nonconformanceRecordsTable, eq(correctiveActionsTable.nonconformanceId, nonconformanceRecordsTable.id))
    .where(and(eq(correctiveActionsTable.id, recordId), eq(nonconformanceRecordsTable.farmId, farmId)))
    .limit(1);
  return result.length > 0;
}

router.get("/farms/:farmId/corrective-actions", requireAuth, requireTenant, requireModuleByKey("inspections", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db
    .select({
      id: correctiveActionsTable.id,
      nonconformanceId: correctiveActionsTable.nonconformanceId,
      description: correctiveActionsTable.description,
      assignedTo: correctiveActionsTable.assignedTo,
      dueDate: correctiveActionsTable.dueDate,
      completedDate: correctiveActionsTable.completedDate,
      verifiedBy: correctiveActionsTable.verifiedBy,
      status: correctiveActionsTable.status,
      notes: correctiveActionsTable.notes,
      createdAt: correctiveActionsTable.createdAt,
    })
    .from(correctiveActionsTable)
    .innerJoin(nonconformanceRecordsTable, eq(correctiveActionsTable.nonconformanceId, nonconformanceRecordsTable.id))
    .where(eq(nonconformanceRecordsTable.farmId, farmId))
    .orderBy(desc(correctiveActionsTable.createdAt));
  res.json({ records });
});

router.post("/farms/:farmId/corrective-actions", requireAuth, requireTenant, requireModuleByKey("inspections", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  if (req.body.nonconformanceId) {
    const [nc] = await db.select().from(nonconformanceRecordsTable).where(and(eq(nonconformanceRecordsTable.id, req.body.nonconformanceId), eq(nonconformanceRecordsTable.farmId, farmId))).limit(1);
    if (!nc) { res.status(400).json({ error: "Nonconformance not found on this farm" }); return; }
  }
  const [record] = await db.insert(correctiveActionsTable).values(req.body).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/corrective-actions/:recordId", requireAuth, requireTenant, requireModuleByKey("inspections", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const valid = await validateCorrectiveActionOwnership(recordId, farmId);
  if (!valid) { res.status(404).json({ error: "Not found" }); return; }
  if (req.body.nonconformanceId) {
    const [nc] = await db.select().from(nonconformanceRecordsTable).where(and(eq(nonconformanceRecordsTable.id, req.body.nonconformanceId), eq(nonconformanceRecordsTable.farmId, farmId))).limit(1);
    if (!nc) { res.status(400).json({ error: "Nonconformance not found on this farm" }); return; }
  }
  const { id, createdAt, ...updateData } = req.body;
  const [record] = await db.update(correctiveActionsTable).set(updateData).where(eq(correctiveActionsTable.id, recordId)).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/corrective-actions/:recordId", requireAuth, requireTenant, requireModuleByKey("inspections", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const valid = await validateCorrectiveActionOwnership(recordId, farmId);
  if (!valid) { res.status(404).json({ error: "Not found" }); return; }
  await db.delete(correctiveActionsTable).where(eq(correctiveActionsTable.id, recordId));
  res.json({ success: true });
});

// ─── Farm Assurance Certificates ─────────────────────
router.get("/farms/:farmId/assurance-certs", requireAuth, requireTenant, requireModuleByKey("inspections", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(farmAssuranceCertsTable).where(eq(farmAssuranceCertsTable.farmId, farmId)).orderBy(desc(farmAssuranceCertsTable.createdAt));
  res.json({ records });
});

router.post("/farms/:farmId/assurance-certs", requireAuth, requireTenant, requireModuleByKey("inspections", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(farmAssuranceCertsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/assurance-certs/:recordId", requireAuth, requireTenant, requireModuleByKey("inspections", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(farmAssuranceCertsTable).set(req.body).where(and(eq(farmAssuranceCertsTable.id, recordId), eq(farmAssuranceCertsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

router.delete("/farms/:farmId/assurance-certs/:recordId", requireAuth, requireTenant, requireModuleByKey("inspections", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(farmAssuranceCertsTable).where(and(eq(farmAssuranceCertsTable.id, recordId), eq(farmAssuranceCertsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── COSHH (via risk-waste module key) ─────────────────
router.get("/farms/:farmId/risk-coshh", requireAuth, requireTenant, requireModuleByKey("risk-waste", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(coshhRecordsTable).where(eq(coshhRecordsTable.farmId, farmId)).orderBy(desc(coshhRecordsTable.assessmentDate));
  res.json({ records });
});

router.post("/farms/:farmId/risk-coshh", requireAuth, requireTenant, requireModuleByKey("risk-waste", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(coshhRecordsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/risk-coshh/:recordId", requireAuth, requireTenant, requireModuleByKey("risk-waste", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(coshhRecordsTable).set(req.body).where(and(eq(coshhRecordsTable.id, recordId), eq(coshhRecordsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

router.delete("/farms/:farmId/risk-coshh/:recordId", requireAuth, requireTenant, requireModuleByKey("risk-waste", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(coshhRecordsTable).where(and(eq(coshhRecordsTable.id, recordId), eq(coshhRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Environmental Features ────────────────────────
router.get("/farms/:farmId/environmental-features", requireAuth, requireTenant, requireModuleByKey("environmental", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(environmentalFeaturesTable).where(eq(environmentalFeaturesTable.farmId, farmId)).orderBy(desc(environmentalFeaturesTable.dateRecorded));
  res.json({ records });
});

router.post("/farms/:farmId/environmental-features", requireAuth, requireTenant, requireModuleByKey("environmental", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(environmentalFeaturesTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/environmental-features/:recordId", requireAuth, requireTenant, requireModuleByKey("environmental", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(environmentalFeaturesTable).set(req.body).where(and(eq(environmentalFeaturesTable.id, recordId), eq(environmentalFeaturesTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/environmental-features/:recordId", requireAuth, requireTenant, requireModuleByKey("environmental", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(environmentalFeaturesTable).where(and(eq(environmentalFeaturesTable.id, recordId), eq(environmentalFeaturesTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Agri-Environment Schemes ──────────────────────
router.get("/farms/:farmId/agri-schemes", requireAuth, requireTenant, requireModuleByKey("environmental", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(agriEnvironmentSchemeRecordsTable).where(eq(agriEnvironmentSchemeRecordsTable.farmId, farmId)).orderBy(desc(agriEnvironmentSchemeRecordsTable.startDate));
  res.json({ records });
});

router.post("/farms/:farmId/agri-schemes", requireAuth, requireTenant, requireModuleByKey("environmental", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(agriEnvironmentSchemeRecordsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/agri-schemes/:recordId", requireAuth, requireTenant, requireModuleByKey("environmental", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(agriEnvironmentSchemeRecordsTable).set(req.body).where(and(eq(agriEnvironmentSchemeRecordsTable.id, recordId), eq(agriEnvironmentSchemeRecordsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/agri-schemes/:recordId", requireAuth, requireTenant, requireModuleByKey("environmental", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(agriEnvironmentSchemeRecordsTable).where(and(eq(agriEnvironmentSchemeRecordsTable.id, recordId), eq(agriEnvironmentSchemeRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Environmental Assessments ─────────────────────
router.get("/farms/:farmId/environmental-assessments", requireAuth, requireTenant, requireModuleByKey("environmental", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(environmentalAssessmentsTable).where(eq(environmentalAssessmentsTable.farmId, farmId)).orderBy(desc(environmentalAssessmentsTable.assessmentDate));
  res.json({ records });
});

router.post("/farms/:farmId/environmental-assessments", requireAuth, requireTenant, requireModuleByKey("environmental", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(environmentalAssessmentsTable).values({ ...req.body, farmId }).returning();
  res.json({ record });
});

router.put("/farms/:farmId/environmental-assessments/:recordId", requireAuth, requireTenant, requireModuleByKey("environmental", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(environmentalAssessmentsTable).set(req.body).where(and(eq(environmentalAssessmentsTable.id, recordId), eq(environmentalAssessmentsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/environmental-assessments/:recordId", requireAuth, requireTenant, requireModuleByKey("environmental", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(environmentalAssessmentsTable).where(and(eq(environmentalAssessmentsTable.id, recordId), eq(environmentalAssessmentsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Environmental Management Events ───────────────
router.get("/farms/:farmId/environmental-management-events", requireAuth, requireTenant, requireModuleByKey("environmental", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(environmentalManagementEventsTable).where(eq(environmentalManagementEventsTable.farmId, farmId)).orderBy(desc(environmentalManagementEventsTable.eventDate));
  res.json({ records });
});

router.post("/farms/:farmId/environmental-management-events", requireAuth, requireTenant, requireModuleByKey("environmental", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(environmentalManagementEventsTable).values({ ...req.body, farmId }).returning();
  res.json({ record });
});

router.put("/farms/:farmId/environmental-management-events/:recordId", requireAuth, requireTenant, requireModuleByKey("environmental", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(environmentalManagementEventsTable).set(req.body).where(and(eq(environmentalManagementEventsTable.id, recordId), eq(environmentalManagementEventsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/environmental-management-events/:recordId", requireAuth, requireTenant, requireModuleByKey("environmental", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(environmentalManagementEventsTable).where(and(eq(environmentalManagementEventsTable.id, recordId), eq(environmentalManagementEventsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Haulage ───────────────────────────────────────
router.get("/farms/:farmId/haulage", requireAuth, requireTenant, requireModuleByKey("haulage-transport", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(haulageRecordsTable).where(eq(haulageRecordsTable.farmId, farmId)).orderBy(desc(haulageRecordsTable.departureDate));
  res.json({ records });
});

router.post("/farms/:farmId/haulage", requireAuth, requireTenant, requireModuleByKey("haulage-transport", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(haulageRecordsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/haulage/:recordId", requireAuth, requireTenant, requireModuleByKey("haulage-transport", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(haulageRecordsTable).set(req.body).where(and(eq(haulageRecordsTable.id, recordId), eq(haulageRecordsTable.farmId, farmId))).returning();
  res.json({ record });
});

// ─── Suppliers ─────────────────────────────────────
router.get("/farms/:farmId/suppliers", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(suppliersTable).where(eq(suppliersTable.farmId, farmId)).orderBy(desc(suppliersTable.createdAt));
  res.json({ records });
});

router.post("/farms/:farmId/suppliers", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(suppliersTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/suppliers/:recordId", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(suppliersTable).set(req.body).where(and(eq(suppliersTable.id, recordId), eq(suppliersTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/suppliers/:recordId", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.update(suppliersTable).set({ isActive: false }).where(and(eq(suppliersTable.id, recordId), eq(suppliersTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Labs ─────────────────────────────────────────────────────────────────────
// Labs are a category of supplier ("laboratory") — accessible to all modules that use lab testing.
router.get("/farms/:farmId/labs", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(suppliersTable)
    .where(and(eq(suppliersTable.farmId, farmId), eq(suppliersTable.category, "laboratory")))
    .orderBy(suppliersTable.name);
  res.json({ records });
});

router.post("/farms/:farmId/labs", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const { name, contactName, email, phone, address, ukasAccreditationNumber, notes } = req.body;
  if (!name) { res.status(400).json({ error: "name required" }); return; }
  const [record] = await db.insert(suppliersTable).values({
    farmId, name, contactName, email, phone, address, notes,
    category: "laboratory",
    accountNumber: ukasAccreditationNumber ?? null,
    isApproved: true,
  }).returning();
  res.status(201).json({ record });
});

// ─── Stock Items ────────────────────────────────────
router.get("/farms/:farmId/stock-items", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const supplierAlias = suppliersTable;
  const records = await db.select({
    id: stockItemsTable.id,
    farmId: stockItemsTable.farmId,
    name: stockItemsTable.name,
    category: stockItemsTable.category,
    productCode: stockItemsTable.productCode,
    mappNumber: stockItemsTable.mappNumber,
    unit: stockItemsTable.unit,
    reorderLevel: stockItemsTable.reorderLevel,
    storageLocation: stockItemsTable.storageLocation,
    defaultSupplierId: stockItemsTable.defaultSupplierId,
    defaultSupplierName: supplierAlias.name,
    notes: stockItemsTable.notes,
    isActive: stockItemsTable.isActive,
    createdAt: stockItemsTable.createdAt,
  }).from(stockItemsTable)
    .leftJoin(supplierAlias, eq(stockItemsTable.defaultSupplierId, supplierAlias.id))
    .where(eq(stockItemsTable.farmId, farmId))
    .orderBy(stockItemsTable.name);
  res.json({ records });
});

router.post("/farms/:farmId/stock-items", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(stockItemsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

// ─── Stock Deliveries ──────────────────────────────
router.get("/farms/:farmId/stock-deliveries", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select({
    id: stockDeliveriesTable.id,
    farmId: stockDeliveriesTable.farmId,
    supplierId: stockDeliveriesTable.supplierId,
    supplierName: suppliersTable.name,
    stockItemId: stockDeliveriesTable.stockItemId,
    stockItemName: stockItemsTable.name,
    stockItemUnit: stockItemsTable.unit,
    poId: stockDeliveriesTable.poId,
    poNumber: purchaseOrdersTable.poNumber,
    grnNumber: stockDeliveriesTable.grnNumber,
    deliveryDate: stockDeliveriesTable.deliveryDate,
    quantity: stockDeliveriesTable.quantity,
    batchNumber: stockDeliveriesTable.batchNumber,
    lotNumber: stockDeliveriesTable.lotNumber,
    expiryDate: stockDeliveriesTable.expiryDate,
    costPence: stockDeliveriesTable.costPence,
    invoiceReference: stockDeliveriesTable.invoiceReference,
    receivedBy: stockDeliveriesTable.receivedBy,
    notes: stockDeliveriesTable.notes,
    createdAt: stockDeliveriesTable.createdAt,
    financialTransactionId: financialTransactionsTable.id,
  }).from(stockDeliveriesTable)
    .leftJoin(suppliersTable, eq(stockDeliveriesTable.supplierId, suppliersTable.id))
    .leftJoin(stockItemsTable, eq(stockDeliveriesTable.stockItemId, stockItemsTable.id))
    .leftJoin(purchaseOrdersTable, eq(stockDeliveriesTable.poId, purchaseOrdersTable.id))
    .leftJoin(financialTransactionsTable, eq(financialTransactionsTable.stockDeliveryId, stockDeliveriesTable.id))
    .where(eq(stockDeliveriesTable.farmId, farmId))
    .orderBy(desc(stockDeliveriesTable.deliveryDate));
  res.json({ records });
});

router.post("/farms/:farmId/stock-deliveries", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;

  const year = new Date().getFullYear();
  const [countRow] = await db.select({ count: sql<number>`count(*)` }).from(stockDeliveriesTable).where(eq(stockDeliveriesTable.farmId, farmId));
  const grnSeq = (Number(countRow?.count ?? 0) + 1).toString().padStart(4, "0");
  const grnNumber = `GRN-${year}-${grnSeq}`;

  const { poId, lotNumber, ...rest } = req.body;
  const [record] = await db.insert(stockDeliveriesTable).values({
    ...rest,
    farmId,
    grnNumber,
    poId: poId ? Number(poId) : null,
    lotNumber: lotNumber || null,
  }).returning();

  if (record.stockItemId && record.quantity) {
    const qtyIn = parseFloat(record.quantity);
    if (!isNaN(qtyIn) && qtyIn > 0) {
      await db.insert(stockMovementsTable).values({
        farmId,
        stockItemId: record.stockItemId,
        movementType: "received",
        quantityChange: String(qtyIn),
        referenceType: "delivery",
        referenceId: record.id,
        deliveryId: record.id,
        performedBy: record.receivedBy || null,
        notes: `${grnNumber}${record.batchNumber ? ` — batch ${record.batchNumber}` : ""}${record.lotNumber ? `, lot ${record.lotNumber}` : ""}${record.invoiceReference ? `, invoice ${record.invoiceReference}` : ""}`,
      });
      const [existing] = await db.select().from(stockLevelsTable).where(and(eq(stockLevelsTable.farmId, farmId), eq(stockLevelsTable.stockItemId, record.stockItemId))).limit(1);
      if (existing) {
        await db.update(stockLevelsTable).set({ currentQuantity: String(parseFloat(existing.currentQuantity) + qtyIn), lastUpdated: new Date() }).where(eq(stockLevelsTable.id, existing.id));
      } else {
        await db.insert(stockLevelsTable).values({ farmId, stockItemId: record.stockItemId, currentQuantity: String(qtyIn) });
      }
    }
  }

  if (record.poId && record.stockItemId && record.quantity) {
    const qtyIn = parseFloat(record.quantity);
    if (!isNaN(qtyIn) && qtyIn > 0) {
      const lines = await db.select().from(purchaseOrderLinesTable).where(and(eq(purchaseOrderLinesTable.poId, record.poId), eq(purchaseOrderLinesTable.stockItemId, record.stockItemId)));
      for (const line of lines) {
        const newQtyReceived = parseFloat(line.quantityReceived) + qtyIn;
        await db.update(purchaseOrderLinesTable).set({ quantityReceived: String(newQtyReceived) }).where(eq(purchaseOrderLinesTable.id, line.id));
      }
      const allLines = await db.select().from(purchaseOrderLinesTable).where(eq(purchaseOrderLinesTable.poId, record.poId));
      const fullyReceived = allLines.every(l => parseFloat(l.quantityReceived) >= parseFloat(l.quantityOrdered));
      const partiallyReceived = allLines.some(l => parseFloat(l.quantityReceived) > 0);
      const newStatus = fullyReceived ? "fully_received" : partiallyReceived ? "partially_received" : "sent";
      await db.update(purchaseOrdersTable).set({ status: newStatus }).where(eq(purchaseOrdersTable.id, record.poId));
    }
  }

  res.status(201).json({ record });
});

// ─── Purchase Orders ────────────────────────────────
router.get("/farms/:farmId/purchase-orders", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const pos = await db.select({
    id: purchaseOrdersTable.id,
    poNumber: purchaseOrdersTable.poNumber,
    supplierId: purchaseOrdersTable.supplierId,
    supplierName: suppliersTable.name,
    orderDate: purchaseOrdersTable.orderDate,
    expectedDeliveryDate: purchaseOrdersTable.expectedDeliveryDate,
    status: purchaseOrdersTable.status,
    notes: purchaseOrdersTable.notes,
    createdAt: purchaseOrdersTable.createdAt,
  }).from(purchaseOrdersTable)
    .leftJoin(suppliersTable, eq(purchaseOrdersTable.supplierId, suppliersTable.id))
    .where(eq(purchaseOrdersTable.farmId, farmId))
    .orderBy(desc(purchaseOrdersTable.createdAt));

  const lineAgg = await db.select({
    poId: purchaseOrderLinesTable.poId,
    lineCount: sql<number>`count(*)`,
    totalPence: sql<number>`sum(${purchaseOrderLinesTable.unitPricePence} * ${purchaseOrderLinesTable.quantityOrdered})`,
  }).from(purchaseOrderLinesTable)
    .innerJoin(purchaseOrdersTable, eq(purchaseOrderLinesTable.poId, purchaseOrdersTable.id))
    .where(eq(purchaseOrdersTable.farmId, farmId))
    .groupBy(purchaseOrderLinesTable.poId);

  const aggMap = Object.fromEntries(lineAgg.map(r => [r.poId, r]));
  const records = pos.map(po => ({ ...po, lineCount: aggMap[po.id]?.lineCount ?? 0, totalPence: aggMap[po.id]?.totalPence ?? null }));
  res.json({ records });
});

router.post("/farms/:farmId/purchase-orders", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const year = new Date().getFullYear();
  const [countRow] = await db.select({ count: sql<number>`count(*)` }).from(purchaseOrdersTable).where(eq(purchaseOrdersTable.farmId, farmId));
  const seq = (Number(countRow?.count ?? 0) + 1).toString().padStart(4, "0");
  const poNumber = `PO-${year}-${seq}`;
  const { lines, ...poBody } = req.body;
  const [po] = await db.insert(purchaseOrdersTable).values({ ...poBody, farmId, poNumber, status: poBody.status || "draft" }).returning();
  if (lines && Array.isArray(lines) && lines.length > 0) {
    await db.insert(purchaseOrderLinesTable).values(lines.map((l: any) => ({ poId: po.id, stockItemId: Number(l.stockItemId), quantityOrdered: String(l.quantityOrdered), unitPricePence: l.unitPricePence ? Number(l.unitPricePence) : null, notes: l.notes || null })));
  }
  res.status(201).json({ record: po });
});

router.get("/farms/:farmId/purchase-orders/:poId", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const poId = Number(req.params.poId);
  if (!poId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [po] = await db.select({
    id: purchaseOrdersTable.id,
    poNumber: purchaseOrdersTable.poNumber,
    supplierId: purchaseOrdersTable.supplierId,
    supplierName: suppliersTable.name,
    orderDate: purchaseOrdersTable.orderDate,
    expectedDeliveryDate: purchaseOrdersTable.expectedDeliveryDate,
    status: purchaseOrdersTable.status,
    notes: purchaseOrdersTable.notes,
    createdAt: purchaseOrdersTable.createdAt,
  }).from(purchaseOrdersTable)
    .leftJoin(suppliersTable, eq(purchaseOrdersTable.supplierId, suppliersTable.id))
    .where(and(eq(purchaseOrdersTable.id, poId), eq(purchaseOrdersTable.farmId, farmId)));
  if (!po) { res.status(404).json({ error: "Not found" }); return; }
  const lines = await db.select({
    id: purchaseOrderLinesTable.id,
    stockItemId: purchaseOrderLinesTable.stockItemId,
    stockItemName: stockItemsTable.name,
    stockItemUnit: stockItemsTable.unit,
    quantityOrdered: purchaseOrderLinesTable.quantityOrdered,
    quantityReceived: purchaseOrderLinesTable.quantityReceived,
    unitPricePence: purchaseOrderLinesTable.unitPricePence,
    notes: purchaseOrderLinesTable.notes,
  }).from(purchaseOrderLinesTable)
    .leftJoin(stockItemsTable, eq(purchaseOrderLinesTable.stockItemId, stockItemsTable.id))
    .where(eq(purchaseOrderLinesTable.poId, poId));
  const grns = await db.select({
    id: stockDeliveriesTable.id,
    grnNumber: stockDeliveriesTable.grnNumber,
    deliveryDate: stockDeliveriesTable.deliveryDate,
    stockItemName: stockItemsTable.name,
    quantity: stockDeliveriesTable.quantity,
    stockItemUnit: stockItemsTable.unit,
    batchNumber: stockDeliveriesTable.batchNumber,
    lotNumber: stockDeliveriesTable.lotNumber,
    invoiceReference: stockDeliveriesTable.invoiceReference,
  }).from(stockDeliveriesTable)
    .leftJoin(stockItemsTable, eq(stockDeliveriesTable.stockItemId, stockItemsTable.id))
    .where(eq(stockDeliveriesTable.poId, poId))
    .orderBy(desc(stockDeliveriesTable.deliveryDate));
  res.json({ record: po, lines, grns });
});

router.put("/farms/:farmId/purchase-orders/:poId", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const poId = Number(req.params.poId);
  if (!poId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const { lines, ...poBody } = req.body;
  const [po] = await db.update(purchaseOrdersTable).set(poBody).where(and(eq(purchaseOrdersTable.id, poId), eq(purchaseOrdersTable.farmId, farmId))).returning();
  res.json({ record: po });
});

router.delete("/farms/:farmId/purchase-orders/:poId", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const poId = Number(req.params.poId);
  if (!poId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(purchaseOrdersTable).where(and(eq(purchaseOrdersTable.id, poId), eq(purchaseOrdersTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/purchase-orders/:poId/lines", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const poId = Number(req.params.poId);
  if (!poId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const lines = await db.select({
    id: purchaseOrderLinesTable.id,
    stockItemId: purchaseOrderLinesTable.stockItemId,
    stockItemName: stockItemsTable.name,
    stockItemUnit: stockItemsTable.unit,
    quantityOrdered: purchaseOrderLinesTable.quantityOrdered,
    quantityReceived: purchaseOrderLinesTable.quantityReceived,
    unitPricePence: purchaseOrderLinesTable.unitPricePence,
    notes: purchaseOrderLinesTable.notes,
  }).from(purchaseOrderLinesTable)
    .leftJoin(stockItemsTable, eq(purchaseOrderLinesTable.stockItemId, stockItemsTable.id))
    .where(eq(purchaseOrderLinesTable.poId, poId));
  res.json({ records: lines });
});

router.post("/farms/:farmId/purchase-orders/:poId/lines", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const poId = Number(req.params.poId);
  if (!poId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [po] = await db.select().from(purchaseOrdersTable).where(and(eq(purchaseOrdersTable.id, poId), eq(purchaseOrdersTable.farmId, farmId)));
  if (!po) { res.status(404).json({ error: "PO not found" }); return; }
  const { stockItemId, quantityOrdered, unitPricePence, notes } = req.body;
  const [line] = await db.insert(purchaseOrderLinesTable).values({ poId, stockItemId: Number(stockItemId), quantityOrdered: String(quantityOrdered), unitPricePence: unitPricePence ? Number(unitPricePence) : null, notes: notes || null }).returning();
  res.status(201).json({ record: line });
});

router.put("/farms/:farmId/purchase-orders/:poId/lines/:lineId", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const poId = Number(req.params.poId);
  const lineId = Number(req.params.lineId);
  if (!poId || !lineId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [po] = await db.select().from(purchaseOrdersTable).where(and(eq(purchaseOrdersTable.id, poId), eq(purchaseOrdersTable.farmId, farmId)));
  if (!po) { res.status(404).json({ error: "PO not found" }); return; }
  const { stockItemId, quantityOrdered, unitPricePence, notes } = req.body;
  const [line] = await db.update(purchaseOrderLinesTable).set({ stockItemId: stockItemId ? Number(stockItemId) : undefined, quantityOrdered: quantityOrdered ? String(quantityOrdered) : undefined, unitPricePence: unitPricePence !== undefined ? (unitPricePence ? Number(unitPricePence) : null) : undefined, notes: notes || null }).where(eq(purchaseOrderLinesTable.id, lineId)).returning();
  res.json({ record: line });
});

router.delete("/farms/:farmId/purchase-orders/:poId/lines/:lineId", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const poId = Number(req.params.poId);
  const lineId = Number(req.params.lineId);
  if (!poId || !lineId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(purchaseOrderLinesTable).where(eq(purchaseOrderLinesTable.id, lineId));
  res.json({ success: true });
});

router.get("/farms/:farmId/stock-deliveries/by-product/:stockItemId", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const stockItemId = Number(req.params.stockItemId);
  if (!stockItemId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const records = await db.select({
    id: stockDeliveriesTable.id,
    grnNumber: stockDeliveriesTable.grnNumber,
    deliveryDate: stockDeliveriesTable.deliveryDate,
    batchNumber: stockDeliveriesTable.batchNumber,
    lotNumber: stockDeliveriesTable.lotNumber,
    expiryDate: stockDeliveriesTable.expiryDate,
    quantity: stockDeliveriesTable.quantity,
    supplierName: suppliersTable.name,
  }).from(stockDeliveriesTable)
    .leftJoin(suppliersTable, eq(stockDeliveriesTable.supplierId, suppliersTable.id))
    .where(and(eq(stockDeliveriesTable.farmId, farmId), eq(stockDeliveriesTable.stockItemId, stockItemId)))
    .orderBy(desc(stockDeliveriesTable.deliveryDate));
  res.json({ records });
});

// ─── Financial Transactions ────────────────────────
router.get("/farms/:farmId/financial-transactions", requireAuth, requireTenant, requireModuleByKey("financial-records", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select({
    id: financialTransactionsTable.id,
    farmId: financialTransactionsTable.farmId,
    stockDeliveryId: financialTransactionsTable.stockDeliveryId,
    transactionType: financialTransactionsTable.transactionType,
    category: financialTransactionsTable.category,
    description: financialTransactionsTable.description,
    amountPence: financialTransactionsTable.amountPence,
    currency: financialTransactionsTable.currency,
    transactionDate: financialTransactionsTable.transactionDate,
    reference: financialTransactionsTable.reference,
    vendorCustomer: financialTransactionsTable.vendorCustomer,
    paymentMethod: financialTransactionsTable.paymentMethod,
    vatAmountPence: financialTransactionsTable.vatAmountPence,
    vatRate: financialTransactionsTable.vatRate,
    notes: financialTransactionsTable.notes,
    createdAt: financialTransactionsTable.createdAt,
    linkedDeliveryDate: stockDeliveriesTable.deliveryDate,
    linkedDeliveryProductName: stockItemsTable.name,
    linkedDeliveryProductUnit: stockItemsTable.unit,
    linkedDeliveryQuantity: stockDeliveriesTable.quantity,
    linkedDeliveryBatchNumber: stockDeliveriesTable.batchNumber,
    linkedDeliveryInvoiceRef: stockDeliveriesTable.invoiceReference,
    linkedDeliverySupplierName: suppliersTable.name,
  }).from(financialTransactionsTable)
    .leftJoin(stockDeliveriesTable, eq(financialTransactionsTable.stockDeliveryId, stockDeliveriesTable.id))
    .leftJoin(stockItemsTable, eq(stockDeliveriesTable.stockItemId, stockItemsTable.id))
    .leftJoin(suppliersTable, eq(stockDeliveriesTable.supplierId, suppliersTable.id))
    .where(eq(financialTransactionsTable.farmId, farmId))
    .orderBy(desc(financialTransactionsTable.transactionDate));
  res.json({ records });
});

router.post("/farms/:farmId/financial-transactions", requireAuth, requireTenant, requireModuleByKey("financial-records", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(financialTransactionsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/financial-transactions/:recordId", requireAuth, requireTenant, requireModuleByKey("financial-records", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(financialTransactionsTable).set(req.body).where(and(eq(financialTransactionsTable.id, recordId), eq(financialTransactionsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/financial-transactions/:recordId", requireAuth, requireTenant, requireModuleByKey("financial-records", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(financialTransactionsTable).where(and(eq(financialTransactionsTable.id, recordId), eq(financialTransactionsTable.farmId, farmId)));
  res.json({ success: true });
});

router.post("/farms/:farmId/financial-exports", requireAuth, requireTenant, requireModuleByKey("financial-records", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const { dateRangeStart, dateRangeEnd, format } = req.body;
  const transactions = await db.select().from(financialTransactionsTable).where(eq(financialTransactionsTable.farmId, farmId)).orderBy(desc(financialTransactionsTable.transactionDate));
  const filtered = transactions.filter((t) => {
    const d = new Date(t.transactionDate);
    return d >= new Date(dateRangeStart) && d <= new Date(dateRangeEnd);
  });

  if (format === "xero" || format === "csv") {
    const csvEscape = (val: string | null | undefined): string => {
      if (val == null) return "";
      const s = String(val);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const xeroHeaders = ["*Date", "*Amount", "*AccountCode", "Description", "Reference", "TaxType", "TaxAmount"];
    const rows = filtered.map((t) => {
      const date = new Date(t.transactionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
      const amount = (t.amountPence / 100).toFixed(2);
      const accountCode = mapCategoryToXeroAccount(t.category || "general");
      const description = t.description || t.vendorCustomer || "";
      const reference = t.reference || "";
      const taxType = mapVatRateToXeroTax(t.vatRate);
      const taxAmount = t.vatAmountPence ? (t.vatAmountPence / 100).toFixed(2) : "";
      return [date, amount, accountCode, description, reference, taxType, taxAmount].map(csvEscape).join(",");
    });

    const csvContent = [xeroHeaders.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="farm-transactions-${dateRangeStart}-to-${dateRangeEnd}.csv"`);
    res.send(csvContent);
    return;
  }

  res.json({ record: { format, transactionCount: filtered.length, transactions: filtered } });
});

// ─── Crop Contracts ─────────────────────────────────
router.get("/farms/:farmId/crop-contracts", requireAuth, requireTenant, requireModuleByKey("financial-records", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(cropContractsTable).where(eq(cropContractsTable.farmId, farmId)).orderBy(desc(cropContractsTable.createdAt));
  res.json({ records });
});

router.post("/farms/:farmId/crop-contracts", requireAuth, requireTenant, requireModuleByKey("financial-records", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(cropContractsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/crop-contracts/:recordId", requireAuth, requireTenant, requireModuleByKey("financial-records", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(cropContractsTable).set(req.body).where(and(eq(cropContractsTable.id, recordId), eq(cropContractsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

router.delete("/farms/:farmId/crop-contracts/:recordId", requireAuth, requireTenant, requireModuleByKey("financial-records", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(cropContractsTable).where(and(eq(cropContractsTable.id, recordId), eq(cropContractsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Documents ─────────────────────────────────────
router.get("/farms/:farmId/documents", requireAuth, requireTenant, requireModuleByKey("document-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(documentRecordsTable).where(eq(documentRecordsTable.farmId, farmId)).orderBy(desc(documentRecordsTable.createdAt));
  res.json({ records });
});

router.post("/farms/:farmId/documents", requireAuth, requireTenant, requireModuleByKey("document-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(documentRecordsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.delete("/farms/:farmId/documents/:recordId", requireAuth, requireTenant, requireModuleByKey("document-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(documentRecordsTable).where(and(eq(documentRecordsTable.id, recordId), eq(documentRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Weather Stations ──────────────────────────────
router.get("/farms/:farmId/weather-stations", requireAuth, requireTenant, requireModuleByKey("weather-tracking", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(weatherStationsTable).where(eq(weatherStationsTable.farmId, farmId)).orderBy(desc(weatherStationsTable.createdAt));
  res.json({ records });
});

router.post("/farms/:farmId/weather-stations", requireAuth, requireTenant, requireModuleByKey("weather-tracking", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(weatherStationsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/weather-stations/:recordId", requireAuth, requireTenant, requireModuleByKey("weather-tracking", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(weatherStationsTable).set(req.body).where(and(eq(weatherStationsTable.id, recordId), eq(weatherStationsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/weather-stations/:recordId", requireAuth, requireTenant, requireModuleByKey("weather-tracking", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.update(weatherStationsTable).set({ isActive: false }).where(and(eq(weatherStationsTable.id, recordId), eq(weatherStationsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Weather Readings ──────────────────────────────
router.get("/farms/:farmId/weather-readings", requireAuth, requireTenant, requireModuleByKey("weather-tracking", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(weatherReadingsTable).where(eq(weatherReadingsTable.farmId, farmId)).orderBy(desc(weatherReadingsTable.readingTimestamp));
  res.json({ records });
});

router.post("/farms/:farmId/weather-readings", requireAuth, requireTenant, requireModuleByKey("weather-tracking", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;

  const body = req.body;

  function toNum(val: unknown): string | null {
    if (val === undefined || val === null || val === "") return null;
    const n = parseFloat(String(val));
    return isNaN(n) ? null : String(n);
  }

  function mphToKmh(mph: unknown): string | null {
    if (mph === undefined || mph === null || mph === "") return null;
    const n = parseFloat(String(mph));
    return isNaN(n) ? null : String(Math.round(n * 1.60934 * 10) / 10);
  }

  const isMobilePayload =
    "temperatureHigh" in body ||
    "temperatureLow" in body ||
    "entryMode" in body ||
    "recordedAt" in body;

  const values = isMobilePayload
    ? {
        farmId,
        readingTimestamp: body.recordedAt ?? body.date ?? new Date().toISOString(),
        entryMode: body.entryMode ?? null,
        dataSource: body.entryMode === "station" ? "open-meteo" : "manual",
        temperatureHighC: toNum(body.temperatureHigh),
        temperatureLowC: toNum(body.temperatureLow),
        humidityPercent: toNum(body.humidity),
        windSpeedKmh: mphToKmh(body.windSpeed),
        windDirection: body.windDirection ?? null,
        rainfallMm: toNum(body.rainfall),
        pressureHpa: toNum(body.pressure),
        conditions: body.conditions ?? null,
        latitude: toNum(body.latitude),
        longitude: toNum(body.longitude),
        notes: body.notes ?? null,
      }
    : { ...body, farmId };

  const [record] = await db.insert(weatherReadingsTable).values(values).returning();
  res.status(201).json({ record });
});

// ─── Missing PUT/DELETE for modules with only GET/POST ─────

router.put("/farms/:farmId/movements/:recordId", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(livestockMovementsTable).set(req.body).where(and(eq(livestockMovementsTable.id, recordId), eq(livestockMovementsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

router.delete("/farms/:farmId/movements/:recordId", requireAuth, requireTenant, requireModuleByKey("livestock-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(livestockMovementsTable).where(and(eq(livestockMovementsTable.id, recordId), eq(livestockMovementsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/movements/:recordId/attachments", requireAuth, requireTenant, requireModuleByKey("livestock-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const docs = await db.select().from(documentRecordsTable).where(
    and(
      eq(documentRecordsTable.farmId, farmId),
      eq(documentRecordsTable.linkedRecordType, "livestock_movement"),
      eq(documentRecordsTable.linkedRecordId, recordId),
    )
  ).orderBy(desc(documentRecordsTable.createdAt));
  res.json({ attachments: docs });
});

router.post("/farms/:farmId/movements/:recordId/attachments", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const { title, filePath, mimeType, fileSize, notes } = req.body as { title: string; filePath: string; mimeType?: string; fileSize?: number; notes?: string };
  if (!title || !filePath) { res.status(400).json({ error: "title and filePath are required" }); return; }
  const [doc] = await db.insert(documentRecordsTable).values({
    farmId,
    title,
    documentType: "movement_aml",
    linkedRecordType: "livestock_movement",
    linkedRecordId: recordId,
    filePath,
    mimeType,
    fileSize,
    notes,
  }).returning();
  res.status(201).json({ attachment: doc });
});

router.delete("/farms/:farmId/movements/:recordId/attachments/:docId", requireAuth, requireTenant, requireModuleByKey("livestock-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const docId = parseInt(req.params.docId, 10);
  if (isNaN(docId)) { res.status(400).json({ error: "Invalid document ID" }); return; }
  await db.delete(documentRecordsTable).where(
    and(
      eq(documentRecordsTable.id, docId),
      eq(documentRecordsTable.farmId, farmId),
      eq(documentRecordsTable.linkedRecordType, "livestock_movement"),
    )
  );
  res.json({ success: true });
});

router.put("/farms/:farmId/medicine-records/:recordId", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(livestockMedicineRecordsTable).set(req.body).where(and(eq(livestockMedicineRecordsTable.id, recordId), eq(livestockMedicineRecordsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

router.delete("/farms/:farmId/medicine-records/:recordId", requireAuth, requireTenant, requireModuleByKey("livestock-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(livestockMedicineRecordsTable).where(and(eq(livestockMedicineRecordsTable.id, recordId), eq(livestockMedicineRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

router.put("/farms/:farmId/feed-records/:recordId", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(livestockFeedRecordsTable).set(req.body).where(and(eq(livestockFeedRecordsTable.id, recordId), eq(livestockFeedRecordsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

router.delete("/farms/:farmId/feed-records/:recordId", requireAuth, requireTenant, requireModuleByKey("livestock-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(livestockFeedRecordsTable).where(and(eq(livestockFeedRecordsTable.id, recordId), eq(livestockFeedRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

router.put("/farms/:farmId/water-records/:recordId", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(livestockWaterRecordsTable).set(req.body).where(and(eq(livestockWaterRecordsTable.id, recordId), eq(livestockWaterRecordsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

router.delete("/farms/:farmId/water-records/:recordId", requireAuth, requireTenant, requireModuleByKey("livestock-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(livestockWaterRecordsTable).where(and(eq(livestockWaterRecordsTable.id, recordId), eq(livestockWaterRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

router.delete("/farms/:farmId/visitors/:recordId", requireAuth, requireTenant, requireModuleByKey("biosecurity", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(visitorContractorLogTable).where(and(eq(visitorContractorLogTable.id, recordId), eq(visitorContractorLogTable.farmId, farmId)));
  res.json({ success: true });
});

router.put("/farms/:farmId/pest-control/:recordId", requireAuth, requireTenant, requireModuleByKey("biosecurity", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(pestControlRecordsTable).set(req.body).where(and(eq(pestControlRecordsTable.id, recordId), eq(pestControlRecordsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

router.delete("/farms/:farmId/pest-control/:recordId", requireAuth, requireTenant, requireModuleByKey("biosecurity", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(pestControlRecordsTable).where(and(eq(pestControlRecordsTable.id, recordId), eq(pestControlRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

router.put("/farms/:farmId/cleaning/:recordId", requireAuth, requireTenant, requireModuleByKey("biosecurity", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(cleaningDisinfectionRecordsTable).set(req.body).where(and(eq(cleaningDisinfectionRecordsTable.id, recordId), eq(cleaningDisinfectionRecordsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

router.delete("/farms/:farmId/cleaning/:recordId", requireAuth, requireTenant, requireModuleByKey("biosecurity", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(cleaningDisinfectionRecordsTable).where(and(eq(cleaningDisinfectionRecordsTable.id, recordId), eq(cleaningDisinfectionRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

router.put("/farms/:farmId/training/:recordId", requireAuth, requireTenant, requireModuleByKey("staff-training", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(staffTrainingRecordsTable).set(req.body).where(and(eq(staffTrainingRecordsTable.id, recordId), eq(staffTrainingRecordsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

router.delete("/farms/:farmId/training/:recordId", requireAuth, requireTenant, requireModuleByKey("staff-training", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(staffTrainingRecordsTable).where(and(eq(staffTrainingRecordsTable.id, recordId), eq(staffTrainingRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

router.delete("/farms/:farmId/coshh/:recordId", requireAuth, requireTenant, requireModuleByKey("biosecurity", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(coshhRecordsTable).where(and(eq(coshhRecordsTable.id, recordId), eq(coshhRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

router.put("/farms/:farmId/waste/:recordId", requireAuth, requireTenant, requireModuleByKey("risk-waste", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(wasteDisposalRecordsTable).set(req.body).where(and(eq(wasteDisposalRecordsTable.id, recordId), eq(wasteDisposalRecordsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

router.delete("/farms/:farmId/waste/:recordId", requireAuth, requireTenant, requireModuleByKey("risk-waste", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(wasteDisposalRecordsTable).where(and(eq(wasteDisposalRecordsTable.id, recordId), eq(wasteDisposalRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

router.delete("/farms/:farmId/inspections/:recordId", requireAuth, requireTenant, requireModuleByKey("inspections", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(inspectionRecordsTable).where(and(eq(inspectionRecordsTable.id, recordId), eq(inspectionRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

router.delete("/farms/:farmId/nonconformances/:recordId", requireAuth, requireTenant, requireModuleByKey("inspections", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(nonconformanceRecordsTable).where(and(eq(nonconformanceRecordsTable.id, recordId), eq(nonconformanceRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

router.put("/farms/:farmId/agri-schemes/:recordId", requireAuth, requireTenant, requireModuleByKey("environmental", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(agriEnvironmentSchemeRecordsTable).set(req.body).where(and(eq(agriEnvironmentSchemeRecordsTable.id, recordId), eq(agriEnvironmentSchemeRecordsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

router.delete("/farms/:farmId/agri-schemes/:recordId", requireAuth, requireTenant, requireModuleByKey("environmental", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(agriEnvironmentSchemeRecordsTable).where(and(eq(agriEnvironmentSchemeRecordsTable.id, recordId), eq(agriEnvironmentSchemeRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

router.delete("/farms/:farmId/haulage/:recordId", requireAuth, requireTenant, requireModuleByKey("haulage-transport", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(haulageRecordsTable).where(and(eq(haulageRecordsTable.id, recordId), eq(haulageRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Storage Locations ─────────────────────────────
router.get("/farms/:farmId/storage-locations", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(storageLocationsTable).where(eq(storageLocationsTable.farmId, farmId)).orderBy(storageLocationsTable.name);
  res.json({ records });
});

router.get("/farms/:farmId/storage-locations/by-code/:storageCode", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const { storageCode } = req.params;
  const [record] = await db.select().from(storageLocationsTable).where(and(eq(storageLocationsTable.farmId, farmId), eq(storageLocationsTable.storageCode, storageCode)));
  if (!record) { res.status(404).json({ error: "No storage location found for this code" }); return; }
  res.json(record);
});

router.post("/farms/:farmId/storage-locations", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(storageLocationsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/storage-locations/:recordId", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(storageLocationsTable).set(req.body).where(and(eq(storageLocationsTable.id, recordId), eq(storageLocationsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/storage-locations/:recordId", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(storageLocationsTable).where(and(eq(storageLocationsTable.id, recordId), eq(storageLocationsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Haulier Directory ─────────────────────────────
router.get("/farms/:farmId/hauliers", requireAuth, requireTenant, requireModuleByKey("haulage-transport", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(hauliersTable).where(eq(hauliersTable.farmId, farmId)).orderBy(hauliersTable.companyName);
  res.json({ records });
});

router.post("/farms/:farmId/hauliers", requireAuth, requireTenant, requireModuleByKey("haulage-transport", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(hauliersTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/hauliers/:recordId", requireAuth, requireTenant, requireModuleByKey("haulage-transport", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(hauliersTable).set(req.body).where(and(eq(hauliersTable.id, recordId), eq(hauliersTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/hauliers/:recordId", requireAuth, requireTenant, requireModuleByKey("haulage-transport", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(hauliersTable).where(and(eq(hauliersTable.id, recordId), eq(hauliersTable.farmId, farmId)));
  res.json({ success: true });
});

router.put("/farms/:farmId/stock-items/:recordId", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(stockItemsTable).set(req.body).where(and(eq(stockItemsTable.id, recordId), eq(stockItemsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

router.delete("/farms/:farmId/stock-items/:recordId", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(stockItemsTable).where(and(eq(stockItemsTable.id, recordId), eq(stockItemsTable.farmId, farmId)));
  res.json({ success: true });
});

router.put("/farms/:farmId/stock-deliveries/:recordId", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(stockDeliveriesTable).set(req.body).where(and(eq(stockDeliveriesTable.id, recordId), eq(stockDeliveriesTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

router.delete("/farms/:farmId/stock-deliveries/:recordId", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(stockDeliveriesTable).where(and(eq(stockDeliveriesTable.id, recordId), eq(stockDeliveriesTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Stock Movements ──────────────────────────────
router.get("/farms/:farmId/stock-movements", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const stockItemId = req.query.stockItemId ? Number(req.query.stockItemId) : null;
  const base = db.select({
    id: stockMovementsTable.id,
    stockItemId: stockMovementsTable.stockItemId,
    stockItemName: stockItemsTable.name,
    stockItemUnit: stockItemsTable.unit,
    movementType: stockMovementsTable.movementType,
    quantityChange: stockMovementsTable.quantityChange,
    referenceType: stockMovementsTable.referenceType,
    referenceId: stockMovementsTable.referenceId,
    fieldId: stockMovementsTable.fieldId,
    deliveryId: stockMovementsTable.deliveryId,
    movedAt: stockMovementsTable.movedAt,
    performedBy: stockMovementsTable.performedBy,
    notes: stockMovementsTable.notes,
    createdAt: stockMovementsTable.createdAt,
  }).from(stockMovementsTable).leftJoin(stockItemsTable, eq(stockMovementsTable.stockItemId, stockItemsTable.id));
  const conditions = [eq(stockMovementsTable.farmId, farmId)];
  if (stockItemId) conditions.push(eq(stockMovementsTable.stockItemId, stockItemId));
  const records = await base.where(and(...conditions)).orderBy(desc(stockMovementsTable.movedAt));
  res.json({ records });
});

router.post("/farms/:farmId/stock-movements", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const body = req.body;
  const [record] = await db.insert(stockMovementsTable).values({ ...body, farmId, movementType: body.movementType || "adjustment" }).returning();
  if (record.stockItemId && record.quantityChange) {
    const qtyChange = parseFloat(record.quantityChange);
    if (!isNaN(qtyChange)) {
      const [existing] = await db.select().from(stockLevelsTable).where(and(eq(stockLevelsTable.farmId, farmId), eq(stockLevelsTable.stockItemId, record.stockItemId))).limit(1);
      if (existing) {
        await db.update(stockLevelsTable).set({ currentQuantity: String(parseFloat(existing.currentQuantity) + qtyChange), lastUpdated: new Date() }).where(eq(stockLevelsTable.id, existing.id));
      } else {
        await db.insert(stockLevelsTable).values({ farmId, stockItemId: record.stockItemId, currentQuantity: String(qtyChange) });
      }
    }
  }
  res.status(201).json({ record });
});

// ─── Stock Levels ─────────────────────────────────
router.get("/farms/:farmId/stock-levels", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select({
    id: stockLevelsTable.id,
    stockItemId: stockLevelsTable.stockItemId,
    stockItemName: stockItemsTable.name,
    stockItemCategory: stockItemsTable.category,
    stockItemUnit: stockItemsTable.unit,
    stockItemReorderLevel: stockItemsTable.reorderLevel,
    currentQuantity: stockLevelsTable.currentQuantity,
    lastUpdated: stockLevelsTable.lastUpdated,
  }).from(stockLevelsTable)
    .leftJoin(stockItemsTable, eq(stockLevelsTable.stockItemId, stockItemsTable.id))
    .where(eq(stockLevelsTable.farmId, farmId))
    .orderBy(stockItemsTable.name);
  res.json({ records });
});

router.put("/farms/:farmId/documents/:recordId", requireAuth, requireTenant, requireModuleByKey("document-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(documentRecordsTable).set(req.body).where(and(eq(documentRecordsTable.id, recordId), eq(documentRecordsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

router.put("/farms/:farmId/weather-readings/:recordId", requireAuth, requireTenant, requireModuleByKey("weather-tracking", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(weatherReadingsTable).set(req.body).where(and(eq(weatherReadingsTable.id, recordId), eq(weatherReadingsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

router.delete("/farms/:farmId/weather-readings/:recordId", requireAuth, requireTenant, requireModuleByKey("weather-tracking", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(weatherReadingsTable).where(and(eq(weatherReadingsTable.id, recordId), eq(weatherReadingsTable.farmId, farmId)));
  res.json({ success: true });
});

async function validateHarvestOwnership(harvestId: number, farmId: number): Promise<boolean> {
  const result = await db
    .select({ id: harvestRecordsTable.id })
    .from(harvestRecordsTable)
    .innerJoin(fieldCropAssignmentsTable, eq(harvestRecordsTable.fieldCropAssignmentId, fieldCropAssignmentsTable.id))
    .innerJoin(fieldsTable, eq(fieldCropAssignmentsTable.fieldId, fieldsTable.id))
    .where(and(eq(harvestRecordsTable.id, harvestId), eq(fieldsTable.farmId, farmId)))
    .limit(1);
  return result.length > 0;
}

router.put("/farms/:farmId/harvests/:recordId", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const valid = await validateHarvestOwnership(recordId, farmId);
  if (!valid) { res.status(404).json({ error: "Not found" }); return; }
  if (req.body.fieldCropAssignmentId) {
    const [fca] = await db
      .select({ id: fieldCropAssignmentsTable.id })
      .from(fieldCropAssignmentsTable)
      .innerJoin(fieldsTable, eq(fieldCropAssignmentsTable.fieldId, fieldsTable.id))
      .where(and(eq(fieldCropAssignmentsTable.id, req.body.fieldCropAssignmentId), eq(fieldsTable.farmId, farmId)))
      .limit(1);
    if (!fca) { res.status(400).json({ error: "Field crop assignment not found on this farm" }); return; }
  }
  const { id, createdAt, ...updateData } = req.body;
  const [record] = await db.update(harvestRecordsTable).set(updateData).where(eq(harvestRecordsTable.id, recordId)).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/harvests/:recordId", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const valid = await validateHarvestOwnership(recordId, farmId);
  if (!valid) { res.status(404).json({ error: "Not found" }); return; }
  await db.delete(harvestRecordsTable).where(eq(harvestRecordsTable.id, recordId));
  res.json({ success: true });
});

// ─── Insurance Register ─────────────────────────────
router.get("/farms/:farmId/insurance", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = req.tenantId!;
  const records = await db.select().from(farmInsuranceTable).where(eq(farmInsuranceTable.farmId, farmId)).orderBy(farmInsuranceTable.expiryDate);
  res.json({ records });
});

router.post("/farms/:farmId/insurance", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = req.tenantId!;
  const [record] = await db.insert(farmInsuranceTable).values({ ...req.body, farmId }).returning();
  res.json(record);
});

router.put("/farms/:farmId/insurance/:recordId", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = req.tenantId!;
  const recordId = Number(req.params.recordId);
  const [record] = await db.update(farmInsuranceTable).set(req.body).where(and(eq(farmInsuranceTable.id, recordId), eq(farmInsuranceTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json(record);
});

router.delete("/farms/:farmId/insurance/:recordId", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = req.tenantId!;
  const recordId = Number(req.params.recordId);
  await db.delete(farmInsuranceTable).where(and(eq(farmInsuranceTable.id, recordId), eq(farmInsuranceTable.farmId, farmId)));
  res.json({ success: true });
});

router.patch("/farms/:farmId/insurance/:recordId/document", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = req.tenantId!;
  const recordId = Number(req.params.recordId);
  const { documentPath, documentName } = req.body;
  const [record] = await db.update(farmInsuranceTable).set({ documentPath: documentPath ?? null, documentName: documentName ?? null }).where(and(eq(farmInsuranceTable.id, recordId), eq(farmInsuranceTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json(record);
});

// ─── Planner Events (ad hoc reminders) ────────────────────────────────────────

router.get("/farms/:farmId/planner-events", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = req.tenantId!;
  const records = await db.select().from(farmPlannerEventsTable).where(eq(farmPlannerEventsTable.farmId, farmId)).orderBy(farmPlannerEventsTable.eventDate);
  res.json(records);
});

router.post("/farms/:farmId/planner-events", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = req.tenantId!;
  const { title, description, eventDate, colour } = req.body;
  if (!title || !eventDate) { res.status(400).json({ error: "title and eventDate are required" }); return; }
  const [record] = await db.insert(farmPlannerEventsTable).values({ farmId, title, description: description || null, eventDate: new Date(eventDate), colour: colour || "slate" }).returning();
  res.status(201).json(record);
});

router.patch("/farms/:farmId/planner-events/:recordId", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = req.tenantId!;
  const recordId = Number(req.params.recordId);
  const { title, description, eventDate, colour } = req.body;
  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (eventDate !== undefined) updates.eventDate = new Date(eventDate);
  if (colour !== undefined) updates.colour = colour;
  const [record] = await db.update(farmPlannerEventsTable).set(updates).where(and(eq(farmPlannerEventsTable.id, recordId), eq(farmPlannerEventsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json(record);
});

router.delete("/farms/:farmId/planner-events/:recordId", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = req.tenantId!;
  const recordId = Number(req.params.recordId);
  await db.delete(farmPlannerEventsTable).where(and(eq(farmPlannerEventsTable.id, recordId), eq(farmPlannerEventsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Grants & Funding ──────────────────────────────
router.get("/farms/:farmId/grants", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(farmGrantsTable).where(eq(farmGrantsTable.farmId, farmId)).orderBy(desc(farmGrantsTable.createdAt));
  res.json({ records });
});

router.post("/farms/:farmId/grants", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const { schemeName, schemeType, itemReferenceCode, itemDescription, applicationReference, applicationDate, approvalDate, purchaseDeadline, claimDeadline, grantAmountPence, actualCostPence, status, linkedEquipmentId, notes } = req.body;
  if (!schemeName) { res.status(400).json({ error: "schemeName is required" }); return; }
  const [record] = await db.insert(farmGrantsTable).values({
    farmId,
    schemeName,
    schemeType: schemeType || "FETF",
    itemReferenceCode: itemReferenceCode || null,
    itemDescription: itemDescription || null,
    applicationReference: applicationReference || null,
    applicationDate: applicationDate || null,
    approvalDate: approvalDate || null,
    purchaseDeadline: purchaseDeadline || null,
    claimDeadline: claimDeadline || null,
    grantAmountPence: grantAmountPence ? Number(grantAmountPence) : null,
    actualCostPence: actualCostPence ? Number(actualCostPence) : null,
    status: status || "applied",
    linkedEquipmentId: linkedEquipmentId ? Number(linkedEquipmentId) : null,
    notes: notes || null,
  }).returning();
  res.status(201).json(record);
});

router.patch("/farms/:farmId/grants/:recordId", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = Number(req.params.recordId);
  const { schemeName, schemeType, itemReferenceCode, itemDescription, applicationReference, applicationDate, approvalDate, purchaseDeadline, claimDeadline, grantAmountPence, actualCostPence, status, linkedEquipmentId, notes } = req.body;
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (schemeName !== undefined) updates.schemeName = schemeName;
  if (schemeType !== undefined) updates.schemeType = schemeType;
  if (itemReferenceCode !== undefined) updates.itemReferenceCode = itemReferenceCode || null;
  if (itemDescription !== undefined) updates.itemDescription = itemDescription || null;
  if (applicationReference !== undefined) updates.applicationReference = applicationReference || null;
  if (applicationDate !== undefined) updates.applicationDate = applicationDate || null;
  if (approvalDate !== undefined) updates.approvalDate = approvalDate || null;
  if (purchaseDeadline !== undefined) updates.purchaseDeadline = purchaseDeadline || null;
  if (claimDeadline !== undefined) updates.claimDeadline = claimDeadline || null;
  if (grantAmountPence !== undefined) updates.grantAmountPence = grantAmountPence ? Number(grantAmountPence) : null;
  if (actualCostPence !== undefined) updates.actualCostPence = actualCostPence ? Number(actualCostPence) : null;
  if (status !== undefined) updates.status = status;
  if (linkedEquipmentId !== undefined) updates.linkedEquipmentId = linkedEquipmentId ? Number(linkedEquipmentId) : null;
  if (notes !== undefined) updates.notes = notes || null;
  const [record] = await db.update(farmGrantsTable).set(updates).where(and(eq(farmGrantsTable.id, recordId), eq(farmGrantsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json(record);
});

router.delete("/farms/:farmId/grants/:recordId", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = Number(req.params.recordId);
  await db.delete(farmGrantsTable).where(and(eq(farmGrantsTable.id, recordId), eq(farmGrantsTable.farmId, farmId)));
  res.json({ success: true });
});

router.patch("/farms/:farmId/grants/:recordId/document", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = Number(req.params.recordId);
  const { documentPath, documentName } = req.body;
  const [record] = await db.update(farmGrantsTable).set({ documentPath: documentPath ?? null, documentName: documentName ?? null }).where(and(eq(farmGrantsTable.id, recordId), eq(farmGrantsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json(record);
});

// ─── Help Articles ─────────────────────────────────
router.get("/help/articles", async (_req: Request, res: Response): Promise<void> => {
  const articles = [
    {
      id: 1,
      title: "Getting Started with Red Tractor Compliance",
      category: "Getting Started",
      content: `<img src="/api/help-images/dashboard-overview.png" alt="BDE Farm Trac Dashboard Overview" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />\n\n<p>Red Tractor Assurance is the UK's largest farm assurance scheme, covering food safety, animal welfare, and environmental protection. To achieve and maintain certification, your farm must keep accurate, up-to-date records across all relevant compliance areas.</p>\n\n<p>BDE Farm Trac is organised into modules that map directly to Red Tractor's inspection requirements. Start by completing your Farm Profile and Field Register under Settings — these underpin every other record in the system. Once your core data is entered, you can begin logging spray applications, equipment checks, biosecurity records, and visitor logs.</p>\n\n<h3>Your Compliance Score</h3>\n<p>The compliance score on your dashboard reflects how complete and current your records are across each module. Red Tractor inspectors can request records going back at least three years, so it is important to maintain records consistently — not just in the weeks before an inspection.</p>\n\n<h3>Getting Started Checklist</h3>\n<ol>\n<li><strong>Complete your Farm Profile</strong> — enter your CPH number, SBI, Red Tractor membership number, and contact details. Set the Country / Devolved Nation field so that livestock movement portal links display correctly for your region.</li>\n<li><strong>Set up your Field Register</strong> — add all fields with their area, soil type, and current crop. Mark any fields within a Nitrate Vulnerable Zone so the NVZ closed-period warnings apply correctly.</li>\n<li><strong>Add your staff</strong> — create a profile for each person who will be entering records and attach their PA certificates. The system will track expiry dates and alert you when renewals are due.</li>\n<li><strong>Register your equipment</strong> — add all sprayers and machinery with their NSTS test dates and next calibration due dates. The Fleet Status dashboard will surface overdue items as red alerts.</li>\n<li><strong>Register your Farm Buildings &amp; Areas</strong> — if you are using the Biosecurity module, add every building, yard, store, and outdoor area under Biosecurity &gt; Buildings &amp; Areas before you start logging pest control or cleaning records. Each building can be placed on the Farm Map using GPS — this creates a visual satellite view of your holding with colour-coded markers for each area type. New buildings can also be added on site using the mobile app, which captures your device's GPS location automatically and saves the record live to the dashboard.</li>\n<li><strong>Begin recording</strong> — start logging spray applications, livestock movements, medicine treatments, visitor logs, and pest control visits. Where records need to be captured away from a desk, use the BDE Farm Trac mobile app. It works offline and syncs automatically the next time you have a connection — so nothing is lost if you are out of signal range.</li>\n</ol>\n\n<h3>Your Weekly Routine</h3>\n<p>Once your setup is complete, the <strong>Week Ahead</strong> page (second item in the sidebar, just below the Dashboard) is the most useful habit to build. Every Monday morning, open the Week Ahead to see all scheduled tasks, upcoming due dates, and overdue items across every active module — pest control follow-ups, cleaning schedules, equipment calibrations, staff certificate renewals, and more. Tasks are grouped by day so you can plan the week without opening each module individually. Any item shown in the <strong>Overdue</strong> section should be completed and a new due date set before your next inspection window.</p>\n\n<p>If you are new to Red Tractor assurance, your assurance body will provide a scheme manual specific to your sector (Combinable Crops, Beef &amp; Lamb, Dairy, Pigs, or Fresh Produce). BDE Farm Trac covers the record-keeping obligations from all of these sector standards.</p>`,
    },
    {
      id: 2,
      title: "Recording Spray Applications",
      category: "Sprays & Inputs",
      content: `<img src="/api/help-images/spray-records.png" alt="Spray Application Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />\n\n<p>Under Red Tractor and UK law (Plant Protection Products Regulations 2011), you are required to keep a detailed record of every pesticide and herbicide application made on your holding. Records must be made within 48 hours of the application and retained for at least three years.</p>\n\n<h3>What to Record</h3>\n<p>For each spray record you must capture:</p>\n<ul>\n<li>Product name and MAPP number</li>\n<li>Active ingredient and target pest or disease</li>\n<li>Target crop and growth stage (BBCH scale)</li>\n<li>Field or area treated in hectares</li>\n<li>Application date and time</li>\n<li>Total quantity of product used</li>\n<li>Operator name and PA certificate number</li>\n<li>Weather conditions — wind speed/direction, temperature, rainfall within 6 hours</li>\n</ul>\n\n<h3>Adding a Record</h3>\n<p>Navigate to <strong>Sprays &amp; Inputs</strong> and select <strong>Add Application</strong>. Choose the product from your registered product list or add a new product with its MAPP number. The system will pre-fill the maximum approved dose and buffer zone distances from the product label.</p>\n\n<h3>Operator Name Lookup</h3>\n<p>The <strong>Operator Name</strong> field in the spray record form is a staff member lookup, populated from the people you have added in <strong>Staff &amp; Training</strong>. Selecting a person from the list links the spray record directly to their staff profile — meaning the operator's PA certificate number and expiry date are already on file and can be cross-referenced at any time. If no staff members have been registered yet, the field falls back to a free-text input so you can still record the operator's name without interruption.</p>\n\n<h3>Operator Certificates</h3>\n<p>Spray operators must hold a valid certificate of competence (PA1 and the relevant PA2 or PA6 module). These can be linked to staff records in the Staff &amp; Training section so that the system alerts you when certificates are approaching their renewal date.</p>`,
    },
    {
      id: 3,
      title: "Managing Your Field Register",
      category: "Fields & Crops",
      content: `<img src="/api/help-images/field-register.png" alt="Field Register" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />\n\n<p>Your Field Register is a complete list of all parcels of land that form part of your holding. Red Tractor requires this to be kept current and to be cross-referenced against your spray and soil records. Each field should reflect how it is registered with the Rural Payments Agency (RPA) using the same OS grid reference or LPIS parcel identifier where possible.</p>\n\n<h3>Adding a Field</h3>\n<p>Go to <strong>Fields &amp; Crops</strong> and select <strong>Add Field</strong>. Enter the field name or reference number, the total area in hectares, the soil type, and the current crop or land use. You can also record whether the field:</p>\n<ul>\n<li>Falls within a Nitrate Vulnerable Zone (NVZ)</li>\n<li>Is subject to any Higher Tier agri-environment agreements</li>\n<li>Borders a watercourse — which affects buffer zone distances for spray applications</li>\n</ul>\n\n<h3>Crop History</h3>\n<p>Once a crop is assigned to a field, the system carries the field through to spray records, soil records, and yield data — giving you a complete crop history without re-entering field details each time.</p>\n\n<h3>End-of-Season Rotation</h3>\n<p>At the end of each season, use the <strong>Crop Rotation</strong> function to archive the current crop and assign the new crop for the coming year. Keeping rotation records helps demonstrate that you are managing soil health in line with Red Tractor soil management requirements.</p>`,
    },
    {
      id: 4,
      title: "Equipment Calibration Guide",
      category: "Equipment",
      content: `<img src="/api/help-images/field-register.png" alt="Equipment Register" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

Red Tractor requires that all sprayers and other application equipment are kept in good working order and calibrated to ensure accurate application rates. Sprayers must be tested by an approved NSTS (National Sprayer Testing Scheme) inspector at intervals not exceeding three years; from January 2026, some sector standards require more frequent testing.\n\nTo register a piece of equipment, go to Machinery & Equipment and select Add Equipment. Enter the make, model, serial number, and registration number if applicable. You can attach photos of the current NSTS certificate directly within the equipment record — this makes them instantly available during an inspection without searching through paper files.\n\nFor each piece of equipment, set a Next Calibration Due date. The system will surface overdue or upcoming calibration dates on your dashboard so that nothing slips through. You can also log routine servicing events in the Notes field with the date and engineer name.\n\nSprayer operators should carry out a pre-season self-check before each spraying season. Record the date of this check and any remedial work carried out. Even where formal NSTS certification is not immediately due, evidence of routine checks demonstrates good practice to an inspector.`,
    },
    {
      id: 5,
      title: "Livestock Movement Records",
      category: "Livestock",
      content: `<img src="/api/help-images/livestock-movements.png" alt="Livestock Movements" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>Under the Cattle Identification Regulations and the Sheep and Goat (Records, Identification and Movement) Order, all livestock keepers must maintain accurate movement records. Which government portal you use depends on where your holding is located in the UK.</p>

<h3>UK Reporting Portals by Country</h3>
<ul>
<li><strong>England:</strong> Cattle → BCMS (within 3 days). Sheep, goats &amp; pigs → eAML2 (eaml2.org.uk).</li>
<li><strong>Scotland:</strong> All species → ScotEID (scoteid.com). Cattle also require BCMS notification.</li>
<li><strong>Wales:</strong> Sheep &amp; goats → EIDCymru (eidcymru.org). Pigs → eAML2. Cattle → BCMS Online.</li>
<li><strong>Northern Ireland:</strong> Cattle → NIFAIS. Sheep &amp; pigs → APHIS. Contact DAERA to register.</li>
</ul>

<h3>Recording a Movement — Dashboard</h3>
<p>Set your farm’s Country in <strong>Farm Settings</strong> so that the Movements page shows the correct portal links. Navigate to <strong>Livestock Movements</strong> and click <strong>Add Movement</strong>. The form collects:</p>
<ul>
<li>Movement type (On to Farm, Off Farm, or Between Holdings), date, species, and number of animals</li>
<li>Source or destination CPH number</li>
<li><strong>Ear Tag / ID Numbers</strong> — a dedicated multi-line field for entering individual ear tag numbers, one per line or comma-separated. For cattle the form shows a BCMS requirement notice; for sheep, goats, and deer it is labelled “Ear Tag / EID Numbers” and is optional for batch movements but aids traceability. For pigs, guidance prompts you to enter the herd mark tattooed or slap-marked on the animals.</li>
<li>Movement licence or AML reference number, transporter name and vehicle registration</li>
</ul>
<p>Ear tag numbers appear in printed movement certificates in monospace format, matching the layout inspectors expect to see.</p>

<h3>Recording a Movement — Mobile App</h3>
<p>Tap <strong>Record</strong> on the bottom navigation bar and select <strong>Livestock Movement</strong>. The mobile form includes the same <strong>Ear Tag / ID Numbers</strong> field positioned directly below the head count. The label adapts based on the species selected — cattle get a BCMS requirement prompt, sheep and goats get “Ear Tag / EID Numbers”, and pigs are prompted for the herd mark or tattoo. The movement is saved offline immediately and synced when a connection is available. When you choose to print or save a PDF at the end of the form, the ear tag numbers are included in the movement certificate.</p>

<h3>Animal Identification and the Individual Animal Register</h3>
<p>For cattle herds and sheep flocks where you want to track individual animals over time, use the <strong>Individual Animals</strong> tab on the Livestock page to register each animal with its full identifier set — UK ear tag, EID transponder number, breed, sex, and date of birth. Once registered, individual animals can be cross-referenced when recording movements, medicine treatments, and mortality events. See the separate Help Centre article <em>Individual Animal Register and Electronic Identification (EID)</em> for full details.</p>

<h3>Cattle Passports</h3>
<p>For cattle purchases, record the date the animal passport was received. The cattle passport number matches the UK ear tag number (BCMS format: UK + herd number + individual number). Red Tractor inspectors check that passports are present for all cattle on the holding. When recording movements off the holding — to a market, abattoir, or another farm — retain a copy of the movement document (AML1 or AML2) and attach it to the movement record in Documents. Records must be kept for at least three years.</p>`,
    },
    {
      id: 6,
      title: "Visitor Logging and Biosecurity Plan",
      category: "Biosecurity",
      content: `<img src="/api/help-images/help-centre.png" alt="Visitor Log and Biosecurity" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

Biosecurity is a core requirement of Red Tractor across all sectors. The Biosecurity module in BDE Farm Trac has five tabs: Visitor Log, Pest Control, Cleaning & Disinfection, COSHH, and Biosecurity Plan.\n\nThe Visitor Log tab is where you record everyone who comes onto your farm — contractors, vets, feed merchants, agronomists, and any other visitors. Each entry should capture: the full name and company, the purpose of the visit, the date and approximate arrival and departure time, whether they signed a biosecurity declaration, and whether they had visited any other livestock holdings within the previous 48–72 hours (depending on your sector standard). Biosecurity declaration forms can be generated from within the system and printed or emailed to visitors in advance.\n\nThe Biosecurity Plan tab holds your farm's written biosecurity plan document — a requirement that Red Tractor inspectors look for as evidence that you have formally thought through how disease risks are managed on your holding. The plan is structured into nine sections: restricted areas and access points, visitor and personnel procedures, vehicle and equipment entry controls, cleaning and disinfection protocols, pest management, disease outbreak response, waste management, water source protection, and staff responsibilities. There are also document control fields for author, approver, review dates, and version number.\n\nTo create or update the plan, open the Biosecurity Plan tab and click Edit Plan. Each section has a text area where you describe your farm's specific arrangements. Once saved, the plan displays in a clean view mode. The Print Plan button generates a formal A4 document with signature blocks for the farm manager and approver, suitable for filing or presenting to an inspector.\n\nReview your biosecurity plan annually and after any significant change to farm operations, such as adding a new livestock enterprise, constructing new buildings, or changing contractors.`,
    },
    {
      id: 7,
      title: "Staff Training & Certificates",
      category: "Staff & Training",
      content: `<img src="/api/help-images/medicine-records.png" alt="Staff Training and Certificates" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>Red Tractor requires all staff carrying out regulated activities — spraying, livestock handling, machinery operation — to hold valid certificates of competence. It is the farm manager's responsibility to ensure certificates are current before staff perform regulated tasks.</p>

<p>Navigate to <strong>Staff &amp; Training</strong> in the sidebar. The module has three tabs: <strong>Training Records</strong>, <strong>Certificates &amp; Qualifications</strong>, and <strong>Right to Work</strong>.</p>

<h3>Selecting a Staff Member</h3>
<p>When adding a training record or certificate, the <strong>Staff Member</strong> field is a dropdown populated from your real staff list (the people you have invited via the Staff page). This ensures records are properly linked to a specific person rather than a typed name that might vary. If no staff have been invited yet, the field falls back to free text so you can still record data.</p>

<h3>Training Records Tab</h3>
<p>Log all in-house and externally-delivered training: course or competency title, training provider, date, expiry date, and assessor name. Use this tab for manual handling briefings, fire safety, biosecurity inductions, and any other formal or informal training. Records show colour-coded expiry badges: green (current), amber (expiring within 60 days), red (expired).</p>

<h3>Certificates &amp; Qualifications Tab</h3>
<p>Record formal industry certificates using the grouped dropdown — over 50 certificate types are organised into 10 categories:</p>
<ul>
<li><strong>Pesticide Application (NPTC/Lantra)</strong> — PA1, PA2, PA3, PA4, PA6, PA6AW, rodenticides</li>
<li><strong>Livestock Welfare &amp; Husbandry</strong> — WASK/WATOK emergency slaughter, cattle disbudding/castration, sheep castration, pig castration, bovine AI, poultry culling and handling</li>
<li><strong>Animal Transport</strong> — Category 1 (under 8 hours), Category 2 (long journeys), livestock vehicle driver CoC</li>
<li><strong>Machinery &amp; Equipment</strong> — telehandler, counterbalance FLT, reach FLT, ATV/quad bike, ROLO, combine harvester, grain dryer</li>
<li><strong>Chainsaw (NPTC/Lantra)</strong> — CS30, CS31, CS32, CS38</li>
<li><strong>Health &amp; Safety</strong> — FAW, EFAW, fire warden, working at height, confined space, asbestos, COSHH</li>
<li><strong>Agronomy &amp; Advisory</strong> — BASIS Agronomy, BASIS Crop Protection, FACTS, NRoSO CPD</li>
<li><strong>Veterinary &amp; Medicines</strong> — AMTRA SQP, responsible for medicines, BVetMed/MRCVS</li>
<li><strong>Food, Hygiene &amp; Environment</strong> — food hygiene Level 2 &amp; 3, food safety in manufacturing, water hygiene</li>
<li><strong>Formal Qualifications</strong> — City &amp; Guilds, BTEC, HND, BSc, NVQ Level 2 &amp; 3</li>
</ul>
<p>For each certificate record the certificate number, issuing body, issue date, and expiry date.</p>

<h3>Compliance Gap Panel</h3>
<p>At the top of the Certificates tab, if any of the following critical certificates are missing from the farm's records, a red or amber banner appears automatically:</p>
<ul>
<li><strong>WASK/WATOK</strong> (red) — legally required for any farm with livestock that may need emergency slaughter</li>
<li><strong>Animal Transport Category 1</strong> (red) — required before anyone moves animals</li>
<li><strong>First Aid at Work or EFAW</strong> (amber) — required under the Health &amp; Safety (First-Aid) Regulations 1981</li>
<li><strong>PA1</strong> (amber) — required for any person supervising or using professional pesticide products</li>
</ul>
<p>Each banner disappears as soon as a matching certificate is recorded.</p>

<h3>Certificates Status on the Staff Page</h3>
<p>The <strong>Staff</strong> page shows a certificate summary for each person — green (all valid), amber (expiring soon), red (expired), or "None recorded". Click the <strong>Certs</strong> button on any row to go directly to that person's certificate records.</p>

<h3>Print Register</h3>
<p>The <strong>Print Register</strong> button at the top of the page generates a formatted A4 document with both training records and certificate tables, plus sign-off blocks for the farm manager and Red Tractor assessor. This is the document to present when an inspector asks to see your training evidence.</p>

<p>For guidance on Right to Work checks — a separate legal obligation that must be completed before employment begins — see the article <em>Right to Work Checks for Farm Employers</em>.</p>`,
    },
    {
      id: 8,
      title: "Inspection Preparation Checklist",
      category: "Inspections",
      content: `<img src="/api/help-images/dashboard-overview.png" alt="Compliance Dashboard" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

Red Tractor inspections are carried out by independent certification bodies on behalf of Assured Food Standards. Most farms are inspected annually, although risk-assessed farms with excellent compliance histories may be inspected less frequently. Inspections are usually unannounced.\n\nIn the three months before your expected inspection window, use BDE Farm Trac to review the completeness of your records. Check that all spray records are up to date and cover the current and previous two seasons. Verify that equipment calibration dates are current and that NSTS certificates are filed. Ensure all livestock movement records are reconciled against your relevant government portal (BCMS, eAML2, ScotEID, EIDCymru, or NIFAIS depending on your country and species). Confirm that staff certificates are in date and attached to the correct staff profiles.\n\nOn the day of an inspection, your inspector will typically review your record-keeping system, walk the farm to check conditions and equipment, cross-reference spray records against stock in your chemical store, check animal welfare facilities, and interview you about your management practices. Having BDE Farm Trac open and logged in to the correct farm means you can navigate quickly to any record the inspector requests.\n\nAfter the inspection, any non-conformances raised must be addressed within the timescale specified in the inspection report. BDE Farm Trac's Action Required counter on the dashboard can be used to track outstanding items until they are resolved and signed off.`,
    },
    {
      id: 9,
      title: "Understanding COSHH Requirements",
      category: "Risk & Waste",
      content: `<img src="/api/help-images/field-register.png" alt="COSHH Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

The Control of Substances Hazardous to Health Regulations 2002 (COSHH) require employers and self-employed persons to assess the risks from hazardous substances used at work and to implement appropriate control measures. On farms, COSHH assessments are required for pesticides, veterinary medicines, cleaning chemicals, fuels, and other substances that could harm health.\n\nFor each hazardous substance in your chemical store, you should hold a completed COSHH assessment that identifies: what the substance is and what it is used for, who might be exposed and how, the health effects of exposure, the control measures in place (PPE, ventilation, storage requirements), emergency procedures in the event of a spill or exposure, and the date of the assessment and next review date.\n\nIn BDE Farm Trac, link COSHH assessments to the relevant product record in Sprays & Inputs. This means that when a spray record is created, the operator can confirm they have read the relevant COSHH assessment before proceeding. Keep copies of all Safety Data Sheets (SDS) — available from the product manufacturer — alongside each assessment.\n\nCOSHH assessments should be reviewed whenever a new substance is introduced, when working methods change, or at least annually. Red Tractor inspectors will ask to see COSHH assessments for products found in your store and may check that staff are aware of the relevant control measures.`,
    },
    {
      id: 10,
      title: "Financial Record Keeping",
      category: "Financial",
      content: `<img src="/api/help-images/financial-records.png" alt="Financial Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>Red Tractor does not require detailed profit and loss accounting, but it does expect farm businesses to maintain records of inputs purchased, agri-environment scheme payments received, and any sales that fall under traceability requirements.</p>

<h3>Recording Transactions</h3>
<p>In BDE Farm Trac, the <strong>Financial Records</strong> module allows you to record income and expenditure transactions. Each record captures the date, description, category, supplier or customer name, net amount, VAT, and total. Categories include:</p>
<ul>
<li>Crop Sales and Livestock Sales</li>
<li>Agrochemicals, Fertilisers, Seeds</li>
<li>Veterinary and Medicine costs</li>
<li>Fuel &amp; Lubricants, Contracting</li>
<li>Subsidies &amp; Grants (BPS, SFI, agri-environment payments)</li>
</ul>

<h3>Financial Summary Dashboard</h3>
<p>The top of the Financial Records page shows running totals for Total Income (YTD), Total Expenditure (YTD), Net Profit, and VAT to reclaim — giving you an instant financial overview without opening a spreadsheet.</p>

<h3>Exporting Data</h3>
<p>Use the <strong>Export</strong> function to generate a CSV covering any date range — suitable for importing into accounting software such as Xero or Sage. Red Tractor inspectors occasionally ask for evidence that inputs purchased reconcile with inputs recorded as applied, so keeping purchase records linked to field applications is good practice.</p>`,
    },
    {
      id: 11,
      title: "Weather Station Setup",
      category: "Weather",
      content: `<img src="/api/help-images/dashboard-overview.png" alt="Weather and Dashboard" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

Accurate weather data is an important part of spray application records. Under Red Tractor, spray records must include the wind speed and direction, temperature, and rainfall status at the time of application. This information helps demonstrate that applications were made within the safe working conditions defined on the product label.\n\nBDE Farm Trac can pull weather data in three ways. If you have a weather station on the farm (for example a Davis Vantage or similar), you can connect it via its API and the system will automatically associate recorded conditions with spray events logged at the same time. If you use a third-party weather service such as ADAS Weather, you can configure your nearest weather station postcode and the system will retrieve daily summaries.\n\nFor farms without a connected station, manual entry is available. When logging a spray application, you will be prompted to enter the wind speed in metres per second (or Beaufort scale), the wind direction, the air temperature in degrees Celsius, and whether there was rain or dew present. This takes only a moment and ensures the record is complete.\n\nIf you are in doubt about wind speed, a simple field guide: leaves rustling and small twigs moving is around 3–4 m/s (Beaufort 3), which is typically within the acceptable range for most boom sprayers. Sustained gusts above 5 m/s (Beaufort 4) usually indicate conditions where spraying should stop to prevent drift onto neighbouring land or watercourses.`,
    },
    {
      id: 12,
      title: "Document Management Best Practices",
      category: "Documents",
      content: `<img src="/api/help-images/help-centre.png" alt="Document Management" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

Red Tractor requires you to hold and present a range of documents during inspections, including your farm assurance certificate, scheme membership confirmation, NSTS sprayer test certificates, insurance certificates, staff training certificates, COSHH assessments, and agri-environment scheme agreements. Keeping these organised and accessible is as important as the records themselves.\n\nIn BDE Farm Trac, the Documents section allows you to upload PDF, Word, or image files and link them to the relevant record. For example, an NSTS certificate should be attached to the equipment record for the sprayer it covers, and a staff PA2 certificate should be attached to that staff member's training record. This means that when an inspector asks for evidence, you can navigate directly to the record and show the document without searching through folders or filing cabinets.\n\nFor documents with an expiry date — certificates, insurance policies, scheme agreements — always enter the expiry date when uploading. These will appear in the Documents expiry report, which gives you a forward view of what needs renewing over the next 12 months. Set a reminder period of 90 days for documents that require advance booking (such as sprayer NSTS tests) and 30 days for those with a shorter lead time.\n\nReview your document library at the start of each calendar year. Archive documents that have been superseded by newer versions rather than deleting them — inspectors may ask to see previous certificates to establish a history of compliance. Archived documents remain searchable but are removed from the active documents view.`,
    },
    {
      id: 13,
      title: "Biofuel / RTFO Compliance Overview",
      category: "Biofuel / RTFO",
      content: `<img src="/api/help-images/field-register.png" alt="Biofuel RTFO Compliance" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

The Renewable Transport Fuel Obligation (RTFO) requires fuel suppliers to blend a proportion of renewable fuels — including crop-based biofuels — into the transport fuel they supply. Farms that grow energy crops or supply feedstocks for biofuel production must demonstrate sustainability under an approved scheme such as ISCC (International Sustainability and Carbon Certification) or the Red Tractor Biofuel Standard.\n\nTo access the Biofuel / RTFO module, navigate to Biofuel / RTFO in the sidebar. This module is available as an add-on subscription. If you cannot see it, contact your account administrator to enable it for your farm.\n\nThe module has four areas. The Overview tab shows your current compliance checklist — including whether your ISCC or approved scheme certification is in place and up to date, whether all eligible fields have land declarations recorded, and whether your delivery records match your certification claims. The compliance percentage shown here updates automatically as records are added.\n\nThe Certification tab holds your scheme certificates. Add a certificate by entering the certification body, your certificate number, and the valid-from and expiry dates. The system will warn you 60 days before a certificate expires. An expired or missing certificate means you cannot make valid RTFO claims for that period.\n\nThe Field Declarations tab records the eligibility status of each field used for biofuel feedstocks. You must declare the 2008 land-use category for each field (this is required under the RTFO to demonstrate the field was not previously a high-biodiversity or high-carbon-stock habitat). Fields classified as peatland, wetland, or continuously forested land in January 2008 are not eligible for RTFO claims.\n\nThe Delivery Records tab logs each delivery of biofuel feedstock. Each record links to an RTFO reference number provided by the buyer, the receiving company, the sustainability scheme, the quantity in tonnes, and the GHG emission saving percentage reported for that delivery.`,
    },
    {
      id: 14,
      title: "ISCC Certification and Land Eligibility",
      category: "Biofuel / RTFO",
      content: `<img src="/api/help-images/field-register.png" alt="ISCC Certification and Field Declarations" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

ISCC (International Sustainability and Carbon Certification) is one of the primary certification schemes recognised under the RTFO. To sell feedstocks for biofuel production under RTFO, your farm must hold a current ISCC certificate or be covered by a group certificate held by your buyer or cooperative.\n\nTo record your ISCC certificate in BDE Farm Trac, go to Biofuel / RTFO and open the Certification tab. Click Add Certificate and enter the certification body name (e.g. ISCC System GmbH, CERT UK, or your approved certifier), your certificate number (this appears on your ISCC certificate of compliance), the issued date, and the expiry date. Upload a PDF of the certificate using the file attachment button. The system will display a warning banner on the Overview tab if the certificate has lapsed or is within 60 days of expiry.\n\nFor land eligibility, each field used for biofuel feedstock production must have a land declaration recorded in the Field Declarations tab. You will need to know the land-use category of each field in January 2008 — this information can typically be found from Countryside Stewardship entry data, Rural Payments Agency records, or historical aerial photography. The eligible land categories under the RTFO are: arable land, permanent grassland that was already being used for arable cultivation in 2008, and land under cultivation since before 2008 that does not fall into any high-risk category.\n\nHigh-risk land categories that make fields ineligible include: peatland (regardless of drainage status), wetlands, continuously forested areas, and areas that were designated as conservation land in 2008. If any part of a field falls into a high-risk category, that field should be excluded from RTFO claims unless a full sustainability audit has cleared it. Record the risk flag status for each field in the Field Declarations form — the system will mark ineligible fields in red on the declarations list.`,
    },
    {
      id: 15,
      title: "Recording Biofuel Deliveries and GHG Savings",
      category: "Biofuel / RTFO",
      content: `<img src="/api/help-images/spray-records.png" alt="Biofuel Delivery Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

Every delivery of biofuel feedstock that you wish to claim under the RTFO must be individually recorded. Your buyer (the fuel supplier or their intermediary) will provide an RTFO reference number for each delivery. This reference links your farm delivery to the RTFO claim that the fuel supplier makes to the Department for Energy Security and Net Zero (DESNZ).\n\nTo record a delivery, go to Biofuel / RTFO and open the Delivery Records tab. Click Add Delivery Record and complete the form. Required fields include: the delivery date, the name of the buying company, the RTFO reference number provided by the buyer, the sustainability scheme under which the delivery is claimed (e.g. ISCC, Red Tractor Biofuel Standard), the quantity delivered in tonnes, and the feedstock type (e.g. OSR — oilseed rape, wheat, sugar beet).\n\nThe GHG emission saving percentage is calculated by the buyer's RTFO operator using a standard lifecycle analysis methodology. You do not calculate this yourself, but you should record the figure as stated on your delivery confirmation or the buyer's sustainability declaration document. The RTFO requires this figure to demonstrate that the biofuel produced achieves at least a 65% GHG saving compared to fossil fuel (for crops grown on land not covered by transitional arrangements).\n\nThe Overview tab shows a GHG summary aggregated across all your delivery records for the current season. This summary also draws on your nitrogen application records and harvest yield data to build a picture of your farm's overall input intensity for auditing purposes. If any delivery records are missing an RTFO reference or GHG saving figure, they will appear as warnings in the compliance checklist.`,
    },
    {
      id: 16,
      title: "NVZ Rules, Applications and Risk Assessments",
      category: "Nutrient Management",
      content: `<img src="/api/help-images/spray-records.png" alt="NVZ Fertiliser Applications" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

Nitrate Vulnerable Zones (NVZs) are areas designated by the Environment Agency as being at risk of nitrate pollution from agricultural sources. If any of your fields lie within an NVZ — which you can check on the Magic map at magic.defra.gov.uk — you must comply with the Nitrates Regulations 2015, including closed periods for spreading organic manures, storage requirements, and maximum nitrogen application rates.\n\nIn BDE Farm Trac, the NVZ module has three tabs: NVZ Summary, Application Log, and Risk Assessments.\n\nThe NVZ Summary tab shows your NVZ-designated fields, the 170 kg N/ha organic manure limit, and a running nitrogen balance for the season. For each field, mark it as NVZ-designated in the Field Register. The system applies closed period warnings when you attempt to record a fertiliser application in a prohibited window. Closed periods for manufactured nitrogen fertilisers on tillage land run from 1 September to 31 January; for grassland, from 15 October to 31 January.\n\nThe Application Log tab records each fertiliser application on NVZ fields. For each application, record the product name, the total nitrogen content (kg N/ha), the application date, the method (broadcast spreading, injection, trailing shoe), and the field area treated. The system calculates cumulative nitrogen loading for the season and flags fields approaching or exceeding the limit. NVZ regulations require fertiliser application records to be kept for at least five years.\n\nThe Risk Assessments tab is where you record formal NVZ risk assessments — a document that good practice (and some sector standards) expects you to carry out and review periodically. For each assessment, record the date, the assessor name, the soil type, drainage risk (Low/Medium/High), slope risk, flood risk, distance to nearest watercourse, organic matter level, any application restrictions identified, and the mitigation measures in place. Overall risk level is recorded as Low, Medium, or High and is shown with a colour-coded badge on the assessments list. Set a next review date so the system can surface assessments that are overdue for revision.`,
    },
    {
      id: 17,
      title: "Nutrient Management Planning (NMP)",
      category: "Nutrient Management",
      content: `<img src="/api/help-images/spray-records.png" alt="Nutrient Management Planning" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

A Nutrient Management Plan (NMP) is a written record of how you intend to manage the nutrients applied to your land to meet crop needs while minimising environmental impact. For farms within NVZs, an NMP is a legal requirement under the Nitrates Regulations. For Red Tractor certified farms, evidence of a nutrient management plan or soil-based fertiliser planning is an inspection requirement.\n\nYour NMP should cover each field on your holding and detail: the soil test results (pH, phosphorus index, potassium index, and magnesium index where relevant), the crop to be grown and its expected yield, the estimated crop nitrogen demand, the amount of nitrogen expected from organic manures and soil nitrogen supply, and the planned manufactured nitrogen application to make up the deficit.\n\nIn BDE Farm Trac, the soil testing records in the Fields & Crops section feed directly into the NMP view. For each field, record the most recent soil test results by clicking on the field name and selecting Add Soil Test. Enter the index values for P, K, and Mg, and the pH. The system will flag fields where pH is below 6.0 (requiring lime) or where phosphorus is at index 4 or above (restricting further P applications under Red Tractor guidelines).\n\nThe system does not automatically generate RB209-compliant recommendations, but it provides the data framework you need to complete your NMP manually or with your agronomist. Export field-by-field soil and application data to share with your FACTS-qualified adviser. Keep your NMP updated each year before the main growing season begins — inspectors look for evidence that fertiliser planning is based on current soil data, not figures carried over from several years ago.`,
    },
    {
      id: 18,
      title: "Soil Testing and Sampling Records",
      category: "Fields & Crops",
      content: `<img src="/api/help-images/field-register.png" alt="Soil Testing Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

Regular soil testing is a fundamental part of good crop husbandry and is specifically required by Red Tractor. The Combinable Crops standard requires soil sampling on a minimum 5-year cycle for all fields, and recommends more frequent testing for fields with intensive cropping programmes or where soil health is a concern.\n\nTo record a soil test result in BDE Farm Trac, navigate to the field in the Fields & Crops section and open the Soil Tests tab. Enter the sampling date, the laboratory that carried out the analysis, the sample reference number, and the index values for pH, phosphate (P), potassium (K), and magnesium (Mg). Where a full soil health analysis is available — including organic matter percentage, bulk density, or earthworm counts — these can be entered in the extended fields.\n\nThe system tracks when each field was last sampled and will surface overdue soil tests on the Fields & Crops dashboard. A field is flagged as overdue if no sample has been recorded in the last five years, or earlier if you have set a more frequent cycle in the field settings.\n\nWhere soil pH falls below 6.0, the system generates a lime recommendation alert. Applying lime to bring soil to the correct pH is not only agronomically beneficial but is required by Red Tractor before further phosphate or nitrogen applications are made to the affected field. Record any lime applications in the fertiliser records section with the product name (e.g. ground limestone, calcium carbide), rate per hectare, and application date. Retain laboratory analysis reports from your sampling contractor — these are the primary evidence an inspector will look for.`,
    },
    {
      id: 19,
      title: "Harvest Records and Yield Tracking",
      category: "Fields & Crops",
      content: `<img src="/api/help-images/field-register.png" alt="Harvest Records and Yield Tracking" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

Harvest records document the yield achieved from each field at the end of the growing season. These records are used to support nutrient management planning (comparing actual yield against the planned yield used to calculate nitrogen demand), to verify biofuel feedstock quantities for RTFO purposes, and to provide the traceability data required by Red Tractor's combinable crops standard.\n\nTo record a harvest in BDE Farm Trac, navigate to Fields & Crops and open the Harvest Records section. Click Add Harvest Record and select the field and crop. Enter the harvest date, the yield in tonnes, the moisture content at harvest (percentage), and the storage location or destination (e.g. home store, co-op, direct to merchant). If the grain is destined for biofuel processing, tick the Biofuel Feedstock flag — this links the harvest record to the Biofuel / RTFO module.\n\nThe Harvest Dashboard provides an at-a-glance summary of total yield, yield per hectare by crop type, and a comparison against the previous season. Use this to identify underperforming fields and to update your agronomic plan for the following season. Moisture content at harvest is important not just for grain quality but because it affects the dry-matter yield figure used in NMP calculations — the system applies a standard conversion factor when calculating dry-matter tonnes from the as-harvested moisture figure.\n\nFor Red Tractor traceability purposes, each harvest record generates a unique batch reference that can be quoted on grain movement documents. This enables the system to build a chain of custody from field to store to dispatch, which is particularly important for assured combinable crops sold into the milling or malting market.`,
    },
    {
      id: 20,
      title: "Livestock Medicine Records and Withdrawal Periods",
      category: "Livestock",
      content: `<img src="/api/help-images/medicine-records.png" alt="Medicine Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>UK law requires all livestock keepers to maintain a medicines register for any veterinary medicinal product administered to animals. This record must be kept for at least five years and must be made available to your vet, APHA, and Red Tractor inspectors on request.</p>

<h3>What to Record</h3>
<p>For each medicine administered, you must record:</p>
<ul>
<li>Date of treatment</li>
<li>Identity of animals treated (ear tag numbers for cattle, or pen/group identifier for sheep, pigs, or poultry)</li>
<li>Product name and batch number</li>
<li>Dose administered and route (injection, oral, topical, in-feed)</li>
<li>Withdrawal period end date</li>
<li>Name of person who administered the treatment</li>
</ul>

<h3>Withdrawal Period Tracking</h3>
<p>The system tracks withdrawal period end dates for all treated animals. Animals with active withdrawal periods are flagged with a yellow warning banner on the Medicine Records page. This is a safety net — you remain legally responsible for ensuring no animal enters the food chain within its withdrawal period.</p>

<h3>Adding a Medicine Record</h3>
<p>Go to <strong>Livestock</strong> and open the <strong>Medicine Records</strong> section. Click <strong>Add Medicine Record</strong>. For cattle, select individual animals by ear tag from your current herd list. For sheep or pigs, select the group or pen. The system pre-fills the standard withdrawal period from the product database — always verify against the product label, as your vet may prescribe an extended withdrawal period under a cascade arrangement. Where a prescription-only medicine (POM-V) is used, attach the vet prescription using the document attachment function.</p>`,
    },
    {
      id: 21,
      title: "Pest Control and Cleaning Records",
      category: "Biosecurity",
      content: `<img src="/api/help-images/help-centre.png" alt="Pest Control and Cleaning Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

Red Tractor requires farms to operate a systematic pest control programme, particularly for rodents in and around grain stores, feed stores, and livestock buildings. A record of each pest control visit — whether carried out by a contractor or in-house — must be kept, including what was found, what action was taken, and when the next inspection is due.\n\nIn BDE Farm Trac, navigate to Biosecurity and open the Pest Control tab. Click Add Pest Control Record to log a visit. Record the date, the name of the pest control operative or contractor, the areas inspected, any pests found (species and approximate numbers), the treatment applied (bait type and quantity, trap type, proofing work carried out), and the next scheduled inspection date. For Red Tractor purposes, the frequency of pest control inspections should be set based on risk — typically monthly for active grain stores and quarterly for lower-risk areas.\n\nCleaning and disinfection (C&D) records are required wherever livestock are housed, handled, or transported, and for vehicles and equipment that move between holdings. For each C&D event, record the date, the area or equipment cleaned, the disinfectant product used (name and DEFRA approval number), the dilution rate, the contact time, and the name of the operative. DEFRA-approved disinfectants for use under disease-control orders must be used at the label-specified concentration.\n\nFor poultry and pig producers, thorough cleanse-and-disinfect records between production cycles are a mandatory Red Tractor requirement. The system will calculate the time elapsed since the last C&D record for each building and surface this on the Biosecurity dashboard when the interval exceeds your configured threshold. Keep C&D records for at least three years.`,
    },
    {
      id: 22,
      title: "Using the Mobile App for Field Recording",
      category: "Mobile App",
      content: `<img src="/api/help-images/dashboard-overview.png" alt="Mobile App Field Recording" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

The BDE Farm Trac mobile app allows you and your staff to capture field records on the go — without needing to carry paper forms or return to the office to enter data. Records created on the mobile app are queued locally on the device and automatically synchronised to the server the next time the device has a data or Wi-Fi connection.\n\n<h3>Operator Name Lookup on Mobile</h3>\n<p>The <strong>Operator</strong> field on both the Spray Record and Harvest Record forms in the mobile app uses a staff member picker rather than a plain text box. Tapping the field opens a searchable list of the staff members registered to your farm, so you can find the correct person quickly — even with a large team. Selecting a staff member links the record to their profile on the dashboard, where their PA certificates and training records are held. If no staff have been added to the farm yet, or if you are recording on behalf of a contractor not in your staff list, a manual name entry field is shown beneath the picker so you can still complete the record without delay.</p>\n\nTo log in to the mobile app, open it on your device and sign in with the same email and password you use for the web dashboard. If your farm has multiple users, each person should use their own credentials — records will be attributed to the individual who created them, which is important for spray operator records and staff training compliance.\n\nThe Record tab in the mobile app provides quick-entry forms for all common in-field and yard tasks:\n\nArable & Field\n• Spray Record — pesticide, herbicide and fungicide applications with GPS coordinates and weather conditions\n• Seed Drilling Record — crop and variety (linked to your Crops Register), seed lot number, seed rate and unit, treatment product, driller name and area drilled\n• Field Operation — cultivation, tillage, lime spreading, rolling, cover crops and drainage with depth, passes and implement\n• Field Crop Inspection — pest and disease observations, growth stage, action flags (Monitor / Treat / Urgent) and resolution notes\n• Soil Sample — GPS-captured sample location, depth, lab submission and analysis results\n• NVZ Fertiliser Application — organic and synthetic fertiliser applications in Nitrate Vulnerable Zones\n• Harvest Record (Combine) — field, crop, yield, moisture, timing and operator for each combining session\n• Transport Run (Driver) — links to today's harvest sessions, vehicle/trailer number, storage destination and load notes; resets after each save for quick multi-run logging\n\nLivestock\n• Livestock Health Check — daily welfare inspection with condition scoring, mortality flag and feed/water status\n• Livestock Movement — on-farm, off-farm and between-holding animal movements with CPH details\n• Animal Mortality Record — cause of death, disposal method, BCMS notification and vet attendance\n• Medicine Record — veterinary medicines, dosage, withdrawal periods and batch numbers\n• Feed Record — feed deliveries with supplier, batch number and quantity\n• Water Quality Record — water source, test results, lab certificate upload and herd linkage\n\nBiosecurity & Compliance\n• Visitor Log — visitor name, company, purpose and biosecurity declaration status\n• Pest Control Visit — bait stations, trap checks, pest activity and control actions\n• Cleaning & Disinfection — cleaning of livestock buildings, vehicles and equipment\n• Waste Disposal Record — waste type, quantity, disposal method, carrier licence number, destination site and Waste Transfer Note reference\n• Equipment Defect Report — machinery faults, unsafe equipment flags and corrective actions\n• Add Farm Location — register a new building or storage area on site; device GPS is captured automatically and the location is saved live to the dashboard, immediately available in dropdowns and on the Farm Map\n\nEnvironmental & Reporting\n• Weather Entry — daily weather observations for compliance records\n• Environmental Event — management activities linked to agri-environment schemes and habitat features\n• Photo Capture — geotagged photographs for evidence and compliance documentation\n• Land Eligibility Declaration — RTFO/ISCC field land-use declaration\n• Biofuel Crop Delivery — crop consignment, buyer, RTFO reference and sustainability scheme\n\nEach form is designed to be completed quickly in a field or yard environment. Mandatory fields are clearly marked and the form will not submit until all required information is entered. GPS coordinates are captured automatically on save where relevant. For spray records, weather conditions are prompted if no connected station is detected.\n\nRecords that have been created on the device but not yet synced are shown in the Pending Sync section on the Home tab. If synchronisation fails (for example due to a validation error), the record is retained on the device and an error message is shown. Correct the record and attempt to sync again. Once synced, records appear in the web dashboard immediately and can be reviewed, edited (by authorised users), or included in compliance reports.`,
    },
    {
      id: 24,
      title: "Livestock Movement Reporting: Scotland, Wales and Northern Ireland",
      category: "Livestock",
      content: `<img src="/api/help-images/livestock-movements.png" alt="Livestock Movement Reporting" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

BDE Farm Trac supports the livestock movement reporting requirements of all four UK devolved nations. The correct portal depends on where your holding is registered and which species you keep.\n\nTo configure your farm's country, go to Farm Settings, scroll to the Location section, and set the Country / Devolved Nation field. The Movements page will then display the appropriate portal quick-links and show scheme-specific fields in Farm Settings.\n\nScotland — ScotEID: All livestock movements in Scotland (cattle, sheep, goats, pigs, and deer) are reported to ScotEID (scoteid.com), which is operated by Scotland's Rural College (SRUC) on behalf of the Scottish Government. ScotEID is Scotland's central electronic identification and movement database. Cattle in Scotland must also have their movements recorded with BCMS. In Farm Settings you can enter your ScotEID flock or herd number, which appears on movement exports.\n\nWales — EIDCymru and eAML2: Wales operates EIDCymru (eidcymru.org) for sheep and goat movements. This is a Welsh Government-operated system equivalent to eAML2 in England. Pig movements in Wales continue to use eAML2. Cattle movements in Wales are reported to BCMS Online, as in England. In Farm Settings you can enter your EIDCymru flock number, which will appear on Wales-specific movement exports.\n\nNorthern Ireland — NIFAIS and APHIS: Northern Ireland uses NIFAIS (Northern Ireland Food Animal Information System) for cattle movement and traceability. Sheep and pig movements are managed through APHIS (Animal & Public Health Information System). Both systems are operated by DAERA (Department of Agriculture, Environment and Rural Affairs). Contact DAERA or visit daera-ni.gov.uk to register and access these systems.\n\nFor all countries, record each movement in BDE Farm Trac first, then submit to the appropriate portal within the legal time limit (3 days for cattle; scheme-specific for other species). Always paste the portal's reference number back into the BDE Farm Trac movement record once submitted.`,
    },
    {
      id: 23,
      title: "Analytical Dashboards and Compliance Snapshots",
      category: "Dashboards",
      content: `<img src="/api/help-images/help-centre.png" alt="Help Centre and Dashboards" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>BDE Farm Trac includes a set of analytical dashboards that give you an at-a-glance view of your farm’s performance and compliance status across key areas. These dashboards update in real time as records are added.</p>

<h3>Available Dashboards</h3>
<ul>
<li><strong>Harvest Dashboard</strong> — yield per hectare by crop type, total production for the season, and a year-on-year comparison.</li>
<li><strong>NVZ Compliance Dashboard</strong> — nitrogen applied per field as a proportion of the 170 kg N/ha organic manure limit, highlighting fields within closed periods.</li>
<li><strong>Soil Health Dashboard</strong> — aggregates soil test results and surfaces fields with below-target pH or overdue sampling.</li>
<li><strong>Fleet Status Dashboard</strong> — traffic-light view of all machinery: green (calibration current), amber (due within 90 days), red (overdue).</li>
<li><strong>Livestock Health Dashboard</strong> — summary of medicine treatments, active withdrawal periods, and mortality records by group.</li>
</ul>

<h3>Exporting Dashboard Snapshots</h3>
<p>All dashboards can be exported as a PDF summary report, suitable for sharing with your agronomist, vet, or assurance body. Click the <strong>Export</strong> button at the top right of each dashboard view to generate a dated PDF snapshot.</p>`,
    },
    {
      id: 25,
      title: "Sharing Records with Advisors and Inspectors",
      category: "Getting Started",
      content: `<img src="/api/help-images/help-centre.png" alt="Advisor and Inspector Access" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

BDE Farm Trac includes a secure external access system that lets you share read-only views of your farm records with anyone who needs to review them — without giving them a full login or access to your entire account. This is designed for agronomists, FACTS advisers, vets, Red Tractor certification bodies, banks, and any other party that periodically needs to review your compliance records.\n\nThe Advisors & External Access feature is available under Settings. It has two tiers.\n\nAdvisor Accounts are for recurring advisors who need regular access — for example your agronomist, BASIS consultant, or vet. You create an advisor account by entering their name, email address, role, and choosing which of 15 modules they can view. Once saved, a secure link is automatically copied to your clipboard. You send that link by email. The advisor clicks it and sees a clean, read-only view of exactly the modules you chose. Their access is permanent until you revoke it. The system records when they last accessed the view, which is visible on your settings page.\n\nInspection Sessions are for time-limited access — most commonly for Red Tractor Certification Body inspectors, one-off audits, or bank reviews. You create a session by entering the inspector's name, organisation, and purpose (e.g. Red Tractor Inspection, Environmental Audit, Due Diligence). You set an expiry date — typically 7 to 30 days — and choose the modules to share. A secure link is generated and copied to your clipboard. No account is required — the link is the key. The session card on your settings page shows a colour-coded expiry badge (green, amber, or red as the date approaches) and an access count showing how many times the link has been used.\n\nThe read-only view that advisors and inspectors see opens in any browser without a login prompt. It shows a green banner across the top confirming they are in read-only mode, the farm's name and registration details (CPH number, Red Tractor ID, SBI number, farm manager), and a section for each permitted module with a table of all records in that module. They cannot edit, add, or delete anything. An expired or revoked link shows a clear error message directing them to contact the farm.\n\nAll access is logged. A full access log at the bottom of your Advisors & External Access settings page records every time an external party views your records — their name, whether they are an advisor account or inspection session, and the exact date and time. This log itself is evidence of your transparency with your assurance body, and if Red Tractor moves toward requiring digital record-sharing as part of the certification process, you will already have the infrastructure in place.`,
    },
    {
      id: 27,
      title: "Logging Field Operations",
      category: "Fields & Crops",
      content: `<img src="/api/help-images/field-register.png" alt="Field Operations Log" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The Field Operations module is part of Field &amp; Crop Management and provides a dedicated log for all cultivation, soil amendment, and other field activity events. Keeping these records supports your Red Tractor evidence file and is particularly important for demonstrating good soil management practice — a growing area of focus in Combinable Crops and Fresh Produce standards.</p>

<h3>What Counts as a Field Operation?</h3>
<p>Field operations cover any physical work carried out on land that is not a spray application or a fertiliser/FYM spreading event (which are recorded in Sprays &amp; Inputs and the NVZ module respectively). Examples include:</p>
<ul>
<li><strong>Primary cultivation</strong> — ploughing, sub-soiling, mole ploughing</li>
<li><strong>Secondary cultivation</strong> — power harrowing, discing, tine harrowing, rotovating, stubble cultivation</li>
<li><strong>Consolidation</strong> — rolling, Cambridge rolling, bed forming</li>
<li><strong>Soil amendments</strong> — lime spreading, gypsum application, compost/organic matter application</li>
<li><strong>Crop establishment</strong> — cover crop seeding, cover crop rolling/crimping, cover crop desiccation</li>
<li><strong>Drainage</strong> — mole drainage, drainage repair works</li>
<li><strong>Other applications</strong> — slug pellets, irrigation</li>
</ul>

<h3>Logging an Operation</h3>
<p>Navigate to <strong>Field Operations</strong> in the sidebar (under Field &amp; Crop Management). Click <strong>Log Operation</strong> and complete the form:</p>
<ol>
<li>Select the <strong>date</strong> and choose the <strong>operation type</strong> from the grouped dropdown.</li>
<li>Select the <strong>field</strong> from your field register (this auto-fills the area). If the field is not yet registered, type the name manually.</li>
<li>Enter the <strong>implement or machinery</strong> used — for example "Lemken Diamant 11 5-furrow" or "Sumo Trio 5m". This is useful for cross-referencing with equipment maintenance records.</li>
<li>For cultivation operations, enter the <strong>working depth in centimetres</strong> and the <strong>number of passes</strong>. Working depth is a useful indicator of soil disturbance and is referenced in soil carbon baseline assessments.</li>
<li>For lime, compost, gypsum, or slug pellet applications, enter the <strong>quantity</strong> and <strong>unit</strong> (e.g. 4 t/ha).</li>
<li>Enter the <strong>operator name</strong> and any <strong>notes</strong> about soil conditions, weather, or observations.</li>
</ol>

<h3>Filtering and Searching</h3>
<p>The field operations log can be filtered by operation type using the dropdown above the table, and searched by field name, implement, or operator name using the search bar. This makes it straightforward to find all rolling events for a specific field, or all operations carried out by a specific contractor, without scrolling through the full log.</p>

<h3>Red Tractor and Soil Management</h3>
<p>Red Tractor's Combinable Crops standard requires evidence of soil management practices. Keeping a complete cultivation log — with dates, depths, and implements — demonstrates that you are actively managing soil structure. This is particularly relevant if your farm is in a Soil Health Stewardship agreement or if you are asked to evidence minimum tillage commitments under an agri-environment scheme. Link relevant field operation records to your Environmental Features log where applicable.</p>`,
    },
    {
      id: 28,
      title: "Logging Animal Mortality Records",
      category: "Livestock",
      content: `<img src="/api/help-images/medicine-records.png" alt="Livestock Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>Accurate mortality records are a legal requirement for all livestock keepers and form a key part of your Red Tractor audit evidence. The BDE Farm Trac Livestock module now includes a dedicated <strong>Mortality Records</strong> tab that captures all the information required by law and by your assurance body.</p>

<h3>Legal Requirements</h3>
<p>Under The Livestock (Record Keeping) (England) Regulations and equivalent devolved legislation, you must record the death of every bovine animal within 7 days and notify BCMS (the British Cattle Movement Service) within that period. For sheep, pigs, and goats, deaths must be recorded in the farm register with the date, cause of death, and disposal method. All mortality records must be retained for a minimum of <strong>3 years</strong>.</p>

<h3>What to Record</h3>
<p>For each animal death, record the following:</p>
<ul>
<li><strong>Ear tag / tag number</strong> — for cattle, the official UK ear tag number</li>
<li><strong>Species and breed</strong></li>
<li><strong>Date of death</strong></li>
<li><strong>Cause of death</strong> — disease, injury, metabolic disorder, difficult birth, hypothermia, predation, euthanised, or unknown</li>
<li><strong>Disposal method</strong> — NFAS fallen stock collection, hunt kennel/knacker, licensed incineration/cremation, on-farm burial (with licence), or rendering plant</li>
<li><strong>Collector/operator name</strong> and <strong>disposal reference number</strong> (e.g. NFAS certificate number)</li>
<li><strong>Whether a vet attended</strong> and, if so, their name</li>
<li><strong>Whether a post-mortem was carried out</strong> and the findings</li>
<li><strong>BCMS notification reference</strong> (cattle only)</li>
</ul>

<h3>Adding a Mortality Record — Dashboard</h3>
<p>Go to <strong>Livestock</strong> in the left-hand sidebar and click the <strong>Mortality</strong> tab. Click <strong>Add Record</strong>. Complete all required fields — the form guides you through cause of death and disposal method using standard classification options. Tick <strong>BCMS notified</strong> once you have submitted the notification to the BCMS Online portal, and enter the reference number you receive.</p>

<h3>Adding a Mortality Record — Mobile App</h3>
<p>Tap <strong>Record</strong> on the bottom navigation bar and select <strong>Animal Mortality Record</strong>. The form includes the same fields as the dashboard. The record is saved to your device immediately and synced to the cloud when you next have an internet connection. This is particularly useful for recording deaths discovered in the field before you return to the office.</p>

<h3>Disposal Documentation</h3>
<p>You must retain the collection certificate or consignment note from your fallen stock collector. For on-farm burial you must hold a valid burial licence issued by the Environment Agency (England) or equivalent devolved body. Link these documents to the mortality record using the document attachment function.</p>

<h3>Linking to the Individual Animal Register</h3>
<p>If the animal that died is already registered in the <strong>Individual Animals</strong> tab on the Livestock page, the ear tag, EID transponder number, breed, and date of birth are already on record. Cross-reference the mortality entry with the individual animal record and update the animal’s status to “Deceased” so that the Individual Animals register remains accurate. See the Help Centre article <em>Individual Animal Register and Electronic Identification (EID)</em> for guidance on registering animals.</p>

<h3>Red Tractor Context</h3>
<p>Red Tractor Livestock Standards require that mortality records are maintained and available for inspection. The BDE Farm Trac Mortality tab is structured around the information checklist used by Red Tractor assessors, so completing a record in the system means your paper trail is ready for audit without separate filing.</p>`,
    },
    {
      id: 29,
      title: "Feed Records and Traceability",
      category: "Livestock",
      content: `<img src="/api/help-images/medicine-records.png" alt="Feed Records and Traceability" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>Feed traceability is a core requirement of Red Tractor's Livestock Standards. For cattle, sheep, pigs, and poultry, you must be able to demonstrate which feedstuffs were fed, who supplied them, and — crucially — what batch or lot number each delivery came from. The BDE Farm Trac <strong>Feed Records</strong> tab (under Livestock) provides a structured log that satisfies this requirement.</p>

<h3>Why Batch Numbers Matter</h3>
<p>If there is a feed recall or a contamination incident, the batch number on your records allows you to identify which animals may have been exposed, when, and in what quantity. Without batch records, you cannot provide this traceability evidence and could face a Red Tractor non-conformance. Retain all original delivery notes and purchase invoices — the batch number on your BDE Farm Trac record must match the batch number printed on the delivery note or bag.</p>

<h3>What to Record</h3>
<p>For each feed delivery or ration change, record:</p>
<ul>
<li><strong>Feed type</strong> — compound pellets, silage, hay, minerals, milk replacer, TMR, etc.</li>
<li><strong>Supplier name</strong></li>
<li><strong>Batch / lot number</strong> — as printed on the delivery note, bag, or bulk load documentation</li>
<li><strong>Quantity (kg)</strong></li>
<li><strong>Date of delivery or feeding</strong></li>
<li><strong>Herd or flock name</strong> — which group received the feed</li>
</ul>

<h3>Adding a Feed Record — Dashboard</h3>
<p>Go to <strong>Livestock</strong> in the sidebar and select the <strong>Feed Records</strong> tab. Click <strong>Add Feed Record</strong>. Select the feed type from the drop-down list, enter the supplier name and batch/lot number, and enter the quantity in kilograms. Click <strong>Save Record</strong>. All feed records are listed in date order so that you can cross-reference them against medicine records and welfare checks for any given period.</p>

<h3>Adding a Feed Record — Mobile App</h3>
<p>Tap <strong>Record</strong> in the bottom navigation bar and select <strong>Feed Record</strong>. Enter the herd/flock name, choose the feed type, and fill in the supplier and batch number fields before saving. The record is saved locally and synced automatically when a connection is available — ideal for recording at the point of delivery, before paperwork is misplaced.</p>

<h3>Feed Records vs Daily Welfare Checks</h3>
<p>The <strong>Livestock Health Check</strong> screen in the mobile app includes a quick "Feed OK" toggle — this is a daily observation record, not a traceability record. The dedicated <strong>Feed Record</strong> is what satisfies the Red Tractor feed traceability requirement and should be completed for each distinct delivery or batch change.</p>`,
    },
    {
      id: 30,
      title: "Water Quality Testing Records",
      category: "Livestock",
      content: `<img src="/api/help-images/medicine-records.png" alt="Water Quality Testing Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>Providing clean, fresh water is a fundamental animal welfare requirement, and for certain species and water sources Red Tractor requires formal annual testing by an accredited laboratory. The BDE Farm Trac <strong>Water Quality Records</strong> tab (under Livestock) is where you log each test and its outcome, attach the lab certificate, and link the test to the specific herd or flock that relies on that water source.</p>

<h3>When Testing Is Required</h3>
<ul>
<li><strong>Pigs and poultry</strong> — annual water quality testing is mandatory under Red Tractor Pigs and Red Tractor Poultry standards, regardless of whether the source is mains or non-mains.</li>
<li><strong>Cattle and sheep (non-mains sources)</strong> — where water is supplied from a borehole, stream, reservoir, or other non-mains source, annual testing is required. Mains water supplied by a regulated water company does not require independent testing, though a record confirming the source type is still recommended.</li>
</ul>

<h3>What Tests Are Required</h3>
<p>Testing should cover microbiological parameters (E. coli, total coliforms, Enterococcus) and, where applicable, chemical parameters (nitrate levels, hardness, pH). Use a UKAS-accredited laboratory for testing. Your vet or assurance body can advise on appropriate test parameters for your species and water source.</p>

<h3>Linking Tests to Herds &amp; Flocks</h3>
<p>Each water quality record is linked to a specific herd or flock from your <strong>Herd &amp; Flock Register</strong>. This creates a searchable history per animal group — so you can quickly show an inspector every water test carried out for your pig finishing unit or dairy herd, together with the results and certificates. On the dashboard, the herd is selected when adding a record. On the mobile app, your registered herds appear as selectable tiles; if no herds are yet registered, you can type the name manually.</p>

<h3>Adding a Water Record — Dashboard</h3>
<p>Go to <strong>Livestock</strong> in the sidebar and select the <strong>Water Quality</strong> tab. Click <strong>Add Water Record</strong>. Select the water source from the drop-down (mains, borehole, stream, reservoir, bowser, or other), enter the test date, the result description (e.g. "Pass — E. coli &lt;1 CFU/100ml"), and set the overall outcome to Pass or Fail. If the test fails, record the remedial action taken in the Notes field and log a follow-up test once the issue is resolved.</p>

<h3>Adding a Water Record — Mobile App</h3>
<p>Tap <strong>Record</strong> in the bottom navigation bar and select <strong>Water Quality Record</strong>. The form guides you through:</p>
<ol>
<li><strong>Herd or flock</strong> — select from your registered herds, or type a name if none are registered yet</li>
<li><strong>Water source</strong> — choose from: Mains, Borehole / Well, Stream / River, Farm Reservoir, Rainwater Harvesting, Water Bowser, or Other</li>
<li><strong>Test date and result</strong> — enter the date and select the result category (Pass — Suitable, Pass — Monitor, or the relevant Fail reason)</li>
<li><strong>Suitability toggle</strong> — confirm whether the water is suitable for livestock. If you toggle this to <em>Not Suitable</em>, you will be asked to confirm before the record is saved. See the Failed Tests section below</li>
<li><strong>Notes</strong> — lab reference number, remedial actions, retest date</li>
</ol>
<p>GPS coordinates of the water source location are automatically captured when you save the record, provided location permissions are granted. The record syncs to the server automatically when the device next has a connection.</p>

<h3>Attaching Lab Certificates — Dashboard</h3>
<p>Your laboratory will issue a test certificate (typically a PDF or scanned letter). This certificate is the primary audit evidence — the digital record in BDE Farm Trac provides the index, history, and search functionality. To attach a certificate:</p>
<ol>
<li>Go to <strong>Livestock → Water Quality</strong> and find the test record in the table</li>
<li>Click the <strong>Lab Certs</strong> button on the right side of the row</li>
<li>In the panel that opens, enter the laboratory's reference number and a certificate title (optional — if left blank, the title is generated automatically from the reference number)</li>
<li>Click <strong>Choose File</strong> and select the PDF or photo of the certificate</li>
<li>The file uploads and is stored against that specific test record. It is immediately accessible via the view link and will be included in audit exports</li>
</ol>
<p>You can attach multiple certificates to a single record (for example, where a lab issues separate microbiological and chemical reports). Each attachment can be deleted individually if you upload the wrong file.</p>

<h3>Failed Tests &amp; Urgent Alerts</h3>
<p>If a test returns a fail result, you must take immediate action to prevent animal welfare issues. When you mark a water record as unsuitable — either by selecting a fail result or toggling the suitability switch to off — the system responds as follows:</p>
<ul>
<li><strong>Mobile app</strong> — a confirmation prompt explains that an urgent alert will be sent when the record syncs. The save button turns red and a warning banner confirms the fail state before you save</li>
<li><strong>On sync</strong> — a critical notification is raised on the farm dashboard and, if the SMS Alerts module is active, an SMS is sent immediately to all farm management contacts. The message identifies the herd, the water source, and the test result, and instructs recipients to restrict access to the water source</li>
</ul>
<p>Typical remedial steps include switching to an alternative water source, installing UV or chlorination treatment, and arranging a follow-up test. Document all steps taken in the Notes field of a new record once the issue is resolved. Red Tractor assessors will look for evidence that failed tests were followed up promptly and that corrective action was effective before the source was returned to use.</p>`,
    },
    {
      id: 31,
      title: "Environmental Management — Features, Schemes & Management Events",
      category: "Environmental",
      content: `<img src="/api/help-images/field-register.png" alt="Environmental Management" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The Environmental Management module in BDE Farm Trac brings together four connected record-keeping areas under a single section: your <strong>Environmental Features</strong> register, your <strong>Agri-environment Schemes</strong>, your <strong>Assessments</strong>, and now a dedicated <strong>Management Events</strong> log. Together, these four tabs give you a complete audit trail of your environmental stewardship — ready for Red Tractor inspections and Natural England / RPA scheme reviews alike.</p>

<h3>Tab 1 — Environmental Features</h3>
<p>Your features register is a catalogue of all the environmentally significant land features on your holding. For each feature, record the type (hedgerow, field margin, woodland, pond, ditch, grass strip, stone wall, or other), its area or length, and any notes about condition or management history. Features can be linked to specific fields in your field register, giving you a joined-up view of your land and its environmental assets.</p>
<p>Red Tractor Combinable Crops and other sector standards require evidence that you know where your environmentally sensitive features are and that you are managing them appropriately. The features register satisfies this by providing a searchable, datestamped list that can be exported for an inspector or shared with an agri-environment scheme adviser.</p>

<h3>Tab 2 — Agri-environment Schemes</h3>
<p>Record all current and historical agri-environment scheme agreements here — Sustainable Farming Incentive (SFI) actions, Countryside Stewardship (CS) agreements, Higher Tier agreements, and any legacy Environmental Stewardship or Entry Level Stewardship agreements. For each scheme, log the scheme name, agreement reference, start and end date, annual payment value, and the land or actions covered. This record is the reference point that the Management Events tab links to when you flag an event as fulfilling a scheme obligation.</p>

<h3>Tab 3 — Assessments</h3>
<p>Environmental assessments record formal surveys, reviews, or audits carried out on your land. Examples include farm environment plans, whole-farm assessments carried out with an agri-environment adviser, hedgerow surveys, or SSSI condition assessments. Record the date, assessment type, assessor name, findings, and any follow-up actions required. These records demonstrate a proactive approach to environmental management — increasingly valued by Red Tractor and required by many agri-environment scheme conditions.</p>

<h3>Tab 4 — Management Events</h3>
<p>The Management Events log is a chronological record of all physical management activities carried out on environmental features. This is the evidence that your features are being actively managed — not just mapped. For each event, record:</p>
<ul>
<li><strong>Date</strong> — when the management work was carried out</li>
<li><strong>Event type</strong> — choose from 14 types: Hedge Trimming, Pond Clearance, Mowing, Scrub Clearance, Ditch Clearance, Vegetation Management, Tree Work, Grazing, Spraying (e.g. invasive species), Cultivation, Planting, Water Management, Pest &amp; Invasive Species Control, or Other</li>
<li><strong>Feature</strong> — link the event to a specific feature from your features register, or enter a location description if the feature is not yet registered</li>
<li><strong>Description</strong> — what was done, how, and any relevant observations</li>
<li><strong>Operator or Contractor</strong> — who carried out the work. If a contractor was used, enter their name</li>
<li><strong>Scheme obligation</strong> — tick if this event was carried out to fulfil an agri-environment scheme requirement, and select the relevant scheme from your schemes list. This links the management event directly to your scheme record</li>
<li><strong>Notes</strong> — any additional context, weather conditions, machinery used, or follow-up actions required</li>
</ul>

<h3>Logging a Management Event — Mobile App</h3>
<p>Tap <strong>Record</strong> on the bottom navigation bar and select <strong>Environmental Management Event</strong>. The mobile form includes all the same fields. Log the event in the field as soon as the work is done — this is particularly important for inspection evidence, as records logged on the day carry more weight than retrospective entries.</p>

<h3>Red Tractor Context</h3>
<p>Under Red Tractor's Combinable Crops standard, farms must demonstrate that they are managing in-field and boundary environmental features appropriately. A Management Events log — showing that hedge trimming was carried out at the right time of year, that pond margins were cleared, or that ditch maintenance was completed — is direct evidence of active stewardship. For farms in agri-environment schemes, the obligation-linking feature means you can show inspectors exactly which scheme action each management event satisfies, reducing the risk of a non-conformance finding.</p>

<h3>NVZ and Timing Rules</h3>
<p>Some management activities are subject to seasonal restrictions. Hedge trimming, for example, must not take place between 1 March and 31 August under the Wildlife &amp; Countryside Act 1981 (with limited exceptions). Ditch management may be restricted in or near SSSIs or under agri-environment scheme conditions. BDE Farm Trac does not automatically validate management dates against legal restrictions, so it remains your responsibility to check the applicable rules before carrying out management work. Record the actual date the work was done — do not backdate entries.</p>`,
    },
    {
      id: 32,
      title: "Field Inspections — Logging, Action Flags & Resolution Tracking",
      category: "Fields & Crops",
      content: `<img src="/api/help-images/field-register.png" alt="Field Inspections" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The Field Inspections feature allows you and your team to log in-field crop inspection findings — either from the mobile app while out in the field or retrospectively via the web dashboard. Every inspection is stored against your farm record, automatically surfaced on the dashboard, and — where the inspection flags a treatment or urgent action — an alert notification is raised and, where the SMS Alerts module is active, an SMS is sent immediately to all designated Farm Managers and opted-in users.</p>

<h3>Logging an Inspection from the Mobile App</h3>
<p>Open the BDE Farm Trac mobile app, tap <strong>Record</strong> on the bottom navigation bar, and select <strong>Field Inspection</strong>. Complete the form fields:</p>
<ul>
<li><strong>Field name</strong> — type the field name or select it from your field register</li>
<li><strong>Inspection date</strong> — defaults to today; change if recording retrospectively</li>
<li><strong>Crop type &amp; growth stage</strong> — enter the crop being inspected and its current growth stage (e.g. BBCH 31 — stem extension, or "flag leaf")</li>
<li><strong>Pest / disease observations</strong> — free text describing what was seen. Include pest species, disease symptoms, percentage of crop affected, and field sections impacted</li>
<li><strong>Action required</strong> — select one of four options: <strong>None</strong>, <strong>Monitor</strong>, <strong>Treat</strong>, or <strong>Urgent</strong></li>
<li><strong>Recommended action</strong> — describe the specific action proposed (e.g. "apply fungicide T1, target septoria")</li>
<li><strong>Inspector name</strong> — your name or the agronomist's name</li>
<li><strong>Notes</strong> — any additional context</li>
</ul>
<p>Tap <strong>Save</strong>. The record is queued on the device and automatically synced to the server the next time you have a data or Wi-Fi connection. Once synced, the inspection appears on the Field Inspections page of the web dashboard immediately.</p>

<h3>Action Flags</h3>
<p>The action flag is the key field for prioritisation and alerting:</p>
<ul>
<li><strong>None</strong> — no action needed; the inspection is informational</li>
<li><strong>Monitor</strong> — conditions warrant watching; revisit within a defined period. No alert is raised, but the inspection appears in the Monitoring count on the dashboard</li>
<li><strong>Treat</strong> — a spray or other treatment is recommended. A warning notification is created and appears in your dashboard notification feed</li>
<li><strong>Urgent</strong> — immediate action is required. A critical notification is raised and an SMS alert is sent immediately to all designated Farm Managers and any users who have opted in to SMS notifications. Urgent inspections appear highlighted in red on the dashboard</li>
</ul>

<h3>Dashboard — Field Inspections Page</h3>
<p>Navigate to <strong>Field Inspections</strong> in the left sidebar (under Fields &amp; Crops). The page shows four summary cards at the top:</p>
<ul>
<li><strong>Total Inspections</strong> — all inspections on record for this farm</li>
<li><strong>Open Actions</strong> — unresolved treat or urgent inspections requiring a response</li>
<li><strong>Monitoring</strong> — active monitor-flagged inspections not yet resolved</li>
<li><strong>Resolved This Month</strong> — inspections resolved in the current calendar month</li>
</ul>
<p>The table below lists all inspections with field name, date, crop type, observation summary, action badge, and inspector name. Use the search box to filter by field name or inspector, and use the status and action filters to narrow the list to open actions, monitoring flags, or resolved records.</p>

<h3>Viewing an Inspection</h3>
<p>Click <strong>View</strong> on any row to open a detail panel showing all fields recorded during the inspection, including the full observation text, recommended action, growth stage, and — if the inspection has been resolved — the resolution details. Use this panel to review an inspection before deciding whether to resolve it or escalate further.</p>

<h3>Resolving an Action</h3>
<p>Once the required action has been taken (e.g. a treatment spray has been applied), mark the inspection as resolved:</p>
<ol>
<li>Click <strong>Resolve</strong> on the table row, or click <strong>View</strong> and then <strong>Mark as Resolved</strong> in the detail panel</li>
<li>Enter your name in the <strong>Resolved by</strong> field — this is required</li>
<li>Enter <strong>Resolution notes</strong> describing what action was taken, when, and by whom (e.g. "T1 fungicide applied 18 March by J. Davies — Amistar Top at 1.0 L/ha")</li>
<li>Click <strong>Mark Resolved</strong></li>
</ol>
<p>The inspection status updates to <strong>Resolved</strong> with a green badge, the resolution date and name are recorded, and the Open Actions count on the dashboard decreases accordingly. Resolved inspections remain on record and can be viewed at any time for audit purposes.</p>

<h3>Red Tractor Context</h3>
<p>Regular field inspections are a core requirement of the Red Tractor Combinable Crops and Fresh Produce standards. Inspectors will expect to see evidence that crop conditions are being monitored throughout the season, that pest and disease pressures are being assessed by a qualified person, and that any treatments applied follow from a documented recommendation. The Field Inspections log provides that audit trail: each record is datestamped, attributed to a named inspector, and links directly to any resulting spray applications through the Spray Records module.</p>
<p>For farms employing BASIS-qualified agronomists, the recommendation records within each inspection serve as a lightweight version of the agronomist's written advice — though they do not replace a full written spray recommendation where one is required by the scheme.</p>`,
    },
    {
      id: 33,
      title: "Farm Buildings & Areas Registry",
      category: "Biosecurity",
      content: `<img src="/api/help-images/field-register.png" alt="Farm Buildings and Areas Registry" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The Farm Buildings &amp; Areas registry is your farm's master list of physical locations — buildings, yards, stores, and outdoor areas. Once defined here, these locations appear as structured dropdown selections across Cleaning &amp; Disinfection, Pest Control, COSHH Assessments, and Risk Assessments. This means every record uses the same, consistently-named location, making it possible to build a complete history of what was done in each building or area.</p>

<h3>Why This Matters for Red Tractor</h3>
<p>Red Tractor inspectors reviewing biosecurity records often ask about specific buildings — when was Cattle Shed 3 last cleaned? What pest control has been carried out in the grain store? If every record uses slightly different names for the same location (e.g. "Dairy parlour", "dairy parlour", "milking parlour"), these records are impossible to group meaningfully. A structured location registry solves this at source.</p>

<h3>Setting Up Your Locations</h3>
<p>Navigate to <strong>Biosecurity → Farm Locations</strong> in the sidebar. Click <strong>Add Location</strong> and enter:</p>
<ul>
<li><strong>Location Name</strong> — use the name everyone on the farm calls it. Include numbers where relevant (Cattle Shed 1, Cattle Shed 2, etc.)</li>
<li><strong>Location Type</strong> — choose from Livestock Building, Crop &amp; Feed Store, Equipment &amp; Workshop, Chemical &amp; Fuel Store, Outdoor Area / Yard, Welfare Facility, Office / Farm Building, or Other.</li>
<li><strong>Description</strong> (optional) — any additional context, e.g. "200-cow cubicle shed, east of yard"</li>
<li><strong>Notes</strong> (optional) — any additional information about access, hazards, or special procedures.</li>
</ul>
<p>Add every building and area that might appear in a cleaning, pest control, or risk assessment record. You can add more locations at any time and mark old ones as <strong>Inactive</strong> if they are demolished or no longer used — inactive locations are hidden from dropdowns but their historical records are preserved.</p>

<h3>GPS Map Pins</h3>
<p>Each location can be given an exact GPS position, which places it on the Farm Map. To set a pin, open any location's edit dialog and expand the <strong>Map pin</strong> section. A satellite map appears with two ways to position the pin:</p>
<ul>
<li><strong>Click on the map</strong> — click anywhere on the map to drop a pin at that point. Drag the pin to fine-tune its position.</li>
<li><strong>Use device GPS</strong> — click the crosshair button to jump the map to your current location and place the pin there automatically. This is most accurate when you are standing at or near the building.</li>
</ul>
<p>The coordinate pair is shown alongside the pin toggle so you can confirm it looks correct. Once saved, a <strong>Pinned</strong> badge appears on the location's card in the list, and the coordinates are shown in small text below the description. Pins can be updated at any time by re-opening the edit dialog.</p>

<h3>The Farm Map</h3>
<p>Once one or more locations have been pinned, the <strong>Farm Map</strong> page is available at the top of the Biosecurity section in the sidebar. This page shows all pinned locations plotted on an OpenStreetMap satellite view with colour-coded markers — each location type has its own colour (blue for livestock buildings, yellow for crop stores, red for chemical stores, green for outdoor areas, and so on).</p>
<p>The left-hand panel lists all pinned locations and can be filtered by type or searched by name. Clicking any item in the list pans the map to that location and opens a popup showing the name, type, and description. Clicking a marker on the map directly also opens its popup. Locations that do not yet have a pin are shown in a "Not yet pinned" section at the bottom of the panel with a direct link to add their coordinates.</p>
<p>A <strong>View Map</strong> button also appears at the top right of the Farm Locations list page as a shortcut once at least one pin has been set.</p>

<h3>Adding Locations from the Mobile App</h3>
<p>If you are on site and want to register a new building or area immediately — for example, setting up a temporary beet store or a new contractor's compound — you can add it directly from the mobile app without returning to the office. On the Record tab, select <strong>Add Farm Location</strong>.</p>
<p>The mobile screen collects the same fields as the web dashboard: name, location type, description, and notes. When you tap Save, the app captures your device's GPS coordinates automatically and saves the location live to the server (not to a local queue). The new location is immediately available in the web dashboard and on the Farm Map.</p>
<p>An <strong>Add Another</strong> option on the success screen lets you register multiple locations back-to-back while you are walking the yard — useful when commissioning a new storage area with several bays or sections.</p>

<h3>Using Locations in Other Modules</h3>
<p>Once you have defined your farm's locations, opening any Cleaning &amp; Disinfection, Pest Control, COSHH, or Risk Assessment record will show a dropdown picker for the area/location field, grouped by location type. If a specific location is not in the list, you can still type a custom value using the <strong>Other / type your own</strong> option at the bottom of the dropdown.</p>

<h3>Viewing Location History</h3>
<p>Because all records now reference the same standardised location names, you can use the Search function on each module page to filter all records for a specific building — for example, searching "Dairy Parlour" on the Cleaning page will show every cleaning event ever recorded in the dairy parlour, in date order. This is exactly the kind of evidence that satisfies an auditor asking for a location-specific history.</p>`,
    },
    {
      id: 26,
      title: "Understanding Business Reports",
      category: "Finance & Business",
      content: `<img src="/api/help-images/business-reports.png" alt="Business Reports" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The Business Reports module is a standalone analytical layer that draws on data recorded across your entire BDE Farm Trac account — harvest records, financial transactions, livestock movements, agri-environment schemes, and equipment records — to generate structured management reports. Available at £5/month per farm.</p>

<h3>Report Tabs</h3>
<ul>
<li><strong>Compliance Summary</strong> — Red Tractor compliance scores across all record-keeping areas, with progress bars showing percentage completion per category.</li>
<li><strong>Spray Overview</strong> — total applications by product, area treated, and cost per hectare for the selected period.</li>
<li><strong>Livestock Report</strong> — herd or flock summary including movements, medicine treatments, and mortality rates.</li>
<li><strong>Financial Summary</strong> — gross margin by crop, P&amp;L statement, and input cost breakdown as a percentage of total expenditure.</li>
<li><strong>Field Analysis</strong> — yield per hectare by field and crop type, with year-on-year comparison.</li>
<li><strong>Audit Trail</strong> — a log of all record edits, creations, and deletions across the account for the selected period.</li>
<li><strong>Custom Report</strong> — build your own report by selecting any combination of data fields and date range.</li>
</ul>

<h3>Exporting Reports</h3>
<p>Each report can be exported as a PDF or CSV using the <strong>Export PDF</strong> button at the top right of the report view. PDF exports include your farm name, report period, and a BDE Farm Trac watermark — suitable for sharing with accountants, agronomists, or your assurance body.</p>`,
    },
    {
      id: 34,
      title: "SMS Text Alerts — Setup, Who Receives Them & Opting In",
      category: "Account & Settings",
      content: `<img src="/api/help-images/dashboard-overview.png" alt="SMS Text Alerts Settings" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The <strong>SMS Text Alerts</strong> add-on sends critical compliance notifications to your mobile phone as text messages, so you are immediately informed of issues that need urgent attention — even if you are not logged in to the dashboard. This article explains how to activate the feature, who receives alerts, and how each user can manage their personal preferences.</p>

<h3>Activating the Add-On</h3>
<p>SMS Text Alerts is an optional add-on available at £4 per farm per month. It is not included in any base subscription. To activate it, contact your BDE Farm Trac account manager or visit your Subscription Settings page in the dashboard. Once active, the SMS Alerts module appears as enabled on the Account &amp; Notifications page for all users on that farm.</p>

<h3>What Triggers an SMS</h3>
<p>Only critical compliance events trigger a text message. These are:</p>
<ul>
<li><strong>Unnotified livestock movement</strong> — a movement on or off the holding has not been notified to the relevant authority (BCMS / APHA / ScotEID / EIDCymru) within the required 3-day window</li>
<li><strong>Water quality failure</strong> — a water quality test has been logged with a fail result, indicating the water source may be unsuitable for livestock</li>
<li><strong>Expired staff certificate</strong> — a mandatory training certificate (e.g. PA1/PA6, first aid, sprayer operator) has passed its expiry date</li>
<li><strong>Overdue non-conformance</strong> — a non-conformance or corrective action has escalated beyond 7 days without resolution</li>
<li><strong>Overdue pest control follow-up</strong> — a pest control record has a follow-up date set and that date has passed without a subsequent visit being logged. The alert fires once the date is breached and repeats weekly until a new record is added for that area</li>
<li><strong>Overdue cleaning &amp; disinfection schedule</strong> — a cleaning &amp; disinfection record has a "next due" date set and that date has passed without a new cleaning record being logged. The alert fires on the due date and repeats weekly until a new clean is recorded for that building or area</li>
</ul>
<p>Warning-level notifications (e.g. field inspection "treat" flags, upcoming certificate expiries) appear only in the in-app notification panel — they do not trigger a text message.</p>

<h3>Who Receives SMS Alerts</h3>
<p>The system sends critical alerts to two groups of users:</p>
<ul>
<li><strong>Designated Farm Managers</strong> — users who have been designated by the BDE Farm Trac account administrator as alert recipients. This designation is set on the account (not by the individual user) and is intended for farm owners, farm managers, and anyone who needs to be informed of critical compliance issues regardless of their personal notification preferences. Farm Managers receive critical alerts automatically once a mobile number is saved on their account — they do not need to manually opt in.</li>
<li><strong>Opted-in users</strong> — any other user on the account who has added a mobile number and set their alert level to "Critical alerts only" or "All alerts" in Account &amp; Notifications.</li>
</ul>
<p>In both cases, the user must have a UK mobile number saved on their account. Setting the alert level to "No SMS alerts" always overrides the Farm Manager designation — so if a designated manager explicitly opts out, they will not receive texts.</p>

<h3>Setting Your Personal Preferences — Account &amp; Notifications</h3>
<p>Go to <strong>Account &amp; Notifications</strong> in the sidebar (bottom of the navigation). The SMS Text Notifications card shows your current settings.</p>
<p>Enter your UK mobile number in E.164 format (e.g. <code>+447911123456</code>). Then choose your alert level:</p>
<ul>
<li><strong>No SMS alerts</strong> — you will only receive in-app notifications. This setting overrides any Farm Manager designation</li>
<li><strong>Critical alerts only</strong> — you will receive texts for the critical events listed above</li>
<li><strong>All alerts</strong> — you will receive texts for every compliance notification, including warnings and reminders</li>
</ul>
<p>If you are a designated Farm Manager, you receive critical alerts automatically when a number is saved — but you can still choose "Critical alerts only" or "All alerts" if you want to also receive non-critical notifications via text.</p>
<p>Tick the consent checkbox confirming you agree to receive compliance alert messages from BDE Farm Trac, then click <strong>Save preferences</strong>. You can update or withdraw consent at any time by returning to this page.</p>

<h3>Updating the Farm Manager Designation</h3>
<p>The Farm Manager alert designation is managed by BDE Farm Trac staff, not by individual users. If you need someone added as a designated alert recipient — or removed — contact your BDE Farm Trac account manager. The designation is shown on the user list in the BDE admin portal and can be toggled without affecting the user's role or access permissions.</p>

<h3>In-App Notifications</h3>
<p>SMS alerts run alongside the in-app notification system, which operates independently of the SMS add-on. In-app notifications appear in the bell icon panel at the top right of the dashboard and are visible to all users logged into the farm. They are not per-user — all farm users see the same notification list. Marking a notification as read or deleting it updates it for everyone on that farm.</p>`,
    },
    {
      id: 35,
      title: "Waste Disposal Logging — Records, Carrier Licences & Legal Requirements",
      category: "Risk & Waste",
      content: `<img src="/api/help-images/field-register.png" alt="Waste Disposal Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>UK environmental law requires farms to keep records of how they dispose of business waste. This applies to all controlled waste produced on your holding — including used chemical containers, silage wrap, scrap metal, used oil, used tyres, clinical and veterinary waste, and any other non-household waste. Records must demonstrate that waste was handed to a licensed carrier and transferred only to a permitted facility.</p>

<h3>Accessing the Waste Disposal Log</h3>
<p>In the web dashboard, navigate to <strong>Risk &amp; Waste Management</strong> and open the <strong>Waste Disposal</strong> tab. Click <strong>Add Waste Disposal Record</strong> to log a disposal event. On the mobile app, open the Record tab and select <strong>Waste Disposal Record</strong> — useful for logging a collection at the time it happens without returning to a desk.</p>

<h3>What to Record</h3>
<p>For each waste disposal event, you should record:</p>
<ul>
<li><strong>Waste type</strong> — be as specific as possible (e.g. "empty pesticide containers" rather than "plastic waste")</li>
<li><strong>Quantity</strong> — number of items, estimated weight, or skip size as appropriate</li>
<li><strong>Disposal date</strong> — the date the waste was collected or taken off site</li>
<li><strong>Disposal method</strong> — carrier collection, return to supplier, skip hire, licensed landfill, approved incineration, etc.</li>
<li><strong>Carrier name and licence number</strong> — when a contractor collects waste, they must be registered with the Environment Agency (or SEPA/NRW in Scotland and Wales). Their licence number begins with the prefix "CB" for England and Wales. Accepting waste from an unlicensed carrier is an offence even if you did not know the carrier was unlicensed — always verify the number before handing waste over.</li>
<li><strong>Destination site</strong> — the name and postcode of the recycling centre, treatment facility or landfill that will receive the waste</li>
<li><strong>Waste Transfer Note (WTN) number</strong> — a WTN is a legally required document that must be completed and signed by both parties whenever controlled waste changes hands. Waste Transfer Notes must be kept on file for <strong>at least two years</strong>. Enter the WTN reference number in BDE Farm Trac and keep the signed paper or digital document alongside your records.</li>
</ul>

<h3>When a WTN Is Not Required</h3>
<p>You do not need a Waste Transfer Note if you are returning waste to the original supplier (for example returning empty chemical containers under a take-back scheme), or if the waste is classified as agricultural waste that qualifies for an exemption under the Environmental Permitting Regulations. When in doubt, obtain a WTN — the paperwork is straightforward and protects you in the event of an Environment Agency check.</p>

<h3>Special Categories of Waste</h3>
<p>Some farm waste types have additional requirements beyond a standard WTN:</p>
<ul>
<li><strong>Used oil</strong> — must be collected by a registered waste oil collector. It is illegal to mix used oil with other liquids, burn it in unauthorised appliances, or pour it onto land.</li>
<li><strong>Clinical and veterinary waste</strong> — sharps (needles, scalpel blades), expired medicines, and spent vaccine vials must be disposed of by an approved clinical waste contractor. Never place these in general waste skips or household bins.</li>
<li><strong>Animal by-products (ABP)</strong> — fallen stock, renderings, and similar ABP are subject to the Animal By-Products Regulations and must be removed by an approved ABP collector or sent to an approved processing facility. Records of ABP collections are also required under ABP legislation independently of the waste disposal record.</li>
<li><strong>Asbestos</strong> — asbestos from farm buildings must be handled by a licensed contractor and disposed of at a permitted asbestos landfill. A hazardous waste consignment note is required instead of a standard WTN.</li>
</ul>

<h3>Red Tractor Inspection Checklist</h3>
<p>Red Tractor inspectors look for evidence that farm waste — particularly used chemical containers and pesticide packaging — is managed legally. Ensure that:</p>
<ul>
<li>Empty pesticide containers have been triple-rinsed and the rinsate added to the spray tank</li>
<li>Containers are stored in a secure, covered area before collection</li>
<li>Evidence of collection (WTN or take-back scheme receipt) is available for the last three years</li>
<li>Waste disposal records in BDE Farm Trac match the paper WTNs held on file</li>
</ul>`,
    },
    {
      id: 36,
      title: "Week Ahead — Your 7-Day Compliance Planner",
      category: "Getting Started",
      content: `<img src="/api/help-images/dashboard-overview.png" alt="Week Ahead Compliance Planner" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The <strong>Week Ahead</strong> page gives you a single, consolidated view of every scheduled task, upcoming due date, and overdue item across all of your active modules — covering the next seven days plus anything that has already passed its due date. It is designed to be the first thing a farm manager or agronomist checks at the start of the week to make sure nothing slips through before an audit or inspection.</p>

<h3>Accessing the Week Ahead</h3>
<p>Click <strong>Week Ahead</strong> in the sidebar — it sits just below the main Dashboard link so it is always within one click from anywhere in the system. The page header shows the date range currently displayed (e.g. "21 Mar – 27 Mar 2026") and a count of how many tasks are in view.</p>

<h3>What It Shows</h3>
<p>The Week Ahead pulls scheduled dates from all of the following record types automatically — you do not need to configure anything:</p>
<ul>
<li><strong>Pest Control</strong> — follow-up visit dates set when logging a pest control record</li>
<li><strong>Cleaning &amp; Disinfection</strong> — "next due" dates set when logging a cleaning event</li>
<li><strong>Biosecurity Plan</strong> — plan review dates set in the Biosecurity Plan section</li>
<li><strong>Staff Certificates</strong> — certificate expiry dates (e.g. PA1, PA6, first aid, sprayer operator)</li>
<li><strong>Training Records</strong> — course expiry dates for any logged training</li>
<li><strong>Inspections &amp; Audits</strong> — next inspection due dates and corrective action due dates</li>
<li><strong>Risk Assessments</strong> — scheduled review dates for active risk assessments</li>
<li><strong>Equipment Maintenance</strong> — next maintenance due dates from maintenance logs</li>
<li><strong>Equipment Calibration</strong> — next calibration due dates from calibration records</li>
</ul>
<p>Only records belonging to your currently selected farm are shown. If a module is not active on your subscription, dates from that module will not appear.</p>

<h3>How Tasks Are Grouped</h3>
<p>Tasks are displayed in chronological order and grouped into day buckets:</p>
<ul>
<li><strong>Overdue</strong> — tasks whose due date has already passed (shown at the very top in red). The system looks back up to 60 days so that anything missed in the past two months is still surfaced.</li>
<li><strong>Today</strong> — tasks due on today's date</li>
<li><strong>Tomorrow</strong> — tasks due the following day</li>
<li><strong>Named weekdays</strong> — remaining days of the 7-day window (e.g. "Wednesday 25 Mar")</li>
</ul>
<p>Each task card shows the task name, a short description of what needs to be done, the module it belongs to (shown as a colour-coded badge), and a days-overdue indicator where relevant. Clicking any card takes you directly to the relevant module page so you can log the completed action immediately.</p>

<h3>How to Use It Effectively</h3>
<p>The Week Ahead works best when you set due dates consistently as you log records. For example:</p>
<ul>
<li>When logging a pest control visit, always set the <strong>Follow-up date</strong> based on the frequency required for that area (monthly for active grain stores, quarterly for lower-risk areas)</li>
<li>When logging a cleaning event, always enter the <strong>Next due date</strong> based on your cleaning schedule</li>
<li>When adding a risk assessment, set the <strong>Review date</strong> to match your assessment cycle (typically annual for standard assessments)</li>
<li>When adding staff certificates, ensure the <strong>Expiry date</strong> is entered accurately — the Week Ahead will surface it in the week before expiry</li>
</ul>
<p>If a task appears in the Overdue section, click through to the relevant module, complete and log the action, then ensure the next due date is set in the new record. The old overdue item will disappear from the Week Ahead once it is no longer the most recent record for that building or area.</p>

<h3>Relationship with SMS Alerts</h3>
<p>The Week Ahead is a visual planning tool — it does not replace the SMS alert system. Critical overdue biosecurity items (pest control follow-ups and cleaning schedules) will also trigger SMS text notifications to designated farm managers and opted-in users when the SMS Text Alerts add-on is active. The Week Ahead shows all upcoming and overdue tasks, whereas SMS alerts fire only when a date is breached and only for critical categories.</p>`,
    },
    {
      id: 37,
      title: "Individual Animal Register and Electronic Identification (EID)",
      category: "Livestock",
      modules: ["livestock-management"],
      content: `<img src="/api/help-images/livestock.png" alt="Individual Animals" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The <strong>Individual Animals</strong> tab on the Livestock page lets you maintain a register of every animal on your holding by its unique identifier. This is a requirement for BCMS cattle records, strongly recommended for UK sheep flocks of 10 or more animals under the EID regulations, and useful for any species where traceability of individual animals matters for medicine records, breeding, or Red Tractor audit evidence.</p>

<h3>UK Identification Requirements</h3>
<p>Different livestock species have different legal identification requirements:</p>
<ul>
<li><strong>Cattle:</strong> Every bovine must carry two approved ear tags within 20 days of birth (or before it leaves the holding of birth, whichever is earlier). The ear tag number is the basis of the cattle passport and must be reported to BCMS for all movements and at death. Format: UK followed by the 6-digit herd number and a 6-digit individual number (e.g. UK123456 000001).</li>
<li><strong>Sheep (flocks of 10 or more in England &amp; Wales):</strong> Under the Sheep and Goats (Records, Identification and Movement) (England) Regulations, all sheep born from January 2010 must carry electronic identification (EID) in the form of an approved electronic bolus or ear tag conforming to ISO 11784/11785. The EID transponder number is a 15-digit code (e.g. 826 000123456789). Older animals carry a flock mark tag showing your county parish holding (CPH) prefix.</li>
<li><strong>Pigs:</strong> Must carry a slap mark or ear tag showing the herd mark number before leaving the holding. Individual EID is not currently required for pigs in the UK but the herd mark must be recorded on movement documents.</li>
<li><strong>Goats and Deer:</strong> Broadly follow sheep rules. All goats born after 2010 require electronic identification.</li>
</ul>

<h3>Using the Individual Animals Tab</h3>
<p>Go to <strong>Livestock</strong> in the left-hand sidebar and click the <strong>Individual Animals</strong> tab. Click <strong>Add Animal</strong> to open the registration form. The form collects:</p>
<ul>
<li><strong>Ear Tag Number</strong> — the primary official identifier (BCMS format for cattle; flock mark for sheep; herd mark for pigs)</li>
<li><strong>EID Transponder Number</strong> — the 15-digit ISO 11784 electronic identifier. Required for sheep in flocks ≥10 animals; optional for other species. Format example: 826 000123456789</li>
<li><strong>Alternative / Internal ID</strong> — a house name or management number used on your farm (e.g. “Bessie” or “42”)</li>
<li><strong>Species, Breed, Sex, and Date of Birth</strong></li>
<li><strong>Herd / Flock assignment</strong> — links the animal to an existing herd or flock on the same farm</li>
<li><strong>Acquisition details</strong> — date acquired, source (born on farm, purchased, or transferred in), and source CPH number</li>
<li><strong>Status</strong> — Active, Sold, Deceased, or Transferred Out</li>
<li><strong>Notes</strong> — any additional management information</li>
</ul>

<h3>EID Format Reference</h3>
<p>The ISO 11784 EID number printed on the ear tag or bolus is a 15-digit code structured as a 3-digit country code followed by a 12-digit animal number. For UK animals the country code is <strong>826</strong>. The full number (with or without the leading country code) is what the reader device will show when you scan the animal. Enter the number exactly as it appears — either as 15 continuous digits or space-separated (826 000123456789).</p>

<h3>Linking Individual Animals to Other Records</h3>
<p>Once an animal is registered in the Individual Animals tab, its identifier can be cross-referenced in other parts of the system:</p>
<ul>
<li><strong>Movements:</strong> When recording a livestock movement, enter the registered ear tag numbers in the Ear Tag / ID Numbers field of the movement form. The movement record and the individual animal record are then linked by tag number.</li>
<li><strong>Medicine Records:</strong> Record medicine treatments against the herd or flock, and note individual ear tag numbers in the treatment record when the medicine is administered to specific animals.</li>
<li><strong>Mortality Records:</strong> When an animal dies, add a Mortality Record and update the animal’s Status to “Deceased” in the Individual Animals tab. This keeps your register accurate and makes it easy to show inspectors that all animals on your starting count are accounted for.</li>
</ul>

<h3>Red Tractor Context</h3>
<p>Red Tractor assessors will check that individual cattle are properly identified and that passports are present. For sheep, they will check that EID ear tags are in place and that your register is current. Maintaining the Individual Animals register in BDE Farm Trac gives you an auditable, timestamped record of every animal on the holding that you can print or export ahead of an inspection.</p>`,
    },
    {
      id: 38,
      title: "Milk Recording and Milk Records",
      category: "Dairy",
      summary: "How to log individual cow and herd milk yield, somatic cell count, and total bacterial count in the Dairy module.",
      content: `<img src="/api/help-images/livestock.png" alt="Dairy Milk Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<h3>What is a Milk Record?</h3>
<p>A milk record in BDE Farm Trac captures the key quality and yield data measured at each official recording visit or bulk tank dip. The data you record is used to monitor herd performance, identify cows whose milk quality is declining, and provide an auditable trail for Red Tractor dairy assessment.</p>

<h3>Key Fields Explained</h3>
<ul>
<li><strong>Recording Date:</strong> The date of the official milk recording visit or the bulk tank reading.</li>
<li><strong>Cow Ear Tag:</strong> The individual cow's UK ear tag, or leave as "Herd" for bulk tank records. If the cow is registered in the Individual Animals tab on the Livestock page, enter the same tag number to create a cross-reference.</li>
<li><strong>Yield (litres):</strong> Total milk yield for the session (morning + evening or 24-hour total depending on your recording method).</li>
<li><strong>Somatic Cell Count (SCC):</strong> Measured in thousands of cells per millilitre. Red Tractor and EU regulations require bulk tank SCC to remain below 400,000 cells/ml on average. Individual cow SCC over 200,000 may indicate mastitis.</li>
<li><strong>Total Bacterial Count (TBC):</strong> Measured in thousands of colony-forming units per millilitre. The UK statutory limit is 100,000 cfu/ml. Persistently elevated TBC indicates a hygiene or cooling problem.</li>
<li><strong>Fat % and Protein %:</strong> Compositional data from the recording visit. Protein percentage is used to calculate payment from most milk purchasers.</li>
<li><strong>Lactation Number:</strong> Which lactation the cow is currently in. First-lactation heifers typically have different benchmarks to mature cows.</li>
<li><strong>Recorder / Method:</strong> The name of the milk recording organisation (e.g. AHDB, NMR) or "farm recording" if done in-house.</li>
</ul>

<h3>Bulk Tank Records</h3>
<p>Use the <strong>Bulk Tank</strong> tab in the Dairy page for whole-herd readings taken from the bulk milk tanker dip results sheet. These are separate from individual cow records and represent the pooled quality of all milk delivered. Enter the collection date, volume collected (litres), fat %, protein %, SCC, and TBC as printed on the tanker sheet from your milk buyer.</p>

<h3>Mobile App</h3>
<p>Milk records are primarily managed on the dashboard Dairy page. For field or parlour recording, use the dashboard directly on a tablet, or record yields on paper and enter them into the system within 24 hours of the recording session.</p>

<h3>Red Tractor Context</h3>
<p>Red Tractor dairy standards require records of individual cow milk quality and yield to be retained and available for inspection. SCC trends, TBC trends, and bulk tank records are key audit evidence. BDE Farm Trac's Dairy module stores all records with date-stamped entries that you can export to CSV or print ahead of an inspection visit.</p>`,
    },
    {
      id: 39,
      title: "Mastitis Records and Treatment Logging",
      category: "Dairy",
      summary: "Recording clinical mastitis cases in BDE Farm Trac — quarters, clinical grade, treatment product, and withdrawal periods.",
      content: `<img src="/api/help-images/livestock.png" alt="Mastitis Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<h3>Why Record Mastitis?</h3>
<p>Mastitis is the most costly disease in UK dairy herds. Red Tractor dairy standards require you to keep records of clinical mastitis cases including the animal affected, the clinical grade, the treatment used, and who prescribed it. These records demonstrate that you are managing mastitis systematically and observing medicine withdrawal periods before returning milk to the bulk tank.</p>

<h3>Recording a Case</h3>
<p>Open the <strong>Dairy</strong> page from the sidebar and select the <strong>Mastitis</strong> tab. Click <em>Add Mastitis Record</em>. You will need:</p>
<ul>
<li><strong>Cow Ear Tag:</strong> The UK ear tag of the affected cow. On the mobile app, enter the tag directly.</li>
<li><strong>Date of Onset:</strong> The date the case was first identified — not the treatment date.</li>
<li><strong>Quarters Affected:</strong> Select one or more quarters (left fore, right fore, left hind, right hind). You may select multiple.</li>
<li><strong>Clinical Grade:</strong> Grade 1 (mild — clots/abnormal milk only), Grade 2 (moderate — swelling, cow off-colour), Grade 3 (severe — cow systemically ill, off food, fever). Grade 3 cases require vet attendance.</li>
<li><strong>Treatment Product:</strong> The intramammary tube or systemic antibiotic used, including number of tubes/doses.</li>
<li><strong>Treatment Duration:</strong> Number of days the treatment course runs.</li>
<li><strong>Vet Consulted:</strong> Tick if a vet was consulted. For Grade 3 cases this is a Red Tractor requirement.</li>
</ul>

<h3>Withdrawal Periods</h3>
<p>Every intramammary product has a milk withdrawal period. Milk from treated quarters must not enter the bulk tank until the withdrawal period has elapsed from the last treatment. BDE Farm Trac stores the treatment start date and duration but does not automatically calculate withdrawal periods — always refer to the product data sheet or your vet. Record the actual date milk was returned to tank in the notes field.</p>

<h3>Mobile App</h3>
<p>Mastitis cases are often identified during or immediately after milking. Use the <strong>Mastitis Record</strong> option in the Record tab of the mobile app to capture the case immediately in the parlour. The record saves locally and syncs to the server when you are back in signal range. The dashboard Mastitis tab will show all synced records.</p>

<h3>Red Tractor Context</h3>
<p>Red Tractor requires you to record every clinical mastitis case, demonstrate that you have a mastitis management plan, and show that milk withdrawal periods are observed. The Mastitis tab on the Dairy page provides a complete, date-ordered log that you can filter by cow or date range and print for an inspector.</p>`,
    },
    {
      id: 40,
      title: "Calving Records and Colostrum Management",
      category: "Dairy",
      summary: "Logging calvings in BDE Farm Trac — ease scores, calf outcome, BCMS passport, and colostrum protocol compliance.",
      content: `<img src="/api/help-images/livestock.png" alt="Calving Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<h3>Why Record Calving Events?</h3>
<p>Calving records provide the foundation for your herd's reproductive performance data, your BCMS compliance evidence, and your Red Tractor animal welfare documentation. Every calving — including stillbirths and assisted births — must be recorded. The calving record in BDE Farm Trac captures the full event including calving ease, calf outcome, colostrum management, and BCMS passport status.</p>

<h3>Recording a Calving Event</h3>
<p>Open the <strong>Dairy</strong> page from the sidebar and select the <strong>Calving Records</strong> tab. Click <em>Add Calving Record</em>. Complete the following:</p>
<ul>
<li><strong>Cow Ear Tag:</strong> The dam's UK ear tag number.</li>
<li><strong>Calving Date:</strong> The actual date of birth — not the date you entered the record.</li>
<li><strong>Calving Ease Score:</strong> Select from Unassisted, Easy Pull, Hard Pull, Mechanical Assistance, or C-Section. This score is used to monitor calving difficulty trends across the herd.</li>
<li><strong>Number of Calves:</strong> Usually 1. Record twins where applicable.</li>
<li><strong>Calf Outcome:</strong> Live, Stillbirth, Weak — survived, or Weak — died. Stillbirths must still be reported to BCMS if the calf died within 24 hours of birth.</li>
<li><strong>Calf Sex and Ear Tag:</strong> The calf's sex and its newly applied UK ear tag. For bull calves destined for sale, the ear tag is the key BCMS reference.</li>
<li><strong>Assistance and Vet Attendance:</strong> Record whether assistance was required and whether a vet attended.</li>
</ul>

<h3>Colostrum Management</h3>
<p>Colostrum management is a critical welfare and compliance area. Best practice — and Red Tractor requirement — is for calves to receive colostrum within 2 hours of birth, and a full feed within 6 hours. On the calving form, record:</p>
<ul>
<li><strong>Colostrum given within 2 hours:</strong> Tick if the calf received its first feed within 2 hours of birth.</li>
<li><strong>Colostrum given within 6 hours:</strong> Tick if the full feed protocol was completed within 6 hours.</li>
<li><strong>Volume of first feed:</strong> Typically 2–3 litres. Record the actual volume given.</li>
<li><strong>Colostrum source:</strong> Dam, frozen colostrum bank, powder supplement, or pooled colostrum. Using the dam's own colostrum is preferred.</li>
</ul>

<h3>BCMS Passport</h3>
<p>For cattle born on your holding, you must apply to BCMS for a cattle passport within 27 days of birth. Mark the <em>BCMS Passport Application Submitted</em> field once you have applied. The calf's ear tag number and date of birth on the calving record match what you will submit to BCMS.</p>

<h3>Mobile App</h3>
<p>The <strong>Calving Record</strong> form in the mobile app's Record tab allows you to capture all calving data at the calving pen immediately after birth. The record saves offline and syncs when you are in range.</p>

<h3>Red Tractor Context</h3>
<p>Red Tractor dairy assessors review calving records to confirm that calving ease is being monitored, that colostrum protocols are in place and being followed, and that BCMS obligations are being met. BDE Farm Trac's calving records give you a timestamped, auditable log of every birth with colostrum management evidence attached.</p>`,
    },
    {
      id: 41,
      title: "Dry Cow Therapy (DCT) Records",
      category: "Dairy",
      summary: "Recording selective and blanket dry cow therapy in BDE Farm Trac — product, dose, SCC history, and withdrawal period tracking.",
      content: `<img src="/api/help-images/livestock.png" alt="Dry Cow Therapy" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<h3>What is Dry Cow Therapy?</h3>
<p>Dry cow therapy (DCT) is the antibiotic (or non-antibiotic teat sealant) treatment given to cows at drying off to prevent new intramammary infections during the dry period. Since 2022, veterinary prescription is required for all antibiotic DCT products in the UK. BDE Farm Trac's DCT Records tab allows you to maintain a complete log of every cow treated at drying off, the product used, and the prescribing vet — a Red Tractor and regulatory requirement.</p>

<h3>Selective vs Blanket DCT</h3>
<p>UK government guidance now recommends <strong>selective dry cow therapy</strong> — treating only cows with a history of mastitis or elevated SCC, rather than blanket treatment of all cows. BDE Farm Trac allows you to record the treatment approach (selective or blanket) and the clinical justification (SCC history, mastitis history, or vet recommendation). The SCC data held in Milk Records can be used to support the clinical decision and should be referenced in the DCT record.</p>

<h3>Recording a DCT Event</h3>
<p>Open the <strong>Dairy</strong> page from the sidebar and select the <strong>Dry Cow Therapy</strong> tab. Click <em>Add DCT Record</em>. Complete the following:</p>
<ul>
<li><strong>Cow Ear Tag:</strong> The treated cow's UK ear tag.</li>
<li><strong>Drying Off Date:</strong> The date the cow was dried off and treatment was administered.</li>
<li><strong>DCT Product:</strong> The full product name and formulation (e.g. Orbenin Extra Dry Cow, 3g cloxacillin). Include teat sealant if used alongside antibiotic (e.g. Orbeseal).</li>
<li><strong>Prescribing Vet:</strong> The name of the prescribing vet and their practice. Required for antibiotic DCT products.</li>
<li><strong>Prescription Reference:</strong> The prescription number or date — traceable back to your vet's records.</li>
<li><strong>Quarters Treated:</strong> Record which quarters were treated (all four for blanket, specific quarters for selective).</li>
<li><strong>SCC at Last Recording:</strong> Enter the cow's SCC at her most recent milk recording visit to document the clinical basis for treatment.</li>
<li><strong>Expected Calving Date:</strong> Used to calculate the anticipated milk withdrawal date (calving date + statutory withdrawal period).</li>
</ul>

<h3>Withdrawal Periods</h3>
<p>Antibiotic DCT products have a mandatory milk withdrawal period that begins from the point of calving. You must not include milk from treated cows in the bulk tank until the withdrawal period has elapsed after calving. BDE Farm Trac records the drying off date and expected calving date; always check the product data sheet for the exact withdrawal period and record the actual date milk was cleared for the tank in the notes field.</p>

<h3>Red Tractor Context</h3>
<p>Red Tractor dairy standards require full records of all DCT treatments including the product used, the prescribing vet, and the treatment justification for selective DCT. Assessors will check that antibiotic usage is being minimised, that prescriptions are held on file, and that withdrawal periods are being observed. The DCT Records tab in BDE Farm Trac gives you a complete, date-ordered log that satisfies these requirements.</p>`,
    },
    {
      id: 42,
      title: "Workshop & Asset Management — Overview",
      category: "Workshop",
      summary: "How to use the Workshop module to manage job cards, service schedules, and QR code labels for your farm equipment.",
      content: `<img src="/api/help-images/field-register.png" alt="Workshop Overview" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The <strong>Workshop &amp; Asset Management</strong> module gives farm managers a complete maintenance control centre for all machinery, vehicles, and fixed assets. It is designed around the reality of modern farm workshops — reactive repairs, planned servicing, and the need to prove to Red Tractor assessors that equipment is kept in safe working order.</p>

<h3>The Eight Workshop Tabs</h3>
<ul>
<li><strong>Assets & QR Codes</strong> — Register every piece of equipment with a unique <strong>EQ-XXXX</strong> code. Generate and print a scannable QR label for instant mobile access from the field or workshop.</li>
<li><strong>Job Cards</strong> — Raise a job card for any repair, scheduled service, inspection, or investigation. Set the priority (Low, Medium, High, Critical) and track progress through Open → In Progress → Awaiting Parts → Completed. Record labour time, parts used, root cause analysis, and total cost per job.</li>
<li><strong>Service Schedule</strong> — Log every maintenance event against an asset and set the next-due date. The system automatically flags assets as <em>Overdue</em> (red), <em>Due Soon</em> (amber), or <em>OK</em> (green) based on today's date.</li>
<li><strong>Fleet Overview</strong> — A live summary of every registered asset: status (Operational, Broken Down, In Service, Retired, Sold), hours or odometer reading, and current location. Assets with overdue maintenance are highlighted automatically.</li>
<li><strong>PAT Testing</strong> — Log annual portable appliance tests for all workshop electrical equipment. Records the tester, certificate number, pass / fail / advisory result, and next test due date, with automatic overdue alerts.</li>
<li><strong>Fire Safety</strong> — Register all fire extinguishers on the holding. Track type, capacity, serial number, engineer details, and annual service dates. The system warns you when a service is overdue or due within 60 days.</li>
<li><strong>Risk Assessments</strong> — Document and maintain workshop-specific risk assessments for welding, grinding, lifting, compressed air use, and other significant hazards, with control measures and review date tracking.</li>
<li><strong>COSHH</strong> — Record COSHH assessments for every hazardous substance used or stored in the workshop — oils, fuels, solvents, welding gases, and more — including PPE requirements and emergency procedures.</li>
</ul>

<h3>Raising a Job Card</h3>
<p>Go to <strong>Workshop</strong> in the left-hand sidebar and click the <strong>Job Cards</strong> tab. Select <strong>Raise Job Card</strong>. Choose the asset, the job type (Repair, Scheduled Service, Inspection, Commissioning, Investigation, or Modification), and set the priority. Add a description of the fault or work required. Assign to a person if relevant. Save — the card status is set to <strong>Open</strong> automatically.</p>
<p>As work progresses, update the status to <em>In Progress</em>. If parts need to be ordered, set it to <em>Awaiting Parts</em> — this pauses the job without closing it. When work is complete, switch to <em>Completed</em> and enter the labour hours, labour cost, and parts cost. The system calculates the total job cost for you.</p>

<h3>Red Tractor Context</h3>
<p>Red Tractor standards require that equipment — particularly sprayers — is maintained in good working order and serviced at appropriate intervals. A complete service history in the Workshop module provides the audit evidence required during a Red Tractor assessment, supplementing the NSTS calibration certificates held in the Equipment module.</p>`,
    },
    {
      id: 43,
      title: "Scanning QR Codes with the Mobile App",
      category: "Workshop",
      summary: "How to use the universal QR scanner on your phone to look up fields, animals, storage locations, and equipment in seconds.",
      content: `<img src="/api/help-images/field-register.png" alt="Mobile QR Scanning" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The BDE Farm Trac mobile app includes a <strong>universal QR code scanner</strong> that works across all entity types. Whether you scan a label stuck to a field sign, a paddock gate, a grain store door, or a tractor cab — the app instantly pulls up the right record and offers relevant quick actions without any typing.</p>

<h3>Opening the Scanner</h3>
<p>On the <strong>Record</strong> tab of the mobile app, tap <strong>Scan QR Code</strong> at the top of the action list. The camera viewfinder opens with corner guides to help you frame the label. Hold the phone steady and point it at the QR label — it scans automatically the moment it reads the code.</p>

<h3>What Each Code Prefix Means</h3>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0;">
<thead><tr style="background:#f0fdf4;"><th style="padding:8px 12px;text-align:left;border:1px solid #e5e7eb;">Prefix</th><th style="padding:8px 12px;text-align:left;border:1px solid #e5e7eb;">Entity Type</th><th style="padding:8px 12px;text-align:left;border:1px solid #e5e7eb;">Where Generated</th></tr></thead>
<tbody>
<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-family:monospace;font-weight:bold;color:#0f766e;">FLD-XXXX</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">Field</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">Fields &amp; Crops page → field card menu → Generate QR Label</td></tr>
<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-family:monospace;font-weight:bold;color:#0f766e;">ANM-XXXX</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">Individual Animal</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">Livestock page → Animals tab → QR icon in the animal row</td></tr>
<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-family:monospace;font-weight:bold;color:#0f766e;">STG-XXXX</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">Storage Location</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">Storage Locations page → QR icon in the location row</td></tr>
<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-family:monospace;font-weight:bold;color:#0f766e;">EQ-XXXX</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">Equipment Asset</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">Workshop page → QR Code Labels tab → Generate Label</td></tr>
</tbody>
</table>

<h3>What Happens After a Successful Scan</h3>
<p>The app looks up the scanned code and displays a <strong>result card</strong> showing the entity name, type, and current status. Below the card, a set of <strong>Quick Actions</strong> are displayed — these are the most common tasks for that entity type:</p>
<ul>
<li><strong>Fields (FLD-):</strong> Log Crop Event, Record Spray Application, Log Soil Sample, Field Inspection</li>
<li><strong>Animals (ANM-):</strong> Log Medicine / Treatment, Mobility Score, Calving Record</li>
<li><strong>Storage (STG-):</strong> Log Biofuel Delivery, Log Feed Record</li>
<li><strong>Equipment (EQ-):</strong> Report Defect / Fault</li>
</ul>
<p>Tap a quick action to open the relevant form, pre-filled with the entity name and ID. Complete the form and save — the record is stored immediately and syncs to the cloud dashboard.</p>

<h3>Unrecognised Codes</h3>
<p>If the app cannot match a code, it shows an error message explaining the issue. This can happen if you scan a QR code from a different system, or if the label was generated for a different farm. Make sure you are scanning a BDE Farm Trac label starting with one of the four recognised prefixes.</p>

<h3>Tips for Getting the Best Results</h3>
<ul>
<li>Use weather-proof label pouches when attaching QR labels to outdoor signs — UV and rain will degrade printed labels over time.</li>
<li>For animals, stick the QR label to the inside of the animal's record folder rather than to the animal itself.</li>
<li>For grain stores and buildings, laminate the label and fix it at eye height next to the entrance door.</li>
<li>If the camera struggles to focus, try moving slightly further away (30–50 cm is usually ideal for QR codes).</li>
</ul>`,
    },
    {
      id: 44,
      title: "Generating QR Labels for Fields, Animals, and Storage",
      category: "Workshop",
      summary: "Step-by-step guide to creating and printing QR code labels for fields, individual animals, and storage locations from the dashboard.",
      content: `<img src="/api/help-images/field-register.png" alt="QR Label Generation" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>BDE Farm Trac uses a consistent <strong>QR code labelling system</strong> across four entity types: fields, individual animals, storage locations, and workshop equipment. Once a label is generated and printed, any mobile device running BDE Farm Trac can scan it to instantly retrieve the record and log activity — no typing required.</p>

<h3>Generating a QR Label for a Field</h3>
<ol>
<li>Go to <strong>Fields &amp; Crops</strong> in the left-hand sidebar.</li>
<li>Find the field you want to label. Click the three-dot menu (⋮) on the field card.</li>
<li>Select <strong>Generate QR Label</strong>. If no code has been assigned yet, click <em>Generate QR Code</em> — the system assigns the next available <strong>FLD-XXXX</strong> code and displays the scannable QR image immediately.</li>
<li>If a code already exists, the QR image is shown straight away. Click <strong>Print Label</strong> to send to your printer.</li>
</ol>
<p>Attach the printed label to the field's gatepost, boundary sign, or management folder.</p>

<h3>Generating a QR Label for an Individual Animal</h3>
<ol>
<li>Go to <strong>Livestock</strong> in the left-hand sidebar and click the <strong>Animals</strong> tab.</li>
<li>Find the animal in the table. Click the teal QR icon (<span style="color:#0f766e;">&#9726;</span>) in the actions column of that row.</li>
<li>In the dialog, click <em>Generate QR Code</em> to assign the next available <strong>ANM-XXXX</strong> code. The QR image appears immediately.</li>
<li>Click <strong>Print Label</strong>. Attach the label to the animal's individual record folder or management area — not to the animal itself.</li>
</ol>

<h3>Generating a QR Label for a Storage Location</h3>
<ol>
<li>Go to <strong>Storage Locations</strong> (found under the Field &amp; Crop Management section of the sidebar).</li>
<li>Find the store in the table. Click the teal QR icon in the actions column of that row.</li>
<li>In the dialog, click <em>Generate QR Code</em> to assign the next available <strong>STG-XXXX</strong> code.</li>
<li>Click <strong>Print Label</strong>. Fix the label to the store entrance so that delivery drivers and field workers can scan on arrival.</li>
</ol>

<h3>Generating a QR Label for Equipment (Workshop)</h3>
<ol>
<li>Go to <strong>Workshop</strong> in the left-hand sidebar and click the <strong>QR Code Labels</strong> tab.</li>
<li>Click the QR icon next to any piece of equipment. Click <em>Generate QR Label</em> to assign an <strong>EQ-XXXX</strong> code.</li>
<li>Click <strong>Print Label</strong> and affix the label to the machine — ideally in a prominent, weather-protected spot such as the inside of a cab door or instrument panel.</li>
</ol>

<h3>Why Use QR Labels?</h3>
<ul>
<li><strong>Speed:</strong> Field workers can log spray applications, defect reports, or medicine treatments without walking back to an office or searching through a dropdown.</li>
<li><strong>Accuracy:</strong> Scanning eliminates the risk of selecting the wrong field or animal from a list.</li>
<li><strong>Audit trail:</strong> Every scan-to-action record is timestamped and linked to the correct entity, building a reliable compliance evidence trail.</li>
<li><strong>Red Tractor inspections:</strong> Being able to demonstrate that records are captured at the point of activity — in the field, not retrospectively — is viewed favourably by assessors.</li>
</ul>

<h3>Label Printing Tips</h3>
<ul>
<li>Print on plain A4 and trim to size, or use a dedicated label printer (e.g. Brother QL series) for adhesive-backed labels.</li>
<li>Laminate outdoor labels or use weatherproof label stock for gate posts and buildings.</li>
<li>Keep a spare copy of each label in the associated record folder in case the original becomes unreadable.</li>
</ul>`,
    },
    {
      id: 45,
      title: "PAT Testing & Fire Extinguisher Records",
      category: "Workshop",
      summary: "How to use the PAT Testing and Fire Safety tabs to meet Red Tractor electrical safety and fire safety requirements.",
      content: `<img src="/api/help-images/field-register.png" alt="PAT Testing and Fire Safety" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>Two of Red Tractor's workshop health and safety requirements are often overlooked until an inspection: <strong>portable appliance testing (PAT)</strong> for electrical equipment, and annual <strong>fire extinguisher servicing</strong>. BDE Farm Trac gives each its own dedicated tab within the Workshop module so that evidence is immediately at hand when an assessor asks for it.</p>

<h3>PAT Testing</h3>
<p>Portable appliances — angle grinders, extension leads, welders, power drills, inspection lights — must be tested by a competent person at appropriate intervals. The frequency depends on the environment and level of use; in a working farm workshop, annual testing is standard best practice. Records must show the item tested, the result, and the name of the tester.</p>

<h4>Adding a PAT Test Record</h4>
<ol>
<li>Go to <strong>Workshop</strong> and click the <strong>PAT Testing</strong> tab.</li>
<li>Click <strong>Log PAT Test</strong>.</li>
<li>Enter the item or appliance name (e.g. "Angle Grinder — Makita 9558HN"), the location in the workshop, and the test date.</li>
<li>Set the result: <em>Pass</em>, <em>Fail</em>, or <em>Advisory</em>. A <em>Fail</em> means the appliance must be taken out of service immediately. An <em>Advisory</em> means it can continue in use but remedial action is recommended.</li>
<li>Enter the tester's name, company, and certificate number.</li>
<li>Set the <em>Next Test Due</em> date. The system will mark this record as overdue once that date passes.</li>
</ol>
<p>Failed appliances should be labelled "DO NOT USE" and either repaired or disposed of before being returned to service. Record any remedial action in the Notes field.</p>

<h3>Fire Extinguisher Register</h3>
<p>All fire extinguishers must be serviced annually by a competent person and discharge-tested at intervals specified by the manufacturer (typically every 5 years for CO₂ and every 5 years for dry powder). Red Tractor assessors will ask to see evidence that extinguishers on the holding are maintained and appropriately sited.</p>

<h4>Extinguisher Types and Their Uses</h4>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;margin:12px 0;">
<thead><tr style="background:#f0fdf4;"><th style="padding:8px 12px;text-align:left;border:1px solid #e5e7eb;">Type</th><th style="padding:8px 12px;text-align:left;border:1px solid #e5e7eb;">Label Colour</th><th style="padding:8px 12px;text-align:left;border:1px solid #e5e7eb;">Suitable For</th><th style="padding:8px 12px;text-align:left;border:1px solid #e5e7eb;">Not Suitable For</th></tr></thead>
<tbody>
<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;">CO₂</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">Black band</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">Electrical, flammable liquids</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">Cooking oils, metals</td></tr>
<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;">Dry Powder</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">Blue band</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">General-purpose, electrical, flammable liquids</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">Cooking oils, enclosed spaces</td></tr>
<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;">Foam</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">Cream band</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">Paper, wood, flammable liquids</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">Electrical (unless AFFF rated)</td></tr>
<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;">Water</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">Red (no band)</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">Paper, wood, textiles</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">Electrical, flammable liquids</td></tr>
</tbody>
</table>

<h4>Adding an Extinguisher Record</h4>
<ol>
<li>Click the <strong>Fire Safety</strong> tab and select <strong>Add Extinguisher</strong>.</li>
<li>Enter the location (e.g. "Main workshop entrance — left of roller door"), the type, and the capacity in kg.</li>
<li>Record the serial number from the extinguisher label, the last service date, and the engineer and company who carried out the service.</li>
<li>Set the <em>Next Service Due</em> date. The system will warn you 60 days in advance and mark it as overdue if the date passes without an update.</li>
</ol>

<h3>Red Tractor Context</h3>
<p>During an inspection, assessors may ask to physically view extinguishers and check service labels. Having the digital register available with engineer name, service date, and certificate number demonstrates that you have a managed, documented approach to fire safety — not just extinguishers that happen to be on the wall.</p>`,
    },
    {
      id: 46,
      title: "Workshop Risk Assessments & COSHH",
      category: "Workshop",
      summary: "How to use the Risk Assessments and COSHH tabs to document workshop hazards and meet legal health and safety obligations.",
      content: `<img src="/api/help-images/field-register.png" alt="Workshop Risk Assessments and COSHH" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>UK law requires that employers and self-employed people carry out <strong>suitable and sufficient risk assessments</strong> for all significant workplace hazards (Management of Health and Safety at Work Regulations 1999). Separately, the <strong>Control of Substances Hazardous to Health Regulations 2002 (COSHH)</strong> require that you assess the risk from every hazardous substance used at work and put appropriate controls in place. Both sets of records are required during Red Tractor inspections covering the workshop area.</p>

<h3>Workshop Risk Assessments</h3>
<p>Risk assessments must identify the hazard, describe who could be harmed and how, and set out the control measures in place. They must be reviewed at least annually, or whenever there is a significant change — new equipment, new personnel, or a near-miss incident.</p>

<h4>Common Workshop Hazards to Assess</h4>
<ul>
<li><strong>Welding</strong> — UV radiation, fumes, fire risk, electrical hazard</li>
<li><strong>Grinding and cutting</strong> — sparks, flying particles, noise, vibration</li>
<li><strong>Vehicle jacking and lifting operations</strong> — collapse risk, crush injuries</li>
<li><strong>Compressed air use</strong> — injection injuries, ejected particles, burst hose</li>
<li><strong>Flammable liquids (fuels, solvents)</strong> — fire, vapour inhalation, skin contact</li>
<li><strong>Power tools</strong> — entanglement, contact, vibration white finger (HAVS)</li>
<li><strong>Manual handling</strong> — musculoskeletal injury from lifting heavy components</li>
</ul>

<h4>Adding a Risk Assessment</h4>
<ol>
<li>Go to <strong>Workshop</strong> and click the <strong>Risk Assessments</strong> tab.</li>
<li>Click <strong>Add Assessment</strong> and select the activity or hazard from the dropdown. All records in this tab are automatically filed under the <em>Workshop</em> area.</li>
<li>Set the risk level: Low, Medium, High, or Critical — based on the likelihood and severity of harm <em>before</em> controls are applied.</li>
<li>Describe who could be harmed (e.g. "Workshop operative, visiting contractors") and the nature of the harm.</li>
<li>Record your control measures — engineering controls (guards, LEV ventilation), administrative controls (safe working procedures, training), and PPE.</li>
<li>Set the assessment date and the next review date (typically 12 months from today, or sooner if conditions change).</li>
</ol>
<p>When a review date passes, the record is highlighted as overdue. Update the controls if required, then save the record with a new review date to clear the alert.</p>

<h3>COSHH Assessments</h3>
<p>Under COSHH, you must assess the health risks from all hazardous substances — including oils, fuels, degreasers, welding gases, battery acid, and aerosol lubricants — and ensure that exposure is prevented or adequately controlled. COSHH assessments must reference the Safety Data Sheet (SDS) for each substance.</p>

<h4>Adding a COSHH Assessment</h4>
<ol>
<li>Click the <strong>COSHH</strong> tab in Workshop and select <strong>Add COSHH Assessment</strong>.</li>
<li>Choose the substance from the dropdown (e.g. "Diesel / fuel", "Engine oil / gear oil", "Welding gas"). All records in this tab are automatically filed under the <em>Workshop</em> usage area.</li>
<li>Enter the manufacturer or supplier and the hazard classification from the SDS (e.g. "Flammable liquid, Category 3 — H226").</li>
<li>Record the storage location (e.g. "Locked metal cabinet — marked FLAMMABLE") and the control measures in place (e.g. "Store in ventilated metal cabinet away from ignition sources").</li>
<li>List the PPE required — nitrile gloves, eye protection, RPE for organic vapours, etc.</li>
<li>Record emergency procedures for spills and first aid steps from the SDS.</li>
</ol>

<h3>Red Tractor Context</h3>
<p>Red Tractor assessors covering the workshop area will look for evidence that you have identified the significant risks, put controls in place, and reviewed assessments regularly. Assessments do not need to be lengthy — a clear, honest description of the hazard and the steps taken to control it is more useful than a lengthy document that is not acted upon. The BDE Farm Trac records provide an immediately accessible, dated evidence trail without requiring paper files.</p>`,
    },
    {
      id: 47,
      title: "Getting Started with Pig Production Records",
      category: "Pig Production",
      content: `<img src="/api/help-images/livestock.png" alt="Pig Production Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The Pig Production module provides a complete compliance record system for UK pig enterprises covered by Red Tractor Pigs, BPEX Quality Assured Pigs, and the Pig Industry Code of Practice (PICOP). Whether you run a breeding herd, a finishing unit, or a farrow-to-finish system, this module captures the records required at an inspection.</p>

<h3>Module Tabs</h3>
<ul>
<li><strong>Medicine Records</strong> — record all medicines, vaccines, and treatments including withdrawal periods; the system flags animals under withdrawal so they cannot be cleared for slaughter until the period has elapsed.</li>
<li><strong>Medication Book</strong> — a running log of all purchased veterinary medicines, their batch numbers, quantities, storage conditions, and use dates, as required by the Veterinary Medicines Regulations 2013.</li>
<li><strong>Feed & Nutrition</strong> — log all feed deliveries, feed compositions, and any medicated feed consignments. Note any permitted additives and cross-reference with medicine withdrawal records.</li>
<li><strong>Mortality Records</strong> — record each mortality event with cause (where known), the fate of the carcass, and any post-mortem findings. This feeds into the mortality dashboard which highlights patterns for investigation.</li>
<li><strong>Slaughter Records</strong> — enter liveweight, kill-out data, grading, and any condemnation remarks. Upload copies of kill sheets from your abattoir where possible.</li>
<li><strong>Vet Visits</strong> — log all veterinary consultations, including the date, vet name, animals examined, diagnoses, treatment plans, and any prescriptions written. Red Tractor requires evidence of a regular vet-farm relationship.</li>
</ul>

<h3>Medicine Withdrawal Periods</h3>
<p>Pigs treated with prescription-only medicines must not be sent for slaughter until the relevant withdrawal period has elapsed. The system automatically calculates the withdrawal clearance date when you record a treatment and shows a banner on the animal's record until it is clear. Always verify against the product Summary of Product Characteristics (SPC) — do not rely solely on the system.</p>

<h3>Legal Framework</h3>
<p>Relevant legislation includes the Animal Welfare (Kept Animals) Act provisions, Pig Veterinary Medicines Regulations 2013, Welfare of Farmed Animals (England) Regulations 2007, and the Pigs (Records, Identification and Movement) Order 2011. Records must be kept for a minimum of five years for medicines.</p>`,
    },
    {
      id: 48,
      title: "Pig Movement and Identification",
      category: "Pig Production",
      content: `<img src="/api/help-images/livestock-movements.png" alt="Pig Movement Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>All pig movements on and off your holding must be reported through the appropriate government portal within the specified timeframe. Which portal you use depends on where your holding is located in the UK.</p>

<h3>Movement Portals by Country</h3>
<ul>
<li><strong>England &amp; Wales:</strong> eAML2 (eaml2.org.uk) — movements must be reported within three days of the move.</li>
<li><strong>Scotland:</strong> ScotEID (scoteid.com) — movements reported within three days. Pigs also require APHIS notification in some cases; check with ScotEID.</li>
<li><strong>Northern Ireland:</strong> APHIS (DAERA) — contact your local DAERA office to register your herd and set up online access.</li>
</ul>

<h3>Identification Requirements</h3>
<p>Every pig leaving your holding must be identified with either a slap mark tattoo or an ear tag showing your herd mark. Replacement pigs brought onto the holding must already be marked with the holding of origin's mark. Breeding pigs moved between holdings require permanent identification. Pigs moved direct to slaughter may use a temporary eartag in addition to the slap mark.</p>

<h3>Recording in BDE Farm Trac</h3>
<p>Go to <strong>Pig Production</strong> and click the <strong>Movements</strong> tab. Click <strong>Add Movement</strong> and enter the movement date, direction (on or off holding), the number and category of pigs (weaners, stores, finishers, or breeding), the destination or source CPH, transporter name, and vehicle registration. A movement licence or AML reference should also be recorded once obtained from eAML2 or your regional portal.</p>

<h3>Standstill Rules</h3>
<p>Pigs that have been on a holding with pigs from another holding are subject to a 20-day standstill before they can be moved to another farm. Only movements direct to slaughter are exempt. The system will warn you if a pending movement appears to fall within a standstill period — always verify with your regional office if in doubt.</p>`,
    },
    {
      id: 49,
      title: "Getting Started with Poultry Production Records",
      category: "Poultry Production",
      content: `<img src="/api/help-images/livestock.png" alt="Poultry Production Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The Poultry Production module covers compliance record-keeping for broiler, layer, turkey, duck, and other poultry enterprises under Red Tractor Poultry standards, Lion Code, and UK welfare legislation. It is structured around the key inspection areas: flock registers, welfare daily checks, medicines, mortality, and hatchery data.</p>

<h3>Module Tabs</h3>
<ul>
<li><strong>Flock Register</strong> — create a record for each house or flock placement: breed/strain, chick source hatchery, date placed, initial numbers, and target slaughter date. Each flock record becomes the parent for all associated records — checks, treatments, mortalities, and thinnings.</li>
<li><strong>Daily Welfare Checks</strong> — record the daily house visit observations required by the Welfare of Farmed Animals (England) Regulations: feed and water availability, ventilation and temperature, lighting, litter condition, bird health observations, and any abnormal behaviour. The system timestamps each entry and flags overdue checks.</li>
<li><strong>Medicine Records</strong> — log all in-water and in-feed medications, vaccines administered (with batch number and vaccination team details), and any individual treatments. Withdrawal periods are auto-calculated.</li>
<li><strong>Mortality Records</strong> — daily mortality counts for each house with cause classifications. Red Tractor requires a mortality trigger level to be set; the system will alert you when a single day's mortality exceeds your threshold so a formal investigation can be initiated.</li>
<li><strong>Thinning &amp; Depletion</strong> — record each thinning event with the number of birds removed, live weight, and destination (abattoir or lairage). Final depletion records include final house numbers, slaughter date, and meat hygiene feedback where available.</li>
<li><strong>Litter &amp; Environment</strong> — log litter change events, footpad dermatitis (FPD) scores from abattoir feedback, and dust/ammonia monitoring readings if taken.</li>
</ul>

<h3>Stocking Density Limits</h3>
<p>Under the Welfare of Farmed Animals Regulations and Red Tractor Broiler standards, stocking density is capped at 33 kg/m² for standard production (up to 39 kg/m² where a higher density licence is held). The module calculates live weight density based on your entered live weight estimates and house floor area and warns you if limits are approached.</p>`,
    },
    {
      id: 50,
      title: "Salmonella, Biosecurity and Poultry Health Plans",
      category: "Poultry Production",
      content: `<img src="/api/help-images/medicine-records.png" alt="Poultry Health and Salmonella" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>UK National Control Programmes (NCPs) require commercial poultry flocks to be tested for Salmonella at defined points in the production cycle. Red Tractor Poultry additionally requires a written health plan agreed with your vet. BDE Farm Trac supports both requirements within the Poultry Production module.</p>

<h3>Salmonella NCP Testing</h3>
<p>For broiler flocks, official Salmonella sampling must be carried out 2–3 weeks before slaughter. For laying hens, sampling is required at 24–26 weeks of age and every 15 weeks thereafter. Results from approved laboratories must be retained and made available to inspectors. Use the <strong>Lab Tests</strong> tab within the Poultry Production module to log each sample submission: sample date, sample type (boot swabs, dusty swabs, or tissue), laboratory name and reference, and the result. Positive results trigger mandatory notifications; the system surfaces a compliance flag until you confirm the regulatory notification has been made.</p>

<h3>Flock Health Plan</h3>
<p>Red Tractor requires a written flock health plan signed by the attending vet and reviewed at least annually. The health plan must cover: disease risks relevant to your species and production system, vaccination protocols, biosecurity measures, parasite management, mortality trigger levels and response plans, and pain-relief protocols. Go to the <strong>Health Plan</strong> tab within the Poultry Production module and complete each section. The system stores a version history so you can demonstrate that the plan has been regularly reviewed.</p>

<h3>Biosecurity for Poultry</h3>
<p>Avian Influenza (AI) risk means that biosecurity requirements for poultry holdings can change rapidly — during a Housing Order, free-range flocks must be kept inside under strict biosecurity. The module includes a biosecurity checklist tab where you can record daily checks during enhanced biosecurity periods: perimeter security, visitor controls, vehicle disinfection, feed and water security, and wild bird deterrent measures.</p>`,
    },
    {
      id: 51,
      title: "Getting Started with Horticulture Records",
      category: "Horticulture",
      content: `<img src="/api/help-images/field-register.png" alt="Horticulture Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The Horticulture module provides compliance record-keeping for fresh produce growers working under Red Tractor Fresh Produce, LEAF Marque, GlobalG.A.P., or other assured scheme requirements. It covers crops grown in the open, under protection (poly-tunnels, glasshouses), and in substrate systems.</p>

<h3>Module Tabs</h3>
<ul>
<li><strong>Crop Records</strong> — register each crop with its variety, planting date, growing area (hectares or m²), and target harvest window. Assign each crop to a field or glasshouse bay so that spray records, soil tests, and water use records are automatically linked.</li>
<li><strong>Spray Records</strong> — a dedicated spray record form compliant with Plant Protection Products Regulations 2011. Includes MAPP number validation, pre-harvest interval (PHI) calculation, and buffer zone reminders. PHI alerts appear on the crop record once a spray application has been logged, preventing premature harvest.</li>
<li><strong>Soil & Substrate Records</strong> — log soil analysis results (pH, P, K, Mg, organic matter), substrate test results for soilless systems, and irrigation water quality tests. Crop-specific nutrient recommendations can be added based on analysis results.</li>
<li><strong>Harvest Records</strong> — record actual harvest dates, weights, grades, and any downgraded or rejected product. For export crops, record phytosanitary inspection dates and certificate references.</li>
<li><strong>Worker Welfare</strong> — log accommodation, welfare facility, and pay records for seasonal and permanent workers. This supports compliance with the Gangmasters and Labour Abuse Authority (GLAA) licensing requirements and assured scheme audits.</li>
<li><strong>Traceability</strong> — link harvest batches to spray records, water use, and soil tests, creating a full traceability chain from seed to despatch that can be presented to a retailer or scheme auditor.</li>
</ul>

<h3>Assured Scheme Flexibility</h3>
<p>The module is not tied to a single assured scheme. Whether you are certificated under Red Tractor, LEAF Marque, GlobalG.A.P., Tesco Nurture, or another scheme, the records captured are the same — only the audit questions differ. BDE Farm Trac stores the data; how you present it depends on your scheme's audit process.</p>`,
    },
    {
      id: 52,
      title: "Pre-Harvest Intervals, MRLs and Residue Testing",
      category: "Horticulture",
      content: `<img src="/api/help-images/spray-records.png" alt="Pre-Harvest Intervals and MRL Compliance" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>Maximum Residue Levels (MRLs) are the maximum legal concentrations of pesticide residues permitted in or on food products. Retailers, assured schemes, and UK law (UK Regulation 396/2005 retained in UK law) impose strict MRL compliance obligations on growers. BDE Farm Trac helps you manage MRL risk through pre-harvest interval (PHI) management and residue testing records.</p>

<h3>Pre-Harvest Intervals (PHI)</h3>
<p>Every approved pesticide label specifies a PHI — the minimum number of days that must elapse between the last application and harvest. The Horticulture module automatically calculates the earliest permitted harvest date when you record a spray application. The crop record displays a green "Clear to harvest" status once all PHI periods have elapsed, or an amber "PHI in progress" warning with the days remaining. This prevents accidental early harvest of treated crops.</p>

<h3>SEER Database Limits</h3>
<p>For export crops and retailer-supplied crops, individual retailers may impose limits below the statutory MRL (sometimes called "action limits" or "marketing limits"). These vary by retailer and product. You can add retailer-specific limits to individual spray records as notes so that your agronomist and team are aware of tighter constraints on specific crops.</p>

<h3>Residue Testing Records</h3>
<p>If you commission or receive the results of residue tests — from a retailer, scheme, or your own programme — record them in the <strong>Lab Tests</strong> tab of the Horticulture module. Log the crop, the sample date and harvest batch, the laboratory name and reference, the analytes tested, and the results. Any exceedance of an MRL generates a compliance flag that must be acknowledged before it can be cleared, creating an audit trail of your response to non-conformances.</p>`,
    },
    {
      id: 53,
      title: "Carbon & Sustainability Records",
      category: "Carbon & Sustainability",
      content: `<img src="/api/help-images/dashboard-overview.png" alt="Carbon and Sustainability Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The Carbon &amp; Sustainability module supports UK farmers participating in the Sustainable Farming Incentive (SFI), the Farming in Protected Landscapes (FiPL) programme, or voluntary carbon markets. It also provides the data structure needed to run a farm carbon footprint assessment and track year-on-year emissions reduction.</p>

<h3>Module Tabs</h3>
<ul>
<li><strong>Carbon Footprint</strong> — enter annual data inputs for a Scope 1, 2, and 3 farm carbon footprint: fertiliser use and type (kg N, nitrous oxide emission factor), livestock numbers and species (enteric fermentation, manure), fuel consumption (diesel, petrol, LPG), electricity use (grid and renewable), bought-in feed quantities, and land use change. The module provides a summary in tonnes CO₂e per year and per tonne of product.</li>
<li><strong>Renewable Energy</strong> — log solar PV, wind turbine, biomass boiler, or anaerobic digester (AD) capacity and annual generation. Feed-in-Tariff (FiT) and Smart Export Guarantee (SEG) receipt records can be attached for reference.</li>
<li><strong>Biodiversity Actions</strong> — record habitat management actions: hedge laying, tree planting, buffer strip establishment, in-field flower margins, beetle banks, and pond restoration. These records support Biodiversity Net Gain (BNG) documentation and agri-environment scheme monitoring visits.</li>
<li><strong>Soil Carbon</strong> — enter soil organic matter (SOM) or soil organic carbon (SOC) results from sequential sampling plots. Tracking SOM over time demonstrates carbon sequestration and supports claims under voluntary carbon standard frameworks.</li>
<li><strong>Sustainability Goals</strong> — set and track bespoke farm sustainability targets: percentage renewable energy by a target year, hectares of habitat created, nitrogen use efficiency, or water consumption per unit of output. The goals dashboard shows progress against each target.</li>
</ul>

<h3>Regulatory Context</h3>
<p>While there is currently no legal obligation to complete a farm carbon footprint in England, several supply chains now require it as a condition of supply. The NFU has a target of net-zero UK agriculture by 2040. Recording your baseline data now means you have a verifiable starting point for your improvement journey.</p>`,
    },
    {
      id: 54,
      title: "Farm Diversification Records",
      category: "Farm Diversification",
      content: `<img src="/api/help-images/help-centre.png" alt="Farm Diversification Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The Farm Diversification module helps you manage compliance and financial records across the range of activities many UK farms now operate alongside their core agricultural enterprise. It covers farm shops, holiday accommodation, equine businesses, renewable energy, field sports, and countryside recreation.</p>

<h3>Module Tabs</h3>
<ul>
<li><strong>Activities Register</strong> — list each diversification enterprise with its type, start date, and current status (active, seasonal, or closed). This provides a quick overview of all non-agricultural income streams and their associated compliance requirements.</li>
<li><strong>Farm Shop</strong> — record product lines, provenance details, allergen declarations, pricing, and sales data. For Red Tractor farm shops, products derived from assured farm produce should be identified and labelled accordingly. Date and lot coding records support traceability requirements under EU/UK food hygiene legislation (Retained Regulation 852/2004).</li>
<li><strong>Hygiene Inspections</strong> — log food hygiene inspection dates, inspecting authority (local authority EHO or private auditor), rating awarded, and any non-conformances raised. A five-star Food Hygiene Rating Scheme (FHRS) rating requires evidence of good management controls, good hygiene practice, and satisfactory structural condition.</li>
<li><strong>Equine Register</strong> — maintain a register of all equines (horses, ponies, donkeys, mules) kept at the holding with their passport details, microchip numbers, freeze marks, and UELN numbers. Horse passports are a legal requirement in the UK. Record vaccinations, dental treatments, and farrier visits in the equine health log.</li>
<li><strong>Renewables</strong> — see Carbon &amp; Sustainability module for detailed renewable energy records. The Diversification module provides a financial summary of renewable energy income.</li>
<li><strong>Shooting</strong> — log all game and rough shooting events with dates, land areas used, bag records, and any game dealer certificates. Lead ammunition restrictions apply in England and Scotland from 2025; record ammunition type used.</li>
</ul>`,
    },
    {
      id: 55,
      title: "Water & Irrigation Management",
      category: "Water & Irrigation",
      content: `<img src="/api/help-images/field-register.png" alt="Water and Irrigation Management" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The Water &amp; Irrigation module helps UK farmers record abstraction, irrigation use, and water quality data in compliance with the Environment Agency (or Natural Resources Wales / SEPA / DAERA) abstraction licensing requirements and Red Tractor or assured scheme expectations.</p>

<h3>Module Tabs</h3>
<ul>
<li><strong>Water Sources</strong> — register each water source on the holding: borehole, surface water abstraction, reservoir, mains supply, or rainwater harvesting. For licensed abstractions, enter the licence number, permitted daily and annual volumes, and the licence holder details. The Environment Agency requires abstraction records to be kept and submitted as returns for licences above the exempt threshold.</li>
<li><strong>Abstraction Log</strong> — record daily or weekly meter readings for each licensed abstraction point. The module auto-calculates cumulative usage against your licence limit and warns you when you are approaching it. This supports the annual abstraction return to the Environment Agency.</li>
<li><strong>Irrigation Events</strong> — log each irrigation event by field, crop, date, system type (trickle, overhead, rain gun), and volume applied in m³. Linking irrigation events to weather data and crop water demand records demonstrates efficient irrigation scheduling — a requirement of some retailer assurance schemes.</li>
<li><strong>Water Quality Tests</strong> — record bacteriological (E. coli, total coliforms), chemical (pH, nitrates, pesticides), and physical (turbidity) test results for irrigation water sources. Red Tractor Fresh Produce requires regular microbiological testing of irrigation water used on crops consumed raw. Log the laboratory name, test date, parameters, and results. Non-conforming results generate a compliance flag.</li>
<li><strong>Infrastructure</strong> — maintain a register of irrigation infrastructure: pump sets, filter stations, main lines, lateral lines, emitters, and storage reservoirs. Log service and maintenance events with dates and engineer details.</li>
</ul>

<h3>Abstraction Licensing</h3>
<p>Any abstraction of more than 20 m³/day in England and Wales requires a licence from the Environment Agency unless it is specifically exempt (e.g. for domestic use or firefighting). Non-compliance with abstraction licence conditions is a criminal offence. Ensure your licence reference and permitted volumes are accurately recorded in the system before logging abstraction events.</p>`,
    },
    {
      id: 56,
      title: "AI & Reproduction Records for Livestock",
      category: "Livestock",
      content: `<img src="/api/help-images/livestock.png" alt="AI and Reproduction Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The AI &amp; Reproduction tab within the Livestock module helps UK cattle, sheep, pig, and goat producers maintain accurate breeding records as required by Red Tractor and for herd or flock genetic improvement programmes.</p>

<h3>Artificial Insemination (AI) Records</h3>
<p>For each AI event, record: the female animal's tag or identifier, the date of insemination, the breed and sire name (or AI code), the semen batch number, the technician's name, and whether the insemination was preceded by heat detection or a synchronisation protocol. This creates a complete service record that links forward to pregnancy scanning results and subsequent calvings or lambings.</p>

<h3>Heat Detection &amp; Oestrus Records</h3>
<p>Log observed heat events including the detection method used (visual observation, activity monitors, tail paint/chalk, or a teaser animal). Recording heats that result in service and those that do not allows calving interval and submission rate to be calculated — key performance indicators for breeding efficiency.</p>

<h3>Scanning &amp; Pregnancy Diagnoses</h3>
<p>After service, record pregnancy scanning events: scan date, scanner/vet name, animal identifier, pregnancy status (confirmed in calf / in-lamb / empty), and approximate foetal age. For multiple births (twins/triplets in sheep and goats), record the number detected so that appropriate pre-lambing nutrition can be planned.</p>

<h3>Calving, Lambing &amp; Farrowing Records</h3>
<p>Calving and lambing records in the AI &amp; Reproduction tab capture: dam identifier, sire, date and time of birth, ease of calving/lambing (1–5 scale), intervention required, and outcome (live, stillborn, died within 24 hours). Red Tractor Dairy and Beef standards require calving ease to be recorded and used in management decisions. The data feeds into a calving index and reproductive efficiency summary on the breeding dashboard.</p>`,
    },
    {
      id: 57,
      title: "Veterinary Prescriptions &amp; Medicine Book",
      category: "Livestock",
      content: `<img src="/api/help-images/medicine-records.png" alt="Veterinary Prescriptions and Medicine Book" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The Veterinary Prescriptions tab within the Livestock module provides a compliant record of all written and repeated prescriptions issued by your attending vet, alongside the Medication Book that records all medicine purchases, stock, and usage.</p>

<h3>Prescription Records</h3>
<p>Under the Veterinary Medicines Regulations 2013 (VMR), prescription-only medicines (POM-V and POM-VPS) may only be supplied against a valid written prescription. Records of prescriptions received must be kept for five years. For each prescription, record: the date issued, the issuing vet name and practice, the product name and active ingredient, the quantity and pack size supplied, the animals or groups covered (species, number, identifier if individual), the dose and treatment duration, and the withdrawal period stated on the prescription.</p>

<h3>Medication Book</h3>
<p>The VMR also requires that you maintain a medicine book (or electronic equivalent) recording all medicines used on your holding. The BDE Farm Trac Medication Book captures: purchase date, supplier, product name, MAPP/VMR authorisation number, batch number, quantity received, quantity used, quantity disposed of, and the name of the person who administered each treatment. Stock reconciliation — quantity received minus quantity used and disposed — must account for all medicines held on the farm.</p>

<h3>Cascade Prescriptions</h3>
<p>Where a licensed medicine is not available or is not appropriate, a vet may prescribe under the cascade (using a medicine outside its licensed indications). Cascade prescriptions carry an extended withdrawal period set by the prescribing vet — typically at least 28 days for edible tissues. Cascade prescriptions must be clearly identified in your records and the extended withdrawal period applied.</p>

<h3>Antimicrobial Stewardship</h3>
<p>Red Tractor and many retailer standards now require evidence of antimicrobial stewardship — a planned, responsible approach to antibiotic use. Record your herd or flock antibiotic use in mg/PCU (milligrams per population correction unit) using the AHDB data or your vet practice benchmarking service. Targets set under the UK AMR Action Plan include reducing use of critically important antibiotics (CIAs) to near-zero.</p>`,
    },
    {
      id: 58,
      title: "SFI & Agri-Environment Actions",
      category: "Environmental",
      content: `<img src="/api/help-images/field-register.png" alt="SFI and Agri-Environment Actions" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The SFI Actions tab within the Environmental module helps you plan, record, and evidence the management actions required under the Sustainable Farming Incentive (SFI), Countryside Stewardship (CS), and Agri-Environment schemes in all four nations of the UK. Having a complete record of agreed actions and payment evidence is important both for compliance visits and for your own planning.</p>

<h3>Sustainable Farming Incentive (SFI)</h3>
<p>SFI is England's main agri-environment payment scheme, replacing BPS from 2024. It rewards actions across soil, farmland wildlife, hedgerows, integrated pest management, moorland, and other land management categories. For each SFI action you are paid for, create a record in the SFI Actions tab: the action code and description (e.g. CSAM1 — assess and record soil condition), the agreement start and end date, the land parcel reference, the area or length enrolled, and the payment rate per unit.</p>

<h3>Recording Completed Actions</h3>
<p>Many SFI and CS actions require evidence that the management activity has been carried out — for example, soil sampling results, cover crop establishment photos, or hedge-cutting records within permitted windows. Use the Action Log sub-section to record each action completion event: the date, the staff member who carried it out, and any relevant notes or photo attachments. This creates an audit trail to support compliance visits from the Rural Payments Agency.</p>

<h3>Countryside Stewardship &amp; Other Schemes</h3>
<p>The module is not limited to SFI. If you have a Higher Tier CS agreement, a Farming in Protected Landscapes (FiPL) project, or a Woodland Creation or Peatland Restoration agreement, you can record those agreements and their associated management requirements in the same way. Welsh Farming Connect, SRDP (Scotland), and CAFRE agri-environment (NI) agreements can also be managed here.</p>`,
    },
    {
      id: 59,
      title: "Slurry & Manure Management Records",
      category: "Environmental",
      content: `<img src="/api/help-images/field-register.png" alt="Slurry and Manure Management" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The Slurry &amp; Manure Management tab within the Environmental module provides the compliance records required under the Silage, Slurry and Agricultural Fuel Oil (SSAFO) Regulations 2010 (England and Wales), the Water Resources (Control of Pollution) (Silage, Slurry and Agricultural Fuel Oil) (Wales) Regulations 2010, and the equivalent Scottish and Northern Irish regulations. It also supports Nitrate Vulnerable Zone (NVZ) closed-period compliance.</p>

<h3>Storage Infrastructure Register</h3>
<p>Record all slurry storage infrastructure on your holding: stores, lagoons, and reception pits. For each structure, log the capacity in m³, the construction type, the date of last structural inspection, the name of the inspecting engineer, and the outcome of the inspection. SSAFO requires slurry stores to be inspected by a competent person at defined intervals; evidence of inspection must be available.</p>

<h3>Slurry Spreading Records</h3>
<p>For each slurry spreading event, record: the date, field or parcel, volume applied in m³, application method (tanker, trailing shoe, injection), crop at the time, soil condition, and operator name. The system checks whether the spreading date falls within the NVZ closed period for your holding location and displays a warning if it does. In NVZs, slurry spreading on tillage land is prohibited between 1 October and 31 January; on grassland between 15 October and 15 January (England — dates differ by devolved nation).</p>

<h3>Nutrient Value of Manure</h3>
<p>Log slurry analysis results (total nitrogen, ammonium nitrogen, phosphate, potash content per m³) so that the nutrient value of your slurry can be credited against bought-in fertiliser requirements. The module can estimate available nitrogen from slurry based on application method and incorporation timing using RB209 guidance factors.</p>

<h3>Manure Management Plan</h3>
<p>NVZ regulations require farms in designated zones to have a written manure management plan. The tab includes a plan template where you record your total manure production, storage capacity, planned spreading dates and fields, and how you will stay within the 170 kg N/ha/year total nitrogen limit from livestock manures.</p>`,
    },
    {
      id: 60,
      title: "Grain Storage Quality Records",
      category: "Equipment",
      content: `<img src="/api/help-images/field-register.png" alt="Grain Storage Quality Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The Grain Storage Quality tab within the Equipment module provides a compliance record system for on-farm grain stores operating under the AHDB Grain Storage Guide recommendations, TASCC (Trade Assurance Scheme for Combinable Crops) certification, or Red Tractor Combinable Crops and Sugar Beet standards.</p>

<h3>Store Register</h3>
<p>Register each grain store on your holding with its name or reference, construction type (flat floor, walled store, underground pit, grain bins), total capacity in tonnes, aeration or ventilation system details, and the commodities typically stored. For TASCC-certificated stores, note the certificate number and renewal date.</p>

<h3>Grain Intake Records</h3>
<p>For each intake batch, record: the date received, the crop variety, the grower or merchant name, the tonnage, the moisture content at intake (%), the specific weight (kg/hl), and any initial screenings or impurities noted. Where samples are taken for testing, record the sample reference and forward test results to the relevant sub-record.</p>

<h3>Quality Testing Results</h3>
<p>Log the results of all quality tests carried out on stored grain: moisture content checks taken at regular intervals during storage, specific weight, protein (for milling wheat), Hagberg Falling Number (HFN), mycotoxin screening (DON, ZEA, fumonisins, aflatoxins), and any pesticide residue tests commissioned. Red Tractor requires that grain stores have a written grain storage plan and that quality test records are retained for at least three years.</p>

<h3>Pest Monitoring &amp; Fumigation</h3>
<p>Record all insect trap inspections (frequency, trap positions, species and counts), any pesticide treatment of empty stores pre-harvest (approved active substance, dose, operator), and any fumigation events (phosphine or alternative product, fumigator company, licence reference, dosage, gas monitoring results, and clearance certificate). Fumigation must be carried out by a licensed contractor and full records retained as a legal requirement.</p>

<h3>Store Condition Log</h3>
<p>After every significant inspection or cleaning event, create a store condition log entry: date, person inspecting, observations on the roof, walls, floor, ventilation ducts, and any pest or mould activity. A clean, well-maintained store with documented inspection records demonstrates the management commitment that TASCC and Red Tractor assessors look for.</p>`,
    },
    {
      id: 10001,
      title: "Tail Biting Risk Assessments — Pig Production",
      category: "Pig Production",
      content: `<img src="/api/help-images/livestock.png" alt="Tail Biting Risk Assessment" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>Red Tractor Pigs Standards require every pig unit to maintain a written tail biting risk assessment. This is a mandatory document — not a recommendation. The assessment must be updated whenever a risk factor changes, and immediately if active tail biting is observed in a pen.</p>

<h3>What the Assessment Covers</h3>
<p>The risk assessment must evaluate the following factors: current tail length (and whether tails were docked at birth), stocking density relative to the approved limit for your housing type, enrichment material provision (quality, quantity, novelty, and accessibility), feeding system adequacy (feeder space, ad-lib access), health status of the group, and mixing patterns. For each factor, you record whether the condition is adequate or represents an elevated risk.</p>

<h3>When to Review</h3>
<p>Review the assessment: at placement of each new group, whenever stocking density changes (e.g. after a thinning or purchase), after any disease event affecting the pen, immediately when active tail biting is observed (even at a low level), and at a minimum of once per production cycle. The dashboard shows your most recent assessment date and flags assessments that are more than one production cycle old.</p>

<h3>Active Biting — Immediate Actions</h3>
<p>If tail biting is observed, you must record this immediately and document your intervention. Common interventions include separating the bitten animal(s), increasing enrichment provision, checking and rectifying any feed or water competition, reducing light intensity, and veterinary assessment if wounds are significant. The intervention record forms part of your Red Tractor compliance evidence.</p>

<h3>Logging Assessments</h3>
<p>Go to <strong>Pig Production → Tail Biting Risk</strong> tab and click <strong>New Assessment</strong>. Complete all risk factor checks, select the overall risk level (Low / Medium / High), and record any interventions taken. Set a review date — this will appear on your compliance timeline to prompt the next review.</p>`,
    },
    {
      id: 10002,
      title: "Farrowing & Sow Records — Pig Production",
      category: "Pig Production",
      content: `<img src="/api/help-images/livestock.png" alt="Farrowing and Sow Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>Farrowing and sow records are a core Red Tractor Pigs requirement for all breeding herds, including farrow-to-finish units. The records demonstrate that you are monitoring litter performance, managing colostrum intake, and tracking sow productivity over multiple parities.</p>

<h3>What to Record at Farrowing</h3>
<p>For each farrowing event, record: the sow's ear tag (UK-format), her parity number (1 = gilt), the farrowing date, the farrowing ease score (1 = unassisted through to 4 = vet required), whether assistance was provided and details of that assistance, the number of piglets born alive, the number born dead (stillbirths), and any mummified piglets. An average birth weight should also be recorded where possible, as low average birth weight is a welfare indicator that Red Tractor assessors may query.</p>

<h3>Colostrum Management</h3>
<p>Red Tractor requires that colostrum management is actively confirmed for every litter. Record that you have confirmed all piglets have received colostrum within the first 12 hours — this is a welfare baseline. The <em>Colostrum management confirmed</em> checkbox on each farrowing record provides the evidence.</p>

<h3>Foster Records</h3>
<p>Record any piglets transferred in or out of the litter (fosters). Foster records demonstrate that litter sizes are being equalised to ensure adequate access to milk and colostrum for all piglets, which is assessed under the welfare inspection.</p>

<h3>Weaning Data</h3>
<p>On each farrowing record, add weaning data once the litter is weaned: weaning date, number of piglets weaned, and average weaning weight. These fields generate a calculated weaning age and an index of litter growth performance. Red Tractor assessors and your own vet health plan reviews will use this data to identify any downward trends in performance.</p>

<h3>Using the Tab</h3>
<p>Navigate to <strong>Pig Production → Farrowing</strong> and click <strong>Log Farrowing</strong>. Complete the fields at farrowing and return to add weaning data once the litter leaves the farrowing house.</p>`,
    },
    {
      id: 10003,
      title: "Broiler Welfare Indicators (BWI) — Poultry Production",
      category: "Poultry Production",
      content: `<img src="/api/help-images/livestock.png" alt="Broiler Welfare Indicators" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>Broiler Welfare Indicators (BWI) are the standardised at-farm assessment protocol required under Red Tractor Broilers standards. They must be carried out during each crop cycle, typically when the flock is between 21 and 35 days of age, using a random sample of birds.</p>

<h3>The Five Key Indicators</h3>
<p><strong>1. Footpad Dermatitis (FPD / Pododermatitis):</strong> Scored 0–3 using the AVEC (Association of Poultry Processors and Poultry Trade) scale. Score 0 is no lesion; score 3 is a severe lesion with tissue damage. Record the score and the prevalence (percentage of birds in sample with any lesion). Target thresholds are set in your Red Tractor contract — breaching the threshold triggers a formal advisory or fail outcome.</p>

<p><strong>2. Hock Burn:</strong> Similarly scored 0–3. Hock burn indicates wet litter conditions over an extended period. Chronic hock burn at score 2–3 can be associated with intestinal health issues and inadequate litter management.</p>

<p><strong>3. Gait Score:</strong> Assessed using the Bristol Gait Scoring system (0–5). A score of 3 or above indicates significant lameness. Under Red Tractor Broilers, flocks with more than a defined percentage of birds at gait score 3+ require an investigation and corrective action plan.</p>

<p><strong>4. Breast Blisters:</strong> Record the percentage of sampled birds showing breast blister lesions. Breast blisters are associated with prolonged contact with wet or compacted litter and indicate a management or stocking density concern.</p>

<p><strong>5. Plumage Score &amp; Soiling:</strong> Record the overall plumage condition and the percentage of birds with soiled plumage — a proxy indicator of litter condition and stocking density management.</p>

<h3>Recording BWI Assessments</h3>
<p>Go to <strong>Poultry Production → Broiler Welfare</strong> and click <strong>Add Assessment</strong>. Enter the flock reference, assessment date, assessor name, bird age and sample size, and complete each indicator. Select the overall outcome (Pass / Advisory / Fail). If the outcome is Advisory or Fail, document the corrective actions taken — this is the evidence that Red Tractor inspectors will review at your next audit.</p>`,
    },
    {
      id: 10005,
      title: "Right to Work Checks for Farm Employers",
      category: "Staff & Training",
      content: `<img src="/api/help-images/medicine-records.png" alt="Right to Work Checks" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>As a UK employer, you are legally required to carry out a Right to Work check on <strong>every person before they start work</strong> — including seasonal workers, family members employed on the farm, and casual labour. Failure to do so can result in a civil penalty of up to <strong>£60,000 per illegal worker</strong>, and knowingly employing someone without the right to work can lead to criminal prosecution and an unlimited fine.</p>

<p>The check must be carried out in person (or via the Home Office online service), with original documents. A photocopy or photograph of a document is not sufficient. You must also retain a clear copy of the document(s) checked.</p>

<h3>List A and List B Documents</h3>
<p>Right to Work documents are split into two lists.</p>

<p><strong>List A — Indefinite Right to Work</strong> (no repeat check required):</p>
<ul>
<li>UK passport (current or expired)</li>
<li>Irish passport or passport card</li>
<li>UK birth or adoption certificate + NI evidence (P45, NI card, HMRC letter)</li>
<li>Certificate of registration or naturalisation as a British citizen</li>
<li>Indefinite Leave to Enter or Remain — biometric residence permit</li>
<li>EU Settlement Scheme — settled status (confirmed via Home Office online check)</li>
</ul>

<p><strong>List B — Time-Limited Right to Work</strong> (repeat check required before expiry):</p>
<ul>
<li>Current passport with time-limited leave vignette or endorsement</li>
<li>Biometric Residence Permit with a limited leave period</li>
<li>EU Settlement Scheme — pre-settled status (must be rechecked at expiry)</li>
<li>Home Office Positive Verification Notice or Certificate of Application</li>
<li>Any other document showing a time-limited right to work in the UK</li>
</ul>

<h3>Using the Home Office Online Service</h3>
<p>For EU/EEA nationals who have status under the EU Settlement Scheme, and for holders of a Biometric Residence Permit, you must use the <strong>Home Office online right to work checking service</strong> (gov.uk/view-right-to-work). The worker provides a share code valid for 90 days; you enter the share code and their date of birth. Print or save the results page as evidence.</p>

<h3>Recording Checks in BDE Farm Trac</h3>
<p>Navigate to <strong>Staff &amp; Training → Right to Work</strong>. For each person, click <strong>Add RTW Check</strong> and complete:</p>
<ul>
<li><strong>Staff Member</strong> — selected from the staff dropdown</li>
<li><strong>Document Type</strong> — choose from the grouped List A / List B dropdown</li>
<li><strong>Document Reference / Share Code</strong> — the document number or Home Office share code</li>
<li><strong>Check Date</strong> — the date you examined the original document or ran the online check</li>
<li><strong>Checked By</strong> — the name of the person who carried out the check</li>
<li><strong>Expiry Date</strong> — for List B documents only; leave blank for List A</li>
<li><strong>Follow-up / Repeat Check Date</strong> — if required; the system will surface this as a reminder</li>
</ul>

<h3>Compliance Alerts</h3>
<p>The Right to Work tab shows a red compliance banner if any current staff member has no check on file — this is a legal gap that should be closed immediately. A separate red banner appears for any check that has expired. Records within 28 days of expiry are shown with an amber "Expiring soon" badge. Each person's RTW status is also visible on the main Staff page, with a direct link to their records.</p>

<h3>Seasonal and Temporary Workers</h3>
<p>The same rules apply to seasonal workers as to permanent employees. For workers sourced through a licensed gangmaster or labour provider, you should retain confirmation that the agency holds a Gangmasters and Labour Abuse Authority (GLAA) licence and that the labour provider has confirmed they have completed Right to Work checks on your behalf. Record this in the Notes field of the RTW record.</p>

<h3>Record Retention</h3>
<p>You must retain evidence of the check for the duration of employment and for a further <strong>two years</strong> after the employee leaves. Records in BDE Farm Trac are retained indefinitely unless you manually delete them. If you retain physical copies of documents, keep them securely filed and cross-reference the filing location in the Notes field.</p>`,
    },
    {
      id: 10006,
      title: "Staff Management & System Access",
      category: "Staff & Training",
      content: `<img src="/api/help-images/staff.png" alt="Staff & Access Management" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>BDE Farm Trac separates two distinct concepts: a <strong>staff record</strong> (a person who works on your farm) and a <strong>system account</strong> (the ability to log in and use BDE Farm Trac). Every person on your payroll or working on your holding should have a staff record for compliance purposes — but not everyone needs a login. The system is designed to give you precise control over who can access what.</p>

<h3>The Two Types of Staff Entry</h3>
<p>When you navigate to <strong>Staff</strong> in the sidebar, you will see two sections:</p>
<ul>
<li><strong>System Users</strong> — people who have been invited and have accepted access to BDE Farm Trac (or whose invitation is still pending). These individuals appear at the top of the page with a badge showing their access level and current invitation status.</li>
<li><strong>Records Only</strong> — staff members who exist in the system purely for compliance tracking. They appear in your Right to Work records, training records, and certificate lists, but they cannot log in. This is appropriate for seasonal workers, volunteers, labour agency staff, and anyone else you need to keep records for without granting system access.</li>
</ul>

<h3>Adding a Staff Member (No Login)</h3>
<p>Click <strong>Add Staff Member</strong> to create a records-only entry. Enter their name, job title, email address (optional), phone number, and employment start date. Once saved, they appear in the Records Only section and can be associated with RTW checks, certificates, spray operator records, and training logs. No invitation is sent and no login is created.</p>

<h3>Inviting Someone to Use the System</h3>
<p>To give a staff member access to BDE Farm Trac, click <strong>Invite</strong> on their record. A dialog appears where you choose two things:</p>
<ul>
<li><strong>Access Type</strong> — which platforms they can use (see below)</li>
<li><strong>Permission Level</strong> — what they can see and do within those platforms (see below)</li>
</ul>
<p>Once you click Send Invitation, an email is sent to the address on their staff record. The link in that email is valid for seven days. When they follow the link, they set their own password securely — you never see or set it on their behalf. Once accepted, their record moves to the System Users section and their invitation status changes to Accepted.</p>

<h3>Access Types — Which Platforms</h3>
<p>Each invited user is assigned one of four access types that determine which parts of BDE Farm Trac they can reach:</p>
<ul>
<li><strong>No System Access</strong> — a records-only staff member. Useful if you later decide they do not need a login after all, without losing their staff record.</li>
<li><strong>Mobile App Only</strong> — the user can log into the BDE Farm Trac mobile app on their phone or tablet to log records in the field, but they cannot access the web dashboard. This is the recommended setting for field operators who need to capture records on the go.</li>
<li><strong>Web Dashboard Only</strong> — the user can log into the full web dashboard but not the mobile app. Suitable for office-based managers or agronomists who work from a desktop or laptop.</li>
<li><strong>Full Access</strong> — the user can use both the web dashboard and the mobile app. Appropriate for farm managers and senior staff who need flexibility across platforms.</li>
</ul>

<h3>Permission Levels — What They Can See and Do</h3>
<p>Within whichever platform(s) they can access, each user is assigned a permission level that controls which sections of the system are visible to them:</p>
<ul>
<li><strong>Operator</strong> — the standard field-worker level. Operators can log records (sprays, livestock movements, equipment checks, etc.) and view their own submissions. They cannot see financial data, staff records, business reports, or system settings.</li>
<li><strong>Senior / Foreman</strong> — can view all farm records and manage the team's record submissions. Seniors can also access the Staff section to view team members and their training status. They cannot access financial or business report pages.</li>
<li><strong>Farm Manager</strong> — full operational access including financial records, business reports, and farm settings. Managers can invite new users and update access levels for existing staff. They cannot access billing or subscription settings.</li>
<li><strong>Owner</strong> — unrestricted access to every part of the system including billing, subscription management, and all farm settings. The Owner level is typically reserved for the account holder or business principal.</li>
</ul>

<h3>Changing Access After Invitation</h3>
<p>You can change any user's access type or permission level at any time. Find their record in the System Users section and click <strong>Edit</strong>. Changes take effect the next time they load the application — there is no need to re-invite them or for them to take any action.</p>

<h3>Multi-Farm Access</h3>
<p>BDE Farm Trac supports holding groups and consultants who need access to more than one farm. A single login can be associated with multiple farm holdings, and each association carries its own independent access type and permission level. A farm manager at one holding might be an operator-level user at another farm in the same group — the system tracks both separately. Users with access to multiple farms see a farm selector after they log in.</p>

<h3>Staff Who Leave</h3>
<p>When a staff member leaves your employment, you should update their record to reflect their leaving date. If they had system access, edit their access type to <strong>No System Access</strong> — this immediately prevents them from logging in while preserving their historical records for compliance purposes. Staff records and their associated RTW checks, certificates, and training logs must be retained for a minimum of two years after employment ends.</p>

<h3>A Note on Shared Devices</h3>
<p>BDE Farm Trac does not support shared device accounts. Each staff member who needs to log records should have their own login — this ensures a full and auditable trail of who entered each record, which is a requirement under Red Tractor assurance schemes. Mobile devices are ubiquitous and inexpensive; providing each field operator with their own login via the mobile app is strongly recommended over sharing a single device account between multiple workers.</p>`,
    },
    {
      id: 10004,
      title: "Thinning Records — Poultry Production",
      category: "Poultry Production",
      content: `<img src="/api/help-images/livestock.png" alt="Poultry Thinning Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>Thinning (or partial depletion) is the staged removal of broiler birds from the house before final depletion to reduce stocking density and allow the remaining birds to grow to target weight. Under Red Tractor Broilers standards, full records of each thinning event must be maintained.</p>

<h3>Why Thinning Records Matter</h3>
<p>Stocking density is a critical welfare parameter in broiler production. Council Directive 2007/43/EC and the Red Tractor Broilers standard set maximum cumulative placement densities. Detailed thinning records demonstrate that your management decisions are responsive to flock performance and that your stocking density calculations remain within the permitted limits throughout the crop. Records are also required by abattoirs for Food Chain Information (FCI) purposes.</p>

<h3>What to Record</h3>
<p>For each thinning event, record: the date and which thinning this is (1st, 2nd, 3rd, or final depletion), the number of birds removed, the target and actual average live weight (kg), the destination abattoir or lairage, the catching contractor's name, catching start and end times, the transport vehicle registration, and any dead on arrival (DOA) birds identified at loading. The catching start and end times are used to verify that catching-to-slaughter journey times comply with the maximum permitted journey time for live birds.</p>

<h3>DOAs at Loading</h3>
<p>Dead on arrival (DOA) birds found at the abattoir are reported back to the farm by the processor. These DOAs must be reconciled against your thinning record. A DOA rate above the processor's threshold may trigger a welfare investigation. Logging DOAs at the point of loading — where birds found dead during catching are recorded — is a separate (and often overlooked) record that complements the abattoir DOA report.</p>

<h3>Using the Tab</h3>
<p>Navigate to <strong>Poultry Production → Thinning</strong> and click <strong>Log Thinning</strong>. Complete all required fields at the time of each thinning event. After final depletion, the full thinning history for the flock provides a complete production audit trail.</p>`,
    },
    {
      id: 10007,
      title: "Soil Sample Register — Understanding References and Status",
      category: "Environmental",
      content: `<img src="/api/help-images/field-operations.png" alt="Soil Sample Register" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The Soil Sample Register in BDE Farm Trac records all soil sampling events in a structured, auditable format that satisfies Red Tractor Cross-Compliance requirements. Each record is automatically assigned a unique reference number in the format <strong>SS-YYYY-NNNN</strong> (e.g. SS-2025-0012), which provides a traceable identifier for every sample taken.</p>

<h3>Status System</h3>
<p>Each soil sample record has one of three statuses: <strong>Pending</strong> (sample taken but lab results not yet received), <strong>Results Received</strong> (laboratory report received and data entered), or <strong>Action Required</strong> (results indicate pH, phosphorus, potassium, or magnesium index is outside target range and a management response is needed).</p>

<h3>Status Tabs</h3>
<p>The register uses a tab bar to filter records by status. Use the <strong>Action Required</strong> tab to quickly identify fields that need corrective action before the next growing season. The <strong>Pending</strong> tab shows samples awaiting lab results. You can update the status of any record using the dropdown menu on each card.</p>

<h3>Print Register</h3>
<p>The <strong>Print Register</strong> button generates a printable report of your current filtered records. Print the full register annually or ahead of a Red Tractor audit. The printed register shows all reference numbers, sampling dates, field names, nutrient indices, and pH values in a standard tabular format.</p>

<h3>Sampling Frequency</h3>
<p>Under Red Tractor standards, arable, horticultural, and intensive grassland fields should be sampled at least once every four years. Fields receiving regular applications of slurry, manure, or other organic materials should be sampled more frequently. The dashboard will surface a reminder when any field exceeds the recommended sampling interval.</p>`,
    },
    {
      id: 10008,
      title: "AI & Reproduction Records — Cattle and Livestock",
      category: "Livestock",
      content: `<img src="/api/help-images/livestock.png" alt="AI and Reproduction Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The <strong>AI & Reproduction</strong> tab in the Livestock section allows you to record all artificial insemination events, natural service matings, and pregnancy diagnostic results for your cattle, sheep, and pig herds. These records are not a formal Red Tractor requirement in isolation, but they feed directly into calving, lambing, and farrowing records, which are assessed at audit.</p>

<h3>What to Record for AI Events</h3>
<p>For each AI event, record: the herd or individual animal (use the ear tag or herd group), the date of insemination, the sire/bull name and registration number (from the semen straw), the AI technician name, the synchronisation protocol used (if any), and any oestrus detection method employed (visual, tail paint, electronic). Recording the sire registration number provides traceability for any subsequent calves with health or performance concerns.</p>

<h3>Pregnancy Diagnosis (PD) Results</h3>
<p>Record pregnancy diagnosis results — whether by rectal palpation, ultrasound, or progesterone test — against each served animal. Include the PD date, method, the vet or technician who performed the PD, and the outcome (confirmed pregnant, empty, or re-serve). For cattle, this data is used to calculate expected calving dates, which flow into your calving records.</p>

<h3>Natural Service</h3>
<p>Record bull or ram service events alongside AI records using the same tab. Include the service date, which bull or ram was used (with registration or ear tag), and the number of females served in that group. This is important for calculating expected calving/lambing windows and managing bull fertility records as required under some veterinary health plan frameworks.</p>

<h3>Using the Tab</h3>
<p>Navigate to <strong>Livestock → AI & Reproduction</strong>. Click <strong>Add Record</strong> and complete the form. Pregnancy outcomes can be added retrospectively once the PD result is known. Use the filter to show records by outcome status (served / confirmed pregnant / empty).</p>`,
    },
    {
      id: 10009,
      title: "Vet Prescriptions — Storing and Tracking Written Authorisations",
      category: "Livestock",
      content: `<img src="/api/help-images/medicine-records.png" alt="Vet Prescriptions" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>Under the Veterinary Medicines Regulations 2013 (as amended), certain medicines — including all prescription-only veterinary medicines (POM-V and POM-VPS) — may only be administered under the authority of a Written Authority (WA) or Veterinary Written Authorisation (VWA) issued by a Veterinary Surgeon. The <strong>Vet Prescriptions</strong> tab provides a dedicated record for these authorisations, separate from the administration records in the Medicine Register.</p>

<h3>What to Record</h3>
<p>For each prescription or written authorisation, record: the prescribing vet's name and practice, the date of issue, the medicine name and the maximum dose authorised, the species and group of animals covered, the authorisation expiry date, and the prescription or authorisation reference number. Attach a scanned copy of the original document where possible.</p>

<h3>Why Separate Records?</h3>
<p>The medicine record (in the Medicine Register) records each administration event — a specific animal or group, on a specific date, with a specific dose. The prescription record is the legal authority that permits those administrations to occur. Keeping these as linked but separate records mirrors the structure required by the Veterinary Medicines Regulations and provides a clean audit trail: the prescription shows the authority; the medicine record shows the use.</p>

<h3>Expiry Alerts</h3>
<p>Prescriptions and written authorisations have a maximum validity period (typically six months for repeat prescriptions, though this varies). The system will show an amber warning badge when an authorisation is within 28 days of expiry, and a red badge once expired. An expired authorisation means you are no longer authorised to purchase or administer the medicine under that WA. Contact your vet to renew before the expiry date.</p>

<h3>Red Tractor and Inspection Evidence</h3>
<p>Red Tractor inspectors and your Veterinary Health Plan (VHP) vet will check that all prescription-only medicines in your medicine records are covered by a current, valid written authorisation. Having these stored digitally in the system — with expiry tracking — ensures you can produce the evidence quickly during an audit visit.</p>`,
    },
    {
      id: 10010,
      title: "SFI / ELMS Agreements — Recording and Tracking Agri-Environment Schemes",
      category: "Environmental",
      content: `<img src="/api/help-images/field-operations.png" alt="SFI and ELMS Agreements" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The <strong>SFI / ELMS</strong> tab in the Environmental section provides a central record for all Sustainable Farming Incentive (SFI), Countryside Stewardship (CS), and other agri-environment agreements your farm holds. This includes actions, options, and their associated payment rates, management prescriptions, and agreement end dates.</p>

<h3>What to Record</h3>
<p>For each agreement or agreement option, record: the scheme name (SFI 2023/2024, CS Mid-Tier, CS Higher Tier, etc.), the agreement reference number (from Natural England or the Rural Payments Agency), the start and end dates, the annual payment rate, the land parcels or field blocks covered, and the management requirements (e.g. "AB8 Flower-rich margins — 6m buffer, no fertiliser, cut and remove August–September").</p>

<h3>Compliance Evidence</h3>
<p>Each agreement option has specific management requirements that must be evidenced at inspection. Use the notes field to record any field-level management actions relevant to the option — for example, confirming that in-field trees in an agroforestry option have been maintained, or that overwintered stubble has been left in accordance with the CS option conditions.</p>

<h3>Payment Tracking</h3>
<p>Record each payment received against its agreement, including the payment date, the amount, and the claim reference. This provides a complete financial record of agri-environment income, which is useful for farm business accounting and for demonstrating scheme compliance over time.</p>

<h3>Integration with Soil Sampling and Field Records</h3>
<p>Many SFI and CS options have requirements that link directly to other BDE Farm Trac records — such as soil sampling frequency, fertiliser application restrictions, and cover cropping. Cross-reference your agreement conditions against your field operation records to ensure alignment.</p>`,
    },
    {
      id: 10011,
      title: "Slurry & Manure Management — Records and Closed Period Compliance",
      category: "Environmental",
      content: `<img src="/api/help-images/field-operations.png" alt="Slurry and Manure Management" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>Slurry and manure management records are a mandatory requirement under the Nitrate Vulnerable Zones (NVZ) Action Programme in England, and equivalent regulations apply in Wales, Scotland, and Northern Ireland. If your farm is within an NVZ, you must maintain records of all slurry and manure applications, storage capacity calculations, and spreading events.</p>

<h3>NVZ Closed Periods</h3>
<p>Applications of slurry, poultry manure, and nitrogen-rich organic materials are prohibited during the closed period. For arable land in England, the closed period for slurry runs from 1 October to 31 January (inclusive). For grassland, the period is 15 October to 31 January. The system will warn you if you attempt to log a spreading event that falls within the closed period for your land type.</p>

<h3>What to Record for Each Application</h3>
<p>For every slurry or manure application, record: the date of application, the field or land parcel, the type of material (cattle slurry, pig slurry, FYM, poultry litter, digestate, etc.), the volume or quantity applied (m³ or tonnes), the application method (tanker injector, trailing shoe, splash plate, solid spreader), and the crop at time of application. If the application is on behalf of a contractor, record the contractor's name.</p>

<h3>Storage Capacity</h3>
<p>Under NVZ rules, slurry stores must have sufficient capacity to hold all slurry produced during the closed period. Use the Slurry tab to calculate your required storage volume based on your livestock type, numbers, and housing period. If storage capacity is insufficient, you must have a plan in place — this is assessed at NVZ inspection.</p>

<h3>Nutrient Management</h3>
<p>Slurry and manure applications must be factored into your farm's nutrient management plan (NMP). The nitrogen, phosphorus, and potassium content of each application should be estimated using standard values from the Nutrient Management Guide (RB209) and deducted from your crop nitrogen budget. Cross-reference with your soil sample results to avoid over-application.</p>`,
    },
    {
      id: 10012,
      title: "Grain Storage Quality — Monitoring and Record Keeping",
      category: "Equipment & Machinery",
      content: `<img src="/api/help-images/field-operations.png" alt="Grain Storage Quality" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The <strong>Grain Storage Quality</strong> tab allows you to register your grain stores (bins, flat stores, silos) and log quality tests and temperature monitoring records for each store. These records are required under Red Tractor Combinable Crops standards and are essential for demonstrating traceability of your stored grain from harvest through to sale.</p>

<h3>Registering Stores</h3>
<p>Begin by registering each grain store on the farm — flat stores, bins, and silos should each have their own record. Specify the store type, capacity (tonnes), the crop currently in storage, variety, and harvest year. This creates the foundation for all quality and temperature records attached to that store.</p>

<h3>Quality Testing</h3>
<p>For each quality test, record: the test date, moisture content (%), specific weight (kg/hl), screenings (%), Hagberg Falling Number (for wheat intended for milling), and the result of any mycotoxin test. Each test is linked to a specific store and crop. Failing results trigger an action required flag — record the management response (turning grain, increasing aeration, blending) in the notes.</p>

<h3>Temperature Monitoring</h3>
<p>Temperature monitoring is critical during the first weeks after harvest when grain is at risk of heating. Log temperature readings from each probe or monitoring point, including the probe location and the trend direction (rising, stable, falling). A rising temperature is a key indicator of fungal activity or insect infestation and requires immediate action.</p>

<h3>Fumigation and Treatment Records</h3>
<p>If grain is treated with a stored grain insecticide or subjected to phosphine fumigation, this must be recorded separately using the medicine/chemical application record and cross-referenced to the affected store. The active ingredient, dose, application date, and the minimum safe re-entry period must all be documented.</p>`,
    },
    {
      id: 10013,
      title: "Horticulture Module — Crop Records, Sprays, and Assurance",
      category: "Horticulture",
      content: `<img src="/api/help-images/field-operations.png" alt="Horticulture Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The Horticulture module supports growers producing vegetables, salads, soft fruit, top fruit, and ornamental crops under Red Tractor Fresh Produce or GLOBALG.A.P. assurance schemes. It provides a dedicated record-keeping framework for crop planting records, protected structure management, pesticide applications, and harvest logs.</p>

<h3>Crop Records</h3>
<p>Register each crop or growing lot with the variety, planting or sowing date, field or structure reference, and the target harvest date. For protected crops (glasshouse, polytunnel), record the structure ID and the crop cycle number. Each crop record provides the link between inputs applied and outputs harvested — the key traceability chain required under GLOBALG.A.P.</p>

<h3>Pesticide Applications</h3>
<p>Under Red Tractor Fresh Produce standards, all pesticide applications must be recorded within 48 hours of application. Record the product name, authorisation number (MAPP or HBN), crop and growth stage, target pest or disease, dose applied (per hectare or per litre of water), application date and time, operator name (including BASIS qualification reference for anyone giving advice), and weather conditions at time of application. If the product has a pre-harvest interval (PHI) or Maximum Residue Level (MRL) consideration, note the re-entry date and any harvest restriction.</p>

<h3>Harvest Records</h3>
<p>Log each harvest event against the crop record: harvest date, quantity harvested (kg or units), quality grade (Class I, Class II, etc.), destination (packer, direct retail, wholesale market), and any quality issues noted. For multi-pick crops (salads, herbs, strawberries), each pick is recorded as a separate harvest event under the same crop record.</p>

<h3>Worker Welfare</h3>
<p>The Horticulture module includes accommodation and worker welfare records for farms housing seasonal workers. These records are assessed under Red Tractor Fresh Produce and GLOBALG.A.P. social responsibility requirements. Record housing capacity, facilities inspections, and any welfare concerns raised and resolved.</p>`,
    },
    {
      id: 10014,
      title: "Carbon & Sustainability — Measuring and Recording Your Farm's Footprint",
      category: "Carbon & Sustainability",
      content: `<img src="/api/help-images/field-operations.png" alt="Carbon and Sustainability" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The Carbon & Sustainability module provides a framework for measuring, recording, and improving your farm's carbon footprint and sustainability metrics. While carbon reporting is not currently a formal Red Tractor requirement, it is increasingly a condition of major retailer supply contracts, and a detailed carbon baseline will be required for most Sustainable Farming Incentive (SFI) "whole farm" actions.</p>

<h3>Carbon Footprint Assessments</h3>
<p>Record the results of carbon footprint assessments carried out using tools such as Farm Carbon Toolkit, Agrecalc, Cool Farm Tool, or a tool specified by your assurance scheme or retailer. For each assessment, record: the assessment date, the tool used, the total farm emissions (tCO₂e), the emissions intensity (tCO₂e per tonne of product or per hectare), and the boundary of the assessment (what is and is not included).</p>

<h3>Biodiversity Net Gain and Habitat Records</h3>
<p>Record habitat enhancement actions taken on the farm — hedgerow planting lengths (metres), woodland creation (hectares), wildflower meadow establishment, and pond creation or restoration. These actions contribute to your Biodiversity Net Gain (BNG) position and are required evidence for certain SFI and CS option payments.</p>

<h3>Energy and Water Use</h3>
<p>Log monthly electricity, gas, and fuel consumption to track energy intensity trends over time. Record any renewable energy generation (solar, wind, AD) and any energy efficiency improvements made. This data feeds directly into your carbon footprint calculations and may be required for retailer or scheme sustainability questionnaires.</p>

<h3>Sustainability Action Plan</h3>
<p>Use the Sustainability module to record and track progress against a farm sustainability action plan. Each action should have a target date, a responsible person, and a measurable outcome. Progress is tracked as Not Started / In Progress / Completed, with the option to add evidence notes and links to supporting records in other parts of the system.</p>`,
    },
    {
      id: 10015,
      title: "Farm Diversification — Recording Non-Agricultural Activities",
      category: "Diversification",
      content: `<img src="/api/help-images/field-operations.png" alt="Farm Diversification" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The Farm Diversification module provides a record-keeping framework for non-agricultural business activities operating from a farming enterprise — including farm shops, holiday accommodation, event hosting, equestrian services, renewable energy, processing, and direct retail. These activities have their own compliance requirements and must be managed separately from core agricultural records.</p>

<h3>Activity Register</h3>
<p>Register each diversification activity with its type, start date, planning permission reference (if applicable), and the primary contact or manager responsible. Activities that require specific licences or permits — such as a premises licence for alcohol sales, a licence to operate an abattoir, or planning consent for a change of use — should have their licence details and expiry dates recorded here.</p>

<h3>Insurance and Liability</h3>
<p>Record insurance policy details for each diversification activity. Public liability cover is typically required at a higher level for visitor-facing activities (farm shops, pick-your-own, open farms, holiday lets). Log the policy number, insurer, cover level, and renewal date. The system will surface renewal reminders 60 days before expiry.</p>

<h3>Food Hygiene and Safety (Farm Shops and Processing)</h3>
<p>If you sell or process food directly to consumers, you must be registered with your local authority Environmental Health department. Record your food business registration reference, your food hygiene rating, the date of your last EH inspection, and the name of your Food Hygiene Champion or designated food safety manager. HACCP and allergen management documentation should be referenced here.</p>

<h3>Holiday Accommodation</h3>
<p>Record holiday let, glamping, or campsite accommodation units with their capacity, booking platform references, fire risk assessment dates, and EPC certificates. Accommodation used for workers (e.g. seasonal agricultural labour) should be recorded in the Staff module rather than here.</p>`,
    },
    {
      id: 10016,
      title: "Water & Irrigation — Abstraction, Usage, and Compliance Records",
      category: "Water & Irrigation",
      content: `<img src="/api/help-images/field-operations.png" alt="Water and Irrigation" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The Water & Irrigation module provides a dedicated record for water abstraction licences, irrigation events, water quality monitoring, and infrastructure maintenance. These records are required under the Water Framework Directive as implemented in UK law, and are a growing requirement under sustainability due diligence frameworks for horticultural and fresh produce supply chains.</p>

<h3>Abstraction Licences</h3>
<p>If you abstract water from a watercourse, borehole, or other source above the threshold volume (currently 20 m³/day), you require an abstraction licence from the Environment Agency (or equivalent body in devolved nations). Record each licence with its reference number, the abstraction source, the permitted annual volume (m³), the licence condition period, and expiry date. The system will surface renewal reminders ahead of expiry.</p>

<h3>Meter Readings and Usage Logs</h3>
<p>Log meter readings at a frequency appropriate to your licence conditions — typically monthly as a minimum, or more frequently during peak irrigation periods. Record the reading date, meter identifier, and the cumulative meter reading. The system calculates usage between readings and plots this against your annual licence volume, so you can see at a glance if you are approaching your permitted abstraction limit.</p>

<h3>Irrigation Events</h3>
<p>For each irrigation event, record: the date, the field or crop irrigated, the volume applied (m³ or mm), the irrigation system used (trickle/drip, sprinkler, surface flood, boom), and the water source. This information is required under some assurance schemes and is useful for demonstrating water-use efficiency improvements over time.</p>

<h3>Water Quality Monitoring</h3>
<p>If irrigation water is applied to crops for human consumption, water quality monitoring may be required. Record each water quality test with the date, source, testing laboratory, parameters tested (E. coli, turbidity, pH, nitrate), and results. Failing results require immediate action — record the remedial steps taken, including any disinfection treatment applied.</p>`,
    },
    {
      id: 10017,
      title: "Equipment Defect Reports — Tracking Faults and Repairs",
      category: "Equipment & Machinery",
      content: `<img src="/api/help-images/field-operations.png" alt="Equipment Defect Reports" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The <strong>Defect Reports</strong> tab in the Equipment section provides a register of all reported faults, defects, and maintenance issues. Maintaining a defect log is a requirement under Red Tractor standards for equipment used in food production, chemical application, and livestock handling — and is a legal obligation under health and safety legislation where defects could create a risk of injury.</p>

<h3>Severity Levels</h3>
<p>Each defect is assigned a severity level: <strong>Low</strong> (monitor — no immediate action required, repair at next service), <strong>Medium</strong> (repair within a defined timeframe before next use), <strong>High</strong> (equipment must not be used until repaired — tag out of service), or <strong>Critical</strong> (immediate safety risk — equipment is taken out of service immediately and the defect reported to management). The severity level determines how the record is displayed and what alerts are generated.</p>

<h3>Status Workflow</h3>
<p>Defect reports follow a three-stage workflow: <strong>Open</strong> (reported, not yet actioned), <strong>In Progress</strong> (repair works have started or been commissioned), and <strong>Resolved</strong> (repair complete and equipment returned to service). Use the dropdown menu on each defect card to advance the status. Resolution date is automatically recorded when the status is set to Resolved.</p>

<h3>Auto-References</h3>
<p>Each defect report is assigned a reference in the format <strong>ED-YYYY-NNNN</strong> (e.g. ED-2025-0031). This reference allows you to cross-reference the defect in any external repair invoices, maintenance records, or insurance documents.</p>

<h3>Spray Equipment</h3>
<p>Defects on crop protection equipment (sprayers, nozzles, pressure gauges) are particularly important — a spray equipment defect can lead to pesticide under-dose (agronomic failure) or over-dose (MRL exceedance and environmental risk). All spray equipment faults must be resolved before the next application, and the resolution should be cross-referenced to the sprayer calibration check record.</p>`,
    },
    {
      id: 10018,
      title: "Testing Laboratories — Registering Labs and Linking Test Results",
      category: "Nutrient Management",
      content: `<img src="/api/help-images/field-register.png" alt="Testing Laboratory Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>BDE Farm Trac allows you to register the testing laboratories you use as part of your supplier directory and then link them directly to individual test records — soil samples, grain quality tests, and water quality tests. This creates a traceable audit trail showing exactly which UKAS-accredited laboratory produced each set of results, as required by Red Tractor and most assured scheme auditors.</p>

<h3>Why Link Labs to Test Records?</h3>
<p>Assured schemes require that analytical tests used for compliance purposes — soil pH for fertiliser planning, grain mycotoxin screens, or irrigation water bacteriological results — are carried out by an accredited laboratory. Simply noting "Lab X" in a free text field is not enough; the laboratory needs to be registered with its credentials so that an auditor can verify accreditation. BDE Farm Trac stores the lab's UKAS number alongside every linked test record.</p>

<h3>Registering a Testing Laboratory</h3>
<p>Labs are added within the <strong>Stock &amp; Suppliers</strong> section. Click <strong>Add Supplier</strong>, set the category to <strong>Laboratory</strong>, and complete the name, contact details, and UKAS accreditation number. The laboratory is now available for selection across all modules that record analytical test results.</p>

<h3>Linking a Lab to a Soil Sample</h3>
<p>When adding a soil sample record (under <strong>Soil Management → Soil Tests</strong> or via the mobile app), a <strong>Testing Laboratory</strong> picker appears. Tap or click to select the accredited lab that will be analysing the sample. The lab name and UKAS number are recorded against the sample and carried through to printed reports.</p>

<h3>Linking a Lab to a Grain Quality Test</h3>
<p>In <strong>Equipment → Grain Storage</strong>, each quality test record (moisture, protein, Hagberg, mycotoxin) includes a laboratory selector. Select the lab that issued the certificate. The lab reference is stored so that you can cross-reference against the certificate you received.</p>

<h3>Linking a Lab to a Water Quality Test</h3>
<p>Water quality tests — whether in the Livestock module (herd drinking water) or the Water &amp; Irrigation module (irrigation source) — include a laboratory selector. For Red Tractor Fresh Produce, irrigation water microbiological tests must be carried out by a UKAS-accredited laboratory; linking the lab to the test record provides the required audit evidence.</p>

<h3>If No Labs Are Registered Yet</h3>
<p>If you have not yet added any laboratories, the picker will show an empty list with a prompt to add a lab in Stock &amp; Suppliers first. The lab field is optional on individual records — you can complete the test data and add the lab link later once it has been registered — but for audit purposes it is best practice to link the lab before submitting the record.</p>`,
    },
    {
      id: 10020,
      title: "Pig Production Module — Overview",
      category: "Pig Production",
      content: `<p>The Pig Production module provides a dedicated compliance register for Red Tractor Pigs scheme holders. It covers herd records, medicine & withdrawal management, feed & water records, and environmental controls specific to pig units.</p>

<h3>Tabs Overview</h3>
<ul>
<li><strong>Herd Overview</strong> — Register your pig herds with herd number, housing type, and capacity. Track herd movements and current occupancy.</li>
<li><strong>Medicine Records</strong> — Log all veterinary treatments with product, batch number, dosage, route, and withdrawal period. The module automatically tracks withdrawal end dates so you know when animals are clear to move or slaughter.</li>
<li><strong>Feed Records</strong> — Record all feed deliveries with supplier, batch number, and quantity. Maintained as a legally required feed chain record.</li>
<li><strong>Mortality Log</strong> — Log deaths with cause and disposal method. Required under Red Tractor Pig Standards.</li>
<li><strong>Health Assessments</strong> — Record periodic health assessments and veterinary visits. Link to your farm vet and any advisory notes.</li>
</ul>

<h3>Red Tractor Pig Standards</h3>
<p>Key requirements covered by this module include: individual identification of breeding animals, medicine records retained for 5 years, withdrawal periods observed before slaughter, feed records including suppliers and batch numbers, and biosecurity measures documented. All records can be printed as a register for inspection purposes.</p>`,
    },
    {
      id: 10021,
      title: "Poultry Production Module — Overview",
      category: "Poultry Production",
      content: `<p>The Poultry Production module covers broiler, layer, and turkey enterprises under the Red Tractor Poultry scheme. It provides flock-level record keeping for placements, production data, medicine, and end-of-cycle thinning and depopulation records.</p>

<h3>Tabs Overview</h3>
<ul>
<li><strong>Flocks</strong> — Register each flock with placement date, species, breed, house number, and chick supplier. Track current stock count and expected depletion date.</li>
<li><strong>Daily Records</strong> — Log daily mortality, feed consumption, and water intake. These records are checked by Red Tractor auditors as evidence of ongoing monitoring.</li>
<li><strong>Medicine Records</strong> — Record all in-water and in-feed medications with batch number, withdrawal period, and operator details. Withdrawal compliance is tracked automatically.</li>
<li><strong>Thinning & Depletion</strong> — Log each thinning or catch operation with numbers removed, transporter, and destination abattoir.</li>
<li><strong>Flock Health Assessments</strong> — Record formal veterinary flock health reviews including scored assessments and action plans.</li>
</ul>

<h3>Red Tractor Poultry Standards</h3>
<p>Key requirements covered: flock placement records retained for 2 years after depletion, daily mortality records, medicine records with withdrawal periods, salmonella monitoring results, catcher crew records, and thinning documentation. All records can be exported as a register for audit.</p>`,
    },
    {
      id: 10022,
      title: "Horticulture Module — Overview",
      category: "Horticulture",
      content: `<p>The Horticulture module supports Red Tractor Fresh Produce standard compliance for growers of salads, vegetables, fruit, and protected crops. It covers spray records, produce traceability, worker welfare, and assured field management.</p>

<h3>Tabs Overview</h3>
<ul>
<li><strong>Crops & Beds</strong> — Register your growing areas, whether open-field, glasshouse, or polytunnel, with area, crop variety, and planting date.</li>
<li><strong>Spray Records</strong> — Log all pesticide applications with MAPP number, maximum dose, harvest interval, and operator certificate. Fully linked to your field register.</li>
<li><strong>Harvest Records</strong> — Record harvest batches with quantity, date, and destination. Provides the product traceability chain required by Red Tractor Fresh Produce.</li>
<li><strong>Water Quality</strong> — Log irrigation water test results. Red Tractor Fresh Produce requires regular microbial testing of irrigation sources used in the 30 days before harvest.</li>
<li><strong>Worker Welfare</strong> — Record welfare checks, accommodation inspections, and competency assessments for seasonal and permanent workers.</li>
</ul>

<h3>Red Tractor Fresh Produce Standards</h3>
<p>Key requirements covered: spray records retained for 3 years, all pesticides used within label recommendations, harvest intervals observed, produce traceability from field to first buyer, irrigation water testing, and worker welfare checks. Records can be printed as a register for assured buyer or certification body audits.</p>`,
    },
    {
      id: 10023,
      title: "Carbon & Sustainability Module — Overview",
      category: "Carbon & Sustainability",
      content: `<p>The Carbon & Sustainability module helps you measure, record, and reduce your farm's greenhouse gas emissions and environmental footprint. It is aligned with the UK Farm Carbon Calculator methodology and supports reporting requirements under agri-environment schemes and assured supply chain programmes.</p>

<h3>Tabs Overview</h3>
<ul>
<li><strong>Carbon Footprint</strong> — Enter your annual inputs (fuel, fertiliser, livestock numbers, purchased feed) and the module calculates an estimated carbon footprint using emission factors from the IPCC and Defra. Results are shown per hectare and per tonne of output.</li>
<li><strong>Energy Use</strong> — Record electricity and fuel consumption by source. Track renewable energy generation (solar, wind, anaerobic digestion) to offset consumption.</li>
<li><strong>Soil Carbon</strong> — Log soil organic matter measurements from test results to track carbon sequestration over time.</li>
<li><strong>Action Plans</strong> — Record sustainability actions taken or planned — cover crops, min-till, hedgerow planting, renewable energy — and track their estimated impact.</li>
<li><strong>Biodiversity</strong> — Log biodiversity features and assessments, cross-linked to the Environmental module's habitat register.</li>
</ul>

<h3>Why This Matters</h3>
<p>Many UK farm assurance and retail supply chain programmes now require evidence of carbon footprinting and sustainability planning. This module gives you the record base to satisfy those requirements and to demonstrate year-on-year progress against your sustainability goals.</p>`,
    },
    {
      id: 10024,
      title: "Farm Diversification Module — Overview",
      category: "Farm Diversification",
      content: `<p>The Farm Diversification module helps you manage compliance records for non-agricultural income activities on your holding — including farm shops, holiday lets, visitor attractions, processing facilities, and renewable energy installations.</p>

<h3>Tabs Overview</h3>
<ul>
<li><strong>Activities Register</strong> — Register each diversification enterprise with type, start date, planning consent reference, and applicable licences or permissions.</li>
<li><strong>Licences & Permits</strong> — Store licence details and expiry dates for food business registrations, alcohol licences, environmental permits, and other regulatory requirements.</li>
<li><strong>Food Business Records</strong> — For farm shops and direct sales, record food hygiene inspections, temperature monitoring logs, and supplier approvals.</li>
<li><strong>Visitor Safety</strong> — Log risk assessments and public liability checks for visitor-facing enterprises such as farm shops, open farms, or holiday lets.</li>
<li><strong>Financial Records</strong> — Record diversification income and costs by activity for cross-referencing with the Financial module.</li>
</ul>

<h3>Regulatory Context</h3>
<p>Diversification activities are subject to their own regulatory frameworks separate from farm assurance — including food law (Regulation (EC) 852/2004 as retained in UK law), planning law, and licensing law. This module provides a central record-keeping hub but does not replace professional regulatory advice for your specific enterprise.</p>`,
    },
    {
      id: 10025,
      title: "Water & Irrigation Module — Overview",
      category: "Water & Irrigation",
      content: `<p>The Water & Irrigation module provides a complete record-keeping system for water abstraction, irrigation management, and water quality compliance. It supports Environment Agency abstraction licence compliance and Red Tractor Fresh Produce water testing requirements.</p>

<h3>Tabs Overview</h3>
<ul>
<li><strong>Abstraction Records</strong> — Log daily or weekly abstraction volumes from each source (borehole, river, reservoir). Abstraction licence conditions typically specify maximum daily and annual volumes — the module alerts you when you approach permitted limits.</li>
<li><strong>Irrigation Events</strong> — Record each irrigation application with date, field, volume, crop growth stage, and method (trickle, overhead, boom). Required for Red Tractor Fresh Produce and some agri-environment scheme conditions.</li>
<li><strong>Water Quality Tests</strong> — Log microbial and chemical test results from each water source. Red Tractor Fresh Produce requires testing of irrigation water used within 30 days of harvest of ready-to-eat crops.</li>
<li><strong>Sources Register</strong> — Register all water sources with abstraction licence numbers, permitted volumes, and licence expiry dates.</li>
<li><strong>Infrastructure</strong> — Record storage reservoirs, pump stations, and distribution infrastructure with maintenance schedules.</li>
</ul>

<h3>Abstraction Licence Compliance</h3>
<p>All abstraction from surface or groundwater sources of more than 20 cubic metres per day requires an Environment Agency abstraction licence. Records of volumes abstracted must be kept and may be inspected by the Environment Agency. Exceeding licence conditions is a criminal offence.</p>`,
    },
    {
      id: 10026,
      title: "AI & Reproduction Records — Livestock",
      category: "Livestock",
      content: `<p>The AI & Reproduction tab within the Livestock module enables you to record artificial insemination events, natural service records, pregnancy diagnoses, and calving or lambing outcomes for each herd or flock.</p>

<h3>What to Record</h3>
<ul>
<li><strong>AI Events</strong> — Date, sire straw reference (including bull/ram/boar name, breed, and AI company reference), female or group inseminated, technician name, and insemination method (frozen, fresh, sexed).</li>
<li><strong>Natural Service</strong> — Service date, sire ear tag or stock number, female or group, and service outcome if known.</li>
<li><strong>Pregnancy Diagnosis</strong> — Date of scanning or manual diagnosis, operator, outcome (pregnant / not in calf), and expected calving date.</li>
<li><strong>Calving / Lambing Records</strong> — Date, dam ID, calf/lamb ID(s), birth weight (optional), and outcome (live, stillborn, requiring assistance).</li>
</ul>

<h3>Red Tractor Requirements</h3>
<p>Red Tractor Beef & Lamb and Dairy standards require that breeding records are kept and retained for at least 3 years. For dairy herds, Johne's disease risk management plans and breeding decisions are closely linked — the AI record provides evidence that sires used were from tested herds.</p>

<h3>Integration with the Individual Animal Register</h3>
<p>When a calf or lamb is born, you can immediately register it as an individual animal in the Individual Animals tab, linking its dam, sire, and birth details. This provides a full pedigree trail within BDE Farm Trac.</p>`,
    },
    {
      id: 10027,
      title: "Vet Prescriptions & Medicines — Red Tractor Requirements",
      category: "Livestock",
      content: `<p>The Vet Prescriptions tab in the Livestock module stores written veterinary prescriptions and links them to the corresponding medicine records in the Medicine Register. This satisfies the Red Tractor requirement for documentary evidence that medicines were prescribed before administration.</p>

<h3>What to Record</h3>
<ul>
<li><strong>Prescription Reference</strong> — The unique prescription number issued by the prescribing vet or practice.</li>
<li><strong>Prescribing Vet & Practice</strong> — Full name and practice address. A vet must have a valid veterinarian-client-patient relationship (VCPR) with your holding.</li>
<li><strong>Medicines Prescribed</strong> — Product name, strength, quantity, and authorised withdrawal period as stated on the prescription.</li>
<li><strong>Issue Date & Expiry</strong> — Prescriptions have a maximum validity period (usually 6 months under the Veterinary Medicines Regulations 2013). The system warns you if you try to use a prescription that has expired.</li>
<li><strong>Repeat Prescriptions</strong> — Mark whether the prescription is a one-off or a standing/repeat prescription, and the maximum number of repeats permitted.</li>
</ul>

<h3>Veterinary Medicines Regulations 2013</h3>
<p>Prescription-only medicines (POM-V and POM-VPS categories) may only be supplied on a written prescription from a veterinary surgeon. You must retain the original or a certified copy of the prescription for at least 5 years. Cascade medicines (those authorised for a different species or condition) require written veterinary authorisation and must be clearly flagged in your records.</p>`,
    },
    {
      id: 10028,
      title: "SFI / ELMs Actions & Agreements — Environmental Module",
      category: "Environmental",
      content: `<p>The SFI / ELMs tab in the Environmental module provides a register of your Sustainable Farming Incentive (SFI), Countryside Stewardship (CS), and Environmental Land Management (ELM) agreements. It is essential for cross-referencing land management actions required by your agreements against the field operations and spray records in BDE Farm Trac.</p>

<h3>What to Record</h3>
<ul>
<li><strong>Agreement Reference</strong> — Your unique SFI, CS, or ELMS agreement reference number as issued by the Rural Payments Agency.</li>
<li><strong>Scheme Name & Type</strong> — e.g. SFI 2024, Countryside Stewardship Mid-Tier, Higher Tier, or Landscape Recovery.</li>
<li><strong>Agreement Period</strong> — Start and end dates of the agreement.</li>
<li><strong>Actions / Options</strong> — Each action within the agreement (e.g. SAM1: Assess Soil, SAM2: Herbal Leys, AB1: Flower Margins) with the associated payment rate and target area or quantity.</li>
<li><strong>Evidence Records</strong> — Attach photos, soil tests, or management plans as evidence that actions have been carried out as required.</li>
</ul>

<h3>Keeping Compliant</h3>
<p>SFI and CS agreements are inspected by the Rural Payments Agency. Failure to comply with agreement conditions can result in payment reductions or recovery of payments already made. BDE Farm Trac helps you keep evidence of each action undertaken, including dates, areas, and outcomes, ready for an inspection visit.</p>`,
    },
    {
      id: 10029,
      title: "Slurry & Manure Management — Environmental Module",
      category: "Environmental",
      content: `<p>The Slurry & Manure Management tab in the Environmental module provides records of slurry storage capacity, spreading events, and manure management plans. These records are required under the Nitrate Pollution Prevention Regulations (NPPR) and by Red Tractor livestock standards.</p>

<h3>Slurry Stores Register</h3>
<p>Register each slurry store (lagoon, tower, covered store, lined pit) with its capacity in cubic metres, construction date, and any Environment Agency permit or RPID reference. Include the date of the most recent structural inspection. Slurry stores must be capable of holding 6 months of slurry storage for cattle and pigs in England (requirements vary by devolved nation); the register helps you confirm capacity is sufficient.</p>

<h3>Spreading Records</h3>
<p>For each slurry spreading event record: the date, the field or fields receiving slurry, the application rate in m³/ha or tonnes/ha, the incorporation method, and the weather conditions. Spreading records must demonstrate that you are not spreading during closed periods (England: 1 October to 31 January for slurry on grassland; specific dates vary for different manure types and countries).</p>

<h3>Manure Management Plan</h3>
<p>A farm-level manure management plan should describe your nutrient cycle: how much slurry and FYM is produced, how it is stored, and how it is applied to fields to provide nutrients while minimising losses to water and air. This plan is required under the Farming Rules for Water (England) and is a Red Tractor livestock requirement. The plan can be prepared and stored within the Environmental module.</p>`,
    },
    {
      id: 10030,
      title: "Grain Store Quality Management — Equipment Module",
      category: "Equipment",
      content: `<p>The Grain Storage Quality tab within the Equipment module provides records for on-farm grain stores, enabling you to track grain intake, moisture and protein readings, fumigation events, and store inspections. These records support Red Tractor Combinable Crops certification and grain trade assurance.</p>

<h3>Grain Intake Records</h3>
<p>For each load of grain entering the store, record: the crop type and variety, harvest date, field of origin, quantity in tonnes, moisture content at intake, and any pre-storage treatments applied (e.g. propionic acid, OPP). The field-of-origin linkage provides the traceability chain required by Red Tractor Combinable Crops — from field to store to merchant.</p>

<h3>Moisture & Quality Monitoring</h3>
<p>Record periodic moisture readings taken during the storage period. Grain safe for storage should be at or below 14.5% moisture for wheat and barley (lower for oilseed rape). Regular monitoring demonstrates that you are actively managing storage conditions to prevent spoilage and mycotoxin development.</p>

<h3>Fumigation Records</h3>
<p>If grain is fumigated, record the fumigant used (e.g. phosphine), the operator name and BETA certificate reference, the date, duration, and concentration achieved. Fumigation must be carried out by a certificate-holder under the Control of Pesticides Regulations.</p>

<h3>Store Inspections</h3>
<p>Log the date of each store inspection, who carried it out, and the outcome. Red Tractor Combinable Crops requires that stores are free from pests, in good structural repair, and that any residues from previous crops are removed before new grain is loaded.</p>`,
    },
    {
      id: 10031,
      title: "Soil Sample Register — Format and Reference Numbers",
      category: "Nutrient Management",
      content: `<p>The Soil Sample Register in BDE Farm Trac records all soil sampling events in a structured, auditable format that satisfies Red Tractor Cross-Compliance requirements. Each record is automatically assigned a unique reference number in the format <strong>SS-YYYY-NNNN</strong> (e.g. SS-2025-0012), which provides a traceable identifier for every sample taken.</p>

<h3>What Is Recorded per Sample</h3>
<ul>
<li><strong>Reference Number</strong> — Auto-generated (SS-YYYY-NNNN). Cannot be edited; used on all related documents and laboratory reports.</li>
<li><strong>Field</strong> — Selected from your registered Field Register. Cannot be a free-text entry — must link to a real field record to ensure traceability.</li>
<li><strong>Sample Date</strong> — Date the sample was taken from the field.</li>
<li><strong>Laboratory</strong> — Selected from your registered testing laboratory list. Labs must be UKAS-accredited or equivalent. See Help article <em>Testing Laboratories — Registering Labs and Linking Test Results</em>.</li>
<li><strong>Laboratory Reference</strong> — The reference number on the lab report. This allows you to match the certificate in your document store to this soil record.</li>
<li><strong>Results</strong> — pH, P, K, and Mg index values from the lab report. Organic matter % if reported.</li>
<li><strong>Depth and Sampling Method</strong> — e.g. 0–15 cm, W-pattern, 25 cores bulked.</li>
</ul>

<h3>Red Tractor Requirements</h3>
<p>Red Tractor requires soil testing at minimum every 5 years for all cropped land, and more frequently for fields receiving significant applications of organic manures. The soil test must be performed by an accredited laboratory and the results used to inform a nutrient management plan. The SS-reference number on each record in BDE Farm Trac provides the unique identifier inspectors need to cross-reference your field records against the laboratory certificate.</p>`,
    },
    {
      id: 10035,
      title: "Farm Insurance Register",
      category: "Compliance",
      content: `<p>The <strong>Insurance</strong> register in BDE Farm Trac lets you record all farm insurance policies in one place, attach scans of certificates, and receive automatic alerts when policies are approaching expiry — so you are never caught with a lapsed policy during a Red Tractor inspection.</p>

<h3>Why Insurance Records Matter for Red Tractor</h3>
<p>Red Tractor assessors check two specific policies during almost every inspection:</p>
<ul>
<li><strong>Employers Liability Insurance</strong> — a legal requirement under the Employers' Liability (Compulsory Insurance) Act 1969 for any farm that employs staff, including part-time, seasonal, casual, and paid family members. Minimum cover is £5 million (most policies are £10 million). The assessor will ask to see a current certificate.</li>
<li><strong>Public Liability Insurance</strong> — required by Red Tractor (minimum £5 million, some sectors require £10 million). This covers third parties injured on farm or third-party property damage. A current certificate showing the level of cover must be available.</li>
</ul>
<p>Both policy types are flagged as <strong>Required</strong> in the register. If either is missing or expired, a red alert banner appears at the top of the page.</p>

<h3>Adding a Policy</h3>
<p>Click <strong>Add Policy</strong> and complete the form. Key fields:</p>
<ul>
<li><strong>Policy Type</strong> — choose from the list; Required types are marked with a star (★)</li>
<li><strong>Cover Level</strong> — enter the cover amount in £ millions (e.g. enter 10 for a £10 million policy). This is shown in the table so assessors can confirm minimum cover at a glance.</li>
<li><strong>Policyholder Name</strong> — as printed on the certificate; this should match the farm business name</li>
<li><strong>Expiry Date</strong> — the register uses this to drive colour-coded expiry badges and advance warning alerts</li>
</ul>

<h3>Attaching a Certificate Scan</h3>
<p>After adding a policy, click <strong>Attach</strong> in the Certificate column. You can upload a PDF, JPG, or PNG — the scan is stored securely in your farm's document storage and a <strong>View</strong> link appears in the table. During an inspection you can click View to open the full certificate on-screen without searching through paper files.</p>

<h3>Expiry Alerts</h3>
<ul>
<li><strong>Green</strong> — more than 60 days remaining</li>
<li><strong>Amber</strong> — expiring within 60 days — take action to renew</li>
<li><strong>Red</strong> — expired — a banner alert also appears at the top of the page</li>
</ul>
<p>Review the register at the start of each year and whenever a policy is renewed. Most farm insurers issue renewal documents 30 days before expiry — upload the new certificate as soon as it arrives and update the expiry date.</p>`,
    },
    {
      id: 10032,
      title: "Purchase Orders — Raising and Managing POs",
      category: "Stock & Suppliers",
      content: `<p>The <strong>Purchase Orders</strong> tab in Suppliers &amp; Stock lets you raise formal purchase orders (POs) against your registered suppliers, track what has been ordered, and automatically reconcile quantities as goods arrive via Goods Received Notes.</p>

<h3>Raising a Purchase Order</h3>
<p>Navigate to <strong>Suppliers &amp; Stock</strong> and click the <strong>Purchase Orders</strong> tab. Click <strong>Raise Purchase Order</strong> and complete the form:</p>
<ul>
<li><strong>Supplier</strong> — select from your registered supplier directory</li>
<li><strong>Order Date</strong> — defaults to today</li>
<li><strong>Expected Delivery Date</strong> — used for planning and overdue tracking</li>
<li><strong>Order Lines</strong> — add one or more lines, each specifying the product (from your stock catalogue), quantity ordered, and unit price</li>
</ul>
<p>Once saved, the PO is assigned an auto-generated reference in the format <strong>PO-YYYY-0001</strong> (e.g. PO-2026-0001). Saved POs start in <strong>Draft</strong> status.</p>

<h3>PO Status Flow</h3>
<ul>
<li><strong>Draft</strong> — created but not yet sent to the supplier. You can still edit or delete a draft PO.</li>
<li><strong>Sent</strong> — use the <em>Mark as Sent</em> action once you have sent or emailed the order to the supplier. This locks the PO from accidental editing.</li>
<li><strong>Partially Received</strong> — set automatically when a GRN is linked to this PO and some (but not all) lines are fully received.</li>
<li><strong>Fully Received</strong> — set automatically when every line on the PO has been received in full across one or more GRNs.</li>
<li><strong>Cancelled</strong> — use the <em>Cancel</em> action if the order is no longer required.</li>
</ul>

<h3>PO Detail View</h3>
<p>Click <strong>View</strong> on any PO in the list to open its detail panel. This shows:</p>
<ul>
<li>All order lines with quantity ordered, unit price, and a <strong>progress bar</strong> showing how much has been received</li>
<li>All linked <strong>Goods Received Notes</strong> (GRNs) for this PO — with GRN reference, date, and quantities</li>
<li>Action buttons: <em>Mark as Sent</em>, <em>Log Goods Received (GRN)</em>, <em>Cancel</em>, <em>Delete Draft</em></li>
</ul>

<h3>3-Way Match</h3>
<p>BDE Farm Trac supports a full procurement audit trail through 3-way matching: a <strong>Purchase Order</strong> (what you ordered) is matched against a <strong>Goods Received Note</strong> (what actually arrived) and a <strong>Supplier Invoice</strong> (what was charged). When raising an invoice against a delivery in the <strong>Goods Received</strong> tab, the system links the invoice back to the originating GRN, completing the 3-way match for that delivery.</p>`,
    },
    {
      id: 10033,
      title: "Goods Received Notes (GRN) — Logging Deliveries and Linking to POs",
      category: "Stock & Suppliers",
      content: `<p>Every time goods arrive on your farm, you should record a <strong>Goods Received Note (GRN)</strong>. GRNs update your live stock levels, record the supplier and delivery date, and optionally link to an open Purchase Order to update the quantities received.</p>

<h3>Logging a Delivery</h3>
<p>Go to <strong>Suppliers &amp; Stock → Goods Received (GRN)</strong> and click <strong>Log Goods Received</strong>. Complete the form fields:</p>
<ul>
<li><strong>Supplier</strong> — who delivered the goods</li>
<li><strong>Product</strong> — select from your stock catalogue</li>
<li><strong>Quantity Received</strong> and <strong>Unit</strong></li>
<li><strong>Delivery Date</strong></li>
<li><strong>Link to Purchase Order</strong> — (optional) select an open PO from this supplier to match the delivery against. The system will automatically update the received quantities on the matched PO line and advance the PO status to Partially Received or Fully Received as appropriate.</li>
<li><strong>Batch Number</strong> — the batch or lot code printed on the product packaging (e.g. a pesticide batch code). Important for traceability if a batch recall is issued.</li>
<li><strong>Lot Number</strong> — the manufacturer's lot or production run reference. Use in conjunction with Batch Number where the product label carries both identifiers.</li>
<li><strong>Invoice Reference</strong> and <strong>Price Paid</strong> — for financial reconciliation</li>
</ul>
<p>On saving, the system generates a unique <strong>GRN number</strong> in the format <strong>GRN-YYYY-0001</strong> (e.g. GRN-2026-0001). The GRN number is displayed in the Goods Received list and is referenced on any linked supplier invoice.</p>

<h3>Reading the GRN Table</h3>
<p>The Goods Received list shows: GRN No. (in green monospace), delivery date, supplier, product, quantity, and lot number. Where a delivery is linked to a PO, the PO reference appears below the supplier name. Expanding a row or raising an invoice shows the full GRN detail.</p>

<h3>Raising a Supplier Invoice from a GRN</h3>
<p>Click the <strong>Invoice</strong> button on any GRN row to create a linked financial transaction. The invoice is pre-filled with the supplier, amount (price × quantity), and GRN reference. The invoice then appears in Financial Records and completes the <strong>3-way match</strong> (PO → GRN → Invoice) for that delivery.</p>`,
    },
    {
      id: 10034,
      title: "Batch & Lot Traceability in Spray Application Records",
      category: "Stock & Suppliers",
      content: `<p>BDE Farm Trac allows you to trace pesticide and input products from the specific <strong>Goods Received Note (GRN) delivery</strong> through to the <strong>spray application</strong> where they were used. This gives you a full chain of custody from supplier batch to treated field — a requirement if a product is ever subject to a batch recall or a Red Tractor traceability audit.</p>

<h3>How Traceability Works</h3>
<p>When a product is selected in the spray application form, the system checks whether that product is linked to a stock item in your catalogue. If it is, a green <strong>Batch / Lot Traceability</strong> section appears in the form. This section:</p>
<ul>
<li>Shows a dropdown of all <strong>GRN deliveries</strong> received for that product — each listed with its GRN number, batch number, lot number, and delivery date.</li>
<li>When you select a delivery, the <strong>Batch Number</strong> and <strong>Lot Number</strong> fields are automatically populated from that GRN. You can adjust these if needed.</li>
<li>You can also enter batch and lot numbers manually without linking to a GRN — useful when recording legacy applications or applications from stock not in the system.</li>
</ul>

<h3>Viewing Batch Data on Spray Records</h3>
<p>On the spray applications list, expanding a row shows the full application detail including <strong>Batch Number</strong> and <strong>Lot Number</strong> displayed in monospace format. These fields only appear if a value was recorded — they are not shown for records where batch data was not captured.</p>

<h3>Why This Matters for Compliance</h3>
<p>Red Tractor and UK law require pesticide records to be kept for at least three years. If a product is subject to a voluntary or mandatory recall by the manufacturer or HSE, you need to be able to identify quickly which fields were treated using that batch. With batch numbers linked through from GRNs to spray records, you can filter your spray history by product and identify all affected applications within seconds.</p>

<h3>Setting Up the Link</h3>
<p>To enable automatic batch/lot population from GRNs, ensure your spray products are linked to <strong>Stock Items</strong> in the Stock catalogue. Open <strong>Suppliers &amp; Stock → Products</strong>, find the relevant product, and confirm it has a stock item association. Once linked, the traceability picker will appear automatically in the spray form whenever that product is selected.</p>`,
    },
    {
      id: 10036,
      title: "Farm Planner — Week Ahead & Month Ahead View",
      category: "Dashboards",
      content: `<p>The Farm Planner is your daily command centre — a single page that pulls together every scheduled task, upcoming due date, and overdue item from across all your active modules, presented in chronological order so you can see at a glance what needs doing and when.</p>

<h3>7-Day and 30-Day Views</h3>
<p>Use the toggle in the top-right corner of the page to switch between the <strong>Week Ahead</strong> (7 days) and <strong>Month Ahead</strong> (30 days) views. Both views always show any <strong>overdue</strong> items from the past 60 days, clearly separated at the top in red, so nothing gets missed.</p>
<p>The 30-day view is particularly valuable for compliance events that need advance planning — certificate renewals, insurance renewals, vet health plan reviews, and equipment calibrations all require booking weeks ahead. Switching to the 30-day view gives you that planning horizon without overwhelming you with too much detail.</p>

<h3>What the Planner Tracks</h3>
<p>The planner draws from 21 data sources across every module. Items are colour-coded by module category:</p>
<ul>
<li><strong>Biosecurity</strong> (red) — pest control follow-up dates, cleaning &amp; disinfection due dates, biosecurity plan review dates</li>
<li><strong>Staff &amp; Training</strong> (indigo) — certificate expiry dates, training record expiry dates, right-to-work document expiry dates</li>
<li><strong>Inspections &amp; Audits</strong> (violet) — upcoming inspection dates, corrective action due dates</li>
<li><strong>Risk &amp; Waste</strong> (amber) — risk assessment review dates, COSHH assessment review dates</li>
<li><strong>Equipment &amp; Vehicles</strong> (orange) — maintenance next due dates, calibration next due dates</li>
<li><strong>Workshop</strong> (orange) — PAT test next due dates, fire extinguisher next service dates, workshop job card estimated completion dates</li>
<li><strong>Livestock</strong> (green) — medicine withdrawal period end dates, vet health plan review dates</li>
<li><strong>Compliance</strong> (blue) — insurance policy expiry dates (Employers Liability, Public Liability, and all other policies)</li>
<li><strong>Water &amp; Irrigation</strong> (blue) — water abstraction licence expiry dates</li>
<li><strong>Biofuel / RTFO</strong> (blue) — biofuel certification expiry dates</li>
<li><strong>Suppliers &amp; Stock</strong> (amber) — expected purchase order delivery dates</li>
</ul>
<p>Each card in the planner shows the item title, a brief description, the module it belongs to (as a colour-coded badge), and whether it is overdue or due today. Clicking any system-generated card takes you directly to the relevant record in that module.</p>

<h3>Adding Custom Reminders</h3>
<p>Not everything fits neatly into a structured module. For events like a merchant rep visit, a hedge-trimming contractor, a farm walk, a bank meeting, or an agricultural show, use the <strong>Add reminder</strong> button in the top-right corner of the page.</p>
<p>The reminder form collects:</p>
<ul>
<li><strong>Title</strong> — a short description of the event (required)</li>
<li><strong>Date</strong> — the date the event is happening (required)</li>
<li><strong>Note</strong> — any extra detail you want visible on the card (optional)</li>
<li><strong>Colour</strong> — choose from 8 colours to visually organise your reminders</li>
</ul>
<p>Custom reminders appear in the planner alongside system-generated items with a grey <strong>Custom</strong> badge. They are stored as persistent records — visible to all staff with access to the dashboard — and remain in the planner until you remove them. To remove a reminder, click the <strong>trash icon</strong> that appears on the right side of the card.</p>

<h3>Task Count and Overdue Alerts</h3>
<p>The total number of items in the current view is shown as a badge in the header. Overdue items are always shown at the top of the list with a red background, an alert icon, and a label showing how many days overdue the item is. Items due today are highlighted in amber.</p>

<h3>Tips for Getting the Most from the Planner</h3>
<ul>
<li>Check the planner first thing each morning as part of your farm routine.</li>
<li>Switch to the 30-day view at the start of each month to identify items needing advance booking — especially certificate renewals and equipment calibrations.</li>
<li>Use custom reminders for contractor visits and farm walks so all staff know what is happening that week.</li>
<li>Keep your module records up to date with accurate due dates — the planner is only as good as the data behind it.</li>
</ul>`,
    },
    {
      id: 10037,
      title: "Grants & Funding Register — Tracking FETF and Scheme Applications",
      category: "Grants & Funding",
      content: `<p>The Grants & Funding register is a central record of all your farming grant applications — from the Farming Equipment and Technology Fund (FETF) to Countryside Stewardship capital items, Sustainable Farming Incentive (SFI) capital grants, RDPE, and any other scheme. It is designed to ensure that purchase deadlines and claim deadlines never get missed, and that you always have a clear picture of approved grant values across your holding.</p>

<h3>When to Use the Register</h3>
<p>Add a record as soon as you submit an application — even before approval. Recording the application date and reference at submission means you have a documented trail if the RPA asks for confirmation of when you applied. Update the record when approval is received, when the equipment is purchased, and again when the claim is submitted.</p>

<h3>Key Fields Explained</h3>
<ul>
<li><strong>Scheme Name</strong> — the name of the scheme, e.g. "FETF 2026" or "Countryside Stewardship Capital Grant 2025/26". This is the label that appears on planner cards.</li>
<li><strong>Scheme Type</strong> — select from FETF, CS (Countryside Stewardship), SFI (Sustainable Farming Incentive), RDPE, or Other. This is used for filtering and reporting.</li>
<li><strong>Item Reference Code</strong> — for FETF applications, every fundable item has an alphanumeric reference code published by the RPA (e.g. T-SYS-1 for GPS auto-steering, LESS-2 for a dribble bar slurry spreader). Use the <strong>Browse FETF items</strong> button to pick from a searchable list based on previous FETF rounds — always verify the code and eligible cost against the current RPA prospectus before applying.</li>
<li><strong>Item Description</strong> — a plain-English description of what you are buying, e.g. "John Deere StarFire 6000 GPS receiver for 8370R tractor". Be specific — this is what you will quote when submitting your claim evidence.</li>
<li><strong>Application Reference</strong> — the reference number issued by the RPA or scheme administrator when you submit. Record this immediately to save searching for it later.</li>
<li><strong>Application Date / Approval Date</strong> — log both dates to establish a clear timeline. The approval date triggers the start of most purchase and claim windows.</li>
<li><strong>Purchase Deadline</strong> — the date by which the equipment must be purchased and invoiced. Missing this deadline normally forfeits the grant entirely. This date automatically appears in the Farm Planner (amber if within 30 days, red if overdue).</li>
<li><strong>Claim Deadline</strong> — the date by which you must submit your claim to the scheme administrator, including all evidence. This also appears in the Farm Planner.</li>
<li><strong>Grant Amount</strong> — the approved grant value in pounds (not pence). For FETF this is a fixed amount per item; for CS capital it may be a percentage of a standard cost.</li>
<li><strong>Actual Cost</strong> — the real purchase price of the item. Record this once you have the invoice. The difference between actual cost and grant amount is the net cost to the farm.</li>
</ul>

<h3>Status Workflow</h3>
<p>Each grant moves through a defined status journey. Use the status filter tabs to see records by stage:</p>
<ul>
<li><strong>Draft</strong> — preparing the application, not yet submitted</li>
<li><strong>Applied</strong> — submitted to the scheme, awaiting decision</li>
<li><strong>Approved</strong> — offer letter received; you can now proceed to purchase within the purchase deadline</li>
<li><strong>Purchased</strong> — equipment bought and invoiced; ready to submit claim evidence</li>
<li><strong>Claimed</strong> — claim submitted to scheme; awaiting payment</li>
<li><strong>Rejected</strong> — application or claim rejected; purchase and claim deadline alerts are suppressed</li>
<li><strong>Withdrawn</strong> — application withdrawn; deadline alerts suppressed</li>
</ul>
<p>Update the status as each stage completes. The planner and deadline badges will adjust automatically — for example, purchase deadline cards stop appearing once the status moves to Purchased or beyond.</p>

<h3>Evidence Attachment</h3>
<p>Each grant record has an evidence attachment slot. Use it to upload the item you would need to produce on request: for an in-progress FETF application this might be the RPA offer letter; once claimed, upload the purchase invoice and photo of the installed equipment. Accepted formats are PDF, Word, JPEG, and PNG.</p>
<p>For FETF claims, typical evidence requirements are: a copy of the VAT invoice dated before the purchase deadline, a photograph showing the equipment installed and operational on your farm, and proof that the equipment matches the approved item reference. Keep copies of all correspondence with the RPA as well.</p>

<h3>Farm Planner Integration</h3>
<p>Purchase deadlines and claim deadlines for active grants appear automatically in the Week Ahead and Month Ahead planner views as violet-badged items. Switch to the 30-day Month Ahead view at the start of each month to see whether any purchase or claim deadlines are approaching over the next four weeks — FETF deadlines in particular can be difficult to extend and penalties for missing them are severe.</p>

<h3>FETF 2026 — What to Expect</h3>
<p>The FETF has run in annual rounds since 2021. Each round publishes a fixed list of approved items with reference codes and standard costs; farmers apply online via the Rural Payments Agency, and grants are awarded competitively in some rounds or on a first-come, first-served basis in others.</p>
<p>The 2026 item list and grant rates are confirmed by the RPA at the time each round opens — check the current prospectus at <a href="https://www.gov.uk/guidance/farming-equipment-and-technology-fund" target="_blank" rel="noopener noreferrer">gov.uk/guidance/farming-equipment-and-technology-fund</a> before applying. The item codes and descriptions in the BDE Farm Trac picker are based on previous rounds as a reference guide.</p>

<h3>Other Schemes</h3>
<p>The register is not limited to FETF. Use it to track:</p>
<ul>
<li><strong>Countryside Stewardship Capital Grants</strong> — capital items funded as part of a CS agreement, each with a standard cost and claim deadline</li>
<li><strong>SFI Capital Grants</strong> — capital actions available under the Sustainable Farming Incentive, claimed at the end of an agreement year</li>
<li><strong>RDPE (Rural Development Programme for England)</strong> — older scheme grants still in their claim window</li>
<li><strong>Any other scheme</strong> — select "Other" as the scheme type and record the scheme name, reference, and deadlines in the free-text fields</li>
</ul>`,
    },
    {
      id: 10038,
      title: "Inspections Module — Tabs, Non-Conformances and Farm Assurance Certificates",
      category: "Inspections",
      content: `<p>The Inspections module is the central hub for managing your Red Tractor assessment cycle. It has four tabs: <strong>Inspections</strong>, <strong>Non-Conformances</strong>, <strong>Corrective Actions</strong>, and <strong>Farm Assurance Certificates</strong>. Together they give you a complete audit trail from the inspection visit through to closure of every finding.</p>

<h3>Inspections Tab</h3>
<p>Log every formal Red Tractor assessment, cross-compliance inspection, or third-party audit here. For each inspection record:</p>
<ul>
<li><strong>Inspection Type</strong> — Red Tractor (announced/unannounced), cross-compliance, third-party audit, internal farm review, or other</li>
<li><strong>Inspector Name &amp; Organisation</strong> — the certifying body or agency (e.g. Farm Certification Ltd, ADAS, NSF)</li>
<li><strong>Date &amp; Outcome</strong> — pass, pass with minor non-conformances, major non-conformance, or fail</li>
<li><strong>Certificate Issued</strong> — tick this when the inspection leads to a new or renewed assurance certificate</li>
<li><strong>Notes</strong> — any overall inspector comments or areas highlighted for improvement</li>
</ul>
<p>Each inspection record is assigned a unique reference (INS-YYYY-NNNN) for cross-referencing with non-conformances and corrective actions.</p>

<h3>Non-Conformances Tab</h3>
<p>Every finding raised during an inspection — whether a minor advisory or a major non-conformance — should be logged here. Record:</p>
<ul>
<li><strong>Severity</strong> — Minor, Major, or Critical. Red Tractor defines Minor as items that do not immediately threaten food safety or animal welfare, and Major as items that do. A Critical (critical) finding may lead to immediate suspension.</li>
<li><strong>Standard Clause</strong> — the specific Red Tractor standard reference (e.g. CC 1.2, B&amp;L 4.5) as written on the inspection report</li>
<li><strong>Finding Description</strong> — copy the exact wording from the inspector's report so there is no ambiguity about what needs addressing</li>
<li><strong>Due Date</strong> — the deadline set by the certification body for resolution (typically 28 days for Minor, 14 days for Major)</li>
</ul>

<h3>Corrective Actions Tab</h3>
<p>Each non-conformance must have at least one corrective action linked to it. Corrective actions are the specific steps taken to resolve the finding:</p>
<ul>
<li>Describe what will be done (or has been done) to address the non-conformance</li>
<li>Set a target completion date and the person responsible</li>
<li>Mark the action as complete and record the completion date once done</li>
<li>Attach evidence (photo, updated record, new procedure document) using the file attachment slot</li>
</ul>
<p>When all corrective actions for a non-conformance are marked complete, the non-conformance status automatically updates to Resolved. This gives the certification body auditor a clear, documented evidence trail when they follow up.</p>

<h3>Farm Assurance Certificates Tab</h3>
<p>This tab holds a register of all your Red Tractor and other farm assurance scheme certificates. For each certificate record:</p>
<ul>
<li><strong>Certification Body</strong> — the organisation that issued the certificate (e.g. Farm Certification Ltd, ADAS Certification, Benchmark, Acoura)</li>
<li><strong>Certificate Number</strong> — the unique certificate reference; this is the number inspectors and merchants will ask for</li>
<li><strong>Scheme / Standard</strong> — which Red Tractor standard the certificate covers (Combinable Crops, Beef &amp; Lamb, Dairy, Fresh Produce, Pigs, Poultry, etc.)</li>
<li><strong>Farm Sectors Covered</strong> — tick the relevant sectors (arable, dairy, beef, sheep, etc.) — important where a farm holds a multi-sector certificate</li>
<li><strong>Issue Date &amp; Expiry Date</strong> — the certificate period. Red Tractor certificates typically run 12 months; colour-coded expiry badges (green / amber / red) appear automatically as the expiry approaches</li>
<li><strong>Assessor Name</strong> — the individual assessor who signed off the certificate, for your records</li>
</ul>
<p>Merchants, co-ops, and grain stores may ask for your certificate number and expiry date before accepting assured produce. Keeping this register up to date means you can confirm assurance status instantly without hunting for paper certificates.</p>`,
    },
    {
      id: 10039,
      title: "Risk Assessments — Using Hazard Templates and Recording COSHH Assessments",
      category: "Risk & Waste",
      content: `<p>The Risk Assessments module in BDE Farm Trac provides a structured register for all farm risk assessments and COSHH records. It has two tabs: <strong>Risk Assessments</strong> and <strong>COSHH Records</strong>. Note that COSHH records sit here in the Risk & Waste module, not in Biosecurity — this reflects the Health & Safety Executive's guidance that COSHH is a risk assessment process rather than a biosecurity tool.</p>

<h3>Risk Assessments Tab — Hazard Templates</h3>
<p>When you click <strong>Add Risk Assessment</strong>, nine pre-built hazard templates appear to accelerate data entry. Select the template that best matches the activity you are assessing — the hazard description and common control measures are pre-filled, saving time while ensuring consistency:</p>
<ul>
<li><strong>Manual Handling</strong> — lifting, carrying, and repetitive operations; covers musculoskeletal risks and TILE (Task, Individual, Load, Environment) framework</li>
<li><strong>Chemical / Pesticide Exposure</strong> — covers pesticide handling, mixing, application, and storage with reference to COSHH and product label requirements</li>
<li><strong>Working at Height</strong> — roof work, grain store inspection, silo access, platform use; references the Work at Height Regulations 2005</li>
<li><strong>Machinery Operation</strong> — guarding, PTO shafts, in-running nip points, entanglement risks</li>
<li><strong>Electricity</strong> — overhead lines, underground cables, portable equipment, grain drying electrical systems</li>
<li><strong>Slips, Trips &amp; Falls</strong> — yards, livestock buildings, silage clamps</li>
<li><strong>Confined Spaces</strong> — slurry pits, grain bins, underground tanks; references Confined Spaces Regulations 1997</li>
<li><strong>Lone Working</strong> — remote field operations, evening checks, early-morning livestock rounds</li>
<li><strong>Fire Risk</strong> — grain stores, hay and straw storage, fuel storage, electrical installations</li>
</ul>
<p>After selecting a template, review and customise the hazard description, control measures, and risk rating (Likelihood × Severity) to reflect your farm's specific circumstances. Generic templates must be site-specific to satisfy a Red Tractor inspector — a template used unchanged will not demonstrate that the farm manager has actually thought through the risks.</p>

<h3>Risk Rating</h3>
<p>Each assessment records:</p>
<ul>
<li><strong>Likelihood</strong> (1–5) × <strong>Severity</strong> (1–5) = <strong>Risk Score</strong> (1–25)</li>
<li>Scores 1–6: Low; 7–12: Medium; 13–17: High; 18–25: Critical</li>
<li>High and Critical assessments are highlighted in the table and should be prioritised for review</li>
</ul>

<h3>COSHH Records Tab</h3>
<p>COSHH assessments are required for every hazardous substance used on the farm — pesticides, cleaning chemicals, fuels, lubricants, veterinary medicines, and any other substance that may harm health through inhalation, skin contact, or ingestion.</p>
<p>For each COSHH record enter:</p>
<ul>
<li><strong>Substance Name</strong> — as printed on the product label or Safety Data Sheet (SDS)</li>
<li><strong>Location / Activity</strong> — where and how the substance is used (e.g. "Grain store — applying propionic acid preservative")</li>
<li><strong>Hazard Description</strong> — the specific health hazard (e.g. skin irritant, respiratory sensitiser, carcinogen)</li>
<li><strong>Control Measures</strong> — PPE required, ventilation requirements, storage conditions, emergency procedures</li>
<li><strong>Assessment Date &amp; Review Date</strong> — assessments should be reviewed annually and whenever a new substance is introduced or methods change</li>
<li><strong>Assessor</strong> — the name of the person who completed the assessment</li>
</ul>
<p>Keep a printed or electronic copy of the relevant Safety Data Sheet alongside each COSHH record. SDS documents are available from the product manufacturer's website — always use the most current version. Red Tractor inspectors may ask to see COSHH assessments for products found in the chemical store and will check that staff are aware of the control measures.</p>`,
    },
    {
      id: 10040,
      title: "Waste Disposal — EWC Codes and Duty of Care",
      category: "Risk & Waste",
      content: `<p>The Waste Disposal register in BDE Farm Trac records all non-agricultural waste produced on the farm — including waste chemicals, used packaging, contaminated soil, scrap metal, waste oils, veterinary waste, and general farm waste. Agricultural waste (farmyard manure, slurry) is managed separately in the Environmental module.</p>

<h3>EWC Codes — European Waste Catalogue</h3>
<p>Every category of waste is assigned a six-digit EWC (European Waste Catalogue) code that identifies the waste type. The EWC was adopted into UK law and remains in use. Key EWC codes for farm waste include:</p>
<ul>
<li><strong>02 01 08* — Agrochemical waste containing hazardous substances</strong> — empty pesticide containers with residues, out-of-date pesticides, contaminated chemical waste. The asterisk (*) denotes a <em>hazardous waste</em> — more stringent controls apply.</li>
<li><strong>02 01 09 — Agrochemical waste (non-hazardous)</strong> — triple-rinsed empty containers accepted at authorised collection points (Agrecovery, MCRS)</li>
<li><strong>15 01 02 — Plastic packaging</strong> — bale wrap, fertiliser bags, feed sacks (non-contaminated)</li>
<li><strong>16 01 03 — End-of-life tyres</strong> — must go to an authorised tyre recycler</li>
<li><strong>13 02 05* — Waste mineral oils (non-chlorinated, from machinery servicing)</strong> — hazardous; must be collected by a licensed waste carrier</li>
<li><strong>18 02 02* — Veterinary waste — sharps and medicines</strong> — needles, syringes, unused medicines; hazardous; requires collection by a specialist medical waste contractor</li>
<li><strong>17 04 05 — Iron and steel (scrap metal)</strong> — non-hazardous; can be collected by a registered scrap metal dealer</li>
<li><strong>20 03 01 — General mixed municipal waste</strong> — general farm office or yard waste collected by a registered waste carrier</li>
</ul>
<p>The EWC code picker in the Add Waste Record form shows these common codes with descriptions. Select the correct code for each waste type — this is the code that appears on your waste transfer notes and Duty of Care documentation.</p>

<h3>Duty of Care</h3>
<p>Under the Environmental Protection Act 1990, all businesses (including farms) have a legal duty of care in relation to waste they produce. This means you must:</p>
<ol>
<li><strong>Ensure waste is kept safely</strong> — stored in labelled, secure containers to prevent escape, leakage, or theft</li>
<li><strong>Only give waste to an authorised person</strong> — the waste carrier must hold a valid Waste Carrier Registration (Upper Tier for most commercial collections) from the Environment Agency. Self-disposal (fly-tipping) is a criminal offence carrying unlimited fines.</li>
<li><strong>Complete a Waste Transfer Note (WTN)</strong> — for every transfer of waste between your farm and a waste carrier or disposal site. The WTN must describe the waste, its quantity, its EWC code, the carrier's registration details, and both parties' contact information.</li>
<li><strong>Keep records for two years</strong> — the Environment Agency or Red Tractor inspector may ask to see WTNs during an inspection. Records must cover all waste types, including packaging and chemical waste.</li>
</ol>
<p><strong>Hazardous waste</strong> (marked with * in the EWC picker) requires a <strong>Hazardous Waste Consignment Note</strong> instead of a standard WTN. Consignment notes have additional fields and must be retained for three years. Certain hazardous waste movements also require pre-notification to the Environment Agency (for quantities above the threshold of 500 kg from the same premises in a 12-month period).</p>

<h3>Carrier Registration Types in BDE Farm Trac</h3>
<p>When recording a Duty of Care waste disposal, you must record whether the carrier holds a standard <strong>Registered Carrier</strong> registration or whether the collection is covered by a carrier <strong>Exemption</strong>. Exemptions apply in limited circumstances (e.g. a farmer carrying their own waste, or a charity collection) — if in doubt, require proof of carrier registration before handing over waste.</p>

<h3>Red Tractor Context</h3>
<p>Red Tractor standards require evidence that chemical containers and other hazardous waste are disposed of through approved channels — and that pesticide containers are either triple-rinsed and returned to an MCRS / Agrecovery collection point, or documented as collected by a licensed carrier. Keep Waste Transfer Notes or Agrecovery collection receipts as evidence. The waste disposal register in BDE Farm Trac provides the audit trail inspectors need.</p>`,
    },
    {
      id: 10041,
      title: "Documents Module — Red Tractor Required Documents Checklist",
      category: "Documents",
      content: `<p>The Documents module in BDE Farm Trac serves two purposes: a full document register where you can store and categorise any farm document, and a <strong>Red Tractor Required Documents checklist</strong> that tells you at a glance which of the most important documents are present and which are missing from your register.</p>

<h3>The Red Tractor Required Documents Panel</h3>
<p>At the top-right of the Documents page, the Required Documents panel lists 11 document types that Red Tractor inspectors almost always ask to see. Each item shows one of three states:</p>
<ul>
<li><strong>Present</strong> (green tick) — at least one document of this type exists in your register. The document title appears as a link so you can open it immediately if asked by an inspector.</li>
<li><strong>Missing</strong> (red cross) — no document of this type has been recorded. You should upload or register this document before your next inspection.</li>
</ul>
<p>The 11 required document types checked are:</p>
<ol>
<li>Red Tractor Assurance Certificate</li>
<li>Red Tractor Scheme Membership</li>
<li>Employers Liability Insurance Certificate</li>
<li>Public Liability Insurance Certificate</li>
<li>NSTS Sprayer Test Certificate</li>
<li>Nutrient Management Plan</li>
<li>Agri-Environment Scheme Agreement</li>
<li>COSHH Assessment</li>
<li>Biosecurity Plan</li>
<li>Veterinary Health Plan</li>
<li>Risk Assessment (general farm)</li>
</ol>
<p>The checklist updates live — as soon as you add a document of a required type to the register, the red cross turns green. Use this panel in the weeks before an inspection to confirm all key paperwork is in place.</p>

<h3>Document Types and Categories</h3>
<p>When registering a document, select its type from a grouped picker covering 30+ types across eight categories:</p>
<ul>
<li><strong>Assurance &amp; Compliance</strong> — Red Tractor certificate, scheme membership, cross-compliance documents, NVZ designation</li>
<li><strong>Insurance</strong> — employers liability, public liability, vehicle, livestock, buildings, machinery</li>
<li><strong>Environmental</strong> — NMP, agri-environment agreements, abstraction licence, SFI/CS agreement, SSSI consent</li>
<li><strong>Health &amp; Safety</strong> — COSHH assessment, risk assessment, fire risk assessment, DSEAR assessment, emergency procedures</li>
<li><strong>Biosecurity &amp; Veterinary</strong> — biosecurity plan, vet health plan, TB test certificate, FMD plan, livestock movement licence</li>
<li><strong>Equipment &amp; Machinery</strong> — NSTS certificate, equipment service record, LOLER/PUWER certificate, calibration record, warranty</li>
<li><strong>Staff &amp; Training</strong> — PA certificate, employment contract, induction record, DBS check, right to work check</li>
<li><strong>Land &amp; Legal</strong> — tenancy agreement, title deeds, planning permission, lease, boundary map</li>
</ul>

<h3>Using the Category Filter</h3>
<p>The table view has a category filter at the top. Select a category to show only documents of that type — useful when an inspector asks specifically for health and safety records or biosecurity documents. Combine the category filter with the search bar to find a specific document title quickly.</p>

<h3>Reference Numbers</h3>
<p>Each document in the register can have a <strong>Reference Number</strong> — for example, a certificate number, policy number, or agreement reference. Recording the reference number means you can confirm document details (e.g. "NSTS certificate JS-2025-047") without needing to open the file. This is particularly useful for insurance policies and sprayer test certificates where the reference number is needed for third-party verification.</p>`,
    },
    {
      id: 10042,
      title: "Crop Contracts — Recording Grain Marketing Agreements",
      category: "Financial",
      content: `<p>The <strong>Crop Contracts</strong> tab in the Financial module provides a register of all your grain, pulse, and oilseed marketing contracts. It is separate from the general transaction ledger and is designed to track committed tonnage, agreed prices, delivery windows, and contract status — giving you a live picture of your marketing position for each commodity.</p>

<h3>When to Add a Crop Contract</h3>
<p>Add a record as soon as a marketing agreement is made — whether that is a fixed-price forward contract, a pool entry, or a spot sale at harvest. Recording contracts promptly ensures you have an accurate picture of your committed position at all times, and provides documentary evidence of the agreed price if there is a later dispute with the merchant.</p>

<h3>Key Fields</h3>
<ul>
<li><strong>Commodity</strong> — the crop type (Winter Wheat, Malting Barley, Oilseed Rape, etc.). This is the primary sort field in the table and in the Grain Position analysis in the Haulage module.</li>
<li><strong>Variety</strong> — particularly important for malting barley and milling wheat where variety specification is part of the contract (e.g. KWS Irina for malting, Skyfall for milling). Leave blank if variety is not contracted.</li>
<li><strong>Buyer / Merchant</strong> — the name of the merchant, co-op, or direct buyer (e.g. Openfield, ADM, Saxon Agriculture, Frontier). Used to identify which contracts belong to which trading relationship.</li>
<li><strong>Contract Date</strong> — the date the contract was agreed. Most forward contracts have a specific trade date that determines the pricing day for basis and futures pricing.</li>
<li><strong>Quantity (t)</strong> — the contracted tonnage. The system uses this to calculate the total contract value and to support position tracking.</li>
<li><strong>Price / tonne (£)</strong> — the agreed price per tonne in pounds sterling. The system automatically calculates and stores the total contract value (Quantity × Price).</li>
<li><strong>Delivery Window Start / End</strong> — the period during which grain must be delivered. Missed delivery windows can incur deferment charges or result in the contract being terminated at the farmer's expense.</li>
<li><strong>Delivery Location / Store</strong> — where the grain is to be delivered (e.g. Saxham Silos, Bury St Edmunds; Tilbury Docks). Used for logistics planning.</li>
<li><strong>Quality Specification</strong> — moisture, protein, specific weight, admixture, and other tolerances as specified in the contract. Recording this prevents disputes about whether delivered grain meets contract specification.</li>
<li><strong>Contract Reference</strong> — the merchant's contract reference number, used for invoicing and query resolution.</li>
</ul>

<h3>Contract Status</h3>
<p>Track each contract through its lifecycle using the status field:</p>
<ul>
<li><strong>Pending</strong> — agreed verbally or in principle, paperwork not yet received</li>
<li><strong>Active</strong> — contract confirmed, delivery not yet started</li>
<li><strong>Partially Delivered</strong> — some tonnage delivered but not yet complete</li>
<li><strong>Fulfilled</strong> — all tonnage delivered and invoiced</li>
<li><strong>Cancelled</strong> — contract cancelled; excluded from total value calculations</li>
<li><strong>Disputed</strong> — subject to a quality or quantity dispute with the merchant</li>
</ul>

<h3>Financial Summary</h3>
<p>The Crop Contracts tab header shows the total number of active contracts and the aggregate committed value (excluding cancelled contracts). This provides a quick overview of your forward-sold position without opening individual records.</p>

<h3>Red Tractor and Grain Trade Context</h3>
<p>Red Tractor Combinable Crops certification is a condition of sale for most UK milling, malting, and feed grain contracts. Merchants typically require you to provide your current Red Tractor certificate number before they will accept assured tonnage. Keeping your Farm Assurance Certificate up to date in the Inspections module and your contracts recorded here provides a joined-up audit trail from field to merchant.</p>`,
    },
    {
      id: 10043,
      title: "Haulage Module — Movement Records, Grain Position and Haulier Directory",
      category: "Haulage",
      content: `<p>The Haulage module provides a complete record of all grain and agricultural commodity movements on and off your holding. It has three tabs: <strong>Movement Records</strong>, <strong>Grain Position</strong>, and <strong>Haulier Directory</strong>. Together they provide the traceability documentation required by Red Tractor Combinable Crops and the commercial records needed to manage your grain marketing position.</p>

<h3>Movement Records Tab</h3>
<p>Every load that leaves the farm — and significant loads that arrive — should be recorded here. For each movement record:</p>
<ul>
<li><strong>Movement Date</strong> — when the load departed or arrived</li>
<li><strong>Load Type</strong> — Grain, Straw, Fertiliser, Livestock Feed, Other. Selecting <strong>Grain</strong> reveals the full grain quality field set (see below).</li>
<li><strong>Commodity &amp; Variety</strong> — e.g. "Winter Wheat / Skyfall", "Malting Barley / KWS Irina". The Commodity field feeds the Grain Position aggregation.</li>
<li><strong>Quantity (t)</strong> — the load tonnage as weighed. Always use the weighbridge ticket tonnage if available — do not estimate.</li>
<li><strong>Destination</strong> — the receiving merchant, store, or farm. Match this to the delivery location on your crop contract.</li>
<li><strong>Contract Reference</strong> — the merchant's contract number this delivery is being made against. Links the movement to a specific crop contract.</li>
<li><strong>Haulier &amp; Driver</strong> — select from your registered Haulier Directory (see below) or enter a free-text name for a one-off haulier. Recording the haulier details ensures you have a complete chain of custody for traceability.</li>
<li><strong>Vehicle Registration</strong> — the lorry or trailer registration. Required for some grain trade documentation.</li>
<li><strong>Delivery Status</strong> — Pending, In Transit, Delivered, Rejected. Update to Delivered once you receive confirmation from the merchant.</li>
</ul>

<h3>Grain Quality Fields</h3>
<p>When Load Type is set to Grain, additional quality fields appear:</p>
<ul>
<li><strong>Grade</strong> — e.g. Feed, Milling, Malting, Seed — the grade contracted for this load</li>
<li><strong>Moisture (%)</strong> — moisture content at loading, from your grain store monitor or drier. Contractual basis moisture is typically 14% for wheat and 15% for barley — loads above basis moisture are subject to drying charges.</li>
<li><strong>Specific Weight (kg/hl)</strong> — a key quality parameter for milling wheat (minimum 76 kg/hl) and malting barley (minimum 63 kg/hl). Record the value from your grain probe or store monitor.</li>
<li><strong>Protein (%)</strong> — for milling wheat, protein content (minimum 12.5% typical) is a contractual requirement. Record from your farm or merchant test.</li>
<li><strong>Admixture (%)</strong> — the percentage of non-grain material (broken grains, weed seeds, stones). Most contracts specify maximum admixture tolerances of 2–3%.</li>
<li><strong>Weighbridge Ticket No.</strong> — the ticket number from the farm or merchant weighbridge. Attach the actual ticket scan using the document attachment if available — this is the primary evidence of tonnage delivered.</li>
<li><strong>Storage Reference</strong> — which grain store or store cell the load came from. Supports traceability back to harvest records.</li>
</ul>

<h3>Grain Position Tab</h3>
<p>The Grain Position tab aggregates all outgoing grain movement records to give you a live summary of what has left the farm, broken down by commodity. For each commodity, it shows:</p>
<ul>
<li>Total tonnage moved (sum of all outgoing movement records for that commodity)</li>
<li>Number of deliveries (load count)</li>
<li>Average moisture content across all movements</li>
<li>A proportional bar showing each commodity's share of total tonnage moved</li>
</ul>
<p>Use this alongside your Crop Contracts register to compare contracted tonnage against delivered tonnage — identifying where you are ahead of or behind your delivery schedule for each contract. Cross-reference with harvest yield records to understand how much grain remains in store.</p>

<h3>Haulier Directory Tab</h3>
<p>Register all hauliers you regularly use for grain haulage. For each haulier record:</p>
<ul>
<li><strong>Company Name &amp; Contact</strong> — name, telephone, email, and primary driver name</li>
<li><strong>Vehicle Registration(s)</strong> — the registration numbers of lorries or trailers regularly used. These auto-fill into movement records when this haulier is selected.</li>
<li><strong>Operator Licence Number</strong> — hauliers moving goods commercially in the UK require an Operator's Licence (O licence) issued by the Traffic Commissioner. Record this number — it is your evidence that you are using a legitimately licensed carrier.</li>
<li><strong>Notes</strong> — any trading preferences, payment terms, or specialist capabilities (e.g. tipper, walking floor, grain blower)</li>
</ul>
<p>Using the directory rather than free-text haulier names ensures consistent spelling across all movement records, making it straightforward to pull all movements for a specific haulier if a dispute arises.</p>

<h3>Red Tractor Traceability</h3>
<p>Red Tractor Combinable Crops requires that grain can be traced from field through store to the point of dispatch. Movement records in BDE Farm Trac — linked to harvest records via the Storage Reference field and to crop contracts via the Contract Reference field — provide this traceability chain. In the event of a product withdrawal or quality query, you can identify which loads were dispatched from a specific store cell and which merchant received them, without relying on paper delivery notes.</p>`,
    },
    {
      id: 10019,
      title: "Mobile App — Offline Data and How Reference Pickers Work",
      category: "Mobile App",
      content: `<img src="/api/help-images/help-centre.png" alt="Mobile App Offline Data" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />

<p>The BDE Farm Trac mobile app is designed to work reliably on farm — where mobile signal is patchy and internet connectivity can drop at any moment. This article explains how reference data (field lists, herd lists, laboratory lists) is handled offline, and what the indicators you see in the app mean.</p>

<h3>How the App Stores Reference Lists</h3>
<p>Every time the app connects to the internet, it automatically refreshes and saves a copy of your reference lists — your registered fields, your herd / flock names, and your testing laboratories — to the device's local storage. This happens silently in the background with no action required from you. The stored copy remains on the device until the next refresh, so it is available even when there is no signal.</p>

<h3>What Happens When You're Offline</h3>
<p>When you open a form that requires you to select a field, herd, or laboratory and the device is offline, the app will load the list from its local cache instead of fetching from the server. You will see a small indicator message below the field — for example, <em>"Offline — showing cached fields list"</em> — confirming that the data is being served from the saved copy. You can continue selecting and saving records exactly as normal; they will be queued and synced to the server the next time connectivity is restored.</p>

<h3>Why There Is No Longer a "Type Manually" Option</h3>
<p>Earlier versions of the app allowed you to type a field name, herd name, or laboratory name as free text if the picker list was empty. This was removed because typed text cannot be linked to the actual database record — a small typo (e.g. "Main Dairy Herd" vs "Main Dairy herd") would store an unlinked value that would never resolve in reports, compliance registers, or audit exports. The cached picker approach means you always select from real registered records, maintaining full data integrity even when offline.</p>

<h3>If the Cached List Is Empty</h3>
<p>If no cache exists (for example on first use before the app has connected, or after clearing app data) and the device is offline, the picker will show an empty list with a message explaining the situation. In this case: connect to Wi-Fi or a mobile data signal, open the app, and wait a few seconds for the lists to load and be saved. Once cached, they will be available for future offline use.</p>

<h3>Sync Queue</h3>
<p>Records saved offline are held in a sync queue and uploaded automatically once connectivity is restored. You can check the sync queue status from the home screen. Partial or failed syncs are shown with a warning badge — tap to see which records are pending. Do not uninstall or log out of the app while records are pending sync as this will clear the queue.</p>`,
    },
  ];

  const { search, category } = _req.query;
  let filtered = articles;
  if (search) {
    const s = (search as string).toLowerCase();
    filtered = filtered.filter((a) => a.title.toLowerCase().includes(s) || a.content.toLowerCase().includes(s));
  }
  if (category) {
    filtered = filtered.filter((a) => a.category === category);
  }

  res.json({ records: filtered });
});

// ─── Tenant Users ──────────────────────────────────
router.get("/tenants/current/users", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const { userTenantsTable, usersTable } = await import("@workspace/db");
  const records = await db
    .select({
      userId: userTenantsTable.userId,
      roleId: userTenantsTable.roleId,
      isActive: userTenantsTable.isActive,
      email: usersTable.email,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
    })
    .from(userTenantsTable)
    .innerJoin(usersTable, eq(userTenantsTable.userId, usersTable.id))
    .where(eq(userTenantsTable.tenantId, req.tenantId!));
  res.json({ users: records });
});

// ─── Red Tractor Compliance Export ──────────────────
// Red Tractor digital submission: No public API exists for automated submission.
// This endpoint generates compliance reports in JSON/CSV for manual upload to the Red Tractor portal.
router.get("/farms/:farmId/compliance-export", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;

  const [farm] = await db.select().from(farmsTable).where(eq(farmsTable.id, farmId)).limit(1);

  const [inspections, nonconformances, correctiveActionsRaw, riskAssessments, coshhRecords, wasteRecords, trainingRecords, certificates, visitors, pestControl, cleaningRecords] = await Promise.all([
    db.select().from(inspectionRecordsTable).where(eq(inspectionRecordsTable.farmId, farmId)).orderBy(desc(inspectionRecordsTable.inspectionDate)),
    db.select().from(nonconformanceRecordsTable).where(eq(nonconformanceRecordsTable.farmId, farmId)).orderBy(desc(nonconformanceRecordsTable.identifiedDate)),
    db.select({ correctiveAction: correctiveActionsTable }).from(correctiveActionsTable).innerJoin(nonconformanceRecordsTable, eq(correctiveActionsTable.nonconformanceId, nonconformanceRecordsTable.id)).where(eq(nonconformanceRecordsTable.farmId, farmId)).orderBy(desc(correctiveActionsTable.createdAt)),
    db.select().from(riskAssessmentsTable).where(eq(riskAssessmentsTable.farmId, farmId)).orderBy(desc(riskAssessmentsTable.assessmentDate)),
    db.select().from(coshhRecordsTable).where(eq(coshhRecordsTable.farmId, farmId)).orderBy(desc(coshhRecordsTable.createdAt)),
    db.select().from(wasteDisposalRecordsTable).where(eq(wasteDisposalRecordsTable.farmId, farmId)).orderBy(desc(wasteDisposalRecordsTable.disposalDate)),
    db.select().from(staffTrainingRecordsTable).where(eq(staffTrainingRecordsTable.farmId, farmId)).orderBy(desc(staffTrainingRecordsTable.trainingDate)),
    db.select().from(staffCertificatesTable).where(eq(staffCertificatesTable.farmId, farmId)),
    db.select().from(visitorContractorLogTable).where(eq(visitorContractorLogTable.farmId, farmId)).orderBy(desc(visitorContractorLogTable.arrivalTime)),
    db.select().from(pestControlRecordsTable).where(eq(pestControlRecordsTable.farmId, farmId)).orderBy(desc(pestControlRecordsTable.treatmentDate)),
    db.select().from(cleaningDisinfectionRecordsTable).where(eq(cleaningDisinfectionRecordsTable.farmId, farmId)).orderBy(desc(cleaningDisinfectionRecordsTable.cleanedDate)),
  ]);

  const correctiveActions = correctiveActionsRaw.map((r) => r.correctiveAction);

  const openNCs = nonconformances.filter((nc) => nc.status === "open" || nc.status === "in_progress");
  const closedNCs = nonconformances.filter((nc) => nc.status === "closed" || nc.status === "resolved");

  const complianceScore = nonconformances.length === 0 ? 100 : Math.round(((closedNCs.length) / nonconformances.length) * 100);

  const exportData = {
    exportDate: new Date().toISOString(),
    exportFormat: "red-tractor-compliance-report",
    farm: {
      name: farm?.name,
      cphNumber: farm?.cphNumber,
      postcode: farm?.postcode,
      totalAcreage: farm?.totalAcreage,
    },
    summary: {
      complianceScore,
      totalInspections: inspections.length,
      openNonconformances: openNCs.length,
      closedNonconformances: closedNCs.length,
      totalCorrectiveActions: correctiveActions.length,
      totalRiskAssessments: riskAssessments.length,
      totalCoshhRecords: coshhRecords.length,
      totalTrainingRecords: trainingRecords.length,
      totalVisitorLogs: visitors.length,
      totalPestControlRecords: pestControl.length,
      totalCleaningRecords: cleaningRecords.length,
      totalWasteRecords: wasteRecords.length,
    },
    inspections,
    nonconformances,
    correctiveActions,
    riskAssessments,
    coshhRecords,
    wasteDisposalRecords: wasteRecords,
    staffTraining: trainingRecords,
    staffCertificates: certificates,
    visitorLogs: visitors,
    pestControl,
    cleaningRecords,
  };

  if (req.query.format === "csv") {
    const sections: string[] = [];
    sections.push("Red Tractor Compliance Export");
    sections.push(`Farm: ${farm?.name || "Unknown"}`);
    sections.push(`CPH Number: ${farm?.cphNumber || "N/A"}`);
    sections.push(`Export Date: ${new Date().toLocaleDateString("en-GB")}`);
    sections.push(`Compliance Score: ${complianceScore}%`);
    sections.push("");

    if (inspections.length > 0) {
      sections.push("INSPECTIONS");
      sections.push("Date,Type,Inspector,Body,Result,Notes");
      for (const i of inspections) {
        sections.push([
          new Date(i.inspectionDate).toLocaleDateString("en-GB"),
          i.inspectionType || "",
          i.inspectorName || "",
          i.inspectionBody || "",
          i.overallResult || "",
          (i.notes || "").replace(/,/g, ";"),
        ].join(","));
      }
      sections.push("");
    }

    if (nonconformances.length > 0) {
      sections.push("NON-CONFORMANCES");
      sections.push("Raised Date,Category,Severity,Status,Description");
      for (const nc of nonconformances) {
        sections.push([
          new Date(nc.identifiedDate).toLocaleDateString("en-GB"),
          nc.category || "",
          nc.severity || "",
          nc.status || "",
          (nc.description || "").replace(/,/g, ";"),
        ].join(","));
      }
      sections.push("");
    }

    const csvContent = sections.join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="red-tractor-compliance-${farm?.name || "farm"}.csv"`);
    res.send(csvContent);
    return;
  }

  res.json(exportData);
});

router.get("/farms/:farmId/mortality-records", requireAuth, requireTenant, requireModuleByKey("livestock-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(livestockMortalityTable).where(eq(livestockMortalityTable.farmId, farmId)).orderBy(desc(livestockMortalityTable.dateOfDeath));
  res.json({ records });
});

router.post("/farms/:farmId/mortality-records", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const [record] = await db.insert(livestockMortalityTable).values({ ...req.body, farmId }).returning();
  res.json({ record });
});

router.put("/farms/:farmId/mortality-records/:recordId", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const recordId = Number(req.params.recordId);
  const [record] = await db.update(livestockMortalityTable).set(req.body).where(and(eq(livestockMortalityTable.id, recordId), eq(livestockMortalityTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/mortality-records/:recordId", requireAuth, requireTenant, requireModuleByKey("livestock-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const recordId = Number(req.params.recordId);
  await db.delete(livestockMortalityTable).where(and(eq(livestockMortalityTable.id, recordId), eq(livestockMortalityTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Livestock Daily Checks Register ────────────────
router.get("/farms/:farmId/livestock-checks", requireAuth, requireTenant, requireModuleByKey("livestock-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(livestockDailyChecksTable).where(eq(livestockDailyChecksTable.farmId, farmId)).orderBy(desc(livestockDailyChecksTable.checkDate));
  res.json({ records });
});

router.post("/farms/:farmId/livestock-checks", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const { mobileId } = req.body;
  if (mobileId) {
    const [existing] = await db.select({ id: livestockDailyChecksTable.id }).from(livestockDailyChecksTable).where(and(eq(livestockDailyChecksTable.farmId, farmId), eq(livestockDailyChecksTable.mobileId, mobileId))).limit(1);
    if (existing) { res.json({ record: existing, duplicate: true }); return; }
  }
  const year = new Date().getFullYear();
  const [countRow] = await db.select({ count: db.$count(livestockDailyChecksTable.id) }).from(livestockDailyChecksTable).where(and(eq(livestockDailyChecksTable.farmId, farmId)));
  const seq = (Number(countRow?.count ?? 0) + 1).toString().padStart(4, "0");
  const checkRef = req.body.checkRef || `LC-${year}-${seq}`;
  const checkDate = req.body.checkDate || req.body.checkDate || new Date().toISOString();
  const [record] = await db.insert(livestockDailyChecksTable).values({ ...req.body, farmId, checkRef, checkDate: new Date(checkDate), sickCount: Number(req.body.sickCount ?? 0), mortalityCount: Number(req.body.mortalityCount ?? 0) }).returning();
  res.status(201).json({ record });
});

router.patch("/farms/:farmId/livestock-checks/:recordId/status", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const { status } = req.body;
  const [record] = await db.update(livestockDailyChecksTable).set({ status }).where(and(eq(livestockDailyChecksTable.id, recordId), eq(livestockDailyChecksTable.farmId, farmId))).returning();
  res.json({ record });
});

router.put("/farms/:farmId/livestock-checks/:recordId", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(livestockDailyChecksTable).set(req.body).where(and(eq(livestockDailyChecksTable.id, recordId), eq(livestockDailyChecksTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/livestock-checks/:recordId", requireAuth, requireTenant, requireModuleByKey("livestock-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(livestockDailyChecksTable).where(and(eq(livestockDailyChecksTable.id, recordId), eq(livestockDailyChecksTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/vet-health-plans", requireAuth, requireTenant, requireModuleByKey("livestock-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(vetHealthPlansTable).where(eq(vetHealthPlansTable.farmId, farmId)).orderBy(desc(vetHealthPlansTable.planYear));
  res.json({ records });
});

router.post("/farms/:farmId/vet-health-plans", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const [record] = await db.insert(vetHealthPlansTable).values({ ...req.body, farmId }).returning();
  res.json({ record });
});

router.put("/farms/:farmId/vet-health-plans/:recordId", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const recordId = Number(req.params.recordId);
  const [record] = await db.update(vetHealthPlansTable).set(req.body).where(and(eq(vetHealthPlansTable.id, recordId), eq(vetHealthPlansTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/vet-health-plans/:recordId", requireAuth, requireTenant, requireModuleByKey("livestock-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const recordId = Number(req.params.recordId);
  await db.delete(vetHealthPlansTable).where(and(eq(vetHealthPlansTable.id, recordId), eq(vetHealthPlansTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/seed-drilling", requireAuth, requireTenant, requireModuleByKey("crop-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(seedDrillingRecordsTable).where(eq(seedDrillingRecordsTable.farmId, farmId)).orderBy(desc(seedDrillingRecordsTable.drillingDate));
  res.json({ records });
});

router.post("/farms/:farmId/seed-drilling", requireAuth, requireTenant, requireModuleByKey("crop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const [record] = await db.insert(seedDrillingRecordsTable).values({ ...req.body, farmId }).returning();
  res.json({ record });
});

router.put("/farms/:farmId/seed-drilling/:recordId", requireAuth, requireTenant, requireModuleByKey("crop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const recordId = Number(req.params.recordId);
  const [record] = await db.update(seedDrillingRecordsTable).set(req.body).where(and(eq(seedDrillingRecordsTable.id, recordId), eq(seedDrillingRecordsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/seed-drilling/:recordId", requireAuth, requireTenant, requireModuleByKey("crop-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const recordId = Number(req.params.recordId);
  await db.delete(seedDrillingRecordsTable).where(and(eq(seedDrillingRecordsTable.id, recordId), eq(seedDrillingRecordsTable.farmId, farmId)));
  res.json({ success: true });
});


router.get("/farms/:farmId/biofuel/certification", requireAuth, requireTenant, requireModuleByKey("biofuel-rtfo", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(biofuelCertificationsTable).where(eq(biofuelCertificationsTable.farmId, farmId)).orderBy(desc(biofuelCertificationsTable.createdAt));
  res.json({ records });
});

router.post("/farms/:farmId/biofuel/certification", requireAuth, requireTenant, requireModuleByKey("biofuel-rtfo", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(biofuelCertificationsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/biofuel/certification/:recordId", requireAuth, requireTenant, requireModuleByKey("biofuel-rtfo", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = Number(req.params.recordId);
  const [record] = await db.update(biofuelCertificationsTable).set(req.body).where(and(eq(biofuelCertificationsTable.id, recordId), eq(biofuelCertificationsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/biofuel/certification/:recordId", requireAuth, requireTenant, requireModuleByKey("biofuel-rtfo", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = Number(req.params.recordId);
  await db.delete(biofuelCertificationsTable).where(and(eq(biofuelCertificationsTable.id, recordId), eq(biofuelCertificationsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/biofuel/field-declarations", requireAuth, requireTenant, requireModuleByKey("biofuel-rtfo", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(biofuelFieldDeclarationsTable).where(eq(biofuelFieldDeclarationsTable.farmId, farmId)).orderBy(desc(biofuelFieldDeclarationsTable.createdAt));
  res.json({ records });
});

router.post("/farms/:farmId/biofuel/field-declarations", requireAuth, requireTenant, requireModuleByKey("biofuel-rtfo", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(biofuelFieldDeclarationsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/biofuel/field-declarations/:recordId", requireAuth, requireTenant, requireModuleByKey("biofuel-rtfo", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = Number(req.params.recordId);
  const [record] = await db.update(biofuelFieldDeclarationsTable).set(req.body).where(and(eq(biofuelFieldDeclarationsTable.id, recordId), eq(biofuelFieldDeclarationsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/biofuel/field-declarations/:recordId", requireAuth, requireTenant, requireModuleByKey("biofuel-rtfo", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = Number(req.params.recordId);
  await db.delete(biofuelFieldDeclarationsTable).where(and(eq(biofuelFieldDeclarationsTable.id, recordId), eq(biofuelFieldDeclarationsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/biofuel/deliveries", requireAuth, requireTenant, requireModuleByKey("biofuel-rtfo", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(biofuelDeliveriesTable).where(eq(biofuelDeliveriesTable.farmId, farmId)).orderBy(desc(biofuelDeliveriesTable.deliveryDate));
  res.json({ records });
});

router.post("/farms/:farmId/biofuel/deliveries", requireAuth, requireTenant, requireModuleByKey("biofuel-rtfo", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(biofuelDeliveriesTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/biofuel/deliveries/:recordId", requireAuth, requireTenant, requireModuleByKey("biofuel-rtfo", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = Number(req.params.recordId);
  const [record] = await db.update(biofuelDeliveriesTable).set(req.body).where(and(eq(biofuelDeliveriesTable.id, recordId), eq(biofuelDeliveriesTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/biofuel/deliveries/:recordId", requireAuth, requireTenant, requireModuleByKey("biofuel-rtfo", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = Number(req.params.recordId);
  await db.delete(biofuelDeliveriesTable).where(and(eq(biofuelDeliveriesTable.id, recordId), eq(biofuelDeliveriesTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Biofuel PDF: Sustainability Declaration ─────────────────────────────────

router.get(
  "/farms/:farmId/biofuel/deliveries/:deliveryId/sustainability-declaration.pdf",
  requireAuth, requireTenant, requireModuleByKey("biofuel-rtfo", "read"),
  async (req: Request, res: Response): Promise<void> => {
    const farmId = await validateFarmAccess(req, res);
    if (!farmId) return;

    const deliveryId = Number(req.params.deliveryId);
    const tenantId = (req as any).tenantId as number;

    const [farm] = await db.select().from(farmsTable).where(eq(farmsTable.id, farmId)).limit(1);
    if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }

    const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, tenantId)).limit(1);

    const [delivery] = await db.select().from(biofuelDeliveriesTable)
      .where(and(eq(biofuelDeliveriesTable.id, deliveryId), eq(biofuelDeliveriesTable.farmId, farmId)))
      .limit(1);
    if (!delivery) { res.status(404).json({ error: "Delivery not found" }); return; }

    const certs = await db.select().from(biofuelCertificationsTable)
      .where(and(eq(biofuelCertificationsTable.farmId, farmId), eq(biofuelCertificationsTable.status, "active")))
      .limit(1);

    const farmInfo = {
      name: farm.name,
      address: farm.address,
      postcode: farm.postcode,
      cphNumber: farm.cphNumber,
      sbiNumber: (farm as any).sbiNumber ?? null,
      farmManager: (farm as any).farmManager ?? null,
      tenantName: tenant?.name ?? farm.name,
      tenantEmail: tenant?.contactEmail ?? "",
    };

    const pdf = await generateSustainabilityDeclaration(farmInfo, {
      id: delivery.id,
      deliveryDate: delivery.deliveryDate.toISOString(),
      buyerName: delivery.buyerName,
      buyerRtfoRef: delivery.buyerRtfoRef,
      cropType: delivery.cropType,
      quantityTonnes: delivery.quantityTonnes ?? undefined,
      fieldNames: delivery.fieldNames ?? [],
      certificationRef: delivery.certificationRef,
      sustainabilityDeclarationRef: delivery.sustainabilityDeclarationRef,
      sustainabilityScheme: delivery.sustainabilityScheme,
      ghgSavingPercent: delivery.ghgSavingPercent ?? undefined,
      notes: delivery.notes,
    }, certs[0] ? {
      scheme: certs[0].scheme,
      certificationNumber: certs[0].certificationNumber,
      issuingBody: certs[0].issuingBody,
      issueDate: certs[0].issueDate?.toISOString(),
      expiryDate: certs[0].expiryDate?.toISOString(),
      status: certs[0].status,
      rtfoOperatorNumber: certs[0].rtfoOperatorNumber,
    } : null);

    const slug = farm.name.replace(/[^a-z0-9]+/gi, "-");
    const dateStr = delivery.deliveryDate.toISOString().split("T")[0];
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Sustainability-Declaration-${slug}-${dateStr}.pdf"`,
      "Content-Length": String(pdf.length),
    });
    res.send(pdf);
  }
);

// ─── Biofuel PDF: Audit Pack ──────────────────────────────────────────────────

router.get(
  "/farms/:farmId/biofuel/audit-pack.pdf",
  requireAuth, requireTenant, requireModuleByKey("biofuel-rtfo", "read"),
  async (req: Request, res: Response): Promise<void> => {
    const farmId = await validateFarmAccess(req, res);
    if (!farmId) return;

    const tenantId = (req as any).tenantId as number;

    const [farm] = await db.select().from(farmsTable).where(eq(farmsTable.id, farmId)).limit(1);
    if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }

    const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, tenantId)).limit(1);

    const [allCerts, allFields, allDeliveries] = await Promise.all([
      db.select().from(biofuelCertificationsTable).where(eq(biofuelCertificationsTable.farmId, farmId)).orderBy(desc(biofuelCertificationsTable.createdAt)),
      db.select().from(biofuelFieldDeclarationsTable).where(eq(biofuelFieldDeclarationsTable.farmId, farmId)).orderBy(biofuelFieldDeclarationsTable.fieldName),
      db.select().from(biofuelDeliveriesTable).where(eq(biofuelDeliveriesTable.farmId, farmId)).orderBy(desc(biofuelDeliveriesTable.deliveryDate)),
    ]);

    const [nvzApps, sprayApps, harvestRecs, deliverySummary] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int`, total: sql<string>`coalesce(sum(total_nitrogen_kg), 0)::text` }).from(nvzFertiliserApplicationsTable).where(eq(nvzFertiliserApplicationsTable.farmId, farmId)),
      db.select({ count: sql<number>`count(*)::int` }).from(sprayApplicationsTable).where(eq(sprayApplicationsTable.farmId, farmId)),
      db.select({ count: sql<number>`count(*)::int`, total: sql<string>`coalesce(sum(yield_tonnes), 0)::text` }).from(harvestRecordsTable).where(eq(harvestRecordsTable.farmId, farmId)),
      db.select({ count: sql<number>`count(*)::int`, total: sql<string>`coalesce(sum(quantity_tonnes), 0)::text` }).from(biofuelDeliveriesTable).where(eq(biofuelDeliveriesTable.farmId, farmId)),
    ]);

    const farmInfo = {
      name: farm.name,
      address: farm.address,
      postcode: farm.postcode,
      cphNumber: farm.cphNumber,
      sbiNumber: (farm as any).sbiNumber ?? null,
      farmManager: (farm as any).farmManager ?? null,
      tenantName: tenant?.name ?? farm.name,
      tenantEmail: tenant?.contactEmail ?? "",
    };

    const year = new Date().getFullYear();
    const periodLabel = req.query.period as string || `${year} Audit Period`;

    const pdf = await generateAuditPack(
      farmInfo,
      allCerts.map(c => ({
        scheme: c.scheme,
        certificationNumber: c.certificationNumber,
        issuingBody: c.issuingBody,
        issueDate: c.issueDate?.toISOString(),
        expiryDate: c.expiryDate?.toISOString(),
        status: c.status,
        rtfoOperatorNumber: c.rtfoOperatorNumber,
      })),
      allFields.map(f => ({
        fieldName: f.fieldName,
        landUseIn2008: f.landUseIn2008,
        eligibilityStatus: f.eligibilityStatus,
        convertedAfter2008: f.convertedAfter2008,
        highCarbonStockRisk: f.highCarbonStockRisk,
        highBiodiversityRisk: f.highBiodiversityRisk,
        declarationDate: f.declarationDate?.toISOString(),
        declaredBy: f.declaredBy,
      })),
      allDeliveries.map(d => ({
        id: d.id,
        deliveryDate: d.deliveryDate.toISOString(),
        buyerName: d.buyerName,
        buyerRtfoRef: d.buyerRtfoRef,
        cropType: d.cropType,
        quantityTonnes: d.quantityTonnes ?? undefined,
        fieldNames: d.fieldNames ?? [],
        certificationRef: d.certificationRef,
        sustainabilityDeclarationRef: d.sustainabilityDeclarationRef,
        sustainabilityScheme: d.sustainabilityScheme,
        ghgSavingPercent: d.ghgSavingPercent ?? undefined,
        notes: d.notes,
      })),
      {
        nvzApplicationCount: nvzApps[0]?.count ?? 0,
        totalNitrogenKgHa: nvzApps[0]?.total ?? "0",
        sprayApplicationCount: sprayApps[0]?.count ?? 0,
        harvestRecordCount: harvestRecs[0]?.count ?? 0,
        totalHarvestTonnes: harvestRecs[0]?.total ?? "0",
        biofuelDeliveryCount: deliverySummary[0]?.count ?? 0,
        totalBiofuelTonnes: deliverySummary[0]?.total ?? "0",
      },
      periodLabel,
    );

    const slug = farm.name.replace(/[^a-z0-9]+/gi, "-");
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="RTFO-Audit-Pack-${slug}-${year}.pdf"`,
      "Content-Length": String(pdf.length),
    });
    res.send(pdf);
  }
);

// ─── RTFO Buyers ──────────────────────────────────────────────────────────────

router.get("/farms/:farmId/biofuel/buyers", requireAuth, requireTenant, requireModuleByKey("biofuel-rtfo", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(rtfoBuyersTable)
    .where(eq(rtfoBuyersTable.farmId, farmId))
    .orderBy(rtfoBuyersTable.companyName);
  res.json({ records });
});

router.post("/farms/:farmId/biofuel/buyers", requireAuth, requireTenant, requireModuleByKey("biofuel-rtfo", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(rtfoBuyersTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/biofuel/buyers/:recordId", requireAuth, requireTenant, requireModuleByKey("biofuel-rtfo", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = Number(req.params.recordId);
  const [record] = await db.update(rtfoBuyersTable).set(req.body)
    .where(and(eq(rtfoBuyersTable.id, recordId), eq(rtfoBuyersTable.farmId, farmId)))
    .returning();
  res.json({ record });
});

router.delete("/farms/:farmId/biofuel/buyers/:recordId", requireAuth, requireTenant, requireModuleByKey("biofuel-rtfo", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = Number(req.params.recordId);
  await db.delete(rtfoBuyersTable).where(and(eq(rtfoBuyersTable.id, recordId), eq(rtfoBuyersTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/biofuel/ghg-summary", requireAuth, requireTenant, requireModuleByKey("biofuel-rtfo", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [nvzApps, sprayApps, harvestRecs, deliveries] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int`, totalNKgHa: sql<string>`coalesce(sum(total_nitrogen_kg), 0)::text` }).from(nvzFertiliserApplicationsTable).where(eq(nvzFertiliserApplicationsTable.farmId, farmId)),
    db.select({ count: sql<number>`count(*)::int` }).from(sprayApplicationsTable).where(eq(sprayApplicationsTable.farmId, farmId)),
    db.select({ count: sql<number>`count(*)::int`, totalYield: sql<string>`coalesce(sum(yield_tonnes), 0)::text` }).from(harvestRecordsTable).where(eq(harvestRecordsTable.farmId, farmId)),
    db.select({ count: sql<number>`count(*)::int`, totalTonnes: sql<string>`coalesce(sum(quantity_tonnes), 0)::text` }).from(biofuelDeliveriesTable).where(eq(biofuelDeliveriesTable.farmId, farmId)),
  ]);
  res.json({
    nvzApplicationCount: nvzApps[0]?.count ?? 0,
    totalNitrogenKgHa: nvzApps[0]?.totalNKgHa ?? "0",
    sprayApplicationCount: sprayApps[0]?.count ?? 0,
    harvestRecordCount: harvestRecs[0]?.count ?? 0,
    totalHarvestTonnes: harvestRecs[0]?.totalYield ?? "0",
    biofuelDeliveryCount: deliveries[0]?.count ?? 0,
    totalBiofuelTonnes: deliveries[0]?.totalTonnes ?? "0",
  });
});

// ─── Dairy Management ─────────────────────────────────────────────────────────

router.get("/farms/:farmId/dairy/milk-records", requireAuth, requireTenant, requireModuleByKey("dairy-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(dairyMilkRecordsTable).where(eq(dairyMilkRecordsTable.farmId, farmId)).orderBy(desc(dairyMilkRecordsTable.recordDate));
  res.json({ records });
});

router.post("/farms/:farmId/dairy/milk-records", requireAuth, requireTenant, requireModuleByKey("dairy-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const { recordDate, recordType, sessionType, yieldLitres, sccThousands, tbcCfuMl, fatPercent, proteinPercent, lactosePercent, milkTemperatureCelsius, antibioticResidueTestResult, collectorReference, herdId, notes } = req.body;
  const [record] = await db.insert(dairyMilkRecordsTable).values({ farmId, recordDate: new Date(recordDate), recordType: recordType || "bulk-tank", sessionType, yieldLitres, sccThousands, tbcCfuMl, fatPercent, proteinPercent, lactosePercent, milkTemperatureCelsius, antibioticResidueTestResult, collectorReference, herdId: herdId || null, notes }).returning();
  res.json({ record });
});

router.put("/farms/:farmId/dairy/milk-records/:recordId", requireAuth, requireTenant, requireModuleByKey("dairy-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = parseInt(req.params.recordId);
  const { recordDate, recordType, sessionType, yieldLitres, sccThousands, tbcCfuMl, fatPercent, proteinPercent, lactosePercent, milkTemperatureCelsius, antibioticResidueTestResult, collectorReference, herdId, notes } = req.body;
  const [record] = await db.update(dairyMilkRecordsTable).set({ recordDate: recordDate ? new Date(recordDate) : undefined, recordType, sessionType, yieldLitres, sccThousands, tbcCfuMl, fatPercent, proteinPercent, lactosePercent, milkTemperatureCelsius, antibioticResidueTestResult, collectorReference, herdId: herdId || null, notes }).where(and(eq(dairyMilkRecordsTable.id, recordId), eq(dairyMilkRecordsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/dairy/milk-records/:recordId", requireAuth, requireTenant, requireModuleByKey("dairy-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = parseInt(req.params.recordId);
  await db.delete(dairyMilkRecordsTable).where(and(eq(dairyMilkRecordsTable.id, recordId), eq(dairyMilkRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/dairy/mastitis-records", requireAuth, requireTenant, requireModuleByKey("dairy-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(dairyMastitisRecordsTable).where(eq(dairyMastitisRecordsTable.farmId, farmId)).orderBy(desc(dairyMastitisRecordsTable.onsetDate));
  res.json({ records });
});

router.post("/farms/:farmId/dairy/mastitis-records", requireAuth, requireTenant, requireModuleByKey("dairy-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const { herdId, animalId, earTagNumber, onsetDate, quartersAffected, clinicalGrade, bacterialCultureResult, treatmentProduct, treatmentStartDate, treatmentDurationDays, withdrawalEndDate, outcome, outcomeDate, vetConsulted, vetName, sccAtOnset, notes } = req.body;
  const [record] = await db.insert(dairyMastitisRecordsTable).values({ farmId, herdId: herdId || null, animalId: animalId || null, earTagNumber, onsetDate: new Date(onsetDate), quartersAffected, clinicalGrade, bacterialCultureResult, treatmentProduct, treatmentStartDate: treatmentStartDate ? new Date(treatmentStartDate) : null, treatmentDurationDays, withdrawalEndDate: withdrawalEndDate ? new Date(withdrawalEndDate) : null, outcome, outcomeDate: outcomeDate ? new Date(outcomeDate) : null, vetConsulted: !!vetConsulted, vetName, sccAtOnset, notes }).returning();
  res.json({ record });
});

router.put("/farms/:farmId/dairy/mastitis-records/:recordId", requireAuth, requireTenant, requireModuleByKey("dairy-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = parseInt(req.params.recordId);
  const { herdId, animalId, earTagNumber, onsetDate, quartersAffected, clinicalGrade, bacterialCultureResult, treatmentProduct, treatmentStartDate, treatmentDurationDays, withdrawalEndDate, outcome, outcomeDate, vetConsulted, vetName, sccAtOnset, notes } = req.body;
  const [record] = await db.update(dairyMastitisRecordsTable).set({ herdId: herdId || null, animalId: animalId || null, earTagNumber, onsetDate: onsetDate ? new Date(onsetDate) : undefined, quartersAffected, clinicalGrade, bacterialCultureResult, treatmentProduct, treatmentStartDate: treatmentStartDate ? new Date(treatmentStartDate) : null, treatmentDurationDays, withdrawalEndDate: withdrawalEndDate ? new Date(withdrawalEndDate) : null, outcome, outcomeDate: outcomeDate ? new Date(outcomeDate) : null, vetConsulted: !!vetConsulted, vetName, sccAtOnset, notes }).where(and(eq(dairyMastitisRecordsTable.id, recordId), eq(dairyMastitisRecordsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/dairy/mastitis-records/:recordId", requireAuth, requireTenant, requireModuleByKey("dairy-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = parseInt(req.params.recordId);
  await db.delete(dairyMastitisRecordsTable).where(and(eq(dairyMastitisRecordsTable.id, recordId), eq(dairyMastitisRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/dairy/calving-records", requireAuth, requireTenant, requireModuleByKey("dairy-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(dairyCalvingRecordsTable).where(eq(dairyCalvingRecordsTable.farmId, farmId)).orderBy(desc(dairyCalvingRecordsTable.calvingDate));
  res.json({ records });
});

router.post("/farms/:farmId/dairy/calving-records", requireAuth, requireTenant, requireModuleByKey("dairy-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const { herdId, cowAnimalId, cowEarTag, calvingDate, calvingEaseScore, numberOfCalves, calfOutcome, calfSex, calfEarTag, sireBreed, calfBreed, calfBirthWeightKg, colostrumGivenWithin2Hours, colostrumGivenWithin6Hours, colostrumVolumeFirstFeedLitres, colostrumQualityBrix, colostrumSource, cowComplications, assistanceRequired, vetAttended, vetName, calfDisposition, bcmsPassportApplied, notes } = req.body;
  const [record] = await db.insert(dairyCalvingRecordsTable).values({ farmId, herdId: herdId || null, cowAnimalId: cowAnimalId || null, cowEarTag, calvingDate: new Date(calvingDate), calvingEaseScore, numberOfCalves: numberOfCalves || 1, calfOutcome, calfSex, calfEarTag, sireBreed, calfBreed, calfBirthWeightKg, colostrumGivenWithin2Hours: !!colostrumGivenWithin2Hours, colostrumGivenWithin6Hours: !!colostrumGivenWithin6Hours, colostrumVolumeFirstFeedLitres, colostrumQualityBrix, colostrumSource, cowComplications, assistanceRequired: !!assistanceRequired, vetAttended: !!vetAttended, vetName, calfDisposition, bcmsPassportApplied: !!bcmsPassportApplied, notes }).returning();
  res.json({ record });
});

router.put("/farms/:farmId/dairy/calving-records/:recordId", requireAuth, requireTenant, requireModuleByKey("dairy-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = parseInt(req.params.recordId);
  const { herdId, cowAnimalId, cowEarTag, calvingDate, calvingEaseScore, numberOfCalves, calfOutcome, calfSex, calfEarTag, sireBreed, calfBreed, calfBirthWeightKg, colostrumGivenWithin2Hours, colostrumGivenWithin6Hours, colostrumVolumeFirstFeedLitres, colostrumQualityBrix, colostrumSource, cowComplications, assistanceRequired, vetAttended, vetName, calfDisposition, bcmsPassportApplied, notes } = req.body;
  const [record] = await db.update(dairyCalvingRecordsTable).set({ herdId: herdId || null, cowAnimalId: cowAnimalId || null, cowEarTag, calvingDate: calvingDate ? new Date(calvingDate) : undefined, calvingEaseScore, numberOfCalves, calfOutcome, calfSex, calfEarTag, sireBreed, calfBreed, calfBirthWeightKg, colostrumGivenWithin2Hours: colostrumGivenWithin2Hours !== undefined ? !!colostrumGivenWithin2Hours : undefined, colostrumGivenWithin6Hours: colostrumGivenWithin6Hours !== undefined ? !!colostrumGivenWithin6Hours : undefined, colostrumVolumeFirstFeedLitres, colostrumQualityBrix, colostrumSource, cowComplications, assistanceRequired: assistanceRequired !== undefined ? !!assistanceRequired : undefined, vetAttended: vetAttended !== undefined ? !!vetAttended : undefined, vetName, calfDisposition, bcmsPassportApplied: bcmsPassportApplied !== undefined ? !!bcmsPassportApplied : undefined, notes }).where(and(eq(dairyCalvingRecordsTable.id, recordId), eq(dairyCalvingRecordsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/dairy/calving-records/:recordId", requireAuth, requireTenant, requireModuleByKey("dairy-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = parseInt(req.params.recordId);
  await db.delete(dairyCalvingRecordsTable).where(and(eq(dairyCalvingRecordsTable.id, recordId), eq(dairyCalvingRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/dairy/bcs-records", requireAuth, requireTenant, requireModuleByKey("dairy-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(dairyBcsRecordsTable).where(eq(dairyBcsRecordsTable.farmId, farmId)).orderBy(desc(dairyBcsRecordsTable.assessmentDate));
  res.json({ records });
});

router.post("/farms/:farmId/dairy/bcs-records", requireAuth, requireTenant, requireModuleByKey("dairy-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const { herdId, animalId, earTagNumber, assessmentDate, lifeStage, bcsScore, assessedBy, targetScore, actionRequired, actionTaken, notes } = req.body;
  const [record] = await db.insert(dairyBcsRecordsTable).values({ farmId, herdId: herdId || null, animalId: animalId || null, earTagNumber, assessmentDate: new Date(assessmentDate), lifeStage, bcsScore, assessedBy, targetScore, actionRequired: !!actionRequired, actionTaken, notes }).returning();
  res.json({ record });
});

router.put("/farms/:farmId/dairy/bcs-records/:recordId", requireAuth, requireTenant, requireModuleByKey("dairy-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = parseInt(req.params.recordId);
  const { herdId, animalId, earTagNumber, assessmentDate, lifeStage, bcsScore, assessedBy, targetScore, actionRequired, actionTaken, notes } = req.body;
  const [record] = await db.update(dairyBcsRecordsTable).set({ herdId: herdId || null, animalId: animalId || null, earTagNumber, assessmentDate: assessmentDate ? new Date(assessmentDate) : undefined, lifeStage, bcsScore, assessedBy, targetScore, actionRequired: actionRequired !== undefined ? !!actionRequired : undefined, actionTaken, notes }).where(and(eq(dairyBcsRecordsTable.id, recordId), eq(dairyBcsRecordsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/dairy/bcs-records/:recordId", requireAuth, requireTenant, requireModuleByKey("dairy-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = parseInt(req.params.recordId);
  await db.delete(dairyBcsRecordsTable).where(and(eq(dairyBcsRecordsTable.id, recordId), eq(dairyBcsRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/dairy/mobility-scorings", requireAuth, requireTenant, requireModuleByKey("dairy-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(dairyMobilityScoringsTable).where(eq(dairyMobilityScoringsTable.farmId, farmId)).orderBy(desc(dairyMobilityScoringsTable.assessmentDate));
  res.json({ records });
});

router.post("/farms/:farmId/dairy/mobility-scorings", requireAuth, requireTenant, requireModuleByKey("dairy-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const { herdId, assessmentDate, assessedBy, totalCowsScored, score0Count, score1Count, score2Count, score3Count, lamenessPrevalencePercent, actionTaken, nextAssessmentDue, notes } = req.body;
  const total = parseInt(totalCowsScored) || 0;
  const s3 = parseInt(score3Count) || 0;
  const prevalence = total > 0 ? ((s3 / total) * 100).toFixed(1) : lamenessPrevalencePercent;
  const [record] = await db.insert(dairyMobilityScoringsTable).values({ farmId, herdId: herdId || null, assessmentDate: new Date(assessmentDate), assessedBy, totalCowsScored: total, score0Count: parseInt(score0Count) || 0, score1Count: parseInt(score1Count) || 0, score2Count: parseInt(score2Count) || 0, score3Count: s3, lamenessPrevalencePercent: prevalence as unknown as string, actionTaken, nextAssessmentDue: nextAssessmentDue ? new Date(nextAssessmentDue) : null, notes }).returning();
  res.json({ record });
});

router.put("/farms/:farmId/dairy/mobility-scorings/:recordId", requireAuth, requireTenant, requireModuleByKey("dairy-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = parseInt(req.params.recordId);
  const { herdId, assessmentDate, assessedBy, totalCowsScored, score0Count, score1Count, score2Count, score3Count, lamenessPrevalencePercent, actionTaken, nextAssessmentDue, notes } = req.body;
  const [record] = await db.update(dairyMobilityScoringsTable).set({ herdId: herdId || null, assessmentDate: assessmentDate ? new Date(assessmentDate) : undefined, assessedBy, totalCowsScored, score0Count, score1Count, score2Count, score3Count, lamenessPrevalencePercent, actionTaken, nextAssessmentDue: nextAssessmentDue ? new Date(nextAssessmentDue) : null, notes }).where(and(eq(dairyMobilityScoringsTable.id, recordId), eq(dairyMobilityScoringsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/dairy/mobility-scorings/:recordId", requireAuth, requireTenant, requireModuleByKey("dairy-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = parseInt(req.params.recordId);
  await db.delete(dairyMobilityScoringsTable).where(and(eq(dairyMobilityScoringsTable.id, recordId), eq(dairyMobilityScoringsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/dairy/bulk-tank-records", requireAuth, requireTenant, requireModuleByKey("dairy-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(dairyBulkTankRecordsTable).where(eq(dairyBulkTankRecordsTable.farmId, farmId)).orderBy(desc(dairyBulkTankRecordsTable.recordDate));
  res.json({ records });
});

router.post("/farms/:farmId/dairy/bulk-tank-records", requireAuth, requireTenant, requireModuleByKey("dairy-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const { recordDate, recordType, tankTemperatureCelsius, tankCleaned, cleaningProductUsed, cleaningProductBatch, antibioticResidueTestRef, antibioticResidueResult, tankerDriverName, collectionRef, notes } = req.body;
  const [record] = await db.insert(dairyBulkTankRecordsTable).values({ farmId, recordDate: new Date(recordDate), recordType, tankTemperatureCelsius, tankCleaned: !!tankCleaned, cleaningProductUsed, cleaningProductBatch, antibioticResidueTestRef, antibioticResidueResult, tankerDriverName, collectionRef, notes }).returning();
  res.json({ record });
});

router.put("/farms/:farmId/dairy/bulk-tank-records/:recordId", requireAuth, requireTenant, requireModuleByKey("dairy-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = parseInt(req.params.recordId);
  const { recordDate, recordType, tankTemperatureCelsius, tankCleaned, cleaningProductUsed, cleaningProductBatch, antibioticResidueTestRef, antibioticResidueResult, tankerDriverName, collectionRef, notes } = req.body;
  const [record] = await db.update(dairyBulkTankRecordsTable).set({ recordDate: recordDate ? new Date(recordDate) : undefined, recordType, tankTemperatureCelsius, tankCleaned: tankCleaned !== undefined ? !!tankCleaned : undefined, cleaningProductUsed, cleaningProductBatch, antibioticResidueTestRef, antibioticResidueResult, tankerDriverName, collectionRef, notes }).where(and(eq(dairyBulkTankRecordsTable.id, recordId), eq(dairyBulkTankRecordsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/dairy/bulk-tank-records/:recordId", requireAuth, requireTenant, requireModuleByKey("dairy-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = parseInt(req.params.recordId);
  await db.delete(dairyBulkTankRecordsTable).where(and(eq(dairyBulkTankRecordsTable.id, recordId), eq(dairyBulkTankRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/dairy/dct-records", requireAuth, requireTenant, requireModuleByKey("dairy-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(dairyDctRecordsTable).where(eq(dairyDctRecordsTable.farmId, farmId)).orderBy(desc(dairyDctRecordsTable.dryOffDate));
  res.json({ records });
});

router.post("/farms/:farmId/dairy/dct-records", requireAuth, requireTenant, requireModuleByKey("dairy-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const { herdId, animalId, cowEarTag, dryOffDate, protocol, antibioticTubeProduct, antibioticTubeBatch, antibioticTubeWithdrawalMilkDays, antibioticTubeWithdrawalMeatDays, teatSealantProduct, teatSealantBatch, treatmentJustification, sccAtDryOff, mastitisEpisodes12Months, administeredBy, vetAuthorisation, vetName, expectedCalvingDate, notes } = req.body;
  const [record] = await db.insert(dairyDctRecordsTable).values({ farmId, herdId: herdId || null, animalId: animalId || null, cowEarTag, dryOffDate: new Date(dryOffDate), protocol, antibioticTubeProduct, antibioticTubeBatch, antibioticTubeWithdrawalMilkDays, antibioticTubeWithdrawalMeatDays, teatSealantProduct, teatSealantBatch, treatmentJustification, sccAtDryOff, mastitisEpisodes12Months, administeredBy, vetAuthorisation: !!vetAuthorisation, vetName, expectedCalvingDate: expectedCalvingDate ? new Date(expectedCalvingDate) : null, notes }).returning();
  res.json({ record });
});

router.put("/farms/:farmId/dairy/dct-records/:recordId", requireAuth, requireTenant, requireModuleByKey("dairy-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = parseInt(req.params.recordId);
  const { herdId, animalId, cowEarTag, dryOffDate, protocol, antibioticTubeProduct, antibioticTubeBatch, antibioticTubeWithdrawalMilkDays, antibioticTubeWithdrawalMeatDays, teatSealantProduct, teatSealantBatch, treatmentJustification, sccAtDryOff, mastitisEpisodes12Months, administeredBy, vetAuthorisation, vetName, expectedCalvingDate, notes } = req.body;
  const [record] = await db.update(dairyDctRecordsTable).set({ herdId: herdId || null, animalId: animalId || null, cowEarTag, dryOffDate: dryOffDate ? new Date(dryOffDate) : undefined, protocol, antibioticTubeProduct, antibioticTubeBatch, antibioticTubeWithdrawalMilkDays, antibioticTubeWithdrawalMeatDays, teatSealantProduct, teatSealantBatch, treatmentJustification, sccAtDryOff, mastitisEpisodes12Months, administeredBy, vetAuthorisation: vetAuthorisation !== undefined ? !!vetAuthorisation : undefined, vetName, expectedCalvingDate: expectedCalvingDate ? new Date(expectedCalvingDate) : null, notes }).where(and(eq(dairyDctRecordsTable.id, recordId), eq(dairyDctRecordsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/dairy/dct-records/:recordId", requireAuth, requireTenant, requireModuleByKey("dairy-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = parseInt(req.params.recordId);
  await db.delete(dairyDctRecordsTable).where(and(eq(dairyDctRecordsTable.id, recordId), eq(dairyDctRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Biosecurity Plan (one per farm, upsert) ──────────────────────────────────
router.get("/farms/:farmId/biosecurity-plan", requireAuth, requireTenant, requireModuleByKey("biosecurity", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [plan] = await db.select().from(biosecurityPlansTable).where(eq(biosecurityPlansTable.farmId, farmId));
  res.json({ plan: plan ?? null });
});

router.put("/farms/:farmId/biosecurity-plan", requireAuth, requireTenant, requireModuleByKey("biosecurity", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [existing] = await db.select({ id: biosecurityPlansTable.id }).from(biosecurityPlansTable).where(eq(biosecurityPlansTable.farmId, farmId));
  let plan;
  if (existing) {
    [plan] = await db.update(biosecurityPlansTable).set({ ...req.body, farmId }).where(eq(biosecurityPlansTable.id, existing.id)).returning();
  } else {
    [plan] = await db.insert(biosecurityPlansTable).values({ ...req.body, farmId }).returning();
  }
  res.json({ plan });
});

// ─── NVZ Risk Assessments ──────────────────────────────────────────────────────
router.get("/farms/:farmId/nvz-risk-assessments", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(nvzRiskAssessmentsTable).where(eq(nvzRiskAssessmentsTable.farmId, farmId)).orderBy(desc(nvzRiskAssessmentsTable.assessmentDate));
  res.json({ records });
});

router.post("/farms/:farmId/nvz-risk-assessments", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(nvzRiskAssessmentsTable).values({ ...req.body, farmId }).returning();
  res.json({ record });
});

router.put("/farms/:farmId/nvz-risk-assessments/:recordId", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = parseInt(req.params.recordId);
  const [record] = await db.update(nvzRiskAssessmentsTable).set(req.body).where(and(eq(nvzRiskAssessmentsTable.id, recordId), eq(nvzRiskAssessmentsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

router.delete("/farms/:farmId/nvz-risk-assessments/:recordId", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = parseInt(req.params.recordId);
  await db.delete(nvzRiskAssessmentsTable).where(and(eq(nvzRiskAssessmentsTable.id, recordId), eq(nvzRiskAssessmentsTable.farmId, farmId)));
  res.json({ ok: true });
});

// ─── Field Inspections ───────────────────────────────────────────────────────

router.get("/farms/:farmId/field-inspections", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const unresolvedOnly = req.query.unresolved === "true";
  let query = db.select().from(fieldInspectionsTable).where(
    unresolvedOnly
      ? and(eq(fieldInspectionsTable.farmId, farmId), eq(fieldInspectionsTable.isResolved, false))
      : eq(fieldInspectionsTable.farmId, farmId)
  ).$dynamic();
  const records = await query.orderBy(desc(fieldInspectionsTable.inspectionDate));
  res.json({ records });
});

router.post("/farms/:farmId/field-inspections", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;

  const { mobileId, fieldName, inspectionDate, cropType, growthStage, pestDiseaseObservations, actionRequired, recommendedAction, inspector, notes, latitude, longitude } = req.body;

  if (mobileId) {
    const [existing] = await db.select({ id: fieldInspectionsTable.id }).from(fieldInspectionsTable)
      .where(and(eq(fieldInspectionsTable.farmId, farmId), eq(fieldInspectionsTable.mobileId, mobileId))).limit(1);
    if (existing) { res.json({ record: existing, duplicate: true }); return; }
  }

  const [record] = await db.insert(fieldInspectionsTable).values({
    farmId,
    mobileId: mobileId || null,
    fieldName: fieldName || "Unknown Field",
    inspectionDate: inspectionDate ? new Date(inspectionDate) : new Date(),
    cropType: cropType || null,
    growthStage: growthStage || null,
    pestDiseaseObservations: pestDiseaseObservations || null,
    actionRequired: actionRequired || "none",
    recommendedAction: recommendedAction || null,
    inspector: inspector || null,
    notes: notes || null,
    latitude: latitude ? String(latitude) : null,
    longitude: longitude ? String(longitude) : null,
  }).returning();

  if (actionRequired === "treat" || actionRequired === "urgent") {
    const [farm] = await db.select({ tenantId: farmsTable.tenantId }).from(farmsTable).where(eq(farmsTable.id, farmId)).limit(1);
    if (farm) {
      await createFieldActionNotification({
        tenantId: farm.tenantId,
        farmId,
        inspectionId: record.id,
        fieldName: record.fieldName,
        action: actionRequired,
        observations: pestDiseaseObservations || recommendedAction || "",
        inspector: inspector || "Mobile user",
      });
    }
  }

  res.json({ record });
});

router.patch("/farms/:farmId/field-inspections/:recordId/resolve", requireAuth, requireTenant, requireModuleByKey("field-crop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = parseInt(req.params.recordId);
  const { resolvedBy, resolutionNotes } = req.body;
  const [record] = await db.update(fieldInspectionsTable).set({
    isResolved: true,
    resolvedAt: new Date(),
    resolvedBy: resolvedBy || null,
    resolutionNotes: resolutionNotes || null,
  }).where(and(eq(fieldInspectionsTable.id, recordId), eq(fieldInspectionsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

// ─── Advisors & Access ────────────────────────────────────────────────────────

function generateAccessToken(): string {
  const { randomBytes } = require("crypto") as typeof import("crypto");
  return randomBytes(32).toString("hex");
}

// List advisors for a farm
router.get("/farms/:farmId/advisors", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(farmAdvisorsTable).where(eq(farmAdvisorsTable.farmId, farmId)).orderBy(desc(farmAdvisorsTable.createdAt));
  res.json({ records });
});

// Invite a new advisor
router.post("/farms/:farmId/advisors", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const userId = req.user?.id;
  if (!userId) { res.status(401).json({ error: "Unauthorised" }); return; }
  const token = generateAccessToken();
  const [record] = await db.insert(farmAdvisorsTable).values({
    farmId,
    invitedByUserId: userId,
    advisorEmail: req.body.advisorEmail,
    advisorName: req.body.advisorName,
    advisorRole: req.body.advisorRole,
    moduleAccess: req.body.moduleAccess ?? [],
    notes: req.body.notes ?? null,
    token,
    status: "active",
  }).returning();
  res.status(201).json({ record });
});

// Update advisor (module access, notes)
router.put("/farms/:farmId/advisors/:advisorId", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const advisorId = parseInt(req.params.advisorId);
  const [record] = await db.update(farmAdvisorsTable)
    .set({ moduleAccess: req.body.moduleAccess, notes: req.body.notes, advisorRole: req.body.advisorRole })
    .where(and(eq(farmAdvisorsTable.id, advisorId), eq(farmAdvisorsTable.farmId, farmId)))
    .returning();
  res.json({ record });
});

// Revoke advisor
router.delete("/farms/:farmId/advisors/:advisorId", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const advisorId = parseInt(req.params.advisorId);
  await db.update(farmAdvisorsTable)
    .set({ status: "revoked", revokedAt: new Date() })
    .where(and(eq(farmAdvisorsTable.id, advisorId), eq(farmAdvisorsTable.farmId, farmId)));
  res.json({ ok: true });
});

// List inspection sessions
router.get("/farms/:farmId/inspection-sessions", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(farmInspectionSessionsTable).where(eq(farmInspectionSessionsTable.farmId, farmId)).orderBy(desc(farmInspectionSessionsTable.createdAt));
  res.json({ records });
});

// Create inspection session
router.post("/farms/:farmId/inspection-sessions", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const userId = req.user?.id;
  if (!userId) { res.status(401).json({ error: "Unauthorised" }); return; }
  const token = generateAccessToken();
  const [record] = await db.insert(farmInspectionSessionsTable).values({
    farmId,
    createdByUserId: userId,
    accessorEmail: req.body.accessorEmail ?? null,
    accessorName: req.body.accessorName,
    accessorOrganisation: req.body.accessorOrganisation ?? null,
    purpose: req.body.purpose,
    moduleAccess: req.body.moduleAccess ?? [],
    token,
    expiresAt: new Date(req.body.expiresAt),
  }).returning();
  res.status(201).json({ record });
});

// Revoke inspection session
router.delete("/farms/:farmId/inspection-sessions/:sessionId", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const sessionId = parseInt(req.params.sessionId);
  await db.update(farmInspectionSessionsTable)
    .set({ revokedAt: new Date() })
    .where(and(eq(farmInspectionSessionsTable.id, sessionId), eq(farmInspectionSessionsTable.farmId, farmId)));
  res.json({ ok: true });
});

// Access log for farm managers
router.get("/farms/:farmId/access-log", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(externalAccessLogTable)
    .where(eq(externalAccessLogTable.farmId, farmId))
    .orderBy(desc(externalAccessLogTable.accessedAt))
    .limit(200);
  res.json({ records });
});

// ─── Week Ahead ───────────────────────────────────────────────────────────────

router.get("/farms/:farmId/week-ahead", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = parseInt(req.params.farmId);
  if (isNaN(farmId)) { res.status(400).json({ error: "Invalid farmId" }); return; }

  const rawDays = parseInt(req.query.days as string);
  const days = rawDays === 30 ? 30 : 7;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const rangeEnd = new Date(now);
  rangeEnd.setDate(rangeEnd.getDate() + days + 1);
  const overdueStart = new Date(now);
  overdueStart.setDate(overdueStart.getDate() - 60);

  type TaskItem = {
    id: string; type: string; title: string; description: string;
    dueDate: string; module: string; href: string; colour: string;
  };

  const tasks: TaskItem[] = [];

  const toISO = (d: Date | string | null | undefined): string | null => {
    if (!d) return null;
    if (typeof d === "string") return new Date(d + "T00:00:00Z").toISOString();
    return d.toISOString();
  };

  const [
    pestRows, cleaningRows, biosecPlanRows,
    certRows, trainingRows, inspectionRows,
    correctiveRows, riskRows,
    maintRows, calibRows,
    insuranceRows, rtwRows,
    medicineWithdrawalRows, vetHealthPlanRows,
    patTestRows, fireExtRows, workshopJobRows,
    biofuelCertRows, waterLicenceRows,
    poDeliveryRows, coshhReviewRows,
    plannerEventRows,
    grantPurchaseRows, grantClaimRows,
  ] = await Promise.all([
    db.select({ id: pestControlRecordsTable.id, pestType: pestControlRecordsTable.pestType, location: pestControlRecordsTable.location, followUpDate: pestControlRecordsTable.followUpDate })
      .from(pestControlRecordsTable)
      .where(and(eq(pestControlRecordsTable.farmId, farmId), isNotNull(pestControlRecordsTable.followUpDate), gte(pestControlRecordsTable.followUpDate, overdueStart), lt(pestControlRecordsTable.followUpDate, rangeEnd))),

    db.select({ id: cleaningDisinfectionRecordsTable.id, area: cleaningDisinfectionRecordsTable.area, cleaningType: cleaningDisinfectionRecordsTable.cleaningType, nextDueDate: cleaningDisinfectionRecordsTable.nextDueDate })
      .from(cleaningDisinfectionRecordsTable)
      .where(and(eq(cleaningDisinfectionRecordsTable.farmId, farmId), isNotNull(cleaningDisinfectionRecordsTable.nextDueDate), gte(cleaningDisinfectionRecordsTable.nextDueDate, overdueStart), lt(cleaningDisinfectionRecordsTable.nextDueDate, rangeEnd))),

    db.select({ id: biosecurityPlansTable.id, nextReviewDate: biosecurityPlansTable.nextReviewDate })
      .from(biosecurityPlansTable)
      .where(and(eq(biosecurityPlansTable.farmId, farmId), isNotNull(biosecurityPlansTable.nextReviewDate), gte(biosecurityPlansTable.nextReviewDate, overdueStart), lt(biosecurityPlansTable.nextReviewDate, rangeEnd))),

    db.select({ id: staffCertificatesTable.id, certificateType: staffCertificatesTable.certificateType, certificateNumber: staffCertificatesTable.certificateNumber, expiryDate: staffCertificatesTable.expiryDate })
      .from(staffCertificatesTable)
      .where(and(eq(staffCertificatesTable.farmId, farmId), isNotNull(staffCertificatesTable.expiryDate), gte(staffCertificatesTable.expiryDate, overdueStart), lt(staffCertificatesTable.expiryDate, rangeEnd))),

    db.select({ id: staffTrainingRecordsTable.id, trainingType: staffTrainingRecordsTable.trainingType, expiryDate: staffTrainingRecordsTable.expiryDate })
      .from(staffTrainingRecordsTable)
      .where(and(eq(staffTrainingRecordsTable.farmId, farmId), isNotNull(staffTrainingRecordsTable.expiryDate), gte(staffTrainingRecordsTable.expiryDate, overdueStart), lt(staffTrainingRecordsTable.expiryDate, rangeEnd))),

    db.select({ id: inspectionRecordsTable.id, inspectionType: inspectionRecordsTable.inspectionType, nextInspectionDue: inspectionRecordsTable.nextInspectionDue })
      .from(inspectionRecordsTable)
      .where(and(eq(inspectionRecordsTable.farmId, farmId), isNotNull(inspectionRecordsTable.nextInspectionDue), gte(inspectionRecordsTable.nextInspectionDue, overdueStart), lt(inspectionRecordsTable.nextInspectionDue, rangeEnd))),

    db.select({ id: correctiveActionsTable.id, title: correctiveActionsTable.title, dueDate: correctiveActionsTable.dueDate, status: correctiveActionsTable.status })
      .from(correctiveActionsTable)
      .where(and(eq(correctiveActionsTable.farmId, farmId), isNotNull(correctiveActionsTable.dueDate), gte(correctiveActionsTable.dueDate, overdueStart), lt(correctiveActionsTable.dueDate, rangeEnd))),

    db.select({ id: riskAssessmentsTable.id, title: riskAssessmentsTable.title, riskLevel: riskAssessmentsTable.riskLevel, reviewDate: riskAssessmentsTable.reviewDate, status: riskAssessmentsTable.status })
      .from(riskAssessmentsTable)
      .where(and(eq(riskAssessmentsTable.farmId, farmId), isNotNull(riskAssessmentsTable.reviewDate), gte(riskAssessmentsTable.reviewDate, overdueStart), lt(riskAssessmentsTable.reviewDate, rangeEnd))),

    db.select({ id: equipmentMaintenanceLogsTable.id, maintenanceType: equipmentMaintenanceLogsTable.maintenanceType, nextDueDate: equipmentMaintenanceLogsTable.nextDueDate })
      .from(equipmentMaintenanceLogsTable)
      .where(and(eq(equipmentMaintenanceLogsTable.farmId, farmId), isNotNull(equipmentMaintenanceLogsTable.nextDueDate), gte(equipmentMaintenanceLogsTable.nextDueDate, overdueStart), lt(equipmentMaintenanceLogsTable.nextDueDate, rangeEnd))),

    db.select({ id: equipmentCalibrationRecordsTable.id, calibrationType: equipmentCalibrationRecordsTable.calibrationType, nextDueDate: equipmentCalibrationRecordsTable.nextDueDate })
      .from(equipmentCalibrationRecordsTable)
      .where(and(eq(equipmentCalibrationRecordsTable.farmId, farmId), isNotNull(equipmentCalibrationRecordsTable.nextDueDate), gte(equipmentCalibrationRecordsTable.nextDueDate, overdueStart), lt(equipmentCalibrationRecordsTable.nextDueDate, rangeEnd))),

    db.select({ id: farmInsuranceTable.id, policyType: farmInsuranceTable.policyType, insurer: farmInsuranceTable.insurer, policyNumber: farmInsuranceTable.policyNumber, expiryDate: farmInsuranceTable.expiryDate })
      .from(farmInsuranceTable)
      .where(and(eq(farmInsuranceTable.farmId, farmId), isNotNull(farmInsuranceTable.expiryDate))),

    db.select({ id: staffRightToWorkTable.id, staffName: staffRightToWorkTable.staffName, documentType: staffRightToWorkTable.documentType, expiryDate: staffRightToWorkTable.expiryDate })
      .from(staffRightToWorkTable)
      .where(and(eq(staffRightToWorkTable.farmId, farmId), isNotNull(staffRightToWorkTable.expiryDate), gte(staffRightToWorkTable.expiryDate, overdueStart), lt(staffRightToWorkTable.expiryDate, rangeEnd))),

    db.select({ id: livestockMedicineRecordsTable.id, medicineName: livestockMedicineRecordsTable.medicineName, withdrawalEndDate: livestockMedicineRecordsTable.withdrawalEndDate })
      .from(livestockMedicineRecordsTable)
      .where(and(eq(livestockMedicineRecordsTable.farmId, farmId), isNotNull(livestockMedicineRecordsTable.withdrawalEndDate), gte(livestockMedicineRecordsTable.withdrawalEndDate, overdueStart), lt(livestockMedicineRecordsTable.withdrawalEndDate, rangeEnd))),

    db.select({ id: vetHealthPlansTable.id, vetName: vetHealthPlansTable.vetName, planYear: vetHealthPlansTable.planYear, reviewDate: vetHealthPlansTable.reviewDate })
      .from(vetHealthPlansTable)
      .where(and(eq(vetHealthPlansTable.farmId, farmId), isNotNull(vetHealthPlansTable.reviewDate), gte(vetHealthPlansTable.reviewDate, overdueStart), lt(vetHealthPlansTable.reviewDate, rangeEnd))),

    db.select({ id: workshopPatTestsTable.id, itemName: workshopPatTestsTable.itemName, location: workshopPatTestsTable.location, nextDueDate: workshopPatTestsTable.nextDueDate })
      .from(workshopPatTestsTable)
      .where(and(eq(workshopPatTestsTable.farmId, farmId), isNotNull(workshopPatTestsTable.nextDueDate), gte(workshopPatTestsTable.nextDueDate, overdueStart), lt(workshopPatTestsTable.nextDueDate, rangeEnd))),

    db.select({ id: workshopFireExtinguishersTable.id, location: workshopFireExtinguishersTable.location, type: workshopFireExtinguishersTable.type, nextServiceDue: workshopFireExtinguishersTable.nextServiceDue })
      .from(workshopFireExtinguishersTable)
      .where(and(eq(workshopFireExtinguishersTable.farmId, farmId), isNotNull(workshopFireExtinguishersTable.nextServiceDue), gte(workshopFireExtinguishersTable.nextServiceDue, overdueStart), lt(workshopFireExtinguishersTable.nextServiceDue, rangeEnd))),

    db.select({ id: workshopJobsTable.id, title: workshopJobsTable.title, status: workshopJobsTable.status, priority: workshopJobsTable.priority, estimatedCompletionDate: workshopJobsTable.estimatedCompletionDate })
      .from(workshopJobsTable)
      .where(and(eq(workshopJobsTable.farmId, farmId), isNotNull(workshopJobsTable.estimatedCompletionDate), gte(workshopJobsTable.estimatedCompletionDate, overdueStart), lt(workshopJobsTable.estimatedCompletionDate, rangeEnd))),

    db.select({ id: biofuelCertificationsTable.id, scheme: biofuelCertificationsTable.scheme, certificationNumber: biofuelCertificationsTable.certificationNumber, expiryDate: biofuelCertificationsTable.expiryDate, status: biofuelCertificationsTable.status })
      .from(biofuelCertificationsTable)
      .where(and(eq(biofuelCertificationsTable.farmId, farmId), isNotNull(biofuelCertificationsTable.expiryDate), gte(biofuelCertificationsTable.expiryDate, overdueStart), lt(biofuelCertificationsTable.expiryDate, rangeEnd))),

    db.select({ id: waterAbstractionLicencesTable.id, licenceExpiryDate: waterAbstractionLicencesTable.licenceExpiryDate })
      .from(waterAbstractionLicencesTable)
      .where(and(eq(waterAbstractionLicencesTable.farmId, farmId), isNotNull(waterAbstractionLicencesTable.licenceExpiryDate))),

    db.select({ id: purchaseOrdersTable.id, poNumber: purchaseOrdersTable.poNumber, supplierName: purchaseOrdersTable.supplierName, expectedDeliveryDate: purchaseOrdersTable.expectedDeliveryDate, status: purchaseOrdersTable.status })
      .from(purchaseOrdersTable)
      .where(and(eq(purchaseOrdersTable.farmId, farmId), isNotNull(purchaseOrdersTable.expectedDeliveryDate), gte(purchaseOrdersTable.expectedDeliveryDate, overdueStart), lt(purchaseOrdersTable.expectedDeliveryDate, rangeEnd))),

    db.select({ id: coshhRecordsTable.id, substanceName: coshhRecordsTable.substanceName, reviewDate: coshhRecordsTable.reviewDate })
      .from(coshhRecordsTable)
      .where(and(eq(coshhRecordsTable.farmId, farmId), isNotNull(coshhRecordsTable.reviewDate), gte(coshhRecordsTable.reviewDate, overdueStart), lt(coshhRecordsTable.reviewDate, rangeEnd))),

    db.select({ id: farmPlannerEventsTable.id, title: farmPlannerEventsTable.title, description: farmPlannerEventsTable.description, eventDate: farmPlannerEventsTable.eventDate, colour: farmPlannerEventsTable.colour })
      .from(farmPlannerEventsTable)
      .where(and(eq(farmPlannerEventsTable.farmId, farmId), gte(farmPlannerEventsTable.eventDate, overdueStart), lt(farmPlannerEventsTable.eventDate, rangeEnd))),

    db.select({ id: farmGrantsTable.id, schemeName: farmGrantsTable.schemeName, schemeType: farmGrantsTable.schemeType, itemReferenceCode: farmGrantsTable.itemReferenceCode, itemDescription: farmGrantsTable.itemDescription, purchaseDeadline: farmGrantsTable.purchaseDeadline, claimDeadline: farmGrantsTable.claimDeadline, status: farmGrantsTable.status })
      .from(farmGrantsTable)
      .where(and(eq(farmGrantsTable.farmId, farmId), isNotNull(farmGrantsTable.purchaseDeadline), gte(farmGrantsTable.purchaseDeadline, overdueStart), lt(farmGrantsTable.purchaseDeadline, rangeEnd))),

    db.select({ id: farmGrantsTable.id, schemeName: farmGrantsTable.schemeName, schemeType: farmGrantsTable.schemeType, itemReferenceCode: farmGrantsTable.itemReferenceCode, itemDescription: farmGrantsTable.itemDescription, purchaseDeadline: farmGrantsTable.purchaseDeadline, claimDeadline: farmGrantsTable.claimDeadline, status: farmGrantsTable.status })
      .from(farmGrantsTable)
      .where(and(eq(farmGrantsTable.farmId, farmId), isNotNull(farmGrantsTable.claimDeadline), gte(farmGrantsTable.claimDeadline, overdueStart), lt(farmGrantsTable.claimDeadline, rangeEnd))),
  ]);

  for (const r of pestRows) {
    if (!r.followUpDate) continue;
    tasks.push({ id: `pest-${r.id}`, type: "pest_control", title: `Pest Control Follow-Up${r.location ? ` — ${r.location}` : ""}`, description: `${r.pestType} follow-up visit required${r.location ? ` at ${r.location}` : ""}`, dueDate: toISO(r.followUpDate)!, module: "Biosecurity", href: "/pest-control", colour: "red" });
  }
  for (const r of cleaningRows) {
    if (!r.nextDueDate) continue;
    tasks.push({ id: `clean-${r.id}`, type: "cleaning", title: `Cleaning & Disinfection Due — ${r.area}`, description: `${r.cleaningType || "Cleaning"} scheduled for ${r.area}`, dueDate: toISO(r.nextDueDate)!, module: "Biosecurity", href: "/cleaning", colour: "red" });
  }
  for (const r of biosecPlanRows) {
    if (!r.nextReviewDate) continue;
    tasks.push({ id: `biosecplan-${r.id}`, type: "biosecurity_plan_review", title: "Biosecurity Plan Review Due", description: "Your farm biosecurity plan is due for review. Update and re-approve in Biosecurity → Biosecurity Plan.", dueDate: toISO(r.nextReviewDate)!, module: "Biosecurity", href: "/visitors", colour: "red" });
  }
  for (const r of certRows) {
    if (!r.expiryDate) continue;
    const label = r.certificateType || "Certificate";
    tasks.push({ id: `cert-${r.id}`, type: "certificate_expiry", title: `${label} Expiring${r.certificateNumber ? ` (${r.certificateNumber})` : ""}`, description: `Staff certificate '${label}' is due to expire. Arrange renewal to remain compliant.`, dueDate: toISO(r.expiryDate)!, module: "Staff & Training", href: "/training", colour: "indigo" });
  }
  for (const r of trainingRows) {
    if (!r.expiryDate) continue;
    const label = r.trainingType || "Training record";
    tasks.push({ id: `train-${r.id}`, type: "training_expiry", title: `${label} Expiring`, description: `Training record '${label}' is approaching expiry. Renew or refresh before the expiry date.`, dueDate: toISO(r.expiryDate)!, module: "Staff & Training", href: "/training", colour: "indigo" });
  }
  for (const r of rtwRows) {
    if (!r.expiryDate) continue;
    tasks.push({ id: `rtw-${r.id}`, type: "rtw_expiry", title: `Right to Work Expiring — ${r.staffName}`, description: `${r.staffName}'s right-to-work document (${r.documentType || "time-limited visa"}) is due to expire. Arrange a follow-up check before the expiry date.`, dueDate: toISO(r.expiryDate)!, module: "Staff & Training", href: "/training", colour: "indigo" });
  }
  for (const r of inspectionRows) {
    if (!r.nextInspectionDue) continue;
    tasks.push({ id: `insp-${r.id}`, type: "inspection_due", title: `Inspection Due — ${r.inspectionType || "General"}`, description: `A ${r.inspectionType || "farm inspection"} is scheduled. Log the outcome in Inspections & Audits.`, dueDate: toISO(r.nextInspectionDue)!, module: "Inspections & Audits", href: "/inspections", colour: "violet" });
  }
  for (const r of correctiveRows) {
    if (!r.dueDate || r.status === "completed" || r.status === "closed") continue;
    tasks.push({ id: `ca-${r.id}`, type: "corrective_action", title: `Corrective Action Due — ${r.title || "Unnamed"}`, description: `A corrective action '${r.title || "Unnamed"}' must be completed by this date to close the non-conformance.`, dueDate: toISO(r.dueDate)!, module: "Inspections & Audits", href: "/inspections", colour: "violet" });
  }
  for (const r of riskRows) {
    if (!r.reviewDate || r.status === "archived") continue;
    tasks.push({ id: `risk-${r.id}`, type: "risk_review", title: `Risk Assessment Review — ${r.title || "Unnamed"}`, description: `The ${r.riskLevel ? r.riskLevel + "-risk " : ""}risk assessment '${r.title || "Unnamed"}' is due for review.`, dueDate: toISO(r.reviewDate)!, module: "Risk & Waste", href: "/risks", colour: "amber" });
  }
  for (const r of coshhReviewRows) {
    if (!r.reviewDate) continue;
    tasks.push({ id: `coshh-${r.id}`, type: "coshh_review", title: `COSHH Review Due — ${r.substanceName}`, description: `The COSHH assessment for '${r.substanceName}' is due for review. Update in Risk & Waste → COSHH.`, dueDate: toISO(r.reviewDate)!, module: "Risk & Waste", href: "/risks", colour: "amber" });
  }
  for (const r of maintRows) {
    if (!r.nextDueDate) continue;
    tasks.push({ id: `maint-${r.id}`, type: "equipment_maintenance", title: `Equipment Maintenance Due`, description: `${r.maintenanceType || "Scheduled maintenance"} is due for a piece of equipment. Log in Equipment → Maintenance.`, dueDate: toISO(r.nextDueDate)!, module: "Equipment & Vehicles", href: "/equipment", colour: "orange" });
  }
  for (const r of calibRows) {
    if (!r.nextDueDate) continue;
    tasks.push({ id: `calib-${r.id}`, type: "equipment_calibration", title: `Equipment Calibration Due`, description: `${r.calibrationType || "Calibration"} is due for a piece of equipment. Log in Equipment → Calibration.`, dueDate: toISO(r.nextDueDate)!, module: "Equipment & Vehicles", href: "/equipment", colour: "orange" });
  }
  for (const r of patTestRows) {
    if (!r.nextDueDate) continue;
    tasks.push({ id: `pat-${r.id}`, type: "pat_test_due", title: `PAT Test Due — ${r.itemName}`, description: `Portable appliance test is due for '${r.itemName}'${r.location ? ` at ${r.location}` : ""}. Arrange testing via Workshop.`, dueDate: toISO(r.nextDueDate)!, module: "Workshop", href: "/equipment", colour: "orange" });
  }
  for (const r of fireExtRows) {
    if (!r.nextServiceDue) continue;
    tasks.push({ id: `fireext-${r.id}`, type: "fire_extinguisher_service", title: `Fire Extinguisher Service Due — ${r.location}`, description: `${r.type} extinguisher at ${r.location} is due for its annual service. Book a qualified engineer via Workshop.`, dueDate: toISO(r.nextServiceDue)!, module: "Workshop", href: "/equipment", colour: "orange" });
  }
  for (const r of workshopJobRows) {
    if (!r.estimatedCompletionDate || r.status === "completed" || r.status === "closed") continue;
    tasks.push({ id: `wjob-${r.id}`, type: "workshop_job_deadline", title: `Workshop Job Due — ${r.title}`, description: `Job '${r.title}' has an estimated completion date approaching. Check progress in Workshop → Job Cards.`, dueDate: toISO(r.estimatedCompletionDate)!, module: "Workshop", href: "/equipment", colour: "orange" });
  }
  for (const r of medicineWithdrawalRows) {
    if (!r.withdrawalEndDate) continue;
    tasks.push({ id: `medwd-${r.id}`, type: "medicine_withdrawal", title: `Withdrawal Period Ends — ${r.medicineName}`, description: `The withdrawal period for '${r.medicineName}' ends on this date. Animals may then be cleared for sale or milk production.`, dueDate: toISO(r.withdrawalEndDate)!, module: "Livestock", href: "/livestock", colour: "green" });
  }
  for (const r of vetHealthPlanRows) {
    if (!r.reviewDate) continue;
    tasks.push({ id: `vhp-${r.id}`, type: "vet_health_plan_review", title: `Vet Health Plan Review — ${r.planYear}`, description: `The ${r.planYear} vet health plan (${r.vetName}) is due for its annual review. Update in Livestock → Vet Health Plans.`, dueDate: toISO(r.reviewDate)!, module: "Livestock", href: "/livestock", colour: "green" });
  }
  for (const r of insuranceRows) {
    if (!r.expiryDate) continue;
    const expDate = new Date(r.expiryDate + "T00:00:00Z");
    if (expDate < overdueStart || expDate >= rangeEnd) continue;
    tasks.push({ id: `ins-${r.id}`, type: "insurance_expiry", title: `Insurance Expiring — ${r.policyType}`, description: `Your ${r.policyType} policy${r.insurer ? ` with ${r.insurer}` : ""}${r.policyNumber ? ` (${r.policyNumber})` : ""} is due to expire. Arrange renewal to remain legally compliant.`, dueDate: expDate.toISOString(), module: "Compliance", href: "/insurance", colour: "blue" });
  }
  for (const r of waterLicenceRows) {
    if (!r.licenceExpiryDate) continue;
    const expDate = new Date(r.licenceExpiryDate + "T00:00:00Z");
    if (expDate < overdueStart || expDate >= rangeEnd) continue;
    tasks.push({ id: `wlic-${r.id}`, type: "water_licence_expiry", title: `Water Abstraction Licence Expiring`, description: `A water abstraction licence is due to expire. Contact the Environment Agency to arrange renewal before this date.`, dueDate: expDate.toISOString(), module: "Water & Irrigation", href: "/water-irrigation", colour: "blue" });
  }
  for (const r of biofuelCertRows) {
    if (!r.expiryDate || r.status === "expired" || r.status === "cancelled") continue;
    tasks.push({ id: `bio-${r.id}`, type: "biofuel_cert_expiry", title: `Biofuel Certification Expiring — ${r.scheme}`, description: `Your ${r.scheme} certification${r.certificationNumber ? ` (${r.certificationNumber})` : ""} is due to expire. Arrange renewal to continue making RTFO claims.`, dueDate: toISO(r.expiryDate)!, module: "Biofuel / RTFO", href: "/biofuel", colour: "blue" });
  }
  for (const r of poDeliveryRows) {
    if (!r.expectedDeliveryDate || r.status === "delivered" || r.status === "cancelled") continue;
    tasks.push({ id: `pod-${r.id}`, type: "po_delivery_due", title: `Delivery Expected — ${r.poNumber || "PO"}`, description: `${r.supplierName ? `Delivery from ${r.supplierName}` : "Delivery"} is expected${r.poNumber ? ` on PO ${r.poNumber}` : ""}. Check in Suppliers & Stock → Purchase Orders.`, dueDate: toISO(r.expectedDeliveryDate)!, module: "Suppliers & Stock", href: "/suppliers-stock", colour: "amber" });
  }
  for (const r of plannerEventRows) {
    tasks.push({ id: `planner-${r.id}`, type: "planner_event", title: r.title, description: r.description || "Custom reminder added by you.", dueDate: toISO(r.eventDate)!, module: "Custom", href: "#", colour: r.colour || "slate" });
  }
  for (const r of grantPurchaseRows) {
    if (!r.purchaseDeadline || r.status === "purchased" || r.status === "claimed" || r.status === "rejected" || r.status === "withdrawn") continue;
    const itemLabel = r.itemDescription || r.itemReferenceCode || "item";
    tasks.push({ id: `grant-purchase-${r.id}`, type: "grant_purchase_deadline", title: `Grant Purchase Deadline — ${r.schemeName}`, description: `${r.schemeType} grant for '${itemLabel}' must be purchased by this date. Log in Grants & Funding.`, dueDate: toISO(r.purchaseDeadline)!, module: "Grants & Funding", href: "/grants", colour: "violet" });
  }
  for (const r of grantClaimRows) {
    if (!r.claimDeadline || r.status === "claimed" || r.status === "rejected" || r.status === "withdrawn") continue;
    const itemLabel = r.itemDescription || r.itemReferenceCode || "item";
    tasks.push({ id: `grant-claim-${r.id}`, type: "grant_claim_deadline", title: `Grant Claim Deadline — ${r.schemeName}`, description: `${r.schemeType} claim for '${itemLabel}' must be submitted by this date. Log in Grants & Funding.`, dueDate: toISO(r.claimDeadline)!, module: "Grants & Funding", href: "/grants", colour: "violet" });
  }

  tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  res.json({ tasks, days, rangeStart: now.toISOString(), rangeEnd: rangeEnd.toISOString() });
});

// ─── Public token validation (no auth required) ───────────────────────────────

const ACCESS_MODULE_QUERIES: Record<string, (farmId: number) => Promise<unknown>> = {
  spray_records: async (farmId) => db.select().from(sprayApplicationsTable).where(eq(sprayApplicationsTable.farmId, farmId)).orderBy(desc(sprayApplicationsTable.applicationDate)).limit(200),
  fields_crops: async (farmId) => db.select().from(fieldsTable).where(eq(fieldsTable.farmId, farmId)),
  soil_tests: async (farmId) => db.select().from(soilTestRecordsTable).where(eq(soilTestRecordsTable.farmId, farmId)).orderBy(desc(soilTestRecordsTable.sampleDate)).limit(100),
  equipment: async (farmId) => db.select().from(equipmentTable).where(eq(equipmentTable.farmId, farmId)),
  livestock: async (farmId) => db.select().from(herdFlockRegisterTable).where(eq(herdFlockRegisterTable.farmId, farmId)),
  medicines: async (farmId) => db.select().from(livestockMedicineRecordsTable).where(eq(livestockMedicineRecordsTable.farmId, farmId)).orderBy(desc(livestockMedicineRecordsTable.treatmentDate)).limit(200),
  movements: async (farmId) => db.select().from(livestockMovementsTable).where(eq(livestockMovementsTable.farmId, farmId)).orderBy(desc(livestockMovementsTable.movementDate)).limit(200),
  biosecurity: async (farmId) => ({
    visitors: await db.select().from(visitorContractorLogTable).where(eq(visitorContractorLogTable.farmId, farmId)).orderBy(desc(visitorContractorLogTable.arrivalTime)).limit(100),
    pestControl: await db.select().from(pestControlRecordsTable).where(eq(pestControlRecordsTable.farmId, farmId)).orderBy(desc(pestControlRecordsTable.treatmentDate)).limit(100),
    biosecurityPlan: await db.select().from(biosecurityPlansTable).where(eq(biosecurityPlansTable.farmId, farmId)).limit(1),
  }),
  staff_training: async (farmId) => ({
    trainingRecords: await db.select().from(staffTrainingRecordsTable).where(eq(staffTrainingRecordsTable.farmId, farmId)).orderBy(desc(staffTrainingRecordsTable.trainingDate)).limit(200),
    certificates: await db.select().from(staffCertificatesTable).where(eq(staffCertificatesTable.farmId, farmId)).limit(200),
  }),
  inspections: async (farmId) => ({
    inspections: await db.select().from(inspectionRecordsTable).where(eq(inspectionRecordsTable.farmId, farmId)).orderBy(desc(inspectionRecordsTable.inspectionDate)).limit(100),
    nonconformances: await db.select().from(nonconformanceRecordsTable).where(eq(nonconformanceRecordsTable.farmId, farmId)).orderBy(desc(nonconformanceRecordsTable.identifiedDate)).limit(100),
  }),
  nvz: async (farmId) => ({
    applications: await db.select().from(nvzFertiliserApplicationsTable).where(eq(nvzFertiliserApplicationsTable.farmId, farmId)).orderBy(desc(nvzFertiliserApplicationsTable.applicationDate)).limit(200),
    riskAssessments: await db.select().from(nvzRiskAssessmentsTable).where(eq(nvzRiskAssessmentsTable.farmId, farmId)).orderBy(desc(nvzRiskAssessmentsTable.assessmentDate)).limit(50),
  }),
  risk_assessments: async (farmId) => ({
    riskAssessments: await db.select().from(riskAssessmentsTable).where(eq(riskAssessmentsTable.farmId, farmId)).orderBy(desc(riskAssessmentsTable.assessmentDate)).limit(100),
    coshh: await db.select().from(coshhRecordsTable).where(eq(coshhRecordsTable.farmId, farmId)).limit(100),
  }),
  environmental: async (farmId) => db.select().from(environmentalFeaturesTable).where(eq(environmentalFeaturesTable.farmId, farmId)).limit(100),
  harvest: async (farmId) => db.select().from(harvestRecordsTable).where(eq(harvestRecordsTable.farmId, farmId)).orderBy(desc(harvestRecordsTable.harvestDate)).limit(200),
  workshop: async (farmId) => ({
    jobCards: await db.select({ job: workshopJobsTable, equipmentName: equipmentTable.name }).from(workshopJobsTable).leftJoin(equipmentTable, eq(workshopJobsTable.equipmentId, equipmentTable.id)).where(eq(workshopJobsTable.farmId, farmId)).orderBy(desc(workshopJobsTable.createdAt)).limit(100),
    patTests: await db.select().from(workshopPatTestsTable).where(eq(workshopPatTestsTable.farmId, farmId)).orderBy(desc(workshopPatTestsTable.testDate)).limit(100),
    fireExtinguishers: await db.select().from(workshopFireExtinguishersTable).where(eq(workshopFireExtinguishersTable.farmId, farmId)).orderBy(workshopFireExtinguishersTable.nextServiceDue).limit(100),
  }),
  pig_production: async (farmId) => ({
    flocks: await db.select().from(pigFlocksTable).where(eq(pigFlocksTable.farmId, farmId)).limit(100),
    movements: await db.select().from(pigMovementsTable).where(eq(pigMovementsTable.farmId, farmId)).orderBy(desc(pigMovementsTable.movementDate)).limit(100),
    fciDocuments: await db.select().from(pigFciDocumentsTable).where(eq(pigFciDocumentsTable.farmId, farmId)).orderBy(desc(pigFciDocumentsTable.documentDate)).limit(100),
    stockmanshipChecks: await db.select().from(pigStockmanshipChecksTable).where(eq(pigStockmanshipChecksTable.farmId, farmId)).orderBy(desc(pigStockmanshipChecksTable.checkDate)).limit(50),
  }),
  poultry_production: async (farmId) => ({
    houses: await db.select().from(poultryHousesTable).where(eq(poultryHousesTable.farmId, farmId)).limit(50),
    flocks: await db.select().from(poultryFlocksTable).where(eq(poultryFlocksTable.farmId, farmId)).orderBy(desc(poultryFlocksTable.placementDate)).limit(100),
    treatments: await db.select().from(poultryTreatmentsTable).where(eq(poultryTreatmentsTable.farmId, farmId)).orderBy(desc(poultryTreatmentsTable.treatmentDate)).limit(100),
    fciDocuments: await db.select().from(poultryFciDocumentsTable).where(eq(poultryFciDocumentsTable.farmId, farmId)).orderBy(desc(poultryFciDocumentsTable.documentDate)).limit(100),
  }),
  horticulture: async (farmId) => ({
    blocks: await db.select().from(horticultureBlocksTable).where(eq(horticultureBlocksTable.farmId, farmId)).limit(100),
    crops: await db.select().from(horticultureCropsTable).where(eq(horticultureCropsTable.farmId, farmId)).limit(100),
    waterTests: await db.select().from(horticultureWaterTestsTable).where(eq(horticultureWaterTestsTable.farmId, farmId)).orderBy(desc(horticultureWaterTestsTable.testDate)).limit(50),
    harvestRecords: await db.select().from(horticultureHarvestRecordsTable).where(eq(horticultureHarvestRecordsTable.farmId, farmId)).orderBy(desc(horticultureHarvestRecordsTable.harvestDate)).limit(100),
  }),
  carbon_sustainability: async (farmId) => ({
    audits: await db.select().from(carbonAuditsTable).where(eq(carbonAuditsTable.farmId, farmId)).orderBy(desc(carbonAuditsTable.auditYear)).limit(10),
    reductionActions: await db.select().from(carbonReductionActionsTable).where(eq(carbonReductionActionsTable.farmId, farmId)).limit(50),
    sustainabilityReports: await db.select().from(sustainabilityReportsTable).where(eq(sustainabilityReportsTable.farmId, farmId)).orderBy(desc(sustainabilityReportsTable.reportYear)).limit(20),
  }),
  farm_diversification: async (farmId) => ({
    activities: await db.select().from(diversificationActivitiesTable).where(eq(diversificationActivitiesTable.farmId, farmId)).limit(50),
    farmShopProducts: await db.select().from(farmShopProductsTable).where(eq(farmShopProductsTable.farmId, farmId)).limit(100),
    equine: await db.select().from(equineRecordsTable).where(eq(equineRecordsTable.farmId, farmId)).limit(100),
    renewableInstallations: await db.select().from(renewableEnergyInstallationsTable).where(eq(renewableEnergyInstallationsTable.farmId, farmId)).limit(50),
  }),
  water_irrigation: async (farmId) => ({
    licences: await db.select().from(waterAbstractionLicencesTable).where(eq(waterAbstractionLicencesTable.farmId, farmId)).limit(20),
    meterReadings: await db.select().from(waterMeterReadingsTable).where(eq(waterMeterReadingsTable.farmId, farmId)).orderBy(desc(waterMeterReadingsTable.readingDate)).limit(100),
    irrigationRecords: await db.select().from(irrigationRecordsTable).where(eq(irrigationRecordsTable.farmId, farmId)).orderBy(desc(irrigationRecordsTable.irrigationDate)).limit(100),
  }),
};

router.get("/access-token/:token", async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;

  // Try advisor token first
  const [advisor] = await db.select().from(farmAdvisorsTable).where(eq(farmAdvisorsTable.token, token)).limit(1);
  let farmId: number | null = null;
  let sessionType: "advisor" | "inspection" | null = null;
  let sessionId: number | null = null;
  let accessorName: string | null = null;
  let accessorEmail: string | null = null;
  let accessorOrganisation: string | null = null;
  let moduleAccess: string[] = [];
  let expiresAt: Date | null = null;

  if (advisor) {
    if (advisor.status === "revoked") { res.status(403).json({ error: "Access has been revoked" }); return; }
    farmId = advisor.farmId;
    sessionType = "advisor";
    sessionId = advisor.id;
    accessorName = advisor.advisorName;
    accessorEmail = advisor.advisorEmail;
    moduleAccess = advisor.moduleAccess as string[];
    await db.update(farmAdvisorsTable).set({ lastAccessAt: new Date(), status: "active" }).where(eq(farmAdvisorsTable.id, advisor.id));
  } else {
    // Try inspection session
    const [session] = await db.select().from(farmInspectionSessionsTable).where(eq(farmInspectionSessionsTable.token, token)).limit(1);
    if (!session) { res.status(404).json({ error: "Access token not found or expired" }); return; }
    if (session.revokedAt) { res.status(403).json({ error: "Access has been revoked" }); return; }
    if (new Date() > session.expiresAt) { res.status(403).json({ error: "Access has expired" }); return; }
    farmId = session.farmId;
    sessionType = "inspection";
    sessionId = session.id;
    accessorName = session.accessorName;
    accessorEmail = session.accessorEmail ?? null;
    accessorOrganisation = session.accessorOrganisation ?? null;
    moduleAccess = session.moduleAccess as string[];
    expiresAt = session.expiresAt;
    await db.update(farmInspectionSessionsTable).set({ lastAccessAt: new Date(), accessCount: sql`${farmInspectionSessionsTable.accessCount} + 1` }).where(eq(farmInspectionSessionsTable.id, session.id));
  }

  // Log this access
  await db.insert(externalAccessLogTable).values({
    farmId: farmId!,
    sessionType: sessionType!,
    sessionId: sessionId!,
    accessorEmail,
    accessorName,
    pageAccessed: "compliance_view",
  });

  // Fetch farm details
  const [farm] = await db.select().from(farmsTable).where(eq(farmsTable.id, farmId!)).limit(1);

  // Fetch data for each permitted module
  const data: Record<string, unknown> = {};
  for (const mod of moduleAccess) {
    if (ACCESS_MODULE_QUERIES[mod]) {
      try {
        data[mod] = await ACCESS_MODULE_QUERIES[mod](farmId!);
      } catch {
        data[mod] = [];
      }
    }
  }

  res.json({
    valid: true,
    sessionType,
    farm: {
      name: farm?.name,
      cphNumber: farm?.cphNumber,
      address: farm?.address,
      postcode: farm?.postcode,
      sbiNumber: farm?.sbiNumber,
      redTractorId: farm?.redTractorId,
      farmManager: farm?.farmManager,
    },
    accessor: {
      name: accessorName,
      email: accessorEmail,
      organisation: accessorOrganisation,
      expiresAt,
    },
    permittedModules: moduleAccess,
    data,
  });
});

// ── Business Reports ──────────────────────────────────────────────────────────

router.get("/:farmId/reports/gross-margin", requireAuth, requireModuleByKey("business-reports", "read"), async (req, res): Promise<void> => {
  const farmId = parseInt(req.params.farmId);
  const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
  const startDate = new Date(`${year}-01-01T00:00:00Z`);
  const endDate = new Date(`${year + 1}-01-01T00:00:00Z`);

  const harvests = await db
    .select({
      id: harvestRecordsTable.id,
      harvestDate: harvestRecordsTable.harvestDate,
      yieldTonnes: harvestRecordsTable.yieldTonnes,
      areaHarvestedHa: harvestRecordsTable.areaHarvestedHa,
      moisturePercent: harvestRecordsTable.moisturePercent,
      cropName: cropsTable.name,
      variety: cropsTable.variety,
      fieldId: fieldCropAssignmentsTable.fieldId,
    })
    .from(harvestRecordsTable)
    .innerJoin(fieldCropAssignmentsTable, eq(harvestRecordsTable.fieldCropAssignmentId, fieldCropAssignmentsTable.id))
    .innerJoin(cropsTable, eq(fieldCropAssignmentsTable.cropId, cropsTable.id))
    .innerJoin(fieldsTable, eq(fieldCropAssignmentsTable.fieldId, fieldsTable.id))
    .where(and(eq(fieldsTable.farmId, farmId), gte(harvestRecordsTable.harvestDate, startDate), lt(harvestRecordsTable.harvestDate, endDate)));

  const costs = await db.select().from(financialTransactionsTable).where(
    and(eq(financialTransactionsTable.farmId, farmId), gte(financialTransactionsTable.transactionDate, startDate), lt(financialTransactionsTable.transactionDate, endDate))
  );

  res.json({ harvests, costs, year });
});

router.get("/:farmId/reports/grain-position", requireAuth, requireModuleByKey("business-reports", "read"), async (req, res): Promise<void> => {
  const farmId = parseInt(req.params.farmId);
  const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
  const startDate = new Date(`${year}-01-01T00:00:00Z`);
  const endDate = new Date(`${year + 1}-01-01T00:00:00Z`);

  const harvests = await db
    .select({
      id: harvestRecordsTable.id,
      harvestDate: harvestRecordsTable.harvestDate,
      yieldTonnes: harvestRecordsTable.yieldTonnes,
      areaHarvestedHa: harvestRecordsTable.areaHarvestedHa,
      cropName: cropsTable.name,
      variety: cropsTable.variety,
    })
    .from(harvestRecordsTable)
    .innerJoin(fieldCropAssignmentsTable, eq(harvestRecordsTable.fieldCropAssignmentId, fieldCropAssignmentsTable.id))
    .innerJoin(cropsTable, eq(fieldCropAssignmentsTable.cropId, cropsTable.id))
    .innerJoin(fieldsTable, eq(fieldCropAssignmentsTable.fieldId, fieldsTable.id))
    .where(and(eq(fieldsTable.farmId, farmId), gte(harvestRecordsTable.harvestDate, startDate), lt(harvestRecordsTable.harvestDate, endDate)));

  const haulage = await db.select().from(haulageRecordsTable).where(
    and(eq(haulageRecordsTable.farmId, farmId), gte(haulageRecordsTable.departureDate, startDate), lt(haulageRecordsTable.departureDate, endDate))
  );

  const cropStorage = await db.select().from(cropStorageRecordsTable).where(eq(cropStorageRecordsTable.farmId, farmId));

  const cropSalesTransactions = await db.select().from(financialTransactionsTable).where(
    and(
      eq(financialTransactionsTable.farmId, farmId),
      eq(financialTransactionsTable.transactionType, "income"),
      gte(financialTransactionsTable.transactionDate, startDate),
      lt(financialTransactionsTable.transactionDate, endDate)
    )
  );

  res.json({ harvests, haulage, cropStorage, cropSalesTransactions, year });
});

router.get("/:farmId/reports/subsidies", requireAuth, requireModuleByKey("business-reports", "read"), async (req, res): Promise<void> => {
  const farmId = parseInt(req.params.farmId);
  const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
  const startDate = new Date(`${year}-01-01T00:00:00Z`);
  const endDate = new Date(`${year + 1}-01-01T00:00:00Z`);

  const schemes = await db.select().from(agriEnvironmentSchemeRecordsTable).where(eq(agriEnvironmentSchemeRecordsTable.farmId, farmId));

  const subsidyTransactions = await db.select().from(financialTransactionsTable).where(
    and(
      eq(financialTransactionsTable.farmId, farmId),
      eq(financialTransactionsTable.transactionType, "income"),
      gte(financialTransactionsTable.transactionDate, startDate),
      lt(financialTransactionsTable.transactionDate, endDate)
    )
  );

  res.json({ schemes, subsidyTransactions, year });
});

router.get("/:farmId/reports/year-on-year", requireAuth, requireModuleByKey("business-reports", "read"), async (req, res): Promise<void> => {
  const farmId = parseInt(req.params.farmId);

  const allHarvests = await db
    .select({
      harvestDate: harvestRecordsTable.harvestDate,
      yieldTonnes: harvestRecordsTable.yieldTonnes,
      areaHarvestedHa: harvestRecordsTable.areaHarvestedHa,
      cropName: cropsTable.name,
    })
    .from(harvestRecordsTable)
    .innerJoin(fieldCropAssignmentsTable, eq(harvestRecordsTable.fieldCropAssignmentId, fieldCropAssignmentsTable.id))
    .innerJoin(cropsTable, eq(fieldCropAssignmentsTable.cropId, cropsTable.id))
    .innerJoin(fieldsTable, eq(fieldCropAssignmentsTable.fieldId, fieldsTable.id))
    .where(eq(fieldsTable.farmId, farmId));

  const allTransactions = await db.select().from(financialTransactionsTable).where(eq(financialTransactionsTable.farmId, farmId));

  res.json({ harvests: allHarvests, transactions: allTransactions });
});

router.get("/:farmId/reports/assets", requireAuth, requireModuleByKey("business-reports", "read"), async (req, res): Promise<void> => {
  const farmId = parseInt(req.params.farmId);

  const equipment = await db.select().from(equipmentTable).where(and(eq(equipmentTable.farmId, farmId), eq(equipmentTable.isActive, true)));

  const maintenanceCosts = await db.select().from(equipmentMaintenanceLogsTable)
    .where(sql`equipment_id IN (SELECT id FROM equipment WHERE farm_id = ${farmId})`);

  res.json({ equipment, maintenanceCosts });
});

// ─── Workshop & Asset Management ───────────────────────────────────────────────

router.get("/farms/:farmId/equipment/by-asset/:assetNumber", requireAuth, requireTenant, requireModuleByKey("workshop-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = parseInt(req.params.farmId);
  const { assetNumber } = req.params;
  const [equip] = await db.select().from(equipmentTable).where(and(eq(equipmentTable.farmId, farmId), eq(equipmentTable.assetNumber, assetNumber))).limit(1);
  if (!equip) { res.status(404).json({ error: "Asset not found" }); return; }
  res.json(equip);
});

router.get("/farms/:farmId/workshop/jobs", requireAuth, requireTenant, requireModuleByKey("workshop-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = parseInt(req.params.farmId);
  const jobs = await db
    .select({ job: workshopJobsTable, equipmentName: equipmentTable.name, assetNumber: equipmentTable.assetNumber })
    .from(workshopJobsTable)
    .leftJoin(equipmentTable, eq(workshopJobsTable.equipmentId, equipmentTable.id))
    .where(eq(workshopJobsTable.farmId, farmId))
    .orderBy(desc(workshopJobsTable.createdAt));
  res.json({ jobs });
});

router.post("/farms/:farmId/workshop/jobs", requireAuth, requireTenant, requireModuleByKey("workshop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = parseInt(req.params.farmId);
  const count = await db.select({ c: sql<number>`count(*)` }).from(workshopJobsTable).where(eq(workshopJobsTable.farmId, farmId));
  const jobNumber = `JOB-${String(Number(count[0].c) + 1).padStart(4, "0")}`;
  const [record] = await db.insert(workshopJobsTable).values({ ...req.body, farmId, jobNumber }).returning();
  res.json(record);
});

router.put("/farms/:farmId/workshop/jobs/:id", requireAuth, requireTenant, requireModuleByKey("workshop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = parseInt(req.params.farmId);
  const id = parseInt(req.params.id);
  const { id: _id, farmId: _f, jobNumber: _jn, createdAt: _c, ...rest } = req.body;
  const [record] = await db.update(workshopJobsTable).set(rest).where(and(eq(workshopJobsTable.id, id), eq(workshopJobsTable.farmId, farmId))).returning();
  res.json(record);
});

router.delete("/farms/:farmId/workshop/jobs/:id", requireAuth, requireTenant, requireModuleByKey("workshop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = parseInt(req.params.farmId);
  const id = parseInt(req.params.id);
  await db.delete(workshopJobsTable).where(and(eq(workshopJobsTable.id, id), eq(workshopJobsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/workshop/schedule", requireAuth, requireTenant, requireModuleByKey("workshop-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = parseInt(req.params.farmId);
  const services = await db
    .select({ log: equipmentMaintenanceLogsTable, equipmentName: equipmentTable.name, assetNumber: equipmentTable.assetNumber, equipmentType: equipmentTable.type })
    .from(equipmentMaintenanceLogsTable)
    .innerJoin(equipmentTable, eq(equipmentMaintenanceLogsTable.equipmentId, equipmentTable.id))
    .where(and(eq(equipmentTable.farmId, farmId), isNotNull(equipmentMaintenanceLogsTable.nextDueDate)))
    .orderBy(equipmentMaintenanceLogsTable.nextDueDate);
  res.json({ services });
});

// ─── Workshop PAT Testing ──────────────────────────────────────────────────────
router.get("/farms/:farmId/workshop/pat-tests", requireAuth, requireTenant, requireModuleByKey("workshop-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(workshopPatTestsTable).where(eq(workshopPatTestsTable.farmId, farmId)).orderBy(desc(workshopPatTestsTable.testDate));
  res.json({ records });
});

router.post("/farms/:farmId/workshop/pat-tests", requireAuth, requireTenant, requireModuleByKey("workshop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(workshopPatTestsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/workshop/pat-tests/:id", requireAuth, requireTenant, requireModuleByKey("workshop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(workshopPatTestsTable).set(req.body).where(and(eq(workshopPatTestsTable.id, id), eq(workshopPatTestsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/workshop/pat-tests/:id", requireAuth, requireTenant, requireModuleByKey("workshop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(workshopPatTestsTable).where(and(eq(workshopPatTestsTable.id, id), eq(workshopPatTestsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Workshop Fire Extinguishers ───────────────────────────────────────────────
router.get("/farms/:farmId/workshop/fire-extinguishers", requireAuth, requireTenant, requireModuleByKey("workshop-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(workshopFireExtinguishersTable).where(eq(workshopFireExtinguishersTable.farmId, farmId)).orderBy(workshopFireExtinguishersTable.nextServiceDue);
  res.json({ records });
});

router.post("/farms/:farmId/workshop/fire-extinguishers", requireAuth, requireTenant, requireModuleByKey("workshop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(workshopFireExtinguishersTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/workshop/fire-extinguishers/:id", requireAuth, requireTenant, requireModuleByKey("workshop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(workshopFireExtinguishersTable).set(req.body).where(and(eq(workshopFireExtinguishersTable.id, id), eq(workshopFireExtinguishersTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/workshop/fire-extinguishers/:id", requireAuth, requireTenant, requireModuleByKey("workshop-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(workshopFireExtinguishersTable).where(and(eq(workshopFireExtinguishersTable.id, id), eq(workshopFireExtinguishersTable.farmId, farmId)));
  res.json({ success: true });
});

// ============================================================
// PIG PRODUCTION
// ============================================================
router.get("/farms/:farmId/pig-flocks", requireAuth, requireTenant, requireModuleByKey("pig-production", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(pigFlocksTable).where(eq(pigFlocksTable.farmId, farmId)).orderBy(pigFlocksTable.flockName);
  res.json(rows);
});
router.post("/farms/:farmId/pig-flocks", requireAuth, requireTenant, requireModuleByKey("pig-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(pigFlocksTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/pig-flocks/:id", requireAuth, requireTenant, requireModuleByKey("pig-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(pigFlocksTable).set(req.body).where(and(eq(pigFlocksTable.id, id), eq(pigFlocksTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/pig-flocks/:id", requireAuth, requireTenant, requireModuleByKey("pig-production", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(pigFlocksTable).where(and(eq(pigFlocksTable.id, id), eq(pigFlocksTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/pig-movements", requireAuth, requireTenant, requireModuleByKey("pig-production", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(pigMovementsTable).where(eq(pigMovementsTable.farmId, farmId)).orderBy(desc(pigMovementsTable.movementDate));
  res.json(rows);
});
router.post("/farms/:farmId/pig-movements", requireAuth, requireTenant, requireModuleByKey("pig-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(pigMovementsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/pig-movements/:id", requireAuth, requireTenant, requireModuleByKey("pig-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(pigMovementsTable).set(req.body).where(and(eq(pigMovementsTable.id, id), eq(pigMovementsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/pig-movements/:id", requireAuth, requireTenant, requireModuleByKey("pig-production", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(pigMovementsTable).where(and(eq(pigMovementsTable.id, id), eq(pigMovementsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/pig-fci-documents", requireAuth, requireTenant, requireModuleByKey("pig-production", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(pigFciDocumentsTable).where(eq(pigFciDocumentsTable.farmId, farmId)).orderBy(desc(pigFciDocumentsTable.documentDate));
  res.json(rows);
});
router.post("/farms/:farmId/pig-fci-documents", requireAuth, requireTenant, requireModuleByKey("pig-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(pigFciDocumentsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/pig-fci-documents/:id", requireAuth, requireTenant, requireModuleByKey("pig-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(pigFciDocumentsTable).set(req.body).where(and(eq(pigFciDocumentsTable.id, id), eq(pigFciDocumentsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/pig-fci-documents/:id", requireAuth, requireTenant, requireModuleByKey("pig-production", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(pigFciDocumentsTable).where(and(eq(pigFciDocumentsTable.id, id), eq(pigFciDocumentsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/pig-feed-records", requireAuth, requireTenant, requireModuleByKey("pig-production", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(pigFeedRecordsTable).where(eq(pigFeedRecordsTable.farmId, farmId)).orderBy(desc(pigFeedRecordsTable.deliveryDate));
  res.json(rows);
});
router.post("/farms/:farmId/pig-feed-records", requireAuth, requireTenant, requireModuleByKey("pig-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(pigFeedRecordsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/pig-feed-records/:id", requireAuth, requireTenant, requireModuleByKey("pig-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(pigFeedRecordsTable).set(req.body).where(and(eq(pigFeedRecordsTable.id, id), eq(pigFeedRecordsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/pig-feed-records/:id", requireAuth, requireTenant, requireModuleByKey("pig-production", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(pigFeedRecordsTable).where(and(eq(pigFeedRecordsTable.id, id), eq(pigFeedRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/pig-vet-assessments", requireAuth, requireTenant, requireModuleByKey("pig-production", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(pigVetAssessmentsTable).where(eq(pigVetAssessmentsTable.farmId, farmId)).orderBy(desc(pigVetAssessmentsTable.assessmentDate));
  res.json(rows);
});
router.post("/farms/:farmId/pig-vet-assessments", requireAuth, requireTenant, requireModuleByKey("pig-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(pigVetAssessmentsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/pig-vet-assessments/:id", requireAuth, requireTenant, requireModuleByKey("pig-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(pigVetAssessmentsTable).set(req.body).where(and(eq(pigVetAssessmentsTable.id, id), eq(pigVetAssessmentsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/pig-vet-assessments/:id", requireAuth, requireTenant, requireModuleByKey("pig-production", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(pigVetAssessmentsTable).where(and(eq(pigVetAssessmentsTable.id, id), eq(pigVetAssessmentsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/pig-stockmanship-checks", requireAuth, requireTenant, requireModuleByKey("pig-production", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(pigStockmanshipChecksTable).where(eq(pigStockmanshipChecksTable.farmId, farmId)).orderBy(desc(pigStockmanshipChecksTable.checkDate));
  res.json(rows);
});
router.post("/farms/:farmId/pig-stockmanship-checks", requireAuth, requireTenant, requireModuleByKey("pig-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(pigStockmanshipChecksTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/pig-stockmanship-checks/:id", requireAuth, requireTenant, requireModuleByKey("pig-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(pigStockmanshipChecksTable).set(req.body).where(and(eq(pigStockmanshipChecksTable.id, id), eq(pigStockmanshipChecksTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/pig-stockmanship-checks/:id", requireAuth, requireTenant, requireModuleByKey("pig-production", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(pigStockmanshipChecksTable).where(and(eq(pigStockmanshipChecksTable.id, id), eq(pigStockmanshipChecksTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/pig-tail-biting-risks", requireAuth, requireTenant, requireModuleByKey("pig-production", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(pigTailBitingRisksTable).where(eq(pigTailBitingRisksTable.farmId, farmId)).orderBy(desc(pigTailBitingRisksTable.assessmentDate));
  res.json(rows);
});
router.post("/farms/:farmId/pig-tail-biting-risks", requireAuth, requireTenant, requireModuleByKey("pig-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(pigTailBitingRisksTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/pig-tail-biting-risks/:id", requireAuth, requireTenant, requireModuleByKey("pig-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(pigTailBitingRisksTable).set(req.body).where(and(eq(pigTailBitingRisksTable.id, id), eq(pigTailBitingRisksTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/pig-tail-biting-risks/:id", requireAuth, requireTenant, requireModuleByKey("pig-production", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(pigTailBitingRisksTable).where(and(eq(pigTailBitingRisksTable.id, id), eq(pigTailBitingRisksTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/pig-farrowing-records", requireAuth, requireTenant, requireModuleByKey("pig-production", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(pigFarrowingRecordsTable).where(eq(pigFarrowingRecordsTable.farmId, farmId)).orderBy(desc(pigFarrowingRecordsTable.farrowingDate));
  res.json(rows);
});
router.post("/farms/:farmId/pig-farrowing-records", requireAuth, requireTenant, requireModuleByKey("pig-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(pigFarrowingRecordsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/pig-farrowing-records/:id", requireAuth, requireTenant, requireModuleByKey("pig-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(pigFarrowingRecordsTable).set(req.body).where(and(eq(pigFarrowingRecordsTable.id, id), eq(pigFarrowingRecordsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/pig-farrowing-records/:id", requireAuth, requireTenant, requireModuleByKey("pig-production", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(pigFarrowingRecordsTable).where(and(eq(pigFarrowingRecordsTable.id, id), eq(pigFarrowingRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

// ============================================================
// POULTRY PRODUCTION
// ============================================================
router.get("/farms/:farmId/poultry-houses", requireAuth, requireTenant, requireModuleByKey("poultry-production", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(poultryHousesTable).where(eq(poultryHousesTable.farmId, farmId)).orderBy(poultryHousesTable.houseName);
  res.json(rows);
});
router.post("/farms/:farmId/poultry-houses", requireAuth, requireTenant, requireModuleByKey("poultry-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(poultryHousesTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/poultry-houses/:id", requireAuth, requireTenant, requireModuleByKey("poultry-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(poultryHousesTable).set(req.body).where(and(eq(poultryHousesTable.id, id), eq(poultryHousesTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/poultry-houses/:id", requireAuth, requireTenant, requireModuleByKey("poultry-production", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(poultryHousesTable).where(and(eq(poultryHousesTable.id, id), eq(poultryHousesTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/poultry-flocks", requireAuth, requireTenant, requireModuleByKey("poultry-production", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select({ flock: poultryFlocksTable, houseName: poultryHousesTable.houseName }).from(poultryFlocksTable).leftJoin(poultryHousesTable, eq(poultryFlocksTable.houseId, poultryHousesTable.id)).where(eq(poultryFlocksTable.farmId, farmId)).orderBy(desc(poultryFlocksTable.placementDate));
  res.json(rows);
});
router.post("/farms/:farmId/poultry-flocks", requireAuth, requireTenant, requireModuleByKey("poultry-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(poultryFlocksTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/poultry-flocks/:id", requireAuth, requireTenant, requireModuleByKey("poultry-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(poultryFlocksTable).set(req.body).where(and(eq(poultryFlocksTable.id, id), eq(poultryFlocksTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/poultry-flocks/:id", requireAuth, requireTenant, requireModuleByKey("poultry-production", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(poultryFlocksTable).where(and(eq(poultryFlocksTable.id, id), eq(poultryFlocksTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/poultry-daily-mortality", requireAuth, requireTenant, requireModuleByKey("poultry-production", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(poultryDailyMortalityTable).where(eq(poultryDailyMortalityTable.farmId, farmId)).orderBy(desc(poultryDailyMortalityTable.recordDate));
  res.json(rows);
});
router.post("/farms/:farmId/poultry-daily-mortality", requireAuth, requireTenant, requireModuleByKey("poultry-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(poultryDailyMortalityTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/poultry-daily-mortality/:id", requireAuth, requireTenant, requireModuleByKey("poultry-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(poultryDailyMortalityTable).set(req.body).where(and(eq(poultryDailyMortalityTable.id, id), eq(poultryDailyMortalityTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/poultry-daily-mortality/:id", requireAuth, requireTenant, requireModuleByKey("poultry-production", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(poultryDailyMortalityTable).where(and(eq(poultryDailyMortalityTable.id, id), eq(poultryDailyMortalityTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/poultry-treatments", requireAuth, requireTenant, requireModuleByKey("poultry-production", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(poultryTreatmentsTable).where(eq(poultryTreatmentsTable.farmId, farmId)).orderBy(desc(poultryTreatmentsTable.treatmentDate));
  res.json(rows);
});
router.post("/farms/:farmId/poultry-treatments", requireAuth, requireTenant, requireModuleByKey("poultry-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(poultryTreatmentsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/poultry-treatments/:id", requireAuth, requireTenant, requireModuleByKey("poultry-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(poultryTreatmentsTable).set(req.body).where(and(eq(poultryTreatmentsTable.id, id), eq(poultryTreatmentsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/poultry-treatments/:id", requireAuth, requireTenant, requireModuleByKey("poultry-production", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(poultryTreatmentsTable).where(and(eq(poultryTreatmentsTable.id, id), eq(poultryTreatmentsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/poultry-house-cleanouts", requireAuth, requireTenant, requireModuleByKey("poultry-production", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(poultryHouseCleanoutsTable).where(eq(poultryHouseCleanoutsTable.farmId, farmId)).orderBy(desc(poultryHouseCleanoutsTable.cleanoutStartDate));
  res.json(rows);
});
router.post("/farms/:farmId/poultry-house-cleanouts", requireAuth, requireTenant, requireModuleByKey("poultry-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(poultryHouseCleanoutsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/poultry-house-cleanouts/:id", requireAuth, requireTenant, requireModuleByKey("poultry-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(poultryHouseCleanoutsTable).set(req.body).where(and(eq(poultryHouseCleanoutsTable.id, id), eq(poultryHouseCleanoutsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/poultry-house-cleanouts/:id", requireAuth, requireTenant, requireModuleByKey("poultry-production", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(poultryHouseCleanoutsTable).where(and(eq(poultryHouseCleanoutsTable.id, id), eq(poultryHouseCleanoutsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/poultry-environmental-logs", requireAuth, requireTenant, requireModuleByKey("poultry-production", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(poultryEnvironmentalLogsTable).where(eq(poultryEnvironmentalLogsTable.farmId, farmId)).orderBy(desc(poultryEnvironmentalLogsTable.logDate));
  res.json(rows);
});
router.post("/farms/:farmId/poultry-environmental-logs", requireAuth, requireTenant, requireModuleByKey("poultry-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(poultryEnvironmentalLogsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/poultry-environmental-logs/:id", requireAuth, requireTenant, requireModuleByKey("poultry-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(poultryEnvironmentalLogsTable).set(req.body).where(and(eq(poultryEnvironmentalLogsTable.id, id), eq(poultryEnvironmentalLogsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/poultry-environmental-logs/:id", requireAuth, requireTenant, requireModuleByKey("poultry-production", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(poultryEnvironmentalLogsTable).where(and(eq(poultryEnvironmentalLogsTable.id, id), eq(poultryEnvironmentalLogsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/poultry-fci-documents", requireAuth, requireTenant, requireModuleByKey("poultry-production", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(poultryFciDocumentsTable).where(eq(poultryFciDocumentsTable.farmId, farmId)).orderBy(desc(poultryFciDocumentsTable.documentDate));
  res.json(rows);
});
router.post("/farms/:farmId/poultry-fci-documents", requireAuth, requireTenant, requireModuleByKey("poultry-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(poultryFciDocumentsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/poultry-fci-documents/:id", requireAuth, requireTenant, requireModuleByKey("poultry-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(poultryFciDocumentsTable).set(req.body).where(and(eq(poultryFciDocumentsTable.id, id), eq(poultryFciDocumentsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/poultry-fci-documents/:id", requireAuth, requireTenant, requireModuleByKey("poultry-production", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(poultryFciDocumentsTable).where(and(eq(poultryFciDocumentsTable.id, id), eq(poultryFciDocumentsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/poultry-broiler-welfare", requireAuth, requireTenant, requireModuleByKey("poultry-production", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(poultryBroilerWelfareTable).where(eq(poultryBroilerWelfareTable.farmId, farmId)).orderBy(desc(poultryBroilerWelfareTable.assessmentDate));
  res.json(rows);
});
router.post("/farms/:farmId/poultry-broiler-welfare", requireAuth, requireTenant, requireModuleByKey("poultry-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(poultryBroilerWelfareTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/poultry-broiler-welfare/:id", requireAuth, requireTenant, requireModuleByKey("poultry-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(poultryBroilerWelfareTable).set(req.body).where(and(eq(poultryBroilerWelfareTable.id, id), eq(poultryBroilerWelfareTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/poultry-broiler-welfare/:id", requireAuth, requireTenant, requireModuleByKey("poultry-production", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(poultryBroilerWelfareTable).where(and(eq(poultryBroilerWelfareTable.id, id), eq(poultryBroilerWelfareTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/poultry-thinning-records", requireAuth, requireTenant, requireModuleByKey("poultry-production", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(poultryThinningRecordsTable).where(eq(poultryThinningRecordsTable.farmId, farmId)).orderBy(desc(poultryThinningRecordsTable.thinningDate));
  res.json(rows);
});
router.post("/farms/:farmId/poultry-thinning-records", requireAuth, requireTenant, requireModuleByKey("poultry-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(poultryThinningRecordsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/poultry-thinning-records/:id", requireAuth, requireTenant, requireModuleByKey("poultry-production", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(poultryThinningRecordsTable).set(req.body).where(and(eq(poultryThinningRecordsTable.id, id), eq(poultryThinningRecordsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/poultry-thinning-records/:id", requireAuth, requireTenant, requireModuleByKey("poultry-production", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(poultryThinningRecordsTable).where(and(eq(poultryThinningRecordsTable.id, id), eq(poultryThinningRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

// ============================================================
// HORTICULTURE & FRESH PRODUCE
// ============================================================
router.get("/farms/:farmId/horticulture-blocks", requireAuth, requireTenant, requireModuleByKey("horticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(horticultureBlocksTable).where(eq(horticultureBlocksTable.farmId, farmId)).orderBy(horticultureBlocksTable.blockName);
  res.json(rows);
});
router.post("/farms/:farmId/horticulture-blocks", requireAuth, requireTenant, requireModuleByKey("horticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(horticultureBlocksTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/horticulture-blocks/:id", requireAuth, requireTenant, requireModuleByKey("horticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(horticultureBlocksTable).set(req.body).where(and(eq(horticultureBlocksTable.id, id), eq(horticultureBlocksTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/horticulture-blocks/:id", requireAuth, requireTenant, requireModuleByKey("horticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(horticultureBlocksTable).where(and(eq(horticultureBlocksTable.id, id), eq(horticultureBlocksTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/horticulture-crops", requireAuth, requireTenant, requireModuleByKey("horticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(horticultureCropsTable).where(eq(horticultureCropsTable.farmId, farmId)).orderBy(horticultureCropsTable.cropName);
  res.json(rows);
});
router.post("/farms/:farmId/horticulture-crops", requireAuth, requireTenant, requireModuleByKey("horticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(horticultureCropsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/horticulture-crops/:id", requireAuth, requireTenant, requireModuleByKey("horticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(horticultureCropsTable).set(req.body).where(and(eq(horticultureCropsTable.id, id), eq(horticultureCropsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/horticulture-crops/:id", requireAuth, requireTenant, requireModuleByKey("horticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(horticultureCropsTable).where(and(eq(horticultureCropsTable.id, id), eq(horticultureCropsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/horticulture-water-tests", requireAuth, requireTenant, requireModuleByKey("horticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(horticultureWaterTestsTable).where(eq(horticultureWaterTestsTable.farmId, farmId)).orderBy(desc(horticultureWaterTestsTable.testDate));
  res.json(rows);
});
router.post("/farms/:farmId/horticulture-water-tests", requireAuth, requireTenant, requireModuleByKey("horticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(horticultureWaterTestsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/horticulture-water-tests/:id", requireAuth, requireTenant, requireModuleByKey("horticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(horticultureWaterTestsTable).set(req.body).where(and(eq(horticultureWaterTestsTable.id, id), eq(horticultureWaterTestsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/horticulture-water-tests/:id", requireAuth, requireTenant, requireModuleByKey("horticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(horticultureWaterTestsTable).where(and(eq(horticultureWaterTestsTable.id, id), eq(horticultureWaterTestsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/horticulture-harvest-records", requireAuth, requireTenant, requireModuleByKey("horticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(horticultureHarvestRecordsTable).where(eq(horticultureHarvestRecordsTable.farmId, farmId)).orderBy(desc(horticultureHarvestRecordsTable.harvestDate));
  res.json(rows);
});
router.post("/farms/:farmId/horticulture-harvest-records", requireAuth, requireTenant, requireModuleByKey("horticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(horticultureHarvestRecordsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/horticulture-harvest-records/:id", requireAuth, requireTenant, requireModuleByKey("horticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(horticultureHarvestRecordsTable).set(req.body).where(and(eq(horticultureHarvestRecordsTable.id, id), eq(horticultureHarvestRecordsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/horticulture-harvest-records/:id", requireAuth, requireTenant, requireModuleByKey("horticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(horticultureHarvestRecordsTable).where(and(eq(horticultureHarvestRecordsTable.id, id), eq(horticultureHarvestRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/horticulture-packhouse-records", requireAuth, requireTenant, requireModuleByKey("horticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(horticulturePackhouseRecordsTable).where(eq(horticulturePackhouseRecordsTable.farmId, farmId)).orderBy(desc(horticulturePackhouseRecordsTable.packingDate));
  res.json(rows);
});
router.post("/farms/:farmId/horticulture-packhouse-records", requireAuth, requireTenant, requireModuleByKey("horticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(horticulturePackhouseRecordsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/horticulture-packhouse-records/:id", requireAuth, requireTenant, requireModuleByKey("horticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(horticulturePackhouseRecordsTable).set(req.body).where(and(eq(horticulturePackhouseRecordsTable.id, id), eq(horticulturePackhouseRecordsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/horticulture-packhouse-records/:id", requireAuth, requireTenant, requireModuleByKey("horticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(horticulturePackhouseRecordsTable).where(and(eq(horticulturePackhouseRecordsTable.id, id), eq(horticulturePackhouseRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/allergen-management", requireAuth, requireTenant, requireModuleByKey("horticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(allergenManagementRecordsTable).where(eq(allergenManagementRecordsTable.farmId, farmId)).orderBy(desc(allergenManagementRecordsTable.reviewDate));
  res.json(rows);
});
router.post("/farms/:farmId/allergen-management", requireAuth, requireTenant, requireModuleByKey("horticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(allergenManagementRecordsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/allergen-management/:id", requireAuth, requireTenant, requireModuleByKey("horticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(allergenManagementRecordsTable).set(req.body).where(and(eq(allergenManagementRecordsTable.id, id), eq(allergenManagementRecordsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/allergen-management/:id", requireAuth, requireTenant, requireModuleByKey("horticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(allergenManagementRecordsTable).where(and(eq(allergenManagementRecordsTable.id, id), eq(allergenManagementRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

// ============================================================
// CARBON & SUSTAINABILITY
// ============================================================
router.get("/farms/:farmId/carbon-audits", requireAuth, requireTenant, requireModuleByKey("carbon-sustainability", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(carbonAuditsTable).where(eq(carbonAuditsTable.farmId, farmId)).orderBy(desc(carbonAuditsTable.auditYear));
  res.json(rows);
});
router.post("/farms/:farmId/carbon-audits", requireAuth, requireTenant, requireModuleByKey("carbon-sustainability", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(carbonAuditsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/carbon-audits/:id", requireAuth, requireTenant, requireModuleByKey("carbon-sustainability", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(carbonAuditsTable).set(req.body).where(and(eq(carbonAuditsTable.id, id), eq(carbonAuditsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/carbon-audits/:id", requireAuth, requireTenant, requireModuleByKey("carbon-sustainability", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(carbonAuditsTable).where(and(eq(carbonAuditsTable.id, id), eq(carbonAuditsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/carbon-emissions", requireAuth, requireTenant, requireModuleByKey("carbon-sustainability", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(carbonEmissionsRecordsTable).where(eq(carbonEmissionsRecordsTable.farmId, farmId)).orderBy(desc(carbonEmissionsRecordsTable.emissionYear));
  res.json(rows);
});
router.post("/farms/:farmId/carbon-emissions", requireAuth, requireTenant, requireModuleByKey("carbon-sustainability", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(carbonEmissionsRecordsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/carbon-emissions/:id", requireAuth, requireTenant, requireModuleByKey("carbon-sustainability", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(carbonEmissionsRecordsTable).set(req.body).where(and(eq(carbonEmissionsRecordsTable.id, id), eq(carbonEmissionsRecordsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/carbon-emissions/:id", requireAuth, requireTenant, requireModuleByKey("carbon-sustainability", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(carbonEmissionsRecordsTable).where(and(eq(carbonEmissionsRecordsTable.id, id), eq(carbonEmissionsRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/carbon-sequestration", requireAuth, requireTenant, requireModuleByKey("carbon-sustainability", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(carbonSequestrationTable).where(eq(carbonSequestrationTable.farmId, farmId)).orderBy(desc(carbonSequestrationTable.sequestrationYear));
  res.json(rows);
});
router.post("/farms/:farmId/carbon-sequestration", requireAuth, requireTenant, requireModuleByKey("carbon-sustainability", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(carbonSequestrationTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/carbon-sequestration/:id", requireAuth, requireTenant, requireModuleByKey("carbon-sustainability", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(carbonSequestrationTable).set(req.body).where(and(eq(carbonSequestrationTable.id, id), eq(carbonSequestrationTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/carbon-sequestration/:id", requireAuth, requireTenant, requireModuleByKey("carbon-sustainability", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(carbonSequestrationTable).where(and(eq(carbonSequestrationTable.id, id), eq(carbonSequestrationTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/carbon-reduction-actions", requireAuth, requireTenant, requireModuleByKey("carbon-sustainability", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(carbonReductionActionsTable).where(eq(carbonReductionActionsTable.farmId, farmId)).orderBy(desc(carbonReductionActionsTable.plannedStartDate));
  res.json(rows);
});
router.post("/farms/:farmId/carbon-reduction-actions", requireAuth, requireTenant, requireModuleByKey("carbon-sustainability", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(carbonReductionActionsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/carbon-reduction-actions/:id", requireAuth, requireTenant, requireModuleByKey("carbon-sustainability", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(carbonReductionActionsTable).set(req.body).where(and(eq(carbonReductionActionsTable.id, id), eq(carbonReductionActionsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/carbon-reduction-actions/:id", requireAuth, requireTenant, requireModuleByKey("carbon-sustainability", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(carbonReductionActionsTable).where(and(eq(carbonReductionActionsTable.id, id), eq(carbonReductionActionsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/sustainability-reports", requireAuth, requireTenant, requireModuleByKey("carbon-sustainability", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(sustainabilityReportsTable).where(eq(sustainabilityReportsTable.farmId, farmId)).orderBy(desc(sustainabilityReportsTable.reportYear));
  res.json(rows);
});
router.post("/farms/:farmId/sustainability-reports", requireAuth, requireTenant, requireModuleByKey("carbon-sustainability", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(sustainabilityReportsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/sustainability-reports/:id", requireAuth, requireTenant, requireModuleByKey("carbon-sustainability", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(sustainabilityReportsTable).set(req.body).where(and(eq(sustainabilityReportsTable.id, id), eq(sustainabilityReportsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/sustainability-reports/:id", requireAuth, requireTenant, requireModuleByKey("carbon-sustainability", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(sustainabilityReportsTable).where(and(eq(sustainabilityReportsTable.id, id), eq(sustainabilityReportsTable.farmId, farmId)));
  res.json({ success: true });
});

// ============================================================
// FARM DIVERSIFICATION
// ============================================================
router.get("/farms/:farmId/diversification-activities", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(diversificationActivitiesTable).where(eq(diversificationActivitiesTable.farmId, farmId)).orderBy(diversificationActivitiesTable.activityName);
  res.json(rows);
});
router.post("/farms/:farmId/diversification-activities", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(diversificationActivitiesTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/diversification-activities/:id", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(diversificationActivitiesTable).set(req.body).where(and(eq(diversificationActivitiesTable.id, id), eq(diversificationActivitiesTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/diversification-activities/:id", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(diversificationActivitiesTable).where(and(eq(diversificationActivitiesTable.id, id), eq(diversificationActivitiesTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/farm-shop-products", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(farmShopProductsTable).where(eq(farmShopProductsTable.farmId, farmId)).orderBy(farmShopProductsTable.productName);
  res.json(rows);
});
router.post("/farms/:farmId/farm-shop-products", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(farmShopProductsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/farm-shop-products/:id", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(farmShopProductsTable).set(req.body).where(and(eq(farmShopProductsTable.id, id), eq(farmShopProductsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/farm-shop-products/:id", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(farmShopProductsTable).where(and(eq(farmShopProductsTable.id, id), eq(farmShopProductsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/farm-shop-hygiene-inspections", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(farmShopHygieneInspectionsTable).where(eq(farmShopHygieneInspectionsTable.farmId, farmId)).orderBy(desc(farmShopHygieneInspectionsTable.inspectionDate));
  res.json(rows);
});
router.post("/farms/:farmId/farm-shop-hygiene-inspections", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(farmShopHygieneInspectionsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/farm-shop-hygiene-inspections/:id", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(farmShopHygieneInspectionsTable).set(req.body).where(and(eq(farmShopHygieneInspectionsTable.id, id), eq(farmShopHygieneInspectionsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/farm-shop-hygiene-inspections/:id", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(farmShopHygieneInspectionsTable).where(and(eq(farmShopHygieneInspectionsTable.id, id), eq(farmShopHygieneInspectionsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/equine-records", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(equineRecordsTable).where(eq(equineRecordsTable.farmId, farmId)).orderBy(equineRecordsTable.horseName);
  res.json(rows);
});
router.post("/farms/:farmId/equine-records", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(equineRecordsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/equine-records/:id", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(equineRecordsTable).set(req.body).where(and(eq(equineRecordsTable.id, id), eq(equineRecordsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/equine-records/:id", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(equineRecordsTable).where(and(eq(equineRecordsTable.id, id), eq(equineRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/equine-health-events", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(equineHealthEventsTable).where(eq(equineHealthEventsTable.farmId, farmId)).orderBy(desc(equineHealthEventsTable.eventDate));
  res.json(rows);
});
router.post("/farms/:farmId/equine-health-events", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(equineHealthEventsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/equine-health-events/:id", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(equineHealthEventsTable).set(req.body).where(and(eq(equineHealthEventsTable.id, id), eq(equineHealthEventsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/equine-health-events/:id", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(equineHealthEventsTable).where(and(eq(equineHealthEventsTable.id, id), eq(equineHealthEventsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/renewable-installations", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(renewableEnergyInstallationsTable).where(eq(renewableEnergyInstallationsTable.farmId, farmId)).orderBy(renewableEnergyInstallationsTable.installationName);
  res.json(rows);
});
router.post("/farms/:farmId/renewable-installations", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(renewableEnergyInstallationsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/renewable-installations/:id", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(renewableEnergyInstallationsTable).set(req.body).where(and(eq(renewableEnergyInstallationsTable.id, id), eq(renewableEnergyInstallationsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/renewable-installations/:id", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(renewableEnergyInstallationsTable).where(and(eq(renewableEnergyInstallationsTable.id, id), eq(renewableEnergyInstallationsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/renewable-meter-readings", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(renewableEnergyMeterReadingsTable).where(eq(renewableEnergyMeterReadingsTable.farmId, farmId)).orderBy(desc(renewableEnergyMeterReadingsTable.readingDate));
  res.json(rows);
});
router.post("/farms/:farmId/renewable-meter-readings", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(renewableEnergyMeterReadingsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/renewable-meter-readings/:id", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(renewableEnergyMeterReadingsTable).set(req.body).where(and(eq(renewableEnergyMeterReadingsTable.id, id), eq(renewableEnergyMeterReadingsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/renewable-meter-readings/:id", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(renewableEnergyMeterReadingsTable).where(and(eq(renewableEnergyMeterReadingsTable.id, id), eq(renewableEnergyMeterReadingsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/shooting-game-records", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(shootingAndGameRecordsTable).where(eq(shootingAndGameRecordsTable.farmId, farmId)).orderBy(desc(shootingAndGameRecordsTable.shootDate));
  res.json(rows);
});
router.post("/farms/:farmId/shooting-game-records", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(shootingAndGameRecordsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/shooting-game-records/:id", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(shootingAndGameRecordsTable).set(req.body).where(and(eq(shootingAndGameRecordsTable.id, id), eq(shootingAndGameRecordsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/shooting-game-records/:id", requireAuth, requireTenant, requireModuleByKey("farm-diversification", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(shootingAndGameRecordsTable).where(and(eq(shootingAndGameRecordsTable.id, id), eq(shootingAndGameRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

// ============================================================
// WATER & IRRIGATION MANAGEMENT
// ============================================================
router.get("/farms/:farmId/water-abstraction-licences", requireAuth, requireTenant, requireModuleByKey("water-irrigation", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(waterAbstractionLicencesTable).where(eq(waterAbstractionLicencesTable.farmId, farmId)).orderBy(waterAbstractionLicencesTable.licenceNumber);
  res.json(rows);
});
router.post("/farms/:farmId/water-abstraction-licences", requireAuth, requireTenant, requireModuleByKey("water-irrigation", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(waterAbstractionLicencesTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/water-abstraction-licences/:id", requireAuth, requireTenant, requireModuleByKey("water-irrigation", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(waterAbstractionLicencesTable).set(req.body).where(and(eq(waterAbstractionLicencesTable.id, id), eq(waterAbstractionLicencesTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/water-abstraction-licences/:id", requireAuth, requireTenant, requireModuleByKey("water-irrigation", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(waterAbstractionLicencesTable).where(and(eq(waterAbstractionLicencesTable.id, id), eq(waterAbstractionLicencesTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/water-meter-readings", requireAuth, requireTenant, requireModuleByKey("water-irrigation", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(waterMeterReadingsTable).where(eq(waterMeterReadingsTable.farmId, farmId)).orderBy(desc(waterMeterReadingsTable.readingDate));
  res.json(rows);
});
router.post("/farms/:farmId/water-meter-readings", requireAuth, requireTenant, requireModuleByKey("water-irrigation", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(waterMeterReadingsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/water-meter-readings/:id", requireAuth, requireTenant, requireModuleByKey("water-irrigation", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(waterMeterReadingsTable).set(req.body).where(and(eq(waterMeterReadingsTable.id, id), eq(waterMeterReadingsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/water-meter-readings/:id", requireAuth, requireTenant, requireModuleByKey("water-irrigation", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(waterMeterReadingsTable).where(and(eq(waterMeterReadingsTable.id, id), eq(waterMeterReadingsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/borehole-tests", requireAuth, requireTenant, requireModuleByKey("water-irrigation", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(boreholeTestsTable).where(eq(boreholeTestsTable.farmId, farmId)).orderBy(desc(boreholeTestsTable.testDate));
  res.json(rows);
});
router.post("/farms/:farmId/borehole-tests", requireAuth, requireTenant, requireModuleByKey("water-irrigation", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(boreholeTestsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/borehole-tests/:id", requireAuth, requireTenant, requireModuleByKey("water-irrigation", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(boreholeTestsTable).set(req.body).where(and(eq(boreholeTestsTable.id, id), eq(boreholeTestsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/borehole-tests/:id", requireAuth, requireTenant, requireModuleByKey("water-irrigation", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(boreholeTestsTable).where(and(eq(boreholeTestsTable.id, id), eq(boreholeTestsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/irrigation-records", requireAuth, requireTenant, requireModuleByKey("water-irrigation", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(irrigationRecordsTable).where(eq(irrigationRecordsTable.farmId, farmId)).orderBy(desc(irrigationRecordsTable.irrigationDate));
  res.json(rows);
});
router.post("/farms/:farmId/irrigation-records", requireAuth, requireTenant, requireModuleByKey("water-irrigation", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(irrigationRecordsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/irrigation-records/:id", requireAuth, requireTenant, requireModuleByKey("water-irrigation", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(irrigationRecordsTable).set(req.body).where(and(eq(irrigationRecordsTable.id, id), eq(irrigationRecordsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/irrigation-records/:id", requireAuth, requireTenant, requireModuleByKey("water-irrigation", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(irrigationRecordsTable).where(and(eq(irrigationRecordsTable.id, id), eq(irrigationRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/irrigation-equipment", requireAuth, requireTenant, requireModuleByKey("water-irrigation", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(irrigationEquipmentTable).where(eq(irrigationEquipmentTable.farmId, farmId)).orderBy(irrigationEquipmentTable.equipmentName);
  res.json(rows);
});
router.post("/farms/:farmId/irrigation-equipment", requireAuth, requireTenant, requireModuleByKey("water-irrigation", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(irrigationEquipmentTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/irrigation-equipment/:id", requireAuth, requireTenant, requireModuleByKey("water-irrigation", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(irrigationEquipmentTable).set(req.body).where(and(eq(irrigationEquipmentTable.id, id), eq(irrigationEquipmentTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/irrigation-equipment/:id", requireAuth, requireTenant, requireModuleByKey("water-irrigation", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(irrigationEquipmentTable).where(and(eq(irrigationEquipmentTable.id, id), eq(irrigationEquipmentTable.farmId, farmId)));
  res.json({ success: true });
});

// ============================================================
// GRAIN STORAGE QUALITY (sub-tabs on Equipment module)
// ============================================================
router.get("/farms/:farmId/grain-storage-bins", requireAuth, requireTenant, requireModuleByKey("equipment-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(grainStorageBinsTable).where(eq(grainStorageBinsTable.farmId, farmId)).orderBy(grainStorageBinsTable.binName);
  res.json(rows);
});
router.post("/farms/:farmId/grain-storage-bins", requireAuth, requireTenant, requireModuleByKey("equipment-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(grainStorageBinsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/grain-storage-bins/:id", requireAuth, requireTenant, requireModuleByKey("equipment-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(grainStorageBinsTable).set(req.body).where(and(eq(grainStorageBinsTable.id, id), eq(grainStorageBinsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/grain-storage-bins/:id", requireAuth, requireTenant, requireModuleByKey("equipment-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(grainStorageBinsTable).where(and(eq(grainStorageBinsTable.id, id), eq(grainStorageBinsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Equipment Defect Reports Register ───────────────
router.get("/farms/:farmId/equipment-defect-reports", requireAuth, requireTenant, requireModuleByKey("equipment-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(equipmentDefectReportsTable).where(eq(equipmentDefectReportsTable.farmId, farmId)).orderBy(desc(equipmentDefectReportsTable.reportedDate));
  res.json({ records });
});

router.post("/farms/:farmId/equipment-defect-reports", requireAuth, requireTenant, requireModuleByKey("equipment-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const { mobileId } = req.body;
  if (mobileId) {
    const [existing] = await db.select({ id: equipmentDefectReportsTable.id }).from(equipmentDefectReportsTable).where(and(eq(equipmentDefectReportsTable.farmId, farmId), eq(equipmentDefectReportsTable.mobileId, mobileId))).limit(1);
    if (existing) { res.json({ record: existing, duplicate: true }); return; }
  }
  const year = new Date().getFullYear();
  const [countRow] = await db.select({ count: db.$count(equipmentDefectReportsTable.id) }).from(equipmentDefectReportsTable).where(and(eq(equipmentDefectReportsTable.farmId, farmId)));
  const seq = (Number(countRow?.count ?? 0) + 1).toString().padStart(4, "0");
  const defectRef = req.body.defectRef || `ED-${year}-${seq}`;
  const reportedDate = req.body.reportedDate || req.body.reportedDate || new Date().toISOString();
  const equipmentName = req.body.equipmentName || req.body.equipmentName || "Unknown";
  const defectDescription = req.body.defectDescription || req.body.defectDescription || "";
  const [record] = await db.insert(equipmentDefectReportsTable).values({ ...req.body, farmId, defectRef, reportedDate: new Date(reportedDate), equipmentName, defectDescription }).returning();
  res.status(201).json({ record });
});

router.patch("/farms/:farmId/equipment-defect-reports/:recordId/status", requireAuth, requireTenant, requireModuleByKey("equipment-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const { status, resolvedBy } = req.body;
  const updates: Record<string, unknown> = { status };
  if (status === "resolved" || status === "closed") { updates.resolvedDate = new Date(); if (resolvedBy) updates.resolvedBy = resolvedBy; }
  const [record] = await db.update(equipmentDefectReportsTable).set(updates).where(and(eq(equipmentDefectReportsTable.id, recordId), eq(equipmentDefectReportsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.put("/farms/:farmId/equipment-defect-reports/:recordId", requireAuth, requireTenant, requireModuleByKey("equipment-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [record] = await db.update(equipmentDefectReportsTable).set(req.body).where(and(eq(equipmentDefectReportsTable.id, recordId), eq(equipmentDefectReportsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/equipment-defect-reports/:recordId", requireAuth, requireTenant, requireModuleByKey("equipment-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const recordId = getRecordId(req);
  if (!recordId) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(equipmentDefectReportsTable).where(and(eq(equipmentDefectReportsTable.id, recordId), eq(equipmentDefectReportsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/grain-quality-tests", requireAuth, requireTenant, requireModuleByKey("equipment-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(grainQualityTestsTable).where(eq(grainQualityTestsTable.farmId, farmId)).orderBy(desc(grainQualityTestsTable.testDate));
  res.json(rows);
});
router.post("/farms/:farmId/grain-quality-tests", requireAuth, requireTenant, requireModuleByKey("equipment-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(grainQualityTestsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/grain-quality-tests/:id", requireAuth, requireTenant, requireModuleByKey("equipment-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(grainQualityTestsTable).set(req.body).where(and(eq(grainQualityTestsTable.id, id), eq(grainQualityTestsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/grain-quality-tests/:id", requireAuth, requireTenant, requireModuleByKey("equipment-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(grainQualityTestsTable).where(and(eq(grainQualityTestsTable.id, id), eq(grainQualityTestsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/grain-temperature-logs", requireAuth, requireTenant, requireModuleByKey("equipment-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(grainTemperatureLogsTable).where(eq(grainTemperatureLogsTable.farmId, farmId)).orderBy(desc(grainTemperatureLogsTable.logDate));
  res.json(rows);
});
router.post("/farms/:farmId/grain-temperature-logs", requireAuth, requireTenant, requireModuleByKey("equipment-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(grainTemperatureLogsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/grain-temperature-logs/:id", requireAuth, requireTenant, requireModuleByKey("equipment-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(grainTemperatureLogsTable).set(req.body).where(and(eq(grainTemperatureLogsTable.id, id), eq(grainTemperatureLogsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/grain-temperature-logs/:id", requireAuth, requireTenant, requireModuleByKey("equipment-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(grainTemperatureLogsTable).where(and(eq(grainTemperatureLogsTable.id, id), eq(grainTemperatureLogsTable.farmId, farmId)));
  res.json({ success: true });
});

// ============================================================
// AI & REPRODUCTION (sub-tabs on Livestock module)
// ============================================================
router.get("/farms/:farmId/ai-reproduction-records", requireAuth, requireTenant, requireModuleByKey("livestock-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(aiReproductionRecordsTable).where(eq(aiReproductionRecordsTable.farmId, farmId)).orderBy(desc(aiReproductionRecordsTable.serviceDate));
  res.json(rows);
});
router.post("/farms/:farmId/ai-reproduction-records", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(aiReproductionRecordsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/ai-reproduction-records/:id", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(aiReproductionRecordsTable).set(req.body).where(and(eq(aiReproductionRecordsTable.id, id), eq(aiReproductionRecordsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/ai-reproduction-records/:id", requireAuth, requireTenant, requireModuleByKey("livestock-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(aiReproductionRecordsTable).where(and(eq(aiReproductionRecordsTable.id, id), eq(aiReproductionRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

// ============================================================
// VET PRESCRIPTIONS (sub-tab on Livestock module)
// ============================================================
router.get("/farms/:farmId/vet-prescriptions", requireAuth, requireTenant, requireModuleByKey("livestock-management", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(vetPrescriptionRecordsTable).where(eq(vetPrescriptionRecordsTable.farmId, farmId)).orderBy(desc(vetPrescriptionRecordsTable.prescriptionDate));
  res.json(rows);
});
router.post("/farms/:farmId/vet-prescriptions", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(vetPrescriptionRecordsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/vet-prescriptions/:id", requireAuth, requireTenant, requireModuleByKey("livestock-management", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(vetPrescriptionRecordsTable).set(req.body).where(and(eq(vetPrescriptionRecordsTable.id, id), eq(vetPrescriptionRecordsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/vet-prescriptions/:id", requireAuth, requireTenant, requireModuleByKey("livestock-management", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(vetPrescriptionRecordsTable).where(and(eq(vetPrescriptionRecordsTable.id, id), eq(vetPrescriptionRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

// ============================================================
// SFI / ELMS ACTIONS (sub-tabs on Environmental module)
// ============================================================
router.get("/farms/:farmId/sfi-agreements", requireAuth, requireTenant, requireModuleByKey("environmental", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(sfiAgreementsTable).where(eq(sfiAgreementsTable.farmId, farmId)).orderBy(desc(sfiAgreementsTable.agreementStartDate));
  res.json(rows);
});
router.post("/farms/:farmId/sfi-agreements", requireAuth, requireTenant, requireModuleByKey("environmental", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(sfiAgreementsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/sfi-agreements/:id", requireAuth, requireTenant, requireModuleByKey("environmental", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(sfiAgreementsTable).set(req.body).where(and(eq(sfiAgreementsTable.id, id), eq(sfiAgreementsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/sfi-agreements/:id", requireAuth, requireTenant, requireModuleByKey("environmental", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(sfiAgreementsTable).where(and(eq(sfiAgreementsTable.id, id), eq(sfiAgreementsTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/sfi-actions", requireAuth, requireTenant, requireModuleByKey("environmental", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(sfiActionsTable).where(eq(sfiActionsTable.farmId, farmId)).orderBy(sfiActionsTable.actionCode);
  res.json(rows);
});
router.post("/farms/:farmId/sfi-actions", requireAuth, requireTenant, requireModuleByKey("environmental", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(sfiActionsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/sfi-actions/:id", requireAuth, requireTenant, requireModuleByKey("environmental", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(sfiActionsTable).set(req.body).where(and(eq(sfiActionsTable.id, id), eq(sfiActionsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/sfi-actions/:id", requireAuth, requireTenant, requireModuleByKey("environmental", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(sfiActionsTable).where(and(eq(sfiActionsTable.id, id), eq(sfiActionsTable.farmId, farmId)));
  res.json({ success: true });
});

// ============================================================
// SLURRY & MANURE MANAGEMENT (sub-tabs on Environmental module)
// ============================================================
router.get("/farms/:farmId/slurry-stores", requireAuth, requireTenant, requireModuleByKey("environmental", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(slurryStoresTable).where(eq(slurryStoresTable.farmId, farmId)).orderBy(slurryStoresTable.storeName);
  res.json(rows);
});
router.post("/farms/:farmId/slurry-stores", requireAuth, requireTenant, requireModuleByKey("environmental", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(slurryStoresTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/slurry-stores/:id", requireAuth, requireTenant, requireModuleByKey("environmental", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(slurryStoresTable).set(req.body).where(and(eq(slurryStoresTable.id, id), eq(slurryStoresTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/slurry-stores/:id", requireAuth, requireTenant, requireModuleByKey("environmental", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(slurryStoresTable).where(and(eq(slurryStoresTable.id, id), eq(slurryStoresTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/slurry-spreading-records", requireAuth, requireTenant, requireModuleByKey("environmental", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const rows = await db.select().from(slurrySpreadingRecordsTable).where(eq(slurrySpreadingRecordsTable.farmId, farmId)).orderBy(desc(slurrySpreadingRecordsTable.spreadingDate));
  res.json(rows);
});
router.post("/farms/:farmId/slurry-spreading-records", requireAuth, requireTenant, requireModuleByKey("environmental", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const [row] = await db.insert(slurrySpreadingRecordsTable).values({ ...req.body, farmId }).returning();
  res.json(row);
});
router.put("/farms/:farmId/slurry-spreading-records/:id", requireAuth, requireTenant, requireModuleByKey("environmental", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [row] = await db.update(slurrySpreadingRecordsTable).set(req.body).where(and(eq(slurrySpreadingRecordsTable.id, id), eq(slurrySpreadingRecordsTable.farmId, farmId))).returning();
  res.json(row);
});
router.delete("/farms/:farmId/slurry-spreading-records/:id", requireAuth, requireTenant, requireModuleByKey("environmental", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res); if (!farmId) return;
  const id = parseInt(req.params.id); if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(slurrySpreadingRecordsTable).where(and(eq(slurrySpreadingRecordsTable.id, id), eq(slurrySpreadingRecordsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Farm Members (Staff Records + System Access) ─────────────────────────────

// List all farm members (staff records) for a farm
router.get("/farms/:farmId/members", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const members = await db.select().from(farmMembersTable)
    .where(eq(farmMembersTable.farmId, farmId))
    .orderBy(farmMembersTable.lastName, farmMembersTable.firstName);
  res.json({ members });
});

// Create a staff record (no system access by default)
router.post("/farms/:farmId/members", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const tenantId = (req as any).tenantId as number;
  const { firstName, lastName, email, phone, jobTitle, farmRole, employedFrom, employedTo, notes } = req.body;
  if (!firstName || !lastName) { res.status(400).json({ error: "First name and last name are required" }); return; }
  const [member] = await db.insert(farmMembersTable).values({
    farmId,
    tenantId,
    firstName,
    lastName,
    email: email ?? null,
    phone: phone ?? null,
    jobTitle: jobTitle ?? null,
    farmRole: farmRole ?? "operator",
    accessType: "none",
    invitationStatus: "not_invited",
    employedFrom: employedFrom ? new Date(employedFrom) : null,
    employedTo: employedTo ? new Date(employedTo) : null,
    notes: notes ?? null,
  }).returning();
  res.status(201).json({ member });
});

// Update a farm member record
router.put("/farms/:farmId/members/:memberId", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const memberId = parseInt(req.params.memberId);
  const { firstName, lastName, email, phone, jobTitle, farmRole, accessType, employedFrom, employedTo, isActive, notes } = req.body;
  const [member] = await db.update(farmMembersTable).set({
    ...(firstName !== undefined && { firstName }),
    ...(lastName !== undefined && { lastName }),
    ...(email !== undefined && { email }),
    ...(phone !== undefined && { phone }),
    ...(jobTitle !== undefined && { jobTitle }),
    ...(farmRole !== undefined && { farmRole }),
    ...(accessType !== undefined && { accessType }),
    ...(employedFrom !== undefined && { employedFrom: employedFrom ? new Date(employedFrom) : null }),
    ...(employedTo !== undefined && { employedTo: employedTo ? new Date(employedTo) : null }),
    ...(isActive !== undefined && { isActive }),
    ...(notes !== undefined && { notes }),
  }).where(and(eq(farmMembersTable.id, memberId), eq(farmMembersTable.farmId, farmId))).returning();
  if (!member) { res.status(404).json({ error: "Member not found" }); return; }
  res.json({ member });
});

// Soft-delete (deactivate) a farm member
router.delete("/farms/:farmId/members/:memberId", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const memberId = parseInt(req.params.memberId);
  await db.update(farmMembersTable).set({ isActive: false })
    .where(and(eq(farmMembersTable.id, memberId), eq(farmMembersTable.farmId, farmId)));
  res.json({ ok: true });
});

// Invite a farm member to create a system account
router.post("/farms/:farmId/members/:memberId/invite", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const userId = req.user?.id;
  if (!userId) { res.status(401).json({ error: "Unauthorised" }); return; }
  const tenantId = (req as any).tenantId as number;
  const memberId = parseInt(req.params.memberId);
  const [member] = await db.select().from(farmMembersTable)
    .where(and(eq(farmMembersTable.id, memberId), eq(farmMembersTable.farmId, farmId)));
  if (!member) { res.status(404).json({ error: "Member not found" }); return; }
  if (!member.email) { res.status(400).json({ error: "Member has no email address — add one before inviting" }); return; }
  const { accessType, farmRole } = req.body;

  // Find or create a default role for the tenant
  const [defaultRole] = await db.select().from(rolesTable)
    .where(and(eq(rolesTable.tenantId, tenantId), eq(rolesTable.name, "member")));
  const roleId = defaultRole?.id;
  if (!roleId) { res.status(500).json({ error: "Default role not found — contact support" }); return; }

  const { randomBytes } = require("crypto") as typeof import("crypto");
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const [invitation] = await db.insert(userInvitationsTable).values({
    tenantId,
    farmId,
    email: member.email,
    firstName: member.firstName,
    lastName: member.lastName,
    roleId,
    farmRole: farmRole ?? member.farmRole,
    accessType: accessType ?? member.accessType ?? "full",
    token,
    invitedBy: userId,
    staffMemberId: memberId,
    expiresAt,
  }).returning();

  // Update member invitation status
  await db.update(farmMembersTable).set({
    invitationStatus: "pending",
    accessType: accessType ?? member.accessType ?? "full",
    farmRole: farmRole ?? member.farmRole,
  }).where(eq(farmMembersTable.id, memberId));

  res.status(201).json({ invitation, inviteLink: `/accept-invite/${token}` });
});

// Get current user's role/access level on a specific farm
router.get("/farms/:farmId/my-access", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const userId = req.user?.id;
  if (!userId) { res.status(401).json({ error: "Unauthorised" }); return; }
  const [assignment] = await db.select().from(staffFarmAssignmentsTable)
    .where(and(eq(staffFarmAssignmentsTable.userId, userId), eq(staffFarmAssignmentsTable.farmId, farmId)));
  if (!assignment) {
    // Farm owner / tenant admin - full owner access
    res.json({ farmRole: "owner", accessType: "full" });
    return;
  }
  res.json({ farmRole: assignment.farmRole, accessType: assignment.accessType });
});

// Update a farm user's access type or farm role
router.patch("/farms/:farmId/users/:targetUserId/access", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const targetUserId = req.params.targetUserId;
  const { farmRole, accessType } = req.body;
  const [assignment] = await db.update(staffFarmAssignmentsTable).set({
    ...(farmRole !== undefined && { farmRole }),
    ...(accessType !== undefined && { accessType }),
  }).where(and(eq(staffFarmAssignmentsTable.userId, targetUserId), eq(staffFarmAssignmentsTable.farmId, farmId))).returning();
  if (!assignment) { res.status(404).json({ error: "User not found on this farm" }); return; }
  res.json({ assignment });
});

export default router;

