import { pgTable, text, serial, integer, timestamp, boolean, date, numeric } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

// ─── Apiary Register ──────────────────────────────────────────────────────────
export const apiaryRegisterTable = pgTable("apiary_register", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  apiaryName: text("apiary_name").notNull(),
  location: text("location"),
  numberOfHives: integer("number_of_hives").notNull().default(1),
  beebaseRegistration: text("beebase_registration"), // BeeBase registration number (mandatory UK)
  registrationDate: date("registration_date"),
  species: text("species").notNull().default("honeybee"), // "honeybee" | "bumblebee"
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ─── Apiary Inspections ───────────────────────────────────────────────────────
export const apiaryInspectionsTable = pgTable("apiary_inspections", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  apiaryId: integer("apiary_id").notNull().references(() => apiaryRegisterTable.id),
  hiveRef: text("hive_ref"), // individual hive label/number
  inspectionDate: date("inspection_date").notNull(),
  inspectedBy: text("inspected_by").notNull(),
  queenSeen: boolean("queen_seen"),
  queenCells: boolean("queen_cells"),
  queenCellCount: integer("queen_cell_count"),
  broodPattern: text("brood_pattern"), // "excellent" | "good" | "fair" | "poor"
  estimatedColonySize: text("estimated_colony_size"), // "strong" | "medium" | "weak"
  storesAdequate: boolean("stores_adequate"),
  diseaseSigns: text("disease_signs"), // comma-sep: "varroa" | "afb" | "efb" | "nosema" | "chalkbrood" | "none"
  varroaWashCount: integer("varroa_wash_count"), // varroa mites per 100 bees
  temper: text("temper"), // "calm" | "normal" | "defensive"
  supersOnHive: integer("supers_on_hive"),
  actionsTaken: text("actions_taken"),
  treatmentApplied: text("treatment_applied"),
  nextInspectionDue: date("next_inspection_due"),
  notificationSentToApha: boolean("notification_sent_to_apha").notNull().default(false), // AFB/EFB require APHA notification
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Honey Harvest Records ────────────────────────────────────────────────────
export const apiaryHoneyRecordsTable = pgTable("apiary_honey_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  apiaryId: integer("apiary_id").notNull().references(() => apiaryRegisterTable.id),
  harvestDate: date("harvest_date").notNull(),
  quantityKg: numeric("quantity_kg", { precision: 8, scale: 2 }).notNull(),
  lotNumber: text("lot_number"),
  moisturePercent: numeric("moisture_percent", { precision: 4, scale: 1 }),
  sold: boolean("sold").notNull().default(false),
  salePricePencePerKg: integer("sale_price_pence_per_kg"),
  buyerName: text("buyer_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ApiaryRegisterEntry = typeof apiaryRegisterTable.$inferSelect;
export type NewApiaryRegisterEntry = typeof apiaryRegisterTable.$inferInsert;
export type ApiaryInspection = typeof apiaryInspectionsTable.$inferSelect;
export type NewApiaryInspection = typeof apiaryInspectionsTable.$inferInsert;
export type ApiaryHoneyRecord = typeof apiaryHoneyRecordsTable.$inferSelect;
export type NewApiaryHoneyRecord = typeof apiaryHoneyRecordsTable.$inferInsert;
