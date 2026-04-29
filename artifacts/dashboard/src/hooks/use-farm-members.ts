import { useQuery } from "@tanstack/react-query";

export interface FarmMember {
  id: number;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  isActive: boolean;
  linkedUserId?: string | null;
  departmentId: number | null;
  departmentName: string | null;
  departmentColour: string | null;
}

export function memberFullName(m: FarmMember) {
  return `${m.firstName} ${m.lastName}`.trim();
}

export function useFarmMembers(farmId: number | null) {
  return useQuery<{ members: FarmMember[] }>({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`).then((r) => r.json()),
    enabled: !!farmId,
  });
}
