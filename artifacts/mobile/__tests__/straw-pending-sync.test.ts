const mockKvGet = jest.fn();
const mockKvSet = jest.fn();
const mockKvDelete = jest.fn();
const mockInsertRecord = jest.fn();
const mockEnqueueSyncItem = jest.fn();
const mockHasPendingSyncItem = jest.fn();
const mockGetPendingSyncItems = jest.fn();
const mockMarkSyncItemCompletedIfUnchanged = jest.fn();
const mockMarkRecordSynced = jest.fn();

jest.mock("react-native", () => ({
  Platform: { OS: "web" },
}));

jest.mock("../lib/database", () => ({
  clearCompletedSyncItems: jest.fn(),
  deferSyncItemIfUnchanged: jest.fn(),
  deleteRecord: jest.fn(),
  enqueueSyncItem: (...args: unknown[]) => mockEnqueueSyncItem(...args),
  getFailedSyncCount: jest.fn().mockResolvedValue(0),
  getPendingSyncCount: jest.fn().mockResolvedValue(0),
  getPendingSyncItems: (...args: unknown[]) => mockGetPendingSyncItems(...args),
  getTableForKey: jest.fn().mockReturnValue(null),
  hasPendingSyncItem: (...args: unknown[]) => mockHasPendingSyncItem(...args),
  insertRecord: (...args: unknown[]) => mockInsertRecord(...args),
  kvDelete: (...args: unknown[]) => mockKvDelete(...args),
  kvGet: (...args: unknown[]) => mockKvGet(...args),
  kvSet: (...args: unknown[]) => mockKvSet(...args),
  markRecordSynced: (...args: unknown[]) => mockMarkRecordSynced(...args),
  markSyncItemCompletedIfUnchanged: (...args: unknown[]) =>
    mockMarkSyncItemCompletedIfUnchanged(...args),
  markSyncItemFailedIfUnchanged: jest.fn(),
  setPendingSyncItemServerRecordId: jest.fn(),
}));

jest.mock("../lib/authToken", () => ({
  getMobileAuthToken: jest.fn().mockResolvedValue("token"),
}));

import {
  cleanup,
  migrateLegacyStrawPendingWrappers,
  triggerManualSync,
} from "../lib/sync-engine";

describe("straw offline sync", () => {
  const originalDomain = process.env.EXPO_PUBLIC_DOMAIN;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_DOMAIN = "example.test";
    mockHasPendingSyncItem.mockResolvedValue(false);
    mockMarkSyncItemCompletedIfUnchanged.mockResolvedValue(true);
    mockKvGet.mockResolvedValue(null);
  });

  afterEach(cleanup);

  afterAll(() => {
    process.env.EXPO_PUBLIC_DOMAIN = originalDomain;
  });

  it("migrates valid straw wrappers and leaves invalid wrappers visible", async () => {
    const baling = {
      id: "baling-local-1",
      farmId: "farm-1",
      operationDate: "2026-09-11",
      createdAt: "2026-09-11T09:00:00.000Z",
    };
    const validWrapper = {
      id: "wrapper-1",
      recordType: "bde_straw_baling_operations",
      data: baling,
    };
    const invalidJourneyWrapper = {
      id: "wrapper-2",
      recordType: "bde_straw_cartage_journeys",
      data: { id: "journey-local-1", farmId: "farm-1" },
    };
    mockKvGet.mockImplementation(async (key: string) => (
      key === "bde_pending_sync"
        ? JSON.stringify([validWrapper, invalidJourneyWrapper])
        : null
    ));

    await migrateLegacyStrawPendingWrappers();

    expect(mockInsertRecord).toHaveBeenCalledWith(
      "straw_baling_operations",
      baling.id,
      baling.farmId,
      baling,
      baling.createdAt,
    );
    expect(mockEnqueueSyncItem).toHaveBeenCalledWith(
      "bde_straw_baling_operations",
      baling.id,
      baling,
    );
    expect(mockKvSet).toHaveBeenCalledWith(
      "bde_pending_sync",
      JSON.stringify([invalidJourneyWrapper]),
    );
  });

  it("uses the preserved parent operation ID and clears local pending state", async () => {
    const journey = {
      id: "journey-local-1",
      farmId: "farm-1",
      balingOperationId: 314,
      balesMoved: 20,
    };
    mockGetPendingSyncItems.mockResolvedValue([{
      id: "queue-1",
      record_type: "bde_straw_cartage_journeys",
      record_id: journey.id,
      data_json: JSON.stringify(journey),
      retry_count: 0,
    }]);
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as typeof fetch;

    await triggerManualSync();

    expect(global.fetch).toHaveBeenCalledWith(
      "https://example.test/api/farms/farm-1/straw-baling-operations/314/journeys",
      expect.objectContaining({ method: "POST" }),
    );
    expect(mockMarkRecordSynced).toHaveBeenCalledWith(
      "straw_cartage_journeys",
      journey.id,
    );
  });
});