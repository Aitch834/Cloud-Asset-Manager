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
    Alert: { alert: jest.fn() },
    KeyboardAvoidingView: host("KeyboardAvoidingView"),
    Platform: { OS: "android" },
    Pressable: host("Pressable"),
    ScrollView: host("ScrollView"),
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten,
      hairlineWidth: 1,
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
jest.mock("expo-haptics", () => ({
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: "success" },
}));
jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useFocusEffect: jest.fn(),
  useLocalSearchParams: () => ({}),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("../components/StaffMemberPicker", () => ({
  StaffMemberPicker: () => null,
  memberFullName: jest.fn(() => "Test Grower"),
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
jest.mock("../components/ui/RaiseTaskSheet", () => ({
  RaiseTaskSheet: () => null,
}));

jest.mock("../lib/context/FarmContext", () => ({
  useFarm: jest.fn(),
}));
jest.mock("../lib/context/SyncContext", () => ({
  useSync: () => ({ refreshPendingCount: jest.fn() }),
}));
jest.mock("../lib/hooks/useApiFarmMembers", () => ({
  useApiFarmMembers: () => ({ members: [] }),
}));
jest.mock("../lib/hooks/useApiFetch", () => ({
  useApiFetch: () => ({
    records: [],
    loading: false,
    error: null,
    refresh: jest.fn(),
  }),
}));
jest.mock("../lib/hooks/useApiVineBlocks", () => ({
  useApiVineBlocks: () => ({ blocks: [], loading: false }),
}));
jest.mock("../lib/hooks/useFarmIdentifiers", () => ({
  useFarmIdentifiers: jest.fn(),
}));
jest.mock("../lib/hooks/useIdentifierBannerDismiss", () => ({
  useIdentifierBannerDismiss: () => ({
    dismissed: false,
    dismiss: jest.fn(),
  }),
}));
jest.mock("../lib/storage", () => ({
  appendToList: jest.fn(),
  generateId: () => "test-entry",
}));

const { useFarm } = require("../lib/context/FarmContext") as {
  useFarm: jest.Mock;
};
const { useFarmIdentifiers } = require("../lib/hooks/useFarmIdentifiers") as {
  useFarmIdentifiers: jest.Mock;
};

import React from "react";
import { render } from "@testing-library/react-native";
import VineHarvestScreen from "../app/vine-harvest";
import VineOperationScreen from "../app/vine-operation";

const screens = [
  ["vine-operation.tsx", VineOperationScreen],
  ["vine-harvest.tsx", VineHarvestScreen],
] as const;

function configureProfile(name: string | null, address: string | null) {
  useFarm.mockReturnValue({
    currentFarm: { id: "farm-1", name },
    user: { id: "user-1", name: "Test Grower" },
  });
  useFarmIdentifiers.mockReturnValue({
    address,
    loading: false,
    justSaved: false,
    clearJustSaved: jest.fn(),
    refetch: jest.fn(),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe.each(screens)("%s farm profile warning", (_screenName, Screen) => {
  it.each([
    {
      label: "farm name",
      name: " ",
      address: "Vineyard Lane",
      warning: "Farm name is missing from your farm profile. Tap to go to Settings.",
    },
    {
      label: "farm address",
      name: "Test Vineyard",
      address: " ",
      warning: "Farm address is missing from your farm profile. Tap to go to Settings.",
    },
    {
      label: "both fields",
      name: null,
      address: null,
      warning: "Farm name and Farm address are missing from your farm profile. Tap to go to Settings.",
    },
  ])("names the missing $label exactly", ({ name, address, warning }) => {
    configureProfile(name, address);

    const screen = render(<Screen />);

    expect(screen.getByText(warning)).toBeTruthy();
  });

  it("does not show a warning when the farm name and address are present", () => {
    configureProfile("Test Vineyard", "Vineyard Lane");

    const screen = render(<Screen />);

    expect(screen.queryByText(/missing from your farm profile/)).toBeNull();
  });
});