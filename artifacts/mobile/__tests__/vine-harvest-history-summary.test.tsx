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
jest.mock("../lib/hooks/usePersistedBlockFilter", () => {
  const React = require("react");
  return {
    usePersistedBlockFilter: () => React.useState<number[]>([]),
  };
});
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
import VineHarvestHistoryScreen, { buildHarvestCsv } from "../app/vine-harvest-history";
import type { VineBlock } from "../lib/hooks/useApiVineBlocks";

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
  it("keeps yield, t/ha, Avg Brix, and record count aligned for all, one, and multiple blocks", async () => {
    const screen = render(<VineHarvestHistoryScreen />);

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
    const varietyNames = /^(Chardonnay|Pinot Noir)$/;
    const orderedNames = (testId: string) =>
      within(screen.getByTestId(testId))
        .getAllByText(varietyNames)
        .map(node => String(node.props.children));

    await waitFor(() => {
      expect(orderedNames("variety-chart-legend")).toEqual(["Chardonnay", "Pinot Noir"]);
      expect(orderedNames("variety-table-body")).toEqual(["Chardonnay", "Pinot Noir"]);
    });

    fireEvent.press(screen.getByLabelText("Sort variety table by Total kg"));

    await waitFor(() => {
      expect(orderedNames("variety-chart-legend")).toEqual(["Pinot Noir", "Chardonnay"]);
      expect(orderedNames("variety-table-body")).toEqual(["Pinot Noir", "Chardonnay"]);
    });
  });
});

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
  };
}

describe("buildHarvestCsv — Yield by Variety guard", () => {
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
    const blocks = varieties.map((variety, index) => ({
      id: index + 1,
      blockName: `Block ${index + 1}`,
      variety,
      areaHa: 1,
    }));

    const records = varieties.map((_, index) =>
      makeCsvHarvestRecord(index + 1, index + 1),
    );

    const csv = buildHarvestCsv(records, blocks, "Test Farm", "2026");

    expect(csv).toContain('"Yield by Variety"');
    for (const variety of varieties) {
      expect(csv).toContain(`"${variety}"`);
    }
    expect(csv).toContain('"TOTAL"');
  });
});