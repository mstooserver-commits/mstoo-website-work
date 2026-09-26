"use client";

import { useCallback, useEffect, useState } from "react";
import { ensureRazorpayScript, openRazorpayCheckout, type RazorpayCheckoutOptions } from "@/lib/api/payment";

export function useRazorpayCheckout() {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        await ensureRazorpayScript();
        if (isMounted) setIsReady(true);
      } catch (err) {
        if (isMounted) {
          setIsReady(false);
          setError(err instanceof Error ? err.message : "Unable to load Razorpay.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  const openCheckout = useCallback(async (options: RazorpayCheckoutOptions) => {
    setError(null);
    try {
      await openRazorpayCheckout(options);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment could not be processed.";
      setError(message);
      if (options.onFailure) {
        await options.onFailure(err);
      }
      throw err;
    }
  }, []);

  return {
    isReady,
    isLoading,
    error,
    openCheckout,
  };
}
