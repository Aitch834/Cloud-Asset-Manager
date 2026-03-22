import { buildCachedApiHook } from "./buildCachedApiHook";

export interface ApiLab {
  id: number;
  name: string;
  accountNumber?: string | null;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  isActive?: boolean;
}

const useApiLabsHook = buildCachedApiHook<ApiLab>(
  (farmId) => `bde_cache_labs_${farmId}`,
  (farmId, domain) => `${domain}/api/farms/${farmId}/labs`,
  (json) => {
    const records = ((json as { records?: ApiLab[] }).records ?? []) as ApiLab[];
    return records.filter((l) => l.isActive !== false);
  }
);

export function useApiLabs(farmId: string | undefined) {
  const { items, loading, fromCache, lastError } = useApiLabsHook(farmId);
  return {
    labs: items,
    loading,
    error: items.length === 0 && lastError ? lastError : null,
    fromCache,
  };
}
