import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_VERSION = "v1";

function tokenSecret(): string {
  const secret = process.env.CREDENTIAL_ENCRYPTION_KEY ?? process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("CREDENTIAL_ENCRYPTION_KEY or SESSION_SECRET is required for sector alert email preference links");
  }
  return secret;
}

export function normaliseSectorAlertEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return email.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Signs the normalized recipient address without storing a per-email token.
 * The token is deliberately stable so the unsubscribe link remains useful
 * when an advisor receives several alert emails.
 */
export function signSectorAlertEmailToken(email: string): string {
  const emailNorm = normaliseSectorAlertEmail(email);
  const payload = `${TOKEN_VERSION}:${emailNorm}`;
  const signature = createHmac("sha256", tokenSecret()).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

export function verifySectorAlertEmailToken(token: string): string | null {
  try {
    const separator = token.lastIndexOf(".");
    if (separator <= 0) return null;

    const encodedPayload = token.slice(0, separator);
    const signature = token.slice(separator + 1);
    if (!/^[a-f0-9]{64}$/i.test(signature)) return null;

    const payload = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const expected = createHmac("sha256", tokenSecret()).update(payload).digest("hex");
    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");

    if (
      signatureBuffer.length !== expectedBuffer.length
      || !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }

    const prefix = `${TOKEN_VERSION}:`;
    if (!payload.startsWith(prefix)) return null;
    const emailNorm = normaliseSectorAlertEmail(payload.slice(prefix.length));
    if (!isValidEmail(emailNorm)) return null;
    return emailNorm;
  } catch {
    return null;
  }
}

export function buildSectorAlertUnsubscribeUrl(email: string): string {
  const baseUrl = process.env.SECTOR_ALERT_UNSUBSCRIBE_BASE_URL
    ?? "https://api.bdefarmtrac.co.uk/api/sector-alert/unsubscribe";
  const url = new URL(baseUrl);
  url.searchParams.set("token", signSectorAlertEmailToken(email));
  return url.toString();
}