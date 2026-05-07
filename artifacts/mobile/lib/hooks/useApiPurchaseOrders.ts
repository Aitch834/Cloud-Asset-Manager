import { Platform } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { kvGet } from "@/lib/database";

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierName: string | null;
  orderDate: string | null;
  expectedDeliveryDate: string | null;
  status: string;
  notes: string | null;
  submittedByName: string | null;
  lineCount: number;
  totalPence: number | null;
  createdAt: string;
}

export interface PurchaseOrderCounts {
  all: number;
  outstanding: number;
  awaiting_approval: number;
  sent: number;
  draft: number;
  partially_received: number;
  fully_received: number;
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

function calcCounts(records: PurchaseOrder[]): PurchaseOrderCounts {
  const counts: PurchaseOrderCounts = {
    all: records.length,
    outstanding: 0,
    awaiting_approval: 0,
    sent: 0,
    draft: 0,
    partially_received: 0,
    fully_received: 0,
  };
  for (const r of records) {
    const k = r.status as keyof PurchaseOrderCounts;
    if (k in counts) counts[k]++;
  }
  return counts;
}

export function useApiPurchaseOrders(farmId: string | undefined, statusFilter?: string) {
  const [allRecords, setAllRecords] = useState<PurchaseOrder[]>([]);
  const [counts, setCounts] = useState<PurchaseOrderCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!farmId) { setLoading(false); return; }
    const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
    if (!apiDomain) { setLoading(false); return; }

    setLoading(true);
    setError(null);
    try {
      const [token, tenantSlug] = await Promise.all([getAuthToken(), getTenantSlug()]);
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-tenant-slug": tenantSlug,
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`https://${apiDomain}/api/farms/${farmId}/purchase-orders`, { headers });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = await res.json();
      const records: PurchaseOrder[] = json.records || json.data || json || [];
      setAllRecords(records);
      setCounts(calcCounts(records));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => { load(); }, [load]);

  const data =
    !statusFilter || statusFilter === "all"
      ? allRecords
      : allRecords.filter((r) => r.status === statusFilter);

  return { data, counts, loading, error, reload: load };
}

export async function createPurchaseOrder(
  farmId: string,
  body: {
    supplierName?: string;
    expectedDeliveryDate?: string;
    notes?: string;
    submittedByName?: string;
    status?: string;
    lines?: { description?: string; quantityOrdered: number; unitPricePence?: number | null; notes?: string }[];
  },
): Promise<{ success: boolean; poNumber?: string; error?: string }> {
  const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
  if (!apiDomain) return { success: false, error: "No API domain configured" };

  try {
    const [token, tenantSlug] = await Promise.all([getAuthToken(), getTenantSlug()]);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-tenant-slug": tenantSlug,
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`https://${apiDomain}/api/farms/${farmId}/purchase-orders`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...body, status: body.status || "draft" }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { success: false, error: `Server error ${res.status}: ${text}` };
    }
    const json = await res.json();
    return { success: true, poNumber: json.record?.poNumber };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create" };
  }
}
