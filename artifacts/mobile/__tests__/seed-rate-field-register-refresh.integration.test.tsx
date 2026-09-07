/**
 * Controlled regression fixture for the Seed Rate Calculator -> Field Register
 * shortcut. The calculator stays mounted while the register edits the same
 * in-memory field returned by the mocked API, matching Expo stack navigation.
 */

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
    FlatList: ({ data, renderItem, ...props }: any) =>
      React.createElement(
        "FlatList",
        props,
        data.map((item: unknown, index: number) => renderItem({ item, index })),
      ),
    KeyboardAvoidingView: host("KeyboardAvoidingView"),
    Platform: { OS: "web" },
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

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const ReactNative = require("react-native");
  return {
    Feather: ({ name }: { name: string }) =>
      React.createElement(ReactNative.Text, null, name),
  };
});

const focusCallbacks: Array<() => void> = [];
jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useFocusEffect: (callback: () => void) => {
    focusCallbacks.push(callback);
  },
  useLocalSearchParams: () => ({ fieldId: "41" }),
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light" },
  NotificationFeedbackType: { Success: "success" },
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    removeItem: jest.fn(async () => undefined),
    setItem: jest.fn(async () => undefined),
  },
}));

jest.mock("../lib/context/FarmContext", () => ({
  useFarm: () => ({ currentFarm: { id: 7, name: "Fixture Farm" } }),
}));

jest.mock("../components/ui/Input", () => {
  const React = require("react");
  const ReactNative = require("react-native");
  return {
    Input: (props: Record<string, unknown>) =>
      React.createElement(ReactNative.TextInput, props),
  };
});

jest.mock("../components/ui/Button", () => {
  const React = require("react");
  const ReactNative = require("react-native");
  return {
    Button: ({ title, onPress, ...props }: any) =>
      React.createElement(
        ReactNative.Pressable,
        { ...props, onPress },
        React.createElement(ReactNative.Text, null, title),
      ),
  };
});

jest.mock("../components/ui/FieldPicker", () => {
  const React = require("react");
  const ReactNative = require("react-native");
  return {
    FieldPicker: ({ fields, onChange, onChangeField }: any) =>
      React.createElement(
        ReactNative.Pressable,
        {
          testID: "fixture-field-picker",
          onPress: () => {
            onChange(fields[0].name);
            onChangeField(fields[0]);
          },
        },
        React.createElement(ReactNative.Text, null, fields[0]?.name),
      ),
  };
});

jest.mock("../lib/hooks/useApiFields", () => ({
  useApiFields: jest.fn(),
}));

jest.mock("../lib/apiFetch", () => ({
  apiFetch: jest.fn(),
  isAbortError: () => false,
}));

import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import SeedRateCalculatorScreen from "../app/seed-rate-calculator";
import FieldEditScreen from "../app/field-edit";

const { useApiFields } = require("../lib/hooks/useApiFields") as {
  useApiFields: jest.Mock;
};
const { apiFetch } = require("../lib/apiFetch") as { apiFetch: jest.Mock };

const fixtureField = {
  id: 41,
  name: "No Soil Fixture",
  soilType: undefined as string | undefined,
  isActive: true,
};
let cachedFields = [{ ...fixtureField }];
const refreshFields = jest.fn(async () => {
  cachedFields = [{ ...fixtureField }];
});

const response = (payload: unknown) =>
  ({ ok: true, status: 200, json: async () => payload, text: async () => "" }) as Response;

describe("Seed Rate Calculator Field Register return flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    focusCallbacks.length = 0;
    fixtureField.soilType = undefined;
    cachedFields = [{ ...fixtureField }];

    useApiFields.mockImplementation(() => ({
      fields: cachedFields,
      loading: false,
      fromCache: false,
      error: null,
      loadedForFarmId: "7",
      refresh: refreshFields,
    }));

    apiFetch.mockImplementation(async (_url: string, options?: RequestInit) => {
      if (options?.method === "PUT") {
        fixtureField.soilType = JSON.parse(String(options.body)).soilType;
        return response({ field: { ...fixtureField } });
      }
      return response({ records: [{ ...fixtureField }] });
    });
  });

  it("opens the selected field, saves soil type, and auto-fills on return", async () => {
    const calculator = render(<SeedRateCalculatorScreen />);

    await waitFor(() => {
      expect(calculator.getByTestId("fixture-field-picker")).toBeTruthy();
    });
    fireEvent.press(calculator.getByTestId("fixture-field-picker"));
    expect(calculator.getByText(/No soil type on record/)).toBeTruthy();

    fireEvent.press(calculator.getByTestId("seed-rate-field-register-link"));
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/field-edit",
      params: { fieldId: "41" },
    });

    const register = render(<FieldEditScreen />);
    await waitFor(() => {
      expect(
        register.getByTestId("field-register-card-41").props.accessibilityState,
      ).toEqual({ expanded: true });
    });

    fireEvent.press(register.getByTestId("field-register-soil-chip-heavy_clay"));
    fireEvent.press(register.getByText("Save"));

    await waitFor(() => expect(fixtureField.soilType).toBe("heavy_clay"));
    register.unmount();

    calculator.rerender(<SeedRateCalculatorScreen />);
    expect(calculator.getByText(/No soil type on record/)).toBeTruthy();
    expect(refreshFields).not.toHaveBeenCalled();

    await act(async () => {
      focusCallbacks[focusCallbacks.length - 1]?.();
    });
    expect(refreshFields).toHaveBeenCalledTimes(1);
    calculator.rerender(<SeedRateCalculatorScreen />);

    await waitFor(() => {
      expect(
        calculator.getByTestId("seed-rate-soil-chip-clay").props.accessibilityState,
      ).toEqual({ selected: true });
      expect(calculator.queryByText(/No soil type on record/)).toBeNull();
    });
  });
});