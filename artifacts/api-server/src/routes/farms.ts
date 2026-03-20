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
  equipmentCalibrationRecordsTable,
  herdFlockRegisterTable,
  livestockAnimalsTable,
  livestockMovementsTable,
  livestockMedicineRecordsTable,
  livestockFeedRecordsTable,
  livestockWaterRecordsTable,
  livestockMortalityTable,
  vetHealthPlansTable,
  seedDrillingRecordsTable,
  visitorContractorLogTable,
  pestControlRecordsTable,
  cleaningDisinfectionRecordsTable,
  staffTrainingRecordsTable,
  staffCertificatesTable,
  riskAssessmentsTable,
  coshhRecordsTable,
  wasteDisposalRecordsTable,
  inspectionRecordsTable,
  nonconformanceRecordsTable,
  correctiveActionsTable,
  environmentalFeaturesTable,
  agriEnvironmentSchemeRecordsTable,
  environmentalAssessmentsTable,
  haulageRecordsTable,
  hauliersTable,
  suppliersTable,
  stockItemsTable,
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
  farmAdvisorsTable,
  farmInspectionSessionsTable,
  externalAccessLogTable,
} from "@workspace/db";
import { eq, and, desc, sql, lt, gte } from "drizzle-orm";
import { createNonconformanceNotification } from "../lib/alertingJob";
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
  const { results, ...testData } = req.body;
  const [record] = await db.insert(soilTestRecordsTable).values({ ...testData, farmId }).returning();
  if (results && Array.isArray(results)) {
    for (const r of results) {
      await db.insert(soilTestResultsTable).values({ ...r, soilTestId: record.id });
    }
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
  const [record] = await db.update(soilTestRecordsTable).set(req.body).where(and(eq(soilTestRecordsTable.id, recordId), eq(soilTestRecordsTable.farmId, farmId))).returning();
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
  const [record] = await db.insert(livestockMedicineRecordsTable).values({ ...req.body, farmId }).returning();
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
  res.status(201).json({ record });
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
    deliveryDate: stockDeliveriesTable.deliveryDate,
    quantity: stockDeliveriesTable.quantity,
    batchNumber: stockDeliveriesTable.batchNumber,
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
    .leftJoin(financialTransactionsTable, eq(financialTransactionsTable.stockDeliveryId, stockDeliveriesTable.id))
    .where(eq(stockDeliveriesTable.farmId, farmId))
    .orderBy(desc(stockDeliveriesTable.deliveryDate));
  res.json({ records });
});

router.post("/farms/:farmId/stock-deliveries", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(stockDeliveriesTable).values({ ...req.body, farmId }).returning();

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
        notes: `Goods received${record.batchNumber ? ` — batch ${record.batchNumber}` : ""}${record.invoiceReference ? `, invoice ${record.invoiceReference}` : ""}`,
      });
      const [existing] = await db.select().from(stockLevelsTable).where(and(eq(stockLevelsTable.farmId, farmId), eq(stockLevelsTable.stockItemId, record.stockItemId))).limit(1);
      if (existing) {
        await db.update(stockLevelsTable).set({ currentQuantity: String(parseFloat(existing.currentQuantity) + qtyIn), lastUpdated: new Date() }).where(eq(stockLevelsTable.id, existing.id));
      } else {
        await db.insert(stockLevelsTable).values({ farmId, stockItemId: record.stockItemId, currentQuantity: String(qtyIn) });
      }
    }
  }

  res.status(201).json({ record });
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

// ─── Help Articles ─────────────────────────────────
router.get("/help/articles", async (_req: Request, res: Response): Promise<void> => {
  const articles = [
    {
      id: 1,
      title: "Getting Started with Red Tractor Compliance",
      category: "Getting Started",
      content: `<img src="/api/help-images/dashboard-overview.png" alt="BDE Farm Trac Dashboard Overview" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />\n\n<p>Red Tractor Assurance is the UK's largest farm assurance scheme, covering food safety, animal welfare, and environmental protection. To achieve and maintain certification, your farm must keep accurate, up-to-date records across all relevant compliance areas.</p>\n\n<p>BDE Farm Trac is organised into modules that map directly to Red Tractor's inspection requirements. Start by completing your Farm Profile and Field Register under Settings — these underpin every other record in the system. Once your fields and crops are entered, you can begin logging spray applications, equipment checks, and visitor records.</p>\n\n<h3>Your Compliance Score</h3>\n<p>The compliance score on your dashboard reflects how complete and current your records are across each module. Red Tractor inspectors can request records going back at least three years, so it is important to maintain records consistently — not just in the weeks before an inspection.</p>\n\n<h3>Getting Started Checklist</h3>\n<ol>\n<li><strong>Complete your Farm Profile</strong> — enter your CPH number, SBI, Red Tractor membership number, and contact details.</li>\n<li><strong>Set up your Field Register</strong> — add all fields with their area, soil type, and current crop.</li>\n<li><strong>Add your staff</strong> — create a profile for each person who will be entering records, including their PA certificates.</li>\n<li><strong>Register your equipment</strong> — add all sprayers and machinery with their NSTS dates.</li>\n<li><strong>Begin recording</strong> — start logging spray applications, movements, and medicine treatments daily.</li>\n</ol>\n\n<p>If you are new to Red Tractor assurance, your assurance body will provide a scheme manual specific to your sector (Combinable Crops, Beef &amp; Lamb, Dairy, Pigs, or Fresh Produce). BDE Farm Trac covers the record-keeping obligations from all of these sector standards.</p>`,
    },
    {
      id: 2,
      title: "Recording Spray Applications",
      category: "Sprays & Inputs",
      content: `<img src="/api/help-images/spray-records.png" alt="Spray Application Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />\n\n<p>Under Red Tractor and UK law (Plant Protection Products Regulations 2011), you are required to keep a detailed record of every pesticide and herbicide application made on your holding. Records must be made within 48 hours of the application and retained for at least three years.</p>\n\n<h3>What to Record</h3>\n<p>For each spray record you must capture:</p>\n<ul>\n<li>Product name and MAPP number</li>\n<li>Active ingredient and target pest or disease</li>\n<li>Target crop and growth stage (BBCH scale)</li>\n<li>Field or area treated in hectares</li>\n<li>Application date and time</li>\n<li>Total quantity of product used</li>\n<li>Operator name and PA certificate number</li>\n<li>Weather conditions — wind speed/direction, temperature, rainfall within 6 hours</li>\n</ul>\n\n<h3>Adding a Record</h3>\n<p>Navigate to <strong>Sprays &amp; Inputs</strong> and select <strong>Add Application</strong>. Choose the product from your registered product list or add a new product with its MAPP number. The system will pre-fill the maximum approved dose and buffer zone distances from the product label.</p>\n\n<h3>Operator Certificates</h3>\n<p>Spray operators must hold a valid certificate of competence (PA1 and the relevant PA2 or PA6 module). These can be linked to staff records in the Staff &amp; Training section so that the system alerts you when certificates are approaching their renewal date.</p>`,
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
      content: `Red Tractor requires that all sprayers and other application equipment are kept in good working order and calibrated to ensure accurate application rates. Sprayers must be tested by an approved NSTS (National Sprayer Testing Scheme) inspector at intervals not exceeding three years; from January 2026, some sector standards require more frequent testing.\n\nTo register a piece of equipment, go to Machinery & Equipment and select Add Equipment. Enter the make, model, serial number, and registration number if applicable. You can attach photos of the current NSTS certificate directly within the equipment record — this makes them instantly available during an inspection without searching through paper files.\n\nFor each piece of equipment, set a Next Calibration Due date. The system will surface overdue or upcoming calibration dates on your dashboard so that nothing slips through. You can also log routine servicing events in the Notes field with the date and engineer name.\n\nSprayer operators should carry out a pre-season self-check before each spraying season. Record the date of this check and any remedial work carried out. Even where formal NSTS certification is not immediately due, evidence of routine checks demonstrates good practice to an inspector.`,
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

<h3>Recording a Movement</h3>
<p>Set your farm’s Country in <strong>Farm Settings</strong> so that the Movements page shows the correct portal links. Navigate to <strong>Livestock Movements</strong> and click <strong>Add Movement</strong>. Enter:</p>
<ul>
<li>Date of movement and direction (On or Off holding)</li>
<li>Species and number of animals</li>
<li>Source or destination CPH number</li>
<li>Individual ear tag numbers (cattle) or flock mark and total count (sheep/pigs)</li>
</ul>

<h3>Cattle Passports</h3>
<p>For cattle purchases, record the date the animal passport was received and cross-reference the passport number against the ear tag. Red Tractor inspectors check that passports are present for all cattle on the holding. When recording movements off the holding — to a market, abattoir, or another farm — retain a copy of the movement document (AML1 or AML2) and attach it to the movement record in Documents. Records must be kept for at least three years.</p>`,
    },
    {
      id: 6,
      title: "Visitor Logging and Biosecurity Plan",
      category: "Biosecurity",
      content: `Biosecurity is a core requirement of Red Tractor across all sectors. The Biosecurity module in BDE Farm Trac has five tabs: Visitor Log, Pest Control, Cleaning & Disinfection, COSHH, and Biosecurity Plan.\n\nThe Visitor Log tab is where you record everyone who comes onto your farm — contractors, vets, feed merchants, agronomists, and any other visitors. Each entry should capture: the full name and company, the purpose of the visit, the date and approximate arrival and departure time, whether they signed a biosecurity declaration, and whether they had visited any other livestock holdings within the previous 48–72 hours (depending on your sector standard). Biosecurity declaration forms can be generated from within the system and printed or emailed to visitors in advance.\n\nThe Biosecurity Plan tab holds your farm's written biosecurity plan document — a requirement that Red Tractor inspectors look for as evidence that you have formally thought through how disease risks are managed on your holding. The plan is structured into nine sections: restricted areas and access points, visitor and personnel procedures, vehicle and equipment entry controls, cleaning and disinfection protocols, pest management, disease outbreak response, waste management, water source protection, and staff responsibilities. There are also document control fields for author, approver, review dates, and version number.\n\nTo create or update the plan, open the Biosecurity Plan tab and click Edit Plan. Each section has a text area where you describe your farm's specific arrangements. Once saved, the plan displays in a clean view mode. The Print Plan button generates a formal A4 document with signature blocks for the farm manager and approver, suitable for filing or presenting to an inspector.\n\nReview your biosecurity plan annually and after any significant change to farm operations, such as adding a new livestock enterprise, constructing new buildings, or changing contractors.`,
    },
    {
      id: 7,
      title: "Staff Training & Certificates",
      category: "Staff & Training",
      content: `Red Tractor requires all staff carrying out regulated activities — particularly spraying operations, livestock handling, and machinery use — to hold valid certificates of competence. It is the farm manager's responsibility to ensure that certificates are current and that staff are not undertaking tasks for which they are not certificated.\n\nIn BDE Farm Trac, navigate to Staff & Training. The module has two tabs: Training Records and Certificates & Qualifications.\n\nThe Training Records tab is where you log all in-house and externally-delivered training events. For each record, enter the staff member's name, the training course or competency achieved, the training provider, the date, and the assessor name. Training records show colour-coded expiry badges: green (current), amber (expiring within 60 days), and red (expired). Where staff complete in-house training — manual handling, fire safety, biosecurity inductions — log these here with the trainer name and topics covered.\n\nThe Certificates & Qualifications tab is where formal industry certificates are recorded. The certificate type dropdown includes: PA1 (Safe Use of Pesticides), PA2 (Ground Crop Sprayers), PA3 (Broadcast Air-Assisted Sprayers), PA6 (Handheld Applicators), PA6AW (Aquatic Weed Control), BASIS Crop Protection, FACTS Nutrient Management, City & Guilds awards, First Aid, Forklift RTITB/ITSSAR, and other competencies. For each certificate, record the certificate number, issuing body, date of issue, and expiry date. The same amber and red expiry badge system applies so nothing slips past its renewal date unnoticed.\n\nThe Print Register button at the top of the page generates a formatted A4 document containing both the training records and certificates tables, plus sign-off blocks for the farm manager and assessor. This document is suitable for presenting to a Red Tractor inspector who asks to see your training evidence.`,
    },
    {
      id: 8,
      title: "Inspection Preparation Checklist",
      category: "Inspections",
      content: `Red Tractor inspections are carried out by independent certification bodies on behalf of Assured Food Standards. Most farms are inspected annually, although risk-assessed farms with excellent compliance histories may be inspected less frequently. Inspections are usually unannounced.\n\nIn the three months before your expected inspection window, use BDE Farm Trac to review the completeness of your records. Check that all spray records are up to date and cover the current and previous two seasons. Verify that equipment calibration dates are current and that NSTS certificates are filed. Ensure all livestock movement records are reconciled against your relevant government portal (BCMS, eAML2, ScotEID, EIDCymru, or NIFAIS depending on your country and species). Confirm that staff certificates are in date and attached to the correct staff profiles.\n\nOn the day of an inspection, your inspector will typically review your record-keeping system, walk the farm to check conditions and equipment, cross-reference spray records against stock in your chemical store, check animal welfare facilities, and interview you about your management practices. Having BDE Farm Trac open and logged in to the correct farm means you can navigate quickly to any record the inspector requests.\n\nAfter the inspection, any non-conformances raised must be addressed within the timescale specified in the inspection report. BDE Farm Trac's Action Required counter on the dashboard can be used to track outstanding items until they are resolved and signed off.`,
    },
    {
      id: 9,
      title: "Understanding COSHH Requirements",
      category: "Risk & Waste",
      content: `The Control of Substances Hazardous to Health Regulations 2002 (COSHH) require employers and self-employed persons to assess the risks from hazardous substances used at work and to implement appropriate control measures. On farms, COSHH assessments are required for pesticides, veterinary medicines, cleaning chemicals, fuels, and other substances that could harm health.\n\nFor each hazardous substance in your chemical store, you should hold a completed COSHH assessment that identifies: what the substance is and what it is used for, who might be exposed and how, the health effects of exposure, the control measures in place (PPE, ventilation, storage requirements), emergency procedures in the event of a spill or exposure, and the date of the assessment and next review date.\n\nIn BDE Farm Trac, link COSHH assessments to the relevant product record in Sprays & Inputs. This means that when a spray record is created, the operator can confirm they have read the relevant COSHH assessment before proceeding. Keep copies of all Safety Data Sheets (SDS) — available from the product manufacturer — alongside each assessment.\n\nCOSHH assessments should be reviewed whenever a new substance is introduced, when working methods change, or at least annually. Red Tractor inspectors will ask to see COSHH assessments for products found in your store and may check that staff are aware of the relevant control measures.`,
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
      content: `Accurate weather data is an important part of spray application records. Under Red Tractor, spray records must include the wind speed and direction, temperature, and rainfall status at the time of application. This information helps demonstrate that applications were made within the safe working conditions defined on the product label.\n\nBDE Farm Trac can pull weather data in three ways. If you have a weather station on the farm (for example a Davis Vantage or similar), you can connect it via its API and the system will automatically associate recorded conditions with spray events logged at the same time. If you use a third-party weather service such as ADAS Weather, you can configure your nearest weather station postcode and the system will retrieve daily summaries.\n\nFor farms without a connected station, manual entry is available. When logging a spray application, you will be prompted to enter the wind speed in metres per second (or Beaufort scale), the wind direction, the air temperature in degrees Celsius, and whether there was rain or dew present. This takes only a moment and ensures the record is complete.\n\nIf you are in doubt about wind speed, a simple field guide: leaves rustling and small twigs moving is around 3–4 m/s (Beaufort 3), which is typically within the acceptable range for most boom sprayers. Sustained gusts above 5 m/s (Beaufort 4) usually indicate conditions where spraying should stop to prevent drift onto neighbouring land or watercourses.`,
    },
    {
      id: 12,
      title: "Document Management Best Practices",
      category: "Documents",
      content: `Red Tractor requires you to hold and present a range of documents during inspections, including your farm assurance certificate, scheme membership confirmation, NSTS sprayer test certificates, insurance certificates, staff training certificates, COSHH assessments, and agri-environment scheme agreements. Keeping these organised and accessible is as important as the records themselves.\n\nIn BDE Farm Trac, the Documents section allows you to upload PDF, Word, or image files and link them to the relevant record. For example, an NSTS certificate should be attached to the equipment record for the sprayer it covers, and a staff PA2 certificate should be attached to that staff member's training record. This means that when an inspector asks for evidence, you can navigate directly to the record and show the document without searching through folders or filing cabinets.\n\nFor documents with an expiry date — certificates, insurance policies, scheme agreements — always enter the expiry date when uploading. These will appear in the Documents expiry report, which gives you a forward view of what needs renewing over the next 12 months. Set a reminder period of 90 days for documents that require advance booking (such as sprayer NSTS tests) and 30 days for those with a shorter lead time.\n\nReview your document library at the start of each calendar year. Archive documents that have been superseded by newer versions rather than deleting them — inspectors may ask to see previous certificates to establish a history of compliance. Archived documents remain searchable but are removed from the active documents view.`,
    },
    {
      id: 13,
      title: "Biofuel / RTFO Compliance Overview",
      category: "Biofuel / RTFO",
      content: `The Renewable Transport Fuel Obligation (RTFO) requires fuel suppliers to blend a proportion of renewable fuels — including crop-based biofuels — into the transport fuel they supply. Farms that grow energy crops or supply feedstocks for biofuel production must demonstrate sustainability under an approved scheme such as ISCC (International Sustainability and Carbon Certification) or the Red Tractor Biofuel Standard.\n\nTo access the Biofuel / RTFO module, navigate to Biofuel / RTFO in the sidebar. This module is available as an add-on subscription. If you cannot see it, contact your account administrator to enable it for your farm.\n\nThe module has four areas. The Overview tab shows your current compliance checklist — including whether your ISCC or approved scheme certification is in place and up to date, whether all eligible fields have land declarations recorded, and whether your delivery records match your certification claims. The compliance percentage shown here updates automatically as records are added.\n\nThe Certification tab holds your scheme certificates. Add a certificate by entering the certification body, your certificate number, and the valid-from and expiry dates. The system will warn you 60 days before a certificate expires. An expired or missing certificate means you cannot make valid RTFO claims for that period.\n\nThe Field Declarations tab records the eligibility status of each field used for biofuel feedstocks. You must declare the 2008 land-use category for each field (this is required under the RTFO to demonstrate the field was not previously a high-biodiversity or high-carbon-stock habitat). Fields classified as peatland, wetland, or continuously forested land in January 2008 are not eligible for RTFO claims.\n\nThe Delivery Records tab logs each delivery of biofuel feedstock. Each record links to an RTFO reference number provided by the buyer, the receiving company, the sustainability scheme, the quantity in tonnes, and the GHG emission saving percentage reported for that delivery.`,
    },
    {
      id: 14,
      title: "ISCC Certification and Land Eligibility",
      category: "Biofuel / RTFO",
      content: `ISCC (International Sustainability and Carbon Certification) is one of the primary certification schemes recognised under the RTFO. To sell feedstocks for biofuel production under RTFO, your farm must hold a current ISCC certificate or be covered by a group certificate held by your buyer or cooperative.\n\nTo record your ISCC certificate in BDE Farm Trac, go to Biofuel / RTFO and open the Certification tab. Click Add Certificate and enter the certification body name (e.g. ISCC System GmbH, CERT UK, or your approved certifier), your certificate number (this appears on your ISCC certificate of compliance), the issued date, and the expiry date. Upload a PDF of the certificate using the file attachment button. The system will display a warning banner on the Overview tab if the certificate has lapsed or is within 60 days of expiry.\n\nFor land eligibility, each field used for biofuel feedstock production must have a land declaration recorded in the Field Declarations tab. You will need to know the land-use category of each field in January 2008 — this information can typically be found from Countryside Stewardship entry data, Rural Payments Agency records, or historical aerial photography. The eligible land categories under the RTFO are: arable land, permanent grassland that was already being used for arable cultivation in 2008, and land under cultivation since before 2008 that does not fall into any high-risk category.\n\nHigh-risk land categories that make fields ineligible include: peatland (regardless of drainage status), wetlands, continuously forested areas, and areas that were designated as conservation land in 2008. If any part of a field falls into a high-risk category, that field should be excluded from RTFO claims unless a full sustainability audit has cleared it. Record the risk flag status for each field in the Field Declarations form — the system will mark ineligible fields in red on the declarations list.`,
    },
    {
      id: 15,
      title: "Recording Biofuel Deliveries and GHG Savings",
      category: "Biofuel / RTFO",
      content: `Every delivery of biofuel feedstock that you wish to claim under the RTFO must be individually recorded. Your buyer (the fuel supplier or their intermediary) will provide an RTFO reference number for each delivery. This reference links your farm delivery to the RTFO claim that the fuel supplier makes to the Department for Energy Security and Net Zero (DESNZ).\n\nTo record a delivery, go to Biofuel / RTFO and open the Delivery Records tab. Click Add Delivery Record and complete the form. Required fields include: the delivery date, the name of the buying company, the RTFO reference number provided by the buyer, the sustainability scheme under which the delivery is claimed (e.g. ISCC, Red Tractor Biofuel Standard), the quantity delivered in tonnes, and the feedstock type (e.g. OSR — oilseed rape, wheat, sugar beet).\n\nThe GHG emission saving percentage is calculated by the buyer's RTFO operator using a standard lifecycle analysis methodology. You do not calculate this yourself, but you should record the figure as stated on your delivery confirmation or the buyer's sustainability declaration document. The RTFO requires this figure to demonstrate that the biofuel produced achieves at least a 65% GHG saving compared to fossil fuel (for crops grown on land not covered by transitional arrangements).\n\nThe Overview tab shows a GHG summary aggregated across all your delivery records for the current season. This summary also draws on your nitrogen application records and harvest yield data to build a picture of your farm's overall input intensity for auditing purposes. If any delivery records are missing an RTFO reference or GHG saving figure, they will appear as warnings in the compliance checklist.`,
    },
    {
      id: 16,
      title: "NVZ Rules, Applications and Risk Assessments",
      category: "Nutrient Management",
      content: `Nitrate Vulnerable Zones (NVZs) are areas designated by the Environment Agency as being at risk of nitrate pollution from agricultural sources. If any of your fields lie within an NVZ — which you can check on the Magic map at magic.defra.gov.uk — you must comply with the Nitrates Regulations 2015, including closed periods for spreading organic manures, storage requirements, and maximum nitrogen application rates.\n\nIn BDE Farm Trac, the NVZ module has three tabs: NVZ Summary, Application Log, and Risk Assessments.\n\nThe NVZ Summary tab shows your NVZ-designated fields, the 170 kg N/ha organic manure limit, and a running nitrogen balance for the season. For each field, mark it as NVZ-designated in the Field Register. The system applies closed period warnings when you attempt to record a fertiliser application in a prohibited window. Closed periods for manufactured nitrogen fertilisers on tillage land run from 1 September to 31 January; for grassland, from 15 October to 31 January.\n\nThe Application Log tab records each fertiliser application on NVZ fields. For each application, record the product name, the total nitrogen content (kg N/ha), the application date, the method (broadcast spreading, injection, trailing shoe), and the field area treated. The system calculates cumulative nitrogen loading for the season and flags fields approaching or exceeding the limit. NVZ regulations require fertiliser application records to be kept for at least five years.\n\nThe Risk Assessments tab is where you record formal NVZ risk assessments — a document that good practice (and some sector standards) expects you to carry out and review periodically. For each assessment, record the date, the assessor name, the soil type, drainage risk (Low/Medium/High), slope risk, flood risk, distance to nearest watercourse, organic matter level, any application restrictions identified, and the mitigation measures in place. Overall risk level is recorded as Low, Medium, or High and is shown with a colour-coded badge on the assessments list. Set a next review date so the system can surface assessments that are overdue for revision.`,
    },
    {
      id: 17,
      title: "Nutrient Management Planning (NMP)",
      category: "Nutrient Management",
      content: `A Nutrient Management Plan (NMP) is a written record of how you intend to manage the nutrients applied to your land to meet crop needs while minimising environmental impact. For farms within NVZs, an NMP is a legal requirement under the Nitrates Regulations. For Red Tractor certified farms, evidence of a nutrient management plan or soil-based fertiliser planning is an inspection requirement.\n\nYour NMP should cover each field on your holding and detail: the soil test results (pH, phosphorus index, potassium index, and magnesium index where relevant), the crop to be grown and its expected yield, the estimated crop nitrogen demand, the amount of nitrogen expected from organic manures and soil nitrogen supply, and the planned manufactured nitrogen application to make up the deficit.\n\nIn BDE Farm Trac, the soil testing records in the Fields & Crops section feed directly into the NMP view. For each field, record the most recent soil test results by clicking on the field name and selecting Add Soil Test. Enter the index values for P, K, and Mg, and the pH. The system will flag fields where pH is below 6.0 (requiring lime) or where phosphorus is at index 4 or above (restricting further P applications under Red Tractor guidelines).\n\nThe system does not automatically generate RB209-compliant recommendations, but it provides the data framework you need to complete your NMP manually or with your agronomist. Export field-by-field soil and application data to share with your FACTS-qualified adviser. Keep your NMP updated each year before the main growing season begins — inspectors look for evidence that fertiliser planning is based on current soil data, not figures carried over from several years ago.`,
    },
    {
      id: 18,
      title: "Soil Testing and Sampling Records",
      category: "Fields & Crops",
      content: `Regular soil testing is a fundamental part of good crop husbandry and is specifically required by Red Tractor. The Combinable Crops standard requires soil sampling on a minimum 5-year cycle for all fields, and recommends more frequent testing for fields with intensive cropping programmes or where soil health is a concern.\n\nTo record a soil test result in BDE Farm Trac, navigate to the field in the Fields & Crops section and open the Soil Tests tab. Enter the sampling date, the laboratory that carried out the analysis, the sample reference number, and the index values for pH, phosphate (P), potassium (K), and magnesium (Mg). Where a full soil health analysis is available — including organic matter percentage, bulk density, or earthworm counts — these can be entered in the extended fields.\n\nThe system tracks when each field was last sampled and will surface overdue soil tests on the Fields & Crops dashboard. A field is flagged as overdue if no sample has been recorded in the last five years, or earlier if you have set a more frequent cycle in the field settings.\n\nWhere soil pH falls below 6.0, the system generates a lime recommendation alert. Applying lime to bring soil to the correct pH is not only agronomically beneficial but is required by Red Tractor before further phosphate or nitrogen applications are made to the affected field. Record any lime applications in the fertiliser records section with the product name (e.g. ground limestone, calcium carbide), rate per hectare, and application date. Retain laboratory analysis reports from your sampling contractor — these are the primary evidence an inspector will look for.`,
    },
    {
      id: 19,
      title: "Harvest Records and Yield Tracking",
      category: "Fields & Crops",
      content: `Harvest records document the yield achieved from each field at the end of the growing season. These records are used to support nutrient management planning (comparing actual yield against the planned yield used to calculate nitrogen demand), to verify biofuel feedstock quantities for RTFO purposes, and to provide the traceability data required by Red Tractor's combinable crops standard.\n\nTo record a harvest in BDE Farm Trac, navigate to Fields & Crops and open the Harvest Records section. Click Add Harvest Record and select the field and crop. Enter the harvest date, the yield in tonnes, the moisture content at harvest (percentage), and the storage location or destination (e.g. home store, co-op, direct to merchant). If the grain is destined for biofuel processing, tick the Biofuel Feedstock flag — this links the harvest record to the Biofuel / RTFO module.\n\nThe Harvest Dashboard provides an at-a-glance summary of total yield, yield per hectare by crop type, and a comparison against the previous season. Use this to identify underperforming fields and to update your agronomic plan for the following season. Moisture content at harvest is important not just for grain quality but because it affects the dry-matter yield figure used in NMP calculations — the system applies a standard conversion factor when calculating dry-matter tonnes from the as-harvested moisture figure.\n\nFor Red Tractor traceability purposes, each harvest record generates a unique batch reference that can be quoted on grain movement documents. This enables the system to build a chain of custody from field to store to dispatch, which is particularly important for assured combinable crops sold into the milling or malting market.`,
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
      content: `Red Tractor requires farms to operate a systematic pest control programme, particularly for rodents in and around grain stores, feed stores, and livestock buildings. A record of each pest control visit — whether carried out by a contractor or in-house — must be kept, including what was found, what action was taken, and when the next inspection is due.\n\nIn BDE Farm Trac, navigate to Biosecurity and open the Pest Control tab. Click Add Pest Control Record to log a visit. Record the date, the name of the pest control operative or contractor, the areas inspected, any pests found (species and approximate numbers), the treatment applied (bait type and quantity, trap type, proofing work carried out), and the next scheduled inspection date. For Red Tractor purposes, the frequency of pest control inspections should be set based on risk — typically monthly for active grain stores and quarterly for lower-risk areas.\n\nCleaning and disinfection (C&D) records are required wherever livestock are housed, handled, or transported, and for vehicles and equipment that move between holdings. For each C&D event, record the date, the area or equipment cleaned, the disinfectant product used (name and DEFRA approval number), the dilution rate, the contact time, and the name of the operative. DEFRA-approved disinfectants for use under disease-control orders must be used at the label-specified concentration.\n\nFor poultry and pig producers, thorough cleanse-and-disinfect records between production cycles are a mandatory Red Tractor requirement. The system will calculate the time elapsed since the last C&D record for each building and surface this on the Biosecurity dashboard when the interval exceeds your configured threshold. Keep C&D records for at least three years.`,
    },
    {
      id: 22,
      title: "Using the Mobile App for Field Recording",
      category: "Mobile App",
      content: `The BDE Farm Trac mobile app allows you and your staff to capture field records on the go — without needing to carry paper forms or return to the office to enter data. Records created on the mobile app are queued locally on the device and automatically synchronised to the server the next time the device has a data or Wi-Fi connection.\n\nTo log in to the mobile app, open it on your device and sign in with the same email and password you use for the web dashboard. If your farm has multiple users, each person should use their own credentials — records will be attributed to the individual who created them, which is important for spray operator records and staff training compliance.\n\nThe Record tab in the mobile app provides quick-entry forms for the most common in-field tasks: spray applications, soil sample collection, field inspections, equipment defects, harvest records, NVZ fertiliser applications, livestock movements, livestock health checks, livestock mortality, medicine administration, pest control visits, land eligibility (for biofuel / RTFO purposes), and biofuel delivery recording.\n\nEach form is designed to be completed quickly in a field or yard environment. Mandatory fields are clearly marked and the form will not submit until all required information is entered. For spray records, the app will prompt you to enter weather conditions if no connected weather station is detected. For livestock records, you can scan animal ear tags using the device camera if your tags carry a QR or barcode.\n\nRecords that have been created on the device but not yet synced are shown in the Pending Sync section on the Home tab. If synchronisation fails (for example due to a validation error), the record is retained on the device and an error message is shown. Correct the record and attempt to sync again. Once synced, records appear in the web dashboard immediately and can be reviewed, edited (by authorised users), or included in compliance reports.`,
    },
    {
      id: 24,
      title: "Livestock Movement Reporting: Scotland, Wales and Northern Ireland",
      category: "Livestock",
      content: `BDE Farm Trac supports the livestock movement reporting requirements of all four UK devolved nations. The correct portal depends on where your holding is registered and which species you keep.\n\nTo configure your farm's country, go to Farm Settings, scroll to the Location section, and set the Country / Devolved Nation field. The Movements page will then display the appropriate portal quick-links and show scheme-specific fields in Farm Settings.\n\nScotland — ScotEID: All livestock movements in Scotland (cattle, sheep, goats, pigs, and deer) are reported to ScotEID (scoteid.com), which is operated by Scotland's Rural College (SRUC) on behalf of the Scottish Government. ScotEID is Scotland's central electronic identification and movement database. Cattle in Scotland must also have their movements recorded with BCMS. In Farm Settings you can enter your ScotEID flock or herd number, which appears on movement exports.\n\nWales — EIDCymru and eAML2: Wales operates EIDCymru (eidcymru.org) for sheep and goat movements. This is a Welsh Government-operated system equivalent to eAML2 in England. Pig movements in Wales continue to use eAML2. Cattle movements in Wales are reported to BCMS Online, as in England. In Farm Settings you can enter your EIDCymru flock number, which will appear on Wales-specific movement exports.\n\nNorthern Ireland — NIFAIS and APHIS: Northern Ireland uses NIFAIS (Northern Ireland Food Animal Information System) for cattle movement and traceability. Sheep and pig movements are managed through APHIS (Animal & Public Health Information System). Both systems are operated by DAERA (Department of Agriculture, Environment and Rural Affairs). Contact DAERA or visit daera-ni.gov.uk to register and access these systems.\n\nFor all countries, record each movement in BDE Farm Trac first, then submit to the appropriate portal within the legal time limit (3 days for cattle; scheme-specific for other species). Always paste the portal's reference number back into the BDE Farm Trac movement record once submitted.`,
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
      content: `BDE Farm Trac includes a secure external access system that lets you share read-only views of your farm records with anyone who needs to review them — without giving them a full login or access to your entire account. This is designed for agronomists, FACTS advisers, vets, Red Tractor certification bodies, banks, and any other party that periodically needs to review your compliance records.\n\nThe Advisors & External Access feature is available under Settings. It has two tiers.\n\nAdvisor Accounts are for recurring advisors who need regular access — for example your agronomist, BASIS consultant, or vet. You create an advisor account by entering their name, email address, role, and choosing which of 14 modules they can view. Once saved, a secure link is automatically copied to your clipboard. You send that link by email. The advisor clicks it and sees a clean, read-only view of exactly the modules you chose. Their access is permanent until you revoke it. The system records when they last accessed the view, which is visible on your settings page.\n\nInspection Sessions are for time-limited access — most commonly for Red Tractor Certification Body inspectors, one-off audits, or bank reviews. You create a session by entering the inspector's name, organisation, and purpose (e.g. Red Tractor Inspection, Environmental Audit, Due Diligence). You set an expiry date — typically 7 to 30 days — and choose the modules to share. A secure link is generated and copied to your clipboard. No account is required — the link is the key. The session card on your settings page shows a colour-coded expiry badge (green, amber, or red as the date approaches) and an access count showing how many times the link has been used.\n\nThe read-only view that advisors and inspectors see opens in any browser without a login prompt. It shows a green banner across the top confirming they are in read-only mode, the farm's name and registration details (CPH number, Red Tractor ID, SBI number, farm manager), and a section for each permitted module with a table of all records in that module. They cannot edit, add, or delete anything. An expired or revoked link shows a clear error message directing them to contact the farm.\n\nAll access is logged. A full access log at the bottom of your Advisors & External Access settings page records every time an external party views your records — their name, whether they are an advisor account or inspection session, and the exact date and time. This log itself is evidence of your transparency with your assurance body, and if Red Tractor moves toward requiring digital record-sharing as part of the certification process, you will already have the infrastructure in place.`,
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

export default router;

