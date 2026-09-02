import { Platform } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
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
  /** Re-fetch the current farm and update the persistent cache. */
  refresh: () => void;
  /** Update the current farm's items locally and persist the updated cache. */
  updateItems: (updater: (items: T[]) => T[]) => void;
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
    // Incrementing this value lets callers explicitly re-fetch the current
    // farm without having to change the hook's farmId.
    const [refreshVersion, setRefreshVersion] = useState(0);
    const itemsRef = useRef<T[]>([]);
    itemsRef.current = items;
    const requestGenerationRef = useRef(0);

    useEffect(() => {
      const requestGeneration = ++requestGenerationRef.current;
      if (!farmId) {
        setItems([]);
        itemsRef.current = [];
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
      const farmChanged = loadedForFarmId !== farmId;
      if (farmChanged) {
        setItems([]);
        itemsRef.current = [];
        setFromCache(false);
        setLoadedForFarmId(undefined);
      }

      const controller = new AbortController();

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
          if (
            cached &&
            !controller.signal.aborted &&
            requestGenerationRef.current === requestGeneration
          ) {
            const parsed: T[] = JSON.parse(cached);
            const hydrated = cacheTransform ? parsed.map(cacheTransform) : parsed;
            itemsRef.current = hydrated;
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
          if (!controller.signal.aborted) setLoading(false);
          return;
        }

        // Step 2: Try to refresh from API in background
        const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
        if (!apiDomain) {
          if (!controller.signal.aborted) setLoading(false);
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

          const res = await fetch(`https://${getEndpoint(farmId, apiDomain)}`, {
            headers,
            signal: controller.signal,
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const json = await res.json();
          const fresh = transform(json);

          if (
            !controller.signal.aborted &&
            requestGenerationRef.current === requestGeneration
          ) {
            itemsRef.current = fresh;
            setItems(fresh);
            setLoadedForFarmId(farmId);
            setFromCache(false);
            setLastError(null);
            setLoading(false);
          }

          // Save fresh data to cache for future offline use.
          // Apply cacheTransform (if provided) to strip fields that become
          // stale quickly (e.g. presigned URLs) before writing to storage.
          if (
            !controller.signal.aborted &&
            requestGenerationRef.current === requestGeneration
          ) {
            const toCache = cacheTransform ? fresh.map(cacheTransform) : fresh;
            await kvSet(getCacheKey(farmId), JSON.stringify(toCache));
          }
        } catch (err: unknown) {
          // AbortError means the component unmounted before the request
          // finished — this is intentional and must not be surfaced as an error.
          if (err instanceof Error && err.name === "AbortError") return;
          if (!controller.signal.aborted) {
            const msg = err instanceof Error ? err.message : "Failed to load";
            setLastError(msg);
            setLoading(false);
          }
        }
      })();

      return () => { controller.abort(); };
    }, [farmId, refreshVersion]);

    const refresh = useCallback(() => {
      setRefreshVersion((version) => version + 1);
    }, []);

    const updateItems = useCallback((updater: (items: T[]) => T[]) => {
      if (!farmId) return;
      // A local save is authoritative over any load that started before it.
      // Invalidate those loads before updating state or persistent storage.
      requestGenerationRef.current += 1;
      const updated = updater(itemsRef.current);
      itemsRef.current = updated;
      setItems(updated);
      const toCache = cacheTransform ? updated.map(cacheTransform) : updated;
      void kvSet(getCacheKey(farmId), JSON.stringify(toCache)).catch(() => {
        // State is still updated for this session if persistent storage is
        // temporarily unavailable; the next API load can repopulate the cache.
      });
    }, [farmId]);

    const visibleItems = loadedForFarmId === farmId ? items : [];
    return {
      items: visibleItems,
      loading,
      fromCache,
      lastError,
      loadedForFarmId,
      refresh,
      updateItems,
    };
  };
}
