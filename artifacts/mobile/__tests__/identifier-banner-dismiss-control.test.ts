import fs from "node:fs";
import path from "node:path";

jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));
jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("react-native", () => ({
  Pressable: () => null,
  Text: () => null,
  StyleSheet: { create: (styles: unknown) => styles },
}));

import { dismissIdentifierWarning } from "../components/ui/IdentifierBanner";

describe("IdentifierBanner dismiss control", () => {
  it("announces the warning dismiss control as a button with isolated-action guidance", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../components/ui/IdentifierBanner.tsx"),
      "utf8",
    );

    expect(source).toContain('accessibilityRole="button"');
    expect(source).toContain('accessibilityLabel="Dismiss warning"');
    expect(source).toContain(
      'accessibilityHint="Dismisses this warning without opening Settings"',
    );
  });

  it("stops the warning-body navigation and dismisses only the warning", () => {
    const stopPropagation = jest.fn();
    const onDismiss = jest.fn();

    dismissIdentifierWarning({ stopPropagation }, onDismiss);

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});