const mockGetPendingSyncItems = jest.fn();
const mockMarkSyncItemCompletedIfUnchanged = jest.fn();
const mockClearCompletedSyncItems = jest.fn();
const mockGetPendingSyncCount = jest.fn();
const mockGetFailedSyncCount = jest.fn();
const mockGetTableForKey = jest.fn();
const mockMarkRecordSynced = jest.fn();
const mockKvGet = jest.fn();
const mockKvSet = jest.fn();
const mockNetInfoAddEventListener = jest.fn();
let mockPlatformOS = "ios";

jest.mock("react-native", () => ({
  Platform: {
    get OS() {
      return mockPlatformOS;
    },
  },
}));

jest.mock("@react-native-community/netinfo", () => ({
  __esModule: true,
  default: {
    addEventListener: (...args: unknown[]) => mockNetInfoAddEventListener(...args),
  },
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
  kvSet: (...args: unknown[]) => mockKvSet(...args),
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

jest.mock("../lib/authToken", () => ({
  getCurrentAuthToken: jest.fn().mockResolvedValue("device-token"),
  getMobileAuthToken: jest.fn().mockResolvedValue("device-token"),
}));

import { cleanup, getState, initialize, subscribe } from "../lib/sync-engine";
import { refreshApiModules } from "../lib/hooks/useApiModules";

describe("winery sync after a native device reconnect", () => {
  const originalDomain = process.env.EXPO_PUBLIC_DOMAIN;
  let storage: Map<string, string>;
  let pendingItems: Array<{
    id: string;
    record_type: string;
    record_id: string;
    data_json: string;
    retry_count: number;
  }>;
  let emitNetworkState: ((state: { isConnected: boolean | null }) => void) | undefined;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_DOMAIN = "mobile.example.test";
    storage = new Map([
      ["bde_current_farm", JSON.stringify({ tenantSlug: "device-test" })],
    ]);
    pendingItems = [{
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
    }];
    emitNetworkState = undefined;

    mockGetPendingSyncItems.mockImplementation(async () => pendingItems);
    mockGetPendingSyncCount.mockImplementation(async () => pendingItems.length);
    mockGetFailedSyncCount.mockResolvedValue(0);
    mockMarkSyncItemCompletedIfUnchanged.mockImplementation(async () => {
      pendingItems = [];
      return true;
    });
    mockGetTableForKey.mockReturnValue("winery_cellar_ops");
    mockClearCompletedSyncItems.mockResolvedValue(undefined);
    mockKvGet.mockImplementation(async (key: string) => storage.get(key) ?? null);
    mockKvSet.mockImplementation(async (key: string, value: string) => {
      storage.set(key, value);
    });
    mockNetInfoAddEventListener.mockImplementation(
      (listener: (state: { isConnected: boolean | null }) => void) => {
        emitNetworkState = listener;
        return jest.fn();
      },
    );
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ activeModuleKeys: ["viticulture"] }),
      })
      .mockResolvedValueOnce({ ok: true }) as typeof fetch;
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  afterAll(() => {
    process.env.EXPO_PUBLIC_DOMAIN = originalDomain;
  });

  it.each(["ios", "android"])(
    "uploads the offline cellar record and clears the badge on %s reconnect",
    async (platform) => {
      mockPlatformOS = platform;

      // This represents a successful earlier online session. Both the current
      // and durable last-known module caches are populated by the real module
      // refresh path.
      await refreshApiModules("farm-1");
      expect(storage.get("bde_last_known_active_module_keys_farm-1"))
        .toBe(JSON.stringify(["viticulture"]));

      // A cold current session has no active cache, while the previously
      // populated last-known cache survives on-device.
      storage.delete("bde_active_module_keys_farm-1");

      const observedPendingCounts: number[] = [];
      const unsubscribe = subscribe((syncState) => {
        observedPendingCounts.push(syncState.pendingCount);
      });

      await initialize();
      expect(getState().pendingCount).toBe(1);

      emitNetworkState?.({ isConnected: false });
      expect(getState()).toEqual(expect.objectContaining({
        isConnected: false,
        pendingCount: 1,
      }));

      // Connectivity returns without cleanup/re-initialize, matching a device
      // reconnect while the app remains open.
      emitNetworkState?.({ isConnected: true });
      await jest.advanceTimersByTimeAsync(500);

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
      expect(getState().pendingCount).toBe(0);
      expect(observedPendingCounts).toEqual(expect.arrayContaining([1, 0]));

      unsubscribe();
    },
  );
});
