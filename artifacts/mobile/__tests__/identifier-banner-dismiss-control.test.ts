jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));
jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("react-native", () => ({
  Pressable: () => null,
  Text: () => null,
  StyleSheet: { create: (styles: unknown) => styles },
}));

import { dismissIdentifierWarning } from "../components/ui/IdentifierBanner";

describe("IdentifierBanner dismiss control", () => {
  it("stops the warning-body navigation and dismisses only the warning", () => {
    const stopPropagation = jest.fn();
    const onDismiss = jest.fn();

    dismissIdentifierWarning({ stopPropagation }, onDismiss);

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});