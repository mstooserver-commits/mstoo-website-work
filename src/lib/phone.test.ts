import { describe, expect, it } from "vitest";
import { displayPhone, isValidIndiaPhone, normalizeIndiaPhone } from "./phone";

describe("phone utils", () => {
  it("normalizes a 10-digit Indian mobile number", () => {
    expect(normalizeIndiaPhone("9876543210")).toBe("+919876543210");
  });

  it("normalizes a number with a leading 0", () => {
    expect(normalizeIndiaPhone("09876543210")).toBe("+919876543210");
  });

  it("validates a standard Indian mobile number", () => {
    expect(isValidIndiaPhone("9876543210")).toBe(true);
    expect(isValidIndiaPhone("1234567890")).toBe(false);
  });

  it("formats a phone number for display", () => {
    expect(displayPhone("9876543210")).toBe("+91 98765 43210");
  });
});
