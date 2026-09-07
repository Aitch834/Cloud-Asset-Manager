const mockGetPendingSyncItems = jest.fn();
const mockMarkSyncItemCompletedIfUnchanged = jest.fn();
const mockMarkSyncItemFailedIfUnchanged = jest.fn();
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
  kvDelete: jest.fn(),
  hasPendingSyncItem: jest.fn(),
  markRecordSynced: (...args: unknown[]) => mockMarkRecordSynced(...args),
  markSyncItemCompletedIfUnchanged: (...args: unknown[]) =>
    mockMarkSyncItemCompletedIfUnchanged(...args),
  markSyncItemFailedIfUnchanged: (...args: unknown[]) =>
    mockMarkSyncItemFailedIfUnchanged(...args),
  setPendingSyncItemServerRecordId: jest.fn(),
  insertRecord: jest.fn(),
  enqueueSyncItem: jest.fn(),
}));

import {
  cleanup,
  dismissModuleUnavailableNotice,
  getState,
  triggerManualSync,
} from "../lib/sync-engine";

describe("confirmed module-unavailable rejection", () => {
  const originalDomain = process.env.EXPO_PUBLIC_DOMAIN;

  beforeEach(() => {
    jest.clearAllMocks();
    dismissModuleUnavailableNotice();
    process.env.EXPO_PUBLIC_DOMAIN = "mobile.example.test";
    mockGetPendingSyncItems.mockResolvedValue([{
      id: "queue-irrigation",
      record_type: "bde_irrigation_meter_readings",
      record_id: "local-irrigation",
      data_json: JSON.stringify({ farmId: "farm-1", reading: 100 }),
      retry_count: 0,
    }]);
    mockGetPendingSyncCount.mockResolvedValue(0);
    mockGetFailedSyncCount.mockResolvedValue(0);
    mockMarkSyncItemCompletedIfUnchanged.mockResolvedValue(true);
    mockGetTableForKey.mockReturnValue("irrigation_meter_readings");
    mockKvGet.mockImplementation(async (key: string) => {
      if (key === "bde_active_module_keys_farm-1") {
        return JSON.stringify(["livestock"]);
      }
      if (key === "bde_current_farm") {
        return JSON.stringify({ tenantSlug: "device-test" });
      }
      return null;
    });
    global.fetch = jest.fn() as typeof fetch;
  });

  afterEach(() => cleanup());

  afterAll(() => {
    process.env.EXPO_PUBLIC_DOMAIN = originalDomain;
  });

  it("clears the record and surfaces a non-retry notice", async () => {
    await triggerManualSync();

    expect(mockMarkSyncItemCompletedIfUnchanged).toHaveBeenCalled();
    expect(mockMarkRecordSynced).toHaveBeenCalledWith(
      "irrigation_meter_readings",
      "local-irrigation",
    );
    expect(mockMarkSyncItemFailedIfUnchanged).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(getState()).toEqual(expect.objectContaining({
      pendingCount: 0,
      failedCount: 0,
      lastError: null,
      moduleUnavailableNotice:
        "An offline record was not added because the relevant module is unavailable for the selected farm. The record was removed from the sync queue; after the module is enabled, it must be entered again.",
    }));
  });
});

describe.each([402, 403])("ambiguous HTTP rejection (%i)", (status) => {
  const originalDomain = process.env.EXPO_PUBLIC_DOMAIN;

  beforeEach(() => {
    jest.clearAllMocks();
    dismissModuleUnavailableNotice();
    process.env.EXPO_PUBLIC_DOMAIN = "mobile.example.test";
    mockGetPendingSyncItems.mockResolvedValue([{
      id: `queue-${status}`,
      record_type: "bde_fuel_meter_readings",
      record_id: `local-${status}`,
      data_json: JSON.stringify({ farmId: "farm-1", reading: 100 }),
      retry_count: 0,
    }]);
    mockGetPendingSyncCount.mockResolvedValue(1);
    mockGetFailedSyncCount.mockResolvedValue(1);
    mockMarkSyncItemFailedIfUnchanged.mockResolvedValue(true);
    mockGetTableForKey.mockReturnValue("fuel_meter_readings");
    mockKvGet.mockImplementation(async (key: string) =>
      key === "bde_current_farm"
        ? JSON.stringify({ tenantSlug: "device-test" })
        : null);
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status }) as typeof fetch;
  });

  afterEach(() => cleanup());

  afterAll(() => {
    process.env.EXPO_PUBLIC_DOMAIN = originalDomain;
  });

  it("stays failed and retryable instead of being discarded", async () => {
    await triggerManualSync();

    expect(mockMarkSyncItemFailedIfUnchanged).toHaveBeenCalledWith(
      `queue-${status}`,
      expect.any(String),
      `Server responded with ${status}`,
      expect.any(String),
    );
    expect(mockMarkSyncItemCompletedIfUnchanged).not.toHaveBeenCalled();
    expect(mockMarkRecordSynced).not.toHaveBeenCalled();
    expect(getState()).toEqual(expect.objectContaining({
      failedCount: 1,
      moduleUnavailableNotice: null,
    }));
  });
});