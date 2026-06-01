import { buildCachedApiHook } from "./buildCachedApiHook";
import type { ApiHerd } from "./useApiHerds";

export type { ApiHerd as ApiGoatFlock };

const useApiGoatFlocksHook = buildCachedApiHook<ApiHerd>(
  (farmId) => `bde_cache_goat_flocks_${farmId}`,
  (farmId, domain) => `${domain}/api/farms/${farmId}/herds`,
  (json) => {
    const records = ((json as { records?: ApiHerd[] }).records ?? []) as ApiHerd[];
    return records.filter(
      (h) => h.isActive !== false && h.type.toLowerCase().includes("goat")
    );
  }
);

export function useApiGoatFlocks(farmId: string | undefined) {
  const { items, loading, fromCache, lastError } = useApiGoatFlocksHook(farmId);
  return {
    flocks: items,
    loading,
    error: items.length === 0 && lastError ? lastError : null,
    fromCache,
  };
}
