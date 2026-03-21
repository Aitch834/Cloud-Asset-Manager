import { pgTable, serial, integer, text, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

export const farmLocationsTable = pgTable("farm_locations", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  locationType: text("location_type").notNull(),
  description: text("description"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
