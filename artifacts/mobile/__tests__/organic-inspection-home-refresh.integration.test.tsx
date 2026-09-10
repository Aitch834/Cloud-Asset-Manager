jest.mock("expo/virtual/env", () => ({ env: process.env }));

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
  return {
    Feather: ({ name }: { name: string }) => React.createElement(Text, null, name),
  };
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
  useFocusEffect: (callback: () => void) => {
    focusCallback = callback;
  },
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("@/lib/context/FarmContext", () => ({
  useFarm: () => ({
    currentFarm: { id: 7, name: "Boundary Farm" },
    farms: [{ id: 7, name: "Boundary Farm" }],
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
      activeModuleKeys: ["organic-compliance"],
      complianceScore: 100,
      completedForms: 1,
      totalForms: 1,
      overdueActions: 0,
    },
    loading: false,
    error: null,
    resolvedFarmId: 7,
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
  "@/components/home/WinegbSurveyNudge",
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
  return {
    SectionHeader: ({ title }: { title: string }) => React.createElement(Text, null, title),
  };
});

let mockInspectionRecords: Array<Record<string, unknown>> = [];
jest.mock("@/lib/apiFetch", () => ({
  apiFetch: jest.fn(async (url: string) => ({
    ok: true,
    json: async () => {
      if (url.endsWith("/organic/inspections")) return { records: mockInspectionRecords };
      if (url.includes("/planner-events")) return { milestones: [] };
      if (url.includes("/week-ahead")) return { tasks: [] };
      if (url.includes("/sensor-readings")) return { readings: [] };
      return {};
    },
  })),
}));

import React from "react";
import { act, render, waitFor } from "@testing-library/react-native";
import HomeScreen from "../app/(tabs)/index";

describe("home inspection reminder focus refresh", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-02T12:00:00.000Z"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("removes the old reminder after a later-due inspection is logged and Home regains focus", async () => {
    mockInspectionRecords = [{
      id: 1,
      certifier: "Soil Association",
      inspectionDate: "2026-01-15",
      nextDueDate: "2026-09-10",
    }];

    const screen = render(<HomeScreen />);

    await act(async () => {
      focusCallback?.();
    });

    await waitFor(() => {
      expect(screen.getByText("Organic Inspections")).toBeTruthy();
      expect(screen.getByText("Soil Association")).toBeTruthy();
    });

    mockInspectionRecords = [
      ...mockInspectionRecords,
      {
        id: 2,
        certifier: "Soil Association",
        inspectionDate: "2026-09-02",
        nextDueDate: "2026-12-02",
      },
    ];

    await act(async () => {
      focusCallback?.();
    });

    await waitFor(() => {
      expect(screen.queryByText("Organic Inspections")).toBeNull();
      expect(screen.queryByText("Soil Association")).toBeNull();
    });
  });
});