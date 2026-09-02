jest.mock("expo/virtual/env", () => ({ env: process.env }));

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

  return {
    ActivityIndicator: host("ActivityIndicator"),
    Alert: { alert: jest.fn() },
    Platform: { OS: "android" },
    Pressable: host("Pressable"),
    RefreshControl: host("RefreshControl"),
    ScrollView: host("ScrollView"),
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten,
    },
    Text: host("Text"),
    View: host("View"),
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

jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
  useFocusEffect: (callback: () => void) => {
    const React = require("react");
    React.useEffect(callback, [callback]);
  },
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("@/lib/context/FarmContext", () => ({
  useFarm: () => ({ currentFarm: undefined }),
}));

jest.mock("@/lib/database", () => ({
  kvGet: jest.fn(),
}));

jest.mock("@/lib/organicFieldStatusCsv", () => ({
  buildOrganicFieldStatusCsv: jest.fn(),
  buildOrganicFieldStatusCsvFilename: jest.fn(() => "field-status-register-farm.csv"),
  shareOrganicFieldStatusCsv: jest.fn(),
}));

import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import OrganicFieldsListScreen from "../app/organic-fields-list";

describe("OrganicFieldsListScreen CSV export", () => {
  it("shows the empty-state export alert without attempting a file share", async () => {
    const screen = render(<OrganicFieldsListScreen />);

    await waitFor(() => {
      expect(screen.getByText("No field status records")).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText("Download CSV"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Nothing to export",
      "There are no field status records to download.",
    );
  });
});