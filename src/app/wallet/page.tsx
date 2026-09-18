"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { walletApi } from "@/lib/api";
import { formatInr } from "@/lib/currency";
import { useAuthStore } from "@/lib/stores/auth";
import { useConfigStore } from "@/lib/stores/config";
import { isFlagOn } from "@/lib/utils";
import type { Paginated, WalletTx } from "@/types";

export default function WalletPage() {
  const user = useAuthStore((s) => s.user);
  const config = useConfigStore((s) => s.config);
  const show = isFlagOn(config?.wallet_status) || isFlagOn(config?.wallet_payment);
  const q = useQuery({ queryKey: ["wallet"], queryFn: () => walletApi.transactions(1) });
  const items = ((q.data as Paginated<WalletTx>)?.data || []) as WalletTx[];
  const [amount, setAmount] = useState("500");

  if (!show) {
    return <div className="container-page py-12 text-center text-muted">Wallet is currently disabled in config.</div>;
  }

  return (
    <div className="container-page py-8">
      <div className="card bg-gradient-to-br from-brand to-brand-dark p-6 text-white">
        <p className="text-sm text-white/80">Wallet balance</p>
        <p className="mt-1 text-3xl font-extrabold">{formatInr(Number(user?.wallet_balance || 0))}</p>
      </div>
      <form
        className="mt-4 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await walletApi.addFund({ amount, payment_method: "razor_pay" });
            toast.success("Add-fund request created");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not add funds");
          }
        }}
      >
        <input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button className="btn-primary">Add funds</button>
      </form>
      <h2 className="mt-8 font-semibold">Transactions</h2>
      <div className="mt-3 space-y-2">
        {items.map((t) => (
          <div key={t.id} className="card flex justify-between p-3 text-sm">
            <span>{t.transaction_type}</span>
            <span>{Number(t.credit) > 0 ? `+${t.credit}` : `-${t.debit}`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
