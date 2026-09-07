/**
 * Screen-level regression coverage for missing block-area guidance in the
 * Yield by Variety table.
 *
 * A variety can have a yield but no calculable t/ha when its linked block has
 * no area. The row must explain how to fix that, and it must use the same
 * explanation as the farm-wide t/ha summary.
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
  const TextInput = host("TextInput");
  const ActivityIndicator = host("ActivityIndicator");
  const RefreshControl = host("RefreshControl");
  const KeyboardAvoidingView = host("KeyboardAvoidingView");
  const Modal = ({ visible, children, ...props }: Record<string, unknown>) =>
    visible ? React.createElement("Modal", props, children) : null;
  const FlatList = ({
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
      View,
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
    StyleSheet: { create: (styles: Record<string, unknown>) => styles, flatten },
    Text,
    TextInput,
    View,
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
jest.mock("expo-file-system/legacy", () => ({
  cacheDirectory: "file:///cache/",
  EncodingType: { UTF8: "utf8" },
  writeAsStringAsync: jest.fn(),
}));
jest.mock("expo-haptics", () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
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
jest.mock("../lib/hooks/usePersistedBlockFilter", () => ({
  usePersistedBlockFilter: jest.fn(),
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
  getList: jest.fn(),
}));
jest.mock("../lib/sync-engine", () => ({
  subscribe: jest.fn(() => jest.fn()),
}));
jest.mock("../utils/openExternalUrl", () => ({
  openExternalUrl: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Alert } = require("react-native") as {
  Alert: { alert: jest.Mock };
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { apiFetch } = require("../lib/apiFetch") as {
  apiFetch: jest.Mock;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useFarm } = require("../lib/context/FarmContext") as {
  useFarm: jest.Mock;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useApiFetch } = require("../lib/hooks/useApiFetch") as {
  useApiFetch: jest.Mock;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useApiVineBlocks } = require("../lib/hooks/useApiVineBlocks") as {
  useApiVineBlocks: jest.Mock;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useFarmIdentifiers } = require("../lib/hooks/useFarmIdentifiers") as {
  useFarmIdentifiers: jest.Mock;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useIdentifierBannerDismiss } = require("../lib/hooks/useIdentifierBannerDismiss") as {
  useIdentifierBannerDismiss: jest.Mock;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { usePersistedBlockFilter } = require("../lib/hooks/usePersistedBlockFilter") as {
  usePersistedBlockFilter: jest.Mock;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { usePersistedVintage } = require("../lib/hooks/usePersistedVintage") as {
  usePersistedVintage: jest.Mock;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { usePersistedVarietySort } = require("../lib/hooks/usePersistedVarietySort") as {
  usePersistedVarietySort: jest.Mock;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { usePersistedVarietyColumns } = require("../lib/hooks/usePersistedVarietyColumns") as {
  usePersistedVarietyColumns: jest.Mock;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { usePersistedVarietyTableOpen } = require("../lib/hooks/usePersistedVarietyTableOpen") as {
  usePersistedVarietyTableOpen: jest.Mock;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { usePersistedChemistryCrossTabSort } = require("../lib/hooks/usePersistedChemistryCrossTabSort") as {
  usePersistedChemistryCrossTabSort: jest.Mock;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getList } = require("../lib/storage") as {
  getList: jest.Mock;
};

import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import VineHarvestHistoryScreen from "../app/vine-harvest-history";

const FARM_ID = "farm-3";
const BLOCK_WITHOUT_AREA = 11;
const BLOCK_WITH_AREA = 12;
const BLOCK_AREA_MESSAGE =
  "t/ha is calculated from each block's area. Open Vineyard Blocks and enter the area (ha) for each block to see this figure.";

function configureScreen() {
  useFarm.mockReturnValue({
    currentFarm: { id: FARM_ID, name: "Test Farm" },
    user: { id: "test-user" },
  });
  useApiFetch.mockReturnValue({
    records: [
      {
        id: 1,
        harvestDate: "2026-09-01",
        blockId: BLOCK_WITHOUT_AREA,
        blockName: "North Block",
        vintageYear: 2026,
        harvestMethod: "Hand",
        yieldKg: 1000,
        brix: null,
        ph: null,
        titratableAcidityGl: null,
        potentialAlcohol: null,
        grapeCondition: "Good",
        operatorName: "Test operator",
        notes: null,
      },
      {
        id: 2,
        harvestDate: "2026-09-01",
        blockId: BLOCK_WITH_AREA,
        blockName: "South Block",
        vintageYear: 2026,
        harvestMethod: "Hand",
        yieldKg: 500,
        brix: null,
        ph: null,
        titratableAcidityGl: null,
        potentialAlcohol: null,
        grapeCondition: "Good",
        operatorName: "Test operator",
        notes: null,
      },
    ],
    loading: false,
    refreshing: false,
    error: null,
    refresh: jest.fn(),
    recordsFarmId: FARM_ID,
  });
  useApiVineBlocks.mockReturnValue({
    blocks: [
      {
        id: BLOCK_WITHOUT_AREA,
        blockName: "North Block",
        variety: "Chardonnay",
        areaHa: null,
      },
      {
        id: BLOCK_WITH_AREA,
        blockName: "South Block",
        variety: "Pinot Noir",
        areaHa: null,
      },
    ],
    loading: false,
  });
  useFarmIdentifiers.mockReturnValue({
    sbiNumber: null,
    address: "Test Farm Lane",
    loading: false,
    justSaved: false,
    clearJustSaved: jest.fn(),
    refetch: jest.fn(),
  });
  useIdentifierBannerDismiss.mockReturnValue({
    dismissed: true,
    dismiss: jest.fn(),
  });
  usePersistedBlockFilter.mockReturnValue([[], jest.fn()]);
  usePersistedVintage.mockReturnValue([null, jest.fn(), FARM_ID]);
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
  getList.mockResolvedValue([]);
  apiFetch.mockResolvedValue({ ok: false, json: jest.fn() });
}

beforeEach(() => {
  jest.clearAllMocks();
  configureScreen();
});

describe("VineHarvestHistoryScreen — missing variety t/ha guidance", () => {
  it("explains how to set block area and opens the same explanation as the summary", async () => {
    const screen = render(<VineHarvestHistoryScreen />);
    await waitFor(() => {
      expect(
        screen.getByLabelText("Set block area to calculate t/ha for Chardonnay"),
      ).toBeTruthy();
    });
    const guidance = screen.getAllByText("Set block area to calculate");

    // The summary and both missing-area variety rows remain actionable.
    expect(guidance).toHaveLength(3);
    expect(
      screen.getByLabelText("Set block area to calculate t/ha for Chardonnay"),
    ).toBeTruthy();

    fireEvent.press(
      screen.getByLabelText("Set block area to calculate t/ha for Chardonnay"),
    );
    expect(Alert.alert).toHaveBeenNthCalledWith(
      1,
      "Block area not set",
      BLOCK_AREA_MESSAGE,
      [{ text: "OK" }],
    );

    // The farm-wide summary uses the same callback/message, not a separate
    // explanation that could drift from the row guidance.
    fireEvent.press(guidance[0]);
    expect(Alert.alert).toHaveBeenNthCalledWith(
      2,
      "Block area not set",
      BLOCK_AREA_MESSAGE,
      [{ text: "OK" }],
    );
  });

  it("shows actionable guidance for a variety linked to a zero-area block", async () => {
    useApiVineBlocks.mockReturnValue({
      blocks: [
        {
          id: BLOCK_WITHOUT_AREA,
          blockName: "North Block",
          variety: "Chardonnay",
          areaHa: 0,
        },
        {
          id: BLOCK_WITH_AREA,
          blockName: "South Block",
          variety: "Pinot Noir",
          areaHa: 1,
        },
      ],
      loading: false,
    });

    const screen = render(<VineHarvestHistoryScreen />);
    const zeroAreaGuidance = await screen.findByLabelText(
      "Set block area to calculate t/ha for Chardonnay",
    );

    expect(screen.getByText("Set block area to calculate")).toBeTruthy();

    fireEvent.press(zeroAreaGuidance);
    expect(Alert.alert).toHaveBeenCalledWith(
      "Block area not set",
      BLOCK_AREA_MESSAGE,
      [{ text: "OK" }],
    );
  });
});