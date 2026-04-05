import { pgTable, text, serial, integer, timestamp, boolean, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

export const visitorContractorLogTable = pgTable("visitor_contractor_log", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  visitorName: text("visitor_name").notNull(),
  company: text("company"),
  purpose: text("purpose").notNull(),
  vehicleRegistration: text("vehicle_registration"),
  arrivalTime: timestamp("arrival_time", { withTimezone: true }).notNull(),
  departureTime: timestamp("departure_time", { withTimezone: true }),
  areasVisited: text("areas_visited"),
  biosecurityDeclarationSigned: boolean("biosecurity_declaration_signed").notNull().default(false),
  healthDeclarationSigned: boolean("health_declaration_signed").notNull().default(false),
  biosecuritySignature: text("biosecurity_signature"),
  healthSignature: text("health_signature"),
  escortedBy: text("escorted_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pestControlRecordsTable = pgTable("pest_control_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  pestType: text("pest_type").notNull(),
  location: text("location"),
  treatmentMethod: text("treatment_method"),
  productUsed: text("product_used"),
  treatmentDate: timestamp("treatment_date", { withTimezone: true }).notNull(),
  treatedBy: text("treated_by"),
  followUpDate: timestamp("follow_up_date", { withTimezone: true }),
  outcome: text("outcome"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cleaningDisinfectionRecordsTable = pgTable("cleaning_disinfection_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  area: text("area").notNull(),
  cleaningType: text("cleaning_type").notNull(),
  productsUsed: text("products_used"),
  dilutionRate: text("dilution_rate"),
  contactTime: text("contact_time"),
  cleanedBy: text("cleaned_by"),
  cleanedDate: timestamp("cleaned_date", { withTimezone: true }).notNull(),
  nextDueDate: timestamp("next_due_date", { withTimezone: true }),
  verifiedBy: text("verified_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pestControlPhotosTable = pgTable("pest_control_photos", {
  id: serial("id").primaryKey(),
  recordId: integer("record_id").notNull().references(() => pestControlRecordsTable.id, { onDelete: "cascade" }),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  objectPath: text("object_path").notNull(),
  fileName: text("file_name"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const biosecurityPlansTable = pgTable("biosecurity_plans", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  restrictedAreas: text("restricted_areas"),
  visitorProcedures: text("visitor_procedures"),
  vehicleEntryProcedures: text("vehicle_entry_procedures"),
  cleaningProtocols: text("cleaning_protocols"),
  pestManagementApproach: text("pest_management_approach"),
  diseaseResponsePlan: text("disease_response_plan"),
  wasteManagementProcedures: text("waste_management_procedures"),
  waterSourceProtection: text("water_source_protection"),
  staffResponsibilities: text("staff_responsibilities"),
  // Emergency contact details — for quick reference during an incident
  farmVetName: text("farm_vet_name"),
  farmVetPhone: text("farm_vet_phone"),
  farmVetEmail: text("farm_vet_email"),
  aphaAreaOffice: text("apha_area_office"),
  aphaPhone: text("apha_phone"),

  // Additional plan sections
  footwearHygieneProcedures: text("footwear_hygiene_procedures"),
  newAnimalIsolationProcedures: text("new_animal_isolation_procedures"),
  feedSecurityProcedures: text("feed_security_procedures"),
  diseaseSuspicionProcedures: text("disease_suspicion_procedures"),

  planAuthor: text("plan_author"),
  lastReviewedDate: date("last_reviewed_date"),
  nextReviewDate: date("next_review_date"),
  approvedBy: text("approved_by"),
  versionNumber: text("version_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
