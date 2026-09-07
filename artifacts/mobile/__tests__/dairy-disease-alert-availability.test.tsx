/**
 * Regression coverage for the advisory dairy disease alert.
 *
 * The alert request is intentionally exercised through useDiseaseAlert while
 * the screens' unrelated data sources are made deterministic. A broken or
 * slow alert service must not blank any of these dairy forms or their history
 * screen.
 */

jest.mock("react-native", () => {
  const React = require("react");

  const host = (name: string) =>
    React.forwardRef(
      (props: Record<string, unknown>, ref: React.Ref<unknown>) =>
        React.createElement(name, { ...props, ref }, props.children),
    );

  const flatList = ({
    ListHeaderComponent,
    ListEmptyComponent,
  }: {
    ListHeaderComponent?: React.ReactNode;
    ListEmptyComponent?: React.ReactNode;
  }) =>
    React.createElement(
      "FlatList",
      null,
      ListHeaderComponent,
      ListEmptyComponent,
    );

  return {
    ActivityIndicator: host("ActivityIndicator"),
    Alert: { alert: jest.fn() },
    FlatList: flatList,
    KeyboardAvoidingView: host("KeyboardAvoidingView"),
    Platform: { OS: "web" },
    Pressable: host("Pressable"),
    RefreshControl: host("RefreshControl"),
    ScrollView: host("ScrollView"),
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten: (style: unknown) => {
        if (!Array.isArray(style)) return style ?? {};
        return style.reduce(
          (merged, item) => ({ ...merged, ...(item ?? {}) }),
          {} as Record<string, unknown>,
        );
      },
    },
    Switch: host("Switch"),
    Text: host("Text"),
    TextInput: host("TextInput"),
    View: host("View"),
  };
});

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  return {
    Feather: ({ name, ...props }: { name: string; [key: string]: unknown }) =>
      React.createElement("Feather", props, name),
  };
});

jest.mock("expo-haptics", () => ({
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: "success" },
}));

jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
}));

jest.mock("expo-file-system/legacy", () => ({
  cacheDirectory: "/tmp/",
  EncodingType: { UTF8: "utf8" },
  writeAsStringAsync: jest.fn(),
}));

jest.mock("react-native-svg", () => {
  const React = require("react");
  const host = (name: string) => (props: Record<string, unknown>) =>
    React.createElement(name, props, props.children);
  return {
    __esModule: true,
    default: host("Svg"),
    G: host("G"),
    Line: host("Line"),
    Rect: host("Rect"),
    Text: host("SvgText"),
  };
});

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("../components/ui/Input", () => {
  const React = require("react");
  const ReactNative = require("react-native");
  return {
    Input: ({
      label,
      ...props
    }: {
      label?: string;
      [key: string]: unknown;
    }) =>
      React.createElement(ReactNative.TextInput, {
        ...props,
        testID: label ? `input-${label}` : undefined,
      }),
  };
});

jest.mock("../components/ui/LookupPicker", () => ({
  LookupPicker: () => null,
}));

jest.mock("../lib/context/FarmContext", () => ({
  useFarm: jest.fn(),
}));

jest.mock("../lib/context/SyncContext", () => ({
  useSync: jest.fn(),
}));

jest.mock("../lib/apiFetch", () => ({
  apiFetch: jest.fn(),
}));

jest.mock("../lib/hooks/useApiFetch", () => ({
  useApiFetch: jest.fn(),
}));

jest.mock("../lib/storage", () => ({
  appendToList: jest.fn(),
  getList: jest.fn(async () => []),
  STORAGE_KEYS: {
    DAIRY_MASTITIS_RECORDS: "dairy_mastitis_records",
    DAIRY_BCS_RECORDS: "dairy_bcs_records",
    DAIRY_MOBILITY_SCORINGS: "dairy_mobility_scorings",
    DAIRY_NMR_RECORDING_VISITS: "dairy_nmr_recording_visits",
  },
}));

jest.mock("../lib/refCache", () => ({
  getCachedStaffMembers: jest.fn(async () => []),
}));

import React from "react";
import { render, waitFor } from "@testing-library/react-native";

import BodyConditionScoreScreen from "../app/body-condition-score";
import MastitisHistoryScreen from "../app/mastitis-history";
import MastitisRecordScreen from "../app/mastitis-record";
import MobilityScoringScreen from "../app/mobility-scoring";
import NmrRecordingVisitScreen from "../app/nmr-recording-visit";
import { useFarm } from "../lib/context/FarmContext";
import { useSync } from "../lib/context/SyncContext";
import { apiFetch } from "../lib/apiFetch";
import { useApiFetch } from "../lib/hooks/useApiFetch";

const FARM_ID = "farm-42";

type ScreenComponent = React.ComponentType;
type ScreenCase = {
  name: string;
  Component: ScreenComponent;
  header: string;
  firstSection: string | RegExp;
};

const dairyScreens: ScreenCase[] = [
  {
    name: "mastitis record",
    Component: MastitisRecordScreen,
    header: "Mastitis Record",
    firstSection: "Cow & Onset",
  },
  {
    name: "mastitis history",
    Component: MastitisHistoryScreen,
    header: "Mastitis History",
    firstSection: /No cases in/,
  },
  {
    name: "body condition score",
    Component: BodyConditionScoreScreen,
    header: "Body Condition Score",
    firstSection: "Cow / Group",
  },
  {
    name: "mobility scoring",
    Component: MobilityScoringScreen,
    header: "Mobility Scoring",
    firstSection: "Assessment Details",
  },
  {
    name: "NMR recording visit",
    Component: NmrRecordingVisitScreen,
    header: "NMR Recording Visit",
    firstSection: "Visit Details",
  },
];

const useFarmMock = useFarm as jest.MockedFunction<typeof useFarm>;
const useSyncMock = useSync as jest.MockedFunction<typeof useSync>;
const apiFetchMock = apiFetch as jest.MockedFunction<typeof apiFetch>;
const useApiFetchMock = useApiFetch as jest.MockedFunction<typeof useApiFetch>;

function alertResponse(payload: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as Response;
}

function configureScreens(): void {
  useFarmMock.mockReturnValue({
    currentFarm: { id: FARM_ID, name: "Test Farm" },
    user: { name: "Test Grower" },
  } as unknown as ReturnType<typeof useFarm>);
  useSyncMock.mockReturnValue({
    refreshPendingCount: jest.fn(async () => undefined),
  } as unknown as ReturnType<typeof useSync>);
  useApiFetchMock.mockReturnValue({
    records: [],
    loading: false,
    refreshing: false,
    error: null,
    refresh: jest.fn(),
    recordsFarmId: FARM_ID,
  } as unknown as ReturnType<typeof useApiFetch>);
}

function renderAndAssertScreen(screenCase: ScreenCase) {
  const screen = render(<screenCase.Component />);
  expect(screen.getByText(screenCase.header)).toBeTruthy();
  expect(screen.getByText(screenCase.firstSection)).toBeTruthy();
  return screen;
}

beforeEach(() => {
  jest.clearAllMocks();
  configureScreens();
});

describe("dairy screens when the disease alert is unavailable", () => {
  it.each(dairyScreens)(
    "keeps the $name usable when the alert request fails",
    async (screenCase) => {
      apiFetchMock.mockRejectedValueOnce(new Error("disease alert unavailable"));

      const screen = renderAndAssertScreen(screenCase);

      await waitFor(() => {
        expect(apiFetchMock).toHaveBeenCalledWith(
          `/api/dairy-alert?farmId=${FARM_ID}`,
        );
      });
      expect(screen.getByText(screenCase.header)).toBeTruthy();
      expect(screen.getByText(screenCase.firstSection)).toBeTruthy();
      expect(screen.queryByText("National Dairy Disease Alert")).toBeNull();
    },
  );

  it.each(dairyScreens)(
    "keeps the $name usable while the alert request is still pending",
    async (screenCase) => {
      apiFetchMock.mockImplementationOnce(
        () => new Promise<Response>(() => undefined),
      );

      const screen = renderAndAssertScreen(screenCase);

      await waitFor(() => {
        expect(apiFetchMock).toHaveBeenCalledWith(
          `/api/dairy-alert?farmId=${FARM_ID}`,
        );
      });
      expect(screen.getByText(screenCase.header)).toBeTruthy();
      expect(screen.getByText(screenCase.firstSection)).toBeTruthy();
    },
  );

  it.each(dairyScreens)(
    "renders the shared banner on $name when an active alert is returned",
    async (screenCase) => {
      apiFetchMock.mockResolvedValueOnce(
        alertResponse({
          active: true,
          level: "national",
          message: "Test dairy alert",
        }),
      );

      const screen = renderAndAssertScreen(screenCase);

      await waitFor(() => {
        expect(screen.getByText("National Dairy Disease Alert")).toBeTruthy();
        expect(screen.getByText("Test dairy alert")).toBeTruthy();
      });
    },
  );
});