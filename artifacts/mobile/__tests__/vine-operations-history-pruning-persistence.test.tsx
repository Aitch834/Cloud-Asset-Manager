jest.mock("react-native", () => {
  const React = require("react");
  const host = (name: string) =>
    React.forwardRef(
      (props: Record<string, unknown>, ref: React.Ref<unknown>) =>
        React.createElement(name, { ...props, ref }, props.children),
    );
  const View = host("View");
  const Text = host("Text");
  const Pressable = host("Pressable");
  const TextInput = host("TextInput");
  const RefreshControl = host("RefreshControl");
  const flatten = (style: unknown): Record<string, unknown> => {
    if (!Array.isArray(style)) return (style as Record<string, unknown>) ?? {};
    return style.reduce(
      (merged, item) => ({ ...merged, ...flatten(item) }),
      {} as Record<string, unknown>,
    );
  };
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
    ActivityIndicator: host("ActivityIndicator"),
    Alert: { alert: jest.fn() },
    FlatList,
    KeyboardAvoidingView: host("KeyboardAvoidingView"),
    Modal,
    Platform: { OS: "android" },
    Pressable,
    RefreshControl,
    ScrollView: host("ScrollView"),
    StyleSheet: { create: (styles: Record<string, unknown>) => styles, flatten },
    Text,
    TextInput,
    View,
  };
});

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Feather: ({ name }: { name: string }) => React.createElement(Text, null, name),
  };
});
jest.mock("expo-haptics", () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: "medium" },
  NotificationFeedbackType: { Success: "success" },
}));
jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useFocusEffect: jest.fn(),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("../components/VineBlockPicker", () => ({
  VineBlockPicker: () => null,
}));
jest.mock("../components/ui/Button", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");
  return {
    Button: ({ title, onPress, disabled }: { title: string; onPress: () => void; disabled?: boolean }) =>
      React.createElement(
        Pressable,
        { onPress, disabled },
        React.createElement(Text, null, title),
      ),
  };
});
jest.mock("../components/ui/Input", () => {
  const React = require("react");
  const { TextInput } = require("react-native");
  return {
    Input: (props: Record<string, unknown>) => React.createElement(TextInput, props),
  };
});
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
jest.mock("../lib/apiFetch", () => ({
  apiFetch: jest.fn(),
}));
jest.mock("../lib/hooks/usePrint", () => ({
  usePrint: () => ({ savePdf: jest.fn() }),
}));
jest.mock("../lib/printTemplates", () => ({
  vineOperationsHtml: jest.fn(() => "<html />"),
}));
jest.mock("../lib/vineyardCountEvents", () => ({
  vineyardCountEvents: { emit: jest.fn() },
}));

const { useFarm } = require("../lib/context/FarmContext") as { useFarm: jest.Mock };
const { useApiFetch } = require("../lib/hooks/useApiFetch") as { useApiFetch: jest.Mock };
const { useApiVineBlocks } = require("../lib/hooks/useApiVineBlocks") as { useApiVineBlocks: jest.Mock };
const { useFarmIdentifiers } = require("../lib/hooks/useFarmIdentifiers") as { useFarmIdentifiers: jest.Mock };
const { useIdentifierBannerDismiss } = require("../lib/hooks/useIdentifierBannerDismiss") as {
  useIdentifierBannerDismiss: jest.Mock;
};
const { apiFetch } = require("../lib/apiFetch") as { apiFetch: jest.Mock };

import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import VineOperationsHistoryScreen from "../app/vine-operations-history";

const refresh = jest.fn();
let serverRecords: Array<Record<string, unknown>>;

function configureScreen() {
  useFarm.mockReturnValue({
    currentFarm: { id: "farm-1", name: "Test Vineyard" },
    user: { id: "user-1" },
  });
  useApiFetch.mockImplementation(() => ({
    records: serverRecords,
    loading: false,
    refreshing: false,
    error: null,
    refresh,
  }));
  useApiVineBlocks.mockReturnValue({ blocks: [], loading: false });
  useFarmIdentifiers.mockReturnValue({
    address: "Vineyard Lane",
    loading: false,
    justSaved: false,
    clearJustSaved: jest.fn(),
    refetch: jest.fn(),
  });
  useIdentifierBannerDismiss.mockReturnValue({ dismissed: true, dismiss: jest.fn() });
  apiFetch.mockImplementation(async (_url: string, options: { body?: string }) => {
    const body = JSON.parse(options.body ?? "{}");
    serverRecords = serverRecords.map(record =>
      record.id === 1 ? { ...record, ...body } : record,
    );
    return { ok: true, json: jest.fn() };
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  serverRecords = [
    {
      id: 1,
      operationDate: "2026-02-10",
      blockId: 11,
      blockName: "North Block",
      operationType: "Winter Pruning",
      operatorName: "Grower",
      hoursWorked: 4,
      notes: null,
      pruningSystem: null,
      budsPerVineTarget: null,
      budsPerVineActual: null,
      pruningWeightKgPerVine: null,
      shootsRemovedPct: null,
      leavesRemovedZone: null,
      machineUsed: null,
      contractorName: null,
    },
    {
      id: 2,
      operationDate: "2026-06-10",
      blockId: 12,
      blockName: "South Block",
      operationType: "Leaf Removal",
      operatorName: "Grower",
      hoursWorked: 2,
      notes: null,
      pruningSystem: "Must not render",
      budsPerVineTarget: null,
      budsPerVineActual: 99,
      pruningWeightKgPerVine: null,
      shootsRemovedPct: 20,
      leavesRemovedZone: "Fruit zone",
      machineUsed: null,
      contractorName: null,
    },
  ];
  configureScreen();
});

it("keeps edited pruning details after refresh and revisiting history", async () => {
  const screen = render(<VineOperationsHistoryScreen />);

  expect(screen.queryByText("Must not render · 99 buds/vine")).toBeNull();
  fireEvent.press(screen.getByText("Winter Pruning"));
  fireEvent.press(screen.getByText("Cordon Spur"));
  fireEvent.changeText(screen.getByPlaceholderText("e.g. 7"), "8");
  fireEvent.press(screen.getByText("Save Changes"));

  await waitFor(() => {
    expect(apiFetch).toHaveBeenCalledWith(
      "/api/farms/farm-1/vineyard-operations/1",
      expect.objectContaining({ method: "PUT" }),
    );
    expect(screen.getByText("Cordon Spur · 8 buds/vine")).toBeTruthy();
  });

  const list = screen
    .UNSAFE_getAllByType("View" as never)
    .find(node => node.props.refreshControl);
  expect(list).toBeTruthy();
  act(() => list!.props.refreshControl.props.onRefresh());
  expect(refresh).toHaveBeenCalledTimes(1);

  screen.unmount();
  const revisited = render(<VineOperationsHistoryScreen />);
  expect(revisited.getByText("Cordon Spur · 8 buds/vine")).toBeTruthy();
  expect(revisited.queryByText("Must not render · 99 buds/vine")).toBeNull();
});

it("permanently clears pruning details when changing to a non-pruning operation", async () => {
  serverRecords = [
    {
      id: 1,
      operationDate: "2026-02-10",
      blockId: 11,
      blockName: "North Block",
      operationType: "Winter Pruning",
      operatorName: "Grower",
      hoursWorked: 4,
      notes: null,
      pruningSystem: "Cordon Spur",
      budsPerVineTarget: 10,
      budsPerVineActual: 8,
      pruningWeightKgPerVine: 0.45,
      shootsRemovedPct: null,
      leavesRemovedZone: null,
      machineUsed: null,
      contractorName: null,
    },
  ];

  const screen = render(<VineOperationsHistoryScreen />);
  fireEvent.press(screen.getByText("Winter Pruning"));
  fireEvent.press(screen.getByText("Leaf Removal"));
  fireEvent.press(screen.getByText("Save Changes"));

  await waitFor(() => {
    expect(apiFetch).toHaveBeenCalledWith(
      "/api/farms/farm-1/vineyard-operations/1",
      expect.objectContaining({ method: "PUT" }),
    );
    expect(screen.getByText("Leaf Removal")).toBeTruthy();
  });

  const [, request] = apiFetch.mock.calls[0] as [
    string,
    { body?: string },
  ];
  expect(JSON.parse(request.body ?? "{}")).toEqual(
    expect.objectContaining({
      operationType: "Leaf Removal",
      pruningSystem: null,
      budsPerVineTarget: null,
      budsPerVineActual: null,
      pruningWeightKgPerVine: null,
    }),
  );

  const list = screen
    .UNSAFE_getAllByType("View" as never)
    .find(node => node.props.refreshControl);
  expect(list).toBeTruthy();
  act(() => list!.props.refreshControl.props.onRefresh());
  expect(refresh).toHaveBeenCalledTimes(1);

  screen.unmount();
  const revisited = render(<VineOperationsHistoryScreen />);
  fireEvent.press(revisited.getByText("Leaf Removal"));
  fireEvent.press(revisited.getByText("Winter Pruning"));

  expect(revisited.getByPlaceholderText("e.g. 8").props.value).toBe("");
  expect(revisited.getByPlaceholderText("e.g. 7").props.value).toBe("");
  expect(revisited.getByPlaceholderText("e.g. 0.45").props.value).toBe("");
});