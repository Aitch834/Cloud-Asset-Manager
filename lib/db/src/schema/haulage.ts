import { pgTable, text, serial, integer, timestamp, numeric, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { grainStorageBinsTable } from "./equipment";
import { suppliersTable } from "./stock-suppliers";

export const haulageRecordsTable = pgTable("haulage_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  // ─── Movement type ────────────────────────────────────────────────────────
  // on_farm_transfer = internal movement between bins/locations (in+out balanced)
  // farm_exit_dispatch = crop leaving the farm to a merchant/customer (out only)
  movementType: text("movement_type").notNull().default("farm_exit_dispatch"),
  loadType: text("load_type").notNull(),
  loadDescription: text("load_description"),
  commodity: text("commodity"),
  variety: text("variety"),
  grade: text("grade"),
  moisturePercent: numeric("moisture_percent", { precision: 5, scale: 2 }),
  specificWeightKgHl: numeric("specific_weight_kg_hl", { precision: 6, scale: 2 }),
  weighbridgeTicketNo: text("weighbridge_ticket_no"),
  // ─── Bin / location linkage ───────────────────────────────────────────────
  // For dispatches: binId = source bin the crop is leaving
  // For on-farm transfers: binId = from-bin, destinationBinId = to-bin
  binId: integer("bin_id").references(() => grainStorageBinsTable.id),
  destinationBinId: integer("destination_bin_id").references(() => grainStorageBinsTable.id),
  storageLocation: text("storage_location"), // kept for legacy / free-text fallback
  // ─── Buyer / customer (dispatches only) ──────────────────────────────────
  buyerId: integer("buyer_id").references(() => suppliersTable.id),
  customerRef: text("customer_ref"),   // merchant's order/contract reference
  // ─── Haulier linkage ─────────────────────────────────────────────────────
  haulierRegisteredId: integer("haulier_registered_id").references(() => hauliersTable.id),
  // ─── Sale linkage (soft ref — no FK to avoid circular schema) ────────────
  // Set when this dispatch is linked to a grain_sales record
  grainSaleId: integer("grain_sale_id"),
  // ─── Transport / logistics ────────────────────────────────────────────────
  deliveryStatus: text("delivery_status"),
  weightTonnes: numeric("weight_tonnes", { precision: 10, scale: 2 }),
  vehicleRegistration: text("vehicle_registration"),
  driverName: text("driver_name"),
  haulierCompany: text("haulier_company"),
  origin: text("origin"),
  destination: text("destination"),
  departureDate: timestamp("departure_date", { withTimezone: true }).notNull(),
  arrivalDate: timestamp("arrival_date", { withTimezone: true }),
  waybillNumber: text("waybill_number"),
  costPence: integer("cost_pence"),
  deliveryConfirmedAt: timestamp("delivery_confirmed_at", { withTimezone: true }),
  deliveryConfirmedBy: text("delivery_confirmed_by"),
  deliveryConfirmationNotes: text("delivery_confirmation_notes"),
  weighbridgeWeightTonnes: numeric("weighbridge_weight_tonnes", { precision: 10, scale: 2 }),
  proofOfDeliveryUrl: text("proof_of_delivery_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const hauliersTable = pgTable("hauliers", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  companyName: text("company_name").notNull(),
  // Structured address
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  town: text("town"),
  county: text("county"),
  postcode: text("postcode"),
  // Contacts — JSON array: [{name, role, phone, email}]
  contacts: text("contacts"),
  // Primary email kept for quick display / legacy
  email: text("email"),
  // Vehicle types — JSON array of strings from predefined list
  vehicleTypes: text("vehicle_types"),
  operatorLicence: text("operator_licence"),
  notes: text("notes"),
  // Soft delete
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Crop Stock Levels ─────────────────────────────────────────────────────────
// Live quantity of harvested crop per bin / location / commodity.
// Updated automatically when harvest records are posted and when dispatches are
// confirmed. One row per (farm, bin, commodity, variety, cropYear) combination.
export const cropStockLevelsTable = pgTable("crop_stock_levels", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  binId: integer("bin_id").references(() => grainStorageBinsTable.id), // null = no specific bin (field heap, temporary store)
  commodity: text("commodity").notNull(),
  variety: text("variety"),
  cropYear: text("crop_year"), // e.g. "2024 Harvest"
  quantityTonnes: numeric("quantity_tonnes", { precision: 10, scale: 3 }).notNull().default("0"),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).notNull().defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  // Red Tractor compliance: one stock lot per physical store location
  uniqueIndex("crop_stock_levels_farm_bin_unique").on(t.farmId, t.binId),
]);

// ─── Crop Stock Movements ──────────────────────────────────────────────────────
// Immutable audit log of every change to crop stock.
// movementType values:
//   harvest_in      — crop arrives from field at harvest
//   dispatch_out    — crop leaves farm to a merchant / customer
//   transfer_in     — receiving end of an on-farm bin transfer
//   transfer_out    — sending end of an on-farm bin transfer
//   sample_out      — sample removed for quality testing
//   drying_loss     — moisture reduction recorded as a tonnage loss
//   adjustment      — manual stock correction with reason noted
export const cropStockMovementsTable = pgTable("crop_stock_movements", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  cropStockLevelId: integer("crop_stock_level_id").references(() => cropStockLevelsTable.id),
  binId: integer("bin_id").references(() => grainStorageBinsTable.id),
  movementType: text("movement_type").notNull(),
  direction: text("direction").notNull(), // in | out
  commodity: text("commodity").notNull(),
  variety: text("variety"),
  cropYear: text("crop_year"),
  quantityTonnes: numeric("quantity_tonnes", { precision: 10, scale: 3 }).notNull(),
  referenceType: text("reference_type"), // harvest_record | haulage_record | grain_sale | adjustment
  referenceId: integer("reference_id"),  // ID in the referenced table
  movedAt: timestamp("moved_at", { withTimezone: true }).notNull().defaultNow(),
  performedBy: text("performed_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
