import { buildCachedApiHook } from "./buildCachedApiHook";
import { requireArrayEnvelope } from "./apiResponseGuards";

export interface ApiFarmMember {
  id: number;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  farmRole: string | null;
  isActive: boolean;
  departmentId: number | null;
  departmentName: string | null;
  departmentColour: string | null;
  secondaryDepartments: { id: number; name: string; colour: string }[];
}

export function memberFullName(m: ApiFarmMember): string {
  return `${m.firstName} ${m.lastName}`.trim();
}

const useApiFarmMembersHook = buildCachedApiHook<ApiFarmMember>(
  (farmId) => `bde_cache_farm_members_${farmId}`,
  (farmId, domain) => `${domain}/api/farms/${farmId}/members`,
  (json) => {
    const members = requireArrayEnvelope<ApiFarmMember>(json, "members", "farm members");
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
