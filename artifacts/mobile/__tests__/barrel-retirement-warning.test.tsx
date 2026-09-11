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
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten,
    },
    Text: host("Text"),
    TouchableOpacity: host("TouchableOpacity"),
    View: host("View"),
  };
});

jest.mock("@expo/vector-icons", () => ({
  Feather: "Feather",
}));

import { fireEvent, render } from "@testing-library/react-native";

import { BarrelRetirementWarning } from "../components/BarrelRetirementWarning";
import {
  BARREL_RETIREMENT_THRESHOLD_PENCE,
  resolveBarrelRetirementThresholdPence,
} from "../lib/utils/vesselAlerts";

const maintenance = [
  { id: "repair", costPence: 41000 },
  { id: "hoop", costPence: 24000 },
];

const totalMaintenanceSpendPence = maintenance.reduce(
  (total, record) => total + record.costPence,
  0,
);

function renderWarning(
  overrides: Partial<React.ComponentProps<typeof BarrelRetirementWarning>> = {},
) {
  return render(
    <BarrelRetirementWarning
      loading={false}
      hasError={false}
      thresholdLoaded
      vesselType="Oak barrel"
      totalMaintenanceSpendPence={totalMaintenanceSpendPence}
      thresholdPence={60000}
      {...overrides}
    />,
  );
}

describe("mobile barrel retirement warning", () => {
  it("shows the amber warning above a configured farm threshold", () => {
    const thresholdPence = resolveBarrelRetirementThresholdPence("625", 90000);
    const screen = renderWarning({ thresholdPence });

    expect(
      screen.getByText(
        "Total maintenance spend (£650.00) exceeds the retirement threshold (£625). Consider retiring this barrel.",
      ),
    ).toBeTruthy();
    expect(screen.getByLabelText("Dismiss retirement warning")).toBeTruthy();
  });

  it("uses the £600 fallback when farm and platform settings are unavailable", () => {
    const thresholdPence = resolveBarrelRetirementThresholdPence(undefined, undefined);

    expect(thresholdPence).toBe(BARREL_RETIREMENT_THRESHOLD_PENCE);
    expect(
      renderWarning({ thresholdPence }).getByText(
        "Total maintenance spend (£650.00) exceeds the retirement threshold (£600). Consider retiring this barrel.",
      ),
    ).toBeTruthy();
  });

  it("does not show the warning while vessel data is loading", () => {
    const screen = renderWarning({ loading: true });

    expect(screen.queryByLabelText("Dismiss retirement warning")).toBeNull();
  });

  it("dismisses the warning without changing maintenance data", () => {
    const unchangedMaintenance = maintenance.map(record => ({ ...record }));
    const screen = renderWarning();

    fireEvent.press(screen.getByLabelText("Dismiss retirement warning"));

    expect(screen.queryByLabelText("Dismiss retirement warning")).toBeNull();
    expect(maintenance).toEqual(unchangedMaintenance);
    expect(
      maintenance.reduce((total, record) => total + record.costPence, 0),
    ).toBe(totalMaintenanceSpendPence);
  });
});