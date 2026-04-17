import { buildCachedApiHook } from "./buildCachedApiHook";

export interface ApiPigFlock {
  id: number;
  flockName: string;
  productionType: string;
  breed: string | null;
  cphNumber: string | null;
  herdNumber: string | null;
  currentCount: number;
  location: string | null;
}

const useApiPigFlocksHook = buildCachedApiHook<ApiPigFlock>(
  (farmId) => `bde_cache_pig_flocks_${farmId}`,
  (farmId, domain) => `${domain}/api/farms/${farmId}/pig-flocks`,
  (json) => (Array.isArray(json) ? json : []) as ApiPigFlock[]
);

export function useApiPigFlocks(farmId: string | undefined) {
  const { items, loading, fromCache, lastError } = useApiPigFlocksHook(farmId);
  return {
    flocks: items,
    loading,
    error: items.length === 0 && lastError ? lastError : null,
    fromCache,
  };
}
