import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "./use-app-store";

export type FarmRole = "operator" | "senior" | "manager" | "owner";
export type AccessType = "none" | "mobile_only" | "web_only" | "full";

const ROLE_RANK: Record<FarmRole, number> = {
  operator: 0,
  senior: 1,
  manager: 2,
  owner: 3,
};

export interface UserAccess {
  farmRole: FarmRole;
  accessType: AccessType;
  displayName: string | null;
}

const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";
const DEV_TOKEN = import.meta.env.VITE_DEV_BYPASS_TOKEN;

function authHeaders(): HeadersInit {
  if (DEV_BYPASS && DEV_TOKEN) return { "x-dev-bypass-token": DEV_TOKEN };
  return {};
}

export function useUserRole(): { role: FarmRole; accessType: AccessType; displayName: string | null; isAtLeast: (min: FarmRole) => boolean } {
  const { farmId } = useAppStore();

  const { data } = useQuery<UserAccess>({
    queryKey: ["my-access", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/my-access`, { headers: authHeaders() });
      if (!res.ok) return { farmRole: "owner", accessType: "full" } as UserAccess;
      return res.json();
    },
    enabled: !!farmId,
    staleTime: 5 * 60 * 1000,
  });

  const role = data?.farmRole ?? "owner";
  const accessType = data?.accessType ?? "full";
  const displayName = data?.displayName ?? null;

  return {
    role,
    accessType,
    displayName,
    isAtLeast: (min: FarmRole) => ROLE_RANK[role] >= ROLE_RANK[min],
  };
}
