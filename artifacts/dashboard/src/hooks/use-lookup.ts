import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";

export interface LookupItem {
  id: number;
  value: string;
  label: string;
  groupLabel: string | null;
  isBdeManaged: boolean;
  isCustom: boolean;
}

export function useLookup(key: string) {
  const tenantSlug = useAppStore((s) => s.tenantSlug);
  return useQuery<LookupItem[]>({
    queryKey: ["lookup", key, tenantSlug],
    queryFn: async () => {
      const res = await fetch(`/api/lookups/${key}`);
      if (!res.ok) throw new Error("Failed to fetch lookup");
      const data = await res.json();
      return data.items as LookupItem[];
    },
    enabled: !!tenantSlug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLookupStrings(key: string, fallback: string[] = []): string[] {
  const { data } = useLookup(key);
  if (!data) return fallback;
  return data.filter((i) => !("isCustom" in i) || i.isCustom !== undefined ? true : true)
    .map((i) => i.value);
}

export function useAddCustomLookup(key: string) {
  const farmId = useAppStore((s) => s.farmId);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (label: string) => {
      const res = await fetch(`/api/farms/${farmId}/lookups/${key}`, {
        method: "POST",
        body: JSON.stringify({ label }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error((e as { error?: string }).error ?? "Failed to add custom value");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lookup", key] });
    },
  });
}
