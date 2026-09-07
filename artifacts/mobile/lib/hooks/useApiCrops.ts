import { useEffect, useState } from "react";
import { kvGet } from "@/lib/database";
import { getCurrentAuthToken } from "../authToken";

export interface ApiCrop {
  id: number;
  cropId?: number;
  name: string;
  variety?: string | null;
  category?: string | null;
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

export function useApiCrops(farmId: string | undefined) {
  const [crops, setCrops] = useState<ApiCrop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!farmId) return;

    const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
    if (!apiDomain) {
      setCrops([]);
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

        const res = await fetch(`https://${apiDomain}/api/farms/${farmId}/crops`, { headers });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);

        const data = await res.json();
        if (!cancelled) {
          setCrops((data.records ?? data) as ApiCrop[]);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load crops");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [farmId]);

  return { crops, loading, error };
}
