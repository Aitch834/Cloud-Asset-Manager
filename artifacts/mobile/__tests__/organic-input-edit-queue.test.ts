const mockStorage = new Map<string, string>();
const mockAsyncStorage = {
  getItem: jest.fn(async (key: string) => mockStorage.get(key) ?? null),
  setItem: jest.fn(async (key: string, value: string) => {
    mockStorage.set(key, value);
  }),
  removeItem: jest.fn(async (key: string) => {
    mockStorage.delete(key);
  }),
  getAllKeys: jest.fn(async () => Array.from(mockStorage.keys())),
  multiRemove: jest.fn(async (keys: string[]) => {
    keys.forEach(key => mockStorage.delete(key));
  }),
};

jest.mock("react-native", () => ({
  Platform: { OS: "web" },
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: (...args: [string]) => mockAsyncStorage.getItem(...args),
    setItem: (...args: [string, string]) => mockAsyncStorage.setItem(...args),
    removeItem: (...args: [string]) => mockAsyncStorage.removeItem(...args),
    getAllKeys: () => mockAsyncStorage.getAllKeys(),
    multiRemove: (...args: [string[]]) => mockAsyncStorage.multiRemove(...args),
  },
}));

jest.mock("expo-crypto", () => ({
  randomUUID: jest.fn()
    .mockReturnValueOnce("queue-1")
    .mockReturnValueOnce("queue-2")
    .mockReturnValue("queue-extra"),
}));

import { getPendingSyncItems, replacePendingSyncItem } from "../lib/database";
import { ORGANIC_INPUT_EDIT_RECORD_TYPE } from "../lib/organicInputOfflineEdit";

describe("organic input pending edit queue", () => {
  beforeEach(() => {
    mockStorage.clear();
    jest.clearAllMocks();
  });

  it("serializes concurrent saves so only the latest edit remains", async () => {
    await Promise.all([
      replacePendingSyncItem(ORGANIC_INPUT_EDIT_RECORD_TYPE, "42", {
        farmId: "farm-1",
        serverRecordId: 42,
        changes: { productName: "First edit" },
      }),
      replacePendingSyncItem(ORGANIC_INPUT_EDIT_RECORD_TYPE, "42", {
        farmId: "farm-1",
        serverRecordId: 42,
        changes: { productName: "Latest edit" },
      }),
    ]);

    const pending = await getPendingSyncItems();
    expect(pending).toHaveLength(1);
    expect(JSON.parse(pending[0].data_json)).toEqual({
      farmId: "farm-1",
      serverRecordId: 42,
      changes: { productName: "Latest edit" },
    });
  });

  it("collapses old duplicate rows before replay", async () => {
    mockStorage.set("bde_sync_queue", JSON.stringify([
      {
        id: "old-1",
        record_type: ORGANIC_INPUT_EDIT_RECORD_TYPE,
        record_id: "42",
        data_json: JSON.stringify({ changes: { productName: "Old" } }),
        status: "pending",
        retry_count: 2,
        created_at: "2026-08-20T10:00:00.000Z",
      },
      {
        id: "old-2",
        record_type: ORGANIC_INPUT_EDIT_RECORD_TYPE,
        record_id: "42",
        data_json: JSON.stringify({ changes: { productName: "Stale" } }),
        status: "pending",
        retry_count: 1,
        created_at: "2026-08-20T11:00:00.000Z",
      },
    ]));

    await replacePendingSyncItem(ORGANIC_INPUT_EDIT_RECORD_TYPE, "42", {
      farmId: "farm-1",
      serverRecordId: 42,
      changes: { productName: "Newest" },
    });

    const pending = await getPendingSyncItems();
    expect(pending).toHaveLength(1);
    expect(JSON.parse(pending[0].data_json).changes.productName).toBe("Newest");
    expect(pending[0].retry_count).toBe(0);
  });
});