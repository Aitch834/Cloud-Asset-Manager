import { pgTable, text, serial, integer, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { farmsTable, farmMembersTable } from "./core";
import { fieldsTable } from "./fields-crops";
import { stockItemsTable, stockDeliveriesTable, suppliersTable } from "./stock-suppliers";
import { equipmentTable } from "./equipment";

export const sprayProductsTable = pgTable("spray_products", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  productName: text("product_name").notNull(),
  activeIngredient: text("active_ingredient"),
  mappaNumber: text("mappa_number"),
  manufacturer: text("manufacturer"),
  category: text("category"),
  harvestInterval: integer("harvest_interval"),
  maxApplicationsPerSeason: integer("max_applications_per_season"),
  storageRequirements: text("storage_requirements"),
  stockItemId: integer("stock_item_id").references(() => stockItemsTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sprayApplicationsTable = pgTable("spray_applications", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  fieldId: integer("field_id").notNull().references(() => fieldsTable.id),
  productId: integer("product_id").notNull().references(() => sprayProductsTable.id),
  applicationDate: timestamp("application_date", { withTimezone: true }).notNull(),
  applicationRate: numeric("application_rate", { precision: 10, scale: 4 }),
  rateUnit: text("rate_unit"),
  areaSprayedHa: numeric("area_sprayed_ha", { precision: 10, scale: 4 }),
  waterVolumeLitres: numeric("water_volume_litres", { precision: 10, scale: 2 }),
  windSpeedKmh: numeric("wind_speed_kmh", { precision: 5, scale: 1 }),
  windDirection: text("wind_direction"),
  temperatureC: numeric("temperature_c", { precision: 5, scale: 1 }),
  operatorName: text("operator_name"),
  operatorMemberId: integer("operator_member_id").references(() => farmMembersTable.id),
  certificateNumber: text("certificate_number"),
  equipmentUsed: text("equipment_used"),
  equipmentId: integer("equipment_id").references(() => equipmentTable.id),
  supplierId: integer("supplier_id").references(() => suppliersTable.id),
  reasonForApplication: text("reason_for_application"),
  batchNumber: text("batch_number"),
  lotNumber: text("lot_number"),
  stockDeliveryId: integer("stock_delivery_id").references(() => stockDeliveriesTable.id),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const nutrientManagementPlansTable = pgTable("nutrient_management_plans", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  planYear: integer("plan_year").notNull(),
  preparedBy: text("prepared_by"),
  approvedBy: text("approved_by"),
  approvedDate: timestamp("approved_date", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const nmpFieldEntriesTable = pgTable("nmp_field_entries", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull().references(() => nutrientManagementPlansTable.id),
  fieldId: integer("field_id").notNull().references(() => fieldsTable.id),
  cropType: text("crop_type"),
  nitrogenKgHa: numeric("nitrogen_kg_ha", { precision: 10, scale: 2 }),
  phosphorusKgHa: numeric("phosphorus_kg_ha", { precision: 10, scale: 2 }),
  potassiumKgHa: numeric("potassium_kg_ha", { precision: 10, scale: 2 }),
  organicManureType: text("organic_manure_type"),
  organicManureRate: numeric("organic_manure_rate", { precision: 10, scale: 2 }),
  applicationMethod: text("application_method"),
  timingNotes: text("timing_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const nvzFertiliserApplicationsTable = pgTable("nvz_fertiliser_applications", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  fieldId: integer("field_id").notNull().references(() => fieldsTable.id),
  applicationDate: timestamp("application_date", { withTimezone: true }).notNull(),
  productName: text("product_name").notNull(),
  productType: text("product_type").notNull(),
  nitrogenKgHa: numeric("nitrogen_kg_ha", { precision: 10, scale: 2 }).notNull(),
  areaAppliedHa: numeric("area_applied_ha", { precision: 10, scale: 4 }).notNull(),
  totalNitrogenKg: numeric("total_nitrogen_kg", { precision: 10, scale: 2 }).notNull(),
  applicationMethod: text("application_method"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
