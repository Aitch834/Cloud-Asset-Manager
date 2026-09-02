import { Platform } from "react-native";
import { useEffect, useState } from "react";
import { kvGet, kvSet } from "@/lib/database";

type ModuleUpdateListener = (farmId: string, activeModuleKeys: string[]) => void;

const moduleUpdateListeners = new Set<ModuleUpdateListener>();

export function subscribeToApiModuleUpdates(listener: ModuleUpdateListener): () => void {
  moduleUpdateListeners.add(listener);
  return () => moduleUpdateListeners.delete(listener);
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

export async function refreshApiModules(
  farmId: string,
  tenantSlug?: string,
): Promise<void> {
  const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
  if (!apiDomain) return;

  const [token, resolvedTenantSlug] = await Promise.all([
    getAuthToken(),
    tenantSlug === undefined ? getTenantSlug() : Promise.resolve(tenantSlug),
  ]);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-tenant-slug": resolvedTenantSlug,
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`https://${apiDomain}/api/farms/${farmId}/modules`, { headers });
  if (!res.ok) throw new Error(`Server returned ${res.status}`);

  const data = await res.json() as { activeModuleKeys?: unknown };
  const activeModuleKeys = Array.isArray(data.activeModuleKeys)
    ? data.activeModuleKeys.filter((key): key is string => typeof key === "string")
    : [];
  const serializedModuleKeys = JSON.stringify(activeModuleKeys);

  // Persist for the sync engine (non-React context) to read.
  // Key is farm-scoped so multi-farm users get accurate per-farm results.
  try {
    // Keep a second last-known value so a cold-start cache miss cannot strand
    // records that were saved offline. The active key remains the source of
    // truth for the current session; the sync engine only consults this
    // fallback when that key is missing.
    await kvSet(
      `bde_last_known_active_module_keys_${farmId}`,
      serializedModuleKeys,
    );
  } catch {
    // The current-session cache may still be persisted below.
  }
  try {
    await kvSet(`bde_active_module_keys_${farmId}`, serializedModuleKeys);
  } catch {
    // The live tab list must still update if local persistence is unavailable.
  }

  for (const listener of moduleUpdateListeners) {
    listener(farmId, activeModuleKeys);
  }
}

export function useApiModules(farmId: string | undefined) {
  const [activeModuleKeys, setActiveModuleKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  // Tracks the farm ID for which activeModuleKeys was last resolved, so callers
  // can detect the transition window between a farm switch and its module fetch completing.
  const [resolvedFarmId, setResolvedFarmId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!farmId) return;

    const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
    if (!apiDomain) return;

    let cancelled = false;

    // Clear stale module state immediately so feature-gated requests from a
    // previous farm never fire under a new farm ID.
    setActiveModuleKeys([]);
    setResolvedFarmId(undefined);

    const unsubscribe = subscribeToApiModuleUpdates((updatedFarmId, keys) => {
      if (updatedFarmId !== farmId || cancelled) return;
      setActiveModuleKeys(keys);
      setResolvedFarmId(farmId);
    });

    (async () => {
      setLoading(true);
      try {
        await refreshApiModules(farmId);
      } catch {
        // Silently fall back — if offline or unauthenticated, all records remain visible
        // so farmers are never blocked from logging something in the field.
        // resolvedFarmId is intentionally left unset on failure so feature-gated
        // background requests (e.g. winery-vessels) are not issued for unverified farms.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [farmId]);

  return { activeModuleKeys, loading, resolvedFarmId };
}
