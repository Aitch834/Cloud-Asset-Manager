/**
 * Regression coverage for deleting a failed irrigation upload when SQLite is
 * unavailable and the database module falls back to device key/value storage.
 */

const mockStorage = new Map<string, string>();

const mockAsyncStorage = {
  getItem: jest.fn(async (key: string) => mockStorage.get(key) ?? null),
  setItem: jest.fn(async (key: string, value: string) => {
    mockStorage.set(key, value);
  }),
  removeItem: jest.fn(async (key: string) => {
    mockStorage.delete(key);
  }),
  getAllKeys: jest.fn(async () => [...mockStorage.keys()]),
  multiRemove: jest.fn(async (keys: string[]) => {
    keys.forEach((key) => mockStorage.delete(key));
  }),
};

jest.mock("expo-sqlite", () => ({
  openDatabaseAsync: jest.fn(async () => {
    throw new Error("SQLite unavailable in test");
  }),
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
      flatten: (style: unknown) =>
        Array.isArray(style)
          ? Object.assign({}, ...style.filter(Boolean))
          : ((style as Record<string, unknown>) ?? {}),
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
  DateTimePickerAndroid: { open: jest.fn() },
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
  apiFetch: jest.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => [],
  })),
}));

import React from "react";
import { Alert } from "react-native";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";

import IrrigationHistoryScreen from "../app/irrigation-history";
import {
  getRecords,
  getSyncItemsForType,
} from "../lib/database";

describe("irrigation history failed upload deletion persistence", () => {
  beforeAll(() => {
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.clear();

    const payload = {
      id: "local-irrigation-delete-1",
      farmId: 7,
      irrigationDate: "2026-09-08",
      fieldId: 14,
      fieldOrBlockDescription: "North Field",
      irrigationMethod: "Rain Gun",
      applicationDepthMm: 18,
      synced: false,
    };
    mockStorage.set(
      "bde_sync_queue",
      JSON.stringify([
        {
          id: "queue-irrigation-delete-1",
          record_type: "bde_irrigation_applications",
          record_id: payload.id,
          data_json: JSON.stringify(payload),
          status: "failed",
          retry_count: 3,
          last_error: "Upload timed out",
          next_attempt_at: null,
          created_at: "2026-09-08T10:00:00.000Z",
        },
      ]),
    );
    mockStorage.set(
      `bde_record_irrigation_applications_${payload.id}`,
      JSON.stringify(payload),
    );
    mockStorage.set(
      "bde_index_irrigation_applications",
      JSON.stringify([payload.id]),
    );
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("removes the card, queue row, and local record and keeps them gone after reopening", async () => {
    expect(
      await getSyncItemsForType(
        "bde_irrigation_applications",
        ["failed", "pending"],
        "7",
      ),
    ).toHaveLength(1);

    const firstOpen = render(<IrrigationHistoryScreen />);

    await waitFor(() => {
      expect(firstOpen.getByText("Sync failed")).toBeTruthy();
      expect(firstOpen.getByText(/North Field/)).toBeTruthy();
    });

    fireEvent.press(firstOpen.getByText("Tap for details"));
    fireEvent.press(firstOpen.getByText("Delete record"));

    const confirmation = (Alert.alert as jest.Mock).mock.calls.find(
      ([title]) => title === "Delete record?",
    );
    expect(confirmation).toBeTruthy();
    const deleteAction = confirmation?.[2]?.find(
      (action: { text?: string }) => action.text === "Delete record",
    );

    await act(async () => {
      await deleteAction.onPress();
    });

    expect(firstOpen.queryByText("Sync failed")).toBeNull();
    expect(firstOpen.queryByText("Tap for details")).toBeNull();
    expect(
      await getSyncItemsForType(
        "bde_irrigation_applications",
        ["failed", "pending"],
        "7",
      ),
    ).toEqual([]);
    expect(
      await getRecords<{ id: string }>("irrigation_applications", "7"),
    ).toEqual([]);
    expect(
      JSON.parse(
        mockStorage.get("bde_index_irrigation_applications") ?? "[]",
      ),
    ).toEqual([]);

    firstOpen.unmount();
    const reopened = render(<IrrigationHistoryScreen />);

    await waitFor(() => {
      expect(reopened.queryByText("Sync failed")).toBeNull();
      expect(reopened.queryByText("Tap for details")).toBeNull();
      expect(reopened.queryByText(/North Field/)).toBeNull();
    });
  });
});