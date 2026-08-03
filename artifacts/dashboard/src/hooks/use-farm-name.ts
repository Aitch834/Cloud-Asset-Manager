import { useQuery } from "@tanstack/react-query";

// Single shared farm-name lookup. All winery/viticulture/produce pages must use
// this hook instead of duplicating the query — duplication is what previously
// let call sites drift onto a nonexistent endpoint (a stray 404 on every page
// load). Shares the "farms-list" query key so the list is fetched once.
export function useFarmsList() {
  return useQuery<{ farms?: Record<string, unknown>[] }>({
    queryKey: ["farms-list"],
    queryFn: () => fetch("/api/tenants/current/farms", { credentials: "include" }).then(r => r.json()),
    staleTime: 300_000,
  });
}

// Display name for a farm, with a stable fallback while loading / if missing.
export function useFarmName(farmId: number): string {
  const { data } = useFarmsList();
  return ((Array.isArray(data?.farms)
    ? (data.farms.find((f: Record<string, unknown>) => f.id === farmId) as Record<string, unknown> | undefined)?.name as string | undefined
    : undefined) ?? `Farm ${farmId}`);
}
