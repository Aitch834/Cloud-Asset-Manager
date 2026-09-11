/**
 * Regression coverage for the harvest history summary and multi-block filter.
 *
 * This renders the real mobile screen so the summary, record list, and filter
 * chips all consume the same filtered record collection.
 */

jest.mock("../lib/apiFetch", () => ({
  apiFetch: jest.fn(),
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
  const Text = host("Text");
  const Pressable = host("Pressable");
  const ScrollView = host("ScrollView");
  const KeyboardAvoidingView = host("KeyboardAvoidingView");
  const ActivityIndicator = host("ActivityIndicator");
  const TextInput = host("TextInput");
  const RefreshControl = host("RefreshControl");
  const Modal = ({ visible, children, ...props }: Record<string, unknown>) =>
    visible ? React.createElement("Modal", props, children) : null;
  const FlatList = ({
    data,
    renderItem,
    ListHeaderComponent,
    ListFooterComponent,
    ListEmptyComponent,
    ...props
  }: {
    data: unknown[];
    renderItem: (info: { item: unknown; index: number }) => React.ReactNode;
    ListHeaderComponent?: React.ReactNode;
    ListFooterComponent?: React.ReactNode;
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
      data.length ? ListFooterComponent : null,
    );

  return {
    ActivityIndicator,
    Alert: { alert: jest.fn(), prompt: jest.fn() },
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform: { OS: "android" },
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten,
    },
    Text,
    TextInput,
    View,
  };
});


jest.mock("expo-file-system/legacy", () => ({
  cacheDirectory: "file:///cache/",
  EncodingType: { UTF8: "utf8" },
  writeAsStringAsync: jest.fn(),
}));
jest.mock("expo-haptics", () => ({
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: "medium" },
  NotificationFeedbackType: { Success: "success", Warning: "warning" },
}));
jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useFocusEffect: jest.fn(),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const ReactNative = require("react-native");
  return {
    Feather: ({ name, ...props }: { name: string; [key: string]: unknown }) =>
      React.createElement(ReactNative.Text, props, name),
  };
});

jest.mock("../lib/context/FarmContext", () => ({
  useFarm: jest.fn(),
}));
jest.mock("../lib/hooks/useApiFetch", () => ({
  useApiFetch: jest.fn(),
}));
jest.mock("../lib/hooks/useApiVineBlocks", () => ({
  useApiVineBlocks: jest.fn(),
}));
jest.mock("../lib/hooks/useFarmIdentifiers", () => ({
  useFarmIdentifiers: jest.fn(),
}));
jest.mock("../lib/hooks/useIdentifierBannerDismiss", () => ({
  useIdentifierBannerDismiss: jest.fn(),
}));
jest.mock("../lib/hooks/usePersistedVintage", () => ({
  usePersistedVintage: jest.fn(),
}));
jest.mock("../lib/hooks/usePersistedVarietySort", () => ({
  usePersistedVarietySort: jest.fn(),
}));
jest.mock("../lib/hooks/usePersistedVarietyColumns", () => ({
  usePersistedVarietyColumns: jest.fn(),
}));
jest.mock("../lib/hooks/usePersistedVarietyTableOpen", () => ({
  usePersistedVarietyTableOpen: jest.fn(),
}));
jest.mock("../lib/hooks/usePersistedChemistryCrossTabSort", () => ({
  usePersistedChemistryCrossTabSort: jest.fn(),
}));
jest.mock("../lib/storage", () => ({
  getList: jest.fn(async () => []),
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
}));
jest.mock("../lib/sync-engine", () => ({
  subscribe: jest.fn(() => () => {}),
}));
jest.mock("../lib/vineyardCountEvents", () => ({
  vineyardCountEvents: { emit: jest.fn() },
}));
jest.mock("../utils/openExternalUrl", () => ({
  openExternalUrl: jest.fn(async () => {}),
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

import React from "react";
import { fireEvent, render, waitFor, within } from "@testing-library/react-native";
import VineHarvestHistoryScreen, {
  buildHarvestCsv,
  buildHarvestReportMailto,
  ChemistryTrendValue,
  getChemistryDirection,
} from "../app/vine-harvest-history";
import type { VineBlock } from "../lib/hooks/useApiVineBlocks";

type ChemistryMetricCase = {
  metric: string;
  precision: number;
  baseline: number;
  rise: number;
  fall: number;
  displayedBaseline: string;
  displayedRise: string;
  displayedFall: string;
};

const chemistryMetrics: ChemistryMetricCase[] = [
  { metric: "Avg Brix °", precision: 1, baseline: 18.04, rise: 18.06, fall: 17.94, displayedBaseline: "18.0", displayedRise: "18.1", displayedFall: "17.9" },
  { metric: "Avg pH", precision: 2, baseline: 3.204, rise: 3.206, fall: 3.194, displayedBaseline: "3.20", displayedRise: "3.21", displayedFall: "3.19" },
  { metric: "Avg TA (g/L)", precision: 2, baseline: 7.504, rise: 7.506, fall: 7.494, displayedBaseline: "7.50", displayedRise: "7.51", displayedFall: "7.49" },
  { metric: "Avg Pot. Alc %", precision: 2, baseline: 10.504, rise: 10.506, fall: 10.494, displayedBaseline: "10.50", displayedRise: "10.51", displayedFall: "10.49" },
];

describe.each(chemistryMetrics)("$metric chemistry direction cues", ({
  metric,
  precision,
  baseline,
  rise,
  fall,
  displayedBaseline,
  displayedRise,
  displayedFall,
}) => {
  it.each([
    ["rose", rise, displayedRise, "↑"],
    ["fell", fall, displayedFall, "↓"],
    ["unchanged", baseline, displayedBaseline, "→"],
  ] as const)("renders an accessible %s cue", (direction, value, displayedValue, symbol) => {
    expect(getChemistryDirection(value, baseline, precision)).toBe(direction);

    const screen = render(<VineHarvestHistoryScreen />);

    const activeVarietyHeader = await screen.findByLabelText(
      "Sort variety table by Variety, currently sorted ascending",
    );

    expect(screen.getByText(symbol, { exact: false })).toBeTruthy();
    expect(screen.getByLabelText(
      `${metric}: ${displayedValue}, ${direction} from ${displayedBaseline} in 2024`,
    )).toBeTruthy();
  });

  it("treats a change smaller than the displayed precision as unchanged", () => {
    const subPrecisionChange = baseline + 4 / (10 ** (precision + 2));
    expect(getChemistryDirection(subPrecisionChange, baseline, precision)).toBe("unchanged");
  });
});

describe("missing chemistry values", () => {
  it.each([
    ["current", null, 18.2, "Avg Brix °: no data", "—"],
    ["prior", 18.2, null, "Avg Brix °: 18.2; no prior vintage comparison available", "18.2"],
  ] as const)("shows no direction cue when the %s value is missing", (
    _missingSide,
    value,
    previousValue,
    accessibilityLabel,
    displayedValue,
  ) => {
    expect(getChemistryDirection(value, previousValue, 1)).toBeNull();

    const screen = render(<VineHarvestHistoryScreen />);

    const activeVarietyHeader = await screen.findByLabelText(
      "Sort variety table by Variety, currently sorted ascending",
    );

    expect(screen.getByLabelText(accessibilityLabel)).toBeTruthy();
    expect(screen.getByText(displayedValue)).toBeTruthy();
    expect(screen.queryByText(/[↑↓→]/)).toBeNull();
  });
});

const { useFarm } = require("../lib/context/FarmContext") as {
  useFarm: jest.Mock;
};
const { useApiFetch } = require("../lib/hooks/useApiFetch") as {
  useApiFetch: jest.Mock;
};
const { useApiVineBlocks } = require("../lib/hooks/useApiVineBlocks") as {
  useApiVineBlocks: jest.Mock;
};
const { useFarmIdentifiers } = require("../lib/hooks/useFarmIdentifiers") as {
  useFarmIdentifiers: jest.Mock;
};
const { useIdentifierBannerDismiss } = require("../lib/hooks/useIdentifierBannerDismiss") as {
  useIdentifierBannerDismiss: jest.Mock;
};
const { usePersistedVintage } = require("../lib/hooks/usePersistedVintage") as {
  usePersistedVintage: jest.Mock;
};
const { usePersistedVarietySort } = require("../lib/hooks/usePersistedVarietySort") as {
  usePersistedVarietySort: jest.Mock;
};
const { usePersistedVarietyColumns } = require("../lib/hooks/usePersistedVarietyColumns") as {
  usePersistedVarietyColumns: jest.Mock;
};
const { usePersistedVarietyTableOpen } = require("../lib/hooks/usePersistedVarietyTableOpen") as {
  usePersistedVarietyTableOpen: jest.Mock;
};
const { usePersistedChemistryCrossTabSort } = require("../lib/hooks/usePersistedChemistryCrossTabSort") as {
  usePersistedChemistryCrossTabSort: jest.Mock;
};
const { apiFetch } = require("../lib/apiFetch") as {
  apiFetch: jest.MockedFunction<() => Promise<Response>>;
};
const { getList, getItem, setItem } = require("../lib/storage") as {
  getList: jest.Mock;
  getItem: jest.Mock;
  setItem: jest.Mock;
};

const FARM_ID = "farm-1";
const VINTAGE = 2025;

function makeBlock(
  id: number,
  blockName: string,
  areaHa: number | null,
  variety = "Chardonnay",
): VineBlock {
  return {
    id,
    blockName,
    blockRef: null,
    fieldParcelRef: null,
    variety,
    rootstock: null,
    areaHa,
    numberOfVines: 1000,
    plantingStatus: "active",
    isActive: true,
    isOrganicBlock: false,
    coverPhotoUrl: null,
  };
}

function makeRecord(
  id: number,
  blockId: number,
  blockName: string,
  yieldKg: number,
  brix: number,
  vintageYear = VINTAGE,
) {
  return {
    id,
    harvestDate: `2025-09-${String(id).padStart(2, "0")}`,
    blockId,
    blockName,
    vintageYear,
    harvestMethod: "Hand",
    yieldKg,
    brix,
    ph: null,
    titratableAcidityGl: null,
    potentialAlcohol: null,
    grapeCondition: null,
    operatorName: "Test operator",
    notes: null,
  };
}

function pressFilterChip(screen: ReturnType<typeof render>, label: string) {
  // Filter chips render before the record list, so the first matching label
  // is the chip even when the same block name also appears in a row.
  fireEvent.press(screen.getAllByText(label)[0]);
}

function expectSummary(
  screen: ReturnType<typeof render>,
  recordLabel: string,
  totalYield: string,
  tonnesPerHa: string,
  averageBrix: string,
) {
  expect(screen.getByText(recordLabel)).toBeTruthy();
  expect(screen.getAllByText(totalYield).length).toBeGreaterThan(0);
  expect(screen.getAllByText(tonnesPerHa).length).toBeGreaterThan(0);
  expect(screen.getAllByText(averageBrix).length).toBeGreaterThan(0);
}

beforeEach(() => {
  jest.clearAllMocks();
  getList.mockResolvedValue([]);
  useFarm.mockReturnValue({
    currentFarm: { id: FARM_ID, name: "Test Vineyard" },
    user: { id: "test-user" },
  });
  useApiFetch.mockReturnValue({
    records: [
      makeRecord(1, 101, "North Block", 1000, 10),
      makeRecord(2, 101, "North Block", 500, 12),
      makeRecord(3, 202, "South Block", 2000, 16),
    ],
    loading: false,
    refreshing: false,
    error: null,
    refresh: jest.fn(),
    recordsFarmId: FARM_ID,
  });
  useApiVineBlocks.mockReturnValue({
    blocks: [
      makeBlock(101, "North Block", 1),
      makeBlock(202, "South Block", 2),
    ],
    loading: false,
  });
  useFarmIdentifiers.mockReturnValue({
    sbiNumber: null,
    address: "Test Lane",
    loading: false,
    justSaved: false,
    clearJustSaved: jest.fn(),
    refetch: jest.fn(),
  });
  useIdentifierBannerDismiss.mockReturnValue({
    dismissed: true,
    dismiss: jest.fn(),
  });
  usePersistedVintage.mockImplementation(() => {
    const [vintage, setVintage] = React.useState<number | null>(VINTAGE);
    return [vintage, setVintage, FARM_ID];
  });
  usePersistedVarietySort.mockReturnValue([
    { col: "variety", dir: "asc" },
    jest.fn(),
  ]);
  usePersistedVarietyColumns.mockReturnValue([
    { avgBrix: true, avgPh: true, avgTa: true, avgPotAlc: true },
    jest.fn(),
  ]);
  usePersistedVarietyTableOpen.mockReturnValue([true, jest.fn()]);
  usePersistedChemistryCrossTabSort.mockReturnValue([null, jest.fn()]);
  apiFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ record: {} }),
  } as unknown as Response);
});

describe("VineHarvestHistoryScreen — filtered summary", () => {
  it("applies inclusive date filters consistently to server and pending offline records", async () => {
    useApiFetch.mockReturnValue({
      records: [
        { ...makeRecord(1, 101, "Early Block", 111, 10), harvestDate: "2025-09-01" },
        { ...makeRecord(2, 202, "Boundary Block", 222, 12), harvestDate: "2025-09-10" },
        { ...makeRecord(3, 303, "Late Block", 333, 16), harvestDate: "2025-09-20" },
      ],
      loading: false,
      refreshing: false,
      error: null,
      refresh: jest.fn(),
      recordsFarmId: FARM_ID,
    });
    useApiVineBlocks.mockReturnValue({
      blocks: [
        makeBlock(101, "Early Block", 1),
        makeBlock(202, "Boundary Block", 1),
        makeBlock(303, "Late Block", 1),
        makeBlock(404, "Offline Boundary Block", 1),
      ],
      loading: false,
    });
    getList.mockResolvedValue([
      {
        id: "offline-boundary",
        farmId: FARM_ID,
        harvestDate: "2025-09-10",
        blockId: 404,
        blockName: "Offline Boundary Block",
        vintageYear: VINTAGE,
        harvestMethod: "Hand",
        yieldKg: 444,
        _pendingSync: true,
      },
    ]);

    const screen = render(<VineHarvestHistoryScreen />);

    const activeVarietyHeader = await screen.findByLabelText(
      "Sort variety table by Variety, currently sorted ascending",
    );
    const [fromInput, toInput] = screen.getAllByPlaceholderText("DD/MM/YYYY");
    const recordList = () => within(screen.getByTestId("harvest-history-record-list"));

    await waitFor(() => {
      expect(recordList().getByText("Waiting to sync")).toBeTruthy();
      expect(recordList().getByText("Offline Boundary Block")).toBeTruthy();
    });

    fireEvent.changeText(fromInput, "10/09/2025");
    expect(recordList().queryByText("Early Block")).toBeNull();
    expect(recordList().getByText("Boundary Block")).toBeTruthy();
    expect(recordList().getByText("Late Block")).toBeTruthy();
    expect(recordList().getByText("Offline Boundary Block")).toBeTruthy();

    fireEvent.changeText(fromInput, "");
    fireEvent.changeText(toInput, "10/09/2025");
    expect(recordList().getByText("Early Block")).toBeTruthy();
    expect(recordList().getByText("Boundary Block")).toBeTruthy();
    expect(recordList().queryByText("Late Block")).toBeNull();
    expect(recordList().getByText("Offline Boundary Block")).toBeTruthy();

    fireEvent.changeText(fromInput, "10/09/2025");
    expect(recordList().queryByText("Early Block")).toBeNull();
    expect(recordList().getByText("Boundary Block")).toBeTruthy();
    expect(recordList().queryByText("Late Block")).toBeNull();
    expect(recordList().getByText("Offline Boundary Block")).toBeTruthy();
    expect(recordList().getByText("Waiting to sync")).toBeTruthy();

    fireEvent.changeText(fromInput, "31/02/2025");
    expect(screen.getByText("Use DD/MM/YYYY or YYYY-MM-DD format.")).toBeTruthy();
    expect(recordList().getByText("Early Block")).toBeTruthy();
    expect(recordList().getByText("Offline Boundary Block")).toBeTruthy();

    fireEvent.changeText(fromInput, "20/09/2025");
    expect(screen.getByText("'From' date must be before 'To' date.")).toBeTruthy();
    expect(screen.getByText("No records match your filters.")).toBeTruthy();
  });

  it("keeps Must Chemistry averages stable when a pending harvest is replaced by its synced record", async () => {
    const pendingHarvest = {
      id: "offline-must-chemistry",
      farmId: FARM_ID,
      harvestDate: "2025-09-15",
      vintageYear: VINTAGE,
      blockId: 202,
      blockName: "South Block",
      harvestMethod: "Hand",
      yieldKg: 900,
      // These are the values saved locally by the harvest form before a sync
      // is possible. They must contribute to the selected vintage summary.
      ph: 3.54,
      titratableAcidityGl: 5.5,
      potentialAlcohol: 13.5,
      _pendingSync: true,
    };
    const syncedHarvest = {
      ...makeRecord(44, 202, "South Block", 900, 18),
      harvestDate: pendingHarvest.harvestDate,
      ph: pendingHarvest.ph,
      titratableAcidityGl: pendingHarvest.titratableAcidityGl,
      potentialAlcohol: pendingHarvest.potentialAlcohol,
    };
    let serverRecords = [
      {
        ...makeRecord(1, 101, "North Block", 1000, 10),
        ph: 3.1,
        titratableAcidityGl: 8,
        potentialAlcohol: 10,
      },
    ];
    let offlineRecords = [pendingHarvest];

    useApiFetch.mockImplementation(() => ({
      records: serverRecords,
      loading: false,
      refreshing: false,
      error: null,
      refresh: jest.fn(),
      recordsFarmId: FARM_ID,
    }));
    getList.mockImplementation(async () => offlineRecords);

    const screen = render(<VineHarvestHistoryScreen />);

    const activeVarietyHeader = await screen.findByLabelText(
      "Sort variety table by Variety, currently sorted ascending",
    );

    await waitFor(() => {
      expectSummary(screen, "2025 Vintage · 2 records", "3.00 t", "1.00", "13.0°");
      expect(setItem).toHaveBeenCalledWith(`bde_vine_block_filter_${FARM_ID}`, []);
    });

    farmId = "farm-2";
    screen.rerender(<VineHarvestHistoryScreen />);

    // The second farm's stored value is still loading. The first committed
    // render must treat the filter as "Show all", never reuse farm 1's IDs.
    expectSummary(screen, "2025 Vintage · 2 records", "2.00 t", "1.00", "16.0°");

    resolveSecondFarmSelection([404]);

    await waitFor(() => {
      expectSummary(screen, "2025 Vintage · 1 record", "1.10 t", "1.10", "18.0°");
      expect(screen.getAllByText("West Block").length).toBeGreaterThan(0);
    });
  });

  it("counts a multi-pick block area once in the variety row and Total across vintage filters", async () => {
    useApiFetch.mockReturnValue({
      records: [
        makeRecord(1, 101, "North Block", 1000, 10, 2025),
        makeRecord(2, 101, "North Block", 500, 12, 2025),
        makeRecord(3, 101, "North Block", 250, 11, 2025),
        makeRecord(4, 202, "South Block", 2000, 16, 2025),
        makeRecord(5, 101, "North Block", 400, 11, 2024),
        makeRecord(6, 202, "South Block", 800, 15, 2024),
      ],
      loading: false,
      refreshing: false,
      error: null,
      refresh: jest.fn(),
      recordsFarmId: FARM_ID,
    });
    useApiVineBlocks.mockReturnValue({
      blocks: [
        makeBlock(101, "North Block", 2.5, "Chardonnay"),
        makeBlock(202, "South Block", null, "Pinot Noir"),
      ],
      loading: false,
    });

    const screen = render(<VineHarvestHistoryScreen />);

    const activeVarietyHeader = await screen.findByLabelText(
      "Sort variety table by Variety, currently sorted ascending",
    );

    await waitFor(() => {
      expectSummary(screen, "2025 Vintage · 3 records", "3.50 t", "1.17", "12.7°");
    });

    // Explicitly exercise the all-blocks state before applying a filter.
    pressFilterChip(screen, "Show all");
    expectSummary(screen, "2025 Vintage · 3 records", "3.50 t", "1.17", "12.7°");

    pressFilterChip(screen, "North Block");
    await waitFor(() => {
      expectSummary(screen, "2025 Vintage · 2 records", "1.50 t", "1.50", "11.0°");
    });

    // Selecting a second chip is additive: both blocks must contribute to the
    // summary instead of reverting to either the full-vintage or one-block
    // values.
    pressFilterChip(screen, "South Block");
    await waitFor(() => {
      expectSummary(screen, "2025 Vintage · 3 records", "3.50 t", "1.17", "12.7°");
    });
  });

  it("clears a stale block selection and loads the next farm's own selection", async () => {
    let farmId = FARM_ID;
    let resolveSecondFarmSelection!: (ids: number[]) => void;
    const secondFarmSelection = new Promise<number[]>((resolve) => {
      resolveSecondFarmSelection = resolve;
    });
    useFarm.mockImplementation(() => ({
      currentFarm: { id: farmId, name: farmId === FARM_ID ? "Test Vineyard" : "Second Vineyard" },
      user: { id: "test-user" },
    }));
    useApiFetch.mockImplementation(() => ({
      records: farmId === FARM_ID
        ? [
            makeRecord(1, 101, "North Block", 1000, 10),
            makeRecord(2, 202, "South Block", 2000, 16),
          ]
        : [
            makeRecord(3, 303, "East Block", 900, 14),
            makeRecord(4, 404, "West Block", 1100, 18),
          ],
      loading: false,
      refreshing: false,
      error: null,
      refresh: jest.fn(),
      recordsFarmId: farmId,
    }));
    useApiVineBlocks.mockImplementation(() => ({
      blocks: farmId === FARM_ID
        ? [makeBlock(101, "North Block", 1), makeBlock(202, "South Block", 2)]
        : [makeBlock(303, "East Block", 1), makeBlock(404, "West Block", 1)],
      loading: false,
    }));
    usePersistedVintage.mockImplementation((requestedFarmId: string) => [
      VINTAGE,
      jest.fn(),
      requestedFarmId,
    ]);
    getItem.mockImplementation((key: string) =>
      key.endsWith(FARM_ID) ? Promise.resolve([999]) : secondFarmSelection,
    );

    const screen = render(<VineHarvestHistoryScreen />);

    const activeVarietyHeader = await screen.findByLabelText(
      "Sort variety table by Variety, currently sorted ascending",
    );

    await waitFor(() => {
      expectSummary(screen, "2025 Vintage · 2 records", "3.00 t", "1.00", "13.0°");
      expect(setItem).toHaveBeenCalledWith(`bde_vine_block_filter_${FARM_ID}`, []);
    });

    farmId = "farm-2";
    screen.rerender(<VineHarvestHistoryScreen />);

    // The second farm's stored value is still loading. The first committed
    // render must treat the filter as "Show all", never reuse farm 1's IDs.
    expectSummary(screen, "2025 Vintage · 2 records", "2.00 t", "1.00", "16.0°");

    resolveSecondFarmSelection([404]);

    await waitFor(() => {
      expectSummary(screen, "2025 Vintage · 1 record", "1.10 t", "1.10", "18.0°");
      expect(screen.getAllByText("West Block").length).toBeGreaterThan(0);
    });
  });

  it("counts a multi-pick block area once in the variety row and Total across vintage filters", async () => {
    useApiFetch.mockReturnValue({
      records: [
        makeRecord(1, 101, "North Block", 1000, 10, 2025),
        makeRecord(2, 101, "North Block", 500, 12, 2025),
        makeRecord(3, 101, "North Block", 250, 11, 2025),
        makeRecord(4, 202, "South Block", 2000, 16, 2025),
        makeRecord(5, 101, "North Block", 400, 11, 2024),
        makeRecord(6, 202, "South Block", 800, 15, 2024),
      ],
      loading: false,
      refreshing: false,
      error: null,
      refresh: jest.fn(),
      recordsFarmId: FARM_ID,
    });
    useApiVineBlocks.mockReturnValue({
      blocks: [
        makeBlock(101, "North Block", 2.5, "Chardonnay"),
        makeBlock(202, "South Block", null, "Pinot Noir"),
      ],
      loading: false,
    });

    const screen = render(<VineHarvestHistoryScreen />);

    const activeVarietyHeader = await screen.findByLabelText(
      "Sort variety table by Variety, currently sorted ascending",
    );

    const expectAreaTotal = async () => {
      await waitFor(() => {
        expect(screen.getAllByText("Chardonnay").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Total").length).toBeGreaterThan(0);
        // The Chardonnay row and the grand Total each display 2.50. If the
        // three picks were summed as three areas, these would show 7.50.
        expect(screen.getAllByText("2.50")).toHaveLength(2);
      });
    };

    await expectAreaTotal();

    fireEvent.press(screen.getByText("All"));
    await expectAreaTotal();

    // The same block area must remain 2.50 when switching to another vintage.
    fireEvent.press(screen.getAllByText("2024")[0]);
    await expectAreaTotal();
  });

  it("moves a renamed block's area to its current variety once without changing the grand Total", async () => {
    const records = [
      { ...makeCsvHarvestRecord(1, 10), yieldKg: 600 },
      { ...makeCsvHarvestRecord(2, 10), yieldKg: 400 },
      { ...makeCsvHarvestRecord(3, 20), yieldKg: 500 },
    ];
    const blocks = [
      { id: 10, blockName: "North Block", variety: "Chardonnay", areaHa: 2 },
      { id: 20, blockName: "South Block", variety: "Pinot Noir", areaHa: 1 },
    ];
    useApiFetch.mockReturnValue({
      records,
      loading: false,
      refreshing: false,
      error: null,
      refresh: jest.fn(),
      recordsFarmId: FARM_ID,
    });
    useApiVineBlocks.mockImplementation(() => ({ blocks, loading: false }));

    const screen = render(<VineHarvestHistoryScreen />);

    const activeVarietyHeader = await screen.findByLabelText(
      "Sort variety table by Variety, currently sorted ascending",
    );
    const varietyRows = () => within(screen.getByTestId("variety-table-body"));

    await waitFor(() => {
      expect(varietyRows().getByText("Chardonnay")).toBeTruthy();
      expect(varietyRows().getByText("2.50")).toBeTruthy();
      expect(screen.getByText("Total")).toBeTruthy();
      expect(screen.getByText("5.00")).toBeTruthy();
    });

    blocks = [
      makeBlock(101, "North Block", 2.5, "Pinot Noir"),
      makeBlock(202, "South Block", 1.5, "Pinot Noir"),
      makeBlock(303, "East Block", 1, "Riesling"),
    ];
    screen.rerender(<VineHarvestHistoryScreen />);

    await waitFor(() => {
      expect(varietyRows().queryByText("Chardonnay")).toBeNull();
      expect(varietyRows().getByText("Pinot Noir")).toBeTruthy();
      expect(varietyRows().getAllByText("4.00")).toHaveLength(1);
      expect(screen.getByText("5.00")).toBeTruthy();
    });
  });

  it("keeps the variety table and chart legend in the same order after sorting by total yield", async () => {
    useApiVineBlocks.mockReturnValue({
      blocks: [
        makeBlock(101, "North Block", 1, "Chardonnay"),
        makeBlock(202, "South Block", 1, "Pinot Noir"),
      ],
      loading: false,
    });
    usePersistedVarietySort.mockImplementation(() =>
      React.useState<{ col: "variety" | "totalKg"; dir: "asc" | "desc" }>({
        col: "variety",
        dir: "asc",
      }),
    );

    const screen = render(<VineHarvestHistoryScreen />);

    const activeVarietyHeader = await screen.findByLabelText(
      "Sort variety table by Variety, currently sorted ascending",
    );
    const varietyNames = /^(Chardonnay|Pinot Noir|Unknown \/ Not linked)$/;
    const orderedNames = (testId: string) =>
      within(screen.getByTestId(testId))
        .getAllByText(varietyNames)
        .map(node => String(node.props.children));

    const expectAlignedOrder = async (expected: string[]) => {
      await waitFor(() => {
        expect(orderedNames("variety-chart-legend")).toEqual(expected);
        expect(orderedNames("variety-table-body")).toEqual(expected);
      });
    };
function makeCsvHarvestRecord(id: number, blockId: number | null) {
  return {
    id,
    harvestDate: "2026-09-01",
    blockId,
    blockName: blockId == null ? null : `Block ${blockId}`,
    vintageYear: 2026,
    harvestMethod: "Hand",
    yieldKg: 100,
    brix: 20,
    ph: 3.2,
    titratableAcidityGl: 6.5,
    potentialAlcohol: 12,
    grapeCondition: "Good",
    operatorName: "Test operator",
    notes: null,
    harvestIntervalWarningAcknowledged: false,
    harvestIntervalAcknowledgedAt: null,
    harvestIntervalProducts: null,
  };
}

describe("buildHarvestCsv — Yield by Variety guard", () => {
  it.each(["=SUM(A1:A2)", "+Malbec", "-Merlot", "@Riesling"])(
    "neutralises a formula-like variety name before export: %s",
    (formulaLikeVariety) => {
    const csv = buildHarvestCsv(
      [makeCsvHarvestRecord(1, 10), makeCsvHarvestRecord(2, 20)],
      [
        { id: 10, blockName: "North Block", variety: "Chardonnay", areaHa: 1 },
        { id: 20, blockName: "South Block", variety: "Pinot Noir", areaHa: 1 },
      ],
      "Test Farm",
      "2026",
    );

      expect(csv).toContain(`"\t${formulaLikeVariety}"`);
      expect(csv).not.toContain(`\n"${formulaLikeVariety}",`);
    },
  );

  it("omits the section when records are all unlinked or contain only one named variety", () => {
    const allUnlinkedCsv = buildHarvestCsv(
      [makeCsvHarvestRecord(1, null), makeCsvHarvestRecord(2, null)],
      [],
      "Test Farm",
      "2026",
    );
    const oneNamedVarietyCsv = buildHarvestCsv(
      [makeCsvHarvestRecord(1, null), makeCsvHarvestRecord(2, 10)],
      [{ id: 10, blockName: "North Block", variety: "Chardonnay", areaHa: 1 }],
      "Test Farm",
      "2026",
    );

    expect(allUnlinkedCsv).not.toContain('"Yield by Variety"');
    expect(oneNamedVarietyCsv).not.toContain('"Yield by Variety"');
  });

  it.each([
    {
      label: "exactly two named varieties",
      varieties: ["Chardonnay", "Pinot Noir"],
    },
    {
      label: "more than two named varieties",
      varieties: ["Chardonnay", "Pinot Noir", "Riesling"],
    },
  ])("includes every named variety when there are $label", ({ varieties }) => {
    const blocks = [
      { id: 10, blockName: "North Block", variety: "Chardonnay", areaHa: 2 },
      { id: 20, blockName: "South Block", variety: "Pinot Noir", areaHa: 1 },
    ];

    const records = [
      { ...makeCsvHarvestRecord(1, 10), yieldKg: 600 },
      { ...makeCsvHarvestRecord(2, 10), yieldKg: 400 },
      { ...makeCsvHarvestRecord(3, 20), yieldKg: 500 },
    ];

    const csv = buildHarvestCsv(
      [makeCsvHarvestRecord(1, 10), makeCsvHarvestRecord(2, 20)],
      [
        { id: 10, blockName: "North Block", variety: "Chardonnay", areaHa: 1 },
        { id: 20, blockName: "South Block", variety: "Pinot Noir", areaHa: 1 },
      ],
      "Test Farm",
      "2026",
    );

    expect(csv).toContain('"Yield by Variety"');
    for (const variety of varieties) {
      expect(csv).toContain(`"${variety}"`);
    }
    expect(csv).toContain('"TOTAL"');
  });
});

describe("buildHarvestCsv — unlinked block warning", () => {
  const detailHeader =
    '"Date","Vintage","Block","Method","Yield (kg)","Brix","pH","TA (g/L)","Pot. Alc (%)"';

  it("places the singular warning before the detail header", () => {
    const csv = buildHarvestCsv(
      [makeCsvHarvestRecord(1, 10), makeCsvHarvestRecord(2, 20)],
      [
        { id: 10, blockName: "North Block", variety: "Chardonnay", areaHa: 1 },
        { id: 20, blockName: "South Block", variety: "Pinot Noir", areaHa: 1 },
      ],
      "Test Farm",
      "2026",
    );
    const warning =
      '"WARNING: 1 record not linked to a block — block-level totals may be incomplete"';

    expect(csv).toContain(warning);
    expect(csv.indexOf(warning)).toBeLessThan(csv.indexOf(detailHeader));
  });

  it("includes the count and plural wording for multiple unlinked records", () => {
    const csv = buildHarvestCsv(
      [makeCsvHarvestRecord(1, 10), makeCsvHarvestRecord(2, 20)],
      [
        { id: 10, blockName: "North Block", variety: "Chardonnay", areaHa: 1 },
        { id: 20, blockName: "South Block", variety: "Pinot Noir", areaHa: 1 },
      ],
      "Test Farm",
      "2026",
    );

    expect(csv).toContain(
      '"WARNING: 2 records not linked to a block — block-level totals may be incomplete"',
    );
  });

  it("omits the warning row when every record is linked", () => {
    const csv = buildHarvestCsv(
      [makeCsvHarvestRecord(1, 10), makeCsvHarvestRecord(2, 20)],
      [
        { id: 10, blockName: "North Block", variety: "Chardonnay", areaHa: 1 },
        { id: 20, blockName: "South Block", variety: "Pinot Noir", areaHa: 1 },
      ],
      "Test Farm",
      "2026",
    );

    expect(csv).not.toContain("WARNING:");
  });
});

function decodeMailtoBody(href: string): string {
  const encodedBody = href.split("&body=")[1];
  if (!encodedBody) throw new Error("Expected mailto body");
  return decodeURIComponent(encodedBody);
}

function getVarietyReportLines(body: string): string[] {
  const section = body.split("Yield by Variety\n")[1];
  if (!section) return [];
  return section
    .split("\n")
    .map(line => line.trim())
    .filter(line => line && !/^-+$/.test(line) && line !== "Prepared by BDE Farm Trac.");
}

describe("buildHarvestReportMailto — Yield by Variety breakdown", () => {
  it("includes all eight columns, two named varieties, and the TOTAL row", () => {
    const records = [
      { ...makeCsvHarvestRecord(1, 10), yieldKg: 600 },
      { ...makeCsvHarvestRecord(2, 10), yieldKg: 400 },
      { ...makeCsvHarvestRecord(3, 20), yieldKg: 500 },
    ];
    const blocks = [
      { id: 10, blockName: "North Block", variety: "Chardonnay", areaHa: 2 },
      { id: 20, blockName: "South Block", variety: "Pinot Noir", areaHa: 1 },
    ];
    const body = decodeMailtoBody(
      buildHarvestReportMailto(records, "Test Farm", null, null, null, blocks, "2026").href,
    );
    const lines = getVarietyReportLines(body);

    expect(lines[0].split(/\s{2,}/)).toEqual([
      "Variety", "Area (ha)", "Total Yield (kg)", "Yield (kg/ha)",
      "Avg Brix", "Avg pH", "Avg TA (g/L)", "Avg Pot. Alc (%)",
    ]);
    expect(lines[1].split(/\s{2,}/)).toEqual([
      "Chardonnay", "2.00", "1200.0", "600", "20.0", "3.20", "6.00", "11.00",
    ]);
    expect(lines[2].split(/\s{2,}/)).toEqual([
      "Pinot Noir", "1.00", "800.0", "800", "22.0", "3.40", "8.00", "13.00",
    ]);
    expect(lines[3].split(/\s{2,}/)).toEqual([
      "TOTAL", "3.00", "2000.0", "667", "21.0", "3.30", "7.00", "12.00",
    ]);
  });

  it("omits the section when fewer than two named varieties exist", () => {
    const body = decodeMailtoBody(
      buildHarvestReportMailto(records, "Test Farm", null, null, null, blocks, "2026").href,
    );

    expect(body).not.toContain("Yield by Variety");
  });

  it("counts a block's area once when it has multiple harvest picks", () => {
    const records = [
      { ...makeCsvHarvestRecord(1, 10), yieldKg: 600 },
      { ...makeCsvHarvestRecord(2, 10), yieldKg: 400 },
      { ...makeCsvHarvestRecord(3, 20), yieldKg: 500 },
    ];
    const blocks = [
      { id: 10, blockName: "North Block", variety: "Chardonnay", areaHa: 2 },
      { id: 20, blockName: "South Block", variety: "Pinot Noir", areaHa: 1 },
    ];
    const body = decodeMailtoBody(
      buildHarvestReportMailto(records, "Test Farm", null, null, null, blocks, "2026").href,
    );
    const lines = getVarietyReportLines(body);

    expect(lines[1].split(/\s{2,}/).slice(0, 4)).toEqual([
      "Chardonnay", "2.00", "1000.0", "500",
    ]);
    expect(lines[3].split(/\s{2,}/).slice(0, 4)).toEqual([
      "TOTAL", "3.00", "1500.0", "500",
    ]);
  });
});

    const inactiveTotalHeader = screen.getByLabelText(
      "Sort variety table by Total kg, not currently sorted",
    );
