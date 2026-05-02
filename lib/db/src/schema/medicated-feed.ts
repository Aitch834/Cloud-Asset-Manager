import { pgTable, text, serial, integer, timestamp, numeric, boolean, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

// ─── Medicated Feed Records ───────────────────────────────────────────────────
// Tracks medicated compound feeds (e.g. Tylan-medicated, zinc oxide) separately
// from injectable medicine records as required by Red Tractor and AMTRA.
export const medicatedFeedRecordsTable = pgTable("medicated_feed_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  deliveryDate: date("delivery_date").notNull(),
  productName: text("product_name").notNull(),
  activeIngredient: text("active_ingredient").notNull(),
  medicinalCategory: text("medicinal_category").notNull(),
  supplierName: text("supplier_name"),
  batchNumber: text("batch_number").notNull(),
  expiryDate: date("expiry_date"),
  quantityDeliveredKg: numeric("quantity_delivered_kg", { precision: 10, scale: 2 }).notNull(),
  speciesTargeted: text("species_targeted").notNull(),
  herdFlockRef: text("herd_flock_ref"),
  numberOfAnimals: integer("number_of_animals"),
  feedingStartDate: date("feeding_start_date").notNull(),
  feedingEndDate: date("feeding_end_date"),
  feedingDurationDays: integer("feeding_duration_days"),
  dailyRationKgPerAnimal: numeric("daily_ration_kg_per_animal", { precision: 7, scale: 3 }),
  indicationDiagnosis: text("indication_diagnosis").notNull(),
  prescribingVetName: text("prescribing_vet_name"),
  prescribingVetPractice: text("prescribing_vet_practice"),
  veterinaryPrescriptionRef: text("veterinary_prescription_ref"),
  prescriptionOnFile: boolean("prescription_on_file").default(false),
  withdrawalPeriodDays: integer("withdrawal_period_days"),
  withdrawalEndDate: date("withdrawal_end_date"),
  stockUsedKg: numeric("stock_used_kg", { precision: 10, scale: 2 }),
  stockRemainingKg: numeric("stock_remaining_kg", { precision: 10, scale: 2 }),
  unusedStockDisposalMethod: text("unused_stock_disposal_method"),
  unusedStockDisposalDate: date("unused_stock_disposal_date"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
