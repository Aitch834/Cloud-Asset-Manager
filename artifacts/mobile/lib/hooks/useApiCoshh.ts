import { useEffect, useState } from "react";
import { kvGet } from "@/lib/database";
import { getCurrentAuthToken } from "../authToken";

export interface ApiCoshhRecord {
  id: number;
  substanceName: string;
  manufacturer: string | null;
  hazardClassification: string | null;
  usageArea: string | null;
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

export function useApiCoshh(farmId: string | undefined) {
  const [records, setRecords] = useState<ApiCoshhRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!farmId) return;

    const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
    if (!apiDomain) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const [token, tenantSlug] = await Promise.all([getCurrentAuthToken(), getTenantSlug()]);
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`https://${apiDomain}/api/farms/${farmId}/coshh`, { headers });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setRecords((data.records ?? []) as ApiCoshhRecord[]);
        }
      } catch {
        // silently fail — COSHH list is advisory, not blocking
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [farmId]);

  return { records, loading };
}
