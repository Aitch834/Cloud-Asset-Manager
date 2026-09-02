// Spreadsheet applications can evaluate cells beginning with these characters
// as formulas, even when the value is CSV-quoted. Prefixing an apostrophe makes
// the cell plain text while preserving the original value for display.
const FORMULA_PREFIX_PATTERN = /^[\s\x00-\x1F]*[=+\-@]/;

export function csvSafeValue(value: unknown): string {
  const text = String(value);
  return FORMULA_PREFIX_PATTERN.test(text) ? `'${text}` : text;
}