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
    .mockReturnValue("queue-extra"),
}));

import {
  enqueueSyncItem,
  getPendingSyncItems,
  getRecordById,
  insertRecord,
  requestPendingSyncItemDiscard,
  setPendingSyncItemServerRecordId,
} from "../lib/database";
import { savePendingSprayRevision } from "../lib/sprayPendingEdit";
import { STORAGE_KEYS } from "../lib/storage";
import { cleanup, scheduleSync, triggerManualSync } from "../lib/sync-engine";

describe("pending spray record sync races", () => {
  const originalDomain = process.env.EXPO_PUBLIC_DOMAIN;

  beforeEach(() => {
    mockStorage.clear();
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_DOMAIN = "example.test";
  });

  afterEach(() => {
    cleanup();
  });

  afterAll(() => {
    process.env.EXPO_PUBLIC_DOMAIN = originalDomain;
  });

  it("replays an edit saved while the original create is uploading", async () => {
    const originalRecord = {
      id: "local-spray-edit",
      farmId: "farm-1",
      productName: "Original product",
      fieldName: "North Field",
      targetCrop: "Wheat",
      startTime: "2026-09-02T09:00:00.000Z",
      synced: false,
    };
    await insertRecord(
      "spray_records",
      originalRecord.id,
      originalRecord.farmId,
      originalRecord,
      originalRecord.startTime,
    );
    await enqueueSyncItem(STORAGE_KEYS.SPRAY_RECORDS, originalRecord.id, originalRecord);

    let resolveCreate!: (value: { ok: boolean; json: () => Promise<unknown> }) => void;
    const createResponse = new Promise<{ ok: boolean; json: () => Promise<unknown> }>((resolve) => {
      resolveCreate = resolve;
    });
    const fetchMock = jest.fn()
      .mockReturnValueOnce(createResponse)
      .mockResolvedValue({ ok: true });
    global.fetch = fetchMock as typeof fetch;

    const activeCreate = triggerManualSync();
    for (let attempt = 0; attempt < 20 && fetchMock.mock.calls.length === 0; attempt++) {
      await new Promise(resolve => setImmediate(resolve));
    }

    const editedRecord = { ...originalRecord, productName: "Corrected product" };
    expect(await savePendingSprayRevision({
      localId: originalRecord.id,
      updatedRecord: editedRecord,
    })).toBe("pending_updated");

    resolveCreate({
      ok: true,
      json: async () => ({ record: { id: 91 } }),
    });
    await activeCreate;

    let pending = await getPendingSyncItems();
    expect(pending).toHaveLength(1);
    expect(JSON.parse(pending[0].data_json)).toEqual(expect.objectContaining({
      productName: "Corrected product",
      _serverRecordId: 91,
    }));

    await triggerManualSync();

    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://example.test/api/farms/farm-1/spray-applications/91",
      expect.objectContaining({
        method: "PUT",
        body: expect.stringContaining('"productName":"Corrected product"'),
      }),
    );
    pending = await getPendingSyncItems();
    expect(pending).toHaveLength(0);
  });

  it("queues a PUT when the form saves after the create already completed", async () => {
    const originalRecord = {
      id: "local-spray-late",
      farmId: "farm-1",
      productName: "Original product",
      fieldName: "North Field",
      targetCrop: "Wheat",
      startTime: "2026-09-02T09:00:00.000Z",
      synced: false,
    };
    await insertRecord(
      "spray_records",
      originalRecord.id,
      originalRecord.farmId,
      originalRecord,
      originalRecord.startTime,
    );
    await enqueueSyncItem(STORAGE_KEYS.SPRAY_RECORDS, originalRecord.id, originalRecord);

    const fetchMock = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ record: { id: 92 } }),
      })
      .mockResolvedValue({ ok: true });
    global.fetch = fetchMock as typeof fetch;

    await triggerManualSync();
    await triggerManualSync();
    expect(await getPendingSyncItems()).toHaveLength(0);

    expect(await savePendingSprayRevision({
      localId: originalRecord.id,
      updatedRecord: { ...originalRecord, productName: "Late correction" },
    })).toBe("server_edit_queued");

    await triggerManualSync();

    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://example.test/api/farms/farm-1/spray-applications/92",
      expect.objectContaining({
        method: "PUT",
        body: expect.stringContaining('"productName":"Late correction"'),
      }),
    );
  });

  it("preserves a resolved server ID when saving before the follow-up PUT", async () => {
    const originalRecord = {
      id: "local-spray-reconciled",
      farmId: "farm-1",
      productName: "Original product",
      fieldName: "North Field",
      targetCrop: "Wheat",
      startTime: "2026-09-02T09:00:00.000Z",
      synced: false,
    };
    await insertRecord(
      "spray_records",
      originalRecord.id,
      originalRecord.farmId,
      originalRecord,
      originalRecord.startTime,
    );
    await enqueueSyncItem(STORAGE_KEYS.SPRAY_RECORDS, originalRecord.id, originalRecord);
    const [queuedCreate] = await getPendingSyncItems();
    expect(await setPendingSyncItemServerRecordId(queuedCreate.id, 94)).toBe(true);

    expect(await savePendingSprayRevision({
      localId: originalRecord.id,
      updatedRecord: { ...originalRecord, productName: "Correction after create" },
    })).toBe("pending_updated");

    const [pendingRevision] = await getPendingSyncItems();
    expect(JSON.parse(pendingRevision.data_json)).toEqual(expect.objectContaining({
      productName: "Correction after create",
      _serverRecordId: 94,
    }));

    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as typeof fetch;
    await triggerManualSync();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.test/api/farms/farm-1/spray-applications/94",
      expect.objectContaining({ method: "PUT" }),
    );
  });

  it("deletes the server row when discard races with its create upload", async () => {
    const originalRecord = {
      id: "local-spray-discard",
      farmId: "farm-1",
      productName: "Discard me",
      fieldName: "North Field",
      targetCrop: "Wheat",
      startTime: "2026-09-02T09:00:00.000Z",
      synced: false,
    };
    await insertRecord(
      "spray_records",
      originalRecord.id,
      originalRecord.farmId,
      originalRecord,
      originalRecord.startTime,
    );
    await enqueueSyncItem(STORAGE_KEYS.SPRAY_RECORDS, originalRecord.id, originalRecord);

    let resolveCreate!: (value: { ok: boolean; json: () => Promise<unknown> }) => void;
    const createResponse = new Promise<{ ok: boolean; json: () => Promise<unknown> }>((resolve) => {
      resolveCreate = resolve;
    });
    const fetchMock = jest.fn()
      .mockReturnValueOnce(createResponse)
      .mockResolvedValue({ ok: true });
    global.fetch = fetchMock as typeof fetch;

    const activeCreate = triggerManualSync();
    for (let attempt = 0; attempt < 20 && fetchMock.mock.calls.length === 0; attempt++) {
      await new Promise(resolve => setImmediate(resolve));
    }

    expect(await requestPendingSyncItemDiscard(
      STORAGE_KEYS.SPRAY_RECORDS,
      originalRecord.id,
    )).toBe(true);
    await scheduleSync(0);
    resolveCreate({
      ok: true,
      json: async () => ({ record: { id: 93 } }),
    });
    await activeCreate;

    for (let attempt = 0; attempt < 50 && fetchMock.mock.calls.length < 2; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://example.test/api/farms/farm-1/spray-applications/93",
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(await getPendingSyncItems()).toHaveLength(0);
    expect(await getRecordById("spray_records", originalRecord.id)).toBeNull();
  });

  it("reuses the mobile ID after a lost create response before discarding", async () => {
    const originalRecord = {
      id: "local-spray-lost-response",
      farmId: "farm-1",
      productName: "Discard after retry",
      fieldName: "North Field",
      targetCrop: "Wheat",
      startTime: "2026-09-02T09:00:00.000Z",
      synced: false,
    };
    await insertRecord(
      "spray_records",
      originalRecord.id,
      originalRecord.farmId,
      originalRecord,
      originalRecord.startTime,
    );
    await enqueueSyncItem(STORAGE_KEYS.SPRAY_RECORDS, originalRecord.id, originalRecord);

    let serverRecord: Record<string, unknown> | null = null;
    let createCount = 0;
    const fetchMock = jest.fn(async (_url: string, init: RequestInit) => {
      if (init.method === "POST") {
        const body = JSON.parse(String(init.body)) as Record<string, unknown>;
        if (!serverRecord) {
          serverRecord = { ...body, id: 95 };
          createCount++;
          throw new Error("response lost after server commit");
        }
        return { ok: true, json: async () => ({ record: serverRecord }) };
      }
      if (init.method === "DELETE") {
        serverRecord = null;
        return { ok: true };
      }
      return { ok: true };
    });
    global.fetch = fetchMock as typeof fetch;

    await triggerManualSync();
    expect(createCount).toBe(1);
    expect(await requestPendingSyncItemDiscard(
      STORAGE_KEYS.SPRAY_RECORDS,
      originalRecord.id,
    )).toBe(true);

    await triggerManualSync();
    await triggerManualSync();

    const postBodies = fetchMock.mock.calls
      .filter(([, init]) => init.method === "POST")
      .map(([, init]) => JSON.parse(String(init.body)) as Record<string, unknown>);
    expect(postBodies).toHaveLength(2);
    expect(postBodies.map(body => body.mobileRecordId)).toEqual([
      originalRecord.id,
      originalRecord.id,
    ]);
    expect(createCount).toBe(1);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://example.test/api/farms/farm-1/spray-applications/95",
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(serverRecord).toBeNull();
  });
});