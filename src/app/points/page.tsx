"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { walletApi } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth";
import { useConfigStore } from "@/lib/stores/config";
import { isFlagOn } from "@/lib/utils";
import type { Paginated, WalletTx } from "@/types";

export default function PointsPage() {
  const enabled = isFlagOn(useConfigStore((s) => s.config)?.loyalty_point_status);
  const points = useAuthStore((s) => s.user)?.loyalty_point;
  const q = useQuery({ queryKey: ["points"], enabled, queryFn: () => walletApi.loyalty(1) });
  const items = ((q.data as Paginated<WalletTx>)?.data || []) as WalletTx[];
  const [amount, setAmount] = useState("100");
  if (!enabled) return <div className="container-page py-12 text-center text-muted">Loyalty points are disabled.</div>;
  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold">Loyalty points</h1>
      <p className="mt-2 text-3xl font-extrabold text-brand">{points || 0}</p>
      <form
        className="mt-4 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await walletApi.transfer({ point: amount });
            toast.success("Converted to wallet");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Conversion failed");
          }
        }}
      >
        <input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button className="btn-primary">Convert to wallet</button>
      </form>
      <div className="mt-6 space-y-2">
        {items.map((t) => (
          <div key={t.id} className="card p-3 text-sm">
            {t.transaction_type} · {t.created_at}
          </div>
        ))}
      </div>
    </div>
  );
}
