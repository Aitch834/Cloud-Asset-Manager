/**
 * LIS LIP — Livestock Information Platform adapter (Cattle)
 *
 * LIP uses Azure B2C authorization code flow with the B2C_1A_THIRDPARTY_SIGNIN policy.
 * Each farm authenticates via the LIS sign-in page — no platform-level client credentials.
 *
 * Confirmed sandbox credentials (LIS LIP Developer Portal "Additional Credentials", June 2026):
 *   b2c-authority:  https://livestockinformationb2cprod.b2clogin.com/tfp/livestockinformationb2cprod.onmicrosoft.com/B2C_1A_THIRDPARTY_SIGNIN/v2.0
 *   api-scopes:     https://livestockinformationb2cprod.onmicrosoft.com/ms-apimlisapisdbx/user_impersonation
 *   api-url:        https://sandbox.movement.api.livestockinformation.org.uk/lis-public-sdbx/v1.0
 *
 * Required environment variables:
 *   LIS_LIP_CLIENT_ID             — BDE Farm Trac app client ID (from LIP developer portal)
 *   LIS_LIP_PRIMARY_SECRET        — Client secret (primary)
 *   LIS_LIP_SECONDARY_SECRET      — Client secret (secondary, for rotation)
 *   LIS_LIP_SUBSCRIPTION_KEY      — APIM subscription key for LIS API Sandbox
 *   LIS_LIP_REDIRECT_URI          — Registered callback URL (optional — constructed from request if absent)
 *   LIS_LIP_API_URL_SANDBOX       — Sandbox API base URL (set from developer portal)
 *   LIS_LIP_B2C_AUTHORITY_SANDBOX — Sandbox B2C authority URL (set from developer portal)
 *   LIS_LIP_SCOPE_SANDBOX         — Sandbox OAuth scope (set from developer portal)
 *   LIS_LIP_USE_PRODUCTION        — Set to "true" when production endpoints are available
 */

import { createHmac, timingSafeEqual } from "crypto";
import type { Request } from "express";

// ── Sandbox constants (confirmed from LIS LIP developer portal) ───────────────
const LIP_B2C_AUTHORITY_SANDBOX =
  process.env.LIS_LIP_B2C_AUTHORITY_SANDBOX ??
  "https://livestockinformationb2cprod.b2clogin.com/tfp/livestockinformationb2cprod.onmicrosoft.com/B2C_1A_THIRDPARTY_SIGNIN/v2.0";

const LIP_SCOPE_SANDBOX =
  (process.env.LIS_LIP_SCOPE_SANDBOX ??
   "https://livestockinformationb2cprod.onmicrosoft.com/ms-apimlisapisdbx/user_impersonation") +
  " offline_access";

export const LIP_API_BASE_SANDBOX =
  process.env.LIS_LIP_API_URL_SANDBOX ??
  "https://sandbox.movement.api.livestockinformation.org.uk/lis-public-sdbx/v1.0";

// ── Production constants (TBC — update and set LIS_LIP_USE_PRODUCTION=true) ───
const LIP_B2C_AUTHORITY_PROD = process.env.LIS_LIP_B2C_AUTHORITY_PROD ?? LIP_B2C_AUTHORITY_SANDBOX;
const LIP_SCOPE_PROD = process.env.LIS_LIP_SCOPE_PROD ?? LIP_SCOPE_SANDBOX;
export const LIP_API_BASE_PROD = process.env.LIS_LIP_API_URL_PROD ?? LIP_API_BASE_SANDBOX;

function isLipProduction(): boolean {
  return process.env.LIS_LIP_USE_PRODUCTION === "true";
}

export function isLipSandboxMode(): boolean {
  return !isLipProduction();
}

const LIP_B2C_AUTHORITY = isLipProduction() ? LIP_B2C_AUTHORITY_PROD : LIP_B2C_AUTHORITY_SANDBOX;
const LIP_SCOPE         = isLipProduction() ? LIP_SCOPE_PROD          : LIP_SCOPE_SANDBOX;
export const LIP_API_BASE = isLipProduction() ? LIP_API_BASE_PROD : LIP_API_BASE_SANDBOX;

const LIP_B2C_AUTHORIZE_URL = `${LIP_B2C_AUTHORITY}/authorize`;
const LIP_B2C_TOKEN_URL     = `${LIP_B2C_AUTHORITY}/token`;

const LIP_CLIENT_ID     = process.env.LIS_LIP_CLIENT_ID     ?? "";
const LIP_CLIENT_SECRET = process.env.LIS_LIP_PRIMARY_SECRET ?? "";
export const LIP_SUBSCRIPTION_KEY = process.env.LIS_LIP_SUBSCRIPTION_KEY ?? "";

/**
 * Resolve the redirect URI for the LIP OAuth callback.
 * Uses LIS_LIP_REDIRECT_URI env var if set, otherwise constructs from request.
 */
export function getLipRedirectUri(req: Request): string {
  const configured = process.env.LIS_LIP_REDIRECT_URI;
  if (configured) return configured;
  const proto = (req.headers["x-forwarded-proto"] as string | undefined) ?? "https";
  const host =
    (req.headers["x-forwarded-host"] as string | undefined) ??
    (req.headers["host"] as string | undefined) ??
    "localhost";
  return `${proto}://${host}/api/lip/callback`;
}

/**
 * Sign an OAuth state parameter using HMAC-SHA256 (same pattern as LIS CLA).
 * Format:  <hmacHex>.<timestamp>|<farmId>|<base64url(returnUrl)>
 * Expires: 1 hour
 */
export function signLipOAuthState(farmId: number, returnUrl: string): string {
  const timestamp = Date.now().toString();
  const payload = `${timestamp}|${farmId}|${Buffer.from(returnUrl).toString("base64url")}`;
  const secret = process.env.CREDENTIAL_ENCRYPTION_KEY ?? "lip-oauth-hmac-fallback";
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${sig}.${payload}`;
}

export function verifyLipOAuthState(
  state: string,
): { valid: false } | { valid: true; farmId: number; returnUrl: string } {
  const dotIdx = state.indexOf(".");
  if (dotIdx === -1) return { valid: false };
  const sig     = state.slice(0, dotIdx);
  const payload = state.slice(dotIdx + 1);
  const secret  = process.env.CREDENTIAL_ENCRYPTION_KEY ?? "lip-oauth-hmac-fallback";
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const sigBuf = Buffer.from(sig, "hex");
  const expBuf = Buffer.from(expected, "hex");
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return { valid: false };
  const parts = payload.split("|");
  if (parts.length < 3) return { valid: false };
  const [timestamp, farmIdStr, returnUrlB64] = parts;
  if (Date.now() - parseInt(timestamp) > 60 * 60 * 1000) return { valid: false };
  const farmId = parseInt(farmIdStr);
  if (!farmId || isNaN(farmId)) return { valid: false };
  let returnUrl = "https://bdefarmtrac.co.uk/dashboard/farm-settings";
  try {
    returnUrl = Buffer.from(returnUrlB64, "base64url").toString();
  } catch { /* keep default */ }
  return { valid: true, farmId, returnUrl };
}

/**
 * Build the LIP B2C authorization URL for the authorization code flow.
 */
export function buildLipAuthUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id:     LIP_CLIENT_ID,
    response_type: "code",
    redirect_uri:  redirectUri,
    scope:         LIP_SCOPE,
    state,
    response_mode: "query",
    prompt:        "login",
  });
  return `${LIP_B2C_AUTHORIZE_URL}?${params.toString()}`;
}

export interface LipTokenResult {
  sandbox: boolean;
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  errorMessage?: string;
}

/**
 * Exchange an OAuth authorization code for LIP access + refresh tokens.
 */
export async function exchangeLipCode(code: string, redirectUri: string): Promise<LipTokenResult> {
  const sandbox = isLipSandboxMode();
  try {
    const body = new URLSearchParams({
      grant_type:   "authorization_code",
      client_id:    LIP_CLIENT_ID,
      code,
      redirect_uri: redirectUri,
      scope:        LIP_SCOPE,
    });
    if (LIP_CLIENT_SECRET) body.append("client_secret", LIP_CLIENT_SECRET);

    const res = await fetch(LIP_B2C_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const text = await res.text();
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return {
        sandbox,
        success: false,
        errorMessage: `B2C returned non-JSON (HTTP ${res.status}). The redirect_uri may not be registered in the LIP app registration, or the B2C policy name is wrong. Response: ${text.slice(0, 300)}`,
      };
    }

    const data = JSON.parse(text) as Record<string, unknown>;
    if (!res.ok || data["error"]) {
      return {
        sandbox,
        success: false,
        errorMessage:
          (data["error_description"] as string) ??
          (data["error"] as string) ??
          `HTTP ${res.status}`,
      };
    }

    return {
      sandbox,
      success:      true,
      accessToken:  data["access_token"] as string,
      refreshToken: data["refresh_token"] as string | undefined,
      expiresIn:    data["expires_in"] as number | undefined,
    };
  } catch (e: any) {
    return { sandbox, success: false, errorMessage: `Token exchange failed: ${e.message}` };
  }
}

/**
 * Probe the LIP API base URL to check connectivity (subscription key only, no user token).
 */
export async function probeLipApi(): Promise<{ reachable: boolean; status: number; message: string }> {
  try {
    const res = await fetch(`${LIP_API_BASE}/health`, {
      headers: { "Ocp-Apim-Subscription-Key": LIP_SUBSCRIPTION_KEY },
    });
    if (res.status === 200) {
      return { reachable: true, status: 200, message: "LIP API is reachable and responding." };
    } else if (res.status === 401) {
      return { reachable: true, status: 401, message: "LIP API reachable — user authentication required (expected; API connectivity confirmed)." };
    } else if (res.status === 403) {
      return { reachable: true, status: 403, message: "LIP API reachable — subscription not yet approved (403). Awaiting LIS LIP sandbox approval." };
    } else if (res.status === 404) {
      return { reachable: true, status: 404, message: "LIP API reachable (no /health endpoint — expected during Alpha)." };
    } else {
      return { reachable: true, status: res.status, message: `LIP API responded with HTTP ${res.status}.` };
    }
  } catch (e: any) {
    return { reachable: false, status: 0, message: `LIP API unreachable: ${e.message}` };
  }
}
