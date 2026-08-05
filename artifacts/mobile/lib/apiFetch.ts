import { kvGet } from "@/lib/database";
import { getApiBase, getAuthToken } from "@/lib/uploadPhoto";

async function getTenantSlug(): Promise<string | null> {
  try {
    const farmRaw = await kvGet("bde_current_farm");
    if (!farmRaw) return null;
    const farm = JSON.parse(farmRaw) as { tenantSlug?: string; slug?: string };
    return farm.tenantSlug ?? farm.slug ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetch wrapper for API calls from mobile screens.
 *
 * Root-relative URLs (e.g. `/api/...`) only resolve in a browser context.
 * On a real device (native Expo build) there is no origin, so every API
 * call must be made against the absolute base derived from
 * EXPO_PUBLIC_DOMAIN. This helper prefixes the base and attaches the
 * stored auth token as a Bearer header (needed on native, where session
 * cookies are unavailable), plus the current farm's tenant slug, which
 * tenant-scoped routes require.
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const base = getApiBase();
  const [token, tenantSlug] = await Promise.all([getAuthToken(), getTenantSlug()]);
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (tenantSlug) {
    headers["x-tenant-slug"] = tenantSlug;
  }
  return fetch(`${base}${path}`, {
    credentials: "include",
    ...init,
    headers,
  });
}
