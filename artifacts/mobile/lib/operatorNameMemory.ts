import { kvSet } from "./database";

const LAST_OPERATOR_NAME_KEY = "last_operator_name";

async function rememberEditOperator(
  operatorName: string,
  saveSucceeded: boolean,
): Promise<void> {
  const trimmedOperatorName = operatorName.trim();
  if (!saveSucceeded || !trimmedOperatorName) return;

  await kvSet(LAST_OPERATOR_NAME_KEY, trimmedOperatorName).catch(() => undefined);
}

export async function rememberMovementEditOperator(
  operatorName: string,
  saveSucceeded: boolean,
): Promise<void> {
  await rememberEditOperator(operatorName, saveSucceeded);
}

export async function rememberMaintenanceEditOperator(
  operatorName: string,
  saveSucceeded: boolean,
): Promise<void> {
  await rememberEditOperator(operatorName, saveSucceeded);
}