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
  /** The farmId that the currently returned `items` were loaded for.
   *  `undefined` while a farm-switch is in progress and items are stale.
   *  Callers that validate items against the active farm should gate on
   *  `loadedForFarmId === farmId` to avoid acting on the previous farm's data. */
  loadedForFarmId: string | undefined;
}

export function buildCachedApiHook<T>(
  getCacheKey: (farmId: string) => string,
  getEndpoint: (farmId: string, domain: string) => string,
  transform: (json: unknown) => T[],
  /** Optional transform applied to each item before it is written to AsyncStorage cache.
   *  Use this to strip fields that become stale quickly (e.g. presigned URLs). */
  cacheTransform?: (item: T) => T
) {
  return function useCachedData(farmId: string | undefined): CachedHookResult<T> {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [fromCache, setFromCache] = useState(false);
    const [lastError, setLastError] = useState<string | null>(null);
    // Tracks which farmId the currently returned `items` belong to.
    // Reset to undefined when a new farmId is requested so callers can detect
    // the one-render lag where items are still from the previous farm.
    const [loadedForFarmId, setLoadedForFarmId] = useState<string | undefined>(undefined);

    useEffect(() => {
      if (!farmId) {
        setItems([]);
        setLoading(false);
        setLastError(null);
        setLoadedForFarmId(undefined);
        return;
      }

      // Reset to loading state whenever farmId changes.
      // Clearing loadedForFarmId here signals to callers that items are now stale;
      // it will be set again once cache or API data arrives for the new farmId.
      setLoading(true);
      setLastError(null);
      setLoadedForFarmId(undefined);

      let cancelled = false;

      // If the farmId is not a valid numeric ID (e.g. demo mode "farm-1"),
      // skip the API call — just serve from cache if available, otherwise
      // show the empty state without an error message.
      const isNumericFarm = /^\d+$/.test(farmId);

      (async () => {
        // Step 1: Load from cache immediately — fast, no spinner.
        // Apply cacheTransform on read too so that existing cache entries
        // written by prior app versions (which may still contain stale fields
        // such as expired presigned URLs) are sanitized before they reach state.
        try {
          const cached = await kvGet(getCacheKey(farmId));
          if (cached && !cancelled) {
            const parsed: T[] = JSON.parse(cached);
            const hydrated = cacheTransform ? parsed.map(cacheTransform) : parsed;
            setItems(hydrated);
            setLoadedForFarmId(farmId);
            setLoading(false);
            setFromCache(true);
          }
        } catch {
          // Ignore cache read errors
        }

        if (!isNumericFarm) {
          // Demo mode — no real API to call, just show whatever is cached
          if (!cancelled) setLoading(false);
          return;
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
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          } else if (__DEV__) {
            headers["x-dev-bypass"] = "bde-dev-bypass-local";
          }

          const res = await fetch(`https://${getEndpoint(farmId, apiDomain)}`, { headers });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const json = await res.json();
          const fresh = transform(json);

          if (!cancelled) {
            setItems(fresh);
            setLoadedForFarmId(farmId);
            setFromCache(false);
            setLastError(null);
            setLoading(false);
          }

          // Save fresh data to cache for future offline use.
          // Apply cacheTransform (if provided) to strip fields that become
          // stale quickly (e.g. presigned URLs) before writing to storage.
          const toCache = cacheTransform ? fresh.map(cacheTransform) : fresh;
          await kvSet(getCacheKey(farmId), JSON.stringify(toCache));
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

    return { items, loading, fromCache, lastError, loadedForFarmId };
  };
}
