const mockGetPendingSyncItems = jest.fn();
const mockMarkSyncItemCompletedIfUnchanged = jest.fn();
const mockMarkSyncItemFailedIfUnchanged = jest.fn();
const mockClearCompletedSyncItems = jest.fn();
const mockGetPendingSyncCount = jest.fn();
const mockGetTableForKey = jest.fn();
const mockHasPendingSyncItem = jest.fn();
const mockInsertRecord = jest.fn();
const mockEnqueueSyncItem = jest.fn();
const mockKvDelete = jest.fn();
const mockKvGet = jest.fn();
const mockKvSet = jest.fn();
const mockMarkRecordSynced = jest.fn();

jest.mock("react-native", () => ({
  Platform: { OS: "web" },
}));

jest.mock("../lib/database", () => ({
  clearCompletedSyncItems: (...args: unknown[]) => mockClearCompletedSyncItems(...args),
  deferSyncItemIfUnchanged: jest.fn(),
  deleteRecord: jest.fn(),
  enqueueSyncItem: (...args: unknown[]) => mockEnqueueSyncItem(...args),
  getPendingSyncCount: (...args: unknown[]) => mockGetPendingSyncCount(...args),
  getPendingSyncItems: (...args: unknown[]) => mockGetPendingSyncItems(...args),
  getTableForKey: (...args: unknown[]) => mockGetTableForKey(...args),
  hasPendingSyncItem: (...args: unknown[]) => mockHasPendingSyncItem(...args),
  insertRecord: (...args: unknown[]) => mockInsertRecord(...args),
  kvDelete: (...args: unknown[]) => mockKvDelete(...args),
  kvGet: (...args: unknown[]) => mockKvGet(...args),
  kvSet: (...args: unknown[]) => mockKvSet(...args),
  markRecordSynced: (...args: unknown[]) => mockMarkRecordSynced(...args),
  markSyncItemCompletedIfUnchanged: (...args: unknown[]) => mockMarkSyncItemCompletedIfUnchanged(...args),
  markSyncItemFailedIfUnchanged: (...args: unknown[]) => mockMarkSyncItemFailedIfUnchanged(...args),
  setPendingSyncItemServerRecordId: jest.fn(),
}));

import {
  cleanup,
  migrateNewlyMappedLegacyRecords,
  triggerManualSync,
} from "../lib/sync-engine";

describe("newly mapped offline record sync", () => {
  const originalDomain = process.env.EXPO_PUBLIC_DOMAIN;
  const legacyKey = "bde_dairy_mastitis_records";
  const markerKey = `bde_table_map_migration_v1_${legacyKey}`;
  const legacyRecord = {
    id: "mastitis-local-1",
    farmId: "farm-1",
    createdAt: "2026-09-01T10:00:00.000Z",
    cowId: "UK123",
    synced: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_DOMAIN = "example.test";
    mockGetTableForKey.mockImplementation((key: string) => (
      key === legacyKey ? "dairy_mastitis_records" : null
    ));
    mockHasPendingSyncItem.mockResolvedValue(false);
    mockGetPendingSyncCount.mockResolvedValue(0);
    mockClearCompletedSyncItems.mockResolvedValue(undefined);
    mockMarkSyncItemCompletedIfUnchanged.mockResolvedValue(true);
    mockMarkSyncItemFailedIfUnchanged.mockResolvedValue(true);
  });

  afterEach(() => {
    cleanup();
  });

  afterAll(() => {
    process.env.EXPO_PUBLIC_DOMAIN = originalDomain;
  });

  it("migrates a legacy KV row once even if cleanup fails and the migration restarts", async () => {
    const values = new Map<string, string>([
      [legacyKey, JSON.stringify([legacyRecord])],
    ]);
    mockKvGet.mockImplementation(async (key: string) => values.get(key) ?? null);
    mockKvSet.mockImplementation(async (key: string, value: string) => {
      values.set(key, value);
    });
    let legacyDeleteAttempts = 0;
    mockKvDelete.mockImplementation(async (key: string) => {
      if (key === legacyKey && legacyDeleteAttempts++ === 0) {
        throw new Error("interrupted cleanup");
      }
      values.delete(key);
    });

    await migrateNewlyMappedLegacyRecords();
    await migrateNewlyMappedLegacyRecords();

    expect(mockInsertRecord).toHaveBeenCalledTimes(1);
    expect(mockInsertRecord).toHaveBeenCalledWith(
      "dairy_mastitis_records",
      legacyRecord.id,
      legacyRecord.farmId,
      legacyRecord,
      legacyRecord.createdAt,
    );
    expect(mockEnqueueSyncItem).toHaveBeenCalledTimes(1);
    expect(mockEnqueueSyncItem).toHaveBeenCalledWith(
      legacyKey,
      legacyRecord.id,
      legacyRecord,
    );
    expect(values.has(legacyKey)).toBe(false);
    expect(values.has(markerKey)).toBe(false);
  });

  it("marks the mapped local row synced after a successful upload", async () => {
    mockGetPendingSyncItems.mockResolvedValue([{
      id: "queue-1",
      record_type: legacyKey,
      record_id: legacyRecord.id,
      data_json: JSON.stringify(legacyRecord),
      retry_count: 0,
    }]);
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as typeof fetch;

    await triggerManualSync();

    expect(mockMarkRecordSynced).toHaveBeenCalledWith(
      "dairy_mastitis_records",
      legacyRecord.id,
    );
    expect(mockClearCompletedSyncItems).toHaveBeenCalled();
  });
});