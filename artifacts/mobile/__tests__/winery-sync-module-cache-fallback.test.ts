const mockGetPendingSyncItems = jest.fn();
const mockMarkSyncItemCompletedIfUnchanged = jest.fn();
const mockClearCompletedSyncItems = jest.fn();
const mockGetPendingSyncCount = jest.fn();
const mockGetFailedSyncCount = jest.fn();
const mockGetTableForKey = jest.fn();
const mockMarkRecordSynced = jest.fn();
const mockKvGet = jest.fn();

jest.mock("react-native", () => ({
  Platform: { OS: "web" },
}));

jest.mock("../lib/database", () => ({
  clearCompletedSyncItems: (...args: unknown[]) => mockClearCompletedSyncItems(...args),
  deferSyncItemIfUnchanged: jest.fn(),
  deleteRecord: jest.fn(),
  getFailedSyncCount: (...args: unknown[]) => mockGetFailedSyncCount(...args),
  getPendingSyncCount: (...args: unknown[]) => mockGetPendingSyncCount(...args),
  getPendingSyncItems: (...args: unknown[]) => mockGetPendingSyncItems(...args),
  getTableForKey: (...args: unknown[]) => mockGetTableForKey(...args),
  kvGet: (...args: unknown[]) => mockKvGet(...args),
  kvSet: jest.fn(),
  markRecordSynced: (...args: unknown[]) => mockMarkRecordSynced(...args),
  markSyncItemCompletedIfUnchanged: (...args: unknown[]) =>
    mockMarkSyncItemCompletedIfUnchanged(...args),
  markSyncItemFailedIfUnchanged: jest.fn(),
  setPendingSyncItemServerRecordId: jest.fn(),
  insertRecord: jest.fn(),
  enqueueSyncItem: jest.fn(),
  hasPendingSyncItem: jest.fn(),
  kvDelete: jest.fn(),
}));

import { cleanup, triggerManualSync } from "../lib/sync-engine";

describe("winery sync with a cold current module cache", () => {
  const originalDomain = process.env.EXPO_PUBLIC_DOMAIN;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_DOMAIN = "mobile.example.test";
    mockGetPendingSyncItems.mockResolvedValue([{
      id: "queue-winery-1",
      record_type: "bde_winery_cellar_ops",
      record_id: "local-winery-1",
      data_json: JSON.stringify({
        id: "local-winery-1",
        farmId: "farm-1",
        vesselId: "tank-7",
        operation: "Racking",
      }),
      retry_count: 0,
    }]);
    mockGetPendingSyncCount.mockResolvedValue(1);
    mockGetFailedSyncCount.mockResolvedValue(0);
    mockMarkSyncItemCompletedIfUnchanged.mockResolvedValue(true);
    mockGetTableForKey.mockReturnValue("winery_cellar_ops");
    mockClearCompletedSyncItems.mockResolvedValue(undefined);
    mockKvGet.mockImplementation(async (key: string) => {
      if (key === "bde_last_known_active_module_keys_farm-1") {
        return JSON.stringify(["viticulture"]);
      }
      if (key === "bde_current_farm") {
        return JSON.stringify({ tenantSlug: "device-test" });
      }
      return null;
    });
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as typeof fetch;
  });

  afterEach(() => {
    cleanup();
  });

  afterAll(() => {
    process.env.EXPO_PUBLIC_DOMAIN = originalDomain;
  });

  it("uploads using the last-known module keys without a current-session cache", async () => {
    await triggerManualSync();

    expect(mockKvGet).toHaveBeenCalledWith("bde_active_module_keys_farm-1");
    expect(mockKvGet).toHaveBeenCalledWith("bde_last_known_active_module_keys_farm-1");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://mobile.example.test/api/farms/farm-1/winery-cellar-ops",
      expect.objectContaining({ method: "POST" }),
    );
    expect(mockMarkSyncItemCompletedIfUnchanged).toHaveBeenCalled();
    expect(mockMarkRecordSynced).toHaveBeenCalledWith(
      "winery_cellar_ops",
      "local-winery-1",
    );
  });
});