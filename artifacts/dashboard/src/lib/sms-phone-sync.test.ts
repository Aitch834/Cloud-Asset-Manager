import { describe, expect, it } from "vitest";
import {
  buildSmsPhoneUpdatePayload,
  getSmsPhoneSyncCandidate,
  toUkMobileIntl,
} from "./sms-phone-sync";

describe("dashboard SMS phone sync suggestion", () => {
  it("offers the confirmed changed UK mobile when the saved SMS number differs", () => {
    expect(getSmsPhoneSyncCandidate({
      savedContactPhone: "07911 123 456",
      previousContactPhone: "07888 111 222",
      savedSmsMobile: "+447700900123",
      profileLoaded: true,
    })).toBe("+447911123456");
  });

  it("does not offer a formatting-only change", () => {
    expect(getSmsPhoneSyncCandidate({
      savedContactPhone: "+447911123456",
      previousContactPhone: "07911 123 456",
      savedSmsMobile: "+447700900123",
      profileLoaded: true,
    })).toBeNull();
  });

  it("does not offer landlines, invalid numbers, or an already-matching SMS mobile", () => {
    expect(getSmsPhoneSyncCandidate({
      savedContactPhone: "01234 567890",
      previousContactPhone: null,
      savedSmsMobile: null,
      profileLoaded: true,
    })).toBeNull();
    expect(getSmsPhoneSyncCandidate({
      savedContactPhone: "07911 123 456",
      previousContactPhone: null,
      savedSmsMobile: "+447911123456",
      profileLoaded: true,
    })).toBeNull();
    expect(getSmsPhoneSyncCandidate({
      savedContactPhone: "07911 123 456",
      previousContactPhone: null,
      savedSmsMobile: "+447700900123",
      profileLoaded: false,
    })).toBeNull();
  });

  it("updates only the profile phone number so SMS preferences stay unchanged", () => {
    expect(buildSmsPhoneUpdatePayload("+447911123456")).toEqual({
      phoneNumber: "+447911123456",
    });
  });
});

describe("toUkMobileIntl", () => {
  it("normalises local UK mobile formatting", () => {
    expect(toUkMobileIntl("(07911) 123-456")).toBe("+447911123456");
  });
});