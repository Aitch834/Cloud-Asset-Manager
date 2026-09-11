import NetInfo from "@react-native-community/netinfo";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
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
  const requestGenerationRef = useRef(0);

  const load = useCallback(async (isCurrent: () => boolean = () => true) => {
    const requestGeneration = ++requestGenerationRef.current;
    const isLatestRequest = () =>
      isCurrent() && requestGeneration === requestGenerationRef.current;

    if (isLatestRequest()) {
      // A previous response must not remain authoritative during a slow reload,
      // after a failure, or across a farm switch.
      setData(null);
      setResolvedFarmId(undefined);
    }
    if (!farmId) {
      if (isLatestRequest()) {
        setError(null);
        setLoading(false);
      }
      return;
    }
    const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
    if (!apiDomain) {
      if (isLatestRequest()) setLoading(false);
      return;
    }

    if (isLatestRequest()) {
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
      if (isLatestRequest()) {
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
      if (isLatestRequest()) {
        setData(null);
        setResolvedFarmId(undefined);
        setError(err instanceof Error ? err.message : "Failed to load");
      }
    } finally {
      if (isLatestRequest()) setLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    let cancelled = false;
    void load(() => !cancelled);
    return () => { cancelled = true; };
  }, [load]);

  useEffect(() => {
    if (!farmId) return;

    let previousAppState: AppStateStatus = AppState.currentState;
    let previousConnected: boolean | undefined;

    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      const returnedToForeground =
        nextState === "active" && previousAppState !== "active";
      previousAppState = nextState;
      if (returnedToForeground) {
        void load();
      }
    });

    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      const connected =
        state.isConnected === true && state.isInternetReachable !== false;
      const reconnected = previousConnected === false && connected;
      previousConnected = connected;
      if (reconnected) {
        void load();
      }
    });

    return () => {
      appStateSubscription.remove();
      unsubscribeNetInfo();
    };
  }, [farmId, load]);

  return { data, loading, error, resolvedFarmId, reload: load };
}
