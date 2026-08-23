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
  clearCompletedSyncItems,
  enqueueSyncItem,
  getRecordById,
  getPendingSyncItems,
  insertRecord,
  markSyncItemCompletedIfUnchanged,
  replacePendingSyncItem,
  requestPendingSyncItemDiscard,
  setPendingSyncItemServerRecordId,
  updatePendingSyncItem,
} from "../lib/database";
import { ORGANIC_INPUT_EDIT_RECORD_TYPE } from "../lib/organicInputOfflineEdit";
import { savePendingOrganicInputRevision } from "../lib/organicInputPendingEdit";
import { STORAGE_KEYS } from "../lib/storage";
import { cleanup, scheduleSync, triggerManualSync } from "../lib/sync-engine";

describe("organic input edit replacement during sync", () => {
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

  it("keeps and replays a newer edit saved while the old payload is uploading", async () => {
    await replacePendingSyncItem(ORGANIC_INPUT_EDIT_RECORD_TYPE, "42", {
      farmId: "farm-1",
      serverRecordId: 42,
      changes: { productName: "Payload A" },
    });

    let resolveFirstUpload!: (value: { ok: boolean }) => void;
    const firstUpload = new Promise<{ ok: boolean }>((resolve) => {
      resolveFirstUpload = resolve;
    });
    const fetchMock = jest.fn()
      .mockReturnValueOnce(firstUpload)
      .mockResolvedValue({ ok: true });
    global.fetch = fetchMock as typeof fetch;

    const firstSync = triggerManualSync();
    for (let attempt = 0; attempt < 20 && fetchMock.mock.calls.length === 0; attempt++) {
      await new Promise(resolve => setImmediate(resolve));
    }
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await replacePendingSyncItem(ORGANIC_INPUT_EDIT_RECORD_TYPE, "42", {
      farmId: "farm-1",
      serverRecordId: 42,
      changes: { productName: "Payload B" },
    });
    resolveFirstUpload({ ok: true });
    await firstSync;

    let pending = await getPendingSyncItems();
    expect(pending).toHaveLength(1);
    expect(JSON.parse(pending[0].data_json).changes.productName).toBe("Payload B");

    await triggerManualSync();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://example.test/api/farms/farm-1/organic/inputs/42",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ productName: "Payload B" }),
      }),
    );
    pending = await getPendingSyncItems();
    expect(pending).toHaveLength(0);
  });

  it("keeps and replays a pending new record edited while its original payload is uploading", async () => {
    const originalRecord = {
      id: "local-1",
      farmId: "farm-1",
      productName: "Payload A",
      dateOfUse: "2026-08-22",
      synced: false,
    };
    await enqueueSyncItem(STORAGE_KEYS.ORGANIC_INPUTS, "local-1", originalRecord);

    let serverRecord: Record<string, unknown> | null = null;
    let resolveFirstUpload!: (value: { ok: boolean; json: () => Promise<unknown> }) => void;
    const firstUpload = new Promise<{ ok: boolean; json: () => Promise<unknown> }>((resolve) => {
      resolveFirstUpload = resolve;
    });
    const fetchMock = jest.fn()
      .mockReturnValueOnce(firstUpload)
      .mockImplementationOnce(async (_url: string, init: RequestInit) => {
        const body = JSON.parse(String(init.body)) as Record<string, unknown>;
        serverRecord = { ...serverRecord, ...body, id: 77 };
        return { ok: true };
      });
    global.fetch = fetchMock as typeof fetch;

    const firstSync = triggerManualSync();
    for (let attempt = 0; attempt < 20 && fetchMock.mock.calls.length === 0; attempt++) {
      await new Promise(resolve => setImmediate(resolve));
    }
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const editedRecord = { ...originalRecord, productName: "Payload B" };
    expect(
      await updatePendingSyncItem(STORAGE_KEYS.ORGANIC_INPUTS, "local-1", editedRecord),
    ).toBe(true);
    serverRecord = { ...JSON.parse(String(fetchMock.mock.calls[0][1]?.body)), id: 77 };
    resolveFirstUpload({
      ok: true,
      json: async () => ({ record: serverRecord }),
    });
    await firstSync;

    let pending = await getPendingSyncItems();
    expect(pending).toHaveLength(1);
    expect(JSON.parse(pending[0].data_json)).toEqual(
      expect.objectContaining({
        productName: "Payload B",
        _serverRecordId: 77,
      }),
    );

    await triggerManualSync();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://example.test/api/farms/farm-1/organic/inputs/77",
      expect.objectContaining({
        method: "PUT",
        body: expect.stringContaining('"productName":"Payload B"'),
      }),
    );
    expect(serverRecord?.productName).toBe("Payload B");
    pending = await getPendingSyncItems();
    expect(pending).toHaveLength(0);
  });

  it("queues a PUT when a pending-record form is saved after create sync already completed", async () => {
    const originalRecord = {
      id: "local-late",
      farmId: "farm-1",
      productName: "Payload A",
      dateOfUse: "2026-08-22",
      synced: false,
    };
    await insertRecord(
      "organic_inputs",
      "local-late",
      "farm-1",
      originalRecord,
      "2026-08-22T12:00:00.000Z",
    );
    await enqueueSyncItem(STORAGE_KEYS.ORGANIC_INPUTS, "local-late", originalRecord);

    let serverRecord: Record<string, unknown> | null = null;
    const fetchMock = jest.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body)) as Record<string, unknown>;
      if (init.method === "POST") {
        serverRecord = { ...body, id: 88 };
        return {
          ok: true,
          json: async () => ({ record: serverRecord }),
        };
      }
      serverRecord = { ...serverRecord, ...body, id: 88 };
      return { ok: true };
    });
    global.fetch = fetchMock as typeof fetch;

    // The background create and its reconciliation PUT both finish before the
    // grower taps Save in a form that was opened while this row was pending.
    await triggerManualSync();
    await triggerManualSync();
    expect(await getPendingSyncItems()).toHaveLength(0);
    expect(
      await getRecordById<Record<string, unknown>>("organic_inputs", "local-late"),
    ).toEqual(expect.objectContaining({ _serverRecordId: 88 }));

    const editedRecord = { ...originalRecord, productName: "Payload B" };
    const outcome = await savePendingOrganicInputRevision({
      localId: "local-late",
      farmId: "farm-1",
      updatedRecord: editedRecord,
      changes: {
        productName: "Payload B",
        dateOfUse: "2026-08-22",
        approvalStatus: "permitted",
      },
    });
    expect(outcome).toBe("server_edit_queued");

    await triggerManualSync();

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://example.test/api/farms/farm-1/organic/inputs/88",
      expect.objectContaining({
        method: "PUT",
        body: expect.stringContaining('"productName":"Payload B"'),
      }),
    );
    expect(serverRecord?.productName).toBe("Payload B");
    expect(await getPendingSyncItems()).toHaveLength(0);
  });

  it("retains the server ID if fallback storage is interrupted before the queue marker write", async () => {
    const originalRecord = {
      id: "local-interrupted",
      farmId: "farm-1",
      productName: "Payload A",
      dateOfUse: "2026-08-22",
      synced: false,
    };
    await insertRecord(
      "organic_inputs",
      "local-interrupted",
      "farm-1",
      originalRecord,
      "2026-08-22T12:00:00.000Z",
    );
    await enqueueSyncItem(
      STORAGE_KEYS.ORGANIC_INPUTS,
      "local-interrupted",
      originalRecord,
    );
    const [queuedCreate] = await getPendingSyncItems();

    mockAsyncStorage.setItem.mockClear();
    mockAsyncStorage.setItem
      .mockImplementationOnce(async (key: string, value: string) => {
        mockStorage.set(key, value);
      })
      .mockRejectedValueOnce(new Error("simulated process interruption"));

    await expect(
      setPendingSyncItemServerRecordId(queuedCreate.id, 99),
    ).rejects.toThrow("simulated process interruption");
    expect(mockAsyncStorage.setItem).toHaveBeenNthCalledWith(
      1,
      "bde_record_organic_inputs_local-interrupted",
      expect.stringContaining('"_serverRecordId":99'),
    );
    expect(mockAsyncStorage.setItem).toHaveBeenNthCalledWith(
      2,
      "bde_sync_queue",
      expect.stringContaining("_serverRecordId"),
    );
    expect(
      await getRecordById<Record<string, unknown>>(
        "organic_inputs",
        "local-interrupted",
      ),
    ).toEqual(expect.objectContaining({ _serverRecordId: 99 }));

    // Emulate restart/recovery after the interruption, with the already-created
    // queue row gone. The local pointer must still rescue the open form's save.
    mockAsyncStorage.setItem.mockImplementation(async (key: string, value: string) => {
      mockStorage.set(key, value);
    });
    expect(
      await markSyncItemCompletedIfUnchanged(
        queuedCreate.id,
        queuedCreate.data_json,
      ),
    ).toBe(true);
    await clearCompletedSyncItems();

    const outcome = await savePendingOrganicInputRevision({
      localId: "local-interrupted",
      farmId: "farm-1",
      updatedRecord: { ...originalRecord, productName: "Payload B" },
      changes: {
        productName: "Payload B",
        dateOfUse: "2026-08-22",
        approvalStatus: "permitted",
      },
    });
    expect(outcome).toBe("server_edit_queued");

    let serverRecord: Record<string, unknown> = { id: 99, productName: "Payload A" };
    const fetchMock = jest.fn(async (_url: string, init: RequestInit) => {
      serverRecord = {
        ...serverRecord,
        ...JSON.parse(String(init.body)),
        id: 99,
      };
      return { ok: true };
    });
    global.fetch = fetchMock as typeof fetch;

    await triggerManualSync();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.test/api/farms/farm-1/organic/inputs/99",
      expect.objectContaining({ method: "PUT" }),
    );
    expect(serverRecord.productName).toBe("Payload B");
    expect(await getPendingSyncItems()).toHaveLength(0);
  });

  it("runs a follow-up pass when an edit is queued during another upload", async () => {
    await replacePendingSyncItem(ORGANIC_INPUT_EDIT_RECORD_TYPE, "201", {
      farmId: "farm-1",
      serverRecordId: 201,
      changes: { productName: "First edit" },
    });

    let resolveFirstUpload!: (value: { ok: boolean }) => void;
    const firstUpload = new Promise<{ ok: boolean }>((resolve) => {
      resolveFirstUpload = resolve;
    });
    const fetchMock = jest.fn()
      .mockReturnValueOnce(firstUpload)
      .mockResolvedValue({ ok: true });
    global.fetch = fetchMock as typeof fetch;

    const activeSync = triggerManualSync();
    for (let attempt = 0; attempt < 20 && fetchMock.mock.calls.length === 0; attempt++) {
      await new Promise(resolve => setImmediate(resolve));
    }
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await replacePendingSyncItem(ORGANIC_INPUT_EDIT_RECORD_TYPE, "202", {
      farmId: "farm-1",
      serverRecordId: 202,
      changes: { productName: "Queued during sync" },
    });
    await scheduleSync(0);
    resolveFirstUpload({ ok: true });
    await activeSync;

    for (let attempt = 0; attempt < 50 && fetchMock.mock.calls.length < 2; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://example.test/api/farms/farm-1/organic/inputs/202",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ productName: "Queued during sync" }),
      }),
    );
    expect(await getPendingSyncItems()).toHaveLength(0);
  });

  it("syncs new work without retrying an unchanged failure before its backoff", async () => {
    await replacePendingSyncItem(ORGANIC_INPUT_EDIT_RECORD_TYPE, "301", {
      farmId: "farm-1",
      serverRecordId: 301,
      changes: { productName: "Temporarily failing edit" },
    });

    let rejectFirstUpload!: (reason: Error) => void;
    const firstUpload = new Promise<never>((_resolve, reject) => {
      rejectFirstUpload = reject;
    });
    const fetchMock = jest.fn()
      .mockReturnValueOnce(firstUpload)
      .mockResolvedValue({ ok: true });
    global.fetch = fetchMock as typeof fetch;

    const activeSync = triggerManualSync();
    for (let attempt = 0; attempt < 20 && fetchMock.mock.calls.length === 0; attempt++) {
      await new Promise(resolve => setImmediate(resolve));
    }
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await replacePendingSyncItem(ORGANIC_INPUT_EDIT_RECORD_TYPE, "302", {
      farmId: "farm-1",
      serverRecordId: 302,
      changes: { productName: "New edit" },
    });
    await scheduleSync(0);
    rejectFirstUpload(new Error("temporary network failure"));
    await activeSync;

    for (let attempt = 0; attempt < 50 && fetchMock.mock.calls.length < 2; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://example.test/api/farms/farm-1/organic/inputs/301",
    );
    expect(fetchMock.mock.calls[1][0]).toBe(
      "https://example.test/api/farms/farm-1/organic/inputs/302",
    );
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const pending = await getPendingSyncItems();
    expect(pending).toHaveLength(1);
    expect(pending[0]).toEqual(expect.objectContaining({
      record_id: "301",
      retry_count: 1,
    }));
    expect(new Date(pending[0].next_attempt_at!).getTime()).toBeGreaterThan(Date.now());
  });

  it("deletes the server row when a pending discard races with its create upload", async () => {
    const originalRecord = {
      id: "local-discard",
      farmId: "farm-1",
      productName: "Discard me",
      dateOfUse: "2026-08-22",
      synced: false,
    };
    await insertRecord(
      "organic_inputs",
      "local-discard",
      "farm-1",
      originalRecord,
      "2026-08-22T12:00:00.000Z",
    );
    await enqueueSyncItem(
      STORAGE_KEYS.ORGANIC_INPUTS,
      "local-discard",
      originalRecord,
    );

    let serverRecord: Record<string, unknown> | null = null;
    let resolveCreate!: (
      value: { ok: boolean; json: () => Promise<unknown> },
    ) => void;
    const createResponse = new Promise<{
      ok: boolean;
      json: () => Promise<unknown>;
    }>((resolve) => {
      resolveCreate = resolve;
    });
    const fetchMock = jest.fn()
      .mockImplementationOnce(async (_url: string, init: RequestInit) => {
        serverRecord = {
          ...JSON.parse(String(init.body)),
          id: 66,
        };
        return createResponse;
      })
      .mockImplementationOnce(async () => {
        serverRecord = null;
        return { ok: true };
      });
    global.fetch = fetchMock as typeof fetch;

    const activeCreate = triggerManualSync();
    for (let attempt = 0; attempt < 20 && fetchMock.mock.calls.length === 0; attempt++) {
      await new Promise(resolve => setImmediate(resolve));
    }
    expect(serverRecord).toEqual(expect.objectContaining({ id: 66 }));

    expect(
      await requestPendingSyncItemDiscard(
        STORAGE_KEYS.ORGANIC_INPUTS,
        "local-discard",
      ),
    ).toBe(true);
    await scheduleSync(0);
    resolveCreate({
      ok: true,
      json: async () => ({ record: { id: 66 } }),
    });
    await activeCreate;

    for (let attempt = 0; attempt < 50 && fetchMock.mock.calls.length < 2; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://example.test/api/farms/farm-1/organic/inputs/66",
      expect.objectContaining({
        method: "DELETE",
      }),
    );
    expect(serverRecord).toBeNull();
    expect(await getPendingSyncItems()).toHaveLength(0);
    expect(
      await getRecordById("organic_inputs", "local-discard"),
    ).toBeNull();
  });
});