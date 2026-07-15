import { pgTable, serial, integer, text, date, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

// ─── Organic Poultry Certification ────────────────────────────────────────────
export const organicPoultryCertificationTable = pgTable("organic_poultry_certification", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  certifyingBody: text("certifying_body").notNull(),
  certificateNumber: text("certificate_number"),
  certificateType: text("certificate_type").notNull().default("laying_hens"),
  issueDate: date("issue_date"),
  expiryDate: date("expiry_date"),
  scope: text("scope"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Organic Poultry Outdoor Access Records ────────────────────────────────────
export const organicPoultryAccessRecordsTable = pgTable("organic_poultry_access_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  recordDate: date("record_date").notNull(),
  flockRef: text("flock_ref"),
  houseOrLocation: text("house_or_location"),
  birdsInFlock: integer("birds_in_flock"),
  birdsAccessedRange: integer("birds_accessed_range"),
  rangeAreaHa: numeric("range_area_ha", { precision: 8, scale: 2 }),
  birdsPerHa: numeric("birds_per_ha", { precision: 8, scale: 2 }),
  accessDurationHours: numeric("access_duration_hours", { precision: 4, scale: 1 }),
  vegetationCondition: text("vegetation_condition"),
  accessBlocked: boolean("access_blocked").notNull().default(false),
  accessBlockReason: text("access_block_reason"),
  complianceStatus: text("compliance_status").notNull().default("compliant"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Organic Poultry Feed Records ─────────────────────────────────────────────
export const organicPoultryFeedRecordsTable = pgTable("organic_poultry_feed_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  deliveryDate: date("delivery_date").notNull(),
  productName: text("product_name").notNull(),
  productType: text("product_type"),
  organicApprovalStatus: text("organic_approval_status").notNull().default("certified_organic"),
  certifierApprovalReference: text("certifier_approval_reference"),
  quantityKg: numeric("quantity_kg", { precision: 10, scale: 2 }),
  supplierName: text("supplier_name"),
  supplierLotNumber: text("supplier_lot_number"),
  invoiceReference: text("invoice_reference"),
  flock: text("flock"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Organic Poultry Derogations ──────────────────────────────────────────────
export const organicPoultryDerogationsTable = pgTable("organic_poultry_derogations", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  caseReference: text("case_reference"),
  inputName: text("input_name").notNull(),
  inputType: text("input_type"),
  regulatoryBasis: text("regulatory_basis"),
  certifyingBody: text("certifying_body"),
  certifierRef: text("certifier_ref"),
  applicationDate: date("application_date"),
  justification: text("justification"),
  status: text("status").notNull().default("pending"),
  decisionDate: date("decision_date"),
  expiryDate: date("expiry_date"),
  approvalConditions: text("approval_conditions"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
