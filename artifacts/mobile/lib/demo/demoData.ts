import type { ApiField } from "@/lib/hooks/useApiFields";
import type { ApiLab } from "@/lib/hooks/useApiLabs";

export const DEMO_FIELDS: Record<string, ApiField[]> = {
  "farm-1": [
    { id: 1001, name: "Home Field", areaSqMetres: 184000, soilType: "Clay loam", currentUse: "Arable", isActive: true },
    { id: 1002, name: "North Block", areaSqMetres: 221000, soilType: "Sandy loam", currentUse: "Arable", isActive: true },
    { id: 1003, name: "South Meadow", areaSqMetres: 96000, soilType: "Clay", currentUse: "Pasture", isActive: true },
    { id: 1004, name: "Mill Field", areaSqMetres: 148000, soilType: "Sandy loam", currentUse: "Arable", isActive: true },
    { id: 1005, name: "Long Acre", areaSqMetres: 312000, soilType: "Clay loam", currentUse: "Arable", isActive: true },
    { id: 1006, name: "Barn Close", areaSqMetres: 72000, soilType: "Clay", currentUse: "Pasture", isActive: true },
    { id: 1007, name: "Top Road Field", areaSqMetres: 176000, soilType: "Sandy loam", currentUse: "Arable", isActive: true },
    { id: 1008, name: "Old Orchard", areaSqMetres: 51000, soilType: "Clay loam", currentUse: "Set-aside", isActive: true },
  ],
  "farm-2": [
    { id: 2001, name: "Front Pasture", areaSqMetres: 112000, soilType: "Clay loam", currentUse: "Pasture", isActive: true },
    { id: 2002, name: "Hill Top Block", areaSqMetres: 204000, soilType: "Sandy loam", currentUse: "Arable", isActive: true },
    { id: 2003, name: "Lower Meadow", areaSqMetres: 89000, soilType: "Clay", currentUse: "Pasture", isActive: true },
    { id: 2004, name: "West Field", areaSqMetres: 167000, soilType: "Silt loam", currentUse: "Arable", isActive: true },
    { id: 2005, name: "Dairy Field", areaSqMetres: 78000, soilType: "Clay loam", currentUse: "Pasture", isActive: true },
    { id: 2006, name: "Copse Corner", areaSqMetres: 134000, soilType: "Sandy loam", currentUse: "Arable", isActive: true },
  ],
};

export const DEMO_LABS: Record<string, ApiLab[]> = {
  "farm-1": [
    { id: 101, name: "Agrii Soil Analytics", contactName: "David Farmer", email: "soil@agrii.co.uk", phone: "01423 530 000", isActive: true },
    { id: 102, name: "NRM Laboratories", contactName: "Sarah Hughes", email: "info@nrm.uk.com", phone: "01635 578 500", isActive: true },
  ],
  "farm-2": [
    { id: 201, name: "Agrii Soil Analytics", contactName: "David Farmer", email: "soil@agrii.co.uk", phone: "01423 530 000", isActive: true },
  ],
};

export function isDemoFarmId(farmId: string | undefined): boolean {
  return !!farmId && !/^\d+$/.test(farmId);
}

export function getDemoFields(farmId: string): ApiField[] {
  return DEMO_FIELDS[farmId] ?? DEMO_FIELDS["farm-1"] ?? [];
}

export function getDemoLabs(farmId: string): ApiLab[] {
  return DEMO_LABS[farmId] ?? DEMO_LABS["farm-1"] ?? [];
}
