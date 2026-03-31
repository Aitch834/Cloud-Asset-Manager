import { Platform } from "react-native";

import { getRefCache, getRefCacheUpdatedAt, saveRefCache } from "./database";

export type RefHerd = { id: string; label: string; type: string };
export type RefSupplier = { id: string; label: string; supplierType: string };
export type RefBatch = {
  id: string;
  supplierId: string;
  supplierName: string;
  label: string;
  batchNumber: string;
  lotNumber: string;
  stockItemName: string;
  deliveryDate: string;
};

async function getAuthToken(): Promise<string | null> {
  try {
    if (Platform.OS !== "web") {
      const SecureStore = await import("expo-secure-store");
      const token = await SecureStore.getItemAsync("auth_session_token");
      if (token) return token;
    } else {
      try {
        return localStorage.getItem("auth_session_token");
      } catch {
        return null;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function apiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}` : "";
}

async function safeFetch<T>(
  url: string,
  token: string,
): Promise<T[] | null> {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json() as { records?: T[] };
    return data.records ?? null;
  } catch {
    return null;
  }
}

export async function syncRefData(farmId: string): Promise<void> {
  const token = await getAuthToken();
  if (!token) return;
  const base = apiBase();
  if (!base) return;

  await Promise.allSettled([
    syncHerds(farmId, token, base),
    syncSuppliers(farmId, token, base),
    syncBatches(farmId, token, base),
  ]);
}

async function syncHerds(farmId: string, token: string, base: string): Promise<void> {
  type RawHerd = { id: number; name: string; type: string };
  const [cattle, pigs, poultry] = await Promise.all([
    safeFetch<RawHerd>(`${base}/api/farms/${farmId}/herds`, token),
    safeFetch<RawHerd>(`${base}/api/farms/${farmId}/pig-flocks`, token),
    safeFetch<RawHerd>(`${base}/api/farms/${farmId}/poultry-flocks`, token),
  ]);

  const combined: RefHerd[] = [];
  for (const h of cattle ?? []) {
    combined.push({ id: String(h.id), label: h.name, type: h.type ?? "Cattle" });
  }
  for (const h of pigs ?? []) {
    combined.push({ id: `pig-${h.id}`, label: h.name, type: h.type ?? "Pigs" });
  }
  for (const h of poultry ?? []) {
    combined.push({ id: `poultry-${h.id}`, label: h.name, type: h.type ?? "Poultry" });
  }

  if (combined.length > 0) {
    await saveRefCache("herds", farmId, combined);
  }
}

async function syncSuppliers(farmId: string, token: string, base: string): Promise<void> {
  type RawSupplier = { id: number; name: string; supplierType: string };
  const records = await safeFetch<RawSupplier>(`${base}/api/farms/${farmId}/suppliers`, token);
  if (!records) return;

  const suppliers: RefSupplier[] = records.map((s) => ({
    id: String(s.id),
    label: s.name,
    supplierType: s.supplierType ?? "general",
  }));
  await saveRefCache("suppliers", farmId, suppliers);
}

async function syncBatches(farmId: string, token: string, base: string): Promise<void> {
  type RawDelivery = {
    id: number;
    supplierId: number;
    supplierName: string;
    stockItemName: string;
    grnNumber: string;
    deliveryDate: string;
    batchNumber: string;
    lotNumber: string;
  };
  const records = await safeFetch<RawDelivery>(
    `${base}/api/farms/${farmId}/stock-deliveries`,
    token,
  );
  if (!records) return;

  const batches: RefBatch[] = records
    .filter((d) => d.batchNumber || d.lotNumber || d.grnNumber)
    .map((d) => {
      const code = d.batchNumber || d.lotNumber || d.grnNumber || "";
      const dateStr = d.deliveryDate
        ? new Date(d.deliveryDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "";
      const label = [code, d.stockItemName, dateStr].filter(Boolean).join(" — ");
      return {
        id: String(d.id),
        supplierId: String(d.supplierId),
        supplierName: d.supplierName ?? "",
        label,
        batchNumber: d.batchNumber ?? "",
        lotNumber: d.lotNumber ?? "",
        stockItemName: d.stockItemName ?? "",
        deliveryDate: d.deliveryDate ?? "",
      };
    });

  await saveRefCache("batches", farmId, batches);
}

export async function getCachedHerds(farmId: string): Promise<RefHerd[]> {
  return getRefCache<RefHerd>("herds", farmId);
}

export async function getCachedSuppliers(farmId: string): Promise<RefSupplier[]> {
  return getRefCache<RefSupplier>("suppliers", farmId);
}

export async function getCachedBatches(
  farmId: string,
  supplierId?: string,
): Promise<RefBatch[]> {
  const all = await getRefCache<RefBatch>("batches", farmId);
  if (!supplierId) return all;
  return all.filter((b) => b.supplierId === supplierId);
}

export async function getRefCacheSyncedMinsAgo(
  dataType: string,
  farmId: string,
): Promise<number | null> {
  const d = await getRefCacheUpdatedAt(dataType, farmId);
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / 60000);
}
