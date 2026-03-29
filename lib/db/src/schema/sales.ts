import { pgTable, text, serial, integer, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import { farmsTable } from "./core";
import { suppliersTable } from "./stock-suppliers";

// ─── Grain Sales ──────────────────────────────────────────────────────────────
// Covers spot sales, contract call-offs, and pool scheme allocations
export const grainSalesTable = pgTable("grain_sales", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  saleDate: timestamp("sale_date", { withTimezone: true }).notNull(),
  saleType: text("sale_type").notNull().default("spot"), // spot | forward | pool | ex-store
  buyerId: integer("buyer_id").references(() => suppliersTable.id),
  buyer: text("buyer").notNull(),
  merchantRef: text("merchant_ref"),
  commodity: text("commodity").notNull(),
  variety: text("variety"),
  tonnage: numeric("tonnage", { precision: 10, scale: 2 }).notNull(),
  pricePerTonnePence: integer("price_per_tonne_pence"), // pence/tonne
  poolBonus: integer("pool_bonus_pence"), // pence/tonne additional pool payment
  grossValuePence: integer("gross_value_pence"),
  deductionsPence: integer("deductions_pence"), // levy, drying, sampling etc
  netValuePence: integer("net_value_pence"),
  moisture: numeric("moisture", { precision: 5, scale: 2 }),
  specificWeight: numeric("specific_weight", { precision: 5, scale: 1 }), // kg/hl
  protein: numeric("protein", { precision: 5, scale: 2 }),
  screenings: numeric("screenings", { precision: 5, scale: 2 }),
  gradeAchieved: text("grade_achieved"),
  qualitySpec: text("quality_spec"),
  deliveryDate: timestamp("delivery_date", { withTimezone: true }),
  deliveryLocation: text("delivery_location"),
  haulierName: text("haulier_name"),
  vehicleReg: text("vehicle_reg"),
  weighbridgeTicket: text("weighbridge_ticket"),
  invoiceNumber: text("invoice_number"),
  paymentDate: timestamp("payment_date", { withTimezone: true }),
  linkedContractId: integer("linked_contract_id"), // FK to crop_contracts if call-off
  cropYear: text("crop_year"), // e.g. "2024/25"
  field: text("field"),
  storeBin: text("store_bin"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ─── Livestock Deadweight Sales ────────────────────────────────────────────────
// Slaughterhouse / processor kill sheets for beef, sheep, pigs
export const livestockDeadweightSalesTable = pgTable("livestock_deadweight_sales", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  killDate: timestamp("kill_date", { withTimezone: true }).notNull(),
  processorId: integer("processor_id").references(() => suppliersTable.id),
  processor: text("processor").notNull(),
  species: text("species").notNull(), // cattle | sheep | pigs | deer
  breed: text("breed"),
  headCount: integer("head_count").notNull(),
  totalDeadweightKg: numeric("total_deadweight_kg", { precision: 10, scale: 2 }),
  averageDeadweightKg: numeric("average_deadweight_kg", { precision: 8, scale: 2 }),
  pricePerKgPence: integer("price_per_kg_pence"),
  gradeClassification: text("grade_classification"), // e.g. R4L, U3
  fatClass: text("fat_class"),
  conformationClass: text("conformation_class"),
  killSheetRef: text("kill_sheet_ref"),
  abattoirRef: text("abattoir_ref"),
  grossValuePence: integer("gross_value_pence"),
  transportDeductionPence: integer("transport_deduction_pence"),
  levyDeductionPence: integer("levy_deduction_pence"),
  otherDeductionsPence: integer("other_deductions_pence"),
  netPaymentPence: integer("net_payment_pence"),
  paymentDate: timestamp("payment_date", { withTimezone: true }),
  redTractorAssured: boolean("red_tractor_assured").default(false),
  organicCertified: boolean("organic_certified").default(false),
  premiumSchemeName: text("premium_scheme_name"),
  premiumPence: integer("premium_pence"),
  vendorDeclarationRef: text("vendor_declaration_ref"),
  animalIds: text("animal_ids"), // comma-separated ear tags
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ─── Livestock Mart / Auction Sales ───────────────────────────────────────────
export const livestockMartSalesTable = pgTable("livestock_mart_sales", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  saleDate: timestamp("sale_date", { withTimezone: true }).notNull(),
  martId: integer("mart_id").references(() => suppliersTable.id),
  martName: text("mart_name").notNull(),
  martLocation: text("mart_location"),
  species: text("species").notNull(),
  category: text("category"), // store / finished / breeding / pedigree
  lotNumber: text("lot_number"),
  headCount: integer("head_count").notNull(),
  averageLiveweightKg: numeric("average_liveweight_kg", { precision: 8, scale: 2 }),
  priceType: text("price_type").notNull().default("per_head"), // per_head | per_kg_lw | per_kg_dw
  pricePerUnitPence: integer("price_per_unit_pence"),
  grossValuePence: integer("gross_value_pence"),
  commissionPence: integer("commission_pence"),
  levyPence: integer("levy_pence"),
  transportCostPence: integer("transport_cost_pence"),
  otherCostsPence: integer("other_costs_pence"),
  netPaymentPence: integer("net_payment_pence"),
  buyerName: text("buyer_name"),
  buyerNumber: text("buyer_number"),
  auctioneerRef: text("auctioneer_ref"),
  paymentDate: timestamp("payment_date", { withTimezone: true }),
  vendorDeclarationRef: text("vendor_declaration_ref"),
  animalIds: text("animal_ids"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ─── Milk Statements ──────────────────────────────────────────────────────────
// Monthly milk buyer statements — dairy farms
export const milkStatementsTable = pgTable("milk_statements", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  statementMonth: text("statement_month").notNull(), // e.g. "2025-03"
  buyerId: integer("buyer_id").references(() => suppliersTable.id),
  buyer: text("buyer").notNull(),
  cphNumber: text("cph_number"),
  litresSupplied: numeric("litres_supplied", { precision: 12, scale: 2 }),
  pencePerLitre: numeric("pence_per_litre", { precision: 8, scale: 4 }),
  grossValuePence: integer("gross_value_pence"),
  butterfatPct: numeric("butterfat_pct", { precision: 5, scale: 3 }),
  proteinPct: numeric("protein_pct", { precision: 5, scale: 3 }),
  scc: integer("scc"), // somatic cell count (000s/ml)
  bactoscan: integer("bactoscan"), // (000s/ml)
  butterfatBonusPence: integer("butterfat_bonus_pence"),
  proteinBonusPence: integer("protein_bonus_pence"),
  qualityBonusPence: integer("quality_bonus_pence"),
  qualityPenaltyPence: integer("quality_penalty_pence"),
  sccPenaltyPence: integer("scc_penalty_pence"),
  bactoscanPenaltyPence: integer("bactoscan_penalty_pence"),
  transportDeductionPence: integer("transport_deduction_pence"),
  membershipDeductionPence: integer("membership_deduction_pence"),
  otherDeductionsPence: integer("other_deductions_pence"),
  netPaymentPence: integer("net_payment_pence"),
  paymentDate: timestamp("payment_date", { withTimezone: true }),
  organicPremiumPence: integer("organic_premium_pence"),
  sustainabilityBonusPence: integer("sustainability_bonus_pence"),
  statementRef: text("statement_ref"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ─── Poultry Batch Settlements ────────────────────────────────────────────────
// Integrator settlement for broiler and turkey batches
export const poultryBatchSettlementsTable = pgTable("poultry_batch_settlements", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  flockRef: text("flock_ref").notNull(),
  integratorId: integer("integrator_id").references(() => suppliersTable.id),
  integratorName: text("integrator_name").notNull(),
  species: text("species").notNull().default("broiler"), // broiler | turkey | duck | layers
  placementDate: timestamp("placement_date", { withTimezone: true }),
  catchDate: timestamp("catch_date", { withTimezone: true }),
  birdsPlaced: integer("birds_placed"),
  birdsDelivered: integer("birds_delivered"),
  mortalityPct: numeric("mortality_pct", { precision: 5, scale: 2 }),
  averageLiveweightKg: numeric("average_liveweight_kg", { precision: 8, scale: 3 }),
  totalLiveweightKg: numeric("total_liveweight_kg", { precision: 12, scale: 2 }),
  fcr: numeric("fcr", { precision: 6, scale: 3 }), // feed conversion ratio
  ebi: numeric("ebi", { precision: 8, scale: 2 }), // European Broiler Index
  settlementRatePence: integer("settlement_rate_pence"), // pence/kg liveweight
  grossValuePence: integer("gross_value_pence"),
  bonusPence: integer("bonus_pence"), // performance bonus
  penaltyPence: integer("penalty_pence"),
  catchingCostPence: integer("catching_cost_pence"),
  otherDeductionsPence: integer("other_deductions_pence"),
  netPaymentPence: integer("net_payment_pence"),
  paymentDate: timestamp("payment_date", { withTimezone: true }),
  slaughterhouseName: text("slaughterhouse_name"),
  settlementRef: text("settlement_ref"),
  chickDaysSurvived: integer("chick_days_survived"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ─── Egg Sales ────────────────────────────────────────────────────────────────
// Packing station or direct egg sales for layer flocks
export const eggSalesTable = pgTable("egg_sales", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  weekEnding: timestamp("week_ending", { withTimezone: true }).notNull(),
  packingStationId: integer("packing_station_id").references(() => suppliersTable.id),
  packingStation: text("packing_station"),
  salesChannel: text("sales_channel").notNull().default("packing_station"), // packing_station | direct | farm_gate | processor
  flockRef: text("flock_ref"),
  dozensCollected: numeric("dozens_collected", { precision: 10, scale: 2 }),
  dozensDelivered: numeric("dozens_delivered", { precision: 10, scale: 2 }),
  gradeADozens: numeric("grade_a_dozens", { precision: 10, scale: 2 }),
  gradeBDozens: numeric("grade_b_dozens", { precision: 10, scale: 2 }),
  crackWasteDozens: numeric("crack_waste_dozens", { precision: 10, scale: 2 }),
  layRatePct: numeric("lay_rate_pct", { precision: 5, scale: 2 }),
  pricePerDozenPence: integer("price_per_dozen_pence"),
  grossValuePence: integer("gross_value_pence"),
  deductionsPence: integer("deductions_pence"),
  netValuePence: integer("net_value_pence"),
  paymentDate: timestamp("payment_date", { withTimezone: true }),
  eggType: text("egg_type").notNull().default("free_range"), // free_range | barn | organic | colony | enriched
  packingRef: text("packing_ref"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ─── Pig Kill Records ─────────────────────────────────────────────────────────
// Processor kill sheets — deadweight, grade, P2 backfat
export const pigKillRecordsTable = pgTable("pig_kill_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  killDate: timestamp("kill_date", { withTimezone: true }).notNull(),
  processorId: integer("processor_id").references(() => suppliersTable.id),
  processor: text("processor").notNull(),
  headCount: integer("head_count").notNull(),
  totalDeadweightKg: numeric("total_deadweight_kg", { precision: 10, scale: 2 }),
  averageDeadweightKg: numeric("average_deadweight_kg", { precision: 8, scale: 2 }),
  pricePerKgPence: integer("price_per_kg_pence"),
  grossValuePence: integer("gross_value_pence"),
  levelDeductionPence: integer("levy_deduction_pence"),
  transportDeductionPence: integer("transport_deduction_pence"),
  otherDeductionsPence: integer("other_deductions_pence"),
  netPaymentPence: integer("net_payment_pence"),
  paymentDate: timestamp("payment_date", { withTimezone: true }),
  averageP2BackfatMm: numeric("average_p2_backfat_mm", { precision: 5, scale: 1 }),
  averageMuscleDepthMm: numeric("average_muscle_depth_mm", { precision: 5, scale: 1 }),
  leanMeatPct: numeric("lean_meat_pct", { precision: 5, scale: 2 }),
  gradeOut: text("grade_out"), // R, O, P etc
  p2Distribution: text("p2_distribution"), // JSON string of P2 band counts
  sppPriceKgPence: integer("spp_price_kg_pence"), // SPP (Standard Pig Price) for comparison
  sppVariancePence: integer("spp_variance_pence"), // difference vs SPP
  killSheetRef: text("kill_sheet_ref"),
  herdMark: text("herd_mark"),
  premiumScheme: text("premium_scheme"), // BPEX, outdoor, organic
  premiumPence: integer("premium_pence"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ─── Direct Sales Records ─────────────────────────────────────────────────────
// Farm shop, box scheme, farmers market, wholesale, online
export const directSalesRecordsTable = pgTable("direct_sales_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").notNull().references(() => farmsTable.id),
  saleDate: timestamp("sale_date", { withTimezone: true }).notNull(),
  customerId: integer("customer_id").references(() => suppliersTable.id),
  channel: text("channel").notNull(), // farm_shop | box_scheme | farmers_market | wholesale | online | veg_box | restaurant | school
  productName: text("product_name").notNull(),
  productCategory: text("product_category"), // veg | fruit | meat | dairy | eggs | grain | honey | other
  quantity: numeric("quantity", { precision: 10, scale: 3 }).notNull(),
  unit: text("unit").notNull(), // kg | dozen | unit | litre | bunch | head | box
  unitPricePence: integer("unit_price_pence").notNull(),
  grossValuePence: integer("gross_value_pence").notNull(),
  vatPence: integer("vat_pence"),
  vatRate: text("vat_rate"), // 0 | 5 | 20
  netValuePence: integer("net_value_pence"),
  paymentMethod: text("payment_method"), // cash | card | bank_transfer | invoice
  paymentStatus: text("payment_status").notNull().default("paid"), // paid | pending | overdue
  customerName: text("customer_name"),
  customerRef: text("customer_ref"),
  invoiceNumber: text("invoice_number"),
  marketName: text("market_name"),
  packingRef: text("packing_ref"),
  certificationRef: text("certification_ref"), // e.g. organic cert
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
