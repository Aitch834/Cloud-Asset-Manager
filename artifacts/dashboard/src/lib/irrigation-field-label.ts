export type IrrigationFieldRecord = {
  fieldName?: unknown;
  fieldId?: unknown;
  fieldOrBlockDescription?: unknown;
};

export function irrigationFieldLabel(
  record: IrrigationFieldRecord,
  fields: Array<Record<string, unknown>> = [],
): string {
  if (record.fieldName) return String(record.fieldName);

  if (record.fieldId) {
    const field = fields.find(candidate => String(candidate.id) === String(record.fieldId));
    if (field?.name) return String(field.name);
  }

  return record.fieldOrBlockDescription
    ? String(record.fieldOrBlockDescription)
    : "—";
}