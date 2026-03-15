import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import {
  farmsTable,
  fieldsTable,
  cropsTable,
  fieldCropAssignmentsTable,
  harvestRecordsTable,
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
  financialTransactionsTable,
  documentRecordsTable,
  weatherStationsTable,
  weatherReadingsTable,
  subscriptionsTable,
  modulesTable,
} from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
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

  const [inspResult] = await db
    .select({ nextDue: inspectionRecordsTable.nextInspectionDue })
    .from(inspectionRecordsTable)
    .where(eq(inspectionRecordsTable.farmId, farmId))
    .orderBy(desc(inspectionRecordsTable.inspectionDate))
    .limit(1);

  const [ncCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(nonconformanceRecordsTable)
    .where(and(eq(nonconformanceRecordsTable.farmId, farmId), eq(nonconformanceRecordsTable.status, "open")));

  const moduleStats = activeSubs.map((s) => ({
    moduleKey: s.moduleKey,
    moduleName: s.moduleName,
    recordCount: 0,
    lastActivity: null as string | null,
    hasOverdue: false,
  }));

  const complianceScore = ncCount.count === 0 ? 95 : Math.max(50, 95 - ncCount.count * 5);

  res.json({
    farm,
    complianceScore,
    overdueActions: ncCount.count,
    upcomingInspection: inspResult?.nextDue || null,
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
  res.json({ activities: [] });
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
    .where(eq(fieldsTable.farmId, farmId))
    .orderBy(desc(harvestRecordsTable.harvestDate));
  res.json({ records: records.map((r) => ({ ...r.harvest_records, fieldCropAssignment: r.field_crop_assignments, field: r.fields })) });
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
  const [record] = await db.insert(harvestRecordsTable).values(req.body).returning();
  res.status(201).json({ record });
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
  const records = await db.select().from(stockItemsTable).where(eq(stockItemsTable.farmId, farmId)).orderBy(desc(stockItemsTable.createdAt));
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
  const records = await db.select().from(stockDeliveriesTable).where(eq(stockDeliveriesTable.farmId, farmId)).orderBy(desc(stockDeliveriesTable.deliveryDate));
  res.json({ records });
});

router.post("/farms/:farmId/stock-deliveries", requireAuth, requireTenant, requireModuleByKey("stock-suppliers", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const [record] = await db.insert(stockDeliveriesTable).values({ ...req.body, farmId }).returning();
  res.status(201).json({ record });
});

// ─── Financial Transactions ────────────────────────
router.get("/farms/:farmId/financial-transactions", requireAuth, requireTenant, requireModuleByKey("financial-records", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = await validateFarmAccess(req, res);
  if (!farmId) return;
  const records = await db.select().from(financialTransactionsTable).where(eq(financialTransactionsTable.farmId, farmId)).orderBy(desc(financialTransactionsTable.transactionDate));
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
  const [record] = await db.insert(weatherReadingsTable).values({ ...req.body, farmId }).returning();
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
    { id: 1, title: "Getting Started with Red Tractor Compliance", category: "Getting Started", content: "This guide covers the basics of using BDE Farm Trac to achieve and maintain Red Tractor certification." },
    { id: 2, title: "Recording Spray Applications", category: "Sprays & Inputs", content: "Learn how to log spray and application events, including product details, weather conditions, and operator information." },
    { id: 3, title: "Managing Your Field Register", category: "Fields & Crops", content: "How to create and manage fields, assign crops, and track field boundaries." },
    { id: 4, title: "Equipment Calibration Guide", category: "Equipment", content: "Step-by-step guide to recording sprayer calibration events and managing calibration certificates." },
    { id: 5, title: "Livestock Movement Records", category: "Livestock", content: "How to record livestock movements on and off your holding, including eAML2-compatible documentation." },
    { id: 6, title: "Visitor and Contractor Logging", category: "Biosecurity", content: "Quick-entry guide for recording visitors and contractors for biosecurity compliance." },
    { id: 7, title: "Staff Training & Certificates", category: "Staff & Training", content: "Managing staff competency records, certificate tracking, and expiry alerts." },
    { id: 8, title: "Inspection Preparation Checklist", category: "Inspections", content: "A comprehensive checklist to help you prepare for your Red Tractor inspection." },
    { id: 9, title: "Understanding COSHH Requirements", category: "Risk & Waste", content: "Guide to COSHH record keeping for agricultural chemicals and substances." },
    { id: 10, title: "Financial Record Keeping", category: "Financial", content: "How to record transactions and export data to CSV or Xero-compatible formats." },
    { id: 11, title: "Weather Station Setup", category: "Weather", content: "Configure your weather data source - fixed station, mobile station, or manual entry." },
    { id: 12, title: "Document Management Best Practices", category: "Documents", content: "Tips for organising and linking documents to compliance records." },
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
