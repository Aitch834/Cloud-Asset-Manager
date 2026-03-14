import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

export const haulageRecordsTable = pgTable("haulage_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  loadType: text("load_type").notNull(),
  loadDescription: text("load_description"),
  weightTonnes: numeric("weight_tonnes", { precision: 10, scale: 2 }),
  vehicleRegistration: text("vehicle_registration"),
  driverName: text("driver_name"),
  haulierCompany: text("haulier_company"),
  origin: text("origin"),
  destination: text("destination"),
  departureDate: timestamp("departure_date", { withTimezone: true }).notNull(),
  arrivalDate: timestamp("arrival_date", { withTimezone: true }),
  waybillNumber: text("waybill_number"),
  costPence: integer("cost_pence"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
