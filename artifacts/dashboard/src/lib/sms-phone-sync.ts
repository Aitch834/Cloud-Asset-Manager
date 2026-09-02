export interface SmsPhoneSyncInput {
  savedContactPhone: string | null | undefined;
  previousContactPhone: string | null | undefined;
  savedSmsMobile: string | null | undefined;
  profileLoaded: boolean;
}

/**
 * Convert a UK mobile number to E.164 form. Landlines, invalid values, and
 * non-UK numbers are intentionally excluded from the SMS sync suggestion.
 */
export function toUkMobileIntl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[\s\-().]/g, "");
  if (/^\+447\d{9}$/.test(digits)) return digits;
  if (/^07\d{9}$/.test(digits)) return "+44" + digits.slice(1);
  return null;
}

/**
 * Return the confirmed saved contact mobile when the dashboard should offer
 * to sync it to the user's SMS profile, otherwise return null.
 */
export function getSmsPhoneSyncCandidate({
  savedContactPhone,
  previousContactPhone,
  savedSmsMobile,
  profileLoaded,
}: SmsPhoneSyncInput): string | null {
  if (!profileLoaded) return null;

  const newContactPhone = toUkMobileIntl(savedContactPhone);
  if (!newContactPhone) return null;
  if (newContactPhone === toUkMobileIntl(previousContactPhone)) return null;
  if (newContactPhone === toUkMobileIntl(savedSmsMobile)) return null;
  return newContactPhone;
}

export function buildSmsPhoneUpdatePayload(phoneNumber: string): { phoneNumber: string } {
  return { phoneNumber };
}