import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./navigation";

describe("safeRedirectPath", () => {
  it("keeps local paths and their query string", () => {
    expect(safeRedirectPath("/checkout?step=payment#top")).toBe("/checkout?step=payment#top");
  });

  it("rejects absolute, protocol-relative, and backslash URLs", () => {
    expect(safeRedirectPath("https://evil.test/phish")).toBe("/");
    expect(safeRedirectPath("//evil.test/phish")).toBe("/");
    expect(safeRedirectPath("/\\evil.test/phish")).toBe("/");
  });
});
