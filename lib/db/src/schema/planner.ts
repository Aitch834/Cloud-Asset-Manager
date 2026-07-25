import { pgTable, serial, integer, text, timestamp, numeric } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

export const farmPlannerEventsTable = pgTable("farm_planner_events", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  title: text("title").notNull(),
  description: text("description"),
  eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }),
  colour: text("colour").notNull().default("slate"),
  estimatedDurationHours: numeric("estimated_duration_hours", { precision: 5, scale: 2 }),
  startTime: text("start_time"),
  endTime: text("end_time"),
  reqTractors: integer("req_tractors").notNull().default(0),
  reqImplements: integer("req_implements").notNull().default(0),
  reqVehicles: integer("req_vehicles").notNull().default(0),
  reqSprayers: integer("req_sprayers").notNull().default(0),
  reqTrailers: integer("req_trailers").notNull().default(0),
  reqStaff: integer("req_staff").notNull().default(0),
  reqOther: integer("req_other").notNull().default(0),
  reqOtherNotes: text("req_other_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
