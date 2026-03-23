import { pgTable, text, serial, integer, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

export const haulageRecordsTable = pgTable("haulage_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  loadType: text("load_type").notNull(),
  loadDescription: text("load_description"),
  commodity: text("commodity"),
  variety: text("variety"),
  grade: text("grade"),
  moisturePercent: numeric("moisture_percent", { precision: 5, scale: 2 }),
  specificWeightKgHl: numeric("specific_weight_kg_hl", { precision: 6, scale: 2 }),
  weighbridgeTicketNo: text("weighbridge_ticket_no"),
  storageLocation: text("storage_location"),
  deliveryStatus: text("delivery_status"),
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

export const hauliersTable = pgTable("hauliers", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  vehicleTypes: text("vehicle_types"),
  operatorLicence: text("operator_licence"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
