import { buildCachedApiHook } from "./buildCachedApiHook";

export interface ApiSire {
  id: number;
  name: string;
  species: string;
  breed?: string | null;
  tagNumber?: string | null;
  passportNumber?: string | null;
  ownershipType: string;
  supplierName?: string | null;
  bvdStatus?: string | null;
  scrapieGenotype?: string | null;
  isActive: boolean;
}

const useApiSiresHook = buildCachedApiHook<ApiSire>(
  (farmId) => `bde_cache_sires_${farmId}`,
  (farmId, domain) => `${domain}/api/farms/${farmId}/sires`,
  (json) => {
    const records = ((json as { records?: ApiSire[] }).records ?? []) as ApiSire[];
    return records.filter((s) => s.isActive !== false);
  }
);

export function useApiSires(farmId: string | undefined) {
  const { items, loading, fromCache, lastError } = useApiSiresHook(farmId);
  return {
    sires: items,
    loading,
    error: items.length === 0 && lastError ? lastError : null,
    fromCache,
  };
}
