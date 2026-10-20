import { describe, expect, it } from "vitest";
import { sanitizeCmsHtml } from "./sanitize";

describe("sanitizeCmsHtml", () => {
  it("keeps ordinary legal-page markup", () => {
    expect(sanitizeCmsHtml("<h2>Terms</h2><p><strong>Safe</strong> copy</p>")).toBe(
      "<h2>Terms</h2><p><strong>Safe</strong> copy</p>",
    );
  });

  it("removes executable and embedded content", () => {
    const dirty = `<script>alert(1)</script><img src=x onerror='alert(2)'><svg onload=alert(3)></svg><iframe src="https://evil.test"></iframe><p onclick=alert(4)>Text</p>`;
    expect(sanitizeCmsHtml(dirty)).toBe("<p>Text</p>");
  });

  it("removes dangerous links and protects new tabs", () => {
    expect(sanitizeCmsHtml('<a href="javascript:alert(1)">Bad</a>')).toBe("<a>Bad</a>");
    expect(sanitizeCmsHtml('<a href="https://mstoo.co.in" target="_blank">Good</a>')).toBe(
      '<a href="https://mstoo.co.in" target="_blank" rel="noopener noreferrer">Good</a>',
    );
  });
});
