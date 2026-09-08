/**
 * Regression coverage for the Farm Profile → SMS phone sync nudge.
 *
 * This intentionally mounts MoreScreen with lightweight native/context mocks
 * so the test exercises saveProfile's real success branch, including the
 * Alert.alert call, rather than testing phone normalisation in isolation.
 */

jest.mock("react-native", () => {
  const React = require("react");

  const host = (name: string) =>
    React.forwardRef(
      (props: Record<string, unknown>, ref: React.Ref<unknown>) =>
        React.createElement(name, { ...props, ref }, props.children),
    );

  const Text = host("Text");

  return {
    ActivityIndicator: host("ActivityIndicator"),
    Alert: { alert: jest.fn() },
    Pressable: host("Pressable"),
    ScrollView: host("ScrollView"),
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten: (style: unknown) => style,
    },
    Switch: host("Switch"),
    Text,
    TextInput: host("TextInput"),
    TouchableOpacity: host("TouchableOpacity"),
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
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("expo-location", () => ({
  Accuracy: { Balanced: "balanced" },
  getCurrentPositionAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(),
  },
}));

jest.mock("@clerk/expo", () => ({
  useAuth: jest.fn(),
}), { virtual: true });

jest.mock("../lib/context/FarmContext", () => ({
  useFarm: jest.fn(),
}));

jest.mock("../lib/context/SyncContext", () => ({
  useSync: jest.fn(),
}));

jest.mock("../lib/context/SmsPrefsContext", () => ({
  useSmsPrefsContext: jest.fn(),
}));

jest.mock("../lib/hooks/useApiModules", () => ({
  useApiModules: jest.fn(),
}));

jest.mock("../lib/hooks/useFarmIdentifiers", () => ({
  identifierJustSavedKey: jest.fn((farmId: string | number) => `identifier:${farmId}`),
  useFarmIdentifiers: jest.fn(),
}));

jest.mock("../lib/apiFetch", () => ({
  apiFetch: jest.fn(),
}));

jest.mock("../lib/storage", () => ({
  STORAGE_KEYS: {
    AUTH_STATE: "auth-state",
    AUTH_TOKEN: "auth-token",
  },
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("../lib/uploadPhoto", () => ({
  getApiBase: jest.fn(() => "https://api.example.test"),
}));

jest.mock("../components/ui/Input", () => {
  const React = require("react");
  const ReactNative = require("react-native");

  return {
    Input: ({
      label,
      ...props
    }: {
      label?: string;
      [key: string]: unknown;
    }) =>
      React.createElement(ReactNative.TextInput, {
        ...props,
        testID: label ? `input-${label}` : undefined,
      }),
  };
});

jest.mock("../components/ui/ListItem", () => ({
  ListItem: () => null,
}));

jest.mock("../components/ui/SectionHeader", () => ({
  SectionHeader: () => null,
}));

import React from "react";
import { Alert } from "react-native";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";

import MoreScreen from "../app/(tabs)/more";
import { useAuth } from "@clerk/expo";
import { apiFetch } from "../lib/apiFetch";
import { useFarm } from "../lib/context/FarmContext";
import { useSmsPrefsContext } from "../lib/context/SmsPrefsContext";
import { useSync } from "../lib/context/SyncContext";
import { useApiModules } from "../lib/hooks/useApiModules";
import { useFarmIdentifiers } from "../lib/hooks/useFarmIdentifiers";
import { getItem } from "../lib/storage";

const FARM_ID = 42;
const EXISTING_CONTACT = "07911 123456";
const CURRENT_SMS = "+447911123456";
const NEW_CONTACT = "07800 987654";

const apiFetchMock = apiFetch as jest.MockedFunction<typeof apiFetch>;
const useAuthMock = useAuth as jest.MockedFunction<typeof useAuth>;
const useFarmMock = useFarm as jest.MockedFunction<typeof useFarm>;
const useSmsPrefsContextMock = useSmsPrefsContext as jest.MockedFunction<
  typeof useSmsPrefsContext
>;
const useSyncMock = useSync as jest.MockedFunction<typeof useSync>;
const useApiModulesMock = useApiModules as jest.MockedFunction<typeof useApiModules>;
const useFarmIdentifiersMock = useFarmIdentifiers as jest.MockedFunction<
  typeof useFarmIdentifiers
>;
const getItemMock = getItem as jest.MockedFunction<typeof getItem>;

function jsonResponse(data: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => data,
  } as Response;
}

function configureScreen(contactPhone = EXISTING_CONTACT): void {
  useAuthMock.mockReturnValue({
    logout: jest.fn(),
  } as unknown as ReturnType<typeof useAuth>);

  useFarmMock.mockReturnValue({
    currentFarm: { id: FARM_ID, name: "Test Farm", tenantSlug: "test-farm" },
    farms: [{ id: FARM_ID, name: "Test Farm" }],
    setCurrentFarm: jest.fn(),
    updateFarm: jest.fn().mockResolvedValue(undefined),
    user: { name: "Test Grower", email: "grower@example.test" },
  } as unknown as ReturnType<typeof useFarm>);

  useSyncMock.mockReturnValue({
    pendingCount: 0,
    isSyncing: false,
    isConnected: true,
    lastSyncTime: null,
    triggerSync: jest.fn(),
  } as unknown as ReturnType<typeof useSync>);

  useSmsPrefsContextMock.mockReturnValue({
    triggerSmsRefresh: jest.fn(),
  } as unknown as ReturnType<typeof useSmsPrefsContext>);

  useApiModulesMock.mockReturnValue({
    activeModuleKeys: ["sms-alerts"],
  } as ReturnType<typeof useApiModules>);

  useFarmIdentifiersMock.mockReturnValue({
    farmName: "Test Farm",
    contactPhone,
    cphNumber: "12/345/0001",
    sbiNumber: "123456789",
    address: "Farm Lane",
    postcode: "DT1 1AA",
    refetch: jest.fn(),
  } as unknown as ReturnType<typeof useFarmIdentifiers>);

  getItemMock.mockResolvedValue(null);

  apiFetchMock.mockImplementation(async (path, options) => {
    if (options?.method === "PATCH") return jsonResponse({});
    return jsonResponse({
      phoneNumber: CURRENT_SMS,
      smsOptIn: "critical",
      smsCategories: { livestock: true },
      smsConsentAt: "2026-09-01T10:00:00.000Z",
    });
  });

  globalThis.fetch = jest.fn(async () => jsonResponse({ full: "1.0.0" })) as unknown as typeof fetch;
}

async function saveContactPhone(phone: string): Promise<ReturnType<typeof render>> {
  const screen = render(<MoreScreen />);

  await waitFor(() => {
    expect(screen.getByTestId("input-Contact Phone").props.value).toBe(
      EXISTING_CONTACT,
    );
  });

  fireEvent.changeText(screen.getByTestId("input-Contact Phone"), phone);
  fireEvent.press(screen.getByText("Save Farm Profile"));

  await waitFor(() => {
    expect(apiFetchMock).toHaveBeenCalledWith(
      `/api/farms/${FARM_ID}`,
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  return screen;
}

async function acceptSmsPhoneUpdate(): Promise<void> {
  await waitFor(() => {
    expect(Alert.alert).toHaveBeenCalledWith(
      "Update SMS number?",
      expect.any(String),
      expect.any(Array),
    );
  });

  const nudgeCall = (Alert.alert as jest.Mock).mock.calls.find(
    ([title]) => title === "Update SMS number?",
  );
  const updateAction = nudgeCall?.[2]?.find(
    (button: { text?: string }) => button.text === "Update to +447800987654",
  );

  expect(updateAction?.onPress).toEqual(expect.any(Function));
  await act(async () => {
    await updateAction.onPress();
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  configureScreen();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

describe("MoreScreen SMS phone sync nudge", () => {
  it("shows an Alert when the saved contact phone is a different UK mobile", async () => {
    await saveContactPhone(NEW_CONTACT);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Update SMS number?",
        `Your new contact number (+447800987654) differs from your saved SMS alerts number. Update it now so alerts reach this number?`,
        expect.arrayContaining([
          expect.objectContaining({ text: "Keep existing", style: "cancel" }),
          expect.objectContaining({ text: "Update to +447800987654" }),
        ]),
      );
    });
  });

  it("updates the SMS phone while preserving the loaded opt-in tier and categories", async () => {
    const screen = await saveContactPhone(NEW_CONTACT);

    await acceptSmsPhoneUpdate();

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/api/account/profile",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          phoneNumber: "+447800987654",
          smsOptIn: "critical",
          smsCategories: { livestock: true },
          consentGiven: true,
        }),
      }),
    );
    await waitFor(() => {
      expect(screen.getByTestId("input-Mobile Number (for SMS)").props.value).toBe(
        "+447800987654",
      );
    });
  });

  it("shows the existing error Alert and keeps the previous SMS phone when the update fails", async () => {
    apiFetchMock.mockImplementation(async (path, options) => {
      if (options?.method === "PATCH") return jsonResponse({});
      if (path === "/api/account/profile" && options?.method === "PUT") {
        return { ok: false, status: 500, json: async () => ({}) } as Response;
      }
      return jsonResponse({
        phoneNumber: CURRENT_SMS,
        smsOptIn: "critical",
        smsCategories: { livestock: true },
        smsConsentAt: "2026-09-01T10:00:00.000Z",
      });
    });
    const screen = await saveContactPhone(NEW_CONTACT);

    await acceptSmsPhoneUpdate();

    expect(Alert.alert).toHaveBeenCalledWith(
      "Couldn't save SMS number",
      "The SMS number could not be saved automatically. Please update it manually in the SMS section below.",
    );
    expect(screen.getByTestId("input-Mobile Number (for SMS)").props.value).toBe(
      CURRENT_SMS,
    );
  });

  it("does not show an Alert when contact and SMS numbers normalise to the same value", async () => {
    await saveContactPhone("+44 7911 123456");

    await Promise.resolve();
    await Promise.resolve();
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it("does not show an Alert when the saved contact phone is not a UK mobile", async () => {
    await saveContactPhone("01234 567890");

    await Promise.resolve();
    await Promise.resolve();
    expect(Alert.alert).not.toHaveBeenCalled();
  });
});