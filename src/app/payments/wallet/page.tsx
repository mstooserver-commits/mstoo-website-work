"use client";

import { useState } from "react";
import { addWalletFund } from "@/lib/api/payment";

export default function WalletTopupExamplePage() {
  const [amount, setAmount] = useState<number>(5000);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleTopUp = async () => {
    setError("");
    setStatus("");
    setIsLoading(true);

    try {
      const paymentUrl = await addWalletFund(amount, {
        callback: "/wallet",
        payment_platform: "web",
      });

      window.location.href = paymentUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not start wallet top-up.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-xl space-y-6 p-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Wallet top-up</h1>
        <p className="mt-2 text-sm text-slate-600">
          Call the Laravel wallet endpoint, then redirect to the returned payment URL to complete Razorpay checkout.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Amount (in paise)
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            type="number"
            min={100}
            step={100}
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
          />
        </label>

        <button
          type="button"
          className="w-full rounded-md bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-gray-400"
          onClick={() => void handleTopUp()}
          disabled={isLoading}
        >
          {isLoading ? "Processing wallet top-up..." : "Top up wallet"}
        </button>

        {status ? <p className="text-sm text-slate-700">{status}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </main>
  );
}
