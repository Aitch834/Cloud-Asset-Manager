import { Platform } from "react-native";
import { useEffect, useState } from "react";
import { kvGet, kvSet } from "@/lib/database";

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

export interface CachedHookResult<T> {
  items: T[];
  loading: boolean;
  fromCache: boolean;
  lastError: string | null;
}

export function buildCachedApiHook<T>(
  getCacheKey: (farmId: string) => string,
  getEndpoint: (farmId: string, domain: string) => string,
  transform: (json: unknown) => T[]
) {
  return function useCachedData(farmId: string | undefined): CachedHookResult<T> {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [fromCache, setFromCache] = useState(false);
    const [lastError, setLastError] = useState<string | null>(null);

    useEffect(() => {
      if (!farmId) {
        setItems([]);
        setLoading(false);
        return;
      }

      let cancelled = false;

      (async () => {
        // Step 1: Load from cache immediately — fast, no spinner
        try {
          const cached = await kvGet(getCacheKey(farmId));
          if (cached && !cancelled) {
            setItems(JSON.parse(cached));
            setLoading(false);
            setFromCache(true);
          }
        } catch {
          // Ignore cache read errors
        }

        // Step 2: Try to refresh from API in background
        const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
        if (!apiDomain) {
          if (!cancelled) setLoading(false);
          return;
        }

        try {
          const [token, tenantSlug] = await Promise.all([getAuthToken(), getTenantSlug()]);
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "x-tenant-slug": tenantSlug,
          };
          if (token) headers["Authorization"] = `Bearer ${token}`;

          const res = await fetch(`https://${getEndpoint(farmId, apiDomain)}`, { headers });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const json = await res.json();
          const fresh = transform(json);

          if (!cancelled) {
            setItems(fresh);
            setFromCache(false);
            setLastError(null);
            setLoading(false);
          }

          // Save fresh data to cache for future offline use
          await kvSet(getCacheKey(farmId), JSON.stringify(fresh));
        } catch (err: unknown) {
          if (!cancelled) {
            const msg = err instanceof Error ? err.message : "Failed to load";
            setLastError(msg);
            setLoading(false);
          }
        }
      })();

      return () => { cancelled = true; };
    }, [farmId]);

    return { items, loading, fromCache, lastError };
  };
}
