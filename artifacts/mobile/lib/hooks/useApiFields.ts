import { buildCachedApiHook } from "./buildCachedApiHook";

export interface ApiField {
  id: number;
  name: string;
  areaSqMetres?: number;
  soilType?: string;
  currentUse?: string;
  isActive?: boolean;
}

const useApiFieldsHook = buildCachedApiHook<ApiField>(
  (farmId) => `bde_cache_fields_${farmId}`,
  (farmId, domain) => `${domain}/api/farms/${farmId}/fields`,
  (json) => {
    const records = ((json as { records?: ApiField[] }).records ?? []) as ApiField[];
    return records.filter((f) => f.isActive !== false);
  }
);

export function useApiFields(farmId: string | undefined) {
  const { items, loading, fromCache, lastError } = useApiFieldsHook(farmId);
  return {
    fields: items,
    loading,
    error: items.length === 0 && lastError ? lastError : null,
    fromCache,
  };
}
