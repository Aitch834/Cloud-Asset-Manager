import { buildCachedApiHook } from "./buildCachedApiHook";

export interface ApiFarmMember {
  id: number;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  farmRole: string | null;
  isActive: boolean;
}

export function memberFullName(m: ApiFarmMember): string {
  return `${m.firstName} ${m.lastName}`.trim();
}

const useApiFarmMembersHook = buildCachedApiHook<ApiFarmMember>(
  (farmId) => `bde_cache_farm_members_${farmId}`,
  (farmId, domain) => `${domain}/api/farms/${farmId}/members`,
  (json) => {
    const members = ((json as { members?: ApiFarmMember[] }).members ?? []) as ApiFarmMember[];
    return members.filter((m) => m.isActive !== false);
  }
);

export function useApiFarmMembers(farmId: string | undefined) {
  const { items, loading, fromCache, lastError } = useApiFarmMembersHook(farmId);
  return {
    members: items,
    loading,
    error: items.length === 0 && lastError ? lastError : null,
    fromCache,
  };
}
