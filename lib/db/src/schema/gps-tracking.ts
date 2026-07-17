import { pgTable, serial, integer, text, boolean, timestamp, numeric, varchar } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

export const gpsIntegrationsTable = pgTable("gps_integrations", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("disconnected"),
  apiKeyEncrypted: text("api_key_encrypted"),
  webhookSecretEncrypted: text("webhook_secret_encrypted"),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  lastError: text("last_error"),
  displayName: varchar("display_name", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const gpsAssetPositionsTable = pgTable("gps_asset_positions", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id, { onDelete: "cascade" }),
  integrationId: integer("integration_id").references(() => gpsIntegrationsTable.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 50 }).notNull(),
  externalAssetId: varchar("external_asset_id", { length: 200 }).notNull(),
  assetName: varchar("asset_name", { length: 200 }),
  assetType: varchar("asset_type", { length: 50 }),
  latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
  speedKph: numeric("speed_kph", { precision: 6, scale: 1 }),
  headingDeg: integer("heading_deg"),
  accuracyM: numeric("accuracy_m", { precision: 8, scale: 1 }),
  altitudeM: numeric("altitude_m", { precision: 8, scale: 1 }),
  ignitionOn: boolean("ignition_on"),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
