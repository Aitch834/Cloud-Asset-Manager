import { buildCachedApiHook } from "./buildCachedApiHook";
import { requireArrayEnvelope } from "./apiResponseGuards";

export interface ApiStraw {
  id: number;
  sireRegisterId?: number | null;
  sireName: string;
  sireBreed?: string | null;
  sireSpecies: string;
  supplierName?: string | null;
  batchNumber: string;
  strawsReceived: number;
  strawsUsed: number;
  storageLocation?: string | null;
  deliveryDate?: string | null;
  isActive: boolean;
}

const useApiStrawsHook = buildCachedApiHook<ApiStraw>(
  (farmId) => `bde_cache_straws_${farmId}`,
  (farmId, domain) => `${domain}/api/farms/${farmId}/straws`,
  (json) => {
    const records = requireArrayEnvelope<ApiStraw>(json, "records", "straws");
    return records.filter((s) => s.isActive !== false);
  }
);

export function useApiStraws(farmId: string | undefined) {
  const { items, loading, fromCache, lastError } = useApiStrawsHook(farmId);
  const inStock = items.filter((s) => s.strawsReceived - (s.strawsUsed ?? 0) > 0);
  return {
    straws: items,
    inStockStraws: inStock,
    loading,
    error: items.length === 0 && lastError ? lastError : null,
    fromCache,
  };
}
