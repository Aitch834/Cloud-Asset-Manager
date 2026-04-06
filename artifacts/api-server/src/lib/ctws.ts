/**
 * CTWS — CTS Web Services adapter
 *
 * The BCMS Cattle Tracing System (CTS) exposes an XML-over-HTTP API called
 * CTS Web Services (CTWS). Payloads are inner XML bodies base64-encoded and
 * then wrapped in an outer DDTS (DEFRA Data Transfer Service) XML envelope.
 *
 * Production credentials required (set as environment variables):
 *   CTWS_DDTS_USERNAME   — DEFRA/DDTS software vendor username (obtained from BCMS)
 *   CTWS_DDTS_PASSWORD   — DEFRA/DDTS software vendor password
 *
 * When those are absent the adapter runs in SANDBOX mode: it builds the XML
 * payload exactly as it would for production, logs it, and returns a simulated
 * acknowledgement.  This lets farmers configure their CTWS credentials and test
 * the full flow before BDE obtains DEFRA vendor credentials.
 */

const CTWS_ENDPOINT = "https://bcms.defra.gov.uk/ctws/"; // production URL (TBC with BCMS)
const CTWS_TEST_ENDPOINT = "https://test-bcms.defra.gov.uk/ctws/"; // sandbox URL (TBC)

export function isSandboxMode(): boolean {
  return !process.env.CTWS_DDTS_USERNAME || !process.env.CTWS_DDTS_PASSWORD;
}

function b64(str: string): string {
  return Buffer.from(str, "utf-8").toString("base64");
}

export type CtwsMovementType = "movement_on" | "movement_off" | "birth" | "death";

export interface CtwsMovementRequest {
  ctwsUsername: string;
  ctwsPassword: string;
  holdingNumber: string;
  movementType: CtwsMovementType;
  movementDate: string;
  numberOfAnimals: number;
  earTagNumbers?: string;
  fromLocation?: string;
  toLocation?: string;
  licenceNumber?: string;
  species?: string;
}

export interface CtwsResult {
  sandbox: boolean;
  success: boolean;
  reference?: string;
  xmlPayload?: string;
  responseXml?: string;
  errorMessage?: string;
}

/**
 * Build the inner XML payload for a cattle movement notification.
 */
function buildMovementXml(req: CtwsMovementRequest): string {
  const tags = req.earTagNumbers
    ? req.earTagNumbers
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(t => `    <EarTag>${t.trim()}</EarTag>`)
        .join("\n")
    : `    <NumberOfAnimals>${req.numberOfAnimals}</NumberOfAnimals>`;

  const typeMap: Record<CtwsMovementType, string> = {
    movement_on: "ON",
    movement_off: "OFF",
    birth: "BIRTH",
    death: "DEATH",
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<CTWSRequest>
  <RequestType>${typeMap[req.movementType]}</RequestType>
  <HoldingNumber>${req.holdingNumber}</HoldingNumber>
  <MovementDate>${req.movementDate}</MovementDate>
  <FromLocation>${req.fromLocation ?? req.holdingNumber}</FromLocation>
  <ToLocation>${req.toLocation ?? req.holdingNumber}</ToLocation>
  <LicenceNumber>${req.licenceNumber ?? ""}</LicenceNumber>
  <Animals>
${tags}
  </Animals>
</CTWSRequest>`;
}

/**
 * Wrap inner XML in the DDTS outer envelope with base64 encoding.
 */
function buildDdtsEnvelope(innerXml: string, ddtsUser: string, ddtsPass: string, ctwsUser: string, ctwsPass: string): string {
  const encoded = b64(innerXml);
  return `<?xml version="1.0" encoding="UTF-8"?>
<DDTSEnvelope>
  <DDTSCredentials>
    <Username>${ddtsUser}</Username>
    <Password>${ddtsPass}</Password>
  </DDTSCredentials>
  <CTWSCredentials>
    <Username>${ctwsUser}</Username>
    <Password>${ctwsPass}</Password>
  </CTWSCredentials>
  <Payload encoding="base64">${encoded}</Payload>
</DDTSEnvelope>`;
}

function simulatedReference(): string {
  return `SANDBOX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

/**
 * Submit a cattle movement notification to CTWS.
 * Returns a sandbox simulation when DDTS credentials are not configured.
 */
export async function submitMovement(req: CtwsMovementRequest): Promise<CtwsResult> {
  const innerXml = buildMovementXml(req);

  if (isSandboxMode()) {
    console.log("[CTWS SANDBOX] Would submit the following payload to CTWS:");
    console.log(innerXml);
    return {
      sandbox: true,
      success: true,
      reference: simulatedReference(),
      xmlPayload: innerXml,
      responseXml: "<CTWSResponse><Status>SANDBOX_OK</Status></CTWSResponse>",
    };
  }

  const ddtsUser = process.env.CTWS_DDTS_USERNAME!;
  const ddtsPass = process.env.CTWS_DDTS_PASSWORD!;
  const envelope = buildDdtsEnvelope(innerXml, ddtsUser, ddtsPass, req.ctwsUsername, req.ctwsPassword);

  try {
    const endpoint = process.env.CTWS_USE_TEST_ENDPOINT === "true" ? CTWS_TEST_ENDPOINT : CTWS_ENDPOINT;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/xml; charset=utf-8" },
      body: envelope,
    });
    const responseXml = await res.text();

    if (!res.ok) {
      return { sandbox: false, success: false, xmlPayload: innerXml, responseXml, errorMessage: `HTTP ${res.status}: ${res.statusText}` };
    }

    const refMatch = responseXml.match(/<Reference>([^<]+)<\/Reference>/);
    const errMatch = responseXml.match(/<ErrorMessage>([^<]+)<\/ErrorMessage>/);
    const statusMatch = responseXml.match(/<Status>([^<]+)<\/Status>/);

    if (errMatch || (statusMatch && statusMatch[1] !== "OK")) {
      return { sandbox: false, success: false, xmlPayload: innerXml, responseXml, errorMessage: errMatch?.[1] ?? statusMatch?.[1] };
    }

    return { sandbox: false, success: true, reference: refMatch?.[1], xmlPayload: innerXml, responseXml };
  } catch (err: any) {
    return { sandbox: false, success: false, xmlPayload: innerXml, errorMessage: err?.message ?? "Network error" };
  }
}

/**
 * Test connectivity and credentials against the CTWS test endpoint.
 * Always uses the test server regardless of environment.
 */
export async function testConnection(req: Pick<CtwsMovementRequest, "ctwsUsername" | "ctwsPassword" | "holdingNumber">): Promise<CtwsResult> {
  if (isSandboxMode()) {
    return {
      sandbox: true,
      success: true,
      reference: undefined,
      responseXml: "<CTWSResponse><Status>SANDBOX_TEST_OK</Status></CTWSResponse>",
      errorMessage: undefined,
    };
  }

  const ddtsUser = process.env.CTWS_DDTS_USERNAME!;
  const ddtsPass = process.env.CTWS_DDTS_PASSWORD!;
  const innerXml = `<?xml version="1.0" encoding="UTF-8"?>
<CTWSRequest>
  <RequestType>LIST_ANIMALS</RequestType>
  <HoldingNumber>${req.holdingNumber}</HoldingNumber>
</CTWSRequest>`;
  const envelope = buildDdtsEnvelope(innerXml, ddtsUser, ddtsPass, req.ctwsUsername, req.ctwsPassword);

  try {
    const res = await fetch(CTWS_TEST_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/xml; charset=utf-8" },
      body: envelope,
    });
    const responseXml = await res.text();
    const errMatch = responseXml.match(/<ErrorMessage>([^<]+)<\/ErrorMessage>/);
    if (!res.ok || errMatch) {
      return { sandbox: false, success: false, responseXml, errorMessage: errMatch?.[1] ?? `HTTP ${res.status}` };
    }
    return { sandbox: false, success: true, responseXml };
  } catch (err: any) {
    return { sandbox: false, success: false, errorMessage: err?.message ?? "Network error" };
  }
}
