import { describe, expect, it } from "vitest";
import { resolveRazorpayPublicKey } from "./razorpay-env";

describe("resolveRazorpayPublicKey", () => {
  it("prefers the test key on preprod hosts", () => {
    const originalTest = process.env.NEXT_PUBLIC_RAZORPAY_KEY_TEST;
    const originalLive = process.env.NEXT_PUBLIC_RAZORPAY_KEY_LIVE;
    const originalMode = process.env.NEXT_PUBLIC_RAZORPAY_MODE;

    process.env.NEXT_PUBLIC_RAZORPAY_KEY_TEST = "rzp_test_preprod";
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_LIVE = "rzp_live_production";
    delete process.env.NEXT_PUBLIC_RAZORPAY_MODE;

    try {
      expect(resolveRazorpayPublicKey("https://preprod.mstoo.co.in")).toBe("rzp_test_preprod");
    } finally {
      if (originalTest === undefined) delete process.env.NEXT_PUBLIC_RAZORPAY_KEY_TEST;
      else process.env.NEXT_PUBLIC_RAZORPAY_KEY_TEST = originalTest;

      if (originalLive === undefined) delete process.env.NEXT_PUBLIC_RAZORPAY_KEY_LIVE;
      else process.env.NEXT_PUBLIC_RAZORPAY_KEY_LIVE = originalLive;

      if (originalMode === undefined) delete process.env.NEXT_PUBLIC_RAZORPAY_MODE;
      else process.env.NEXT_PUBLIC_RAZORPAY_MODE = originalMode;
    }
  });

  it("prefers the live key on production hosts", () => {
    const originalTest = process.env.NEXT_PUBLIC_RAZORPAY_KEY_TEST;
    const originalLive = process.env.NEXT_PUBLIC_RAZORPAY_KEY_LIVE;
    const originalMode = process.env.NEXT_PUBLIC_RAZORPAY_MODE;

    process.env.NEXT_PUBLIC_RAZORPAY_KEY_TEST = "rzp_test_preprod";
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_LIVE = "rzp_live_production";
    delete process.env.NEXT_PUBLIC_RAZORPAY_MODE;

    try {
      expect(resolveRazorpayPublicKey("https://mstoo.co.in")).toBe("rzp_live_production");
    } finally {
      if (originalTest === undefined) delete process.env.NEXT_PUBLIC_RAZORPAY_KEY_TEST;
      else process.env.NEXT_PUBLIC_RAZORPAY_KEY_TEST = originalTest;

      if (originalLive === undefined) delete process.env.NEXT_PUBLIC_RAZORPAY_KEY_LIVE;
      else process.env.NEXT_PUBLIC_RAZORPAY_KEY_LIVE = originalLive;

      if (originalMode === undefined) delete process.env.NEXT_PUBLIC_RAZORPAY_MODE;
      else process.env.NEXT_PUBLIC_RAZORPAY_MODE = originalMode;
    }
  });

  it("allows a forced test mode override", () => {
    const originalTest = process.env.NEXT_PUBLIC_RAZORPAY_KEY_TEST;
    const originalLive = process.env.NEXT_PUBLIC_RAZORPAY_KEY_LIVE;
    const originalMode = process.env.NEXT_PUBLIC_RAZORPAY_MODE;

    process.env.NEXT_PUBLIC_RAZORPAY_KEY_TEST = "rzp_test_forced";
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_LIVE = "rzp_live_forced";
    process.env.NEXT_PUBLIC_RAZORPAY_MODE = "test";

    try {
      expect(resolveRazorpayPublicKey("https://mstoo.co.in")).toBe("rzp_test_forced");
    } finally {
      if (originalTest === undefined) delete process.env.NEXT_PUBLIC_RAZORPAY_KEY_TEST;
      else process.env.NEXT_PUBLIC_RAZORPAY_KEY_TEST = originalTest;

      if (originalLive === undefined) delete process.env.NEXT_PUBLIC_RAZORPAY_KEY_LIVE;
      else process.env.NEXT_PUBLIC_RAZORPAY_KEY_LIVE = originalLive;

      if (originalMode === undefined) delete process.env.NEXT_PUBLIC_RAZORPAY_MODE;
      else process.env.NEXT_PUBLIC_RAZORPAY_MODE = originalMode;
    }
  });
});
