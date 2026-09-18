"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { providerApi } from "@/lib/api";

export default function WithdrawPage() {
  const q = useQuery({ queryKey: ["withdraw"], queryFn: () => providerApi.withdraw() });
  const methods = useQuery({ queryKey: ["withdraw-methods"], queryFn: () => providerApi.withdrawMethods() });
  const [amount, setAmount] = useState("");
  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold">Withdraw</h1>
      <form
        className="mt-4 flex max-w-md gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await providerApi.withdraw({ amount });
            toast.success("Withdraw requested");
            q.refetch();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Request failed");
          }
        }}
      >
        <input className="input" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button className="btn-primary">Request</button>
      </form>
      <pre className="mt-6 overflow-auto rounded-md bg-white p-4 text-xs text-muted">
        {JSON.stringify({ history: q.data, methods: methods.data }, null, 2)}
      </pre>
    </div>
  );
}
