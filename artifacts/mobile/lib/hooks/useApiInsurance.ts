import { buildCachedApiHook } from "./buildCachedApiHook";

export interface ApiInsurancePolicy {
  id: number;
  policyType: string;
  insurer: string | null;
  policyNumber: string | null;
}

const useApiInsuranceHook = buildCachedApiHook<ApiInsurancePolicy>(
  (farmId) => `bde_cache_insurance_${farmId}`,
  (farmId, domain) => `${domain}/api/farms/${farmId}/insurance`,
  (json) => {
    return ((json as { records?: ApiInsurancePolicy[] }).records ?? []) as ApiInsurancePolicy[];
  }
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
