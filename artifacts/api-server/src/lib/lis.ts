/**
 * LIS — Livestock Information Service adapter
 *
 * The Livestock Information Service (LIS) provides a REST/JSON API called the
 * Common Livestock Application (CLA) API for submitting sheep, goat and deer
 * movement reports in England. Authentication uses Azure B2C with a
 * Resource Owner Password Credentials (ROPC) flow — the farmer's LIS username
 * and password are exchanged for an access token, which is then used with a
 * platform subscription key on every API call.
 *
 * Production credentials required (set as environment variables):
 *   LIS_SUBSCRIPTION_KEY  — BDE's vendor subscription key from the LIS Developer Hub
 *                           (register at livestockinformation.org.uk/developer-hub)
 *
 * When that is absent the adapter runs in SANDBOX mode: it builds the request
 * payload exactly as it would for production, logs it, and returns a simulated
 * acknowledgement. This lets farmers configure their LIS credentials and test
 * the full flow before BDE completes developer hub registration.
 *
 * LIS Developer Hub:   https://developers.livestockinformation.org.uk
 * CLA API base URL:    https://api.cla.livestockinformation.org.uk
 * Azure B2C tenant (prod):    livestockinformation.b2clogin.com
 * Azure B2C tenant (sandbox): livestockinformationb2cprod.b2clogin.com
 * Policy (both):              B2C_1_ROPC_Auth
 */

// Auth uses the standard AAD v2 endpoint (login.microsoftonline.com), NOT b2clogin.com / B2C_1A_SIGNIN.
// B2C_1A_SIGNIN is interactive-only; ROPC (grant_type=password) returns AADB2C90057 against it.
// Do NOT include "openid" in scope — it triggers implicit-flow errors on B2C policies.
const LIS_B2C_TOKEN_URL_PROD =
  "https://login.microsoftonline.com/livestockinformation.onmicrosoft.com/oauth2/v2.0/token";
const LIS_B2C_SCOPE_PROD =
  "https://livestockinformation.onmicrosoft.com/apim-cla-ext/user_impersonation offline_access";

// Sandbox/Beta B2C tenant
const LIS_B2C_TOKEN_URL_SANDBOX =
  "https://login.microsoftonline.com/livestockinformationb2cprod.onmicrosoft.com/oauth2/v2.0/token";
const LIS_B2C_SCOPE_SANDBOX =
  "https://livestockinformationb2cprod.onmicrosoft.com/apim-cla-ext/user_impersonation offline_access";

// ── Authorization Code Flow endpoints (B2C interactive sign-in policy) ────────
// These are the b2clogin.com policy-specific URLs — used for authorization code
// exchange, NOT for ROPC (ROPC goes via login.microsoftonline.com above).
// B2C_1A_SIGNIN is the interactive sign-in policy; confirmed as returning
// AADB2C90057 for ROPC which proves it IS the correct interactive policy name.
const LIS_B2C_AUTHORIZE_URL_PROD =
  "https://livestockinformation.b2clogin.com/livestockinformation.onmicrosoft.com/B2C_1A_SIGNIN/oauth2/v2.0/authorize";
const LIS_B2C_TOKEN_URL_POLICY_PROD =
  "https://livestockinformation.b2clogin.com/livestockinformation.onmicrosoft.com/B2C_1A_SIGNIN/oauth2/v2.0/token";

const LIS_B2C_AUTHORIZE_URL_SANDBOX =
  "https://livestockinformationb2cprod.b2clogin.com/livestockinformationb2cprod.onmicrosoft.com/B2C_1A_SIGNIN/oauth2/v2.0/authorize";
const LIS_B2C_TOKEN_URL_POLICY_SANDBOX =
  "https://livestockinformationb2cprod.b2clogin.com/livestockinformationb2cprod.onmicrosoft.com/B2C_1A_SIGNIN/oauth2/v2.0/token";

function isSandboxApi(): boolean {
  return process.env.LIS_USE_SANDBOX_API === "true";
}

const LIS_B2C_TOKEN_URL      = isSandboxApi() ? LIS_B2C_TOKEN_URL_SANDBOX : LIS_B2C_TOKEN_URL_PROD;
const LIS_B2C_SCOPE          = isSandboxApi() ? LIS_B2C_SCOPE_SANDBOX      : LIS_B2C_SCOPE_PROD;
const LIS_B2C_CLIENT_ID      = process.env.LIS_B2C_CLIENT_ID ?? "lis-cla-public";
// Primary client secret (confidential client). Without this Azure AD rejects ROPC for
// app registrations that have secrets configured (AADSTS50105).
const LIS_B2C_CLIENT_SECRET  = process.env.LIS_B2C_PRIMARY_SECRET ?? "";

// Correct CLA API gateway from LIS Developer Hub (api-url field, June 2026).
// The /v1.0 version prefix is part of the base — do NOT add /v1/ to individual paths.
const LIS_API_BASE = "https://cla.api.livestockinformation.org.uk/v1.0";
const LIS_API_BASE_SANDBOX = "https://ext-cla.api.livestockinformation.org.uk/v1.0";

/**
 * When LIS_PROXY_URL is set (e.g. https://lis-proxy.bdefarmtrac.co.uk), all
 * LIS calls are forwarded to the UK proxy instead of hitting the LIS APIs
 * directly (which are unreachable from Replit's US infrastructure).
 *
 * The proxy exposes:
 *   POST <proxy>/lis/token       — B2C token exchange
 *   POST <proxy>/lis/cla/*       — CLA API (adds subscription key server-side)
 *
 * A shared secret is sent in X-Proxy-Secret to prevent public access.
 */
function proxyUrl(): string | null {
  return process.env.LIS_PROXY_URL?.replace(/\/$/, "") ?? null;
}

function proxyHeaders(): Record<string, string> {
  const secret = process.env.LIS_PROXY_SECRET;
  return secret ? { "X-Proxy-Secret": secret } : {};
}

export function isLisSandboxMode(): boolean {
  return !process.env.LIS_SUBSCRIPTION_KEY;
}

export type LisSpecies = "SHEEP" | "GOAT" | "DEER";
export type LisMovementType = "movement_off" | "movement_on" | "birth" | "death";

export interface LisMovementRequest {
  lisUsername: string;
  lisPassword: string;
  accessToken?: string;
  movementType: LisMovementType;
  movementDate: string;
  species: LisSpecies;
  numberOfAnimals: number;
  departureCph?: string;
  destinationCph?: string;
  flockMark?: string;
  earTagNumbers?: string;
  licenceNumber?: string;
  fromLocation?: string;
  toLocation?: string;
}

export interface LisResult {
  sandbox: boolean;
  success: boolean;
  reference?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  requestPayload?: string;
  responsePayload?: string;
  errorMessage?: string;
}

export interface LisTokenResult {
  sandbox: boolean;
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  errorMessage?: string;
}

function simulatedReference(): string {
  return `LIS-SANDBOX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

/**
 * Build the LIS B2C authorization URL for the OAuth authorization code flow.
 * The `state` parameter is an opaque nonce generated and stored server-side
 * to prevent CSRF. The `redirectUri` must match a URI registered with LIS
 * in the app registration for client_id LIS_B2C_CLIENT_ID.
 */
export function buildLisAuthUrl(state: string, redirectUri: string): string {
  const sandbox = isSandboxApi();
  const authorizeUrl = sandbox ? LIS_B2C_AUTHORIZE_URL_SANDBOX : LIS_B2C_AUTHORIZE_URL_PROD;
  const scope = sandbox ? LIS_B2C_SCOPE_SANDBOX : LIS_B2C_SCOPE_PROD;
  const params = new URLSearchParams({
    client_id: LIS_B2C_CLIENT_ID,
    response_type: "code",
    redirect_uri: redirectUri,
    scope,
    state,
    response_mode: "query",
    prompt: "login",
  });
  return `${authorizeUrl}?${params.toString()}`;
}

/**
 * Exchange an OAuth authorization code for access + refresh tokens.
 * Uses the B2C policy-specific token endpoint (b2clogin.com) with
 * grant_type=authorization_code and the app's client_secret.
 */
export async function exchangeLisCode(code: string, redirectUri: string): Promise<LisTokenResult> {
  const sandbox = isSandboxApi();
  const tokenUrl = sandbox ? LIS_B2C_TOKEN_URL_POLICY_SANDBOX : LIS_B2C_TOKEN_URL_POLICY_PROD;
  const scope = sandbox ? LIS_B2C_SCOPE_SANDBOX : LIS_B2C_SCOPE_PROD;

  try {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: LIS_B2C_CLIENT_ID,
      code,
      redirect_uri: redirectUri,
      scope,
    });
    if (LIS_B2C_CLIENT_SECRET) body.append("client_secret", LIS_B2C_CLIENT_SECRET);

    const res = await fetch(tokenUrl, {
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
        errorMessage: `B2C returned non-JSON (HTTP ${res.status}). The redirect_uri may not be registered in the LIS app registration, or the B2C policy name is wrong. Response: ${text.slice(0, 300)}`,
      };
    }

    const data = JSON.parse(text) as Record<string, unknown>;
    if (!res.ok || data["error"]) {
      return {
        sandbox,
        success: false,
        errorMessage: (data["error_description"] as string) ?? (data["error"] as string) ?? `HTTP ${res.status}`,
      };
    }

    return {
      sandbox,
      success: true,
      accessToken: data["access_token"] as string,
      refreshToken: (data["refresh_token"] as string | undefined),
      expiresIn: data["expires_in"] as number | undefined,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Token exchange failed";
    return { sandbox, success: false, errorMessage: msg };
  }
}

/**
 * Obtain an Azure B2C access token using ROPC flow.
 * In sandbox mode returns a simulated token.
 * @deprecated Prefer OAuth authorization code flow (buildLisAuthUrl / exchangeLisCode).
 *   ROPC is kept as a fallback for farms that stored credentials before the OAuth migration.
 */
export async function fetchLisToken(username: string, password: string): Promise<LisTokenResult> {
  if (isLisSandboxMode()) {
    return {
      sandbox: true,
      success: true,
      accessToken: `SANDBOX_TOKEN_${Date.now()}`,
      refreshToken: `SANDBOX_REFRESH_${Date.now()}`,
      expiresIn: 3600,
    };
  }

  const proxy = proxyUrl();

  // ── Route through UK proxy if configured ──────────────────────────────────
  if (proxy) {
    try {
      const res = await fetch(`${proxy}/lis/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...proxyHeaders() },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json() as any;
      if (!res.ok || data.error) {
        return {
          sandbox: false,
          success: false,
          errorMessage: data.error_description ?? data.error ?? data.message ?? `HTTP ${res.status}`,
        };
      }
      return {
        sandbox: false,
        success: true,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      };
    } catch (err: any) {
      return { sandbox: false, success: false, errorMessage: `UK proxy unreachable: ${err?.message}` };
    }
  }

  // ── Direct call (requires UK network) ────────────────────────────────────
  try {
    const body = new URLSearchParams({
      grant_type: "password",
      client_id: LIS_B2C_CLIENT_ID,
      scope: LIS_B2C_SCOPE,
      username,
      password,
    });
    if (LIS_B2C_CLIENT_SECRET) body.append("client_secret", LIS_B2C_CLIENT_SECRET);

    const res = await fetch(LIS_B2C_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return {
        sandbox: false,
        success: false,
        errorMessage:
          `LIS authentication endpoint returned a non-JSON response (HTTP ${res.status}). ` +
          `The B2C tenant or policy name may be incorrect, or the LIS API may not be accessible from this server's network. ` +
          `The LIS API is only reachable from UK-based infrastructure — deploy to a UK server to test a live connection.`,
      };
    }

    const data = await res.json() as any;

    if (!res.ok || data.error) {
      return {
        sandbox: false,
        success: false,
        errorMessage: data.error_description ?? data.error ?? `HTTP ${res.status}`,
      };
    }

    return {
      sandbox: false,
      success: true,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  } catch (err: any) {
    const isNetworkError =
      err?.cause?.code === "ENOTFOUND" ||
      err?.code === "ENOTFOUND" ||
      (err?.message as string)?.includes("ENOTFOUND") ||
      (err?.message as string)?.includes("fetch failed");
    if (isNetworkError) {
      return {
        sandbox: false,
        success: false,
        errorMessage:
          "Cannot reach LIS API from this server. The LIS API is only accessible from UK-based infrastructure. " +
          "Deploy to a UK server to test a live connection.",
      };
    }
    return { sandbox: false, success: false, errorMessage: err?.message ?? "Network error fetching token" };
  }
}

/**
 * Refresh an existing Azure B2C access token using the refresh token.
 */
export async function refreshLisToken(refreshToken: string): Promise<LisTokenResult> {
  if (isLisSandboxMode()) {
    return {
      sandbox: true,
      success: true,
      accessToken: `SANDBOX_TOKEN_${Date.now()}`,
      refreshToken: `SANDBOX_REFRESH_${Date.now()}`,
      expiresIn: 3600,
    };
  }

  const proxy = proxyUrl();

  // ── Try proxy refresh first, fall through to direct B2C if it fails ─────────
  if (proxy) {
    try {
      const res = await fetch(`${proxy}/lis/token/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...proxyHeaders() },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await res.json() as any;
      if (res.ok && !data.error && data.access_token) {
        return {
          sandbox: false,
          success: true,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in,
        };
      }
      // Proxy returned an error — fall through to direct B2C refresh below
    } catch {
      // Proxy unreachable — fall through to direct B2C refresh below
    }
  }

  // ── Direct B2C token refresh (fallback or no proxy configured) ───────────────
  // IMPORTANT: Only use the B2C *policy* endpoints (b2clogin.com/B2C_1A_SIGNIN).
  // The standard AAD endpoints (login.microsoftonline.com) may accept the refresh
  // token but issue a token without the CLA APIM user_impersonation scope, which
  // causes 401 "Unauthorized. Access token is missing or invalid." on every CLA
  // API call. Do NOT fall back to login.microsoftonline.com for LIS tokens.
  const refreshEndpoints = [
    { url: LIS_B2C_TOKEN_URL_POLICY_SANDBOX, scope: LIS_B2C_SCOPE_SANDBOX, sandbox: true },
    { url: LIS_B2C_TOKEN_URL_POLICY_PROD,    scope: LIS_B2C_SCOPE_PROD,    sandbox: false },
  ];

  let lastError = "Token refresh failed — no B2C endpoint accepted the refresh token";

  for (const endpoint of refreshEndpoints) {
    try {
      const body = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: LIS_B2C_CLIENT_ID,
        refresh_token: refreshToken,
        scope: endpoint.scope,
      });
      if (LIS_B2C_CLIENT_SECRET) body.append("client_secret", LIS_B2C_CLIENT_SECRET);

      const res = await fetch(endpoint.url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      const data = await res.json() as any;

      if (res.ok && !data.error && data.access_token) {
        return {
          sandbox: endpoint.sandbox,
          success: true,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in,
        };
      }
      // Record error and try next endpoint
      lastError = data.error_description ?? data.error ?? `HTTP ${res.status}`;
    } catch (err: any) {
      lastError = err?.message ?? "Network error";
    }
  }

  return { sandbox: false, success: false, errorMessage: lastError };
}

/**
 * Build the CLA API movement request body.
 */
function buildMovementPayload(req: LisMovementRequest): object {
  // CLA OData endpoint: POST /TransferRequests with { content: { ...TransferModel } } wrapper.
  // ALL field names confirmed via live LIS CLA API + GET /TransferRequests?$expand=content (July 2026).
  //
  // TransferModel: transferDate ✅  species (title-case) ✅  userHolding ✅  sourceHolding ✅
  //               destinationHolding ✅  animalCount ✅  movementGroups ✅
  //
  // MovementGroup: devices ✅ (individual ear tags — preferred)
  //               batches ✅ (flock-mark batch — fallback)
  //
  // Device (individual animal): { tagNumber } ✅  (rfid auto-populated by LIS from tagNumber)
  // Batch: { batchNumber (flock mark e.g. "UK130181"), animalTotal } ✅
  //
  // species strings: 'Sheep' | 'Goats' (plural!) | 'Deer'
  // userHolding = farm's own CPH (sourceHolding for off, destinationHolding for on)
  // animalCount at TransferModel level = total number of animals (NOT in MovementGroup/Batch)

  // species strings confirmed via live POST /TransferRequests (July 2026):
  // "Sheep" ✅  "Goats" ✅ (plural — "Goat" returns UNKNOWN)  "Deer" ✅
  const speciesMap: Record<LisSpecies, string> = {
    SHEEP: "Sheep",
    GOAT: "Goats",  // NB: plural — singular "Goat" is treated as UNKNOWN by LIS
    DEER: "Deer",
  };

  const departureCph = req.departureCph ?? req.fromLocation ?? "";
  const destinationCph = req.destinationCph ?? req.toLocation ?? "";

  // userHolding = the holding that belongs to this user (the farm submitting).
  // For movement_off the farm is the source; for movement_on the farm is the destination.
  const userHolding = req.movementType === "movement_on" ? destinationCph : departureCph;

  const animalCount = req.numberOfAnimals;

  // ── Individual ear-tag submission (preferred) ────────────────────────────
  // When ear tag numbers are provided, submit as individual devices.
  // Device tagNumber format: UK013018100001 (LIS auto-populates rfid from this).
  const earTags = req.earTagNumbers
    ? req.earTagNumbers.split(/[\s,]+/).filter(Boolean).map(t => t.trim())
    : [];

  if (earTags.length > 0) {
    return {
      transferDate: req.movementDate,
      species: speciesMap[req.species] ?? req.species,
      userHolding,
      sourceHolding: departureCph,
      destinationHolding: destinationCph,
      animalCount,
      movementGroups: [{ devices: earTags.map(tagNumber => ({ tagNumber })) }],
    };
  }

  // ── Batch / flock-mark fallback ──────────────────────────────────────────
  // When no individual ear tags: use flock mark as batchNumber.
  // Flock mark = "UK" + flock-code-without-leading-zeros (e.g. "UK130181").
  // Derived from earTag UK013018100001 → chars 2-8 "0130181" → strip leading zero → "UK130181".
  const batchNumber = req.flockMark ?? "";

  const batch: Record<string, unknown> = { animalTotal: animalCount };
  if (batchNumber) batch.batchNumber = batchNumber;

  return {
    transferDate: req.movementDate,
    species: speciesMap[req.species] ?? req.species,
    userHolding,
    sourceHolding: departureCph,
    destinationHolding: destinationCph,
    animalCount,
    movementGroups: [{ batches: [batch] }],
  };
}

/**
 * Submit a livestock movement to the LIS CLA API.
 * Returns a sandbox simulation when LIS_SUBSCRIPTION_KEY is not configured.
 */
export async function submitLisMovement(req: LisMovementRequest): Promise<LisResult> {
  const payload = buildMovementPayload(req);
  const payloadStr = JSON.stringify(payload, null, 2);

  if (isLisSandboxMode()) {
    console.log("[LIS SANDBOX] Would submit the following payload to LIS CLA API:");
    console.log(payloadStr);
    return {
      sandbox: true,
      success: true,
      reference: simulatedReference(),
      requestPayload: payloadStr,
      responsePayload: JSON.stringify({ status: "SANDBOX_OK", movementId: simulatedReference() }),
    };
  }

  const token = req.accessToken;

  if (!token) {
    return { sandbox: false, success: false, requestPayload: payloadStr, errorMessage: "No LIS access token available — please reconnect your LIS account." };
  }

  // LIS CLA OData API: movement submissions go to POST /TransferRequests.
  // All POST bodies must use the { content: { ... } } wrapper (confirmed working pattern).
  // Note: POST /movements (v1) was the old path and returns 404 — not a valid CLA endpoint.
  const wrappedPayload = { content: payload };

  try {
    const result = await callLisApi(token, "/TransferRequests", "POST", wrappedPayload);

    if (!result.ok) {
      const errData = result.data as any;
      const errMsg = errData?.message ?? errData?.error?.message ?? result.raw.slice(0, 200) ?? `HTTP ${result.status}`;
      return {
        sandbox: false,
        success: false,
        requestPayload: JSON.stringify(wrappedPayload, null, 2),
        responsePayload: result.raw,
        errorMessage: errMsg,
      };
    }

    const responseData = result.data as any;
    const reference =
      responseData?.movementDocument?.movementDocumentRef ??          // Official CLA document ref (preferred)
      responseData?.content?.movementDocument?.movementDocumentRef ?? // content-wrapped variant
      responseData?.content?.requestId ??
      responseData?.content?.id ??
      responseData?.requestId ??
      responseData?.id ??
      responseData?.reference;

    return {
      sandbox: false,
      success: true,
      reference: String(reference ?? ""),
      requestPayload: JSON.stringify(wrappedPayload, null, 2),
      responsePayload: result.raw,
    };
  } catch (err: any) {
    return { sandbox: false, success: false, requestPayload: payloadStr, errorMessage: err?.message ?? "Network error" };
  }
}

/**
 * Make an authenticated call to the LIS CLA API via the UK proxy.
 * Supports any HTTP method. Returns status, parsed data, and raw response text.
 */
export async function callLisApi(
  accessToken: string,
  path: string,
  method: string = "GET",
  body?: object,
): Promise<{ ok: boolean; status: number; data: unknown; raw: string }> {
  const proxy = proxyUrl();

  if (!proxy) {
    return { ok: false, status: 0, data: null, raw: "No UK proxy configured (LIS_PROXY_URL not set)" };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`,
    ...proxyHeaders(),
  };

  try {
    const res = await fetch(`${proxy}/lis/cla${path}`, {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const raw = await res.text();
    let data: unknown;
    try { data = JSON.parse(raw); } catch { data = raw; }
    return { ok: res.ok, status: res.status, data, raw };
  } catch (err: any) {
    return { ok: false, status: 0, data: null, raw: err?.message ?? "Network error" };
  }
}

/**
 * Test connectivity and credentials against LIS.
 * In sandbox mode simulates a successful test.
 */
export async function testLisConnection(username: string, password: string): Promise<LisResult> {
  if (isLisSandboxMode()) {
    return {
      sandbox: true,
      success: true,
      responsePayload: JSON.stringify({ status: "SANDBOX_TEST_OK" }),
    };
  }

  const tokenResult = await fetchLisToken(username, password);
  if (!tokenResult.success) {
    return {
      sandbox: false,
      success: false,
      errorMessage: tokenResult.errorMessage ?? "Authentication failed",
    };
  }

  return {
    sandbox: false,
    success: true,
    accessToken: tokenResult.accessToken,
    refreshToken: tokenResult.refreshToken,
    tokenExpiresAt: tokenResult.expiresIn ? new Date(Date.now() + tokenResult.expiresIn * 1000) : undefined,
    responsePayload: JSON.stringify({ status: "CONNECTED" }),
  };
}

// ─── CLA OData — Review / Undo ────────────────────────────────────────────

/**
 * POST /ReviewHoldingMovementRequests
 * Accept or reject an inbound movement that another keeper submitted to our holding.
 * `isAccepted=true`  → accept the whole movement.
 * `isAccepted=false` → reject the whole movement.
 */
export async function reviewHoldingMovement(
  accessToken: string,
  params: {
    requestId: number;
    holding: string;
    isAccepted: boolean;
    arrivalDate: string;
    animalTotal: number;
  },
): Promise<{ ok: boolean; errorMessage?: string }> {
  if (isLisSandboxMode()) {
    return { ok: true };
  }
  const payload = {
    content: {
      holding: params.holding,
      reviewMovement: {
        requestId: params.requestId,
        isAccepted: params.isAccepted,
        arrivalDate: params.arrivalDate,
        animalTotal: params.animalTotal,
        acceptedDevices: [],
        rejectedDevices: [],
        acceptedBatches: [],
        rejectedBatches: [],
      },
    },
  };
  const res = await callLisApi(accessToken, "/ReviewHoldingMovementRequests", "POST", payload);
  if (!res.ok) {
    const msg = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
    return { ok: false, errorMessage: `HTTP ${res.status}: ${msg}` };
  }
  return { ok: true };
}

// ─── Animal Registration — Births & Deaths ───────────────────────────────────
//
// LIS CLA REST API: births → POST /animals, deaths → PUT /animals/{identifier}.
// These are DIFFERENT from the OData TransferRequests endpoint used for movements.
// Confirmed by LIS CLA support (July 2026):
//   "Births will be under registering a new Animal"
//   "Death are covered under Updating an animal"
//
// Species enum (REST API — all lowercase, matches OpenAPI spec):
//   "sheep" | "goats" | "deer" | "cattle" | "bison" | "buffalo"
// Note: "goats" is PLURAL in the spec (unlike movements OData which uses "Goats").

const CLA_ANIMAL_SPECIES_MAP: Record<LisSpecies, string> = {
  SHEEP: "sheep",
  GOAT:  "goats",  // plural — matches spec enum
  DEER:  "deer",
};

export interface LisBirthParams {
  accessToken: string;
  holdingCph: string;          // CPH of holding where animal was born
  birthDate: string;           // YYYY-MM-DD
  species: LisSpecies;
  earTag: string;              // single UK ear tag — submit one per animal
  sex?: "male" | "female";    // required by spec — defaults to "female" if unknown
  assistedBirth?: boolean;
  multipleBirth?: boolean;     // true for twins / triplets
  breed?: string;              // breed code from GET /breeds
}

/**
 * Register a livestock birth with the LIS CLA Animals API.
 * Endpoint: POST /animals
 * One call per ear tag; caller loops over tags for multiple births.
 */
export async function submitLisBirth(params: LisBirthParams): Promise<LisResult> {
  const speciesValue = CLA_ANIMAL_SPECIES_MAP[params.species] ?? params.species.toLowerCase();
  const site = { identifiers: [{ identifier: params.holdingCph }] };

  const payloadObj: Record<string, unknown> = {
    animal: {
      identifier: params.earTag,
      species: speciesValue,
      sex: params.sex ?? "female",
    },
    ...(params.breed ? { breed: { code: params.breed } } : {}),
    birth: {
      site,
      date: params.birthDate,
      year: parseInt(params.birthDate.slice(0, 4), 10),
      assistedBirthFlag:  params.assistedBirth  ?? false,
      multipleBirthsFlag: params.multipleBirth   ?? false,
      embryoTransferFlag: false,
    },
    registration: {
      site,
      date: params.birthDate,
      category: "birthRegistration",
    },
  };
  const payloadStr = JSON.stringify(payloadObj, null, 2);

  if (isLisSandboxMode()) {
    console.log("[LIS SANDBOX] Birth payload:", payloadStr);
    return {
      sandbox: true, success: true,
      reference: simulatedReference(),
      requestPayload: payloadStr,
      responsePayload: JSON.stringify({ status: "SANDBOX_OK" }),
    };
  }

  try {
    const result = await callLisApi(params.accessToken, "/animals", "POST", payloadObj);
    if (!result.ok) {
      const errMsg = (result.data as any)?.message ?? result.raw.slice(0, 300) ?? `HTTP ${result.status}`;
      return { sandbox: false, success: false, requestPayload: payloadStr, responsePayload: result.raw, errorMessage: errMsg };
    }
    const d = result.data as any;
    const ref = d?.identifier ?? d?.reference ?? d?.id ?? params.earTag;
    return { sandbox: false, success: true, reference: String(ref), requestPayload: payloadStr, responsePayload: result.raw };
  } catch (err: any) {
    return { sandbox: false, success: false, requestPayload: payloadStr, errorMessage: err?.message ?? "Network error" };
  }
}

export interface LisDeathParams {
  accessToken: string;
  holdingCph: string;          // CPH of holding where animal died
  deathDate: string;           // YYYY-MM-DD
  species: LisSpecies;
  earTag: string;              // single UK ear tag — used as path identifier
  sex?: "male" | "female";    // required by spec — defaults to "female" if unknown
  deathReasonId?: string;      // UUID from GET /deathreasons
}

/**
 * Record a livestock death with the LIS CLA Animals API.
 * Endpoint: PUT /animals/{identifier}
 * One call per ear tag; caller loops over tags for batch deaths.
 */
export async function submitLisDeath(params: LisDeathParams): Promise<LisResult> {
  const speciesValue = CLA_ANIMAL_SPECIES_MAP[params.species] ?? params.species.toLowerCase();
  const site = { identifiers: [{ identifier: params.holdingCph }] };

  const payloadObj: Record<string, unknown> = {
    animal: {
      identifier: params.earTag,
      species: speciesValue,
      sex: params.sex ?? "female",
    },
    registration: {
      site,
      date: params.deathDate,
      category: "registration",
    },
    death: {
      site,
      date: params.deathDate,
      ...(params.deathReasonId ? { reason: { id: params.deathReasonId } } : {}),
    },
  };
  const payloadStr = JSON.stringify(payloadObj, null, 2);

  if (isLisSandboxMode()) {
    console.log("[LIS SANDBOX] Death payload:", payloadStr);
    return {
      sandbox: true, success: true,
      reference: simulatedReference(),
      requestPayload: payloadStr,
      responsePayload: JSON.stringify({ status: "SANDBOX_OK" }),
    };
  }

  const identifier = encodeURIComponent(params.earTag);
  try {
    const result = await callLisApi(params.accessToken, `/animals/${identifier}`, "PUT", payloadObj);
    if (!result.ok) {
      const errMsg = (result.data as any)?.message ?? result.raw.slice(0, 300) ?? `HTTP ${result.status}`;
      return { sandbox: false, success: false, requestPayload: payloadStr, responsePayload: result.raw, errorMessage: errMsg };
    }
    const d = result.data as any;
    const ref = d?.identifier ?? d?.reference ?? params.earTag;
    return { sandbox: false, success: true, reference: String(ref), requestPayload: payloadStr, responsePayload: result.raw };
  } catch (err: any) {
    return { sandbox: false, success: false, requestPayload: payloadStr, errorMessage: err?.message ?? "Network error" };
  }
}

/**
 * POST /UndoRequests
 * Withdraw (undo) a previously submitted TransferRequest.
 * `requestId` must be the integer OData requestId of the original submission.
 */
export async function undoLisRequest(
  accessToken: string,
  requestId: number,
): Promise<{ ok: boolean; errorMessage?: string }> {
  if (isLisSandboxMode()) {
    return { ok: true };
  }
  const res = await callLisApi(accessToken, "/UndoRequests", "POST", {
    content: { requestToBeUndone_ID: requestId },
  });
  if (!res.ok) {
    const msg = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
    return { ok: false, errorMessage: `HTTP ${res.status}: ${msg}` };
  }
  return { ok: true };
}
