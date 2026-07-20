import { pgTable, text, serial, integer, timestamp, numeric, boolean, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

// ─── Straw Bale Inventory ─────────────────────────────────────────────────────
// Commercial harvested straw bales (wheat/barley/oat) — NOT AI semen straws.
// Tracks bale batches from harvest through to sale or on-farm use.
export const strawBaleInventoryTable = pgTable("straw_bale_inventory", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  // Batch identity
  batchRef: text("batch_ref"),                          // e.g. WS-2026-001
  strawType: text("straw_type").notNull(),              // Wheat | Barley | Oat | Oilseed Rape
  baleFormat: text("bale_format").notNull(),            // Small Rectangular | Big Round | Big Square
  harvestDate: date("harvest_date"),
  fieldOfOrigin: text("field_of_origin"),               // free text or field name lookup
  cropVariety: text("crop_variety"),
  // Quantity
  quantityBales: integer("quantity_bales").notNull().default(0),
  baleWeightKg: numeric("bale_weight_kg", { precision: 7, scale: 1 }),  // approx kg per bale
  // Quality
  moistureAtBaling: numeric("moisture_at_baling", { precision: 5, scale: 2 }),  // %
  moistureStatus: text("moisture_status"),              // Safe | Warning | Action Required
  // Storage
  storageLocation: text("storage_location"),            // barn name / field / grid ref
  storageType: text("storage_type"),                    // Indoor | Outdoor Covered | Outdoor Uncovered
  stackingStartDate: date("stacking_start_date"),
  // Red Tractor
  redTractorCertified: boolean("red_tractor_certified").default(false),
  combinableCropsPassportRef: text("combinable_crops_passport_ref"),
  // PPP residue risk
  pppResidueRisk: text("ppp_residue_risk"),             // Low | Medium | High
  fusariumRiskAssessed: boolean("fusarium_risk_assessed").default(false),
  // Status
  status: text("status").notNull().default("in_stock"), // in_stock | sold | used_on_farm | disposed
  quantityRemaining: integer("quantity_remaining"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ─── Straw Sales Records ───────────────────────────────────────────────────────
// Commercial sales of straw bales — captures buyer details, VAT classification,
// and traceability chain (one step forward from farm — EC Reg 178/2002).
export const strawSalesRecordsTable = pgTable("straw_sales_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  baleInventoryId: integer("bale_inventory_id").references(() => strawBaleInventoryTable.id),
  // Sale reference
  invoiceRef: text("invoice_ref"),
  saleDate: date("sale_date").notNull(),
  deliveryDate: date("delivery_date"),
  // Product
  strawType: text("straw_type").notNull(),
  baleFormat: text("bale_format").notNull(),
  quantitySold: integer("quantity_sold").notNull(),
  batchRef: text("batch_ref"),                          // traceability link
  // VAT classification — critical for correct VAT rate
  intendedUse: text("intended_use").notNull(),          // Animal Feed | Bedding | Horticultural | Unknown
  vatClassification: text("vat_classification").notNull(), // Zero-rated (0%) | Standard-rated (20%)
  // Pricing
  pricePerBalePence: integer("price_per_bale_pence"),
  totalValuePence: integer("total_value_pence"),
  vatAmountPence: integer("vat_amount_pence"),
  // Buyer (one-step-forward traceability — EC Reg 178/2002)
  buyerName: text("buyer_name").notNull(),
  buyerAddress: text("buyer_address"),
  buyerPostcode: text("buyer_postcode"),
  buyerPhone: text("buyer_phone"),
  buyerEmail: text("buyer_email"),
  buyerType: text("buyer_type"),                        // Farmer | Merchant | Market Garden | Contractor | Other
  // Transport
  transportedBy: text("transported_by"),               // Own transport | Buyer collects | Third-party haulier
  haulierName: text("haulier_name"),
  vehicleReg: text("vehicle_reg"),
  // Red Tractor passport
  passportIssued: boolean("passport_issued").default(false),
  passportRef: text("passport_ref"),
  // Status
  paymentStatus: text("payment_status").notNull().default("unpaid"), // unpaid | paid | overdue
  paymentDate: date("payment_date"),
  // Document
  documentPath: text("document_path"),
  documentName: text("document_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ─── Straw Moisture & Condition Checks ───────────────────────────────────────
// Ongoing storage monitoring — HSE INDG125 and fire risk management.
// Monitor for first 10–14 days (spontaneous combustion window), then periodically.
export const strawMoistureChecksTable = pgTable("straw_moisture_checks", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  baleInventoryId: integer("bale_inventory_id").references(() => strawBaleInventoryTable.id),
  batchRef: text("batch_ref"),
  checkDate: date("check_date").notNull(),
  daysFromStacking: integer("days_from_stacking"),
  // Readings
  moisturePercent: numeric("moisture_percent", { precision: 5, scale: 2 }),
  temperatureCelsius: numeric("temperature_celsius", { precision: 5, scale: 2 }),
  odourObserved: boolean("odour_observed").default(false),    // caramel/musty = heating
  odourDescription: text("odour_description"),
  // Condition
  overallCondition: text("overall_condition").notNull().default("Good"), // Good | Monitor | Action Required | Unsafe
  actionTaken: text("action_taken"),
  checkedBy: text("checked_by"),
  nextCheckDue: date("next_check_due"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
