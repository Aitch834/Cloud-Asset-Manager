jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}));

jest.mock("react-native", () => {
  const React = require("react");
  const host = (name: string) =>
    React.forwardRef(
      (props: Record<string, unknown>, ref: React.Ref<unknown>) =>
        React.createElement(name, { ...props, ref }, props.children),
    );

  return {
    Pressable: host("Pressable"),
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

import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { router } from "expo-router";

import {
  WINEGB_CHECKLIST_ROUTE,
  WinegbSurveyNudge,
} from "../components/home/WinegbSurveyNudge";

describe("WineGB home-screen shortcut", () => {
  it("shows the checklist subtitle and opens phenology history without writing data", () => {
    const screen = render(<WinegbSurveyNudge pendingCount={2} />);

    expect(screen.getByText("2 WineGB surveys to submit")).toBeTruthy();
    expect(
      screen.getByText("Open the checklist to mark surveys as submitted"),
    ).toBeTruthy();

    fireEvent.press(screen.getByTestId("winegb-home-checklist-shortcut"));

    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledWith(WINEGB_CHECKLIST_ROUTE);
    expect(WINEGB_CHECKLIST_ROUTE).toBe("/vine-phenology-history");
  });
});