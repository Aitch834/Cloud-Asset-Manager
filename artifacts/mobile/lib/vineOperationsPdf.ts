import type { VineOperationsRow } from "./printTemplates";

export interface VineOperationsPdfSourceRow {
  id: number;
  operationDate: string | null;
  blockName: string | null;
  operationType: string | null;
  operatorName: string | null;
  hoursWorked: number | null;
  notes: string | null;
  pruningSystem: string | null;
  budsPerVineTarget: number | null;
  budsPerVineActual: number | null;
  pruningWeightKgPerVine: number | null;
  shootsRemovedPct: number | null;
  leavesRemovedZone: string | null;
}

export function buildVineOperationsPdfRows(
  records: VineOperationsPdfSourceRow[],
): VineOperationsRow[] {
  return records.map(record => ({
    id: record.id,
    operationDate: record.operationDate,
    blockName: record.blockName,
    operationType: record.operationType,
    operatorName: record.operatorName,
    hoursWorked: record.hoursWorked,
    notes: record.notes,
    pruningSystem: record.pruningSystem,
    budsPerVineTarget: record.budsPerVineTarget,
    budsPerVineActual: record.budsPerVineActual,
    pruningWeightKgPerVine: record.pruningWeightKgPerVine,
    shootsRemovedPct: record.shootsRemovedPct,
    leavesRemovedZone: record.leavesRemovedZone,
  }));
}