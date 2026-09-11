import { useMemo } from "react";
import { buildCachedApiHook } from "./buildCachedApiHook";
import { requireArrayEnvelope } from "./apiResponseGuards";
import { isDemoFarmId, getDemoFields } from "@/lib/demo/demoData";

export interface ApiField {
  id: number;
  name: string;
  areaSqMetres?: number;
  areaHectares?: string | number;
  computedFarmableAreaHa?: string | number;
  soilType?: string;
  currentUse?: string;
  isActive?: boolean;
}

const useApiFieldsHook = buildCachedApiHook<ApiField>(
  (farmId) => `bde_cache_fields_${farmId}`,
  (farmId, domain) => `${domain}/api/farms/${farmId}/fields`,
  (json) => {
    const records = requireArrayEnvelope<ApiField>(json, "records", "fields");
    return records.filter((f) => f.isActive !== false);
  }
);

export function useApiFields(farmId: string | undefined) {
  const isDemo = isDemoFarmId(farmId);
  const demoFields = useMemo(
    () => (isDemo && farmId ? getDemoFields(farmId) : []),
    [isDemo, farmId]
  );

  // Pass undefined to the underlying hook in demo mode (skips API call entirely)
  const { items, loading, fromCache, lastError, loadedForFarmId, refresh } = useApiFieldsHook(isDemo ? undefined : farmId);

  // While farm context is still initialising, show a loading state rather than
  // an empty field picker — avoids a premature "no fields" flash
  if (!farmId) {
    return { fields: [], loading: true, error: null, fromCache: false, loadedForFarmId: undefined, refresh };
  }

  // Demo mode — serve pre-defined demo fields immediately, no API needed
  if (isDemo) {
    return { fields: demoFields, loading: false, error: null, fromCache: false, loadedForFarmId: farmId, refresh };
  }

  return {
    fields: items,
    loading,
    error: items.length === 0 && lastError ? lastError : null,
    fromCache,
    loadedForFarmId,
    refresh,
  };
}
