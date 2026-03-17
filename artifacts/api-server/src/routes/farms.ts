import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import {
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
  haulageRecordsTable,
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
} from "@workspace/db";
import { eq, and, desc, sql, lt } from "drizzle-orm";
import { createNonconformanceNotification } from "../lib/alertingJob";
import { requireAuth, requireTenant, requireModuleByKey } from "../middlewares/roleMiddleware";

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
      cropId: fieldCropAssignmentsTable.cropId,
      cropName: cropsTable.name,
      plantingDate: fieldCropAssignmentsTable.plantingDate,
      expectedHarvestDate: fieldCropAssignmentsTable.expectedHarvestDate,
      season: fieldCropAssignmentsTable.season,
      year: fieldCropAssignmentsTable.year,
      notes: fieldCropAssignmentsTable.notes,
      createdAt: fieldCropAssignmentsTable.createdAt,
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
router.get("/farms/:farmId/coshh", requireAuth, requireTenant, requireModuleByKey("risk-waste", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(coshhRecordsTable).where(eq(coshhRecordsTable.farmId, farmId)).orderBy(desc(coshhRecordsTable.assessmentDate));
  res.json({ records });
});

router.post("/farms/:farmId/coshh", requireAuth, requireTenant, requireModuleByKey("risk-waste", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(coshhRecordsTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/coshh/:recordId", requireAuth, requireTenant, requireModuleByKey("risk-waste", "write"), async (req: Request, res: Response): Promise<void> => {
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

router.delete("/farms/:farmId/coshh/:recordId", requireAuth, requireTenant, requireModuleByKey("risk-waste", "delete"), async (req: Request, res: Response): Promise<void> => {
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
      content: `Red Tractor Assurance is the UK's largest farm assurance scheme, covering food safety, animal welfare, and environmental protection. To achieve and maintain certification, your farm must keep accurate, up-to-date records across all relevant compliance areas.\n\nBDE Farm Trac is organised into modules that map directly to Red Tractor's inspection requirements. Start by completing your Farm Profile and Field Register under Settings — these underpin every other record in the system. Once your fields and crops are entered, you can begin logging spray applications, equipment checks, and visitor records.\n\nYour compliance score on the dashboard reflects how complete and current your records are. Red Tractor inspectors can request records going back at least three years, so it is important to maintain records consistently, not just in the weeks before an inspection.\n\nIf you are new to Red Tractor assurance, your assurance body will provide a scheme manual specific to your sector (Combinable Crops, Beef & Lamb, Dairy, Pigs, or Fresh Produce). BDE Farm Trac covers the record-keeping obligations from all of these sector standards.`,
    },
    {
      id: 2,
      title: "Recording Spray Applications",
      category: "Sprays & Inputs",
      content: `Under Red Tractor and UK law (Plant Protection Products Regulations 2011), you are required to keep a detailed record of every pesticide and herbicide application made on your holding. Records must be made within 48 hours of the application and retained for at least three years.\n\nFor each spray record you must capture: the product name and MAPP number, the active ingredient, the target crop and growth stage, the field or area treated (in hectares), the application date, the total quantity of product used, and the name of the operator who carried out the application. Weather conditions at the time of spraying — wind speed and direction, temperature, and whether rain fell within six hours — are also required.\n\nTo add a record, navigate to Sprays & Inputs and select Add Application. Choose the product from your registered product list or add a new product with its MAPP number. The system will pre-fill the maximum approved dose and buffer zone distances from the product label.\n\nSpray operators must hold a valid certificate of competence (PA1 and the relevant PA2 or PA6 module). These can be linked to staff records in the Staff & Training section so that the system can alert you when certificates are approaching their renewal date.`,
    },
    {
      id: 3,
      title: "Managing Your Field Register",
      category: "Fields & Crops",
      content: `Your Field Register is a complete list of all parcels of land that form part of your holding. Red Tractor requires this to be kept current and to be cross-referenced against your spray and soil records. Each field should reflect how it is registered with the Rural Payments Agency (RPA) using the same OS grid reference or LPIS parcel identifier where possible.\n\nTo add a field, go to Fields & Crops and select Add Field. Enter the field name or reference number, the total area in hectares, the soil type, and the current crop or land use. You can also record whether the field falls within a Nitrate Vulnerable Zone (NVZ), is subject to any Higher Tier agri-environment agreements, or borders a watercourse — all of which affect what inputs can be applied and when.\n\nOnce a crop is assigned to a field, the system will carry the field through to spray records, soil records, and yield data, giving you a complete crop history without re-entering field details each time.\n\nAt the end of each season, use the Crop Rotation function to archive the current crop and assign the new crop for the coming year. Keeping rotation records helps demonstrate that you are managing soil health in line with Red Tractor soil management requirements.`,
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
      content: `Under the Cattle Identification Regulations and the Sheep and Goat (Records, Identification and Movement) Order, all livestock keepers must maintain accurate movement records. For cattle, every movement on and off your holding must be reported to BCMS (the British Cattle Movement Service) within three days using either eAML2 or post.\n\nIn BDE Farm Trac, navigate to Livestock to record a movement. Select whether the movement is On (to your holding) or Off (leaving your holding), and enter the date, the number of animals, and the source or destination holding number (CPH). For cattle, enter the individual ear tag numbers for each animal moved. For sheep and pigs, you can record batch movements with a total count and the flock or herd mark.\n\nFor cattle purchases, you should also record the date the animal passport was received and cross-reference the passport number against the ear tag. Red Tractor inspectors will check that passports are present for all cattle on the holding and match the animals physically present.\n\nWhen recording movements off the holding — for example to a market, abattoir, or another farm — retain a copy of the movement document (AML1 or AML2) and file it against the movement record in the Documents section. Records must be kept for at least three years.`,
    },
    {
      id: 6,
      title: "Visitor and Contractor Logging",
      category: "Biosecurity",
      content: `Biosecurity is a core requirement of Red Tractor across all sectors. Maintaining a log of everyone who visits your farm — including contractors, vets, feed merchants, and agronomists — demonstrates that you are managing the risk of disease introduction.\n\nEach visitor entry should record: the full name and company of the visitor, the purpose of the visit, the date and approximate arrival and departure time, whether they signed a biosecurity declaration, and whether they had visited any other livestock holdings within the previous 48–72 hours (depending on your sector standard).\n\nTo add a visitor record quickly, use the Quick Entry option in the Biosecurity & Visitors module. You can pre-register regular contractors so their details are available to select from a list, saving time. For livestock holdings, the system will prompt you to record whether the visitor declared any recent contact with other livestock.\n\nBiosecurity declaration forms can be generated from within the system and printed or emailed to visitors in advance. Where you use a paper signing-in book on the farm, these records should be transcribed into BDE Farm Trac within 24 hours to ensure your digital records remain complete. Inspectors may ask to see both digital and paper records where both exist.`,
    },
    {
      id: 7,
      title: "Staff Training & Certificates",
      category: "Staff & Training",
      content: `Red Tractor requires all staff carrying out regulated activities — particularly spraying operations, livestock handling, and machinery use — to hold valid certificates of competence. It is the farm manager's responsibility to ensure that certificates are current and that staff are not undertaking tasks for which they are not certificated.\n\nIn BDE Farm Trac, navigate to Staff & Training to add staff members and attach their qualifications. Key certificates to record include: PA1 (Safe Use of Pesticides), PA2 (Ground Crop Sprayers), PA6 (Handheld Applicators), WEIL (Water Environment and Irrigation Licence if irrigating from a watercourse), livestock handling certificates, forklift RTITB/ITSSAR, and any sector-specific competencies.\n\nFor each certificate, record the certificate number, issuing body, date of issue, and expiry date. BDE Farm Trac will generate alerts on the dashboard when a certificate is within 90 days of expiry, giving you time to arrange refresher training before the certificate lapses.\n\nWhere staff complete in-house training — for example, manual handling, fire safety, or biosecurity inductions — you can record these as non-certificated training events with the date, trainer name, and topics covered. Red Tractor inspectors may ask for evidence of in-house training records alongside formal qualifications.`,
    },
    {
      id: 8,
      title: "Inspection Preparation Checklist",
      category: "Inspections",
      content: `Red Tractor inspections are carried out by independent certification bodies on behalf of Assured Food Standards. Most farms are inspected annually, although risk-assessed farms with excellent compliance histories may be inspected less frequently. Inspections are usually unannounced.\n\nIn the three months before your expected inspection window, use BDE Farm Trac to review the completeness of your records. Check that all spray records are up to date and cover the current and previous two seasons. Verify that equipment calibration dates are current and that NSTS certificates are filed. Ensure all livestock movement records are reconciled against BCMS. Confirm that staff certificates are in date and attached to the correct staff profiles.\n\nOn the day of an inspection, your inspector will typically review your record-keeping system, walk the farm to check conditions and equipment, cross-reference spray records against stock in your chemical store, check animal welfare facilities, and interview you about your management practices. Having BDE Farm Trac open and logged in to the correct farm means you can navigate quickly to any record the inspector requests.\n\nAfter the inspection, any non-conformances raised must be addressed within the timescale specified in the inspection report. BDE Farm Trac's Action Required counter on the dashboard can be used to track outstanding items until they are resolved and signed off.`,
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
      content: `Red Tractor does not require detailed profit and loss accounting, but it does expect farm businesses to maintain records of inputs purchased, agri-environment scheme payments received, and any sales that fall under traceability requirements. This is separate from your statutory obligation to maintain VAT and income tax records.\n\nIn BDE Farm Trac, the Financial Records module allows you to record input purchases (seeds, fertilisers, pesticides, feed, veterinary medicines) against the relevant field, crop, or livestock group. This builds a cost-of-production picture that you can export to CSV for use in your farm management accounts or import into accounting software such as Xero or Sage.\n\nFor grant and agri-environment scheme records, log each payment received with the scheme name, payment reference, and the period it covers. Where payments are tied to specific actions — such as maintaining buffer strips or establishing wildflower margins — link these to the relevant field record so that evidence of compliance is stored in one place.\n\nWhen exporting data for your accountant, use the Export function to generate a CSV covering the date range required. Red Tractor inspectors occasionally ask for evidence that inputs purchased reconcile with inputs recorded as applied — for example, comparing fertiliser purchase invoices against your nutrient management plan.`,
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

export default router;
