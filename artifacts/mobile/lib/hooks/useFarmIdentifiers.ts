import { Platform } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { kvGet } from "@/lib/database";
import { getApiBase } from "@/lib/uploadPhoto";

interface FarmIdentifiers {
  cphNumber: string | null;
  sbiNumber: string | null;
  address: string | null;
  postcode: string | null;
  loading: boolean;
  refetch: () => void;
}

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

export function useFarmIdentifiers(farmId: string | undefined): FarmIdentifiers {
  const [cphNumber, setCphNumber] = useState<string | null>(null);
  const [sbiNumber, setSbiNumber] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [postcode, setPostcode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchKey, setFetchKey] = useState(0);

  const refetch = useCallback(() => setFetchKey(k => k + 1), []);

  useEffect(() => {
    if (!farmId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const apiBase = getApiBase();
        if (!apiBase) { setLoading(false); return; }
        const headers = await getAuthHeaders();
        const res = await fetch(`${apiBase}/api/farms/${farmId}`, { headers });
        if (!res.ok || cancelled) { setLoading(false); return; }
        const data = await res.json() as { record?: { cphNumber?: string | null; sbiNumber?: string | null; address?: string | null; postcode?: string | null } };
        if (!cancelled) {
          setCphNumber(data.record?.cphNumber ?? null);
          setSbiNumber(data.record?.sbiNumber ?? null);
          setAddress(data.record?.address ?? null);
          setPostcode(data.record?.postcode ?? null);
        }
      } catch {
        // silently ignore — no identifier data available offline
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [farmId, fetchKey]);

  return { cphNumber, sbiNumber, address, postcode, loading, refetch };
}
