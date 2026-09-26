"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { walletApi } from "@/lib/api";
import { formatInr } from "@/lib/currency";
import { ApiError, extractApiError, isLaravelOk, laravelCode } from "@/lib/errors";
import { ensureRazorpayScript } from "@/lib/api/payment";
import { useAuthStore } from "@/lib/stores/auth";
import { useConfigStore } from "@/lib/stores/config";
import { isFlagOn } from "@/lib/utils";
import {
  extractPaymentRedirect,
  extractRazorpayOrder,
  paymentReturnFlag,
  unwrapWallet,
  walletCallbackUrl,
} from "@/lib/wallet-payment";

const PRESETS = [100, 200, 500, 1000, 2000];

function gatewayLabel(raw: string) {
  if (raw.toLowerCase().includes("razor")) return "Razorpay (Cards, UPI, Netbanking)";
  return raw.replaceAll("_", " ");
}

export default function WalletPage() {
  const user = useAuthStore((s) => s.user);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const config = useConfigStore((s) => s.config);
  const queryClient = useQueryClient();
  const show = isFlagOn(config?.wallet_status) || isFlagOn(config?.wallet_payment);
  const q = useQuery({ queryKey: ["wallet"], queryFn: () => walletApi.transactions(1) });
  const { balance: apiBalance, items } = unwrapWallet(q.data);
  const balance = apiBalance || Number(user?.wallet_balance || 0);
  const [amount, setAmount] = useState("500");
  const [busy, setBusy] = useState(false);
  const [method, setMethod] = useState("razor_pay");

  const gateways = useMemo(() => {
    const fromConfig = (config?.payment_gateways || []).filter(Boolean);
    return fromConfig.length ? fromConfig : ["razor_pay"];
  }, [config?.payment_gateways]);

  useEffect(() => {
    if (gateways.length && !gateways.includes(method)) setMethod(gateways[0]);
  }, [gateways, method]);

  useEffect(() => {
    const flag = paymentReturnFlag(window.location.search, window.location.pathname);
    if (!flag) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("flag");
    url.searchParams.delete("status");
    url.searchParams.delete("payment");
    window.history.replaceState({}, "", url.pathname + url.search);
    if (flag === "success") {
      toast.success("Funds added to wallet");
      void refreshUser();
      void queryClient.invalidateQueries({ queryKey: ["wallet"] });
    } else {
      toast.error("Wallet top-up failed or was cancelled");
    }
  }, [queryClient, refreshUser]);

  const addFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 1) {
      toast.error("Enter a valid amount");
      return;
    }
    setBusy(true);
    try {
      const res = await walletApi.addFund({
        amount: value,
        payment_method: method,
        payment_platform: "web",
        callback: walletCallbackUrl(),
      });
      if (!isLaravelOk(res)) {
        throw new ApiError(extractApiError(res, "Could not start payment"), 400, laravelCode(res), res);
      }

      const order = extractRazorpayOrder(res);
      if (order) {
        await ensureRazorpayScript();
        if (!window.Razorpay) throw new Error("Razorpay checkout could not load");
        const rzp = new window.Razorpay({
          key: order.key,
          amount: order.amount || Math.round(value * 100),
          currency: order.currency || "INR",
          name: "MSTOO",
          description: "Add money to wallet",
          order_id: order.order_id,
          prefill: { contact: user?.phone || "", email: user?.email || "" },
          theme: { color: "#D93F46" },
          handler: async () => {
            toast.success("Payment successful. Updating wallet…");
            await refreshUser();
            await queryClient.invalidateQueries({ queryKey: ["wallet"] });
            setBusy(false);
          },
          modal: {
            ondismiss: () => {
              toast.message("Payment cancelled");
              setBusy(false);
            },
          },
        });
        rzp.on?.("payment.failed", () => {
          toast.error("Payment failed");
          setBusy(false);
        });
        rzp.open();
        return;
      }

      const paymentUrl = extractPaymentRedirect(res);
      if (paymentUrl) {
        toast.message("Redirecting to secure payment…");
        window.location.href = paymentUrl;
        return;
      }

      toast.error("Payment link missing. Please try again.");
      setBusy(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add funds");
      setBusy(false);
    }
  };

  if (!show) {
    return <div className="container-page py-12 text-center text-muted">Wallet is currently disabled in config.</div>;
  }

  return (
    <div className="container-page py-8 pb-28">
      <div className="card bg-gradient-to-br from-brand to-brand-dark p-6 text-white">
        <p className="text-sm text-white/80">Wallet balance</p>
        <p className="mt-1 text-3xl font-extrabold">{formatInr(balance)}</p>
      </div>

      <form className="mt-6 card space-y-4 p-5" onSubmit={addFunds}>
        <div>
          <h2 className="font-semibold">Add money to wallet</h2>
          <p className="mt-1 text-sm text-muted">Pay with Razorpay. Balance updates after payment succeeds.</p>
        </div>
        <div>
          <label className="label">Amount (₹)</label>
          <input
            className="input text-lg font-semibold"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                  amount === String(preset) ? "border-brand bg-brand text-white" : "border-line bg-white text-brand"
                }`}
                onClick={() => setAmount(String(preset))}
              >
                +{formatInr(preset)}
              </button>
            ))}
          </div>
        </div>
        {gateways.length > 1 ? (
          <div>
            <p className="label">Payment method</p>
            <div className="space-y-2">
              {gateways.map((gateway) => (
                <label key={gateway} className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm">
                  <input
                    type="radio"
                    name="wallet-gateway"
                    checked={method === gateway}
                    onChange={() => setMethod(gateway)}
                  />
                  {gatewayLabel(gateway)}
                </label>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">Pay securely with Razorpay (cards, UPI, netbanking).</p>
        )}
        <button className="btn-primary w-full sm:w-auto" disabled={busy}>
          {busy ? "Opening payment…" : "Add funds"}
        </button>
      </form>

      <h2 className="mt-8 font-semibold">Transactions</h2>
      <div className="mt-3 space-y-2">
        {q.isLoading ? <p className="text-sm text-muted">Loading transactions…</p> : null}
        {!q.isLoading && items.length === 0 ? <p className="text-sm text-muted">No wallet transactions yet.</p> : null}
        {items.map((t) => {
          const credit = Number(t.credit || 0);
          const debit = Number(t.debit || 0);
          const added = credit > 0;
          return (
            <div key={t.id} className="card flex items-center justify-between gap-3 p-3 text-sm">
              <div>
                <p className="font-medium capitalize">{(t.transaction_type || "transaction").replaceAll("_", " ")}</p>
                {t.created_at ? <p className="text-xs text-muted">{new Date(t.created_at).toLocaleString("en-IN")}</p> : null}
              </div>
              <span className={added ? "font-semibold text-emerald-600" : "font-semibold text-danger"}>
                {added ? `+${formatInr(credit)}` : `-${formatInr(debit)}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
