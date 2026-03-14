import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
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
