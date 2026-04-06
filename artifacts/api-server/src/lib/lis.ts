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
 * Azure B2C tenant:    livestockinformation.b2clogin.com
 * Policy:              B2C_1_ROPC_Auth
 */

const LIS_B2C_TOKEN_URL =
  "https://livestockinformation.b2clogin.com/livestockinformation.onmicrosoft.com/B2C_1_ROPC_Auth/oauth2/v2.0/token";
const LIS_B2C_SCOPE =
  "https://livestockinformation.onmicrosoft.com/api/user_impersonation openid profile offline_access";
const LIS_B2C_CLIENT_ID = process.env.LIS_B2C_CLIENT_ID ?? "lis-cla-public";

const LIS_API_BASE = "https://api.cla.livestockinformation.org.uk";
const LIS_API_BASE_SANDBOX = "https://api.sandbox.cla.livestockinformation.org.uk";

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
 * Obtain an Azure B2C access token using ROPC flow.
 * In sandbox mode returns a simulated token.
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

  try {
    const body = new URLSearchParams({
      grant_type: "password",
      client_id: LIS_B2C_CLIENT_ID,
      scope: LIS_B2C_SCOPE,
      username,
      password,
    });

    const res = await fetch(LIS_B2C_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

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

  try {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: LIS_B2C_CLIENT_ID,
      refresh_token: refreshToken,
    });

    const res = await fetch(LIS_B2C_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const data = await res.json() as any;

    if (!res.ok || data.error) {
      return { sandbox: false, success: false, errorMessage: data.error_description ?? data.error ?? `HTTP ${res.status}` };
    }

    return {
      sandbox: false,
      success: true,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  } catch (err: any) {
    return { sandbox: false, success: false, errorMessage: err?.message ?? "Network error refreshing token" };
  }
}

/**
 * Build the CLA API movement request body.
 */
function buildMovementPayload(req: LisMovementRequest): object {
  const typeMap: Record<LisMovementType, string> = {
    movement_off: "OFF",
    movement_on: "ON",
    birth: "BIRTH",
    death: "DEATH",
  };

  const animals = req.earTagNumbers
    ? req.earTagNumbers
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(tag => ({ tagNumber: tag.trim() }))
    : [];

  return {
    movementDocument: {
      movementType: typeMap[req.movementType],
      movementDate: req.movementDate,
      speciesIdentifier: req.species,
      numberOfAnimals: req.numberOfAnimals,
      departureCphNumber: req.departureCph ?? req.fromLocation ?? "",
      destinationCphNumber: req.destinationCph ?? req.toLocation ?? "",
      flockMark: req.flockMark ?? "",
      licenceNumber: req.licenceNumber ?? "",
      ...(animals.length > 0 && { animals }),
    },
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

  const subscriptionKey = process.env.LIS_SUBSCRIPTION_KEY!;
  const token = req.accessToken;

  if (!token) {
    return { sandbox: false, success: false, requestPayload: payloadStr, errorMessage: "No LIS access token available — please reconnect your LIS account." };
  }

  try {
    const apiBase = process.env.LIS_USE_SANDBOX_API === "true" ? LIS_API_BASE_SANDBOX : LIS_API_BASE;
    const res = await fetch(`${apiBase}/v1/movements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Ocp-Apim-Subscription-Key": subscriptionKey,
      },
      body: payloadStr,
    });

    const responseText = await res.text();

    if (!res.ok) {
      let errMsg = `HTTP ${res.status}`;
      try {
        const errBody = JSON.parse(responseText) as any;
        errMsg = errBody.message ?? errBody.error ?? errMsg;
      } catch {}
      return { sandbox: false, success: false, requestPayload: payloadStr, responsePayload: responseText, errorMessage: errMsg };
    }

    let responseData: any = {};
    try { responseData = JSON.parse(responseText); } catch {}

    const reference = responseData.movementId ?? responseData.reference ?? responseData.id;

    return {
      sandbox: false,
      success: true,
      reference: String(reference ?? ""),
      requestPayload: payloadStr,
      responsePayload: responseText,
    };
  } catch (err: any) {
    return { sandbox: false, success: false, requestPayload: payloadStr, errorMessage: err?.message ?? "Network error" };
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
