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

// Raw farm name for uses where a missing name must remain distinguishable from a
// display fallback, such as compliance and regulatory report headers.
export function useRawFarmName(farmId: number): string | undefined {
  const { data } = useFarmsList();
  const name = Array.isArray(data?.farms)
    ? (data.farms.find((f: Record<string, unknown>) => f.id === farmId) as Record<string, unknown> | undefined)?.name as string | undefined
    : undefined;
  return typeof name === "string" ? name : undefined;
}

// Display name for a farm, with a stable fallback while loading / if missing.
export function useFarmName(farmId: number): string {
  return useRawFarmName(farmId) ?? `Farm ${farmId}`;
}

export interface FarmReportMeta {
  farmName?: string;
  farmAddress?: string;
  contactPhone?: string;
  cphNumber?: string;
  sbiNumber?: string;
}

export function useFarmReportMeta(farmId: number): FarmReportMeta {
  const { data } = useFarmsList();
  const farm = Array.isArray(data?.farms)
    ? data.farms.find((candidate: Record<string, unknown>) => candidate.id === farmId)
    : undefined;
  const text = (key: string) => {
    const value = farm?.[key];
    return typeof value === "string" && value.trim() ? value : undefined;
  };
  return {
    farmName: text("name"),
    farmAddress: text("address") ?? ([text("addressLine1"), text("addressLine2"), text("postcode")].filter(Boolean).join(", ") || undefined),
    contactPhone: text("contactPhone"),
    cphNumber: text("cphNumber"),
    sbiNumber: text("sbiNumber"),
  };
}
