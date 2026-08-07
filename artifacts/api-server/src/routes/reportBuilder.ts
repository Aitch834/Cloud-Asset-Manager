import { Router, type IRouter, type Request, type Response } from "express";
import {
  db,
  savedReportsTable,
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
} from "@workspace/db";
import { eq, and, gte, lte, ilike, asc, desc, SQL } from "drizzle-orm";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReportFilter {
  field: string;
  operator: "contains" | "eq" | "gte" | "lte";
  value: string;
}

export interface ChartConfig {
  type: "bar" | "line" | "pie";
  labelField: string;
  valueField: string;
  aggregation: "count" | "sum" | "avg";
}

export interface ReportConfig {
  datasource: string;
  columns: string[];
  filters: ReportFilter[];
  dateFrom?: string;
  dateTo?: string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  chart?: ChartConfig;
}

// ─── Column metadata registry ─────────────────────────────────────────────────

export interface ColumnMeta {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "boolean";
  format?: "pence";
}

export interface DatasourceMeta {
  label: string;
  description: string;
  icon: string;
  dateField: string | null;
  columns: ColumnMeta[];
  defaultColumns: string[];
}

export const DATASOURCE_REGISTRY: Record<string, DatasourceMeta> = {
  "fields": {
    label: "Field Register",
    description: "All fields on the holding with area, soil type, and designations.",
    icon: "Map",
    dateField: null,
    columns: [
      { key: "id",                   label: "ID",                  type: "number" },
      { key: "name",                 label: "Field Name",          type: "text" },
      { key: "fieldReference",       label: "Field Reference",     type: "text" },
      { key: "fieldCode",            label: "Field Code",          type: "text" },
      { key: "areaHectares",         label: "Area (ha)",           type: "number" },
      { key: "farmableAreaHectares", label: "Farmable Area (ha)",  type: "number" },
      { key: "soilType",             label: "Soil Type",           type: "text" },
      { key: "currentUse",           label: "Current Use",         type: "text" },
      { key: "isOrganic",            label: "Organic",             type: "boolean" },
      { key: "isNvz",                label: "NVZ",                 type: "boolean" },
      { key: "nvzLandType",          label: "NVZ Land Type",       type: "text" },
      { key: "isActive",             label: "Active",              type: "boolean" },
      { key: "notes",                label: "Notes",               type: "text" },
    ],
    defaultColumns: ["name", "fieldReference", "areaHectares", "farmableAreaHectares", "soilType", "currentUse"],
  },
  "livestock-movements": {
    label: "Livestock Movements",
    description: "All on/off movements with species, dates, and licence details.",
    icon: "ArrowLeftRight",
    dateField: "movementDate",
    columns: [
      { key: "id",                 label: "ID",                  type: "number" },
      { key: "movementType",       label: "Movement Type",       type: "text" },
      { key: "movementDate",       label: "Movement Date",       type: "date" },
      { key: "species",            label: "Species",             type: "text" },
      { key: "numberOfAnimals",    label: "Number of Animals",   type: "number" },
      { key: "fromLocation",       label: "From Location",       type: "text" },
      { key: "toLocation",         label: "To Location",         type: "text" },
      { key: "licenceNumber",      label: "Licence Number",      type: "text" },
      { key: "earTagNumbers",      label: "Ear Tag Numbers",     type: "text" },
      { key: "transporterDetails", label: "Transporter Details", type: "text" },
      { key: "reason",             label: "Reason",              type: "text" },
      { key: "notes",              label: "Notes",               type: "text" },
    ],
    defaultColumns: ["movementDate", "movementType", "species", "numberOfAnimals", "fromLocation", "toLocation"],
  },
  "medicine-records": {
    label: "Medicine Records",
    description: "Medicine administration records with withdrawal periods.",
    icon: "Syringe",
    dateField: "administeredDate",
    columns: [
      { key: "id",                   label: "ID",                    type: "number" },
      { key: "medicineName",         label: "Medicine Name",         type: "text" },
      { key: "medicineRef",          label: "Medicine Ref",          type: "text" },
      { key: "batchNumber",          label: "Batch Number",          type: "text" },
      { key: "dosage",               label: "Dosage",                type: "text" },
      { key: "administrationRoute",  label: "Administration Route",  type: "text" },
      { key: "administeredBy",       label: "Administered By",       type: "text" },
      { key: "administeredDate",     label: "Administered Date",     type: "date" },
      { key: "withdrawalPeriodDays", label: "Withdrawal Period (d)", type: "number" },
      { key: "withdrawalEndDate",    label: "Withdrawal End Date",   type: "date" },
      { key: "reason",               label: "Reason",                type: "text" },
      { key: "vetName",              label: "Vet Name",              type: "text" },
      { key: "treatmentScope",       label: "Treatment Scope",       type: "text" },
      { key: "treatedAnimalCount",   label: "Treated Animals",       type: "number" },
      { key: "notes",                label: "Notes",                 type: "text" },
    ],
    defaultColumns: ["administeredDate", "medicineName", "dosage", "administrationRoute", "administeredBy", "withdrawalEndDate"],
  },
  "spray-records": {
    label: "Spray Applications",
    description: "All spray applications with conditions and operator details.",
    icon: "Droplets",
    dateField: "applicationDate",
    columns: [
      { key: "id",                   label: "ID",                    type: "number" },
      { key: "applicationDate",      label: "Application Date",      type: "date" },
      { key: "targetCrop",           label: "Target Crop",           type: "text" },
      { key: "growthStage",          label: "Growth Stage",          type: "text" },
      { key: "applicationRate",      label: "Application Rate",      type: "number" },
      { key: "rateUnit",             label: "Rate Unit",             type: "text" },
      { key: "areaSprayedHa",        label: "Area Sprayed (ha)",     type: "number" },
      { key: "waterVolumeLitres",    label: "Water Volume (L)",      type: "number" },
      { key: "windSpeedKmh",         label: "Wind Speed (km/h)",     type: "number" },
      { key: "windDirection",        label: "Wind Direction",        type: "text" },
      { key: "temperatureC",         label: "Temperature (°C)",      type: "number" },
      { key: "operatorName",         label: "Operator Name",         type: "text" },
      { key: "certificateNumber",    label: "Certificate Number",    type: "text" },
      { key: "equipmentUsed",        label: "Equipment Used",        type: "text" },
      { key: "reasonForApplication", label: "Reason",                type: "text" },
      { key: "batchNumber",          label: "Batch Number",          type: "text" },
      { key: "bufferZoneMetres",     label: "Buffer Zone (m)",       type: "number" },
      { key: "notes",                label: "Notes",                 type: "text" },
    ],
    defaultColumns: ["applicationDate", "targetCrop", "areaSprayedHa", "applicationRate", "rateUnit", "operatorName"],
  },
  "soil-tests": {
    label: "Soil Tests",
    description: "Soil sample records with per-nutrient results.",
    icon: "FlaskConical",
    dateField: "sampleDate",
    columns: [
      { key: "testId",          label: "Test ID",          type: "number" },
      { key: "sampleDate",      label: "Sample Date",      type: "date" },
      { key: "sampleReference", label: "Sample Reference", type: "text" },
      { key: "status",          label: "Status",           type: "text" },
      { key: "laboratory",      label: "Laboratory",       type: "text" },
      { key: "sampleDepthCm",   label: "Sample Depth (cm)",type: "number" },
      { key: "sampledBy",       label: "Sampled By",       type: "text" },
      { key: "testNotes",       label: "Notes",            type: "text" },
      { key: "nutrient",        label: "Nutrient",         type: "text" },
      { key: "resultValue",     label: "Result Value",     type: "number" },
      { key: "resultUnit",      label: "Result Unit",      type: "text" },
      { key: "resultIndex",     label: "Result Index",     type: "text" },
      { key: "resultStatus",    label: "Result Status",    type: "text" },
    ],
    defaultColumns: ["sampleDate", "sampleReference", "laboratory", "nutrient", "resultValue", "resultUnit", "resultIndex"],
  },
  "inspections": {
    label: "Inspections",
    description: "Formal inspection records and outcomes.",
    icon: "ClipboardCheck",
    dateField: "inspectionDate",
    columns: [
      { key: "id",                label: "ID",                 type: "number" },
      { key: "inspectionType",    label: "Inspection Type",    type: "text" },
      { key: "inspectorName",     label: "Inspector Name",     type: "text" },
      { key: "inspectionBody",    label: "Inspection Body",    type: "text" },
      { key: "inspectionDate",    label: "Inspection Date",    type: "date" },
      { key: "overallResult",     label: "Overall Result",     type: "text" },
      { key: "summary",           label: "Summary",            type: "text" },
      { key: "nextInspectionDue", label: "Next Inspection Due",type: "date" },
      { key: "notes",             label: "Notes",              type: "text" },
    ],
    defaultColumns: ["inspectionDate", "inspectionType", "inspectorName", "inspectionBody", "overallResult"],
  },
  "staff-training": {
    label: "Staff Training",
    description: "Training records with competencies and expiry dates.",
    icon: "GraduationCap",
    dateField: "trainingDate",
    columns: [
      { key: "id",                  label: "ID",                   type: "number" },
      { key: "trainingTitle",       label: "Course Title",         type: "text" },
      { key: "trainingProvider",    label: "Training Provider",    type: "text" },
      { key: "trainingDate",        label: "Training Date",        type: "date" },
      { key: "expiryDate",          label: "Expiry Date",          type: "date" },
      { key: "competencyAchieved",  label: "Competency Achieved",  type: "text" },
      { key: "assessorName",        label: "Assessor Name",        type: "text" },
      { key: "notes",               label: "Notes",                type: "text" },
    ],
    defaultColumns: ["trainingDate", "trainingTitle", "trainingProvider", "competencyAchieved", "expiryDate"],
  },
  "equipment": {
    label: "Equipment Register",
    description: "Full equipment register with values and status.",
    icon: "Tractor",
    dateField: null,
    columns: [
      { key: "id",                   label: "ID",                    type: "number" },
      { key: "assetNumber",          label: "Asset Number",          type: "text" },
      { key: "name",                 label: "Name",                  type: "text" },
      { key: "type",                 label: "Type",                  type: "text" },
      { key: "make",                 label: "Make",                  type: "text" },
      { key: "model",                label: "Model",                 type: "text" },
      { key: "serialNumber",         label: "Serial Number",         type: "text" },
      { key: "registrationNumber",   label: "Registration",          type: "text" },
      { key: "yearOfManufacture",    label: "Year of Manufacture",   type: "number" },
      { key: "purchasePricePence",   label: "Purchase Price",        type: "number", format: "pence" },
      { key: "currentValuePence",    label: "Current Value",         type: "number", format: "pence" },
      { key: "currentHours",         label: "Current Hours",         type: "number" },
      { key: "odometerKm",           label: "Odometer (km)",         type: "number" },
      { key: "status",               label: "Status",                type: "text" },
      { key: "location",             label: "Location",              type: "text" },
    ],
    defaultColumns: ["name", "type", "make", "model", "yearOfManufacture", "status", "currentValuePence"],
  },
  "financial-records": {
    label: "Financial Records",
    description: "Income and expense transactions with VAT details.",
    icon: "PoundSterling",
    dateField: "transactionDate",
    columns: [
      { key: "id",              label: "ID",               type: "number" },
      { key: "transactionDate", label: "Date",             type: "date" },
      { key: "transactionType", label: "Type",             type: "text" },
      { key: "category",        label: "Category",         type: "text" },
      { key: "description",     label: "Description",      type: "text" },
      { key: "amountPence",     label: "Amount",           type: "number", format: "pence" },
      { key: "vatAmountPence",  label: "VAT Amount",       type: "number", format: "pence" },
      { key: "vatRate",         label: "VAT Rate",         type: "number" },
      { key: "currency",        label: "Currency",         type: "text" },
      { key: "vendorCustomer",  label: "Vendor / Customer",type: "text" },
      { key: "paymentMethod",   label: "Payment Method",   type: "text" },
      { key: "reference",       label: "Reference",        type: "text" },
      { key: "notes",           label: "Notes",            type: "text" },
    ],
    defaultColumns: ["transactionDate", "transactionType", "category", "description", "amountPence", "vendorCustomer"],
  },
  "risk-assessments": {
    label: "Risk Assessments",
    description: "Risk assessments with hazard details and control measures.",
    icon: "ShieldAlert",
    dateField: "assessmentDate",
    columns: [
      { key: "id",               label: "ID",               type: "number" },
      { key: "title",            label: "Title",            type: "text" },
      { key: "area",             label: "Area",             type: "text" },
      { key: "hazardDescription",label: "Hazard",           type: "text" },
      { key: "riskLevel",        label: "Risk Level",       type: "text" },
      { key: "controlMeasures",  label: "Control Measures", type: "text" },
      { key: "assessedBy",       label: "Assessed By",      type: "text" },
      { key: "assessmentDate",   label: "Assessment Date",  type: "date" },
      { key: "reviewDate",       label: "Review Date",      type: "date" },
      { key: "status",           label: "Status",           type: "text" },
      { key: "notes",            label: "Notes",            type: "text" },
    ],
    defaultColumns: ["assessmentDate", "title", "area", "riskLevel", "status", "assessedBy"],
  },
};

// ─── Report runner ─────────────────────────────────────────────────────────────

async function runReportQuery(farmId: number, config: ReportConfig): Promise<Record<string, unknown>[]> {
  const from   = config.dateFrom ? new Date(config.dateFrom) : undefined;
  const to     = config.dateTo   ? new Date(config.dateTo)   : undefined;

  switch (config.datasource) {
    case "fields": {
      const conds: SQL[] = [eq(fieldsTable.farmId, farmId)];
      config.filters?.forEach(f => {
        if (f.field === "soilType" && f.value) conds.push(ilike(fieldsTable.soilType, `%${f.value}%`));
        if (f.field === "currentUse" && f.value) conds.push(ilike(fieldsTable.currentUse, `%${f.value}%`));
        if (f.field === "name" && f.value) conds.push(ilike(fieldsTable.name, `%${f.value}%`));
      });
      return db.select({
        id: fieldsTable.id, name: fieldsTable.name, fieldReference: fieldsTable.fieldReference,
        fieldCode: fieldsTable.fieldCode, areaHectares: fieldsTable.areaHectares,
        farmableAreaHectares: fieldsTable.farmableAreaHectares, soilType: fieldsTable.soilType,
        currentUse: fieldsTable.currentUse, isOrganic: fieldsTable.isOrganic,
        isNvz: fieldsTable.isNvz, nvzLandType: fieldsTable.nvzLandType,
        isActive: fieldsTable.isActive, notes: fieldsTable.notes,
      }).from(fieldsTable).where(and(...conds)).orderBy(fieldsTable.name) as Promise<Record<string, unknown>[]>;
    }

    case "livestock-movements": {
      const conds: SQL[] = [eq(livestockMovementsTable.farmId, farmId)];
      if (from) conds.push(gte(livestockMovementsTable.movementDate, from));
      if (to)   conds.push(lte(livestockMovementsTable.movementDate, to));
      config.filters?.forEach(f => {
        if (f.field === "species" && f.value) conds.push(ilike(livestockMovementsTable.species, `%${f.value}%`));
        if (f.field === "movementType" && f.value) conds.push(ilike(livestockMovementsTable.movementType, `%${f.value}%`));
      });
      return db.select({
        id: livestockMovementsTable.id, movementType: livestockMovementsTable.movementType,
        movementDate: livestockMovementsTable.movementDate, species: livestockMovementsTable.species,
        numberOfAnimals: livestockMovementsTable.numberOfAnimals, fromLocation: livestockMovementsTable.fromLocation,
        toLocation: livestockMovementsTable.toLocation, licenceNumber: livestockMovementsTable.licenceNumber,
        earTagNumbers: livestockMovementsTable.earTagNumbers, transporterDetails: livestockMovementsTable.transporterDetails,
        reason: livestockMovementsTable.reason, notes: livestockMovementsTable.notes,
      }).from(livestockMovementsTable).where(and(...conds)).orderBy(desc(livestockMovementsTable.movementDate)) as Promise<Record<string, unknown>[]>;
    }

    case "medicine-records": {
      const conds: SQL[] = [eq(livestockMedicineRecordsTable.farmId, farmId)];
      if (from) conds.push(gte(livestockMedicineRecordsTable.administeredDate, from));
      if (to)   conds.push(lte(livestockMedicineRecordsTable.administeredDate, to));
      config.filters?.forEach(f => {
        if (f.field === "medicineName" && f.value) conds.push(ilike(livestockMedicineRecordsTable.medicineName, `%${f.value}%`));
        if (f.field === "administeredBy" && f.value) conds.push(ilike(livestockMedicineRecordsTable.administeredBy, `%${f.value}%`));
      });
      return db.select({
        id: livestockMedicineRecordsTable.id, medicineRef: livestockMedicineRecordsTable.medicineRef,
        medicineName: livestockMedicineRecordsTable.medicineName, batchNumber: livestockMedicineRecordsTable.batchNumber,
        dosage: livestockMedicineRecordsTable.dosage, administrationRoute: livestockMedicineRecordsTable.administrationRoute,
        administeredBy: livestockMedicineRecordsTable.administeredBy, administeredDate: livestockMedicineRecordsTable.administeredDate,
        withdrawalPeriodDays: livestockMedicineRecordsTable.withdrawalPeriodDays, withdrawalEndDate: livestockMedicineRecordsTable.withdrawalEndDate,
        reason: livestockMedicineRecordsTable.reason, vetName: livestockMedicineRecordsTable.vetName,
        treatmentScope: livestockMedicineRecordsTable.treatmentScope, treatedAnimalCount: livestockMedicineRecordsTable.treatedAnimalCount,
        notes: livestockMedicineRecordsTable.notes,
      }).from(livestockMedicineRecordsTable).where(and(...conds)).orderBy(desc(livestockMedicineRecordsTable.administeredDate)) as Promise<Record<string, unknown>[]>;
    }

    case "spray-records": {
      const conds: SQL[] = [eq(sprayApplicationsTable.farmId, farmId)];
      if (from) conds.push(gte(sprayApplicationsTable.applicationDate, from));
      if (to)   conds.push(lte(sprayApplicationsTable.applicationDate, to));
      config.filters?.forEach(f => {
        if (f.field === "targetCrop" && f.value) conds.push(ilike(sprayApplicationsTable.targetCrop, `%${f.value}%`));
        if (f.field === "operatorName" && f.value) conds.push(ilike(sprayApplicationsTable.operatorName, `%${f.value}%`));
      });
      return db.select({
        id: sprayApplicationsTable.id, applicationDate: sprayApplicationsTable.applicationDate,
        targetCrop: sprayApplicationsTable.targetCrop, growthStage: sprayApplicationsTable.growthStage,
        applicationRate: sprayApplicationsTable.applicationRate, rateUnit: sprayApplicationsTable.rateUnit,
        areaSprayedHa: sprayApplicationsTable.areaSprayedHa, waterVolumeLitres: sprayApplicationsTable.waterVolumeLitres,
        windSpeedKmh: sprayApplicationsTable.windSpeedKmh, windDirection: sprayApplicationsTable.windDirection,
        temperatureC: sprayApplicationsTable.temperatureC, operatorName: sprayApplicationsTable.operatorName,
        certificateNumber: sprayApplicationsTable.certificateNumber, equipmentUsed: sprayApplicationsTable.equipmentUsed,
        reasonForApplication: sprayApplicationsTable.reasonForApplication, batchNumber: sprayApplicationsTable.batchNumber,
        bufferZoneMetres: sprayApplicationsTable.bufferZoneMetres, notes: sprayApplicationsTable.notes,
      }).from(sprayApplicationsTable).where(and(...conds)).orderBy(desc(sprayApplicationsTable.applicationDate)) as Promise<Record<string, unknown>[]>;
    }

    case "soil-tests": {
      const conds: SQL[] = [eq(soilTestRecordsTable.farmId, farmId)];
      if (from) conds.push(gte(soilTestRecordsTable.sampleDate, from));
      if (to)   conds.push(lte(soilTestRecordsTable.sampleDate, to));
      config.filters?.forEach(f => {
        if (f.field === "nutrient" && f.value) conds.push(ilike(soilTestResultsTable.nutrient, `%${f.value}%`));
        if (f.field === "laboratory" && f.value) conds.push(ilike(soilTestRecordsTable.laboratory, `%${f.value}%`));
      });
      return db.select({
        testId: soilTestRecordsTable.id, sampleDate: soilTestRecordsTable.sampleDate,
        sampleReference: soilTestRecordsTable.sampleReference, status: soilTestRecordsTable.status,
        laboratory: soilTestRecordsTable.laboratory, sampleDepthCm: soilTestRecordsTable.sampleDepthCm,
        sampledBy: soilTestRecordsTable.sampledBy, testNotes: soilTestRecordsTable.notes,
        nutrient: soilTestResultsTable.nutrient, resultValue: soilTestResultsTable.value,
        resultUnit: soilTestResultsTable.unit, resultIndex: soilTestResultsTable.index,
        resultStatus: soilTestResultsTable.status,
      }).from(soilTestRecordsTable)
        .leftJoin(soilTestResultsTable, eq(soilTestResultsTable.soilTestId, soilTestRecordsTable.id))
        .where(and(...conds))
        .orderBy(desc(soilTestRecordsTable.sampleDate)) as Promise<Record<string, unknown>[]>;
    }

    case "inspections": {
      const conds: SQL[] = [eq(inspectionRecordsTable.farmId, farmId)];
      if (from) conds.push(gte(inspectionRecordsTable.inspectionDate, from));
      if (to)   conds.push(lte(inspectionRecordsTable.inspectionDate, to));
      config.filters?.forEach(f => {
        if (f.field === "inspectionType" && f.value) conds.push(ilike(inspectionRecordsTable.inspectionType, `%${f.value}%`));
        if (f.field === "overallResult" && f.value) conds.push(ilike(inspectionRecordsTable.overallResult, `%${f.value}%`));
      });
      return db.select({
        id: inspectionRecordsTable.id, inspectionType: inspectionRecordsTable.inspectionType,
        inspectorName: inspectionRecordsTable.inspectorName, inspectionBody: inspectionRecordsTable.inspectionBody,
        inspectionDate: inspectionRecordsTable.inspectionDate, overallResult: inspectionRecordsTable.overallResult,
        summary: inspectionRecordsTable.summary, nextInspectionDue: inspectionRecordsTable.nextInspectionDue,
        notes: inspectionRecordsTable.notes,
      }).from(inspectionRecordsTable).where(and(...conds)).orderBy(desc(inspectionRecordsTable.inspectionDate)) as Promise<Record<string, unknown>[]>;
    }

    case "staff-training": {
      const conds: SQL[] = [eq(staffTrainingRecordsTable.farmId, farmId)];
      if (from) conds.push(gte(staffTrainingRecordsTable.trainingDate, from));
      if (to)   conds.push(lte(staffTrainingRecordsTable.trainingDate, to));
      config.filters?.forEach(f => {
        if (f.field === "trainingTitle" && f.value) conds.push(ilike(staffTrainingRecordsTable.trainingTitle, `%${f.value}%`));
        if (f.field === "trainingProvider" && f.value) conds.push(ilike(staffTrainingRecordsTable.trainingProvider, `%${f.value}%`));
      });
      return db.select({
        id: staffTrainingRecordsTable.id, trainingTitle: staffTrainingRecordsTable.trainingTitle,
        trainingProvider: staffTrainingRecordsTable.trainingProvider, trainingDate: staffTrainingRecordsTable.trainingDate,
        expiryDate: staffTrainingRecordsTable.expiryDate, competencyAchieved: staffTrainingRecordsTable.competencyAchieved,
        assessorName: staffTrainingRecordsTable.assessorName, notes: staffTrainingRecordsTable.notes,
      }).from(staffTrainingRecordsTable).where(and(...conds)).orderBy(desc(staffTrainingRecordsTable.trainingDate)) as Promise<Record<string, unknown>[]>;
    }

    case "equipment": {
      const conds: SQL[] = [eq(equipmentTable.farmId, farmId)];
      config.filters?.forEach(f => {
        if (f.field === "type" && f.value) conds.push(ilike(equipmentTable.type, `%${f.value}%`));
        if (f.field === "status" && f.value) conds.push(ilike(equipmentTable.status, `%${f.value}%`));
        if (f.field === "name" && f.value) conds.push(ilike(equipmentTable.name, `%${f.value}%`));
      });
      return db.select({
        id: equipmentTable.id, assetNumber: equipmentTable.assetNumber, name: equipmentTable.name,
        type: equipmentTable.type, make: equipmentTable.make, model: equipmentTable.model,
        serialNumber: equipmentTable.serialNumber, registrationNumber: equipmentTable.registrationNumber,
        yearOfManufacture: equipmentTable.yearOfManufacture, purchasePricePence: equipmentTable.purchasePricePence,
        currentValuePence: equipmentTable.currentValuePence, currentHours: equipmentTable.currentHours,
        odometerKm: equipmentTable.odometerKm, status: equipmentTable.status, location: equipmentTable.location,
      }).from(equipmentTable).where(and(...conds)).orderBy(equipmentTable.name) as Promise<Record<string, unknown>[]>;
    }

    case "financial-records": {
      const conds: SQL[] = [eq(financialTransactionsTable.farmId, farmId)];
      if (from) conds.push(gte(financialTransactionsTable.transactionDate, from));
      if (to)   conds.push(lte(financialTransactionsTable.transactionDate, to));
      config.filters?.forEach(f => {
        if (f.field === "transactionType" && f.value) conds.push(ilike(financialTransactionsTable.transactionType, `%${f.value}%`));
        if (f.field === "category" && f.value) conds.push(ilike(financialTransactionsTable.category, `%${f.value}%`));
        if (f.field === "vendorCustomer" && f.value) conds.push(ilike(financialTransactionsTable.vendorCustomer, `%${f.value}%`));
      });
      return db.select({
        id: financialTransactionsTable.id, transactionDate: financialTransactionsTable.transactionDate,
        transactionType: financialTransactionsTable.transactionType, category: financialTransactionsTable.category,
        description: financialTransactionsTable.description, amountPence: financialTransactionsTable.amountPence,
        vatAmountPence: financialTransactionsTable.vatAmountPence, vatRate: financialTransactionsTable.vatRate,
        currency: financialTransactionsTable.currency, vendorCustomer: financialTransactionsTable.vendorCustomer,
        paymentMethod: financialTransactionsTable.paymentMethod, reference: financialTransactionsTable.reference,
        notes: financialTransactionsTable.notes,
      }).from(financialTransactionsTable).where(and(...conds)).orderBy(desc(financialTransactionsTable.transactionDate)) as Promise<Record<string, unknown>[]>;
    }

    case "risk-assessments": {
      const conds: SQL[] = [eq(riskAssessmentsTable.farmId, farmId)];
      config.filters?.forEach(f => {
        if (f.field === "riskLevel" && f.value) conds.push(ilike(riskAssessmentsTable.riskLevel, `%${f.value}%`));
        if (f.field === "status" && f.value) conds.push(ilike(riskAssessmentsTable.status, `%${f.value}%`));
        if (f.field === "area" && f.value) conds.push(ilike(riskAssessmentsTable.area, `%${f.value}%`));
      });
      return db.select({
        id: riskAssessmentsTable.id, title: riskAssessmentsTable.title, area: riskAssessmentsTable.area,
        hazardDescription: riskAssessmentsTable.hazardDescription, riskLevel: riskAssessmentsTable.riskLevel,
        controlMeasures: riskAssessmentsTable.controlMeasures, assessedBy: riskAssessmentsTable.assessedBy,
        assessmentDate: riskAssessmentsTable.assessmentDate, reviewDate: riskAssessmentsTable.reviewDate,
        status: riskAssessmentsTable.status, notes: riskAssessmentsTable.notes,
      }).from(riskAssessmentsTable).where(and(...conds)).orderBy(riskAssessmentsTable.assessmentDate) as Promise<Record<string, unknown>[]>;
    }

    default:
      return [];
  }
}

// Apply client-side sort after query (datasource-agnostic)
function sortRows(rows: Record<string, unknown>[], sortField?: string, dir?: "asc" | "desc"): Record<string, unknown>[] {
  if (!sortField) return rows;
  return [...rows].sort((a, b) => {
    const av = a[sortField]; const bv = b[sortField];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return dir === "desc" ? -cmp : cmp;
  });
}

// ─── CSV helper ───────────────────────────────────────────────────────────────

function toCSV(rows: Record<string, unknown>[], columns: string[]): string {
  if (!rows.length) return "";
  const esc = (v: unknown): string => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [columns.join(","), ...rows.map(r => columns.map(c => esc(r[c])).join(","))].join("\n");
}

// ─── Router ───────────────────────────────────────────────────────────────────

const reportBuilderRouter: IRouter = Router();

// GET /farms/:farmId/reports — list saved reports
reportBuilderRouter.get("/farms/:farmId/reports", async (req: Request, res: Response): Promise<void> => {
  const tenantId = (req as any).tenantId as number | undefined;
  const farmId   = Number(req.params.farmId);
  if (!tenantId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const reports = await db.select({
    id:          savedReportsTable.id,
    name:        savedReportsTable.name,
    description: savedReportsTable.description,
    config:      savedReportsTable.config,
    createdBy:   savedReportsTable.createdBy,
    createdAt:   savedReportsTable.createdAt,
    updatedAt:   savedReportsTable.updatedAt,
  }).from(savedReportsTable)
    .where(and(eq(savedReportsTable.farmId, farmId), eq(savedReportsTable.tenantId, tenantId)))
    .orderBy(desc(savedReportsTable.updatedAt));
  res.json({ reports });
});

// POST /farms/:farmId/reports — create
reportBuilderRouter.post("/farms/:farmId/reports", async (req: Request, res: Response): Promise<void> => {
  const tenantId = (req as any).tenantId as number | undefined;
  const farmId   = Number(req.params.farmId);
  const userId   = (req as any).userId as string | undefined;
  if (!tenantId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const { name, description, config } = req.body as { name?: string; description?: string; config?: ReportConfig };
  if (!name?.trim()) { res.status(400).json({ error: "Report name is required" }); return; }
  if (!config?.datasource) { res.status(400).json({ error: "Report config with datasource is required" }); return; }
  const [created] = await db.insert(savedReportsTable).values({
    tenantId, farmId, name: name.trim(), description: description?.trim() ?? null,
    config: config as any, createdBy: userId ?? null,
  }).returning();
  res.status(201).json({ report: created });
});

// PUT /farms/:farmId/reports/:id — update
reportBuilderRouter.put("/farms/:farmId/reports/:id", async (req: Request, res: Response): Promise<void> => {
  const tenantId = (req as any).tenantId as number | undefined;
  const farmId   = Number(req.params.farmId);
  const id       = Number(req.params.id);
  if (!tenantId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const { name, description, config } = req.body as { name?: string; description?: string; config?: ReportConfig };
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (name?.trim()) updates.name = name.trim();
  if (description !== undefined) updates.description = description?.trim() ?? null;
  if (config) updates.config = config;
  const [updated] = await db.update(savedReportsTable)
    .set(updates)
    .where(and(eq(savedReportsTable.id, id), eq(savedReportsTable.farmId, farmId), eq(savedReportsTable.tenantId, tenantId)))
    .returning();
  if (!updated) { res.status(404).json({ error: "Report not found" }); return; }
  res.json({ report: updated });
});

// DELETE /farms/:farmId/reports/:id
reportBuilderRouter.delete("/farms/:farmId/reports/:id", async (req: Request, res: Response): Promise<void> => {
  const tenantId = (req as any).tenantId as number | undefined;
  const farmId   = Number(req.params.farmId);
  const id       = Number(req.params.id);
  if (!tenantId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const [deleted] = await db.delete(savedReportsTable)
    .where(and(eq(savedReportsTable.id, id), eq(savedReportsTable.farmId, farmId), eq(savedReportsTable.tenantId, tenantId)))
    .returning({ id: savedReportsTable.id });
  if (!deleted) { res.status(404).json({ error: "Report not found" }); return; }
  res.json({ success: true });
});

// GET /reports/datasources — metadata catalogue
reportBuilderRouter.get("/reports/datasources", (_req: Request, res: Response): void => {
  res.json({ datasources: DATASOURCE_REGISTRY });
});

// POST /farms/:farmId/reports/run — ad-hoc run (no save)
reportBuilderRouter.post("/farms/:farmId/reports/run", async (req: Request, res: Response): Promise<void> => {
  const tenantId = (req as any).tenantId as number | undefined;
  const farmId   = Number(req.params.farmId);
  if (!tenantId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const config = req.body as ReportConfig;
  if (!config?.datasource || !DATASOURCE_REGISTRY[config.datasource]) {
    res.status(400).json({ error: "Invalid or missing datasource" }); return;
  }
  const allRows = await runReportQuery(farmId, config);
  const rows    = sortRows(allRows, config.sortField, config.sortDirection);
  const cols    = config.columns?.length ? config.columns : (DATASOURCE_REGISTRY[config.datasource]?.defaultColumns ?? []);
  const meta    = DATASOURCE_REGISTRY[config.datasource]!;

  if ((req.query.format as string) === "csv") {
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${meta.label.replace(/\s+/g, "_")}.csv"`);
    res.send(toCSV(rows, cols)); return;
  }
  res.json({ data: rows, count: rows.length, columns: meta.columns, selectedColumns: cols });
});

// POST /farms/:farmId/reports/:id/run — run a saved report
reportBuilderRouter.post("/farms/:farmId/reports/:id/run", async (req: Request, res: Response): Promise<void> => {
  const tenantId = (req as any).tenantId as number | undefined;
  const farmId   = Number(req.params.farmId);
  const id       = Number(req.params.id);
  if (!tenantId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const [report] = await db.select().from(savedReportsTable)
    .where(and(eq(savedReportsTable.id, id), eq(savedReportsTable.farmId, farmId), eq(savedReportsTable.tenantId, tenantId)))
    .limit(1);
  if (!report) { res.status(404).json({ error: "Report not found" }); return; }
  const config  = report.config as ReportConfig;
  const allRows = await runReportQuery(farmId, config);
  const rows    = sortRows(allRows, config.sortField, config.sortDirection);
  const cols    = config.columns?.length ? config.columns : (DATASOURCE_REGISTRY[config.datasource]?.defaultColumns ?? []);
  const meta    = DATASOURCE_REGISTRY[config.datasource];

  if ((req.query.format as string) === "csv") {
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${report.name.replace(/\s+/g, "_")}.csv"`);
    res.send(toCSV(rows, cols)); return;
  }
  res.json({ data: rows, count: rows.length, columns: meta?.columns ?? [], selectedColumns: cols });
});

export default reportBuilderRouter;
