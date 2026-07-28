import { Router, type IRouter, type Request, type Response } from "express";
import { createHash } from "crypto";
import {
  db,
  dataApiKeysTable,
  fieldsTable,
  livestockMovementsTable,
  livestockMedicineRecordsTable,
  sprayApplicationsTable,
  soilTestRecordsTable,
  soilTestResultsTable,
  inspectionRecordsTable,
  staffTrainingRecordsTable,
  equipmentTable,
  financialTransactionsTable,
  riskAssessmentsTable,
  subscriptionsTable,
  modulesTable,
} from "@workspace/db";
import { eq, and, gte, lte, isNull, desc } from "drizzle-orm";

// ─── In-memory rate limiter (100 req/min per key) ────────────────────────────

const _rateMap = new Map<number, { count: number; resetAt: number }>();

function checkRateLimit(keyId: number): boolean {
  const now = Date.now();
  const entry = _rateMap.get(keyId);
  if (!entry || entry.resetAt < now) {
    _rateMap.set(keyId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 100) return false;
  entry.count += 1;
  return true;
}

// ─── CSV serialiser ───────────────────────────────────────────────────────────

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]!);
  const esc = (v: unknown): string => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map(r => headers.map(h => esc(r[h])).join(","))].join("\n");
}

// ─── Auth helper → returns ctx or sends error ────────────────────────────────

interface DataApiCtx { keyId: number; tenantId: number; farmId: number }

async function apiKeyAuth(req: Request, res: Response): Promise<DataApiCtx | null> {
  const authHeader = req.headers.authorization;
  const xApiKey = req.headers["x-api-key"] as string | undefined;
  const rawKey = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : xApiKey?.trim();

  if (!rawKey) {
    res.status(401).json({
      error: "Missing API key.",
      hint: "Send via:  Authorization: Bearer <key>  –or–  X-API-Key: <key>",
    });
    return null;
  }

  const hash = createHash("sha256").update(rawKey).digest("hex");
  const [rec] = await db
    .select()
    .from(dataApiKeysTable)
    .where(and(eq(dataApiKeysTable.keyHash, hash), isNull(dataApiKeysTable.revokedAt)))
    .limit(1);

  if (!rec) {
    res.status(401).json({ error: "Invalid or revoked API key." });
    return null;
  }

  if (!checkRateLimit(rec.id)) {
    res.status(429).json({ error: "Rate limit exceeded — 100 requests per minute per key." });
    return null;
  }

  const [sub] = await db
    .select({ status: subscriptionsTable.status })
    .from(subscriptionsTable)
    .innerJoin(modulesTable, eq(subscriptionsTable.moduleId, modulesTable.id))
    .where(and(
      eq(subscriptionsTable.farmId, rec.farmId),
      eq(subscriptionsTable.tenantId, rec.tenantId),
      eq(modulesTable.key, "data-api"),
    ))
    .limit(1);

  if (!sub || sub.status !== "active") {
    res.status(403).json({ error: "Data API Access module is not active on this farm. Subscribe via the dashboard → Settings." });
    return null;
  }

  db.update(dataApiKeysTable)
    .set({ lastUsedAt: new Date() })
    .where(eq(dataApiKeysTable.id, rec.id))
    .catch(() => {});

  return { keyId: rec.id, tenantId: rec.tenantId, farmId: rec.farmId };
}

// ─── Response helper ──────────────────────────────────────────────────────────

function sendResult(req: Request, res: Response, rows: Record<string, unknown>[]): void {
  if ((req.query.format as string) === "csv") {
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="export.csv"');
    res.send(toCSV(rows));
  } else {
    res.setHeader("X-Total-Count", String(rows.length));
    res.json({ data: rows, count: rows.length });
  }
}

function parseDates(req: Request): { from: Date | undefined; to: Date | undefined } {
  return {
    from: req.query.from ? new Date(req.query.from as string) : undefined,
    to:   req.query.to   ? new Date(req.query.to   as string) : undefined,
  };
}

// ─── Router ───────────────────────────────────────────────────────────────────

const dataExportRouter: IRouter = Router();

// ── Catalogue ─────────────────────────────────────────────────────────────────

dataExportRouter.get("/data-export", async (req: Request, res: Response): Promise<void> => {
  const ctx = await apiKeyAuth(req, res);
  if (!ctx) return;
  res.json({
    version: "1.0",
    authentication: "Authorization: Bearer <key>  –or–  X-API-Key: <key>",
    rateLimit: "100 requests per minute per key",
    queryParams: {
      from: "YYYY-MM-DD — include records on or after this date",
      to:   "YYYY-MM-DD — include records on or before this date",
      format: "'csv' returns CSV; omit for JSON (default)",
    },
    endpoints: [
      { path: "/data-export/fields",             dateFilter: false, description: "Field register — name, field reference, area (ha), farmable area (ha), soil type, current use, organic flag, NVZ flag." },
      { path: "/data-export/livestock-movements", dateFilter: true,  description: "Livestock movements — type, date, species, animal count, from/to location, licence number, ear tag numbers." },
      { path: "/data-export/medicine-records",    dateFilter: true,  description: "Medicine records — product name, batch number, dosage, route, operator, withdrawal period, withdrawal end date." },
      { path: "/data-export/spray-records",       dateFilter: true,  description: "Spray applications — date, area sprayed (ha), application rate, water volume, wind speed/direction, temperature, operator, certificate." },
      { path: "/data-export/soil-tests",          dateFilter: true,  description: "Soil test records joined with results — one row per nutrient per sample (nutrient, value, unit, index, status)." },
      { path: "/data-export/inspections",         dateFilter: true,  description: "Inspection records — type, inspector name, assessing body, date, overall result, summary, next inspection due." },
      { path: "/data-export/staff-training",      dateFilter: true,  description: "Staff training records — course title, provider, date, expiry date, competency achieved, assessor name." },
      { path: "/data-export/equipment",           dateFilter: false, description: "Equipment register — name, type, make, model, serial number, year, current value (pence), status, location." },
      { path: "/data-export/financial-records",   dateFilter: true,  description: "Financial transactions — type, category, description, amount (pence), VAT amount (pence), VAT rate, vendor/customer, payment method." },
      { path: "/data-export/risk-assessments",    dateFilter: false, description: "Risk assessments — title, area, hazard description, risk level, control measures, assessor, assessment date, review date, status." },
    ],
  });
});

// ── Fields ────────────────────────────────────────────────────────────────────

dataExportRouter.get("/data-export/fields", async (req: Request, res: Response): Promise<void> => {
  const ctx = await apiKeyAuth(req, res);
  if (!ctx) return;
  const rows = await db.select({
    id:                    fieldsTable.id,
    name:                  fieldsTable.name,
    fieldReference:        fieldsTable.fieldReference,
    fieldCode:             fieldsTable.fieldCode,
    areaHectares:          fieldsTable.areaHectares,
    farmableAreaHectares:  fieldsTable.farmableAreaHectares,
    soilType:              fieldsTable.soilType,
    currentUse:            fieldsTable.currentUse,
    isOrganic:             fieldsTable.isOrganic,
    isNvz:                 fieldsTable.isNvz,
    nvzLandType:           fieldsTable.nvzLandType,
    isActive:              fieldsTable.isActive,
    notes:                 fieldsTable.notes,
  }).from(fieldsTable).where(eq(fieldsTable.farmId, ctx.farmId)).orderBy(fieldsTable.name);
  sendResult(req, res, rows as Record<string, unknown>[]);
});

// ── Livestock Movements ────────────────────────────────────────────────────────

dataExportRouter.get("/data-export/livestock-movements", async (req: Request, res: Response): Promise<void> => {
  const ctx = await apiKeyAuth(req, res);
  if (!ctx) return;
  const { from, to } = parseDates(req);
  const conds = [eq(livestockMovementsTable.farmId, ctx.farmId)];
  if (from) conds.push(gte(livestockMovementsTable.movementDate, from));
  if (to)   conds.push(lte(livestockMovementsTable.movementDate, to));
  const rows = await db.select({
    id:                 livestockMovementsTable.id,
    movementType:       livestockMovementsTable.movementType,
    movementDate:       livestockMovementsTable.movementDate,
    species:            livestockMovementsTable.species,
    numberOfAnimals:    livestockMovementsTable.numberOfAnimals,
    fromLocation:       livestockMovementsTable.fromLocation,
    toLocation:         livestockMovementsTable.toLocation,
    licenceNumber:      livestockMovementsTable.licenceNumber,
    earTagNumbers:      livestockMovementsTable.earTagNumbers,
    transporterDetails: livestockMovementsTable.transporterDetails,
    reason:             livestockMovementsTable.reason,
    notes:              livestockMovementsTable.notes,
  }).from(livestockMovementsTable).where(and(...conds)).orderBy(desc(livestockMovementsTable.movementDate));
  sendResult(req, res, rows as Record<string, unknown>[]);
});

// ── Medicine Records ───────────────────────────────────────────────────────────

dataExportRouter.get("/data-export/medicine-records", async (req: Request, res: Response): Promise<void> => {
  const ctx = await apiKeyAuth(req, res);
  if (!ctx) return;
  const { from, to } = parseDates(req);
  const conds = [eq(livestockMedicineRecordsTable.farmId, ctx.farmId)];
  if (from) conds.push(gte(livestockMedicineRecordsTable.administeredDate, from));
  if (to)   conds.push(lte(livestockMedicineRecordsTable.administeredDate, to));
  const rows = await db.select({
    id:                   livestockMedicineRecordsTable.id,
    medicineRef:          livestockMedicineRecordsTable.medicineRef,
    medicineName:         livestockMedicineRecordsTable.medicineName,
    batchNumber:          livestockMedicineRecordsTable.batchNumber,
    dosage:               livestockMedicineRecordsTable.dosage,
    administrationRoute:  livestockMedicineRecordsTable.administrationRoute,
    administeredBy:       livestockMedicineRecordsTable.administeredBy,
    administeredDate:     livestockMedicineRecordsTable.administeredDate,
    withdrawalPeriodDays: livestockMedicineRecordsTable.withdrawalPeriodDays,
    withdrawalEndDate:    livestockMedicineRecordsTable.withdrawalEndDate,
    reason:               livestockMedicineRecordsTable.reason,
    vetName:              livestockMedicineRecordsTable.vetName,
    treatmentScope:       livestockMedicineRecordsTable.treatmentScope,
    treatedAnimalCount:   livestockMedicineRecordsTable.treatedAnimalCount,
    notes:                livestockMedicineRecordsTable.notes,
  }).from(livestockMedicineRecordsTable).where(and(...conds)).orderBy(desc(livestockMedicineRecordsTable.administeredDate));
  sendResult(req, res, rows as Record<string, unknown>[]);
});

// ── Spray Records ─────────────────────────────────────────────────────────────

dataExportRouter.get("/data-export/spray-records", async (req: Request, res: Response): Promise<void> => {
  const ctx = await apiKeyAuth(req, res);
  if (!ctx) return;
  const { from, to } = parseDates(req);
  const conds = [eq(sprayApplicationsTable.farmId, ctx.farmId)];
  if (from) conds.push(gte(sprayApplicationsTable.applicationDate, from));
  if (to)   conds.push(lte(sprayApplicationsTable.applicationDate, to));
  const rows = await db.select({
    id:                   sprayApplicationsTable.id,
    applicationDate:      sprayApplicationsTable.applicationDate,
    targetCrop:           sprayApplicationsTable.targetCrop,
    growthStage:          sprayApplicationsTable.growthStage,
    applicationRate:      sprayApplicationsTable.applicationRate,
    rateUnit:             sprayApplicationsTable.rateUnit,
    areaSprayedHa:        sprayApplicationsTable.areaSprayedHa,
    waterVolumeLitres:    sprayApplicationsTable.waterVolumeLitres,
    windSpeedKmh:         sprayApplicationsTable.windSpeedKmh,
    windDirection:        sprayApplicationsTable.windDirection,
    temperatureC:         sprayApplicationsTable.temperatureC,
    operatorName:         sprayApplicationsTable.operatorName,
    certificateNumber:    sprayApplicationsTable.certificateNumber,
    equipmentUsed:        sprayApplicationsTable.equipmentUsed,
    reasonForApplication: sprayApplicationsTable.reasonForApplication,
    batchNumber:          sprayApplicationsTable.batchNumber,
    bufferZoneMetres:     sprayApplicationsTable.bufferZoneMetres,
    notes:                sprayApplicationsTable.notes,
  }).from(sprayApplicationsTable).where(and(...conds)).orderBy(desc(sprayApplicationsTable.applicationDate));
  sendResult(req, res, rows as Record<string, unknown>[]);
});

// ── Soil Tests ────────────────────────────────────────────────────────────────

dataExportRouter.get("/data-export/soil-tests", async (req: Request, res: Response): Promise<void> => {
  const ctx = await apiKeyAuth(req, res);
  if (!ctx) return;
  const { from, to } = parseDates(req);
  const conds = [eq(soilTestRecordsTable.farmId, ctx.farmId)];
  if (from) conds.push(gte(soilTestRecordsTable.sampleDate, from));
  if (to)   conds.push(lte(soilTestRecordsTable.sampleDate, to));
  const rows = await db.select({
    testId:          soilTestRecordsTable.id,
    sampleDate:      soilTestRecordsTable.sampleDate,
    sampleReference: soilTestRecordsTable.sampleReference,
    status:          soilTestRecordsTable.status,
    laboratory:      soilTestRecordsTable.laboratory,
    sampleDepthCm:   soilTestRecordsTable.sampleDepthCm,
    sampledBy:       soilTestRecordsTable.sampledBy,
    testNotes:       soilTestRecordsTable.notes,
    nutrient:        soilTestResultsTable.nutrient,
    resultValue:     soilTestResultsTable.value,
    resultUnit:      soilTestResultsTable.unit,
    resultIndex:     soilTestResultsTable.index,
    resultStatus:    soilTestResultsTable.status,
  }).from(soilTestRecordsTable)
    .leftJoin(soilTestResultsTable, eq(soilTestResultsTable.soilTestId, soilTestRecordsTable.id))
    .where(and(...conds))
    .orderBy(desc(soilTestRecordsTable.sampleDate));
  sendResult(req, res, rows as Record<string, unknown>[]);
});

// ── Inspections ───────────────────────────────────────────────────────────────

dataExportRouter.get("/data-export/inspections", async (req: Request, res: Response): Promise<void> => {
  const ctx = await apiKeyAuth(req, res);
  if (!ctx) return;
  const { from, to } = parseDates(req);
  const conds = [eq(inspectionRecordsTable.farmId, ctx.farmId)];
  if (from) conds.push(gte(inspectionRecordsTable.inspectionDate, from));
  if (to)   conds.push(lte(inspectionRecordsTable.inspectionDate, to));
  const rows = await db.select({
    id:                inspectionRecordsTable.id,
    inspectionType:    inspectionRecordsTable.inspectionType,
    inspectorName:     inspectionRecordsTable.inspectorName,
    inspectionBody:    inspectionRecordsTable.inspectionBody,
    inspectionDate:    inspectionRecordsTable.inspectionDate,
    overallResult:     inspectionRecordsTable.overallResult,
    summary:           inspectionRecordsTable.summary,
    nextInspectionDue: inspectionRecordsTable.nextInspectionDue,
    notes:             inspectionRecordsTable.notes,
  }).from(inspectionRecordsTable).where(and(...conds)).orderBy(desc(inspectionRecordsTable.inspectionDate));
  sendResult(req, res, rows as Record<string, unknown>[]);
});

// ── Staff Training ─────────────────────────────────────────────────────────────

dataExportRouter.get("/data-export/staff-training", async (req: Request, res: Response): Promise<void> => {
  const ctx = await apiKeyAuth(req, res);
  if (!ctx) return;
  const { from, to } = parseDates(req);
  const conds = [eq(staffTrainingRecordsTable.farmId, ctx.farmId)];
  if (from) conds.push(gte(staffTrainingRecordsTable.trainingDate, from));
  if (to)   conds.push(lte(staffTrainingRecordsTable.trainingDate, to));
  const rows = await db.select({
    id:                   staffTrainingRecordsTable.id,
    trainingTitle:        staffTrainingRecordsTable.trainingTitle,
    trainingProvider:     staffTrainingRecordsTable.trainingProvider,
    trainingDate:         staffTrainingRecordsTable.trainingDate,
    expiryDate:           staffTrainingRecordsTable.expiryDate,
    competencyAchieved:   staffTrainingRecordsTable.competencyAchieved,
    assessorName:         staffTrainingRecordsTable.assessorName,
    notes:                staffTrainingRecordsTable.notes,
  }).from(staffTrainingRecordsTable).where(and(...conds)).orderBy(desc(staffTrainingRecordsTable.trainingDate));
  sendResult(req, res, rows as Record<string, unknown>[]);
});

// ── Equipment ─────────────────────────────────────────────────────────────────

dataExportRouter.get("/data-export/equipment", async (req: Request, res: Response): Promise<void> => {
  const ctx = await apiKeyAuth(req, res);
  if (!ctx) return;
  const rows = await db.select({
    id:                   equipmentTable.id,
    assetNumber:          equipmentTable.assetNumber,
    name:                 equipmentTable.name,
    type:                 equipmentTable.type,
    make:                 equipmentTable.make,
    model:                equipmentTable.model,
    serialNumber:         equipmentTable.serialNumber,
    registrationNumber:   equipmentTable.registrationNumber,
    yearOfManufacture:    equipmentTable.yearOfManufacture,
    purchasePricePence:   equipmentTable.purchasePricePence,
    currentValuePence:    equipmentTable.currentValuePence,
    currentHours:         equipmentTable.currentHours,
    odometerKm:           equipmentTable.odometerKm,
    status:               equipmentTable.status,
    location:             equipmentTable.location,
  }).from(equipmentTable).where(eq(equipmentTable.farmId, ctx.farmId)).orderBy(equipmentTable.name);
  sendResult(req, res, rows as Record<string, unknown>[]);
});

// ── Financial Records ─────────────────────────────────────────────────────────

dataExportRouter.get("/data-export/financial-records", async (req: Request, res: Response): Promise<void> => {
  const ctx = await apiKeyAuth(req, res);
  if (!ctx) return;
  const { from, to } = parseDates(req);
  const conds = [eq(financialTransactionsTable.farmId, ctx.farmId)];
  if (from) conds.push(gte(financialTransactionsTable.transactionDate, from));
  if (to)   conds.push(lte(financialTransactionsTable.transactionDate, to));
  const rows = await db.select({
    id:              financialTransactionsTable.id,
    transactionDate: financialTransactionsTable.transactionDate,
    transactionType: financialTransactionsTable.transactionType,
    category:        financialTransactionsTable.category,
    description:     financialTransactionsTable.description,
    amountPence:     financialTransactionsTable.amountPence,
    vatAmountPence:  financialTransactionsTable.vatAmountPence,
    vatRate:         financialTransactionsTable.vatRate,
    currency:        financialTransactionsTable.currency,
    vendorCustomer:  financialTransactionsTable.vendorCustomer,
    paymentMethod:   financialTransactionsTable.paymentMethod,
    reference:       financialTransactionsTable.reference,
    notes:           financialTransactionsTable.notes,
  }).from(financialTransactionsTable).where(and(...conds)).orderBy(desc(financialTransactionsTable.transactionDate));
  sendResult(req, res, rows as Record<string, unknown>[]);
});

// ── Risk Assessments ──────────────────────────────────────────────────────────

dataExportRouter.get("/data-export/risk-assessments", async (req: Request, res: Response): Promise<void> => {
  const ctx = await apiKeyAuth(req, res);
  if (!ctx) return;
  const rows = await db.select({
    id:               riskAssessmentsTable.id,
    title:            riskAssessmentsTable.title,
    area:             riskAssessmentsTable.area,
    hazardDescription: riskAssessmentsTable.hazardDescription,
    riskLevel:        riskAssessmentsTable.riskLevel,
    controlMeasures:  riskAssessmentsTable.controlMeasures,
    assessedBy:       riskAssessmentsTable.assessedBy,
    assessmentDate:   riskAssessmentsTable.assessmentDate,
    reviewDate:       riskAssessmentsTable.reviewDate,
    status:           riskAssessmentsTable.status,
    notes:            riskAssessmentsTable.notes,
  }).from(riskAssessmentsTable).where(eq(riskAssessmentsTable.farmId, ctx.farmId)).orderBy(riskAssessmentsTable.assessmentDate);
  sendResult(req, res, rows as Record<string, unknown>[]);
});

export default dataExportRouter;
