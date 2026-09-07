/**
 * The Expo app has no browser cookie jar. Clerk's current session token is
 * registered by the root layout and read immediately before each API request.
 * Tokens are deliberately never persisted outside Clerk's tokenCache.
 */
export type AuthTokenGetter = () => Promise<string | null>;

let authTokenGetter: AuthTokenGetter = async () => null;
let fetchInstalled = false;

export function setMobileAuthTokenGetter(getter: AuthTokenGetter): void {
  authTokenGetter = getter;
}

export async function getMobileAuthToken(): Promise<string | null> {
  return authTokenGetter();
}

export const getCurrentAuthToken = getMobileAuthToken;

/**
 * Some long-lived mobile screens still issue direct fetch calls. Ensure those
 * API calls use the active Clerk session too, while leaving Clerk and signed
 * upload URLs untouched.
 */
export function installMobileApiAuthFetch(apiOrigin: string): void {
  if (fetchInstalled || !apiOrigin || typeof globalThis.fetch !== "function") return;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (!url.startsWith(`${apiOrigin}/api/`)) return originalFetch(input, init);
    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
    const token = await getMobileAuthToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return originalFetch(input, { ...init, headers });
  };
  fetchInstalled = true;
}