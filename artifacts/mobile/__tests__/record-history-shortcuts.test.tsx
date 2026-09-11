import fs from "node:fs";
import path from "node:path";

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
    View: host("View"),
  };
});

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}));
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: "medium" },
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const ReactNative = require("react-native");
  const Feather = ({ name }: { name: string }) =>
    React.createElement(ReactNative.Text, null, name);
  Feather.glyphMap = {};
  return { Feather };
});
jest.mock("../components/ui/CombineIcon", () => ({
  CombineIcon: () => null,
}));
jest.mock("../lib/context/FarmContext", () => ({
  useFarm: () => ({
    currentFarm: {
      id: "route-check-farm",
      sectorArable: true,
      sectorBeef: true,
      sectorDairy: true,
      sectorPigs: true,
      sectorPoultry: true,
    },
  }),
}));
jest.mock("../lib/hooks/useApiModules", () => ({
  useApiModules: () => ({
    activeModuleKeys: ["viticulture"],
    loading: false,
    attemptedFarmId: "route-check-farm",
    resolvedFarmId: "route-check-farm",
  }),
}));
jest.mock("../lib/hooks/useApiFetch", () => ({
  useApiFetch: () => ({ records: [] }),
}));
jest.mock("../lib/hooks/useBarrelAlertThresholds", () => ({
  useBarrelAlertThresholds: () => ({
    idleBarrelDays: 90,
    approachingNeutralFills: 5,
  }),
}));

import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { router } from "expo-router";
import RecordScreen, { recordOptions } from "../app/(tabs)/record";
import {
  getDairyHomeShortcut,
  MASTITIS_HISTORY_SHORTCUT,
} from "../lib/homeModuleChecks";

const mockPush = router.push as jest.Mock;

describe("Record menu history shortcuts", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("keeps every configured history shortcut linked to an Expo screen", () => {
    const historyShortcuts = recordOptions.filter((option) =>
      option.title.endsWith("History"),
    );

    expect(historyShortcuts.length).toBeGreaterThan(0);
    for (const shortcut of historyShortcuts) {
      const routeFile = path.join(
        __dirname,
        "..",
        "app",
        `${shortcut.route.replace(/^\//, "")}.tsx`,
      );
      expect({
        title: shortcut.title,
        route: shortcut.route,
        exists: fs.existsSync(routeFile),
      }).toEqual({
        title: shortcut.title,
        route: shortcut.route,
        exists: true,
      });
    }
  });

  it("keeps Home and Record aligned to the shared Mastitis History shortcut", () => {
    const recordShortcut = recordOptions.find(
      (option) => option.id === "mastitis-history",
    );

    expect(
      getDairyHomeShortcut([MASTITIS_HISTORY_SHORTCUT.moduleKey]),
    ).toBe(MASTITIS_HISTORY_SHORTCUT);
    expect(recordShortcut).toMatchObject({
      title: MASTITIS_HISTORY_SHORTCUT.title,
      route: MASTITIS_HISTORY_SHORTCUT.route,
      moduleKeys: [MASTITIS_HISTORY_SHORTCUT.moduleKey],
      requiresSectors: ["dairy"],
    });
  });

  it("shows Operations History for a viticulture farm and opens its route", () => {
    const screen = render(<RecordScreen />);
    const shortcut = screen.getByTestId("record-option-vine-operation-history");

    expect(screen.getByText("Operations History")).toBeTruthy();
    fireEvent.press(shortcut);

    expect(mockPush).toHaveBeenCalledWith("/vine-operations-history");
  });
});