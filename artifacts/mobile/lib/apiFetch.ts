import { kvGet } from "@/lib/database";
import { getApiBase } from "@/lib/uploadPhoto";
import { getMobileAuthToken } from "@/lib/authToken";

export const FORCE_SCOUTING_PHOTO_CAPTION_FAILURE_HEADER =
  "x-bde-force-scouting-photo-caption-failure";

/**
 * Extra controls that are intentionally available only to development builds.
 * They are stripped before the native fetch call so they never become browser
 * request options.
 */
export type ApiFetchOptions = RequestInit & {
  /**
   * Ask the development API to reject a post-upload scouting-photo caption
   * save. This is ignored by production builds and only used for the device
   * warning check.
   */
  forceScoutingPhotoCaptionFailure?: boolean;
};

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
export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { forceScoutingPhotoCaptionFailure, ...init } = options;
  const base = getApiBase();
  const [token, tenantSlug] = await Promise.all([getMobileAuthToken(), getTenantSlug()]);
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (tenantSlug) {
    headers["x-tenant-slug"] = tenantSlug;
  }
  // __DEV__ is compiled to false in release builds, so a production app can
  // never send this testing header.
  if (__DEV__ && forceScoutingPhotoCaptionFailure) {
    headers[FORCE_SCOUTING_PHOTO_CAPTION_FAILURE_HEADER] = "true";
  }
  return fetch(`${base}${path}`, {
    credentials: "include",
    ...init,
    headers,
  });
}

/** True when a request was intentionally cancelled by its screen cleanup. */
export function isAbortError(error: unknown): boolean {
  return error instanceof Error
    ? error.name === "AbortError"
    : typeof error === "object" && error !== null && "name" in error
      && (error as { name?: unknown }).name === "AbortError";
}
