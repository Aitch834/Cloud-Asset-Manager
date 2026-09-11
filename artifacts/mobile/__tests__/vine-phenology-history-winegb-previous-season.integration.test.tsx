jest.mock("react-native", () => {
  const React = require("react");
  const host = (name: string) =>
    React.forwardRef(
      (props: Record<string, unknown>, ref: React.Ref<unknown>) =>
        React.createElement(name, { ...props, ref }, props.children),
    );

  return {
    ActivityIndicator: host("ActivityIndicator"),
    Alert: { alert: jest.fn() },
    FlatList: ({
      data,
      renderItem,
      ListEmptyComponent,
      ...props
    }: {
      data: unknown[];
      renderItem: (info: { item: unknown; index: number }) => React.ReactNode;
      ListEmptyComponent?: React.ReactNode;
      [key: string]: unknown;
    }) =>
      React.createElement(
        "FlatList",
        props,
        data.length
          ? data.map((item, index) =>
              React.createElement(
                React.Fragment,
                { key: index },
                renderItem({ item, index }),
              ),
            )
          : ListEmptyComponent,
      ),
    KeyboardAvoidingView: host("KeyboardAvoidingView"),
    Modal: ({ visible, children, ...props }: Record<string, unknown>) =>
      visible ? React.createElement("Modal", props, children) : null,
    Platform: { OS: "android" },
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
  return {
    Feather: ({ name, ...props }: { name: string; [key: string]: unknown }) =>
      React.createElement("Text", props, name),
  };
});

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: "medium" },
  NotificationFeedbackType: { Success: "success" },
}));

jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
  useFocusEffect: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
  removeItem: jest.fn(async () => undefined),
}));

jest.mock("../components/VineBlockPicker", () => ({
  VineBlockPicker: () => null,
}));
jest.mock("../components/ui/Button", () => ({
  Button: () => null,
}));
jest.mock("../components/ui/Input", () => ({
  Input: () => null,
}));
jest.mock("../components/ui/IdentifierBanner", () => ({
  IdentifierBanner: () => null,
}));

jest.mock("../lib/context/FarmContext", () => ({
  useFarm: () => ({
    currentFarm: { id: "farm-1", name: "Test Vineyard" },
    user: { id: "grower-1" },
  }),
}));
jest.mock("../lib/hooks/useApiFetch", () => ({
  useApiFetch: jest.fn(),
}));
jest.mock("../lib/hooks/useApiVineBlocks", () => ({
  useApiVineBlocks: () => ({ blocks: [], loading: false }),
}));
jest.mock("../lib/hooks/useFarmIdentifiers", () => ({
  useFarmIdentifiers: () => ({
    cphNumber: "12/345/6789",
    sbiNumber: "123456789",
    loading: false,
    justSaved: false,
    clearJustSaved: jest.fn(),
    refetch: jest.fn(),
  }),
}));
jest.mock("../lib/hooks/useIdentifierBannerDismiss", () => ({
  useIdentifierBannerDismiss: () => ({
    dismissed: false,
    dismiss: jest.fn(),
  }),
}));
jest.mock("../utils/openExternalUrl", () => ({
  openExternalUrl: jest.fn(),
}));

const mockApiFetch = jest.fn();
jest.mock("../lib/apiFetch", () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import VinePhenologyHistoryScreen from "../app/vine-phenology-history";

const { useApiFetch } = require("../lib/hooks/useApiFetch") as {
  useApiFetch: jest.Mock;
};

const currentRecord = {
  id: 1,
  observationDate: "2026-04-10",
  blockId: 11,
  blockName: "Current Block",
  bbchStage: "11",
  bbchDescription: "First leaf",
  percentageReached: 50,
  observer: "Current Grower",
  temperatureC: null,
  notes: null,
};

const previousRecord = {
  ...currentRecord,
  id: 2,
  observationDate: "2025-04-12",
  blockName: "Previous Block",
  observer: "Previous Grower",
};

function response(payload: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as unknown as Response;
}

describe("Phenology History previous-season WineGB persistence", () => {
  let savedPreviousSeasonBudBurst = false;

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-11T12:00:00.000Z"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    savedPreviousSeasonBudBurst = false;
    useApiFetch.mockReturnValue({
      records: [currentRecord, previousRecord],
      loading: false,
      refreshing: false,
      error: null,
      refresh: jest.fn(),
    });
    mockApiFetch.mockImplementation(async (url: string, options?: RequestInit) => {
      if (url.endsWith("/winegb-submissions-history")) {
        return response({ years: [2025, 2026] });
      }
      if (url.endsWith("/winegb-submissions?year=2026")) {
        return response({ submissions: {} });
      }
      if (url.endsWith("/winegb-submissions?year=2025")) {
        return response({
          submissions: savedPreviousSeasonBudBurst
            ? { bud_burst: { submitted: true, submittedAt: "2026-09-11T12:00:00.000Z" } }
            : {},
        });
      }
      if (url.endsWith("/winegb-submissions/bud_burst") && options?.method === "PUT") {
        savedPreviousSeasonBudBurst = true;
        return response({ submitted: true });
      }
      return response({});
    });
  });

  it("switches, saves, and restores a previous WineGB season without overdue styling", async () => {
    const firstOpen = render(<VinePhenologyHistoryScreen />);

    await waitFor(() => {
      expect(firstOpen.getByText("WineGB Surveys — 2026")).toBeTruthy();
      expect(firstOpen.getByText("Current Block")).toBeTruthy();
      expect(firstOpen.getAllByText("Overdue").length).toBeGreaterThan(0);
    });

    fireEvent.press(firstOpen.getByText("2025"));

    await waitFor(() => {
      expect(firstOpen.getByText("WineGB Surveys — 2025")).toBeTruthy();
      expect(firstOpen.getByText("Previous Block")).toBeTruthy();
      expect(firstOpen.queryByText("Current Block")).toBeNull();
      expect(firstOpen.queryByText("Overdue")).toBeNull();
    });

    fireEvent.press(firstOpen.getByLabelText("Mark Bud Burst as submitted"));

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        "/api/farms/farm-1/winegb-submissions/bud_burst",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ submitted: true, year: 2025 }),
        }),
      );
      expect(firstOpen.getByLabelText("Unmark Bud Burst as submitted")).toBeTruthy();
    });

    firstOpen.unmount();
    const reopened = render(<VinePhenologyHistoryScreen />);
    fireEvent.press(reopened.getByText("2025"));

    await waitFor(() => {
      expect(reopened.getByText("WineGB Surveys — 2025")).toBeTruthy();
      expect(reopened.getByLabelText("Unmark Bud Burst as submitted")).toBeTruthy();
      expect(mockApiFetch).toHaveBeenCalledWith(
        "/api/farms/farm-1/winegb-submissions?year=2025",
      );
    });
  });
});