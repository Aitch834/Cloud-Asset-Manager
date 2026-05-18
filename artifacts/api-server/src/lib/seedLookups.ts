import { db, lookupItemsTable } from "@workspace/db";
import { eq, and, isNull } from "drizzle-orm";

export interface LookupDefinition {
  label: string;
  description: string;
  authority: string;
  authorityUrl: string | null;
  reviewFrequency: string;
  items: string[] | { label: string; group?: string }[];
}

export const LOOKUP_DEFINITIONS: Record<string, LookupDefinition> = {
  inspection_types: {
    label: "Inspection Types",
    description: "Types of farm inspection and audit",
    authority: "Red Tractor / Local Authority / Organic certifiers",
    authorityUrl: "https://www.redtractor.org.uk",
    reviewFrequency: "Annual",
    items: [
      "Red Tractor",
      "Internal Audit",
      "EHO",
      "Trading Standards",
      "Organic",
      "LEAF Marque",
      "Soil Association",
      "RSPCA Assured",
      "BRC Global Standards",
      "QMS",
      "Countryside Stewardship Walk-Over",
      "Environment Agency",
      "Other",
    ],
  },
  grant_schemes: {
    label: "Grant & Subsidy Schemes",
    description: "UK agricultural grant and subsidy schemes",
    authority: "DEFRA / Rural Payments Agency",
    authorityUrl: "https://www.gov.uk/guidance/farming-grants-and-payments",
    reviewFrequency: "Quarterly",
    items: [
      "Sustainable Farming Incentive (SFI)",
      "Countryside Stewardship (CS)",
      "Basic Payment Scheme (BPS)",
      "Higher Tier Countryside Stewardship",
      "Farming in Protected Landscapes (FiPL)",
      "Environmental Land Management (ELM)",
      "Slurry Infrastructure Grant",
      "Farming Equipment & Technology Fund (FETF)",
      "Productivity & Slurry Grant",
      "Water Management Grant",
      "Livestock Health & Welfare Pathway",
      "AHDB Levy",
      "Other Government Grant",
      "Other",
    ],
  },
  transaction_categories: {
    label: "Transaction Categories",
    description: "Income and expense categories for financial records",
    authority: "Internal BDE / HMRC",
    authorityUrl: "https://www.gov.uk/government/publications/rates-and-allowances-for-agriculture",
    reviewFrequency: "Annual",
    items: [
      "Seeds & Seed Treatments",
      "Fertiliser",
      "Pesticides & Herbicides",
      "Fungicides",
      "Insecticides",
      "Veterinary & Medicine",
      "Feed & Bedding",
      "Fuel",
      "Machinery & Equipment",
      "Labour",
      "Agri-Environment Scheme",
      "Grant / Subsidy",
      "Crop Sales",
      "Livestock Sales",
      "Haulage",
      "Other Income",
      "Other Expense",
    ],
  },
  payment_methods: {
    label: "Payment Methods",
    description: "Financial transaction payment methods",
    authority: "Internal BDE",
    authorityUrl: null,
    reviewFrequency: "As needed",
    items: ["Bank Transfer", "Direct Debit", "Cheque", "Cash", "Card", "BACS", "Other"],
  },
  commodity_types: {
    label: "Commodity Types",
    description: "Crop and commodity types for haulage and trade records",
    authority: "AHDB",
    authorityUrl: "https://ahdb.org.uk/cereals-oilseeds",
    reviewFrequency: "Annual",
    items: [
      "Winter Wheat",
      "Spring Wheat",
      "Winter Barley",
      "Spring Barley",
      "Malting Barley",
      "Winter Oats",
      "Spring Oats",
      "Oilseed Rape",
      "Winter Beans",
      "Spring Beans",
      "Peas",
      "Maize",
      "Rye",
      "Triticale",
      "Linseed",
      "Other",
    ],
  },
  load_types: {
    label: "Load / Haulage Types",
    description: "Types of load for haulage and movement records",
    authority: "Internal BDE",
    authorityUrl: null,
    reviewFrequency: "As needed",
    items: ["Grain", "Straw", "Silage", "Livestock", "Fertiliser", "Machinery", "Waste", "Other"],
  },
  spray_product_categories: {
    label: "Spray Product Categories",
    description: "Categories of crop protection products (pesticides)",
    authority: "HSE / MAPP Register / BCPC",
    authorityUrl: "https://www.hse.gov.uk/pesticides/",
    reviewFrequency: "Annual",
    items: [
      "Herbicide",
      "Fungicide",
      "Insecticide",
      "Molluscicide",
      "Growth Regulator",
      "Foliar Feed",
      "Adjuvant",
      "Desiccant",
      "Biostimulant",
      "Other",
    ],
  },
  biofuel_cert_schemes: {
    label: "Biofuel Certification Schemes",
    description: "Sustainability certification schemes for biofuel feedstocks (RTFO compliance)",
    authority: "DfT / ISCC / Bonsucro",
    authorityUrl: "https://www.gov.uk/guidance/renewable-transport-fuel-obligation",
    reviewFrequency: "Annual",
    items: ["ISCC EU", "ISCC UK", "Bonsucro", "RTRS", "REDcert", "RSB", "Other"],
  },
  nvz_application_methods: {
    label: "NVZ Application Methods",
    description: "Methods for applying organic manures and slurry in Nitrate Vulnerable Zones",
    authority: "Environment Agency",
    authorityUrl: "https://www.gov.uk/guidance/nitrate-vulnerable-zones",
    reviewFrequency: "Annual",
    items: [
      "Trailing shoe",
      "Dribble bar",
      "Injected",
      "Band spread",
      "Broadcast (surface)",
      "Umbilical",
      "Tanker spread",
      "Spinner / broadcast",
      "Foliar",
      "Irrigation",
    ],
  },
  livestock_species: {
    label: "Livestock Species",
    description: "Species types for herd/flock register",
    authority: "APHA / BCU",
    authorityUrl: "https://www.gov.uk/government/organisations/animal-and-plant-health-agency",
    reviewFrequency: "As needed",
    items: ["Cattle", "Sheep", "Pigs", "Poultry", "Goats", "Deer", "Horses", "Other"],
  },
  vineyard_grape_varieties: {
    label: "Vineyard Grape Varieties (UK)",
    description: "Wine grape varieties grown in UK vineyards",
    authority: "HMRC Vine Register / WineGB",
    authorityUrl: "https://www.winegb.co.uk",
    reviewFrequency: "Annual",
    items: [
      "Bacchus", "Chardonnay", "Dornfelder", "Huxelrebe",
      "Madeleine Angevine", "Müller-Thurgau", "Ortega", "Phoenix",
      "Pinot Blanc", "Pinot Gris", "Pinot Meunier", "Pinot Noir",
      "Regent", "Reichensteiner", "Rondo", "Seyval Blanc",
      "Siegerrebe", "Solaris", "Auxerrois", "Cabernet Cortis",
      "Cabernet Blanc", "Johanniter", "Lakhta", "Sauvignon Blanc", "Other",
    ],
  },
  vineyard_rootstocks: {
    label: "Vineyard Rootstocks",
    description: "Grapevine rootstock varieties in use in UK vineyards",
    authority: "WineGB / ENTAV-INRAE",
    authorityUrl: "https://www.winegb.co.uk",
    reviewFrequency: "Annual",
    items: [
      "5C Teleki", "SO4", "3309 Couderc", "101-14 Millardet",
      "5BB Kober", "125AA", "41B", "420A", "Gravesac",
      "Riparia Gloire de Montpellier", "161-49 Couderc",
      "Fercal", "Schwarzmann", "Own Rooted", "Other",
    ],
  },
  vineyard_training_systems: {
    label: "Vineyard Training Systems",
    description: "Vine training and trellis systems",
    authority: "WineGB",
    authorityUrl: null,
    reviewFrequency: "As needed",
    items: ["Double Guyot", "Single Guyot", "Cordon", "Scott Henry", "Lenz Moser", "VSP", "Other"],
  },
  vineyard_operation_types: {
    label: "Vineyard Operation Types",
    description: "Types of canopy management and cultural operations",
    authority: "WineGB Good Viticulture Practice",
    authorityUrl: null,
    reviewFrequency: "Annual",
    items: [
      "Winter Pruning", "Spur Thinning", "Bud Rubbing", "Shoot Thinning",
      "Tie Down / Cane Laying", "Wire Lifting", "Leaf Removal", "Topping / Hedging",
      "Green Harvest (Crop Thinning)", "Soil Cultivation", "Mulching", "Other",
    ],
  },
  vineyard_spray_application_methods: {
    label: "Vineyard Spray Application Methods",
    description: "Application equipment methods for vineyard PPP and plant protection",
    authority: "HSE / NPTC",
    authorityUrl: "https://www.hse.gov.uk/pesticides/",
    reviewFrequency: "Annual",
    items: [
      "Knapsack Sprayer", "Tractor-mounted Boom Sprayer",
      "Air-blast / Vineyard Sprayer", "Lean-to / Facing Sprayer",
      "Drone Application", "Hand-held Lance", "Other",
    ],
  },
  vineyard_spray_rate_units: {
    label: "Spray Rate Units",
    description: "Units for expressing spray product application rates",
    authority: "HSE / BCPC",
    authorityUrl: null,
    reviewFrequency: "As needed",
    items: ["L/ha", "mL/ha", "kg/ha", "g/ha", "fl oz/acre", "oz/acre", "Other"],
  },
  vineyard_spray_quantity_units: {
    label: "Spray Quantity Units",
    description: "Units for expressing total quantities of spray product used",
    authority: "Internal BDE",
    authorityUrl: null,
    reviewFrequency: "As needed",
    items: ["L", "mL", "kg", "g", "fl oz", "Other"],
  },
  vineyard_weather_conditions: {
    label: "Weather Conditions (Spray Diary)",
    description: "Descriptive weather conditions at time of spray application — required for spray records",
    authority: "HSE / NPTC",
    authorityUrl: null,
    reviewFrequency: "As needed",
    items: [
      "Clear and calm", "Overcast, dry, calm", "Light breeze (< 3 mph)",
      "Moderate breeze (3–5 mph)", "Overcast, light rain",
      "Hot and sunny (> 25°C)", "Cold (< 5°C)", "Frost risk",
      "High humidity (> 80%)", "Other",
    ],
  },
  vineyard_soil_analysis_types: {
    label: "Soil & Leaf Analysis Types",
    description: "Types of analytical testing for vineyard soils and plant tissue",
    authority: "WineGB / Organic certifiers",
    authorityUrl: null,
    reviewFrequency: "Annual",
    items: ["Soil Analysis", "Petiole (Leaf) Analysis", "Must Analysis", "Tissue Analysis"],
  },
  vineyard_laboratories: {
    label: "Analytical Laboratories (Viticulture)",
    description: "Laboratories used for soil, leaf, and must analysis",
    authority: "UKAS / Internal BDE",
    authorityUrl: "https://www.ukas.com",
    reviewFrequency: "Annual",
    items: [
      "NRM Group", "Lancrop Laboratories", "ADAS Analytical Services",
      "Eurofins Agro UK", "Agri-Food & Biosciences Institute (AFBI)",
      "RB209 Soil Analysis", "CIEL", "University of East Anglia Analytical",
      "Other",
    ],
  },
  organic_certifying_bodies: {
    label: "Organic Certifying Bodies (UK)",
    description: "UK-approved certifying bodies for organic production",
    authority: "DEFRA / UK Organic Regulation 2020",
    authorityUrl: "https://www.gov.uk/guidance/organic-farming",
    reviewFrequency: "Annual",
    items: [
      "Soil Association", "Organic Farmers & Growers (OF&G)",
      "Biodynamic Association (BDAA)", "Quality Welsh Food Certification (QWFC)",
      "Organic Trust (ROI)", "Other",
    ],
  },
  organic_land_use_types: {
    label: "Pre-conversion Land Use Types",
    description: "Previous land use history relevant to organic conversion records",
    authority: "UK Organic Regs 2020",
    authorityUrl: null,
    reviewFrequency: "As needed",
    items: [
      "Conventional arable", "Conventional grassland", "Conventional horticulture",
      "Set-aside / fallow", "Woodland / forestry", "Previously certified organic",
      "In-conversion", "Amenity / parkland", "Other",
    ],
  },
  organic_input_units: {
    label: "Organic Input Application Units",
    description: "Units for expressing quantities of organic inputs applied",
    authority: "Internal BDE",
    authorityUrl: null,
    reviewFrequency: "As needed",
    items: ["kg/ha", "g/ha", "L/ha", "mL/ha", "kg", "g", "L", "mL", "t/ha", "Other"],
  },
  organic_copper_products: {
    label: "Organic Copper-based Products",
    description: "Copper fungicide products permitted under UK Organic Regs 2020 Annex II",
    authority: "UK Organic Regs 2020 / HSE MAPP",
    authorityUrl: "https://www.hse.gov.uk/pesticides/",
    reviewFrequency: "Annual",
    items: [
      "Bordeaux Mixture WP", "Copper Hydroxide WP",
      "Copper Oxychloride WP", "Copper Sulfate (tribasic)",
      "Cuprofix Ultra 40 Disperss", "Funguran Progress",
      "Kocide Opti", "Nordox 75 WG", "Trophy WG", "Other",
    ],
  },
};

export async function seedLookupDefaults(): Promise<void> {
  for (const [key, def] of Object.entries(LOOKUP_DEFINITIONS)) {
    const existing = await db
      .select({ id: lookupItemsTable.id })
      .from(lookupItemsTable)
      .where(and(eq(lookupItemsTable.lookupKey, key), isNull(lookupItemsTable.tenantId)))
      .limit(1);

    if (existing.length > 0) continue;

    const rows = def.items.map((item, idx) => {
      if (typeof item === "string") {
        return {
          lookupKey: key,
          value: item,
          label: item,
          groupLabel: null,
          displayOrder: idx,
          isActive: true,
          isBdeManaged: true,
          tenantId: null,
        };
      }
      return {
        lookupKey: key,
        value: item.label,
        label: item.label,
        groupLabel: item.group ?? null,
        displayOrder: idx,
        isActive: true,
        isBdeManaged: true,
        tenantId: null,
      };
    });

    if (rows.length > 0) {
      await db.insert(lookupItemsTable).values(rows);
    }
  }
}
