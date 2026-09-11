import { buildCachedApiHook } from "./buildCachedApiHook";
import { requireArrayResponse } from "./apiResponseGuards";

export interface ApiFlock {
  id: number;
  flockNumber: string;
  species: string;
  breed: string | null;
  productionSystem: string;
  placementDate: string;
  placementCount: number;
  status: string;
  houseName?: string | null;
}

const useApiPoultryFlocksHook = buildCachedApiHook<ApiFlock>(
  (farmId) => `bde_cache_poultry_flocks_${farmId}`,
  (farmId, domain) => `${domain}/api/farms/${farmId}/poultry-flocks`,
  (json) => {
    const records = requireArrayResponse<ApiFlock>(json, "poultry flocks");
    return records.filter((f) => f.status !== "depleted");
  }
);

export function useApiPoultryFlocks(farmId: string | undefined) {
  const { items, loading, fromCache, lastError } = useApiPoultryFlocksHook(farmId);
  return {
    flocks: items,
    loading,
    error: items.length === 0 && lastError ? lastError : null,
    fromCache,
  };
}
