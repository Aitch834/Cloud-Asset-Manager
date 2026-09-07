import { Platform } from "react-native";
import { getMobileAuthToken } from "@/lib/authToken";

import { getRefCache, getRefCacheUpdatedAt, saveRefCache } from "./database";

export type RefHerd = { id: string; label: string; type: string };
export type RefStaffMember = { id: string; label: string; role: string };
export type RefSupplier = { id: string; label: string; supplierType: string };
export type RefGrainBin = { id: string; label: string; binType: string; sublabel: string };
export type RefSprayProduct = { id: string; label: string; currentStockQuantity: string | null };
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
  return getMobileAuthToken();
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
    syncGrainBins(farmId, token, base),
    syncStaffMembers(farmId, token, base),
    syncSprayProducts(farmId, token, base),
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

async function syncStaffMembers(farmId: string, token: string, base: string): Promise<void> {
  type RawMember = { id: number; firstName: string; lastName: string; jobTitle: string | null; isActive: boolean };
  try {
    const res = await fetch(`${base}/api/farms/${farmId}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json() as { members?: RawMember[] };
    const rawMembers = data.members ?? [];
    const members: RefStaffMember[] = rawMembers
      .filter((m) => m.isActive !== false)
      .map((m) => ({
        id: String(m.id),
        label: [m.firstName, m.lastName].filter(Boolean).join(" "),
        role: m.jobTitle ?? "",
      }))
      .filter((m) => m.label.trim());
    if (members.length > 0) {
      await saveRefCache("staff", farmId, members);
    }
  } catch {
    // silently ignore
  }
}

export async function getCachedStaffMembers(farmId: string): Promise<RefStaffMember[]> {
  return getRefCache<RefStaffMember>("staff", farmId);
}

async function syncGrainBins(farmId: string, token: string, base: string): Promise<void> {
  type RawLocation = { id: number; name: string; type: string; binType: string | null; capacityTonnes: string | null };
  const GRAIN_TYPES = ["grain_store", "silo", "bin"];
  const TYPE_LABELS: Record<string, string> = { grain_store: "Grain Store", silo: "Silo", bin: "Bin" };
  const records = await safeFetch<RawLocation>(`${base}/api/farms/${farmId}/storage-locations`, token);
  if (!records) return;
  const bins: RefGrainBin[] = records
    .filter((l) => GRAIN_TYPES.includes(l.type))
    .map((l) => ({
      id: String(l.id),
      label: l.name,
      binType: l.binType ?? TYPE_LABELS[l.type] ?? l.type,
      sublabel: [l.binType ?? TYPE_LABELS[l.type] ?? l.type, l.capacityTonnes ? `${l.capacityTonnes}t` : ""].filter(Boolean).join(" · "),
    }));
  if (bins.length > 0) {
    await saveRefCache("grain-bins", farmId, bins);
  }
}

export async function getCachedGrainBins(farmId: string): Promise<RefGrainBin[]> {
  return getRefCache<RefGrainBin>("grain-bins", farmId);
}

async function syncSprayProducts(farmId: string, token: string, base: string): Promise<void> {
  type RawProduct = { id: number; productName: string; currentStockQuantity: string | null };
  const records = await safeFetch<RawProduct>(`${base}/api/farms/${farmId}/spray-products`, token);
  if (!records) return;
  const products: RefSprayProduct[] = records.map((p) => ({
    id: String(p.id),
    label: p.productName,
    currentStockQuantity: p.currentStockQuantity ?? null,
  }));
  if (products.length > 0) {
    await saveRefCache("spray-products", farmId, products);
  }
}

export async function getCachedSprayProducts(farmId: string): Promise<RefSprayProduct[]> {
  return getRefCache<RefSprayProduct>("spray-products", farmId);
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
