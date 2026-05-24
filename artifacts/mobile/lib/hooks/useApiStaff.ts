import { buildCachedApiHook } from "./buildCachedApiHook";

export interface ApiStaffMember {
  id: number;
  memberId: number | null;
  email: string | null;
  name: string;
  role: string | null;
}

const useApiStaffHook = buildCachedApiHook<ApiStaffMember>(
  (farmId) => `bde_cache_farm_staff_${farmId}`,
  (farmId, domain) => `${domain}/api/farms/${farmId}/staff`,
  (json) => ((json as any).staff ?? []) as ApiStaffMember[],
);

export function useApiStaff(farmId: string | undefined) {
  const { items, loading, lastError } = useApiStaffHook(farmId);
  return {
    staff: items,
    loading,
    error: items.length === 0 && lastError ? lastError : null,
  };
}
