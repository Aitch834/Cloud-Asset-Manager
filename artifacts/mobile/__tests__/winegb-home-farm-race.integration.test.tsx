jest.mock("expo/virtual/env", () => ({ env: process.env }));

jest.mock("react-native", () => {
  const React = require("react");
  const host = (name: string) =>
    React.forwardRef((props: Record<string, unknown>, ref: React.Ref<unknown>) =>
      React.createElement(name, { ...props, ref }, props.children));
  return {
    ActivityIndicator: host("ActivityIndicator"),
    Alert: { alert: jest.fn() },
    KeyboardAvoidingView: host("KeyboardAvoidingView"),
    Modal: host("Modal"),
    Platform: { OS: "android" },
    Pressable: host("Pressable"),
    RefreshControl: host("RefreshControl"),
    ScrollView: host("ScrollView"),
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten: (style: unknown) =>
        Array.isArray(style)
          ? style.reduce(
              (merged, item) => ({ ...merged, ...(item ?? {}) }),
              {} as Record<string, unknown>,
            )
          : (style ?? {}),
    },
    Text: host("Text"),
    TextInput: host("TextInput"),
    View: host("View"),
  };
});

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return { Feather: ({ name }: { name: string }) => React.createElement(Text, null, name) };
});
jest.mock("@react-native-community/datetimepicker", () => ({
  __esModule: true,
  default: () => null,
  DateTimePickerAndroid: { open: jest.fn() },
}));
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light" },
}));

let focusCallback: (() => void) | undefined;
jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
  useFocusEffect: (callback: () => void) => { focusCallback = callback; },
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

let mockCurrentFarm = { id: 1, name: "Vineyard One" };
let mockViticultureActive = true;
jest.mock("@/lib/context/FarmContext", () => ({
  useFarm: () => ({
    currentFarm: mockCurrentFarm,
    farms: [mockCurrentFarm],
    setCurrentFarm: jest.fn(),
    user: { id: "grower-1", name: "Test Grower" },
  }),
}));
jest.mock("@/lib/context/SyncContext", () => ({
  useSync: () => ({
    pendingCount: 0,
    isSyncing: false,
    triggerSync: jest.fn(async () => undefined),
  }),
}));
jest.mock("@/lib/hooks/useApiFarmDashboard", () => ({
  useApiFarmDashboard: () => ({
    data: {
      activeModuleKeys: mockViticultureActive ? ["viticulture"] : [],
      complianceScore: 100,
      completedForms: 1,
      totalForms: 1,
      overdueActions: 0,
    },
    loading: false,
    error: null,
    resolvedFarmId: mockCurrentFarm.id,
    reload: jest.fn(async () => undefined),
  }),
}));
jest.mock("@/lib/hooks/useApiMyTasksSummary", () => ({
  useApiMyTasksSummary: () => ({ data: null, loading: false }),
}));
jest.mock("@/lib/hooks/useHomePreference", () => ({
  useHomePreference: () => ({
    heroCard: "compliance",
    setHeroCard: jest.fn(),
    loaded: true,
  }),
}));
jest.mock("@/lib/storage", () => ({
  STORAGE_KEYS: {
    SPRAY_RECORDS: "sprays",
    WEATHER_ENTRIES: "weather",
    VISITOR_LOG: "visitors",
    CROP_EVENTS: "crops",
    SOIL_SAMPLES: "soil",
  },
  getList: jest.fn(async () => []),
}));

for (const moduleName of [
  "@/components/home/ComplianceCard",
  "@/components/home/HomePersonaliseSheet",
  "@/components/home/MyTasksCard",
  "@/components/home/QuickAction",
  "@/components/home/WeatherWidget",
  "@/components/ui/Badge",
  "@/components/ui/Card",
]) {
  jest.mock(moduleName, () => {
    const React = require("react");
    const { View } = require("react-native");
    return new Proxy({}, {
      get: (_target, property: string) =>
        (props: Record<string, unknown>) =>
          React.createElement(View, props, props.children ?? String(property)),
    });
  });
}
jest.mock("@/components/ui/SectionHeader", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return { SectionHeader: ({ title }: { title: string }) => React.createElement(Text, null, title) };
});
jest.mock("@/components/home/WinegbSurveyNudge", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    WinegbSurveyNudge: ({ pendingCount }: { pendingCount: number }) =>
      React.createElement(Text, null, `WineGB pending: ${pendingCount}`),
  };
});

const mockApiFetch = jest.fn();
jest.mock("@/lib/apiFetch", () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

function response(payload: unknown): Response {
  return { ok: true, status: 200, json: async () => payload } as Response;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

import React from "react";
import { act, render, waitFor } from "@testing-library/react-native";
import HomeScreen from "../app/(tabs)/index";

describe("WineGB home reminder farm switching", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentFarm = { id: 1, name: "Vineyard One" };
    mockViticultureActive = true;
  });

  it("keeps only the current farm count when requests resolve out of order", async () => {
    const farmOne = deferred<Response>();
    const farmTwo = deferred<Response>();
    mockApiFetch.mockImplementation((url: string) => {
      if (url.includes("/farms/1/winegb-submissions")) return farmOne.promise;
      if (url.includes("/farms/2/winegb-submissions")) return farmTwo.promise;
      if (url.includes("/week-ahead")) return Promise.resolve(response({ tasks: [] }));
      if (url.includes("/sensor-readings")) return Promise.resolve(response({ readings: [] }));
      return Promise.resolve(response({}));
    });

    const screen = render(<HomeScreen />);
    act(() => { focusCallback?.(); });

    mockCurrentFarm = { id: 2, name: "Vineyard Two" };
    screen.rerender(<HomeScreen />);
    act(() => { focusCallback?.(); });

    await act(async () => {
      farmTwo.resolve(response({
        submissions: { harvest: { submitted: true }, veraison: { submitted: true } },
      }));
      await farmTwo.promise;
    });
    await waitFor(() => expect(screen.getByText("WineGB pending: 3")).toBeTruthy());

    await act(async () => {
      farmOne.resolve(response({ submissions: {} }));
      await farmOne.promise;
    });
    expect(screen.getByText("WineGB pending: 3")).toBeTruthy();
    expect(screen.queryByText("WineGB pending: 5")).toBeNull();
  });

  it("hides a previous vineyard reminder after switching to a non-viticulture farm", async () => {
    mockApiFetch.mockImplementation((url: string) => {
      if (url.includes("/winegb-submissions")) return Promise.resolve(response({ submissions: {} }));
      if (url.includes("/week-ahead")) return Promise.resolve(response({ tasks: [] }));
      if (url.includes("/sensor-readings")) return Promise.resolve(response({ readings: [] }));
      return Promise.resolve(response({}));
    });

    const screen = render(<HomeScreen />);
    act(() => { focusCallback?.(); });
    await waitFor(() => expect(screen.getByText("WineGB pending: 5")).toBeTruthy());

    mockCurrentFarm = { id: 2, name: "Arable Farm" };
    mockViticultureActive = false;
    screen.rerender(<HomeScreen />);
    act(() => { focusCallback?.(); });

    await waitFor(() => expect(screen.queryByText(/WineGB pending:/)).toBeNull());
  });
});