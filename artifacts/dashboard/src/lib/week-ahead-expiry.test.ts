import { afterEach, describe, expect, it } from "vitest";
import {
  formatFpDerogationExpiryLabel,
  type FpDerogationExpiryType,
} from "./week-ahead-expiry";

const originalTimezone = process.env.TZ;

afterEach(() => {
  process.env.TZ = originalTimezone;
});

describe.each([
  "organic_fp_input_log_derogation_expiry",
  "organic_fp_derogation_expiry",
] satisfies FpDerogationExpiryType[])("%s Week Ahead label", (type) => {
  it.each(["Pacific/Honolulu", "Europe/London", "Pacific/Auckland"])(
    "retains past and future calendar dates in %s",
    (timezone) => {
      process.env.TZ = timezone;
      const today = new Date(2026, 8, 10, 12);

      expect(formatFpDerogationExpiryLabel(type, "2026-09-09", today))
        .toBe("Expired 9 Sept 2026");
      expect(formatFpDerogationExpiryLabel(type, "2026-09-11", today))
        .toBe("Expires 11 Sept 2026");
    },
  );
});