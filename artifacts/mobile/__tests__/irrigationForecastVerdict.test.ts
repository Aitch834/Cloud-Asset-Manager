import fixtures from "../../../test-fixtures/irrigation-forecast-verdicts.json";
import {
  computeForecastVerdict,
  type ForecastVerdict,
} from "../lib/irrigationForecastVerdict";

type Fixture = {
  name: string;
  input: Parameters<typeof computeForecastVerdict>[0];
  expected: {
    projectedSmd: number;
    forecastTotal: number;
    verdict: ForecastVerdict;
  } | null;
};

describe("mobile forecast verdict matches the shared cross-platform fixtures", () => {
  it.each(fixtures as Fixture[])("$name", ({ input, expected }) => {
    const result = computeForecastVerdict(input);

    if (expected === null) {
      expect(result).toBeNull();
      return;
    }

    expect(result).not.toBeNull();
    expect(result!.projectedSmd).toBeCloseTo(expected.projectedSmd, 6);
    expect(result!.forecastTotal).toBeCloseTo(expected.forecastTotal, 6);
    expect(result!.verdict).toBe(expected.verdict);
  });
});