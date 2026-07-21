import { pgTable, text, serial, integer, timestamp, numeric, boolean, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { fieldsTable } from "./fields-crops";

// ─── Straw Baling Operations ──────────────────────────────────────────────────
// Phase 1 of the straw workflow: records the baling event on a field.
// One record per baling session (could span one or more field hours).
// Creates a mirrored record in field_operations for field history.
export const strawBalingOperationsTable = pgTable("straw_baling_operations", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  // Field
  fieldId: integer("field_id").references(() => fieldsTable.id, { onDelete: "set null" }),
  fieldOfOrigin: text("field_of_origin"),
  // Crop / product
  strawType: text("straw_type").notNull(),              // Wheat Straw | Barley Straw | Oat Straw | Oilseed Rape Straw
  baleFormat: text("bale_format").notNull(),             // Small Rectangular | Big Round | Big Square
  cropVariety: text("crop_variety"),
  operationDate: date("operation_date").notNull(),
  areaHa: numeric("area_ha", { precision: 10, scale: 4 }),
  // Production output
  totalBalesProduced: integer("total_bales_produced").notNull().default(0),
  baleWeightKg: numeric("bale_weight_kg", { precision: 7, scale: 1 }),
  // Machine (equipment IDs stored as plain integers — no FK to avoid circular imports)
  tractorVehicleId: integer("tractor_vehicle_id"),
  tractorDescription: text("tractor_description"),
  balerImplementId: integer("baler_implement_id"),
  balerDescription: text("baler_description"),
  operatorName: text("operator_name"),
  machineHours: numeric("machine_hours", { precision: 8, scale: 2 }),
  labourHours: numeric("labour_hours", { precision: 8, scale: 2 }),
  // Weather at time of baling
  weatherConditions: text("weather_conditions"),        // Sunny | Overcast | Light Rain | Dry & Windy | Humid | Cloudy
  temperatureC: numeric("temperature_c", { precision: 5, scale: 1 }),
  windSpeedKmh: numeric("wind_speed_kmh", { precision: 5, scale: 1 }),
  soilConditions: text("soil_conditions"),              // Dry | Slightly Moist | Moist | Wet
  // Status — open until all produced bales have been carted to storage
  status: text("status").notNull().default("open"),     // open | complete
  // Link to field_operations history record (plain integer, created on POST)
  fieldOperationId: integer("field_operation_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ─── Straw Cartage Journeys ───────────────────────────────────────────────────
// Phase 2: individual trailer journeys moving bales from field to storage.
// Each journey reduces the "bales remaining in field" balance on the baling op.
export const strawCartageJourneysTable = pgTable("straw_cartage_journeys", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  balingOperationId: integer("baling_operation_id").notNull().references(() => strawBalingOperationsTable.id, { onDelete: "cascade" }),
  journeyDate: date("journey_date").notNull(),
  journeyTime: text("journey_time"),                    // HH:MM — optional
  operatorName: text("operator_name"),
  tractorVehicleId: integer("tractor_vehicle_id"),
  tractorDescription: text("tractor_description"),
  trailerVehicleId: integer("trailer_vehicle_id"),
  trailerDescription: text("trailer_description"),
  balesMoved: integer("bales_moved").notNull().default(0),
  fromLocation: text("from_location"),                  // field / baling area — auto-filled from baling op
  toLocation: text("to_location"),                      // storage barn / yard / name
  toStorageType: text("to_storage_type"),               // Indoor | Outdoor Covered | Outdoor Uncovered
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

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
  fieldId: integer("field_id").references(() => fieldsTable.id, { onDelete: "set null" }),
  fieldOfOrigin: text("field_of_origin"),               // free text fallback / display name
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
  // Biomass / energy straw contract fields (Drax ROC, RHI, RTFO sustainability)
  biomassContract: boolean("biomass_contract").notNull().default(false),
  biomassSchemeName: text("biomass_scheme_name"),       // e.g. "Drax ROC", "Lynemouth"
  biomassUniqueBaleRef: text("biomass_unique_bale_ref"), // scheme-assigned unique ID
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
