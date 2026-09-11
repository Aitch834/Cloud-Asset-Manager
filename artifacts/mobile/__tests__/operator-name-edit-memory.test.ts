const mockKvSet = jest.fn<Promise<void>, [string, string]>();

jest.mock("../lib/database", () => ({
  kvSet: (...args: [string, string]) => mockKvSet(...args),
}));

import {
  rememberMaintenanceEditOperator,
  rememberMovementEditOperator,
} from "../lib/operatorNameMemory";

describe.each([
  ["movement", rememberMovementEditOperator],
  ["maintenance", rememberMaintenanceEditOperator],
] as const)("%s edit operator-name memory", (_recordType, rememberOperator) => {
  beforeEach(() => {
    mockKvSet.mockReset();
    mockKvSet.mockResolvedValue(undefined);
  });

  it("updates the local operator key after a successful save", async () => {
    await rememberOperator("  Alex Morgan  ", true);

    expect(mockKvSet).toHaveBeenCalledTimes(1);
    expect(mockKvSet).toHaveBeenCalledWith("last_operator_name", "Alex Morgan");
  });

  it("does not update the local operator key after a failed save", async () => {
    await rememberOperator("Alex Morgan", false);

    expect(mockKvSet).not.toHaveBeenCalled();
  });

  it("does not update the local operator key for a blank operator", async () => {
    await rememberOperator("   ", true);

    expect(mockKvSet).not.toHaveBeenCalled();
  });
});