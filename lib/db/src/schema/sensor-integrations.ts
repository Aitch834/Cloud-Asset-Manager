import { pgTable, serial, integer, text, varchar, timestamp, numeric } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

export const sensorIntegrationsTable = pgTable("sensor_integrations", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("disconnected"),
  apiKeyEncrypted: text("api_key_encrypted"),
  apiKey2Encrypted: text("api_key2_encrypted"),
  accessTokenEncrypted: text("access_token_encrypted"),
  refreshTokenEncrypted: text("refresh_token_encrypted"),
  tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  lastError: text("last_error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const apiSensorReadingsTable = pgTable("api_sensor_readings", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id, { onDelete: "cascade" }),
  integrationId: integer("integration_id").references(() => sensorIntegrationsTable.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 50 }).notNull(),
  stationId: varchar("station_id", { length: 200 }).notNull(),
  stationName: varchar("station_name", { length: 200 }),
  sensorCategory: varchar("sensor_category", { length: 20 }).notNull(),
  parameter: varchar("parameter", { length: 50 }).notNull(),
  value: numeric("value", { precision: 10, scale: 3 }),
  unit: varchar("unit", { length: 20 }),
  depthCm: integer("depth_cm"),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
