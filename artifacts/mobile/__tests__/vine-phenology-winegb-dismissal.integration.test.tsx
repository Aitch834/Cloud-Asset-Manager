jest.mock("react-native", () => {
  const React = require("react");
  const host = (name: string) =>
    React.forwardRef(
      (props: Record<string, unknown>, ref: React.Ref<unknown>) =>
        React.createElement(name, { ...props, ref }, props.children),
    );

  return {
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

jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));
jest.mock("expo-haptics", () => ({
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  NotificationFeedbackType: { Success: "success" },
}));
jest.mock("expo-router", () => ({ router: { back: jest.fn() } }));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("../components/ui/Button", () => {
  const React = require("react");
  const ReactNative = require("react-native");
  return {
    Button: ({
      title,
      onPress,
      disabled,
    }: {
      title: string;
      onPress: () => void;
      disabled?: boolean;
    }) =>
      React.createElement(
        ReactNative.Pressable,
        { onPress, disabled },
        React.createElement(ReactNative.Text, null, title),
      ),
  };
});
jest.mock("../components/ui/Input", () => ({ Input: () => null }));
jest.mock("../components/StaffMemberPicker", () => ({
  StaffMemberPicker: () => null,
  memberFullName: () => "",
}));
jest.mock("../components/VineBlockPicker", () => ({ VineBlockPicker: () => null }));
jest.mock("../components/ui/IdentifierBanner", () => ({ IdentifierBanner: () => null }));
jest.mock("../lib/context/FarmContext", () => ({
  useFarm: () => ({
    currentFarm: { id: "farm-1", sectorViticulture: true },
    user: { id: "user-1", name: "Grower" },
  }),
}));
jest.mock("../lib/context/SyncContext", () => ({
  useSync: () => ({ refreshPendingCount: jest.fn(async () => undefined) }),
}));
jest.mock("../lib/hooks/useApiFarmMembers", () => ({
  useApiFarmMembers: () => ({ members: [] }),
}));
jest.mock("../lib/hooks/useApiVineBlocks", () => ({
  useApiVineBlocks: () => ({ blocks: [], loading: false }),
}));
jest.mock("../lib/hooks/useFarmIdentifiers", () => ({
  useFarmIdentifiers: () => ({
    cphNumber: "12/345/6789",
    sbiNumber: "123456789",
    loading: false,
    justSaved: false,
    clearJustSaved: jest.fn(),
  }),
}));
jest.mock("../lib/hooks/useIdentifierBannerDismiss", () => ({
  useIdentifierBannerDismiss: () => ({ dismissed: false, dismiss: jest.fn() }),
}));
jest.mock("../lib/hooks/useUiPrefBatchMigrationGuard", () => ({
  useUiPrefBatchMigrationGuard: () => true,
}));
jest.mock("../lib/storage", () => ({
  appendToList: jest.fn(async () => undefined),
  generateId: () => "phenology-1",
}));
jest.mock("../lib/apiFetch", () => ({ apiFetch: jest.fn() }));
jest.mock("../utils/openExternalUrl", () => ({ openExternalUrl: jest.fn() }));

const mockDismissHintDurable = jest.fn<Promise<void>, [string, string]>();
jest.mock("../lib/hooks/useUiPrefs", () => ({
  useUiPrefs: () => ({
    prefsReady: true,
    isHintDismissed: () => false,
  }),
  dismissHintDurable: (...args: [string, string]) =>
    mockDismissHintDurable(...args),
}));

import React from "react";
import { Alert } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";

import VinePhenologyScreen from "../app/vine-phenology";

describe("WineGB prompt dismissal on a phone", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("stays visible after a failed write and dismisses after storage recovers", async () => {
    mockDismissHintDurable
      .mockRejectedValueOnce(new Error("Storage unavailable"))
      .mockResolvedValueOnce(undefined);

    const screen = render(<VinePhenologyScreen />);
    fireEvent.press(
      screen.getByText("Fruit set — berries pea-sized"),
    );
    fireEvent.press(screen.getByText("Save Phenology Observation"));

    await waitFor(() => {
      expect(screen.getByText("WineGB Fruit Set Survey")).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText("Dismiss WineGB survey prompt"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Could not dismiss prompt",
        "Your preference could not be saved. Please try again.",
      );
    });
    expect(router.back).not.toHaveBeenCalled();
    expect(screen.getByText("WineGB Fruit Set Survey")).toBeTruthy();

    fireEvent.press(screen.getByText("Done"));

    await waitFor(() => {
      expect(mockDismissHintDurable).toHaveBeenCalledTimes(2);
      expect(router.back).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByText("WineGB Fruit Set Survey")).toBeNull();
  });
});