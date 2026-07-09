import { Platform } from "react-native";
import { useState, useEffect, useCallback, useRef } from "react";
import { kvGet } from "@/lib/database";
import { getApiBase } from "@/lib/uploadPhoto";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    let token: string | null = null;
    if (Platform.OS !== "web") {
      const SecureStore = await import("expo-secure-store");
      token = await SecureStore.getItemAsync("auth_session_token");
    } else {
      try { token = localStorage.getItem("auth_session_token"); } catch {}
    }
    if (!token) {
      const raw = await kvGet("bde_auth_token");
      if (raw) token = JSON.parse(raw) as string;
    }
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
  const cancelRef = useRef(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!farmId) { setRecords([]); setLoading(false); return; }
    cancelRef.current = false;
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
      if (!cancelRef.current) setRecords(json.records ?? []);
    } catch (err) {
      if (!cancelRef.current) setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      if (!cancelRef.current) { setLoading(false); setRefreshing(false); }
    }
  }, [farmId, apiPath]);

  useEffect(() => {
    void load();
    return () => { cancelRef.current = true; };
  }, [load]);

  const refresh = useCallback(() => { void load(true); }, [load]);

  return { records, loading, refreshing, error, refresh };
}
