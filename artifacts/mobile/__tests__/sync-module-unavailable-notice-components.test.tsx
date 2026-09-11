jest.mock("react-native", () => {
  const React = require("react");
  const host = (name: string) =>
    React.forwardRef(
      (props: Record<string, unknown>, ref: React.Ref<unknown>) =>
        React.createElement(name, { ...props, ref }, props.children),
    );

  return {
    ActivityIndicator: host("ActivityIndicator"),
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
    TouchableOpacity: host("TouchableOpacity"),
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

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: (...args: unknown[]) => mockPush(...args) },
  useFocusEffect: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const mockNotice =
  "An offline record was not added because the relevant module is unavailable for the selected farm. The record was removed from the sync queue; after the module is enabled, it must be entered again.";
let mockCurrentNotice: string | null = mockNotice;
const mockListeners = new Set<() => void>();
const mockDismissNotice = jest.fn(() => {
  mockCurrentNotice = null;
  mockListeners.forEach((listener) => listener());
});

jest.mock("../lib/context/SyncContext", () => {
  const React = require("react");
  return {
    useSync: () => {
      const moduleUnavailableNotice = React.useSyncExternalStore(
        (listener: () => void) => {
          mockListeners.add(listener);
          return () => mockListeners.delete(listener);
        },
        () => mockCurrentNotice,
        () => mockCurrentNotice,
      );
      return {
        pendingCount: 0,
        failedCount: 0,
        isSyncing: false,
        isConnected: true,
        lastSyncTime: null,
        lastError: null,
        moduleUnavailableNotice,
        dismissModuleUnavailableNotice: mockDismissNotice,
        triggerSync: jest.fn(async () => undefined),
      };
    },
  };
});

jest.mock("../lib/database", () => ({
  getFailedSyncItems: jest.fn(async () => []),
}));

jest.mock("../lib/sync-engine", () => ({
  refreshPendingCount: jest.fn(async () => undefined),
}));

import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import SyncStatusScreen from "../app/sync-status";
import { SyncStatusBar } from "../components/SyncStatusBar";

describe("module-unavailable notice components", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentNotice = mockNotice;
  });

  it("keeps the status bar visible and opens Sync Status for the notice", () => {
    const screen = render(<SyncStatusBar />);

    expect(screen.getByText("Offline record not added")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("View offline record notice"));

    expect(mockPush).toHaveBeenCalledWith("/sync-status");
  });

  it("explains the discarded record without a retry action and dismisses it everywhere", () => {
    const screen = render(
      <>
        <SyncStatusBar />
        <SyncStatusScreen />
      </>,
    );

    expect(screen.getByText(mockNotice)).toBeTruthy();
    expect(screen.getByText("The discarded record is no longer waiting to sync.")).toBeTruthy();
    expect(screen.queryByText("Sync Now")).toBeNull();
    expect(screen.queryByText("Retry")).toBeNull();
    expect(screen.getByText("Offline record not added")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Dismiss module unavailable notice"));

    expect(mockDismissNotice).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(mockNotice)).toBeNull();
    expect(screen.queryByText("Offline record not added")).toBeNull();
    expect(screen.queryByLabelText("Dismiss module unavailable notice")).toBeNull();
  });
});