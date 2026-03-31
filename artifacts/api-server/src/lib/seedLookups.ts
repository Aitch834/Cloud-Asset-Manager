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
