/**
 * Regression coverage for the complete irrigation retry round-trip.
 *
 * The real screen, database module, and sync engine are used together. Only
 * native SQLite and network boundaries are replaced with deterministic
 * in-memory fixtures.
 */

type QueueRow = {
  id: string;
  record_type: string;
  record_id: string;
  data_json: string;
  status: string;
  retry_count: number;
  last_error: string | null;
  next_attempt_at: string | null;
  created_at: string;
};

const mockQueue: QueueRow[] = [];
const mockKv = new Map<string, string>();

const mockDb = {
  execAsync: jest.fn(async () => undefined),
  withTransactionAsync: jest.fn(async (task: () => Promise<void>) => task()),
  getAllAsync: jest.fn(async (sql: string, params: unknown[] = []) => {
    if (sql.includes("PRAGMA table_info(sync_queue)")) {
      return [{ name: "next_attempt_at" }];
    }
    if (sql.includes("FROM sync_queue") && sql.includes("status IN")) {
      const [recordType, ...statuses] = params.map(String);
      return mockQueue
        .filter(
          (row) =>
            row.record_type === recordType && statuses.includes(row.status),
        )
        .map((row) => ({ ...row }));
    }
    if (
      sql.includes("FROM sync_queue") &&
      sql.includes("status = 'pending'")
    ) {
      return mockQueue
        .filter((row) => row.status === "pending")
        .map((row) => ({ ...row }));
    }
    return [];
  }),
  getFirstAsync: jest.fn(async (sql: string, params: unknown[] = []) => {
    if (sql.includes("COUNT(*)") && sql.includes("status = 'pending'")) {
      return { count: mockQueue.filter((row) => row.status === "pending").length };
    }
    if (sql.includes("FROM kv_store WHERE key = ?")) {
      const value = mockKv.get(String(params[0]));
      return value === undefined ? null : { value };
    }
    return null;
  }),
  runAsync: jest.fn(async (sql: string, params: unknown[] = []) => {
    let changes = 0;
    if (
      sql.includes("UPDATE sync_queue SET status = 'pending'") &&
      sql.includes("WHERE id = ? AND status = 'failed'")
    ) {
      const row = mockQueue.find(
        (candidate) =>
          candidate.id === String(params[0]) && candidate.status === "failed",
      );
      if (row) {
        row.status = "pending";
        row.retry_count = 4;
        row.last_error = null;
        row.next_attempt_at = null;
        changes = 1;
      }
    } else if (
      sql.includes("UPDATE sync_queue SET status = CASE") &&
      sql.includes("last_error = ?") &&
      sql.includes("data_json = ?")
    ) {
      const row = mockQueue.find(
        (candidate) =>
          candidate.id === String(params[2]) &&
          candidate.status === "pending" &&
          candidate.data_json === String(params[3]),
      );
      if (row) {
        row.status = row.retry_count >= 4 ? "failed" : "pending";
        row.retry_count += 1;
        row.last_error = String(params[0]);
        row.next_attempt_at = row.status === "failed" ? null : String(params[1]);
        changes = 1;
      }
    } else if (
      sql.includes("UPDATE sync_queue SET status = 'completed'") &&
      sql.includes("data_json = ?")
    ) {
      const row = mockQueue.find(
        (candidate) =>
          candidate.id === String(params[0]) &&
          candidate.status === "pending" &&
          candidate.data_json === String(params[1]),
      );
      if (row) {
        row.status = "completed";
        changes = 1;
      }
    } else if (sql.includes("DELETE FROM sync_queue WHERE status = 'completed'")) {
      for (let index = mockQueue.length - 1; index >= 0; index -= 1) {
        if (mockQueue[index].status === "completed") {
          mockQueue.splice(index, 1);
          changes += 1;
        }
      }
    } else if (sql.includes("UPDATE records SET synced = 1")) {
      changes = 1;
    }
    return { changes, lastInsertRowId: 0 };
  }),
};

jest.mock("expo-sqlite", () => ({
  openDatabaseAsync: jest.fn(async () => mockDb),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => undefined),
    removeItem: jest.fn(async () => undefined),
    getAllKeys: jest.fn(async () => []),
    multiRemove: jest.fn(async () => undefined),
  },
}));

jest.mock("expo-crypto", () => ({
  randomUUID: jest.fn(() => "unused-test-uuid"),
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
}));

jest.mock("expo/virtual/env", () => ({
  env: process.env,
}));

jest.mock("react-native", () => {
  const React = require("react");
  const host = (name: string) =>
    React.forwardRef(
      (props: Record<string, unknown>, ref: React.Ref<unknown>) =>
        React.createElement(name, { ...props, ref }, props.children),
    );
  const flatten = (style: unknown): Record<string, unknown> => {
    if (!Array.isArray(style)) return (style as Record<string, unknown>) ?? {};
    return style.reduce(
      (merged, item) => ({ ...merged, ...flatten(item) }),
      {} as Record<string, unknown>,
    );
  };
  const View = host("View");
  const Modal = ({
    visible,
    children,
    ...props
  }: {
    visible?: boolean;
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => (visible ? React.createElement("Modal", props, children) : null);
  const FlatList = ({
    data,
    renderItem,
    ListHeaderComponent,
    ListEmptyComponent,
    ...props
  }: {
    data: unknown[];
    renderItem: (info: { item: unknown; index: number }) => React.ReactNode;
    ListHeaderComponent?: React.ReactNode;
    ListEmptyComponent?: React.ReactNode;
    [key: string]: unknown;
  }) =>
    React.createElement(
      View,
      props,
      ListHeaderComponent,
      data.length
        ? data.map((item, index) =>
            React.createElement(
              React.Fragment,
              { key: index },
              renderItem({ item, index }),
            ),
          )
        : ListEmptyComponent,
    );

  return {
    ActivityIndicator: host("ActivityIndicator"),
    Alert: { alert: jest.fn() },
    FlatList,
    KeyboardAvoidingView: host("KeyboardAvoidingView"),
    Modal,
    Platform: { OS: "android" },
    Pressable: host("Pressable"),
    RefreshControl: host("RefreshControl"),
    ScrollView: host("ScrollView"),
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten,
    },
    Text: host("Text"),
    TextInput: host("TextInput"),
    View,
  };
});

jest.mock("@expo/vector-icons", () => ({
  Feather: "Feather",
}));

jest.mock("@react-native-community/datetimepicker", () => ({
  __esModule: true,
  default: "DateTimePicker",
  DateTimePickerAndroid: {
    open: jest.fn(),
    dismiss: jest.fn(),
  },
}));

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("../lib/context/FarmContext", () => ({
  useFarm: () => ({
    currentFarm: { id: 7, name: "Device Test Farm", tenantSlug: "device-test" },
  }),
}));

jest.mock("../lib/apiFetch", () => ({
  apiFetch: jest.fn(),
}));

import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";

import IrrigationHistoryScreen from "../app/irrigation-history";
import { apiFetch } from "../lib/apiFetch";
import { cleanup } from "../lib/sync-engine";

const apiFetchMock = apiFetch as jest.MockedFunction<typeof apiFetch>;

function response(data: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => data,
  } as Response;
}

describe("irrigation history failed upload retry", () => {
  const originalDomain = process.env.EXPO_PUBLIC_DOMAIN;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockQueue.length = 0;
    mockKv.clear();
    process.env.EXPO_PUBLIC_DOMAIN = "mobile.example.test";

    const payload = {
      farmId: 7,
      irrigationDate: "2026-09-02",
      fieldId: 14,
      fieldOrBlockDescription: "North Field",
      cropType: "Potatoes",
      irrigationMethod: "Rain Gun",
      applicationDepthMm: 18,
      areaIrrigatedHa: 2.4,
      operatorName: "Alex",
      notes: "Retry fixture",
    };
    mockQueue.push({
      id: "queue-irrigation-1",
      record_type: "bde_irrigation_applications",
      record_id: "local-irrigation-1",
      data_json: JSON.stringify(payload),
      status: "failed",
      retry_count: 5,
      last_error: "Previous upload timed out",
      next_attempt_at: null,
      created_at: "2026-09-02T10:00:00.000Z",
    });
    mockKv.set("bde_active_module_keys_7", JSON.stringify(["water-irrigation"]));
    mockKv.set(
      "bde_current_farm",
      JSON.stringify({ id: 7, tenantSlug: "device-test" }),
    );

    let serverRows: unknown[] = [];
    apiFetchMock.mockImplementation(async () => response(serverRows));
    globalThis.fetch = jest.fn(async () => {
      serverRows = [
        {
          id: 501,
          irrigationDate: "2026-09-02",
          fieldId: 14,
          fieldName: "North Field",
          fieldOrBlockDescription: null,
          applicationDepthMm: "18",
          irrigationMethod: "Rain Gun",
          cropType: "Potatoes",
          areaIrrigatedHa: "2.4",
          operatorName: "Alex",
          notes: "Retry fixture",
        },
      ];
      return response({ record: serverRows[0] });
    }) as typeof fetch;
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  afterAll(() => {
    process.env.EXPO_PUBLIC_DOMAIN = originalDomain;
  });

  it("removes the retry badge and reloads the uploaded record from the server", async () => {
    const screen = render(<IrrigationHistoryScreen />);

    await waitFor(() => {
      expect(screen.getByText("Sync failed")).toBeTruthy();
      expect(screen.getByText(/North Field/)).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Tap for details"));
    fireEvent.press(screen.getByText("Retry Now"));

    expect(screen.getByText("Uploading…")).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(300);
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://mobile.example.test/api/farms/7/irrigation-records",
        expect.objectContaining({ method: "POST" }),
      );
      expect(mockQueue).toHaveLength(0);
      expect(screen.queryByText("Sync failed")).toBeNull();
      expect(screen.queryByText("Uploading…")).toBeNull();
      expect(screen.queryByText("Tap for details")).toBeNull();
      expect(screen.getByText(/North Field/)).toBeTruthy();
      expect(screen.getByText("Rain Gun")).toBeTruthy();
    });

    expect(apiFetchMock).toHaveBeenCalledTimes(2);
  });

  it("restores the failed badge and latest error when the retry upload fails", async () => {
    globalThis.fetch = jest.fn(async () => ({
      ...response({}),
      ok: false,
      status: 503,
    })) as typeof fetch;

    const screen = render(<IrrigationHistoryScreen />);

    await waitFor(() => {
      expect(screen.getByText("Sync failed")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Tap for details"));
    fireEvent.press(screen.getByText("Retry Now"));

    expect(screen.getByText("Uploading…")).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(300);
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByText("Sync failed")).toBeTruthy();
      expect(screen.queryByText("Uploading…")).toBeNull();
    });

    fireEvent.press(screen.getByText("Tap for details"));

    expect(screen.getByText("Error detail")).toBeTruthy();
    expect(screen.getByText("Server responded with 503")).toBeTruthy();
    expect(screen.getByText("Retry Now")).toBeTruthy();
    expect(mockQueue).toEqual([
      expect.objectContaining({
        id: "queue-irrigation-1",
        status: "failed",
        retry_count: 5,
        last_error: "Server responded with 503",
      }),
    ]);
  });
});
