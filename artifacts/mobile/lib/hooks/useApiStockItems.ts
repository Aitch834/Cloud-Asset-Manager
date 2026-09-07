import { useEffect, useState } from "react";
import { kvGet, kvSet } from "@/lib/database";
import { getCurrentAuthToken } from "../authToken";

export interface ApiStockItem {
  id: number;
  name: string;
  category: string | null;
  unit: string | null;
  stockType: string | null;
}

const CLEANING_CATEGORIES = ["disinfectant", "disinfectants", "cleaning", "sanitiser", "sanitizer", "biosecurity"];

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

export function useApiStockItems(farmId: string | undefined) {
  const [allItems, setAllItems] = useState<ApiStockItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!farmId) return;

    const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
    if (!apiDomain) return;

    let cancelled = false;
    const cacheKey = `stock_items_${farmId}`;

    (async () => {
      setLoading(true);
      try {
        const cached = await kvGet(cacheKey);
        if (cached && !cancelled) {
          setAllItems(JSON.parse(cached) as ApiStockItem[]);
          setLoading(false);
        }
      } catch { }

      const isNumericFarm = /^\d+$/.test(farmId);
      if (!isNumericFarm) { if (!cancelled) setLoading(false); return; }

      try {
        const [token, tenantSlug] = await Promise.all([getCurrentAuthToken(), getTenantSlug()]);
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`https://${apiDomain}/api/farms/${farmId}/stock-items`, { headers });
        if (!res.ok) return;
        const data = await res.json();
        const items = (data.records ?? []) as ApiStockItem[];
        if (!cancelled) {
          setAllItems(items);
          setLoading(false);
        }
        await kvSet(cacheKey, JSON.stringify(items));
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [farmId]);

  const cleaningItems = allItems.filter(s =>
    s.category && CLEANING_CATEGORIES.includes(s.category.toLowerCase())
  );

  return {
    allItems,
    cleaningItems: cleaningItems.length > 0 ? cleaningItems : allItems,
    hasDisinfectantCategory: cleaningItems.length > 0,
    loading,
  };
}
