export const FP_DEROGATION_EXPIRY_TYPES = [
  "organic_fp_input_log_derogation_expiry",
  "organic_fp_derogation_expiry",
] as const;

export type FpDerogationExpiryType = (typeof FP_DEROGATION_EXPIRY_TYPES)[number];

export function isFpDerogationExpiryType(type: string): type is FpDerogationExpiryType {
  return FP_DEROGATION_EXPIRY_TYPES.includes(type as FpDerogationExpiryType);
}

function dateOnlyParts(date: string): [number, number, number] {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  if (!match) throw new Error(`Invalid calendar date: ${date}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function formatFpDerogationExpiryLabel(
  type: FpDerogationExpiryType,
  dueDate: string,
  today: Date,
): string {
  if (!isFpDerogationExpiryType(type)) {
    throw new Error(`Unsupported FP derogation expiry type: ${type}`);
  }

  const [year, month, day] = dateOnlyParts(dueDate);
  const dueDay = Date.UTC(year, month - 1, day);
  const todayDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const wording = dueDay < todayDay ? "Expired" : "Expires";
  const formattedDate = new Date(year, month - 1, day, 12).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${wording} ${formattedDate}`;
}