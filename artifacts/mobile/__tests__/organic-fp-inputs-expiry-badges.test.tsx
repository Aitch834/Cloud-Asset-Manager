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

jest.mock("expo-file-system/legacy", () => ({
  cacheDirectory: "file:///cache/",
  EncodingType: { UTF8: "utf8" },
  writeAsStringAsync: jest.fn(),
}));

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useFocusEffect: (callback: () => void) => {
    const React = require("react");
    React.useEffect(callback, [callback]);
  },
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("@/lib/context/FarmContext", () => ({
  useFarm: () => ({ currentFarm: { id: 7, name: "Boundary Farm" } }),
}));

const pendingRecords = [
  ["Restricted expired", "restricted", "2026-09-09"],
  ["Restricted today", "restricted", "2026-09-10"],
  ["Restricted later", "restricted", "2026-10-11"],
  ["Derogation expired", "derogation", "2026-09-09"],
  ["Derogation thirty days", "derogation", "2026-10-10"],
  ["Derogation missing", "derogation", null],
  ["Permitted dated", "permitted", "2026-09-09"],
] as const;

jest.mock("@/lib/database", () => ({
  getPendingSyncItems: jest.fn(async () =>
    pendingRecords.map(([productName, approvalStatus, derogationExpiryDate], index) => ({
      record_type: "organic_fp_inputs",
      record_id: String(index + 1),
      data_json: JSON.stringify({
        farmId: 7,
        productName,
        approvalStatus,
        derogationExpiryDate,
      }),
    })),
  ),
  kvGet: jest.fn(async () => null),
}));

jest.mock("@/lib/storage", () => ({
  STORAGE_KEYS: { ORGANIC_FP_INPUTS: "organic_fp_inputs" },
}));

import { render, waitFor } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import OrganicFpInputsListScreen from "../app/organic-fp-inputs-list";

describe("OrganicFpInputsListScreen expiry badges", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-10T12:00:00.000Z"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("keeps expiry dates visible and applies red and amber treatments at the boundaries", async () => {
    const screen = render(<OrganicFpInputsListScreen />);

    await waitFor(() => {
      expect(screen.getByText("Restricted expired")).toBeTruthy();
    });

    const expiredLabels = screen.getAllByText("Derogation expires: 09 Sept 2026");
    expect(expiredLabels).toHaveLength(2);
    for (const label of expiredLabels) {
      expect(StyleSheet.flatten(label.props.style)).toMatchObject({
        color: "#DC2626",
      });
    }

    const expiredBadges = screen.getAllByText("Expired");
    expect(expiredBadges).toHaveLength(2);
    for (const badge of expiredBadges) {
      expect(StyleSheet.flatten(badge.props.style)).toMatchObject({
        color: "#DC2626",
      });
    }
    for (const labelText of [
      "Derogation expires: 10 Sept 2026",
      "Derogation expires: 10 Oct 2026",
    ]) {
      expect(StyleSheet.flatten(screen.getByText(labelText).props.style)).toMatchObject({
        color: "#92400e",
      });
    }

    for (const badgeText of ["0d", "30d"]) {
      const badge = screen.getByText(badgeText);
      expect(StyleSheet.flatten(badge.props.style)).toMatchObject({
        color: "#92400e",
      });
    }

    const laterLabel = screen.getByText("Derogation expires: 11 Oct 2026");
    expect(StyleSheet.flatten(laterLabel.props.style)).toMatchObject({
      color: "#6B7280",
    });
    expect(screen.queryByText("31d")).toBeNull();
  });

  it("shows missing expiry guidance only for relevant rows and never warns for permitted rows", async () => {
    const screen = render(<OrganicFpInputsListScreen />);

    await waitFor(() => {
      expect(screen.getByText("Derogation missing")).toBeTruthy();
    });

    expect(screen.getAllByText("No expiry date recorded")).toHaveLength(1);
    expect(screen.getByText("Permitted dated")).toBeTruthy();
    expect(screen.getAllByText("Derogation expires: 09 Sept 2026")).toHaveLength(2);
    expect(screen.getAllByText("Expired")).toHaveLength(2);
  });
});