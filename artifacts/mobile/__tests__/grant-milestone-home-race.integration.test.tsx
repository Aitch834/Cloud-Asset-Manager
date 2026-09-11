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
      activeModuleKeys: [],
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

const pendingMilestone = {
  id: 101,
  projectId: 9,
  milestoneName: "Plant boundary hedges",
  schemeName: "Countryside Stewardship",
  dueDate: "2026-09-30",
  status: "pending",
};

let plannerMilestones: Array<Record<string, unknown>> = [];
const mockApiFetch = jest.fn();
jest.mock("@/lib/apiFetch", () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

function response(payload: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as unknown as Response;
}

import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { Modal, ScrollView } from "react-native";
import HomeScreen from "../app/(tabs)/index";

describe("home grant milestone completion race", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-11T12:00:00.000Z"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    plannerMilestones = [pendingMilestone];
    mockApiFetch.mockImplementation(async (url: string, options?: RequestInit) => {
      if (options?.method === "PUT") {
        return response({
          milestone: {
            ...pendingMilestone,
            status: "paid",
            claimAmountPence: 25_000,
          },
        });
      }
      if (url.endsWith("/planner-events")) {
        return response({ milestones: plannerMilestones });
      }
      if (url.endsWith("/agri-env-projects")) {
        return response({ projects: [] });
      }
      if (url.includes("/week-ahead")) return response({ tasks: [] });
      if (url.includes("/sensor-readings")) return response({ readings: [] });
      return response({});
    });
  });

  async function renderLoadedHome() {
    const screen = render(<HomeScreen />);
    await act(async () => {
      focusCallback?.();
    });
    await waitFor(() => {
      expect(screen.getByText("Plant boundary hedges")).toBeTruthy();
    });
    return screen;
  }

  it("closes an open completion sheet after refresh removes a milestone without issuing a PUT", async () => {
    const screen = await renderLoadedHome();

    fireEvent.press(screen.getByText("Mark complete"));
    expect(
      screen.UNSAFE_getAllByType(Modal).some((modal) => modal.props.visible === true),
    ).toBe(true);

    plannerMilestones = [];
    const homeScroll = screen
      .UNSAFE_getAllByType(ScrollView)
      .find((view) => view.props.refreshControl);
    expect(homeScroll).toBeTruthy();
    await act(async () => {
      await homeScroll!.props.refreshControl.props.onRefresh();
    });

    await waitFor(() => {
      expect(
        screen.UNSAFE_getAllByType(Modal).every((modal) => modal.props.visible === false),
      ).toBe(true);
    });

    fireEvent.press(screen.getByText("Confirm"));
    expect(
      mockApiFetch.mock.calls.filter(([, options]) => options?.method === "PUT"),
    ).toHaveLength(0);
  });

  it("shows the server-confirmed paid result from the milestone PUT", async () => {
    const screen = await renderLoadedHome();

    fireEvent.press(screen.getByText("Mark complete"));
    fireEvent.press(screen.getByText("Confirm"));

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        "/api/farms/7/agri-env-projects/9/milestones/101",
        expect.objectContaining({ method: "PUT" }),
      );
      expect(
        screen.UNSAFE_getAllByType(Modal).some((modal) => modal.props.visible === true),
      ).toBe(true);
      expect(screen.getByText("Milestone already paid")).toBeTruthy();
    });
  });
});