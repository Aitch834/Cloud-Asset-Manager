import { buildCachedApiHook } from "./buildCachedApiHook";
import { requireArrayEnvelope } from "./apiResponseGuards";

export interface ApiInsurancePolicy {
  id: number;
  policyType: string;
  insurer: string | null;
  policyNumber: string | null;
}

const useApiInsuranceHook = buildCachedApiHook<ApiInsurancePolicy>(
  (farmId) => `bde_cache_insurance_${farmId}`,
  (farmId, domain) => `${domain}/api/farms/${farmId}/insurance`,
  (json) => requireArrayEnvelope<ApiInsurancePolicy>(json, "records", "insurance"),
);

export function useApiInsurance(farmId: string | undefined) {
  const { items, loading, fromCache, lastError } = useApiInsuranceHook(farmId);
  return {
    policies: items,
    loading,
    error: items.length === 0 && lastError ? lastError : null,
    fromCache,
  };
}
