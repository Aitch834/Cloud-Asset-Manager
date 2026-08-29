const mockGetPendingSyncItems = jest.fn();
const mockMarkSyncItemCompletedIfUnchanged = jest.fn();
const mockMarkSyncItemFailedIfUnchanged = jest.fn();
const mockSetPendingSyncItemServerRecordId = jest.fn();
const mockClearCompletedSyncItems = jest.fn();
const mockGetPendingSyncCount = jest.fn();

jest.mock("react-native", () => ({
  Platform: { OS: "web" },
}));

jest.mock("../lib/database", () => ({
  clearCompletedSyncItems: (...args: unknown[]) => mockClearCompletedSyncItems(...args),
  getPendingSyncCount: (...args: unknown[]) => mockGetPendingSyncCount(...args),
  getPendingSyncItems: (...args: unknown[]) => mockGetPendingSyncItems(...args),
  getTableForKey: jest.fn(() => null),
  hasPendingSyncItem: jest.fn(),
  insertRecord: jest.fn(),
  enqueueSyncItem: jest.fn(),
  kvDelete: jest.fn(),
  kvGet: jest.fn(async () => null),
  kvSet: jest.fn(),
  markRecordSynced: jest.fn(),
  markSyncItemCompletedIfUnchanged: (...args: unknown[]) => mockMarkSyncItemCompletedIfUnchanged(...args),
  markSyncItemFailedIfUnchanged: (...args: unknown[]) => mockMarkSyncItemFailedIfUnchanged(...args),
  setPendingSyncItemServerRecordId: (...args: unknown[]) => mockSetPendingSyncItemServerRecordId(...args),
}));

import { cleanup, triggerManualSync } from "../lib/sync-engine";

describe("organic input offline edit sync", () => {
  const originalDomain = process.env.EXPO_PUBLIC_DOMAIN;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_DOMAIN = "example.test";
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

  it("replays a queued edit as a PUT to the existing server record", async () => {
    mockGetPendingSyncItems.mockResolvedValue([{
      id: "queue-1",
      record_type: "bde_organic_input_edits",
      record_id: "42",
      data_json: JSON.stringify({
        farmId: "farm-7",
        serverRecordId: 42,
        changes: {
          productName: "Updated lime",
          quantityAmount: "12",
          notes: null,
        },
      }),
      retry_count: 0,
    }]);
    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as typeof fetch;

    await triggerManualSync();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.test/api/farms/farm-7/organic/inputs/42",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          productName: "Updated lime",
          quantityAmount: "12",
          notes: null,
        }),
      }),
    );
    expect(mockMarkSyncItemCompletedIfUnchanged).toHaveBeenCalledWith(
      "queue-1",
      expect.any(String),
    );
    expect(mockClearCompletedSyncItems).toHaveBeenCalled();
  });

  it("rejects malformed edit data instead of sending or silently clearing it", async () => {
    mockGetPendingSyncItems.mockResolvedValue([{
      id: "queue-bad",
      record_type: "bde_organic_input_edits",
      record_id: "42",
      data_json: JSON.stringify({
        farmId: "farm-7",
        serverRecordId: 42,
        changes: {},
      }),
      retry_count: 0,
    }]);
    const fetchMock = jest.fn();
    global.fetch = fetchMock as typeof fetch;

    await triggerManualSync();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockMarkSyncItemFailedIfUnchanged).toHaveBeenCalledWith(
      "queue-bad",
      expect.any(String),
      "Invalid queued organic input edit",
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
    );
  });

  it.each([402, 403])(
    "clears a queued module-gated record when the server responds with %s",
    async (status) => {
      mockGetPendingSyncItems.mockResolvedValue([{
        id: `queue-${status}`,
        record_type: "bde_biofuel_field_declarations",
        record_id: "record-1",
        data_json: JSON.stringify({
          farmId: "farm-7",
          fieldId: 12,
          eligible: true,
        }),
        retry_count: 4,
      }]);
      const fetchMock = jest.fn().mockResolvedValue({ ok: false, status });
      global.fetch = fetchMock as typeof fetch;

      await triggerManualSync();

      expect(fetchMock).toHaveBeenCalled();
      expect(mockMarkSyncItemCompletedIfUnchanged).toHaveBeenCalledWith(
        `queue-${status}`,
        expect.any(String),
      );
      expect(mockMarkSyncItemFailedIfUnchanged).not.toHaveBeenCalled();
    },
  );
});