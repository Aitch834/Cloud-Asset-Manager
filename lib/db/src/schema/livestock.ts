import { pgTable, text, serial, integer, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

export const herdFlockRegisterTable = pgTable("herd_flock_register", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  breed: text("breed"),
  herdNumber: text("herd_number"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const livestockAnimalsTable = pgTable("livestock_animals", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  tagNumber: text("tag_number"),
  earTagNumber: text("ear_tag_number"),
  species: text("species").notNull(),
  breed: text("breed"),
  sex: text("sex"),
  dateOfBirth: timestamp("date_of_birth", { withTimezone: true }),
  damId: integer("dam_id"),
  sireId: integer("sire_id"),
  acquisitionDate: timestamp("acquisition_date", { withTimezone: true }),
  acquisitionSource: text("acquisition_source"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const livestockMovementsTable = pgTable("livestock_movements", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  animalId: integer("animal_id").references(() => livestockAnimalsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  movementType: text("movement_type").notNull(),
  movementDate: timestamp("movement_date", { withTimezone: true }).notNull(),
  fromLocation: text("from_location"),
  toLocation: text("to_location"),
  numberOfAnimals: integer("number_of_animals").default(1),
  licenceNumber: text("licence_number"),
  bcmsSubmissionRef: text("bcms_submission_ref"),
  legalNotificationSubmitted: boolean("legal_notification_submitted").notNull().default(false),
  legalNotificationDate: timestamp("legal_notification_date", { withTimezone: true }),
  transporterDetails: text("transporter_details"),
  reason: text("reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const livestockMedicineRecordsTable = pgTable("livestock_medicine_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  animalId: integer("animal_id").references(() => livestockAnimalsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  medicineName: text("medicine_name").notNull(),
  batchNumber: text("batch_number"),
  dosage: text("dosage"),
  administrationRoute: text("administration_route"),
  administeredBy: text("administered_by"),
  administeredDate: timestamp("administered_date", { withTimezone: true }).notNull(),
  withdrawalPeriodDays: integer("withdrawal_period_days"),
  withdrawalEndDate: timestamp("withdrawal_end_date", { withTimezone: true }),
  reason: text("reason"),
  vetName: text("vet_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const livestockFeedRecordsTable = pgTable("livestock_feed_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  feedType: text("feed_type").notNull(),
  supplier: text("supplier"),
  batchNumber: text("batch_number"),
  quantityKg: numeric("quantity_kg", { precision: 10, scale: 2 }),
  feedDate: timestamp("feed_date", { withTimezone: true }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const livestockWaterRecordsTable = pgTable("livestock_water_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  herdId: integer("herd_id").references(() => herdFlockRegisterTable.id),
  waterSource: text("water_source").notNull(),
  testDate: timestamp("test_date", { withTimezone: true }),
  testResult: text("test_result"),
  testPass: boolean("test_pass"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
