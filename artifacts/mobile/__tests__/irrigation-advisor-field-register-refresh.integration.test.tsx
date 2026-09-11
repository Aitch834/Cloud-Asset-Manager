/**
 * Controlled Irrigation Advisor -> Field Register return-flow regression.
 */

jest.mock("react-native", () => {
  const React = require("react");
  const host = (name: string) =>
    React.forwardRef(
      (props: Record<string, unknown>, ref: React.Ref<unknown>) =>
        React.createElement(name, { ...props, ref }, props.children),
    );
  const Modal = ({ visible, children, ...props }: any) =>
    visible ? React.createElement("Modal", props, children) : null;

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
    Modal,
    Platform: { OS: "android" },
    Pressable: host("Pressable"),
    RefreshControl: host("RefreshControl"),
    ScrollView: host("ScrollView"),
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten: (style: unknown) => style,
    },
    Text: host("Text"),
    TextInput: host("TextInput"),
    View: host("View"),
  };
});

jest.mock("@expo/vector-icons", () => ({ Feather: "Feather" }));
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light" },
  NotificationFeedbackType: { Success: "success" },
}));

const focusCallbacks: Array<() => void> = [];
jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useFocusEffect: (callback: () => void) => focusCallbacks.push(callback),
  useLocalSearchParams: () => ({ fieldId: "41" }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock("react-native-svg", () => {
  const React = require("react");
  const host = (name: string) => (props: Record<string, unknown>) =>
    React.createElement(name, props, props.children);
  return {
    __esModule: true,
    default: host("Svg"),
    Circle: host("Circle"),
    G: host("G"),
    Line: host("Line"),
    Polyline: host("Polyline"),
    Text: host("SvgText"),
  };
});
jest.mock("../lib/context/FarmContext", () => ({
  useFarm: () => ({ currentFarm: { id: 7, name: "Fixture Farm" } }),
}));
jest.mock("../lib/apiFetch", () => ({
  apiFetch: jest.fn(),
  isAbortError: () => false,
}));
jest.mock("../lib/storage", () => ({
  appendToList: jest.fn(),
  generateId: jest.fn(() => "test-id"),
  STORAGE_KEYS: { IRRIGATION_APPLICATIONS: "irrigation-applications" },
}));
jest.mock("../lib/sync-engine", () => ({ scheduleSync: jest.fn() }));
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

import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import IrrigationAdvisorScreen from "../app/irrigation-advisor";
import FieldEditScreen from "../app/field-edit";
import { apiFetch } from "../lib/apiFetch";

const apiFetchMock = apiFetch as jest.MockedFunction<typeof apiFetch>;
const fixtureField = {
  id: 41,
  name: "No Soil Fixture",
  areaHectares: 4,
  soilType: undefined as string | undefined,
  isActive: true,
};

const response = (payload: unknown) =>
  ({ ok: true, status: 200, json: async () => payload, text: async () => "" }) as Response;

function advisorPayload() {
  return {
    fields: [{ ...fixtureField }],
    assignment: null,
    dailyWeather: [],
    hasWeatherStation: false,
    forecastRainfall7dMm: 3,
    forecastDailyMm: [],
    year: 2026,
  };
}

describe("Irrigation Advisor Field Register return flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    focusCallbacks.length = 0;
    fixtureField.soilType = undefined;
    apiFetchMock.mockImplementation(async (_url, options) => {
      if (options?.method === "PUT") {
        fixtureField.soilType = JSON.parse(String(options.body)).soilType;
        return response({ field: { ...fixtureField } });
      }
      if (String(_url).includes("/irrigation-advisor")) {
        return response(advisorPayload());
      }
      return response({ records: [{ ...fixtureField }] });
    });
  });

  it("opens the selected field and uses its saved soil type after returning", async () => {
    const advisor = render(<IrrigationAdvisorScreen />);
    await waitFor(() => {
      expect(advisor.getByText(/Soil type not set/)).toBeTruthy();
      expect(advisor.getByText("Max Deficit (150 mm)")).toBeTruthy();
    });

    fireEvent.press(advisor.getByTestId("irrigation-advisor-field-register-link"));
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/field-edit",
      params: { fieldId: "41" },
    });

    const register = render(<FieldEditScreen />);
    await waitFor(() => {
      expect(register.getByTestId("field-register-card-41").props.accessibilityState)
        .toEqual({ expanded: true });
    });
    fireEvent.press(register.getByTestId("field-register-soil-chip-heavy_clay"));
    fireEvent.press(register.getByText("Save"));
    await waitFor(() => expect(fixtureField.soilType).toBe("heavy_clay"));
    register.unmount();

    await act(async () => {
      focusCallbacks[focusCallbacks.length - 1]?.();
    });

    await waitFor(() => {
      expect(advisor.queryByText(/Soil type not set/)).toBeNull();
      expect(advisor.getByText("Max Deficit (175 mm)")).toBeTruthy();
    });
  });
});