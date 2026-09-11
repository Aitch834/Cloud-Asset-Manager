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
    FlatList: ({ data, renderItem, ListHeaderComponent, ...props }: any) =>
      React.createElement(
        "FlatList",
        props,
        ListHeaderComponent,
        data.map((item: unknown, index: number) =>
          React.createElement(
            React.Fragment,
            { key: String((item as { id?: unknown }).id ?? index) },
            renderItem({ item, index }),
          ),
        ),
      ),
    KeyboardAvoidingView: host("KeyboardAvoidingView"),
    Modal: ({ visible, children, ...props }: any) =>
      visible ? React.createElement("Modal", props, children) : null,
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

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("../lib/context/FarmContext", () => ({
  useFarm: () => ({
    currentFarm: { id: 7, name: "Fixture Vineyard", sectorViticulture: true },
  }),
}));

jest.mock("../lib/hooks/useFarmIdentifiers", () => ({
  useFarmIdentifiers: () => ({
    farmName: "Fixture Vineyard",
    sbiNumber: "123456789",
    address: "Vine Lane",
    postcode: "AB1 2CD",
    loading: false,
  }),
}));

jest.mock("../lib/hooks/useApiVineBlocks", () => ({
  useApiVineBlocks: () => ({
    blocks: [],
    loading: false,
    updateBlock: jest.fn(),
  }),
}));

jest.mock("../lib/hooks/usePersistedVineRegisterStatusFilter", () => ({
  usePersistedVineRegisterStatusFilter: () => ["all", jest.fn()],
}));

jest.mock("../lib/hooks/usePrint", () => ({
  usePrint: () => ({ savePdf: jest.fn() }),
}));

jest.mock("../lib/uploadPhoto", () => ({
  getApiBase: () => "https://example.test",
  getAuthToken: jest.fn(async () => null),
}));

jest.mock("../lib/database", () => ({
  kvGet: jest.fn(async () => null),
}));

jest.mock("../utils/openExternalUrl", () => ({
  openExternalUrl: jest.fn(async () => undefined),
}));

const initialEntry = {
  id: 42,
  fsaVineRegisterRef: "VR-2024-009",
  registeredVariety: "Bacchus",
  registeredAreaHa: "1.25",
  giClassification: "English Wine PDO",
  wineColour: "White",
  dateRegistered: "2024-06-15T00:00:00.000Z",
  isRemovedFromRegister: false,
};

let mockServerEntry = { ...initialEntry };
const mockApiFetch = jest.fn();

jest.mock("../lib/apiFetch", () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

jest.mock("../lib/hooks/useApiFetch", () => {
  const React = require("react");
  return {
    useApiFetch: () => {
      const [records, setRecords] = React.useState([{ ...mockServerEntry }]);
      const refresh = React.useCallback(async () => {
        setRecords([{ ...mockServerEntry }]);
      }, []);
      return {
        records,
        loading: false,
        refreshing: false,
        error: null,
        refresh,
      };
    },
  };
});

import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { FlatList, Pressable, Text } from "react-native";
import VineRegisterScreen from "../app/vine-register";

const response = (payload: unknown): Response =>
  ({
    ok: true,
    status: 200,
    json: async () => payload,
    text: async () => "",
  }) as Response;

describe("Vine Register entry editing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockServerEntry = { ...initialEntry };
    mockApiFetch.mockImplementation(async (url: string, options?: RequestInit) => {
      if (options?.method === "PUT" && url.endsWith("/vine-register/42")) {
        mockServerEntry = {
          ...mockServerEntry,
          ...JSON.parse(String(options.body)),
        };
        return response({ record: { ...mockServerEntry } });
      }
      return response({});
    });
  });

  it("prefills, saves, refreshes, and reopens an edited entry", async () => {
    const screen = render(<VineRegisterScreen />);

    fireEvent.press(screen.getByLabelText("Edit vine register entry for Bacchus"));

    await waitFor(() => {
      expect(screen.getByText("Edit Register Entry")).toBeTruthy();
      expect(screen.getByLabelText("Selected: Bacchus. Tap to clear.")).toBeTruthy();
    });
    expect(screen.getByPlaceholderText("e.g. 0.50").props.value).toBe("1.25");
    const selectedChipLabels = screen
      .UNSAFE_getAllByType(Pressable)
      .filter((node) => node.props.accessibilityState?.selected)
      .flatMap((node) =>
        node
          .findAllByType(Text)
          .map((textNode) => textNode.props.children)
          .filter((value): value is string => typeof value === "string"),
      );
    expect(selectedChipLabels).toEqual(
      expect.arrayContaining(["English Wine PDO", "White"]),
    );
    expect(screen.getByPlaceholderText("e.g. VR123456").props.value).toBe("VR-2024-009");
    expect(screen.getByPlaceholderText("YYYY-MM-DD").props.value).toBe("2024-06-15");

    fireEvent.changeText(screen.getByPlaceholderText("e.g. 0.50"), "1.75");
    fireEvent.press(screen.getByLabelText("Save entry"));

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        "/api/farms/7/vine-register/42",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            registeredVariety: "Bacchus",
            registeredAreaHa: "1.75",
            giClassification: "English Wine PDO",
            wineColour: "White",
            fsaVineRegisterRef: "VR-2024-009",
            dateRegistered: "2024-06-15",
          }),
        },
      );
      expect(screen.getByText("1.75 ha")).toBeTruthy();
    });

    const list = screen.UNSAFE_getByType(FlatList);
    await act(async () => {
      await list.props.refreshControl.props.onRefresh();
    });

    fireEvent.press(screen.getByLabelText("Edit vine register entry for Bacchus"));
    await waitFor(() => {
      expect(screen.getByPlaceholderText("e.g. 0.50").props.value).toBe("1.75");
    });
  });
});