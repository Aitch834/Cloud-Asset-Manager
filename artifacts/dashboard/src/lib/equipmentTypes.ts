export type EquipmentCategory = "vehicle" | "implement" | "other";

export interface EquipmentTypeDef {
  value: string;
  label: string;
  category: EquipmentCategory;
}

export const EQUIPMENT_TYPES: EquipmentTypeDef[] = [
  { value: "tractor",              label: "Tractor",                        category: "vehicle" },
  { value: "combine",              label: "Combine Harvester",              category: "vehicle" },
  { value: "sprayer",              label: "Self-Propelled Sprayer",         category: "vehicle" },
  { value: "telehandler",          label: "Telehandler / Handler",          category: "vehicle" },
  { value: "forklift",             label: "Forklift",                       category: "vehicle" },
  { value: "atv",                  label: "ATV / Quad Bike",               category: "vehicle" },
  { value: "vehicle",              label: "Farm Vehicle (Road)",            category: "vehicle" },
  { value: "other_vehicle",        label: "Other Self-Propelled Machine",   category: "vehicle" },

  { value: "drill",                label: "Seed Drill",                     category: "implement" },
  { value: "trailed_sprayer",      label: "Trailed Sprayer",                category: "implement" },
  { value: "cultivator",           label: "Cultivator / Subsoiler",         category: "implement" },
  { value: "plough",               label: "Plough",                         category: "implement" },
  { value: "power_harrow",         label: "Power Harrow",                   category: "implement" },
  { value: "baler",                label: "Baler / Wrapper",                category: "implement" },
  { value: "trailer",              label: "Trailer / Grain Chaser",         category: "implement" },
  { value: "loader",               label: "Front Loader / Bucket",          category: "implement" },
  { value: "roller",               label: "Roller / Press",                 category: "implement" },
  { value: "header",               label: "Combine Header / Attachment",    category: "implement" },
  { value: "fertiliser_spreader",  label: "Fertiliser Spreader",            category: "implement" },
  { value: "muck_spreader",        label: "Muck / Slurry Spreader",         category: "implement" },
  { value: "other_implement",      label: "Other Implement / Attachment",   category: "implement" },

  { value: "generator",            label: "Generator / Engine",             category: "other" },
  { value: "pump",                 label: "Pump / Irrigation",              category: "other" },
  { value: "other",                label: "Other",                          category: "other" },
];

export const VEHICLE_TYPES   = new Set(EQUIPMENT_TYPES.filter(t => t.category === "vehicle").map(t => t.value));
export const IMPLEMENT_TYPES = new Set(EQUIPMENT_TYPES.filter(t => t.category === "implement").map(t => t.value));

export function equipmentTypeLabel(value: string): string {
  return EQUIPMENT_TYPES.find(t => t.value === value)?.label ?? value;
}

export function equipmentCategory(value: string): EquipmentCategory {
  return EQUIPMENT_TYPES.find(t => t.value === value)?.category ?? "other";
}
