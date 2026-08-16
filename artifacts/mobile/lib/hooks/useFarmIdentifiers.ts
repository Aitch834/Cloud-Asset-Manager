import { Platform } from "react-native";
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { kvGet } from "@/lib/database";
import { getApiBase } from "@/lib/uploadPhoto";

const JUST_SAVED_TTL_MS = 10_000; // 10 s — long enough to survive navigation back

export function identifierJustSavedKey(farmId: string | undefined): string {
  return `identifier-just-saved-${farmId ?? "unknown"}`;
}

interface FarmIdentifiers {
  farmName: string | null;
  contactPhone: string | null;
  cphNumber: string | null;
  sbiNumber: string | null;
  address: string | null;
  postcode: string | null;
  loading: boolean;
  justSaved: boolean;
  refetch: () => void;
  clearJustSaved: () => void;
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
  const [farmName, setFarmName] = useState<string | null>(null);
  const [contactPhone, setContactPhone] = useState<string | null>(null);
  const [cphNumber, setCphNumber] = useState<string | null>(null);
  const [sbiNumber, setSbiNumber] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [postcode, setPostcode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchKey, setFetchKey] = useState(0);
  const [justSaved, setJustSaved] = useState(false);

  const refetch = useCallback(() => setFetchKey(k => k + 1), []);
  const clearJustSaved = useCallback(() => setJustSaved(false), []);

  // Clear justSaved flag after TTL so the success banner auto-dismisses
  useEffect(() => {
    if (!justSaved) return;
    const t = setTimeout(() => setJustSaved(false), JUST_SAVED_TTL_MS);
    return () => clearTimeout(t);
  }, [justSaved]);

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
        // Check whether more.tsx wrote a "just saved" flag for this farm —
        // done before the res.ok guard so a network failure never silently
        // swallows a flag the grower earned.
        try {
          const key = identifierJustSavedKey(farmId);
          const raw = await AsyncStorage.getItem(key);
          if (raw && !cancelled) {
            const { ts } = JSON.parse(raw) as { ts: number };
            if (Date.now() - ts < JUST_SAVED_TTL_MS) {
              setJustSaved(true);
              await AsyncStorage.removeItem(key); // consume immediately
            }
          }
        } catch {
          // best-effort; don't surface to user
        }

        const res = await fetch(`${apiBase}/api/farms/${farmId}`, { headers });
        if (!res.ok || cancelled) { setLoading(false); return; }
        const data = await res.json() as { record?: { name?: string | null; contactPhone?: string | null; cphNumber?: string | null; sbiNumber?: string | null; address?: string | null; postcode?: string | null } };
        if (!cancelled) {
          setFarmName(data.record?.name ?? null);
          setContactPhone(data.record?.contactPhone ?? null);
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

  return { farmName, contactPhone, cphNumber, sbiNumber, address, postcode, loading, justSaved, refetch, clearJustSaved };
}
