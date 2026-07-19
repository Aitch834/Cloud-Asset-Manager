/**
 * ScotEID — Scotland's Animal Traceability System adapter
 *
 * ScotEID is Scotland's national electronic livestock identification and
 * movement reporting database. It is operated by Scotland's Rural College
 * (SRUC) on behalf of the Scottish Government.
 *
 * In Scotland ALL livestock species (cattle, sheep, goats, pigs, deer) are
 * reported to ScotEID. Cattle movements must additionally be notified to
 * BCMS. ScotEID is the Scotland equivalent of England's LIS + LIP combined.
 *
 * API access requires registration as an approved software supplier:
 *   https://www.scoteid.com  (contact: scoteid@sruc.ac.uk)
 *
 * Authentication: API key supplied via HTTP header.
 *
 * Production credentials required (set as environment variables):
 *   SCOTEID_API_KEY   — BDE's vendor API key from the ScotEID supplier portal
 *
 * When SCOTEID_API_KEY is absent the adapter runs in SANDBOX mode: it builds
 * the request payload exactly as it would for production, logs it, and returns
 * a simulated acknowledgement so the full workflow can be tested immediately.
 *
 * ScotEID portal:  https://www.scoteid.com
 * ScotEID API:     https://api.scoteid.com/v1  (pending supplier registration)
 */

const SCOTEID_API_BASE = "https://api.scoteid.com/v1";

export function isScoteidSandbox(): boolean {
  return !process.env.SCOTEID_API_KEY;
}

// ── Payload types ─────────────────────────────────────────────────────────────

export interface ScoteidMovementPayload {
  movementDate: string;           // YYYY-MM-DD
  movementType: "on" | "off" | "between" | "birth" | "death";
  departureCph: string;
  destinationCph: string;
  species: "cattle" | "sheep" | "goat" | "pig" | "deer";
  numberOfAnimals: number;
  holdingNumber?: string;         // ScotEID holding/flock/herd number
  earTags?: string[];
  licenceNumber?: string;
  transporterName?: string;
  vehicleRegistration?: string;
  reason?: string;
}

export interface ScoteidResult {
  success: boolean;
  sandboxMode: boolean;
  reference?: string;
  rawResponse?: unknown;
  errorMessage?: string;
  payload: ScoteidMovementPayload;
}

// ── Movement submission ───────────────────────────────────────────────────────

export async function submitScoteidMovement(payload: ScoteidMovementPayload): Promise<ScoteidResult> {
  if (isScoteidSandbox()) {
    console.log("[SCOTEID] SANDBOX — simulated movement submission:", JSON.stringify(payload));
    return {
      success: true,
      sandboxMode: true,
      reference: `SCOTEID-SBX-${Date.now()}`,
      payload,
    };
  }

  try {
    const res = await fetch(`${SCOTEID_API_BASE}/movements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": process.env.SCOTEID_API_KEY!,
        "Accept": "application/json",
      },
      body: JSON.stringify({
        movementDate:        payload.movementDate,
        movementType:        payload.movementType,
        departureCph:        payload.departureCph,
        destinationCph:      payload.destinationCph,
        species:             payload.species,
        numberOfAnimals:     payload.numberOfAnimals,
        holdingNumber:       payload.holdingNumber,
        earTags:             payload.earTags ?? [],
        licenceNumber:       payload.licenceNumber,
        transporterName:     payload.transporterName,
        vehicleRegistration: payload.vehicleRegistration,
        reason:              payload.reason,
      }),
    });

    const body = await res.json().catch(() => ({})) as Record<string, unknown>;

    if (!res.ok) {
      const msg = (body?.message ?? body?.error ?? `HTTP ${res.status}`) as string;
      return { success: false, sandboxMode: false, errorMessage: msg, payload, rawResponse: body };
    }

    return {
      success: true,
      sandboxMode: false,
      reference: (body?.reference ?? body?.id ?? body?.submissionId ?? String(res.status)) as string,
      rawResponse: body,
      payload,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error contacting ScotEID API";
    console.error("[SCOTEID] Submit error:", msg);
    return { success: false, sandboxMode: false, errorMessage: msg, payload };
  }
}

// ── Connection test ───────────────────────────────────────────────────────────

export async function testScoteidConnection(): Promise<{ success: boolean; message: string }> {
  if (isScoteidSandbox()) {
    return {
      success: true,
      message: "Sandbox mode — SCOTEID_API_KEY not yet configured. All submissions will be simulated until BDE completes ScotEID supplier registration.",
    };
  }
  try {
    const res = await fetch(`${SCOTEID_API_BASE}/status`, {
      headers: {
        "X-Api-Key": process.env.SCOTEID_API_KEY!,
        "Accept": "application/json",
      },
    });
    if (res.ok) {
      return { success: true, message: "ScotEID API key accepted — connection live. Ready to submit Scotland livestock movements." };
    }
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    return { success: false, message: `ScotEID returned HTTP ${res.status}: ${body?.message ?? "Unexpected error"}` };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : "Network error reaching ScotEID API" };
  }
}
