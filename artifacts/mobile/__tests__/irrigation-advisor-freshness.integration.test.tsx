/**
 * Regression coverage for the Irrigation Advisor freshness label.
 *
 * Exercises the real screen through initial loading and pull-to-refresh while
 * controlling the clock, so relative wording never depends on a real delay.
 */

jest.mock("react-native", () => {
  const React = require("react");
  const host = (name: string) =>
    React.forwardRef(
      (props: Record<string, unknown>, ref: React.Ref<unknown>) =>
        React.createElement(name, { ...props, ref }, props.children),
    );
  const Modal = ({
    visible,
    children,
    ...props
  }: {
    visible?: boolean;
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => (visible ? React.createElement("Modal", props, children) : null);

  return {
    ActivityIndicator: host("ActivityIndicator"),
    Alert: { alert: jest.fn() },
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
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: "success" },
}));
jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useFocusEffect: jest.fn(),
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
  useFarm: () => ({ currentFarm: { id: 7, name: "Test Farm" } }),
}));
jest.mock("../lib/apiFetch", () => ({ apiFetch: jest.fn() }));
jest.mock("../lib/storage", () => ({
  appendToList: jest.fn(),
  generateId: jest.fn(() => "test-id"),
  STORAGE_KEYS: { IRRIGATION_APPLICATIONS: "irrigation-applications" },
}));
jest.mock("../lib/sync-engine", () => ({ scheduleSync: jest.fn() }));

import React from "react";
import { act, render, waitFor } from "@testing-library/react-native";
import IrrigationAdvisorScreen from "../app/irrigation-advisor";
import { apiFetch } from "../lib/apiFetch";

const apiFetchMock = apiFetch as jest.MockedFunction<typeof apiFetch>;

function response(data: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => data,
  } as Response;
}

const advisorPayload = {
  fields: [{ id: 14, name: "North Field", areaHectares: 4, soilType: "loam" }],
  assignment: null,
  dailyWeather: [],
  hasWeatherStation: false,
  forecastRainfall7dMm: 3,
  forecastDailyMm: [],
  year: 2026,
};

describe("Irrigation Advisor freshness label", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-07T10:00:00.000Z"));
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("hides stale freshness during refresh and restores it after the response", async () => {
    let resolveRefresh!: (value: Response) => void;
    const refreshResponse = new Promise<Response>((resolve) => {
      resolveRefresh = resolve;
    });

    apiFetchMock
      .mockResolvedValueOnce(response(advisorPayload))
      .mockResolvedValueOnce(response(advisorPayload))
      .mockImplementationOnce(() => refreshResponse);

    const screen = render(<IrrigationAdvisorScreen />);

    await waitFor(() => {
      expect(screen.getByText("Updated just now")).toBeTruthy();
    });

    act(() => {
      jest.setSystemTime(new Date("2026-09-07T10:02:00.000Z"));
      jest.advanceTimersByTime(60_000);
    });
    expect(screen.getByText("Updated 2 min ago")).toBeTruthy();

    const advisorScroll = () =>
      screen
        .UNSAFE_getAllByType("ScrollView")
        .find((node) => node.props.refreshControl);
    const refreshControl = advisorScroll()?.props.refreshControl;
    expect(refreshControl).toBeTruthy();
    act(() => {
      refreshControl.props.onRefresh();
    });

    expect(screen.queryByText(/^Updated /)).toBeNull();
    expect(advisorScroll()?.props.refreshControl.props.refreshing).toBe(true);

    await act(async () => {
      resolveRefresh(response(advisorPayload));
      await refreshResponse;
    });

    await waitFor(() => {
      expect(screen.getByText("Updated just now")).toBeTruthy();
      expect(advisorScroll()?.props.refreshControl.props.refreshing).toBe(false);
    });
  });

  it("keeps the last successful update honest when a later refresh fails", async () => {
    apiFetchMock
      .mockResolvedValueOnce(response(advisorPayload))
      .mockResolvedValueOnce(response(advisorPayload))
      .mockRejectedValueOnce(new Error("Weather service unavailable"));

    const screen = render(<IrrigationAdvisorScreen />);

    await waitFor(() => {
      expect(screen.getByText("Updated just now")).toBeTruthy();
    });

    act(() => {
      jest.setSystemTime(new Date("2026-09-07T10:04:00.000Z"));
      jest.advanceTimersByTime(60_000);
    });
    expect(screen.getByText("Updated 4 min ago")).toBeTruthy();

    const advisorScroll = () =>
      screen
        .UNSAFE_getAllByType("ScrollView")
        .find((node) => node.props.refreshControl);
    const refreshControl = advisorScroll()?.props.refreshControl;
    expect(refreshControl).toBeTruthy();

    await act(async () => {
      refreshControl.props.onRefresh();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText("Refresh failed · Last updated 4 min ago")).toBeTruthy();
    expect(screen.getByText("North Field")).toBeTruthy();
    expect(advisorScroll()?.props.refreshControl.props.refreshing).toBe(false);
    expect(screen.queryByText("Updated just now")).toBeNull();
  });
});