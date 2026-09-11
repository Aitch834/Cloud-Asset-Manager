import { describe, expect, it } from "vitest";
import {
  getVineRegisterMissingHeaderFields,
  resolveVineRegisterFsaRef,
} from "./vine-register-print-warning";

const completeFarmMeta = {
  address: "1 Vineyard Lane",
  fsaVineRegisterRef: "VR-123",
  fsaWineProductionRef: "WP-123",
  appaRef: "APPA-123",
  winegbMembershipNumber: "WGB-123",
};

describe("Vine Register print missing-header warning", () => {
  const alignedPdfAndBrowserWarningFields = [
    "Farm Address",
    "FSA Vine Register Ref",
    "FSA Wine Production Ref",
    "APPA Ref",
    "WineGB Membership No",
  ];

  it.each([undefined, null, "", "   \t\n"])(
    "reports a blank address (%s) alongside the other missing header fields",
    (address) => {
      expect(
        getVineRegisterMissingHeaderFields({
          address,
          fsaVineRegisterRef: "",
          fsaWineProductionRef: "  ",
          appaRef: null,
          winegbMembershipNumber: undefined,
        }),
      ).toEqual(alignedPdfAndBrowserWarningFields);
    },
  );

  it("does not report a populated address as missing", () => {
    expect(getVineRegisterMissingHeaderFields(completeFarmMeta)).not.toContain(
      "Farm Address",
    );
  });

  it("keeps the PDF and browser print warning field list aligned", () => {
    expect(getVineRegisterMissingHeaderFields({})).toEqual(
      alignedPdfAndBrowserWarningFields,
    );
  });

  it("uses a nonempty fallback when the metadata FSA reference is whitespace", () => {
    const farmMeta = {
      ...completeFarmMeta,
      fsaVineRegisterRef: " \t ",
    };

    expect(resolveVineRegisterFsaRef(farmMeta, " LEGACY-VR-123 ")).toBe(
      "LEGACY-VR-123",
    );
    expect(
      getVineRegisterMissingHeaderFields(farmMeta, " LEGACY-VR-123 "),
    ).not.toContain("FSA Vine Register Ref");
  });
});