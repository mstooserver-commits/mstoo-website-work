"use client";

import { useRazorpayCheckout } from "@/hooks/use-razorpay-checkout";
import type { RazorpayCheckoutOptions } from "@/lib/api/payment";

type RazorpayCheckoutButtonProps = {
  amount: number;
  label?: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  disabled?: boolean;
  onSuccess?: RazorpayCheckoutOptions["onSuccess"];
  onFailure?: RazorpayCheckoutOptions["onFailure"];
};

export function RazorpayCheckoutButton({
  amount,
  label = "Pay with Razorpay",
  name,
  description,
  email,
  phone,
  disabled = false,
  onSuccess,
  onFailure,
}: RazorpayCheckoutButtonProps) {
  const { isReady, isLoading, error, openCheckout } = useRazorpayCheckout();

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="w-full rounded-md bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-gray-400"
        disabled={disabled || isLoading || !isReady}
        onClick={() =>
          void openCheckout({
            amount,
            name,
            description,
            email,
            phone,
            onSuccess,
            onFailure,
          })
        }
      >
        {isLoading ? "Preparing payment..." : isReady ? label : "Loading Razorpay..."}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
