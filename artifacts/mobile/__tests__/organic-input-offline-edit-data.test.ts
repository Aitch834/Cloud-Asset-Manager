import { parseQueuedOrganicInputEdit } from "../lib/organicInputOfflineEdit";

describe("queued organic input edit data", () => {
  it("normalises a persisted numeric string server id", () => {
    expect(parseQueuedOrganicInputEdit({
      farmId: "farm-1",
      serverRecordId: "42",
      changes: { productName: "Lime" },
    })).toEqual({
      farmId: "farm-1",
      serverRecordId: 42,
      changes: { productName: "Lime" },
    });
  });

  it.each([
    null,
    {},
    { farmId: "", serverRecordId: 42, changes: { productName: "Lime" } },
    { farmId: "farm-1", serverRecordId: 0, changes: { productName: "Lime" } },
    { farmId: "farm-1", serverRecordId: 42, changes: [] },
    { farmId: "farm-1", serverRecordId: 42, changes: {} },
    { farmId: "farm-1", serverRecordId: 42, changes: { productName: " " } },
  ])("rejects malformed persisted data %#", (value) => {
    expect(parseQueuedOrganicInputEdit(value)).toBeNull();
  });
});