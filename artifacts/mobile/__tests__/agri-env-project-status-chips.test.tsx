/**
 * Regression coverage for the agri-environment project status chips.
 *
 * The chip row should expose only statuses represented by the current farm's
 * projects, while still allowing growers to filter the visible project cards.
 */

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

  return {
    ActivityIndicator: host("ActivityIndicator"),
    Alert: { alert: jest.fn(), prompt: jest.fn() },
    FlatList: ({
      data = [],
      renderItem,
      ListEmptyComponent,
      ListHeaderComponent,
      ...props
    }: {
      data?: unknown[];
      renderItem?: (info: { item: unknown; index: number }) => React.ReactNode;
      ListEmptyComponent?: React.ReactNode;
      ListHeaderComponent?: React.ReactNode;
      [key: string]: unknown;
    }) =>
      React.createElement(
        "FlatList",
        props,
        ListHeaderComponent,
        data.length && renderItem
          ? data.map((item, index) =>
              React.createElement(React.Fragment, { key: index }, renderItem({ item, index })),
            )
          : ListEmptyComponent,
      ),
    Platform: { OS: "web" },
    Pressable: host("Pressable"),
    RefreshControl: host("RefreshControl"),
    ScrollView: host("ScrollView"),
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten,
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
  useFarm: jest.fn(),
}));

jest.mock("../lib/apiFetch", () => ({
  apiFetch: jest.fn(),
}));

jest.mock("../lib/storage", () => ({
  getItem: jest.fn(async () => null),
  removeItem: jest.fn(async () => undefined),
  setItem: jest.fn(async () => undefined),
  STORAGE_KEYS: {
    AGRI_ENV_PROJECTS_CACHE: "agri-env-projects",
    AGRI_ENV_MILESTONES_CACHE: "agri-env-milestones",
    AGRI_ENV_TRANSACTIONS_CACHE: "agri-env-transactions",
    AGRI_ENV_SCHEME_FILTER: "agri-env-scheme-filter",
    AGRI_ENV_STATUS_FILTER: "agri-env-status-filter",
  },
}));

jest.mock("../lib/agri-env-cache", () => ({
  canApplyAgriEnvCacheLoad: jest.fn(() => true),
}));

jest.mock("../lib/agri-env-deadline-summary", () => ({
  getMilestoneDeadlineCounts: jest.fn(() => ({ overdue: 0, upcoming: 0 })),
}));

jest.mock("../lib/agri-env-income-summary", () => ({
  getIncomeSummaryYears: jest.fn(() => []),
}));

jest.mock("../lib/agri-env-transaction-link", () => ({
  applyTransactionProjectLink: jest.fn((transactions: unknown[]) => transactions),
}));

import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import AgriEnvProjectsScreen from "../app/agri-env-projects";

const { useFarm } = require("../lib/context/FarmContext") as { useFarm: jest.Mock };
const { apiFetch } = require("../lib/apiFetch") as { apiFetch: jest.Mock };

const projects = [
  {
    id: 1,
    schemeName: "Applied habitat agreement",
    administeringBody: "RPA",
    agreementReference: "AP-1",
    startDate: "2026-01-01",
    endDate: "2027-12-31",
    totalGrantValuePence: 100_000,
    status: "applied",
  },
  {
    id: 2,
    schemeName: "Suspended wetland agreement",
    administeringBody: "RPA",
    agreementReference: "SU-2",
    startDate: "2026-01-01",
    endDate: "2027-12-31",
    totalGrantValuePence: 100_000,
    status: "suspended",
  },
  {
    id: 3,
    schemeName: "Withdrawn margins agreement",
    administeringBody: "RPA",
    agreementReference: "WI-3",
    startDate: "2026-01-01",
    endDate: "2027-12-31",
    totalGrantValuePence: 100_000,
    status: "withdrawn",
  },
  {
    id: 4,
    schemeName: "Active soil agreement",
    administeringBody: "RPA",
    agreementReference: "AC-4",
    startDate: "2026-01-01",
    endDate: "2027-12-31",
    totalGrantValuePence: 100_000,
    status: "active",
  },
];

function response(payload: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as unknown as Response;
}

describe("agri-environment project status chips", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFarm.mockReturnValue({
      currentFarm: { id: 3, name: "Test Farm" },
    });
    apiFetch.mockImplementation(async (url: string) => {
      if (url.endsWith("/agri-env-projects")) {
        return response({ projects });
      }
      if (url.endsWith("/agri-env-milestones")) {
        return response({ milestones: [] });
      }
      if (url.endsWith("/financial-transactions")) {
        return response({ records: [] });
      }
      throw new Error(`Unexpected API request: ${url}`);
    });
  });

  it("shows only statuses present for the farm and filters cards by status", async () => {
    const screen = render(<AgriEnvProjectsScreen />);

    await waitFor(() => {
      expect(screen.getByLabelText("Filter by All")).toBeTruthy();
      expect(screen.getByLabelText("Filter by Applied")).toBeTruthy();
      expect(screen.getByLabelText("Filter by Suspended")).toBeTruthy();
      expect(screen.getByLabelText("Filter by Withdrawn")).toBeTruthy();
      expect(screen.getByLabelText("Filter by Active")).toBeTruthy();
    });

    expect(screen.queryByLabelText("Filter by Pending")).toBeNull();
    expect(screen.queryByLabelText("Filter by Completed")).toBeNull();

    fireEvent.press(screen.getByLabelText("Filter by Applied"));

    await waitFor(() => {
      expect(
        screen.getByLabelText("Applied habitat agreement, Applied. Expand details."),
      ).toBeTruthy();
      expect(
        screen.queryByLabelText("Suspended wetland agreement, Suspended. Expand details."),
      ).toBeNull();
      expect(
        screen.queryByLabelText("Withdrawn margins agreement, Withdrawn. Expand details."),
      ).toBeNull();
      expect(
        screen.queryByLabelText("Active soil agreement, Active. Expand details."),
      ).toBeNull();
    });

    fireEvent.press(screen.getByLabelText("Filter by All"));

    await waitFor(() => {
      expect(
        screen.getByLabelText("Applied habitat agreement, Applied. Expand details."),
      ).toBeTruthy();
      expect(
        screen.getByLabelText("Suspended wetland agreement, Suspended. Expand details."),
      ).toBeTruthy();
      expect(
        screen.getByLabelText("Withdrawn margins agreement, Withdrawn. Expand details."),
      ).toBeTruthy();
      expect(
        screen.getByLabelText("Active soil agreement, Active. Expand details."),
      ).toBeTruthy();
    });
  });
});