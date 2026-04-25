/**
 * AES-256-GCM encryption utility for at-rest credential storage.
 *
 * Credentials are stored in the format:  enc:v1:<ivHex>:<ciphertextHex>:<authTagHex>
 * Legacy base64-only values (no prefix) are readable but will be re-encrypted on
 * the next save.
 *
 * Key:  CREDENTIAL_ENCRYPTION_KEY env variable — must be exactly 64 hex chars (32 bytes).
 *       Generate with: node -e "require('crypto').randomBytes(32).then?.(b=>console.log(b.toString('hex')))||console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const PREFIX = "enc:v1:";
const IV_BYTES = 12;
const TAG_BYTES = 16;

function getKey(): Buffer {
  const hexKey = process.env.CREDENTIAL_ENCRYPTION_KEY;
  if (!hexKey || hexKey.length !== 64) {
    throw new Error(
      "CREDENTIAL_ENCRYPTION_KEY must be set to a 64-character hex string (32 bytes). " +
      "Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return Buffer.from(hexKey, "hex");
}

/**
 * Encrypt a plaintext credential. Returns enc:v1:<iv>:<ciphertext>:<tag> string.
 */
export function encryptCredential(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf-8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("hex")}:${encrypted.toString("hex")}:${tag.toString("hex")}`;
}

/**
 * Decrypt a stored credential.
 * Handles both:
 *   - New format: enc:v1:<iv>:<ciphertext>:<tag>
 *   - Legacy format: plain base64 (from previous implementation)
 */
export function decryptCredential(stored: string): string {
  if (!stored) return "";

  if (stored.startsWith(PREFIX)) {
    const parts = stored.slice(PREFIX.length).split(":");
    if (parts.length !== 3) throw new Error("Invalid encrypted credential format");
    const [ivHex, ciphertextHex, tagHex] = parts;
    const key = getKey();
    const iv = Buffer.from(ivHex, "hex");
    const ciphertext = Buffer.from(ciphertextHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    if (tag.length !== TAG_BYTES) throw new Error("Invalid auth tag length");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf-8");
  }

  // Legacy: base64-encoded plain value — return as-is and re-encrypt on next save
  return Buffer.from(stored, "base64").toString("utf-8");
}

/**
 * Returns true if the stored value is already using the new encrypted format.
 */
export function isEncrypted(stored: string): boolean {
  return stored.startsWith(PREFIX);
}
