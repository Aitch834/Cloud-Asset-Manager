import { pgTable, text, serial, integer, timestamp, boolean, date, numeric } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

export const labourTimesheetEntriesTable = pgTable("labour_timesheet_entries", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  staffName: text("staff_name").notNull(),
  date: date("date").notNull(),
  taskType: text("task_type").notNull(),
  hoursRegular: numeric("hours_regular", { precision: 5, scale: 2 }).notNull().default("0"),
  hoursOvertime: numeric("hours_overtime", { precision: 5, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  sourceType: text("source_type"),
  sourceId: integer("source_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const labourRotaTable = pgTable("labour_rota", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  weekStartDate: date("week_start_date").notNull(),
  staffName: text("staff_name").notNull(),
  monShift: text("mon_shift"),
  tueShift: text("tue_shift"),
  wedShift: text("wed_shift"),
  thuShift: text("thu_shift"),
  friShift: text("fri_shift"),
  satShift: text("sat_shift"),
  sunShift: text("sun_shift"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const labourAbsencesTable = pgTable("labour_absences", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  staffName: text("staff_name").notNull(),
  absenceType: text("absence_type").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  daysCount: numeric("days_count", { precision: 5, scale: 1 }),
  notes: text("notes"),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  status: text("status").notNull().default("approved"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const labourLeaveEntitlementTable = pgTable("labour_leave_entitlement", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  staffName: text("staff_name").notNull(),
  year: integer("year").notNull(),
  entitlementDays: numeric("entitlement_days", { precision: 5, scale: 1 }).notNull().default("28"),
  carriedOverDays: numeric("carried_over_days", { precision: 5, scale: 1 }).notNull().default("0"),
  wtrOptOut: boolean("wtr_opt_out").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const labourHourlyRatesTable = pgTable("labour_hourly_rates", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  staffName: text("staff_name").notNull(),
  regularRatePence: integer("regular_rate_pence").notNull().default(0),
  overtimeRatePence: integer("overtime_rate_pence").notNull().default(0),
  effectiveFrom: date("effective_from").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const labourActualAttendanceTable = pgTable("labour_actual_attendance", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  date: date("date").notNull(),
  staffName: text("staff_name").notNull(),
  actualStatus: text("actual_status").notNull(),
  plannedShift: text("planned_shift"),
  notes: text("notes"),
  loggedBy: text("logged_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const labourCrossRefAnnotationsTable = pgTable("labour_crossref_annotations", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  staffName: text("staff_name").notNull(),
  date: date("date").notNull(),
  note: text("note").notNull(),
  resolvedBy: text("resolved_by"),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
