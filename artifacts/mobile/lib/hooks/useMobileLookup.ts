import { useEffect, useState } from "react";
import { Platform } from "react-native";
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

export function useMobileLookup(lookupKey: string, fallback: string[]): string[] {
  const [values, setValues] = useState<string[]>(fallback);

  useEffect(() => {
    let cancelled = false;
    const cacheKey = `lookup_${lookupKey}`;

    (async () => {
      try {
        const cached = await kvGet(cacheKey);
        if (cached && !cancelled) {
          const parsed: string[] = JSON.parse(cached);
          if (parsed.length > 0) setValues(parsed);
        }
      } catch { }

      const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
      if (!apiDomain) return;

      try {
        const [token, tenantSlug] = await Promise.all([getAuthToken(), getTenantSlug()]);
        if (!tenantSlug) return;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`https://${apiDomain}/api/lookups/${lookupKey}`, { headers });
        if (!res.ok) return;

        const json = await res.json() as { items?: Array<{ value: string; isActive?: boolean }> };
        const fresh = (json.items ?? [])
          .filter((i) => i.isActive !== false)
          .map((i) => i.value);

        if (fresh.length > 0 && !cancelled) {
          setValues(fresh);
          await kvSet(cacheKey, JSON.stringify(fresh));
        }
      } catch { }
    })();

    return () => { cancelled = true; };
  }, [lookupKey]);

  return values;
}
