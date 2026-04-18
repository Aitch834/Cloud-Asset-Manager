import { Platform } from "react-native";
import { kvGet } from "@/lib/database";

export type BdeEntityType = "equipment" | "field" | "animal" | "storage";

export function parseBdeCode(raw: string): string {
  const match = raw.match(/^BDE:F\d+:(.+)$/i);
  return match ? match[1] : raw;
}

export function detectBdeType(raw: string): BdeEntityType | null {
  const code = parseBdeCode(raw);
  if (code.startsWith("EQ-"))  return "equipment";
  if (code.startsWith("FLD-")) return "field";
  if (code.startsWith("ANM-")) return "animal";
  if (code.startsWith("STG-")) return "storage";
  return null;
}

export function bdeEntityDisplayName(type: BdeEntityType, data: Record<string, unknown>): string {
  switch (type) {
    case "equipment": return (data.name as string) || `Asset #${data.id}`;
    case "field":     return (data.name as string) || `Field #${data.id}`;
    case "animal":    return (data.earTagNumber as string) || (data.tagNumber as string) || `Animal #${data.id}`;
    case "storage":   return (data.name as string) || `Store #${data.id}`;
  }
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
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
      token = raw ? JSON.parse(raw) : null;
    }
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const farmRaw = await kvGet("bde_current_farm");
    if (farmRaw) {
      const farm = JSON.parse(farmRaw);
      const slug = farm.tenantSlug || farm.slug || "";
      if (slug) headers["x-tenant-slug"] = slug;
    }
  } catch {}
  return headers;
}

export async function lookupBdeEntity(
  normalizedCode: string,
  type: BdeEntityType,
  farmId: number,
): Promise<Record<string, unknown> | null> {
  const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
  const base = `https://${apiDomain}/api/farms/${farmId}`;
  const endpoints: Record<BdeEntityType, string> = {
    equipment: `${base}/equipment/by-asset/${normalizedCode}`,
    field:     `${base}/fields/by-code/${normalizedCode}`,
    animal:    `${base}/animals/by-code/${normalizedCode}`,
    storage:   `${base}/storage-locations/by-code/${normalizedCode}`,
  };
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(endpoints[type], { headers });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
