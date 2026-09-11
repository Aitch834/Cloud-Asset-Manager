type ArrayEnvelope<K extends string, T> = Record<K, T[]>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function requireArrayEnvelope<T, K extends string = string>(
  value: unknown,
  key: K,
  responseName: string,
): ArrayEnvelope<K, T>[K] {
  if (!isRecord(value) || !Array.isArray(value[key])) {
    throw new Error(`Invalid ${responseName} response: expected ${key} array`);
  }
  return value[key] as T[];
}

export function requireArrayResponse<T>(
  value: unknown,
  responseName: string,
): T[] {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid ${responseName} response: expected array`);
  }
  return value as T[];
}