import { pgTable, text, serial, integer, timestamp, numeric, boolean, date, jsonb } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";

// ─── Vineyard Blocks (Permanent Geographic Site Identity) ─────────────────────
export const vineyardBlocksTable = pgTable("vineyard_blocks", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  blockName: text("block_name").notNull(),
  blockRef: text("block_ref"),
  fieldParcelRef: text("field_parcel_ref"),
  aspect: text("aspect"),
  soilType: text("soil_type"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Vineyard Block Plantings (Lifecycle Records) ─────────────────────────────
export const vineyardBlockPlantingsTable = pgTable("vineyard_block_plantings", {
  id: serial("id").primaryKey(),
  blockId: integer("block_id").notNull().references(() => vineyardBlocksTable.id, { onDelete: "cascade" }),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),

  // Planting identity
  variety: text("variety").notNull(),
  clone: text("clone"),
  rootstock: text("rootstock"),
  plantingYear: integer("planting_year"),
  plantedDate: date("planted_date"),

  // Physical characteristics
  numberOfVines: integer("number_of_vines"),
  rowSpacingM: numeric("row_spacing_m", { precision: 5, scale: 2 }),
  vineSpacingM: numeric("vine_spacing_m", { precision: 5, scale: 2 }),
  trainingSystem: text("training_system"),
  trellisType: text("trellis_type"),
  areaHa: numeric("area_ha", { precision: 8, scale: 4 }),
  isOrganic: boolean("is_organic").notNull().default(false),

  // Lifecycle status: active | suspended | removed
  status: text("status").notNull().default("active"),

  // Deactivation record
  deactivatedAt: timestamp("deactivated_at", { withTimezone: true }),
  deactivatedBy: text("deactivated_by"),
  deactivationType: text("deactivation_type"), // temporary_suspension | grubbed_up | replanting | other
  deactivationReason: text("deactivation_reason"),
  deactivationNotes: text("deactivation_notes"),

  // Reactivation record
  reactivatedAt: timestamp("reactivated_at", { withTimezone: true }),
  reactivatedReason: text("reactivated_reason"),

  // Chain: which planting preceded this one (for replanting history)
  predecessorPlantingId: integer("predecessor_planting_id"),

  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Vineyard Block Boundaries ────────────────────────────────────────────────
export const vineyardBlockBoundariesTable = pgTable("vineyard_block_boundaries", {
  id: serial("id").primaryKey(),
  blockId: integer("block_id").notNull().references(() => vineyardBlocksTable.id, { onDelete: "cascade" }),
  polygonPoints: jsonb("polygon_points").notNull(),
  capturedAt: timestamp("captured_at", { withTimezone: true }).notNull().defaultNow(),
  capturedBy: text("captured_by"),
});

// ─── HMRC Vine Register ───────────────────────────────────────────────────────
export const vineRegisterTable = pgTable("vine_register", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  blockId: integer("block_id").references(() => vineyardBlocksTable.id),
  plantingId: integer("planting_id").references(() => vineyardBlockPlantingsTable.id),
  hmrcVineRegisterRef: text("hmrc_vine_register_ref"),
  registeredVariety: text("registered_variety").notNull(),
  registeredAreaHa: numeric("registered_area_ha", { precision: 8, scale: 4 }).notNull(),
  dateRegistered: date("date_registered"),
  dateAmended: date("date_amended"),
  giClassification: text("gi_classification"),
  wineColour: text("wine_colour"),
  isRemovedFromRegister: boolean("is_removed_from_register").notNull().default(false),
  removalDate: date("removal_date"),
  removalReason: text("removal_reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Phenology (BBCH growth stages) ──────────────────────────────────────────
export const vineyardPhenologyTable = pgTable("vineyard_phenology", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  blockId: integer("block_id").references(() => vineyardBlocksTable.id),
  plantingId: integer("planting_id").references(() => vineyardBlockPlantingsTable.id),
  observationDate: date("observation_date").notNull(),
  bbchStage: text("bbch_stage").notNull(),
  bbchDescription: text("bbch_description"),
  percentageReached: integer("percentage_reached"),
  observer: text("observer"),
  temperatureC: numeric("temperature_c", { precision: 4, scale: 1 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Vineyard Operations (pruning, canopy management) ─────────────────────────
export const vineyardOperationsTable = pgTable("vineyard_operations", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  blockId: integer("block_id").references(() => vineyardBlocksTable.id),
  plantingId: integer("planting_id").references(() => vineyardBlockPlantingsTable.id),
  operationDate: date("operation_date").notNull(),
  operationType: text("operation_type").notNull(),
  pruningSystem: text("pruning_system"),
  budsPerVineTarget: integer("buds_per_vine_target"),
  budsPerVineActual: integer("buds_per_vine_actual"),
  pruningWeightKgPerVine: numeric("pruning_weight_kg_per_vine", { precision: 6, scale: 3 }),
  shootsRemovedPct: integer("shoots_removed_pct"),
  leavesRemovedZone: text("leaves_removed_zone"),
  operatorName: text("operator_name"),
  contractorName: text("contractor_name"),
  machineUsed: text("machine_used"),
  hoursWorked: numeric("hours_worked", { precision: 5, scale: 1 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Harvest / Vintage Records ─────────────────────────────────────────────────
export const vineyardHarvestTable = pgTable("vineyard_harvest", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  blockId: integer("block_id").references(() => vineyardBlocksTable.id),
  plantingId: integer("planting_id").references(() => vineyardBlockPlantingsTable.id),
  vintageYear: integer("vintage_year").notNull(),
  harvestDate: date("harvest_date").notNull(),
  harvestMethod: text("harvest_method"),
  yieldKg: numeric("yield_kg", { precision: 10, scale: 2 }),
  yieldKgPerVine: numeric("yield_kg_per_vine", { precision: 6, scale: 3 }),
  yieldTonnesPerHa: numeric("yield_tonnes_per_ha", { precision: 6, scale: 3 }),
  brix: numeric("brix", { precision: 5, scale: 2 }),
  ph: numeric("ph", { precision: 4, scale: 2 }),
  titratableAcidityGl: numeric("titratable_acidity_gl", { precision: 5, scale: 2 }),
  potentialAlcohol: numeric("potential_alcohol", { precision: 5, scale: 2 }),
  grapeCondition: text("grape_condition"),
  botrytisPresent: boolean("botrytis_present").default(false),
  botrytisPercentage: integer("botrytis_percentage"),
  destinationWinery: text("destination_winery"),
  operatorName: text("operator_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Disease & Pest Scouting ──────────────────────────────────────────────────
export const vineyardScoutingTable = pgTable("vineyard_scouting", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  blockId: integer("block_id").references(() => vineyardBlocksTable.id),
  plantingId: integer("planting_id").references(() => vineyardBlockPlantingsTable.id),
  scoutDate: date("scout_date").notNull(),
  scoutedBy: text("scouted_by"),
  downyMildewPressure: integer("downy_mildew_pressure").default(0),
  powderyMildewPressure: integer("powdery_mildew_pressure").default(0),
  botrytisPressure: integer("botrytis_pressure").default(0),
  phomopsisPressure: integer("phomopsis_pressure").default(0),
  eutypaDiebackSighted: boolean("eutypa_dieback_sighted").default(false),
  vineWeevilSighted: boolean("vine_weevil_sighted").default(false),
  leafhopperPressure: integer("leafhopper_pressure").default(0),
  spiderMitePressure: integer("spider_mite_pressure").default(0),
  xylellaFastidiosa: boolean("xylella_fastidiosa").default(false),
  phytophthoraViticola: boolean("phytophthora_viticola").default(false),
  actionTaken: text("action_taken"),
  sprayApplied: boolean("spray_applied").default(false),
  sprayProduct: text("spray_product"),
  nextScoutDate: date("next_scout_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
