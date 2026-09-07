import { useCallback, useEffect, useState } from "react";
import { kvGet } from "@/lib/database";
import { getCurrentAuthToken } from "../authToken";

export interface FarmDashboardData {
  complianceScore: number;
  totalForms: number;
  completedForms: number;
  overdueActions: number;
  activeModuleKeys: string[];
}

async function getTenantSlug(): Promise<string> {
  try {
    const raw = await kvGet("bde_current_farm");
    if (raw) {
      const farm = JSON.parse(raw);
      return farm.tenantSlug || farm.slug || "";
    }
  } catch { }
  return "";
}

export function useApiFarmDashboard(farmId: string | undefined) {
  const [data, setData] = useState<FarmDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedFarmId, setResolvedFarmId] = useState<string | undefined>(undefined);

  const load = useCallback(async (isCurrent: () => boolean = () => true) => {
    if (isCurrent()) {
      // A previous response must not remain authoritative during a slow reload,
      // after a failure, or across a farm switch.
      setData(null);
      setResolvedFarmId(undefined);
    }
    if (!farmId) {
      if (isCurrent()) {
        setError(null);
        setLoading(false);
      }
      return;
    }
    const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
    if (!apiDomain) {
      if (isCurrent()) setLoading(false);
      return;
    }

    if (isCurrent()) {
      setLoading(true);
      setError(null);
    }
    try {
      const [token, tenantSlug] = await Promise.all([getCurrentAuthToken(), getTenantSlug()]);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-tenant-slug": tenantSlug,
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`https://${apiDomain}/api/farms/${farmId}/dashboard`, { headers });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      const json = await res.json();
      if (isCurrent()) {
        const subs: Array<{ moduleKey: string }> = json.activeSubscriptions ?? [];
        setData({
          complianceScore: json.complianceScore ?? 0,
          totalForms: json.totalForms ?? 0,
          completedForms: json.completedForms ?? 0,
          overdueActions: json.overdueActions ?? 0,
          activeModuleKeys: [...new Set(subs.map((s) => s.moduleKey))],
        });
        setResolvedFarmId(farmId);
      }
    } catch (err) {
      if (isCurrent()) {
        setData(null);
        setResolvedFarmId(undefined);
        setError(err instanceof Error ? err.message : "Failed to load");
      }
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    let cancelled = false;
    void load(() => !cancelled);
    return () => { cancelled = true; };
  }, [load]);

  return { data, loading, error, resolvedFarmId, reload: load };
}
