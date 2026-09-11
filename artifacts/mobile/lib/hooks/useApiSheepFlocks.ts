import { buildCachedApiHook } from "./buildCachedApiHook";
import { requireArrayEnvelope } from "./apiResponseGuards";
import type { ApiHerd } from "./useApiHerds";

export type { ApiHerd as ApiSheepFlock };

const useApiSheepFlocksHook = buildCachedApiHook<ApiHerd>(
  (farmId) => `bde_cache_sheep_flocks_${farmId}`,
  (farmId, domain) => `${domain}/api/farms/${farmId}/herds`,
  (json) => {
    const records = requireArrayEnvelope<ApiHerd>(json, "records", "sheep flocks");
    return records.filter(
      (h) => h.isActive !== false && h.type.toLowerCase().includes("sheep")
    );
  }
);

export function useApiSheepFlocks(farmId: string | undefined) {
  const { items, loading, fromCache, lastError } = useApiSheepFlocksHook(farmId);
  return {
    flocks: items,
    loading,
    error: items.length === 0 && lastError ? lastError : null,
    fromCache,
  };
}
