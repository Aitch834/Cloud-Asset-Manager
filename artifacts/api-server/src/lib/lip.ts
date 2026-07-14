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

// ── Sandbox constants (confirmed from LIS LIP developer portal + OIDC discovery) ─
//
// IMPORTANT: The authority/issuer value from the developer portal
//   (https://{tenant}.b2clogin.com/tfp/{tenant}.onmicrosoft.com/{policy}/v2.0)
// is the OIDC issuer URL only — NOT the base for authorize/token endpoints.
//
// Real endpoints (verified via OIDC discovery document):
//   https://livestockinformationb2cprod.b2clogin.com/{tenant}/b2c_1a_thirdparty_signin/oauth2/v2.0/authorize
//   https://livestockinformationb2cprod.b2clogin.com/{tenant}/b2c_1a_thirdparty_signin/oauth2/v2.0/token

const LIP_B2C_TENANT = "livestockinformationb2cprod.onmicrosoft.com";
const LIP_B2C_HOST   = "https://livestockinformationb2cprod.b2clogin.com";
const LIP_B2C_POLICY_SANDBOX = "b2c_1a_thirdparty_signin";
const LIP_B2C_POLICY_PROD    = process.env.LIS_LIP_B2C_POLICY_PROD ?? LIP_B2C_POLICY_SANDBOX;

const LIP_B2C_AUTHORIZE_URL_SANDBOX =
  process.env.LIS_LIP_B2C_AUTHORIZE_URL_SANDBOX ??
  `${LIP_B2C_HOST}/${LIP_B2C_TENANT}/${LIP_B2C_POLICY_SANDBOX}/oauth2/v2.0/authorize`;

const LIP_B2C_TOKEN_URL_SANDBOX =
  process.env.LIS_LIP_B2C_TOKEN_URL_SANDBOX ??
  `${LIP_B2C_HOST}/${LIP_B2C_TENANT}/${LIP_B2C_POLICY_SANDBOX}/oauth2/v2.0/token`;

const LIP_SCOPE_SANDBOX =
  (process.env.LIS_LIP_SCOPE_SANDBOX ??
   "https://livestockinformationb2cprod.onmicrosoft.com/ms-apimlisapisdbx/user_impersonation") +
  " offline_access";

export const LIP_API_BASE_SANDBOX =
  process.env.LIS_LIP_API_URL_SANDBOX ??
  "https://sandbox.movement.api.livestockinformation.org.uk/lis-public-sdbx/v1.0";

// ── Production constants (TBC — update and set LIS_LIP_USE_PRODUCTION=true) ───
const LIP_B2C_AUTHORIZE_URL_PROD =
  process.env.LIS_LIP_B2C_AUTHORIZE_URL_PROD ??
  `${LIP_B2C_HOST}/${LIP_B2C_TENANT}/${LIP_B2C_POLICY_PROD}/oauth2/v2.0/authorize`;

const LIP_B2C_TOKEN_URL_PROD =
  process.env.LIS_LIP_B2C_TOKEN_URL_PROD ??
  `${LIP_B2C_HOST}/${LIP_B2C_TENANT}/${LIP_B2C_POLICY_PROD}/oauth2/v2.0/token`;

const LIP_SCOPE_PROD = process.env.LIS_LIP_SCOPE_PROD ?? LIP_SCOPE_SANDBOX;
export const LIP_API_BASE_PROD = process.env.LIS_LIP_API_URL_PROD ?? LIP_API_BASE_SANDBOX;

function isLipProduction(): boolean {
  return process.env.LIS_LIP_USE_PRODUCTION === "true";
}

export function isLipSandboxMode(): boolean {
  return !isLipProduction();
}

const LIP_B2C_AUTHORIZE_URL = isLipProduction() ? LIP_B2C_AUTHORIZE_URL_PROD : LIP_B2C_AUTHORIZE_URL_SANDBOX;
const LIP_B2C_TOKEN_URL     = isLipProduction() ? LIP_B2C_TOKEN_URL_PROD     : LIP_B2C_TOKEN_URL_SANDBOX;
const LIP_SCOPE             = isLipProduction() ? LIP_SCOPE_PROD              : LIP_SCOPE_SANDBOX;
export const LIP_API_BASE   = isLipProduction() ? LIP_API_BASE_PROD          : LIP_API_BASE_SANDBOX;

const LIP_CLIENT_ID     = process.env.LIS_LIP_CLIENT_ID     ?? "";
const LIP_CLIENT_SECRET = process.env.LIS_LIP_PRIMARY_SECRET ?? "";
export const LIP_SUBSCRIPTION_KEY = process.env.LIS_LIP_SUBSCRIPTION_KEY ?? "";
// Verified live against the real LIP sandbox (4 Jul 2026): the primary APIM key
// (LIS_LIP_SUBSCRIPTION_KEY) is rejected with "invalid subscription key" (401),
// but the secondary key (LIS_LIP_SUBSCRIPTION_KEY_2) is accepted and returns
// real business responses. This is consistent with the primary key having been
// regenerated on LIS's side after issuance. Used as an automatic fallback below
// so submissions keep working regardless of which key LIS currently has live.
const LIP_SUBSCRIPTION_KEY_FALLBACK = process.env.LIS_LIP_SUBSCRIPTION_KEY_2 ?? "";

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
      headers: { "Ocp-Apim-Subscription-Key": LIP_SUBSCRIPTION_KEY || LIP_SUBSCRIPTION_KEY_FALLBACK },
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

// ── Token refresh ─────────────────────────────────────────────────────────────

export interface LipRefreshResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  errorMessage?: string;
}

/**
 * Use a stored refresh token to obtain a new access token from the B2C token endpoint.
 * Called by routes when the stored access token is expired or missing.
 */
export async function refreshLipToken(refreshToken: string): Promise<LipRefreshResult> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: LIP_CLIENT_ID,
    refresh_token: refreshToken,
    scope: LIP_SCOPE,
  });
  if (LIP_CLIENT_SECRET) body.append("client_secret", LIP_CLIENT_SECRET);

  try {
    const res = await fetch(LIP_B2C_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    const text = await res.text();
    let data: Record<string, unknown> = {};
    try { data = JSON.parse(text); } catch { /* ignore */ }
    if (!res.ok || data["error"]) {
      return {
        success: false,
        errorMessage:
          (data["error_description"] as string) ??
          (data["error"] as string) ??
          `HTTP ${res.status}`,
      };
    }
    return {
      success: true,
      accessToken: data["access_token"] as string,
      refreshToken: data["refresh_token"] as string | undefined,
      expiresIn: data["expires_in"] as number | undefined,
    };
  } catch (e: any) {
    return { success: false, errorMessage: `Token refresh failed: ${e.message}` };
  }
}

// ── Core API caller ───────────────────────────────────────────────────────────

export interface LipApiResponse {
  ok: boolean;
  status: number;
  data: unknown;
}

/**
 * Make an authenticated call to the LIS LIP REST API.
 * Attaches Bearer token and APIM subscription key. The caller is responsible
 * for ensuring the accessToken is fresh (use refreshLipToken if needed).
 */
async function callLipApiWithKey(
  accessToken: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  subscriptionKey: string,
  body?: unknown,
): Promise<LipApiResponse> {
  const url = `${LIP_API_BASE}${path}`;
  const headers: Record<string, string> = {
    "Authorization": `Bearer ${accessToken}`,
    "Ocp-Apim-Subscription-Key": subscriptionKey,
    "Accept": "application/json",
    "LI-Request-Mode": "sync",
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data: unknown;
  const text = await res.text();
  try { data = JSON.parse(text); } catch { data = text; }
  return { ok: res.ok, status: res.status, data };
}

/** True if a response's subscription key was specifically rejected as invalid (not just unapproved). */
function isInvalidSubscriptionKeyResponse(res: LipApiResponse): boolean {
  if (res.status !== 401 && res.status !== 403) return false;
  const text = typeof res.data === "string" ? res.data : JSON.stringify(res.data ?? "");
  return /invalid subscription key/i.test(text);
}

/**
 * Make an authenticated call to the LIS LIP REST API.
 * Attaches Bearer token and APIM subscription key. The caller is responsible
 * for ensuring the accessToken is fresh (use refreshLipToken if needed).
 *
 * Automatically retries with the secondary subscription key
 * (LIS_LIP_SUBSCRIPTION_KEY_2) if the primary key is rejected as invalid —
 * verified live against the sandbox that the secondary key is currently the
 * one LIS has active (see comment on LIP_SUBSCRIPTION_KEY_FALLBACK above).
 */
export async function callLipApi(
  accessToken: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
): Promise<LipApiResponse> {
  const primary = await callLipApiWithKey(accessToken, method, path, LIP_SUBSCRIPTION_KEY, body);
  if (isInvalidSubscriptionKeyResponse(primary) && LIP_SUBSCRIPTION_KEY_FALLBACK) {
    return callLipApiWithKey(accessToken, method, path, LIP_SUBSCRIPTION_KEY_FALLBACK, body);
  }
  return primary;
}

/**
 * POST /movements requires multipart/form-data with a `movementData` part
 * (JSON-encoded movement object) and an optional `document` binary part.
 * Sending application/json causes a 415 Unsupported Media Type error.
 * Confirmed by LIS support reply 07/07/2026 and the published OpenAPI spec.
 */
async function callLipApiMultipartWithKey(
  accessToken: string,
  subscriptionKey: string,
  path: string,
  movementData: unknown,
): Promise<LipApiResponse> {
  const url = `${LIP_API_BASE}${path}`;
  const form = new FormData();
  form.append(
    "movementData",
    new Blob([JSON.stringify(movementData)], { type: "application/json" }),
    "movementData",
  );
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Ocp-Apim-Subscription-Key": subscriptionKey,
      "Accept": "application/json",
      "LI-Request-Mode": "sync",
    },
    body: form,
  });
  let data: unknown;
  const text = await res.text();
  try { data = JSON.parse(text); } catch { data = text; }
  return { ok: res.ok, status: res.status, data };
}

async function callLipApiMultipart(
  accessToken: string,
  path: string,
  movementData: unknown,
): Promise<LipApiResponse> {
  const primary = await callLipApiMultipartWithKey(accessToken, LIP_SUBSCRIPTION_KEY, path, movementData);
  if (isInvalidSubscriptionKeyResponse(primary) && LIP_SUBSCRIPTION_KEY_FALLBACK) {
    return callLipApiMultipartWithKey(accessToken, LIP_SUBSCRIPTION_KEY_FALLBACK, path, movementData);
  }
  return primary;
}

// ── Submission types ──────────────────────────────────────────────────────────

export interface LipSubmissionResult {
  sandbox: boolean;
  success: boolean;
  lipReference?: string;
  requestPayload: unknown;
  responsePayload?: unknown;
  errorMessage?: string;
  subscriptionPending?: boolean;
  /** Set when LIS returns 202 Accepted — the UUID to poll via GET /requeststatus/{id} */
  asyncRequestId?: string;
  /** True when the submission was accepted async (202) and outcome is not yet known */
  asyncPending?: boolean;
}

/**
 * When LIS returns 202 (Accepted) the request is processed asynchronously.
 * Response body follows AsyncAcceptedResponse: { id, requestStatus, requestDate }.
 * The `id` UUID is used to poll GET /requeststatus/{requestId} for the final outcome.
 */
function handle202Async(requestPayload: unknown, responseData: unknown): LipSubmissionResult {
  const d = responseData as { id?: string; requestStatus?: string } | null;
  const asyncRequestId = d?.id;
  const ref = asyncRequestId ?? `LIP-ASYNC-${Date.now()}`;
  return { sandbox: false, success: true, asyncPending: true, asyncRequestId, lipReference: ref, requestPayload, responsePayload: responseData };
}

/**
 * Detects whether a failed LIP API response indicates the APIM product
 * subscription for this endpoint is not yet approved/active, as opposed to a
 * genuine data/auth error. LIS's Alpha API has been observed to signal this
 * two different ways depending on endpoint: a plain 403, or a 401 whose body
 * explicitly complains about an invalid/inactive subscription key (this
 * happens even though the OAuth token and general reachability both work,
 * because each API product — movements/births/deaths — has its own separate
 * subscription that must be approved individually).
 */
function isSubscriptionPendingResponse(res: LipApiResponse): boolean {
  if (res.status === 403) return true;
  if (res.status === 401) {
    const text = typeof res.data === "string" ? res.data : JSON.stringify(res.data ?? "");
    return /subscription/i.test(text);
  }
  return false;
}

// ── Movement submission ───────────────────────────────────────────────────────

export interface LipMovementParams {
  accessToken: string;
  holdingCph: string;
  movementDate: string;         // YYYY-MM-DD
  movementType: "ON" | "OFF" | "BETWEEN";   // BETWEEN = in-business move
  fromCph: string;
  toCph: string;
  earTagNumbers?: string;       // newline/comma-separated UK ear tags
  numberOfAnimals: number;
  licenceNumber?: string;
  isInBusinessMove?: boolean;   // sets inBusinessMoveFlag on movement
  haulierName?: string;
  haulierVehicleReg?: string;
  haulierAuthorisationNumber?: string;
  haulierTrailerNumber?: string;
  fciDeclarationFlag?: boolean;
  fciDiseaseDetails?: string;
  fciTreatmentDetails?: string;
}

/**
 * Submit a cattle movement notification to the LIS LIP movement API.
 *
 * POST /movements requires multipart/form-data (not application/json).
 * The `movementData` part carries the JSON-encoded movement object.
 * Source: LIS published OpenAPI spec + LIS support reply 07/07/2026.
 *
 * Payload structure follows the published spec:
 *   movementKind  — "standard" for normal on/off movements (enum not published)
 *   state         — "preNotified" when originator is lodging the movement
 *   movementReports[].departure.site.identifiers — from CPH
 *   movementReports[].arrival.site.identifiers   — to CPH
 *   movementReports[].batches[].species           — "cattle"
 *   movementReports[].batches[].animals           — ear tags or quantity mark
 */
export async function submitLipMovement(params: LipMovementParams): Promise<LipSubmissionResult> {
  const tagList = params.earTagNumbers
    ? params.earTagNumbers.split(/[\s,\n]+/).filter(Boolean).map(t => t.trim())
    : [];

  const now = new Date().toISOString();

  const haulierBlock = (params.haulierName || params.haulierVehicleReg || params.haulierAuthorisationNumber)
    ? {
        name: params.haulierName,
        vehicleRegistrationNumber: params.haulierVehicleReg,
        authorisationNumber: params.haulierAuthorisationNumber,
        trailerNumber: params.haulierTrailerNumber,
      }
    : undefined;

  const fciBlock = (params.fciDeclarationFlag !== undefined)
    ? {
        declarationFlag: params.fciDeclarationFlag ?? false,
        ...(params.fciDiseaseDetails   ? { diseaseDetails:   params.fciDiseaseDetails }   : {}),
        ...(params.fciTreatmentDetails ? { treatmentDetails: params.fciTreatmentDetails } : {}),
      }
    : undefined;

  const movementData: Record<string, unknown> = {
    movementKind: "standard",
    state: "preNotified",
    ...(params.isInBusinessMove ? { inBusinessMoveFlag: true } : {}),
    movementReports: [
      {
        departure: {
          site: { identifiers: [{ identifier: params.fromCph }] },
          date: params.movementDate,
        },
        arrival: {
          site: { identifiers: [{ identifier: params.toCph }] },
          date: params.movementDate,
        },
        batches: [
          {
            species: "cattle",
            animals:
              tagList.length > 0
                ? tagList.map(tag => ({ animalIdentifier: tag }))
                : [{ quantity: params.numberOfAnimals }],
          },
        ],
      },
    ],
    ...(haulierBlock ? { haulier: haulierBlock } : {}),
    ...(fciBlock ? { fciInformation: fciBlock } : {}),
    createdDateTime: now,
    updatedDateTime: now,
  };

  // POST /movements uses multipart/form-data — see callLipApiMultipart.
  // Always attempt the real sandbox call so we detect when subscriptions are approved;
  // fall back to a provisional reference only when the API reports the subscription is
  // not yet active (403), not as a general "sandbox" default.
  const res = await callLipApiMultipart(params.accessToken, "/movements", movementData);

  if (!res.ok) {
    if (isSubscriptionPendingResponse(res)) {
      const ref = `LIP-SANDBOX-${Date.now()}`;
      console.log(`[LIP] ${res.status} — subscription pending; sandbox movement:`, JSON.stringify(movementData, null, 2));
      return { sandbox: true, success: true, lipReference: ref, requestPayload: movementData, responsePayload: res.data, subscriptionPending: true };
    }
    return {
      sandbox: false, success: false, requestPayload: movementData, responsePayload: res.data,
      errorMessage: `HTTP ${res.status}: ${typeof res.data === "string" ? res.data : JSON.stringify(res.data)}`,
    };
  }

  if (res.status === 202) return handle202Async(movementData, res.data);
  const d = res.data as Record<string, unknown>;
  const ref = String(d["movementNumber"] ?? d["reference"] ?? d["notificationRef"] ?? d["id"] ?? `LIP-${Date.now()}`);
  return { sandbox: false, success: true, lipReference: ref, requestPayload: movementData, responsePayload: d };
}

// ── Birth registration ────────────────────────────────────────────────────────

export interface LipBirthParams {
  accessToken: string;
  holdingCph: string;
  birthDate: string;            // YYYY-MM-DD
  calfEarTag?: string;          // UK ear tag, used as animal.identifier
  calfSex?: string;             // "male" | "female"
  calfBreed?: string;
  damEarTag?: string;
  assistanceRequired?: boolean; // → assistedBirthFlag
  numberOfCalves?: number;      // > 1 → multipleBirthsFlag
  conceptionMethod?: string;    // "embryo-transfer" → embryoTransferFlag
}

/**
 * Register a cattle birth with the LIS LIP Animals API.
 *
 * Endpoint: POST /animals  (application/json)
 * Source: LIS published OpenAPI spec + LIS support reply 07/07/2026.
 *   "Births will be under registering a new Animal"
 *
 * Required fields per spec:
 *   animal.identifier, registration.site, registration.date, registration.category
 * Optional birth details carried in the `birth` object.
 */
export async function submitLipBirth(params: LipBirthParams): Promise<LipSubmissionResult> {
  const isEmbryoTransfer = params.conceptionMethod === "embryo-transfer";
  const payload: Record<string, unknown> = {
    animal: {
      identifier: params.calfEarTag ?? `UNKNOWN-${Date.now()}`,
      species: "cattle",
      ...(params.calfSex ? { sex: params.calfSex } : {}),
    },
    ...(params.calfBreed ? { breed: { code: params.calfBreed } } : {}),
    birth: {
      site: { identifiers: [{ identifier: params.holdingCph }] },
      date: params.birthDate,
      year: parseInt(params.birthDate.slice(0, 4), 10),
      assistedBirthFlag: params.assistanceRequired ?? false,
      multipleBirthsFlag: (params.numberOfCalves ?? 1) > 1,
      embryoTransferFlag: isEmbryoTransfer,
    },
    registration: {
      site: { identifiers: [{ identifier: params.holdingCph }] },
      date: params.birthDate,
      category: "birthRegistration",
      ...(params.damEarTag ? {
        birthDam: { identifier: params.damEarTag, species: "cattle" },
        // For normal (non-ET) births, genetic dam = birth dam
        ...(!isEmbryoTransfer ? { geneticDam: { identifier: params.damEarTag, species: "cattle" } } : {}),
      } : {}),
    },
  };

  const res = await callLipApi(params.accessToken, "POST", "/animals", payload);

  if (!res.ok) {
    if (isSubscriptionPendingResponse(res)) {
      const ref = `LIP-BIRTH-SANDBOX-${Date.now()}`;
      return { sandbox: true, success: true, lipReference: ref, requestPayload: payload, responsePayload: res.data, subscriptionPending: true };
    }
    return {
      sandbox: false, success: false, requestPayload: payload, responsePayload: res.data,
      errorMessage: `HTTP ${res.status}: ${typeof res.data === "string" ? res.data : JSON.stringify(res.data)}`,
    };
  }

  if (res.status === 202) return handle202Async(payload, res.data);
  const d = res.data as Record<string, unknown>;
  const ref = String(d["identifier"] ?? d["reference"] ?? d["id"] ?? `LIP-BIRTH-${Date.now()}`);
  return { sandbox: false, success: true, lipReference: ref, requestPayload: payload, responsePayload: d };
}

// ── Death registration ────────────────────────────────────────────────────────

export interface LipDeathParams {
  accessToken: string;
  holdingCph: string;
  deathDate: string;            // YYYY-MM-DD
  earTag?: string;              // UK ear tag — used as animal identifier in PUT /animals/{identifier}
  sex?: string;                 // "male" | "female" — required by Animal schema
  birthDate?: string;           // YYYY-MM-DD — original birth date, needed for birthRegistration category in death PUT
  causeOfDeath?: string;
  deathReasonId?: string;       // UUID from GET /deathreasons — preferred over causeOfDeath name
  holdingCphUuid?: string;      // LIS internal UUID for the holding (CPH string not resolved in death.site)
  disposalMethod?: string;
  tseTestRequired?: boolean;    // → tseTestRequiredFlag on death record
}

// ── Lost & Found ──────────────────────────────────────────────────────────────

export type LipLostFoundStatus = "lost" | "found" | "stolen";

export interface LipLostFoundParams {
  accessToken: string;
  identifier: string;           // animal ear tag / identifier
  holdingCph: string;
  status: LipLostFoundStatus;
  eventDate: string;            // YYYY-MM-DD
  crimeReferenceNumber?: string;
  foundDead?: boolean;
}

/**
 * Report a lost, found or stolen animal to the LIS LIP API.
 * Endpoint: POST /lostfounds  (application/json)
 */
export async function submitLipLostFound(params: LipLostFoundParams): Promise<LipSubmissionResult> {
  const payload: Record<string, unknown> = {
    identifier: params.identifier,
    site: { identifiers: [{ identifier: params.holdingCph }] },
    status: params.status,
    eventDate: params.eventDate,
    ...(params.crimeReferenceNumber ? { crimeReferenceNumber: params.crimeReferenceNumber } : {}),
    ...(params.foundDead !== undefined ? { foundDead: params.foundDead } : {}),
  };

  const res = await callLipApi(params.accessToken, "POST", "/lostfounds", payload);

  if (!res.ok) {
    if (isSubscriptionPendingResponse(res)) {
      const ref = `LIP-LOSTFOUND-SANDBOX-${Date.now()}`;
      return { sandbox: true, success: true, lipReference: ref, requestPayload: payload, responsePayload: res.data, subscriptionPending: true };
    }
    return {
      sandbox: false, success: false, requestPayload: payload, responsePayload: res.data,
      errorMessage: `HTTP ${res.status}: ${typeof res.data === "string" ? res.data : JSON.stringify(res.data)}`,
    };
  }

  if (res.status === 202) return handle202Async(payload, res.data);
  const d = res.data as Record<string, unknown>;
  const ref = String(d["id"] ?? d["reference"] ?? `LIP-LOSTFOUND-${Date.now()}`);
  return { sandbox: false, success: true, lipReference: ref, requestPayload: payload, responsePayload: d };
}

// ── Movement confirmation / cancellation ──────────────────────────────────────

export interface LipConfirmMovementParams {
  accessToken: string;
  movementNumber: number | string;
  action: "accept" | "reject";
  rejectionReasonId?: string;
  rejectionReason?: string;
}

/**
 * Confirm or reject a movement as the receiving counterparty.
 * Endpoint: POST /movements/{movementNumber}/confirmations  (application/json)
 */
export async function confirmLipMovement(params: LipConfirmMovementParams): Promise<LipSubmissionResult> {
  const payload: Record<string, unknown> = {
    action: params.action,
    ...(params.action === "reject" && params.rejectionReasonId ? { rejectionReasonId: params.rejectionReasonId } : {}),
    ...(params.action === "reject" && params.rejectionReason ? { rejectionReason: params.rejectionReason } : {}),
  };

  const res = await callLipApi(params.accessToken, "POST", `/movements/${params.movementNumber}/confirmations`, payload);

  if (!res.ok) {
    if (isSubscriptionPendingResponse(res)) {
      const ref = `LIP-CONFIRM-SANDBOX-${Date.now()}`;
      return { sandbox: true, success: true, lipReference: ref, requestPayload: payload, responsePayload: res.data, subscriptionPending: true };
    }
    return {
      sandbox: false, success: false, requestPayload: payload, responsePayload: res.data,
      errorMessage: `HTTP ${res.status}: ${typeof res.data === "string" ? res.data : JSON.stringify(res.data)}`,
    };
  }

  const d = res.data as Record<string, unknown>;
  return { sandbox: false, success: true, lipReference: String(params.movementNumber), requestPayload: payload, responsePayload: d };
}

/**
 * Cancel (delete) a previously submitted movement.
 * Endpoint: DELETE /movements/{movementNumber}  (sync or async)
 */
export async function cancelLipMovement(
  accessToken: string,
  movementNumber: number | string,
): Promise<LipSubmissionResult> {
  const payload = { movementNumber };
  const res = await callLipApi(accessToken, "DELETE", `/movements/${movementNumber}`);

  if (!res.ok) {
    if (isSubscriptionPendingResponse(res)) {
      const ref = `LIP-CANCEL-SANDBOX-${Date.now()}`;
      return { sandbox: true, success: true, lipReference: ref, requestPayload: payload, responsePayload: res.data, subscriptionPending: true };
    }
    return {
      sandbox: false, success: false, requestPayload: payload, responsePayload: res.data,
      errorMessage: `HTTP ${res.status}: ${typeof res.data === "string" ? res.data : JSON.stringify(res.data)}`,
    };
  }

  return { sandbox: false, success: true, lipReference: String(movementNumber), requestPayload: payload, responsePayload: res.data };
}

/**
 * Register a cattle death with the LIS LIP Animals API.
 *
 * Endpoint: PUT /animals/{identifier}  (application/json)
 * Source: LIS published OpenAPI spec + LIS support reply 07/07/2026.
 *   "Death are covered under Updating an animal"
 *
 * The `death` object is set in the PUT body. The animal is identified by
 * the UK ear tag number in the URL path.
 * If no ear tag is known, falls back to a sandbox reference without calling the API.
 */
export async function submitLipDeath(params: LipDeathParams): Promise<LipSubmissionResult> {
  if (!params.earTag) {
    const ref = `LIP-DEATH-SANDBOX-${Date.now()}`;
    const payload = { note: "No ear tag — cannot call PUT /animals/{identifier}", deathDate: params.deathDate, holdingCph: params.holdingCph };
    console.log("[LIP] Death submission skipped — no ear tag provided");
    return { sandbox: true, success: false, requestPayload: payload, errorMessage: "No ear tag provided for death submission — PUT /animals/{identifier} requires a valid animal identifier" };
  }

  const payload: Record<string, unknown> = {
    animal: {
      identifier: params.earTag,
      species: "cattle",
      sex: params.sex ?? "male",
    },
    registration: {
      // category "registration" required for death.site CPH to resolve (birthRegistration = " ").
      // registration.date must differ from the animal's stored birth date to avoid V052
      // "The Birth Date has been updated before" — in production, death date != birth date.
      site: { type: { type: "agriculturalHolding" }, identifiers: [{ identifier: params.holdingCph }] } as any,
      date: params.deathDate,
      category: "registration",
    },
    death: {
      date: params.deathDate,
      // site.type agriculturalHolding required; without it the CPH resolves to " " in death context.
      site: { type: { type: "agriculturalHolding" }, identifiers: [{ identifier: params.holdingCph }] } as any,
      // reason requires a valid UUID from GET /deathreasons — omit if not provided
      ...(params.deathReasonId ? { reason: { id: params.deathReasonId } } : {}),
      ...(params.tseTestRequired !== undefined ? { tseTestRequiredFlag: params.tseTestRequired } : {}),
    },
  };

  const identifier = encodeURIComponent(params.earTag);
  const res = await callLipApi(params.accessToken, "PUT", `/animals/${identifier}`, payload);

  if (!res.ok) {
    if (isSubscriptionPendingResponse(res)) {
      const ref = `LIP-DEATH-SANDBOX-${Date.now()}`;
      return { sandbox: true, success: true, lipReference: ref, requestPayload: payload, responsePayload: res.data, subscriptionPending: true };
    }
    return {
      sandbox: false, success: false, requestPayload: payload, responsePayload: res.data,
      errorMessage: `HTTP ${res.status}: ${typeof res.data === "string" ? res.data : JSON.stringify(res.data)}`,
    };
  }

  if (res.status === 202) return handle202Async(payload, res.data);
  const d = res.data as Record<string, unknown>;
  const ref = String(d["identifier"] ?? d["reference"] ?? d["id"] ?? `LIP-DEATH-${Date.now()}`);
  return { sandbox: false, success: true, lipReference: ref, requestPayload: payload, responsePayload: d };
}

// ── Rejection reason lookup ───────────────────────────────────────────────────

export interface LipRejectionReason {
  rejectionReasonId: string;
  rejectionReason: string;
}

/**
 * Fetch all movement rejection reasons from the LIS LIP API.
 * Endpoint: GET /rejectionreasons
 * Used to populate the reject-movement dialog dropdown.
 * Returns an empty array on any error so the UI gracefully falls back to free text.
 */
export async function getLipRejectionReasons(accessToken: string): Promise<LipRejectionReason[]> {
  const res = await callLipApi(accessToken, "GET", "/rejectionreasons");
  if (!res.ok) return [];
  const data = res.data as { count?: number; values?: LipRejectionReason[] } | null;
  return data?.values ?? [];
}

// ── Async request status polling ──────────────────────────────────────────────

export interface LipRequestStatusResult {
  /** "Pending" | "Completed" | "Failed" (LIS-defined enum values) */
  status: string;
  /** Resolved reference once Completed — movementNumber for movements, identifier for animals */
  lipReference?: string;
  /** Raw result payload from LIS */
  result?: Record<string, unknown>;
  errorMessage?: string;
}

/**
 * Check the status of an async LIS LIP request submitted with a 202 response.
 * Endpoint: GET /requeststatus/{requestId}
 * Response: RequestStatus { status: AsyncRequestStatus, result: MovementResponse1 | AnimalResponse }
 */
export async function checkLipRequestStatus(accessToken: string, requestId: string): Promise<LipRequestStatusResult> {
  const res = await callLipApi(accessToken, "GET", `/requeststatus/${encodeURIComponent(requestId)}`);
  if (!res.ok) {
    return {
      status: "Unknown",
      errorMessage: `HTTP ${res.status}: ${typeof res.data === "string" ? res.data : JSON.stringify(res.data)}`,
    };
  }
  const data = res.data as { status?: string; result?: Record<string, unknown> } | null;
  const result = data?.result ?? {};
  const movementNumber = result["movementNumber"] != null ? String(result["movementNumber"]) : undefined;
  const identifier    = result["identifier"]    != null ? String(result["identifier"])    : undefined;
  return {
    status: data?.status ?? "Unknown",
    lipReference: movementNumber ?? identifier,
    result,
  };
}
