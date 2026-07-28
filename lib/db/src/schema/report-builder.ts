import { pgTable, serial, integer, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const savedReportsTable = pgTable("saved_reports", {
  id:          serial("id").primaryKey(),
  tenantId:    integer("tenant_id").notNull(),
  farmId:      integer("farm_id").notNull(),
  name:        text("name").notNull(),
  description: text("description"),
  config:      jsonb("config").notNull(),
  createdBy:   text("created_by"),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
});
