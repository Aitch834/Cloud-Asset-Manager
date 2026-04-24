import { pgTable, text, serial, integer, timestamp, boolean, numeric, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { storageLocationsTable, fieldsTable } from "./fields-crops";
import { equipmentTable } from "./equipment";

export const farmCustomersTable = pgTable("farm_customers", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  address: text("address"),
  holdingNumber: text("holding_number"),
  vatNumber: text("vat_number"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const serviceAgreementsTable = pgTable("service_agreements", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  customerId: integer("customer_id").notNull().references(() => farmCustomersTable.id),
  agreementType: text("agreement_type").notNull().default("grain_storage"),
  title: text("title").notNull(),
  referenceNumber: text("reference_number"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  status: text("status").notNull().default("active"),
  areaHa: numeric("area_ha", { precision: 10, scale: 4 }),
  annualRentPence: integer("annual_rent_pence"),
  rentPerHaPence: integer("rent_per_ha_pence"),
  paymentFrequency: text("payment_frequency"),
  nextPaymentDate: date("next_payment_date"),
  storageLocationId: integer("storage_location_id").references(() => storageLocationsTable.id),
  maxTonnesContracted: numeric("max_tonnes_contracted", { precision: 10, scale: 2 }),
  storageRatePptWeek: numeric("storage_rate_ppt_week", { precision: 8, scale: 4 }),
  intakeChargePpt: numeric("intake_charge_ppt", { precision: 8, scale: 4 }),
  outloadingChargePpt: numeric("outloading_charge_ppt", { precision: 8, scale: 4 }),
  dryingChargePpt: numeric("drying_charge_ppt", { precision: 8, scale: 4 }),
  dayRatePence: integer("day_rate_pence"),
  documentPath: text("document_path"),
  documentName: text("document_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const thirdPartyGrainIntakesTable = pgTable("third_party_grain_intakes", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  customerId: integer("customer_id").notNull().references(() => farmCustomersTable.id),
  agreementId: integer("agreement_id").references(() => serviceAgreementsTable.id),
  storageLocationId: integer("storage_location_id").references(() => storageLocationsTable.id),
  intakeDate: date("intake_date").notNull(),
  commodity: text("commodity").notNull(),
  variety: text("variety"),
  quantityTonnes: numeric("quantity_tonnes", { precision: 10, scale: 2 }).notNull(),
  moisturePercent: numeric("moisture_percent", { precision: 5, scale: 2 }),
  screeningsPercent: numeric("screenings_percent", { precision: 5, scale: 2 }),
  specificWeightKgHl: numeric("specific_weight_kg_hl", { precision: 5, scale: 2 }),
  grade: text("grade"),
  lotReference: text("lot_reference"),
  deliveryNoteRef: text("delivery_note_ref"),
  vehicleReg: text("vehicle_reg"),
  haulier: text("haulier"),
  // transportArrangedBy: "customer" = customer organised their own lorry; "holding" = we booked a haulier on their behalf
  transportArrangedBy: text("transport_arranged_by").notNull().default("customer"),
  haulierId: integer("haulier_id"), // FK to hauliers.id — set when holding arranges transport
  bayOrBin: text("bay_or_bin"),
  status: text("status").notNull().default("in_store"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const thirdPartyGrainMovementsTable = pgTable("third_party_grain_movements", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  intakeId: integer("intake_id").notNull().references(() => thirdPartyGrainIntakesTable.id),
  movementDate: date("movement_date").notNull(),
  movementType: text("movement_type").notNull(),
  quantityTonnes: numeric("quantity_tonnes", { precision: 10, scale: 2 }).notNull(),
  destination: text("destination"),
  vehicleReg: text("vehicle_reg"),
  haulier: text("haulier"),
  // transportArrangedBy: "customer" = customer's lorry; "holding" = we booked the haulier
  transportArrangedBy: text("transport_arranged_by").notNull().default("customer"),
  haulierId: integer("haulier_id"), // FK to hauliers.id — set when holding arranges transport
  deliveryNoteRef: text("delivery_note_ref"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const serviceInvoicesTable = pgTable("service_invoices", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  customerId: integer("customer_id").notNull().references(() => farmCustomersTable.id),
  agreementId: integer("agreement_id").references(() => serviceAgreementsTable.id),
  invoiceNumber: text("invoice_number"),
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date"),
  status: text("status").notNull().default("draft"),
  subtotalPence: integer("subtotal_pence").notNull().default(0),
  vatRatePercent: numeric("vat_rate_percent", { precision: 5, scale: 2 }).notNull().default("20"),
  vatPence: integer("vat_pence").notNull().default(0),
  totalPence: integer("total_pence").notNull().default(0),
  paymentDate: date("payment_date"),
  paymentMethod: text("payment_method"),
  paymentReference: text("payment_reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const serviceInvoiceLinesTable = pgTable("service_invoice_lines", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => serviceInvoicesTable.id),
  description: text("description").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }),
  unit: text("unit"),
  unitPricePence: integer("unit_price_pence").notNull(),
  lineTotalPence: integer("line_total_pence").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Equipment Hire ───────────────────────────────────────────────────────────

export const equipmentHireBookingsTable = pgTable("equipment_hire_bookings", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  customerId: integer("customer_id").notNull().references(() => farmCustomersTable.id),
  equipmentId: integer("equipment_id").notNull().references(() => equipmentTable.id),
  agreementId: integer("agreement_id").references(() => serviceAgreementsTable.id),
  bookingRef: text("booking_ref"),
  startDate: date("start_date").notNull(),
  plannedEndDate: date("planned_end_date"),
  actualEndDate: date("actual_end_date"),
  // rateType: daily | hourly | weekly | fixed
  rateType: text("rate_type").notNull().default("daily"),
  ratePence: integer("rate_pence"),
  depositPence: integer("deposit_pence"),
  // operatorType: customer_operated | farm_operator
  operatorType: text("operator_type").notNull().default("customer_operated"),
  operatorName: text("operator_name"),
  // fuelPolicy: customer_supplied | included_in_rate | billed_back
  fuelPolicy: text("fuel_policy").notNull().default("customer_supplied"),
  insuranceVerified: boolean("insurance_verified").notNull().default(false),
  insuranceNotes: text("insurance_notes"),
  depositPaid: boolean("deposit_paid").notNull().default(false),
  depositPaidDate: date("deposit_paid_date"),
  // status: booked | active | returned | cancelled | invoiced
  status: text("status").notNull().default("booked"),
  totalHireCostPence: integer("total_hire_cost_pence"),
  jobReference: text("job_reference"),
  fieldId: integer("field_id").references(() => fieldsTable.id),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const equipmentHireConditionLogsTable = pgTable("equipment_hire_condition_logs", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  bookingId: integer("booking_id").notNull().references(() => equipmentHireBookingsTable.id),
  // logType: hire_out | return
  logType: text("log_type").notNull(),
  logDate: date("log_date").notNull(),
  logTime: text("log_time"),
  hoursReading: integer("hours_reading"),
  fuelLevelPercent: integer("fuel_level_percent"),
  // conditionOverall: good | acceptable | poor
  conditionOverall: text("condition_overall"),
  conditionNotes: text("condition_notes"),
  damageNotes: text("damage_notes"),
  tyreConditionNotes: text("tyre_condition_notes"),
  attachmentNotes: text("attachment_notes"),
  signedOffBy: text("signed_off_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const equipmentHireFuelIssuesTable = pgTable("equipment_hire_fuel_issues", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  bookingId: integer("booking_id").notNull().references(() => equipmentHireBookingsTable.id),
  issueDate: date("issue_date").notNull(),
  litres: numeric("litres", { precision: 8, scale: 2 }).notNull(),
  pricePerLitrePence: integer("price_per_litre_pence"),
  totalCostPence: integer("total_cost_pence"),
  billedToCustomer: boolean("billed_to_customer").notNull().default(true),
  issuedBy: text("issued_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
