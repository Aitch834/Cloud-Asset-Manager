import { Platform } from "react-native";
import { useEffect, useState } from "react";
import { kvGet } from "@/lib/database";

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

    (async () => {
      setLoading(true);
      try {
        const [token, tenantSlug] = await Promise.all([getAuthToken(), getTenantSlug()]);

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`https://${apiDomain}/api/farms/${farmId}/modules`, { headers });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);

        const data = await res.json();
        if (!cancelled) {
          setActiveModuleKeys(data.activeModuleKeys ?? []);
          setResolvedFarmId(farmId);
        }
      } catch {
        // Silently fall back — if offline or unauthenticated, all records remain visible
        // so farmers are never blocked from logging something in the field.
        // resolvedFarmId is intentionally left unset on failure so feature-gated
        // background requests (e.g. winery-vessels) are not issued for unverified farms.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [farmId]);

  return { activeModuleKeys, loading, resolvedFarmId };
}
