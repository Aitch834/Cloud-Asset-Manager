import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

export const farmResourcesTable = pgTable("farm_resources", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  colour: text("colour").notNull().default("slate"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const farmTaskResourceAllocationsTable = pgTable("farm_task_resource_allocations", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  resourceId: integer("resource_id").notNull().references(() => farmResourcesTable.id),
  taskRef: text("task_ref").notNull(),
  taskTitle: text("task_title"),
  allocatedDate: text("allocated_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
