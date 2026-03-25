import { pgTable, text, serial, integer, timestamp, numeric, boolean, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { suppliersTable } from "./stock-suppliers";
import { equipmentTable } from "./equipment";
import { fieldsTable } from "./fields-crops";

export const fuelTanksTable = pgTable("fuel_tanks", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  name: text("name").notNull(),
  fuelType: text("fuel_type").notNull().default("red_diesel"),
  capacityLitres: numeric("capacity_litres", { precision: 10, scale: 2 }).notNull(),
  currentStockLitres: numeric("current_stock_litres", { precision: 10, scale: 2 }).notNull().default("0"),
  location: text("location"),
  isBunded: boolean("is_bunded").notNull().default(false),
  bundCapacityLitres: numeric("bund_capacity_litres", { precision: 10, scale: 2 }),
  tankMaterial: text("tank_material"),
  installDate: date("install_date"),
  lastInspectionDate: date("last_inspection_date"),
  nextInspectionDue: date("next_inspection_due"),
  supplierId: integer("supplier_id").references(() => suppliersTable.id),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const fuelDeliveriesTable = pgTable("fuel_deliveries", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  tankId: integer("tank_id").references(() => fuelTanksTable.id),
  supplierId: integer("supplier_id").references(() => suppliersTable.id),
  deliveryDate: timestamp("delivery_date", { withTimezone: true }).notNull(),
  fuelType: text("fuel_type").notNull().default("red_diesel"),
  quantityLitres: numeric("quantity_litres", { precision: 10, scale: 2 }).notNull(),
  unitPricePence: integer("unit_price_pence"),
  totalCostPence: integer("total_cost_pence"),
  invoiceReference: text("invoice_reference"),
  deliveryNoteNumber: text("delivery_note_number"),
  supplierName: text("supplier_name"),
  driverName: text("driver_name"),
  qualifyingUse: text("qualifying_use").notNull().default("agriculture"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const fuelUsageTable = pgTable("fuel_usage", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  tankId: integer("tank_id").references(() => fuelTanksTable.id),
  usageDate: timestamp("usage_date", { withTimezone: true }).notNull(),
  quantityLitres: numeric("quantity_litres", { precision: 10, scale: 2 }).notNull(),
  purpose: text("purpose").notNull(),
  qualifyingActivity: text("qualifying_activity").notNull().default("agriculture"),
  equipmentId: integer("equipment_id").references(() => equipmentTable.id),
  fieldId: integer("field_id").references(() => fieldsTable.id),
  recordedBy: text("recorded_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const fuelStorageInspectionsTable = pgTable("fuel_storage_inspections", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  tankId: integer("tank_id").references(() => fuelTanksTable.id),
  inspectionDate: date("inspection_date").notNull(),
  inspector: text("inspector"),
  overallResult: text("overall_result").notNull().default("pass"),
  bundingOk: boolean("bunding_ok"),
  labellingOk: boolean("labelling_ok"),
  spillKitPresent: boolean("spill_kit_present"),
  spillKitComplete: boolean("spill_kit_complete"),
  tankConditionOk: boolean("tank_condition_ok"),
  pipeworkOk: boolean("pipework_ok"),
  fillPointLocked: boolean("fill_point_locked"),
  overfillProtectionOk: boolean("overfill_protection_ok"),
  drainageRiskOk: boolean("drainage_risk_ok"),
  issuesFound: text("issues_found"),
  actionsRequired: text("actions_required"),
  nextInspectionDue: date("next_inspection_due"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
