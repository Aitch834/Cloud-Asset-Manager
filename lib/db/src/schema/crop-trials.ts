import { pgTable, text, serial, integer, timestamp, numeric, boolean, date } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { fieldsTable } from "./fields-crops";

export const cropTrialsTable = pgTable("crop_trials", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  fieldId: integer("field_id").references(() => fieldsTable.id, { onDelete: "set null" }),
  trialName: text("trial_name").notNull(),
  season: text("season"),
  cropName: text("crop_name"),
  trialPurpose: text("trial_purpose").notNull(),
  trialType: text("trial_type"),
  trialsBody: text("trials_body"),
  contactName: text("contact_name"),
  numberOfTreatments: integer("number_of_treatments"),
  numberOfReplications: integer("number_of_replications"),
  totalAreaHa: numeric("total_area_ha", { precision: 8, scale: 4 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  status: text("status").notNull().default("planned"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const cropTrialPlotsTable = pgTable("crop_trial_plots", {
  id: serial("id").primaryKey(),
  trialId: integer("trial_id").notNull().references(() => cropTrialsTable.id, { onDelete: "cascade" }),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  plotNumber: text("plot_number").notNull(),
  treatmentLabel: text("treatment_label"),
  isControl: boolean("is_control").notNull().default(false),
  areaHa: numeric("area_ha", { precision: 8, scale: 4 }),
  locationDescription: text("location_description"),
  replicationBlock: text("replication_block"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cropTrialTreatmentsTable = pgTable("crop_trial_treatments", {
  id: serial("id").primaryKey(),
  plotId: integer("plot_id").notNull().references(() => cropTrialPlotsTable.id, { onDelete: "cascade" }),
  trialId: integer("trial_id").notNull().references(() => cropTrialsTable.id, { onDelete: "cascade" }),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  treatmentDate: date("treatment_date").notNull(),
  treatmentType: text("treatment_type").notNull(),
  productName: text("product_name"),
  activeIngredient: text("active_ingredient"),
  applicationRate: numeric("application_rate", { precision: 10, scale: 3 }),
  unit: text("unit"),
  waterVolumeL: numeric("water_volume_l", { precision: 8, scale: 1 }),
  operator: text("operator"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cropTrialObservationsTable = pgTable("crop_trial_observations", {
  id: serial("id").primaryKey(),
  plotId: integer("plot_id").notNull().references(() => cropTrialPlotsTable.id, { onDelete: "cascade" }),
  trialId: integer("trial_id").notNull().references(() => cropTrialsTable.id, { onDelete: "cascade" }),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  observationDate: date("observation_date").notNull(),
  growthStage: text("growth_stage"),
  plantCount: integer("plant_count"),
  plantHeightCm: numeric("plant_height_cm", { precision: 6, scale: 1 }),
  lodgingPercent: numeric("lodging_percent", { precision: 5, scale: 1 }),
  diseasePresent: boolean("disease_present").default(false),
  diseaseName: text("disease_name"),
  diseaseSeverity: text("disease_severity"),
  pestPresent: boolean("pest_present").default(false),
  pestName: text("pest_name"),
  generalCondition: text("general_condition"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cropTrialYieldsTable = pgTable("crop_trial_yields", {
  id: serial("id").primaryKey(),
  plotId: integer("plot_id").notNull().references(() => cropTrialPlotsTable.id, { onDelete: "cascade" }),
  trialId: integer("trial_id").notNull().references(() => cropTrialsTable.id, { onDelete: "cascade" }),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  harvestDate: date("harvest_date").notNull(),
  freshWeightKg: numeric("fresh_weight_kg", { precision: 10, scale: 2 }),
  moisturePercent: numeric("moisture_percent", { precision: 5, scale: 2 }),
  adjustedDryWeightKg: numeric("adjusted_dry_weight_kg", { precision: 10, scale: 2 }),
  yieldTha: numeric("yield_tha", { precision: 8, scale: 3 }),
  grainProteinPercent: numeric("grain_protein_percent", { precision: 5, scale: 2 }),
  specificWeight: numeric("specific_weight", { precision: 5, scale: 1 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
