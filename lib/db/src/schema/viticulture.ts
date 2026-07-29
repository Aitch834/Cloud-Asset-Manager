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

// ─── FSA Vine Register ────────────────────────────────────────────────────────
export const vineRegisterTable = pgTable("vine_register", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  blockId: integer("block_id").references(() => vineyardBlocksTable.id),
  plantingId: integer("planting_id").references(() => vineyardBlockPlantingsTable.id),
  fsaVineRegisterRef: text("fsa_vine_register_ref"),
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
  // Ampelographic / pedigree fields (VIVC nomenclature)
  motherVariety: text("mother_variety"),
  fatherVariety: text("father_variety"),
  vivcNumber: text("vivc_number"),
  varietyColour: text("variety_colour"),
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
  destinationWineryType: text("destination_winery_type"),
  destinationWinery: text("destination_winery"),
  destinationWineryContactId: integer("destination_winery_contact_id"),
  operatorName: text("operator_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Winery Licensing (Licensing Act 2003) ────────────────────────────────────
export const wineryLicencesTable = pgTable("winery_licences", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  licenceNumber: text("licence_number"),
  licenceType: text("licence_type"),
  localAuthority: text("local_authority"),
  dpsName: text("dps_name"),
  dpsPersonalLicenceNumber: text("dps_personal_licence_number"),
  dpsPersonalLicenceExpiry: date("dps_personal_licence_expiry"),
  grantedDate: date("granted_date"),
  reviewDate: date("review_date"),
  conditions: text("conditions"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Winery Excise & Duty Returns (HMRC Alcoholic Products Technical Guide) ───
export const wineryExciseReturnsTable = pgTable("winery_excise_returns", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  // Reference assigned by HMRC to this specific return submission
  hmrcReturnRef: text("hmrc_return_ref"),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  // Stock reconciliation
  openingStockL: numeric("opening_stock_l", { precision: 10, scale: 2 }),
  closingStockL: numeric("closing_stock_l", { precision: 10, scale: 2 }),
  // Production & movements
  totalLitresProduced: numeric("total_litres_produced", { precision: 10, scale: 2 }),
  // Duty is charged on removal from approved premises, not on sale
  totalLitresRemovedUK: numeric("total_litres_removed_uk", { precision: 10, scale: 2 }),
  totalLitresExported: numeric("total_litres_exported", { precision: 10, scale: 2 }),
  totalLitresDomesticConsumption: numeric("total_litres_domestic_consumption", { precision: 10, scale: 2 }),
  totalLitresTastings: numeric("total_litres_tastings", { precision: 10, scale: 2 }),
  // Strength — determines duty band under the 2023 alcohol duty reform
  nominalAbvPct: numeric("nominal_abv_pct", { precision: 5, scale: 2 }),
  dutyRatePer100L: numeric("duty_rate_per_100_l", { precision: 8, scale: 2 }),
  totalDutyPayable: numeric("total_duty_payable", { precision: 10, scale: 2 }),
  submittedDate: date("submitted_date"),
  paidDate: date("paid_date"),
  status: text("status").notNull().default("draft"),
  smallProducerRelief: boolean("small_producer_relief").default(false),
  // Annual production in litres — used to verify SPR eligibility (threshold: 450,000 L = 4,500 hl)
  annualProductionL: numeric("annual_production_l", { precision: 12, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Winery Tasting Sessions & Tours ──────────────────────────────────────────
export const wineryTastingSessionsTable = pgTable("winery_tasting_sessions", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  sessionDate: date("session_date").notNull(),
  sessionType: text("session_type"),
  sessionName: text("session_name"),
  visitorCount: integer("visitor_count"),
  winesShownCount: integer("wines_shown_count"),
  volumePerPersonMl: integer("volume_per_person_ml"),
  totalVolumeL: numeric("total_volume_l", { precision: 8, scale: 2 }),
  staffName: text("staff_name"),
  ticketPriceGbp: numeric("ticket_price_gbp", { precision: 8, scale: 2 }),
  revenueGbp: numeric("revenue_gbp", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Winery Age Verification — Challenge 25 ───────────────────────────────────
export const wineryAgeVerificationTable = pgTable("winery_age_verification", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  recordType: text("record_type").notNull(),
  recordDate: date("record_date").notNull(),
  staffName: text("staff_name"),
  trainingProvider: text("training_provider"),
  trainingCertificateRef: text("training_certificate_ref"),
  trainingExpiryDate: date("training_expiry_date"),
  refusalLocation: text("refusal_location"),
  estimatedAge: integer("estimated_age"),
  idRequested: boolean("id_requested").default(false),
  idProduced: boolean("id_produced").default(false),
  supervisorNotified: boolean("supervisor_notified").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Vineyard Spray Diary ─────────────────────────────────────────────────────
export const vineyardSprayDiaryTable = pgTable("vineyard_spray_diary", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  blockId: integer("block_id").references(() => vineyardBlocksTable.id),
  applicationDate: date("application_date").notNull(),
  productName: text("product_name").notNull(),
  mappNumber: text("mapp_number"),
  activeIngredient: text("active_ingredient"),
  productType: text("product_type"),
  ratePerHectare: numeric("rate_per_hectare", { precision: 8, scale: 3 }),
  rateUnit: text("rate_unit"),
  totalQuantityApplied: numeric("total_quantity_applied", { precision: 10, scale: 3 }),
  quantityUnit: text("quantity_unit"),
  areaTreatedHa: numeric("area_treated_ha", { precision: 8, scale: 4 }),
  waterVolumeLPerHa: integer("water_volume_l_per_ha"),
  applicationMethod: text("application_method"),
  reentryPeriodHours: integer("reentry_period_hours"),
  harvestIntervalDays: integer("harvest_interval_days"),
  windSpeedMph: numeric("wind_speed_mph", { precision: 4, scale: 1 }),
  temperatureCelsius: numeric("temperature_celsius", { precision: 4, scale: 1 }),
  weatherConditions: text("weather_conditions"),
  operatorName: text("operator_name"),
  operatorCertificateNo: text("operator_certificate_no"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Vineyard Soil & Leaf Analysis ────────────────────────────────────────────
export const vineyardSoilAnalysisTable = pgTable("vineyard_soil_analysis", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  blockId: integer("block_id").references(() => vineyardBlocksTable.id),

  // Workflow status: pending_collection | collected | awaiting_results | complete
  status: text("status").notNull().default("complete"),

  // Stage 1 — Sample request
  requestDate: date("request_date"),
  requestedBy: text("requested_by"),
  analysisType: text("analysis_type"),

  // Stage 2 — Field collection
  collectionDate: date("collection_date"),
  collectedBy: text("collected_by"),
  collectionNotes: text("collection_notes"),
  collectionGpsLat: numeric("collection_gps_lat", { precision: 10, scale: 6 }),
  collectionGpsLng: numeric("collection_gps_lng", { precision: 10, scale: 6 }),

  // Stage 3 — Dispatch to lab
  dispatchDate: date("dispatch_date"),
  labName: text("lab_name"),
  sampleReference: text("sample_reference"),

  // Stage 4 — Lab results (analysisDate = date on the report, nullable until results in)
  resultsReceivedDate: date("results_received_date"),
  analysisDate: date("analysis_date"),
  ph: numeric("ph", { precision: 4, scale: 2 }),
  organicMatterPct: numeric("organic_matter_pct", { precision: 5, scale: 2 }),
  phosphorusMgL: numeric("phosphorus_mg_l", { precision: 8, scale: 2 }),
  potassiumMgL: numeric("potassium_mg_l", { precision: 8, scale: 2 }),
  magnesiumMgL: numeric("magnesium_mg_l", { precision: 8, scale: 2 }),
  calciumMgL: numeric("calcium_mg_l", { precision: 8, scale: 2 }),
  ironMgL: numeric("iron_mg_l", { precision: 8, scale: 2 }),
  manganeseMgL: numeric("manganese_mg_l", { precision: 8, scale: 2 }),
  boronMgL: numeric("boron_mg_l", { precision: 8, scale: 2 }),
  nitrogenMgL: numeric("nitrogen_mg_l", { precision: 8, scale: 2 }),
  sulphurMgL: numeric("sulphur_mg_l", { precision: 8, scale: 2 }),
  cecCmolKg: numeric("cec_cmol_kg", { precision: 8, scale: 2 }),
  recommendations: text("recommendations"),
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

// ─── Winery Reception / Grape Intake at Winery Gate ───────────────────────────
export const wineryReceptionRecordsTable = pgTable("winery_reception_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  receptionDate: date("reception_date").notNull(),
  vintageYear: integer("vintage_year"),
  blockId: integer("block_id").references(() => vineyardBlocksTable.id),
  variety: text("variety"),
  sourceType: text("source_type"), // own-vineyard | contract-grower | purchased
  growerName: text("grower_name"),
  vehicleReg: text("vehicle_reg"),
  driverName: text("driver_name"),
  grossWeightKg: numeric("gross_weight_kg", { precision: 10, scale: 2 }),
  tareWeightKg: numeric("tare_weight_kg", { precision: 10, scale: 2 }),
  netWeightKg: numeric("net_weight_kg", { precision: 10, scale: 2 }),
  intakeTemperatureC: numeric("intake_temperature_c", { precision: 4, scale: 1 }),
  brix: numeric("brix", { precision: 5, scale: 2 }),
  ph: numeric("ph", { precision: 4, scale: 2 }),
  titratableAcidityGl: numeric("titratable_acidity_gl", { precision: 5, scale: 2 }),
  potentialAlcohol: numeric("potential_alcohol", { precision: 5, scale: 2 }),
  grapeCondition: text("grape_condition"), // excellent | good | fair | poor
  botrytisPct: integer("botrytis_pct"),
  mogPct: numeric("mog_pct", { precision: 4, scale: 1 }), // material other than grapes
  holdingBin: text("holding_bin"),
  inspectorName: text("inspector_name"),
  accepted: boolean("accepted").default(true),
  rejectionReason: text("rejection_reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Winery Pressing Records ───────────────────────────────────────────────────
export const wineryPressingRecordsTable = pgTable("winery_pressing_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  pressDate: date("press_date").notNull(),
  vintageYear: integer("vintage_year"),
  batchRef: text("batch_ref"),
  pressType: text("press_type"), // pneumatic-bladder | basket | continuous-screw | other
  grapesPressedKg: numeric("grapes_pressed_kg", { precision: 10, scale: 2 }),
  freeRunLitres: numeric("free_run_litres", { precision: 10, scale: 2 }),
  pressWineLitres: numeric("press_wine_litres", { precision: 10, scale: 2 }),
  totalJuiceLitres: numeric("total_juice_litres", { precision: 10, scale: 2 }),
  pressEfficiencyLPerKg: numeric("press_efficiency_l_per_kg", { precision: 5, scale: 3 }),
  juiceBrix: numeric("juice_brix", { precision: 5, scale: 2 }),
  juicePh: numeric("juice_ph", { precision: 4, scale: 2 }),
  juiceTaGl: numeric("juice_ta_gl", { precision: 5, scale: 2 }),
  juiceTurbidity: text("juice_turbidity"), // clear | slight | turbid
  freeRunSeparated: boolean("free_run_separated").default(true),
  additionsAtPress: text("additions_at_press"),
  settlingMethod: text("settling_method"), // static-cold | static-warm | centrifuge | flocculant | none
  settlingVessel: text("settling_vessel"),
  settlingHours: integer("settling_hours"),
  juiceAnalysisSource: text("juice_analysis_source"),
  operatorName: text("operator_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Winery Vessels Register ───────────────────────────────────────────────────
export const wineryVesselsTable = pgTable("winery_vessels", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  vesselRef: text("vessel_ref").notNull(), // user-assigned ID e.g. T1, Barrel-B12
  vesselType: text("vessel_type"), // stainless-tank | oak-barrel | oak-vat | amphora | fibreglass | hdpe | other
  capacityLitres: numeric("capacity_litres", { precision: 10, scale: 2 }),
  material: text("material"),
  yearPurchased: integer("year_purchased"),
  manufacturer: text("manufacturer"),
  location: text("location"),
  currentContents: text("current_contents"),
  currentVolumeLitres: numeric("current_volume_litres", { precision: 10, scale: 2 }),
  oakOrigin: text("oak_origin"),
  cooperage: text("cooperage"),
  fillNumber: integer("fill_number"),
  toastingLevel: text("toasting_level"),
  status: text("status").notNull().default("active"), // active | retired | sold
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Winery Vessel Cleaning Records ───────────────────────────────────────────
export const wineryVesselCleansTable = pgTable("winery_vessel_cleans", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  vesselId: integer("vessel_id").notNull().references(() => wineryVesselsTable.id, { onDelete: "cascade" }),
  cleanDate: date("clean_date").notNull(),
  cleanType: text("clean_type"), // rinse | cip | hot-water | steam | chemical | ozone
  cleaningProduct: text("cleaning_product"),
  concentrationPct: numeric("concentration_pct", { precision: 5, scale: 2 }),
  waterTempC: numeric("water_temp_c", { precision: 4, scale: 1 }),
  contactTimeMin: integer("contact_time_min"),
  rinseCompleted: boolean("rinse_completed").default(true),
  operatorName: text("operator_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Winery Fermentation Records ──────────────────────────────────────────────
export const wineryFermentationRecordsTable = pgTable("winery_fermentation_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  vintageYear: integer("vintage_year"),
  batchRef: text("batch_ref"),
  wineColour: text("wine_colour"),
  vesselId: integer("vessel_id").references(() => wineryVesselsTable.id),
  startDate: date("start_date"),
  fermentationType: text("fermentation_type"), // wild | inoculated
  yeastStrain: text("yeast_strain"),
  inoculationDate: date("inoculation_date"),
  inoculationTempC: numeric("inoculation_temp_c", { precision: 4, scale: 1 }),
  startBrix: numeric("start_brix", { precision: 5, scale: 2 }),
  endBrix: numeric("end_brix", { precision: 5, scale: 2 }),
  endDate: date("end_date"),
  endSg: numeric("end_sg", { precision: 6, scale: 4 }),
  residualSugarGl: numeric("residual_sugar_gl", { precision: 6, scale: 2 }),
  maxTempC: numeric("max_temp_c", { precision: 4, scale: 1 }),
  minTempC: numeric("min_temp_c", { precision: 4, scale: 1 }),
  nutrientAdditions: text("nutrient_additions"),
  so2AtFermentationMgL: numeric("so2_at_fermentation_mg_l", { precision: 7, scale: 2 }),
  volumeLitres: numeric("volume_litres", { precision: 10, scale: 2 }),
  operatorName: text("operator_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Winery Lab Equipment Register ────────────────────────────────────────────
export const wineryEquipmentTable = pgTable("winery_equipment", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  equipmentRef: text("equipment_ref").notNull(),
  equipmentType: text("equipment_type"), // ripper-burette | enzymatic-analyser | ao-apparatus | refractometer | ph-meter | hydrometer | other
  manufacturer: text("manufacturer"),
  model: text("model"),
  serialNumber: text("serial_number"),
  purchaseDate: date("purchase_date"),
  calibrationFrequency: text("calibration_frequency"), // daily | weekly | monthly | quarterly | annually | per-use
  lastCalibrationDate: date("last_calibration_date"),
  nextCalibrationDue: date("next_calibration_due"),
  status: text("status").notNull().default("active"), // active | retired | out-of-service
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Winery Equipment Calibration Records ─────────────────────────────────────
export const wineryEquipmentCalibrationsTable = pgTable("winery_equipment_calibrations", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  equipmentId: integer("equipment_id").notNull().references(() => wineryEquipmentTable.id, { onDelete: "cascade" }),
  calibrationDate: date("calibration_date").notNull(),
  standardUsed: text("standard_used"),
  result: text("result"), // pass | fail | adjusted
  preCalibrationReading: numeric("pre_calibration_reading", { precision: 8, scale: 3 }),
  postCalibrationReading: numeric("post_calibration_reading", { precision: 8, scale: 3 }),
  expectedValue: numeric("expected_value", { precision: 8, scale: 3 }),
  deviation: numeric("deviation", { precision: 8, scale: 3 }),
  actionTaken: text("action_taken"),
  operatorName: text("operator_name"),
  certificateRef: text("certificate_ref"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Winery SO₂ Testing Register ──────────────────────────────────────────────
export const winerySo2TestsTable = pgTable("winery_so2_tests", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  testDate: date("test_date").notNull(),
  vintageYear: integer("vintage_year"),
  batchRef: text("batch_ref"),
  wineColour: text("wine_colour"),
  vesselId: integer("vessel_id").references(() => wineryVesselsTable.id),
  testStage: text("test_stage"), // at-pressing | post-fermentation | post-racking | pre-bottling | at-bottling | other
  testMethod: text("test_method"), // on-site-ripper | on-site-enzymatic | on-site-ao | third-party-lab | not-tested
  equipmentId: integer("equipment_id").references(() => wineryEquipmentTable.id),
  labName: text("lab_name"),
  labRef: text("lab_ref"),
  freeSo2MgL: numeric("free_so2_mg_l", { precision: 7, scale: 2 }),
  totalSo2MgL: numeric("total_so2_mg_l", { precision: 7, scale: 2 }),
  maxPermittedMgL: numeric("max_permitted_mg_l", { precision: 7, scale: 2 }),
  so2Compliant: boolean("so2_compliant"),
  actionTaken: text("action_taken"),
  operatorName: text("operator_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Winery Cellar Operations Log ─────────────────────────────────────────────
export const wineryCellarOpsTable = pgTable("winery_cellar_ops", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  opDate: date("op_date").notNull(),
  vintageYear: integer("vintage_year"),
  batchRef: text("batch_ref"),
  opType: text("op_type").notNull(), // racking | topping | sulfiting | fining | filtering | cold-stabilisation | other
  fromVesselId: integer("from_vessel_id").references(() => wineryVesselsTable.id),
  toVesselId: integer("to_vessel_id").references(() => wineryVesselsTable.id),
  volumeMovedLitres: numeric("volume_moved_litres", { precision: 10, scale: 2 }),
  leesDepthCm: numeric("lees_depth_cm", { precision: 5, scale: 1 }),
  topUpVolumeLitres: numeric("top_up_volume_litres", { precision: 8, scale: 2 }),
  topUpSource: text("top_up_source"),
  so2Product: text("so2_product"),
  so2QuantityG: numeric("so2_quantity_g", { precision: 8, scale: 2 }),
  freeSo2BeforeMgL: numeric("free_so2_before_mg_l", { precision: 7, scale: 2 }),
  freeSo2AfterMgL: numeric("free_so2_after_mg_l", { precision: 7, scale: 2 }),
  finingAgent: text("fining_agent"),
  finingDose: text("fining_dose"),
  contactTimeHours: integer("contact_time_hours"),
  filterType: text("filter_type"),
  filterPoreUm: numeric("filter_pore_um", { precision: 5, scale: 2 }),
  clarityBefore: text("clarity_before"),
  clarityAfter: text("clarity_after"),
  operatorName: text("operator_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Winery Batch / Lot Number Settings ───────────────────────────────────────
// One row per farm. Controls auto-generation of pressing batch references.
export const wineryBatchSettingsTable = pgTable("winery_batch_settings", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id).unique(),
  // e.g. "PRESS", "LOT", "VIN" — prefix used when auto-generating
  prefix: text("prefix").notNull().default("PRESS"),
  // "YYYY" = full year (2025), "YY" = short year (25)
  yearFormat: text("year_format").notNull().default("YYYY"),
  // Zero-padding width for the sequence number (3 = 001, 002…)
  paddingDigits: integer("padding_digits").notNull().default(3),
  // Next sequence number to issue — incremented atomically on each auto-generate
  nextSequence: integer("next_sequence").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Winery Bottling Records ───────────────────────────────────────────────────
export const wineryBottlingRecordsTable = pgTable("winery_bottling_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  bottlingDate: date("bottling_date").notNull(),
  vintageYear: integer("vintage_year"),
  batchRef: text("batch_ref"),
  lotCode: text("lot_code"),
  wineColour: text("wine_colour"),
  sourceVesselId: integer("source_vessel_id").references(() => wineryVesselsTable.id),
  volumeBottledLitres: numeric("volume_bottled_litres", { precision: 10, scale: 2 }),
  bottleSizeMl: integer("bottle_size_ml"),
  bottlesProduced: integer("bottles_produced"),
  casesProduced: integer("cases_produced"),
  closureType: text("closure_type"), // natural-cork | technical-cork | screw-cap | crown-cap | agglomerate-cork
  corkGrade: text("cork_grade"),
  labelBatch: text("label_batch"),
  freeSo2MgL: numeric("free_so2_mg_l", { precision: 7, scale: 2 }),
  totalSo2MgL: numeric("total_so2_mg_l", { precision: 7, scale: 2 }),
  actualAbvPct: numeric("actual_abv_pct", { precision: 5, scale: 2 }),
  residualSugarGl: numeric("residual_sugar_gl", { precision: 6, scale: 2 }),
  ph: numeric("ph", { precision: 4, scale: 2 }),
  titratableAcidityGl: numeric("titratable_acidity_gl", { precision: 5, scale: 2 }),
  certifiedOrganic: boolean("certified_organic").default(false),
  certifierRef: text("certifier_ref"),
  operatorName: text("operator_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
