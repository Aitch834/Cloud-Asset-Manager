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
    Platform: { OS: "ios" },
    Pressable: host("Pressable"),
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

jest.mock("@expo/vector-icons", () => ({
  Feather: () => null,
}));
jest.mock("expo-haptics", () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: "success" },
}));
jest.mock("expo-location", () => ({
  Accuracy: { High: "high" },
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));
jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("../components/ui/Button", () => {
  const React = require("react");
  const ReactNative = require("react-native");
  return {
    Button: ({ title, onPress, disabled }: { title: string; onPress: () => void; disabled?: boolean }) =>
      React.createElement(ReactNative.Pressable, { onPress, disabled },
        React.createElement(ReactNative.Text, null, title)),
  };
});
jest.mock("../components/ui/Input", () => {
  const React = require("react");
  const ReactNative = require("react-native");
  return {
    Input: ({ label, ...props }: { label: string; [key: string]: unknown }) =>
      React.createElement(ReactNative.TextInput, { ...props, testID: `input-${label}` }),
  };
});
jest.mock("../components/ui/LookupPicker", () => ({
  LookupPicker: () => null,
}));
jest.mock("../lib/refCache", () => ({
  getCachedStaffMembers: jest.fn(async () => []),
}));
jest.mock("../lib/context/FarmContext", () => ({
  useFarm: jest.fn(),
}));
jest.mock("../lib/context/SyncContext", () => ({
  useSync: jest.fn(),
}));
jest.mock("../lib/hooks/useApiModules", () => ({
  useApiModules: jest.fn(),
}));
jest.mock("../lib/storage", () => ({
  appendToList: jest.fn(),
  generateId: jest.fn(() => "reading-1"),
  STORAGE_KEYS: { IRRIGATION_METER_READINGS: "irrigation_meter_readings" },
}));

import React from "react";
import { Alert } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

import IrrigationMeterScreen from "../app/irrigation-meter";
import { useFarm } from "../lib/context/FarmContext";
import { useSync } from "../lib/context/SyncContext";
import { useApiModules } from "../lib/hooks/useApiModules";
import { appendToList, STORAGE_KEYS } from "../lib/storage";

const FARM_ID = "farm-42";
const refreshPendingCount = jest.fn(async () => undefined);
const useFarmMock = useFarm as jest.MockedFunction<typeof useFarm>;
const useSyncMock = useSync as jest.MockedFunction<typeof useSync>;
const useApiModulesMock = useApiModules as jest.MockedFunction<typeof useApiModules>;
const appendToListMock = appendToList as jest.MockedFunction<typeof appendToList>;

function configureModules(activeModuleKeys: string[]): void {
  useFarmMock.mockReturnValue({
    currentFarm: { id: FARM_ID, name: "Test Farm" },
    user: { name: "Test Grower" },
  } as unknown as ReturnType<typeof useFarm>);
  useSyncMock.mockReturnValue({
    refreshPendingCount,
  } as unknown as ReturnType<typeof useSync>);
  useApiModulesMock.mockReturnValue({
    activeModuleKeys,
    loading: false,
    attemptedFarmId: FARM_ID,
    resolvedFarmId: FARM_ID,
  } as ReturnType<typeof useApiModules>);
}

describe("Irrigation meter module pre-flight guard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    appendToListMock.mockResolvedValue(undefined);
  });

  it("shows the module message and does not queue a reading when inactive", () => {
    configureModules([]);
    const screen = render(<IrrigationMeterScreen />);

    fireEvent.press(screen.getByText("Save Meter Reading"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Module Not Enabled",
      "The Water & Irrigation module is not active on this farm. Please contact your farm administrator to enable it before logging irrigation records.",
      [{ text: "OK" }],
    );
    expect(appendToListMock).not.toHaveBeenCalled();
    expect(refreshPendingCount).not.toHaveBeenCalled();
  });

  it("queues a reading when the water-irrigation module is active", async () => {
    configureModules(["water-irrigation"]);
    const screen = render(<IrrigationMeterScreen />);

    fireEvent.changeText(screen.getByTestId("input-Water Source Name"), "North bore hole");
    fireEvent.changeText(screen.getByTestId("input-Current Reading (m³)"), "12450.5");
    fireEvent.press(screen.getByText("Save Meter Reading"));

    await waitFor(() => {
      expect(appendToListMock).toHaveBeenCalledWith(
        STORAGE_KEYS.IRRIGATION_METER_READINGS,
        expect.objectContaining({
          id: "reading-1",
          farmId: FARM_ID,
          sourceName: "North bore hole",
          readingM3: "12450.5",
          synced: false,
        }),
      );
    });
    expect(refreshPendingCount).toHaveBeenCalledTimes(1);
    expect(Alert.alert).toHaveBeenCalledWith(
      "Reading Saved",
      "Meter reading recorded.",
      expect.any(Array),
    );
  });
});