/**
 * EIDCymru — Electronic Identification for Wales adapter
 *
 * EIDCymru is the Welsh Government's livestock electronic identification and
 * movement reporting system for sheep and goat keepers in Wales. It is
 * operated on behalf of the Welsh Government and is the Wales equivalent of
 * England's Livestock Information Service (LIS) for small livestock.
 *
 * Cattle movements in Wales are reported to BCMS Online (same as England).
 * Pig movements in Wales use eAML2.org.uk.
 *
 * API access requires registration as an approved software supplier at:
 *   https://www.eidcymru.org  (or developer.eidcymru.org when available)
 *
 * Authentication: API key supplied via HTTP header.
 *
 * Production credentials required (set as environment variables):
 *   EIDCYMRU_API_KEY   — BDE's vendor API key from the EIDCymru developer portal
 *
 * When EIDCYMRU_API_KEY is absent the adapter runs in SANDBOX mode: it builds
 * the request payload exactly as it would for production, logs it, and returns
 * a simulated acknowledgement so the full workflow can be tested immediately.
 *
 * EIDCymru portal:  https://www.eidcymru.org
 * EIDCymru API:     https://api.eidcymru.org/v1  (pending supplier registration)
 */

const EIDCYMRU_API_BASE = "https://api.eidcymru.org/v1";

export function isEidcymruSandbox(): boolean {
  return !process.env.EIDCYMRU_API_KEY;
}

// ── Payload types ─────────────────────────────────────────────────────────────

export interface EidcymruMovementPayload {
  movementDate: string;           // YYYY-MM-DD
  movementType: "on" | "off" | "between" | "birth" | "death";
  departureCph: string;
  destinationCph: string;
  species: "sheep" | "goat";
  numberOfAnimals: number;
  flockNumber?: string;           // EIDCymru flock number (from farm settings)
  earTags?: string[];             // individual ear tag numbers
  licenceNumber?: string;         // AML or movement licence ref
  transporterName?: string;
  vehicleRegistration?: string;
  reason?: string;
}

export interface EidcymruResult {
  success: boolean;
  sandboxMode: boolean;
  reference?: string;
  rawResponse?: unknown;
  errorMessage?: string;
  payload: EidcymruMovementPayload;
}

// ── Movement submission ───────────────────────────────────────────────────────

export async function submitEidcymruMovement(payload: EidcymruMovementPayload): Promise<EidcymruResult> {
  if (isEidcymruSandbox()) {
    console.log("[EIDCYMRU] SANDBOX — simulated movement submission:", JSON.stringify(payload));
    return {
      success: true,
      sandboxMode: true,
      reference: `EIDCYMRU-SBX-${Date.now()}`,
      payload,
    };
  }

  try {
    const res = await fetch(`${EIDCYMRU_API_BASE}/movements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": process.env.EIDCYMRU_API_KEY!,
        "Accept": "application/json",
      },
      body: JSON.stringify({
        movementDate:        payload.movementDate,
        movementType:        payload.movementType,
        departureCph:        payload.departureCph,
        destinationCph:      payload.destinationCph,
        species:             payload.species,
        numberOfAnimals:     payload.numberOfAnimals,
        flockNumber:         payload.flockNumber,
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
    const msg = err instanceof Error ? err.message : "Network error contacting EIDCymru API";
    console.error("[EIDCYMRU] Submit error:", msg);
    return { success: false, sandboxMode: false, errorMessage: msg, payload };
  }
}

// ── Connection test ───────────────────────────────────────────────────────────

export async function testEidcymruConnection(): Promise<{ success: boolean; message: string }> {
  if (isEidcymruSandbox()) {
    return {
      success: true,
      message: "Sandbox mode — EIDCYMRU_API_KEY not yet configured. All submissions will be simulated until BDE completes EIDCymru supplier registration.",
    };
  }
  try {
    const res = await fetch(`${EIDCYMRU_API_BASE}/status`, {
      headers: {
        "X-Api-Key": process.env.EIDCYMRU_API_KEY!,
        "Accept": "application/json",
      },
    });
    if (res.ok) {
      return { success: true, message: "EIDCymru API key accepted — connection live. Ready to submit Wales sheep/goat movements." };
    }
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    return { success: false, message: `EIDCymru returned HTTP ${res.status}: ${body?.message ?? "Unexpected error"}` };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : "Network error reaching EIDCymru API" };
  }
}
