import { buildCachedApiHook } from "./buildCachedApiHook";

export interface ApiHerd {
  id: number;
  name: string;
  type: string;
  breed?: string | null;
  herdNumber?: string | null;
  notes?: string | null;
  isActive: boolean;
}

const useApiHerdsHook = buildCachedApiHook<ApiHerd>(
  (farmId) => `bde_cache_herds_${farmId}`,
  (farmId, domain) => `${domain}/api/farms/${farmId}/herds`,
  (json) => {
    const records = ((json as { records?: ApiHerd[] }).records ?? []) as ApiHerd[];
    return records.filter((h) => h.isActive !== false);
  }
);

export function useApiHerds(farmId: string | undefined) {
  const { items, loading, fromCache, lastError } = useApiHerdsHook(farmId);
  return {
    herds: items,
    loading,
    error: items.length === 0 && lastError ? lastError : null,
    fromCache,
  };
}
