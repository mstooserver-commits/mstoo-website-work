"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { providerApi } from "@/lib/api";

export default function BankPage() {
  const q = useQuery({ queryKey: ["bank"], queryFn: () => providerApi.bank() });
  const [account, setAccount] = useState("");
  const [holder, setHolder] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bank, setBank] = useState("");

  return (
    <div className="container-page py-8">
      <form
        className="mx-auto max-w-lg card space-y-3 p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await providerApi.updateBank({
              bank_name: bank,
              account_no: account,
              acc_holder_name: holder,
              routing_number: ifsc,
            });
            toast.success("Bank details saved");
            q.refetch();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Save failed");
          }
        }}
      >
        <h1 className="text-2xl font-bold">Bank info</h1>
        <input className="input" placeholder="Bank name" value={bank} onChange={(e) => setBank(e.target.value)} />
        <input className="input" placeholder="Account holder" value={holder} onChange={(e) => setHolder(e.target.value)} />
        <input className="input" placeholder="Account number" value={account} onChange={(e) => setAccount(e.target.value)} />
        <input className="input" placeholder="IFSC / routing" value={ifsc} onChange={(e) => setIfsc(e.target.value)} />
        <button className="btn-primary w-full">Save</button>
      </form>
    </div>
  );
}
