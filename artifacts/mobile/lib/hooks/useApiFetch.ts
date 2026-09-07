import { useState, useEffect, useCallback, useRef } from "react";
import { kvGet } from "@/lib/database";
import { getApiBase } from "@/lib/uploadPhoto";
import { getCurrentAuthToken } from "../authToken";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    const token = await getCurrentAuthToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const farmRaw = await kvGet("bde_current_farm");
    if (farmRaw) {
      const farm = JSON.parse(farmRaw) as { tenantSlug?: string; slug?: string };
      headers["x-tenant-slug"] = farm.tenantSlug ?? farm.slug ?? "";
    }
  } catch {}
  return headers;
}

export function useApiFetch<T>(farmId: string | undefined, apiPath: string) {
  const [records, setRecords] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /**
   * The farm ID for which `records` was last successfully populated.
   * Only updated on a successful response — stale records from a prior farm
   * or a failed fetch leave this unchanged, so callers can distinguish
   * "records belong to current farm" from "loading / error / stale".
   */
  const [recordsFarmId, setRecordsFarmId] = useState<string | undefined>(undefined);
  // Monotonically-increasing request counter. Each fetch captures its own ID
  // at call time and only commits state if that ID is still current, preventing
  // out-of-order or stale-farm responses from overwriting newer results.
  const requestIdRef = useRef(0);

  const load = useCallback(async (isRefresh = false) => {
    if (!farmId) { setRecords([]); setRecordsFarmId(undefined); setLoading(false); return; }
    const requestId = ++requestIdRef.current;
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const apiBase = getApiBase();
      if (!apiBase) throw new Error("No API domain configured — check your connection settings.");
      const headers = await getAuthHeaders();
      const url = `${apiBase}${apiPath.replace(":farmId", farmId)}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json() as { records?: T[] };
      if (requestId === requestIdRef.current) {
        setRecords(json.records ?? []);
        setRecordsFarmId(farmId);
      }
    } catch (err) {
      if (requestId === requestIdRef.current) setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      if (requestId === requestIdRef.current) { setLoading(false); setRefreshing(false); }
    }
  }, [farmId, apiPath]);

  useEffect(() => {
    void load();
    // Invalidate any in-flight request for the previous farmId/apiPath
    return () => { requestIdRef.current++; };
  }, [load]);

  const refresh = useCallback(() => { void load(true); }, [load]);

  return { records, loading, refreshing, error, refresh, recordsFarmId };
}
