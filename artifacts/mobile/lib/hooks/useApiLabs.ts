import { useMemo } from "react";
import { buildCachedApiHook } from "./buildCachedApiHook";
import { requireArrayEnvelope } from "./apiResponseGuards";
import { isDemoFarmId, getDemoLabs } from "@/lib/demo/demoData";

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
    const records = requireArrayEnvelope<ApiLab>(json, "records", "labs");
    return records.filter((l) => l.isActive !== false);
  }
);

export function useApiLabs(farmId: string | undefined) {
  const isDemo = isDemoFarmId(farmId);
  const demoLabs = useMemo(
    () => (isDemo && farmId ? getDemoLabs(farmId) : []),
    [isDemo, farmId]
  );

  const { items, loading, fromCache, lastError } = useApiLabsHook(isDemo ? undefined : farmId);

  // Show loading state while farm context is initialising
  if (!farmId) {
    return { labs: [], loading: true, error: null, fromCache: false };
  }

  // Demo mode — serve pre-defined demo labs immediately
  if (isDemo) {
    return { labs: demoLabs, loading: false, error: null, fromCache: false };
  }

  return {
    labs: items,
    loading,
    error: items.length === 0 && lastError ? lastError : null,
    fromCache,
  };
}
