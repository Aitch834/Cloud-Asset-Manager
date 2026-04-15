import { Platform } from "react-native";
import { useEffect, useState } from "react";
import { kvGet } from "@/lib/database";

export interface ApiCoshhRecord {
  id: number;
  substanceName: string;
  manufacturer: string | null;
  hazardClassification: string | null;
  usageArea: string | null;
}

async function getAuthToken(): Promise<string | null> {
  try {
    if (Platform.OS !== "web") {
      const SecureStore = await import("expo-secure-store");
      const token = await SecureStore.getItemAsync("auth_session_token");
      if (token) return token;
    } else {
      try {
        const token = localStorage.getItem("auth_session_token");
        if (token) return token;
      } catch { }
    }
    const raw = await kvGet("bde_auth_token");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
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

export function useApiCoshh(farmId: string | undefined) {
  const [records, setRecords] = useState<ApiCoshhRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!farmId) return;

    const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
    if (!apiDomain) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const [token, tenantSlug] = await Promise.all([getAuthToken(), getTenantSlug()]);
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`https://${apiDomain}/api/farms/${farmId}/coshh`, { headers });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setRecords((data.records ?? []) as ApiCoshhRecord[]);
        }
      } catch {
        // silently fail — COSHH list is advisory, not blocking
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [farmId]);

  return { records, loading };
}
