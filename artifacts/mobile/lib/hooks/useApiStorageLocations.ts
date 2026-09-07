import { useEffect, useState } from "react";
import { kvGet } from "@/lib/database";
import { getCurrentAuthToken } from "../authToken";

export interface ApiStorageLocation {
  id: number;
  name: string;
  type: string;
  capacityTonnes?: string | null;
  locationDescription?: string | null;
  notes?: string | null;
  isActive: boolean;
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

export function useApiStorageLocations(farmId: string | undefined) {
  const [locations, setLocations] = useState<ApiStorageLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!farmId) return;

    const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
    if (!apiDomain) {
      setLocations([]);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [token, tenantSlug] = await Promise.all([getCurrentAuthToken(), getTenantSlug()]);

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`https://${apiDomain}/api/farms/${farmId}/storage-locations`, { headers });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);

        const data = await res.json();
        if (!cancelled) {
          const active = ((data.records ?? []) as ApiStorageLocation[]).filter((l) => l.isActive !== false);
          setLocations(active);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load storage locations");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [farmId]);

  return { locations, loading, error };
}
