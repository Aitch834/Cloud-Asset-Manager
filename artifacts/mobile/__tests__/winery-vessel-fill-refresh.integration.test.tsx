/**
 * Integration coverage for the vessel-register quick-fill refresh.
 *
 * The screen owns both the "No fills logged" row badge and the fill modal.
 * This test exercises the real success callback so a future change cannot
 * close the modal without refreshing the row that launched it.
 */

jest.mock("react-native", () => {
  const React = require("react");
  const host = (name: string) =>
    React.forwardRef(
      (props: Record<string, unknown>, ref: React.Ref<unknown>) =>
        React.createElement(name, { ...props, ref }, props.children),
    );
  const View = host("View");
  const Pressable = host("Pressable");
  const flatten = (style: unknown): Record<string, unknown> => {
    if (!Array.isArray(style)) return (style as Record<string, unknown>) ?? {};
    return style.reduce(
      (merged, item) => ({ ...merged, ...flatten(item) }),
      {} as Record<string, unknown>,
    );
  };

  const SectionList = ({
    sections,
    renderItem,
    renderSectionHeader,
    ListEmptyComponent,
    ...props
  }: {
    sections: Array<{ data: unknown[] }>;
    renderItem: (info: { item: unknown; index: number }) => React.ReactNode;
    renderSectionHeader: (info: { section: unknown }) => React.ReactNode;
    ListEmptyComponent?: React.ReactNode;
    [key: string]: unknown;
  }) =>
    React.createElement(
      View,
      props,
      sections.length
        ? sections.flatMap((section, sectionIndex) => [
            React.createElement(
              React.Fragment,
              { key: `header-${sectionIndex}` },
              renderSectionHeader({ section }),
            ),
            ...section.data.map((item, index) =>
              React.createElement(
                React.Fragment,
                { key: `item-${sectionIndex}-${index}` },
                renderItem({ item, index }),
              ),
            ),
          ])
        : ListEmptyComponent,
    );

  return {
    ActivityIndicator: host("ActivityIndicator"),
    KeyboardAvoidingView: host("KeyboardAvoidingView"),
    Modal: ({ visible, children, ...props }: Record<string, unknown>) =>
      visible ? React.createElement("Modal", props, children) : null,
    Platform: { OS: "web" },
    Pressable,
    RefreshControl: host("RefreshControl"),
    ScrollView: host("ScrollView"),
    SectionList,
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten,
    },
    Text: host("Text"),
    TextInput: host("TextInput"),
    TouchableOpacity: Pressable,
    useColorScheme: () => "light",
    View,
  };
});

jest.mock("@expo/vector-icons", () => ({
  Feather: "Feather",
}));

const mockRouterPush = jest.fn();
jest.mock("expo-router", () => {
  const React = require("react");
  const Tabs = Object.assign(
    ({ children }: { children?: unknown }) => {
      const badges = React.Children.toArray(children).flatMap((child: unknown) => {
        if (!React.isValidElement(child)) return [];
        const options = (child.props as {
          options?: { title?: string; tabBarBadge?: number };
        }).options;
        if (options?.title !== "Record") return [];
        return React.createElement(
          "Text",
          { key: "record-tab-badge", testID: "record-tab-badge" },
          String(options.tabBarBadge ?? 0),
        );
      });
      return React.createElement("View", null, badges);
    },
    { Screen: () => null },
  );
  return {
    router: {
      back: jest.fn(),
      push: (...args: unknown[]) => mockRouterPush(...args),
    },
    Tabs,
    useFocusEffect: jest.fn(),
    useLocalSearchParams: () => ({}),
  };
});

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("expo-glass-effect", () => ({
  isLiquidGlassAvailable: () => false,
}));

jest.mock("expo-blur", () => ({
  BlurView: "BlurView",
}));

jest.mock("expo-router/unstable-native-tabs", () => ({
  Badge: "Badge",
  Icon: "Icon",
  Label: "Label",
  NativeTabs: "NativeTabs",
}));

jest.mock("expo-symbols", () => ({
  SymbolView: "SymbolView",
}));

jest.mock("../lib/hooks/useSmsMisconfigured", () => ({
  useSmsMisconfigured: () => false,
}));

jest.mock("../lib/context/SmsPrefsContext", () => ({
  SmsPrefsProvider: ({ children }: { children: unknown }) => children,
}));

jest.mock("../lib/context/FarmContext", () => ({
  useFarm: () => ({
    currentFarm: {
      id: "5",
      name: "Highfield Vineyard",
      tenantSlug: "oakfield-farms",
    },
  }),
}));

jest.mock("../lib/hooks/useApiModules", () => ({
  useApiModules: () => ({
    activeModuleKeys: ["viticulture"],
    resolvedFarmId: "5",
    loading: false,
  }),
}));

jest.mock("../lib/hooks/useBarrelAlertThresholds", () => ({
  useBarrelAlertThresholds: () => ({
    idleBarrelDays: 30,
    approachingNeutralFills: 4,
  }),
}));

jest.mock("../lib/hooks/usePersistedAlertFlag", () => ({
  usePersistedAlertFlag: () => [null, jest.fn()],
}));

jest.mock("../lib/database", () => ({
  kvGet: jest.fn().mockResolvedValue(null),
  kvSet: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../lib/uploadPhoto", () => ({
  getApiBase: () => "https://api.example.test",
}));

jest.mock("../lib/utils/vesselAlerts", () => ({
  isBarrelType: (vesselType: string | null) =>
    (vesselType ?? "").toLowerCase().includes("barrel"),
  isApproachingNeutral: () => false,
  isIdleBarrel: () => false,
}));

jest.mock("../lib/utils/wineryModuleGuard", () => ({
  computeIsWineryModuleActive: () => true,
  getVesselFetchFarmId: (_active: boolean, farmId: string | undefined) => farmId,
  shouldShowVesselLoadingSpinner: () => false,
}));

const mockInitialVessel = {
  id: 1889,
  vessel_ref: "E2E-NO-FILLS-1889",
  vessel_type: "Oak barrel (225L)",
  capacity_litres: 225,
  material: "Oak",
  oak_origin: null,
  cooperage: null,
  fill_number: null,
  toasting_level: null,
  cellar_zone: "Zone A",
  cellar_position: "A-01",
  location: null,
  current_contents: null,
  current_volume_litres: null,
  status: "active",
  notes: null,
  is_full: false,
  empty_since: null,
  fill_count: 0,
  maintenance_count: 0,
};

const mockRefreshSpy = jest.fn();
let mockUseApiFetchInstance = 0;
jest.mock("../lib/hooks/useApiFetch", () => {
  const React = require("react");
  return {
    useApiFetch: <T,>() => {
      const [records, setRecords] = React.useState([mockInitialVessel]);
      const instanceIdRef = React.useRef(0);
      if (instanceIdRef.current === 0) {
        instanceIdRef.current = ++mockUseApiFetchInstance;
      }
      const refresh = () => {
        mockRefreshSpy(instanceIdRef.current);
        setRecords([
          {
            ...mockInitialVessel,
            fill_number: 1,
            fill_count: 1,
            is_full: true,
          },
        ]);
      };
      return {
        records: records as T[],
        loading: false,
        refreshing: false,
        error: null,
        refresh,
      };
    },
  };
});

import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { BarrelAlertProvider } from "../lib/context/BarrelAlertContext";
import TabLayout from "../app/(tabs)/_layout";
import WineryVesselRegisterScreen from "../app/winery-vessel-register";

function okResponse(payload: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as unknown as Response;
}

describe("winery vessel register quick-fill refresh", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApiFetchInstance = 0;
    global.fetch = jest.fn().mockResolvedValue(
      okResponse({ record: { id: 991, vesselId: mockInitialVessel.id } }),
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("removes the no-fills badge after saving while keeping the row visible", async () => {
    const screen = render(
      <BarrelAlertProvider>
        <WineryVesselRegisterScreen />
      </BarrelAlertProvider>,
    );

    expect(screen.getByTestId(`vessel-row-${mockInitialVessel.id}`)).toBeTruthy();
    expect(screen.getByTestId(`vessel-no-fills-${mockInitialVessel.id}`)).toBeTruthy();

    fireEvent.press(screen.getByTestId(`vessel-no-fills-${mockInitialVessel.id}`), {
      stopPropagation: jest.fn(),
    });

    expect(screen.getByText(`Log Fill — ${mockInitialVessel.vessel_ref}`)).toBeTruthy();
    fireEvent.press(screen.getByTestId("save-vessel-fill"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.example.test/api/farms/5/winery-vessels/${mockInitialVessel.id}/fills`,
        expect.objectContaining({ method: "POST" }),
      );
      expect(mockRefreshSpy).toHaveBeenCalledTimes(1);
      expect(screen.queryByText(`Log Fill — ${mockInitialVessel.vessel_ref}`)).toBeNull();
      expect(screen.getByTestId(`vessel-row-${mockInitialVessel.id}`)).toBeTruthy();
      expect(screen.queryByTestId(`vessel-no-fills-${mockInitialVessel.id}`)).toBeNull();
    });

    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("decreases the Record tab alert badge immediately after logging a fill", async () => {
    const screen = render(
      <BarrelAlertProvider>
        <WineryVesselRegisterScreen />
        <TabLayout />
      </BarrelAlertProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("record-tab-badge")).toHaveTextContent("1");
    });

    fireEvent.press(screen.getByTestId(`vessel-no-fills-${mockInitialVessel.id}`), {
      stopPropagation: jest.fn(),
    });
    fireEvent.press(screen.getByTestId("save-vessel-fill"));

    await waitFor(() => {
      expect(screen.getByTestId("record-tab-badge")).toHaveTextContent("0");
      expect(screen.queryByText(`Log Fill — ${mockInitialVessel.vessel_ref}`)).toBeNull();
    });

    expect(mockRefreshSpy.mock.calls).toEqual([[1], [2]]);
    // The badge update must happen in place; the flow does not navigate away or
    // rely on a fresh app mount to recalculate the count.
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});