import { Platform } from "react-native";
import { useEffect, useState } from "react";
import { kvGet } from "@/lib/database";

export interface ApiHerd {
  id: number;
  name: string;
  type: string;
  breed?: string | null;
  herdNumber?: string | null;
  notes?: string | null;
  isActive: boolean;
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

export function useApiHerds(farmId: string | undefined) {
  const [herds, setHerds] = useState<ApiHerd[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!farmId) return;

    const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
    if (!apiDomain) {
      setHerds([]);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [token, tenantSlug] = await Promise.all([getAuthToken(), getTenantSlug()]);

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`https://${apiDomain}/api/farms/${farmId}/herds`, { headers });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);

        const data = await res.json();
        if (!cancelled) {
          const active = ((data.records ?? []) as ApiHerd[]).filter((h) => h.isActive !== false);
          setHerds(active);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load herds");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [farmId]);

  return { herds, loading, error };
}
