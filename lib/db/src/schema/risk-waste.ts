import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { suppliersTable } from "./stock-suppliers";

export const flyTippingIncidentsTable = pgTable("fly_tipping_incidents", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  discoveredAt: text("discovered_at").notNull(),
  locationDescription: text("location_description").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  wasteTypes: text("waste_types"),
  estimatedQuantity: text("estimated_quantity"),
  isHazardous: boolean("is_hazardous").notNull().default(false),
  accessPoint: text("access_point"),
  policeReported: boolean("police_reported").notNull().default(false),
  policeRefNumber: text("police_ref_number"),
  councilReported: boolean("council_reported").notNull().default(false),
  councilRefNumber: text("council_ref_number"),
  eaReported: boolean("ea_reported").notNull().default(false),
  eaRefNumber: text("ea_ref_number"),
  clearanceStatus: text("clearance_status").notNull().default("pending"),
  clearanceContractor: text("clearance_contractor"),
  clearanceDate: text("clearance_date"),
  wasteTransferNoteRef: text("waste_transfer_note_ref"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const flyTippingPhotosTable = pgTable("fly_tipping_photos", {
  id: serial("id").primaryKey(),
  incidentId: integer("incident_id").notNull().references(() => flyTippingIncidentsTable.id, { onDelete: "cascade" }),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  objectPath: text("object_path").notNull(),
  fileName: text("file_name"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const riskAssessmentsTable = pgTable("risk_assessments", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  title: text("title").notNull(),
  area: text("area"),
  hazardDescription: text("hazard_description").notNull(),
  riskLevel: text("risk_level"),
  controlMeasures: text("control_measures"),
  assessedBy: text("assessed_by"),
  assessmentDate: timestamp("assessment_date", { withTimezone: true }).notNull(),
  reviewDate: timestamp("review_date", { withTimezone: true }),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const coshhRecordsTable = pgTable("coshh_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  substanceName: text("substance_name").notNull(),
  manufacturer: text("manufacturer"),
  hazardClassification: text("hazard_classification"),
  usageArea: text("usage_area"),
  storageLocation: text("storage_location"),
  controlMeasures: text("control_measures"),
  ppe: text("ppe"),
  emergencyProcedures: text("emergency_procedures"),
  assessedBy: text("assessed_by"),
  assessmentDate: timestamp("assessment_date", { withTimezone: true }).notNull(),
  reviewDate: timestamp("review_date", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const wasteDisposalRecordsTable = pgTable("waste_disposal_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  wasteType: text("waste_type").notNull(),
  quantity: text("quantity"),
  disposalMethod: text("disposal_method").notNull(),
  disposalDate: timestamp("disposal_date", { withTimezone: true }).notNull(),
  carrierId: integer("carrier_id").references(() => suppliersTable.id),
  carrierName: text("carrier_name"),
  carrierLicence: text("carrier_licence"),
  carrierRegistrationType: text("carrier_registration_type"),
  ewcCode: text("ewc_code"),
  destinationSite: text("destination_site"),
  wasteTransferNote: text("waste_transfer_note"),
  receiptPhotoPath: text("receipt_photo_path"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
