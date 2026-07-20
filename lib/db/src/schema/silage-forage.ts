import { pgTable, text, serial, integer, timestamp, numeric, boolean, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { fieldsTable } from "./fields-crops";
import { slurryStoresTable } from "./environmental";

// ─── Silage & Haylage Stock (Production / Intake) ────────────────────────────
// Each row = one cut or wrapped-bale batch going into store.
// Covers grass silage, maize silage, wholecrop, haylage, hay.
export const silageHaylageStockTable = pgTable("silage_haylage_stock", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id, { onDelete: "cascade" }),
  storeId: integer("store_id").references(() => slurryStoresTable.id, { onDelete: "set null" }),
  // Type & cut
  cropType: text("crop_type").notNull(),           // Grass Silage | Maize Silage | Wholecrop | Haylage | Hay | Other
  cutNumber: integer("cut_number"),                // 1st, 2nd, 3rd cut etc.
  // Field traceability
  fieldId: integer("field_id").references(() => fieldsTable.id, { onDelete: "set null" }),
  fieldOfOrigin: text("field_of_origin"),          // free-text / display name
  harvestDate: date("harvest_date"),
  // Quantities — use tonnes for clamped silage, bales for haylage/hay
  quantityTonnes: numeric("quantity_tonnes", { precision: 10, scale: 2 }),
  quantityBales: integer("quantity_bales"),
  baleWeightKg: numeric("bale_weight_kg", { precision: 8, scale: 2 }),
  // Quality at intake
  dryMatterPercent: numeric("dry_matter_percent", { precision: 5, scale: 2 }),
  notes: text("notes"),
  status: text("status").notNull().default("in-store"), // in-store | consumed | sold | waste
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ─── Silage & Haylage Usage / Drawdown ───────────────────────────────────────
// Records each drawdown event — feeding to a herd, bedding, sale, or waste.
export const silageHaylageUsageTable = pgTable("silage_haylage_usage", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id, { onDelete: "cascade" }),
  stockId: integer("stock_id").references(() => silageHaylageStockTable.id, { onDelete: "set null" }),
  storeId: integer("store_id").references(() => slurryStoresTable.id, { onDelete: "set null" }),
  usageDate: date("usage_date").notNull(),
  herdId: integer("herd_id"),                      // no FK — herd table name varies by species
  herdName: text("herd_name"),                     // display name for the herd/group being fed
  quantityTonnes: numeric("quantity_tonnes", { precision: 10, scale: 2 }),
  quantityBales: integer("quantity_bales"),
  purpose: text("purpose").notNull().default("feeding"), // feeding | bedding | sold | waste
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
