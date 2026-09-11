/**
 * Regression coverage for reopening grant payments without connectivity.
 *
 * This exercises the screen's real cache hydration and refresh behavior across
 * an unmount/remount, rather than testing the storage helpers in isolation.
 */

jest.mock("react-native", () => {
  const React = require("react");
  const host = (name: string) =>
    React.forwardRef(
      (props: Record<string, unknown>, ref: React.Ref<unknown>) =>
        React.createElement(name, { ...props, ref }, props.children),
    );
  const FlatList = ({
    data = [],
    renderItem,
    ListEmptyComponent,
    ListHeaderComponent,
    refreshControl,
    ...props
  }: {
    data?: unknown[];
    renderItem?: (info: { item: unknown; index: number }) => React.ReactNode;
    ListEmptyComponent?: React.ReactNode;
    ListHeaderComponent?: React.ReactNode;
    refreshControl?: React.ReactNode;
    [key: string]: unknown;
  }) =>
    React.createElement(
      "FlatList",
      props,
      refreshControl,
      ListHeaderComponent,
      data.length && renderItem
        ? data.map((item, index) =>
            React.createElement(React.Fragment, { key: index }, renderItem({ item, index })),
          )
        : ListEmptyComponent,
    );

  return {
    ActivityIndicator: host("ActivityIndicator"),
    Alert: { alert: jest.fn(), prompt: jest.fn() },
    FlatList,
    Platform: { OS: "web" },
    Pressable: host("Pressable"),
    RefreshControl: host("RefreshControl"),
    ScrollView: host("ScrollView"),
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten: (style: unknown) => style,
    },
    Text: host("Text"),
    TextInput: host("TextInput"),
    View: host("View"),
  };
});

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const ReactNative = require("react-native");
  return {
    Feather: ({ name, ...props }: { name: string; [key: string]: unknown }) =>
      React.createElement(ReactNative.Text, props, name),
  };
});

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useFocusEffect: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("@react-native-community/datetimepicker", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: () => React.createElement("DateTimePicker"),
    DateTimePickerAndroid: { open: jest.fn() },
  };
});

jest.mock("../lib/context/FarmContext", () => ({
  useFarm: () => ({ currentFarm: { id: 3, name: "Cache Test Farm" } }),
}));

jest.mock("../lib/hooks/usePersistedAgriEnvStatusFilter", () => ({
  usePersistedAgriEnvStatusFilter: () => [null, jest.fn()],
}));

const mockApiFetch = jest.fn();
jest.mock("../lib/apiFetch", () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

const mockStorage = new Map<string, unknown>();
jest.mock("../lib/storage", () => ({
  AGRI_ENV_CACHE_TTL_MS: 7 * 24 * 60 * 60 * 1000,
  getItem: jest.fn(async (key: string) => mockStorage.get(key) ?? null),
  setItem: jest.fn(async (key: string, value: unknown) => {
    mockStorage.set(key, value);
  }),
  removeItem: jest.fn(async (key: string) => {
    mockStorage.delete(key);
  }),
  STORAGE_KEYS: {
    AGRI_ENV_PROJECTS_CACHE: "agri-env-projects",
    AGRI_ENV_MILESTONES_CACHE: "agri-env-milestones",
    AGRI_ENV_TRANSACTIONS_CACHE: "agri-env-transactions",
    AGRI_ENV_SCHEME_FILTER: "agri-env-scheme-filter",
  },
}));

import React from "react";
import { act, render, waitFor } from "@testing-library/react-native";
import AgriEnvProjectsScreen from "../app/agri-env-projects";

const project = {
  id: 7,
  schemeName: "Countryside Stewardship",
  administeringBody: "RPA",
  agreementReference: "AG-7",
  startDate: "2026-01-01",
  endDate: "2027-12-31",
  totalGrantValuePence: 500_000,
  status: "active",
};

const cachedPayment = {
  id: 501,
  farmId: 3,
  transactionType: "income",
  category: "Agri-Environment Scheme",
  description: "Cached habitat payment",
  amountPence: 125_000,
  transactionDate: "2026-05-12",
  agriEnvProjectId: 7,
};

const livePayment = {
  ...cachedPayment,
  id: 502,
  description: "Updated live habitat payment",
  amountPence: 150_000,
  transactionDate: "2026-09-10",
};

function response(payload: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as unknown as Response;
}

function serveLive(payment: typeof cachedPayment): void {
  mockApiFetch.mockImplementation(async (url: string) => {
    if (url.endsWith("/agri-env-projects")) return response({ projects: [project] });
    if (url.endsWith("/agri-env-milestones")) return response({ milestones: [] });
    if (url.endsWith("/financial-transactions")) return response({ records: [payment] });
    throw new Error(`Unexpected API request: ${url}`);
  });
}

describe("agri-environment payment offline cache", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.clear();
  });

  it("restores a saved payment after reopening offline and replaces it after refresh", async () => {
    serveLive(cachedPayment);
    const onlineScreen = render(<AgriEnvProjectsScreen />);

    await waitFor(() => {
      expect(onlineScreen.getByText("Cached habitat payment")).toBeTruthy();
      expect(mockStorage.get("agri-env-transactions_3")).toEqual(
        expect.objectContaining({ data: [cachedPayment] }),
      );
    });
    onlineScreen.unmount();

    mockApiFetch.mockRejectedValue(new Error("Network unavailable"));
    const offlineScreen = render(<AgriEnvProjectsScreen />);

    await waitFor(() => {
      expect(offlineScreen.getByText("Payments received")).toBeTruthy();
      expect(offlineScreen.getByText("Cached habitat payment")).toBeTruthy();
      expect(offlineScreen.getByText(/Showing data from .* — updating…/)).toBeTruthy();
    });

    serveLive(livePayment);
    await act(async () => {
      await offlineScreen.UNSAFE_getByType(
        "RefreshControl" as unknown as React.ComponentType<unknown>,
      ).props.onRefresh();
    });

    await waitFor(() => {
      expect(offlineScreen.getByText("Updated live habitat payment")).toBeTruthy();
      expect(offlineScreen.queryByText("Cached habitat payment")).toBeNull();
      expect(offlineScreen.queryByText(/Showing data from .* — updating…/)).toBeNull();
      expect(mockStorage.get("agri-env-transactions_3")).toEqual(
        expect.objectContaining({ data: [livePayment] }),
      );
    });
  });
});