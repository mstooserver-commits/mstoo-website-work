"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { proMemberApi } from "@/lib/api";
import { formatInr } from "@/lib/currency";
import { useConfigStore } from "@/lib/stores/config";
import { isFlagOn } from "@/lib/utils";
import type { Paginated, ProPlan } from "@/types";

export default function ProMemberPage() {
  const config = useConfigStore((s) => s.config?.pro_member);
  const enabled = isFlagOn(config?.enabled);
  const plans = useQuery({ queryKey: ["pro-plans"], enabled, queryFn: () => proMemberApi.plans() });
  const current = useQuery({ queryKey: ["pro-current"], enabled, queryFn: () => proMemberApi.current() });
  const list = (Array.isArray(plans.data) ? plans.data : ((plans.data as Paginated<ProPlan>)?.data || [])) as ProPlan[];
  if (!enabled) return <div className="container-page py-12 text-center text-muted">Pro membership is disabled.</div>;

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold">MSTOO Pro</h1>
      <p className="mt-2 text-sm text-muted">
        Status: {isFlagOn(config?.is_pro_member) ? "Active" : "Not subscribed"}
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((plan) => (
          <div key={plan.id} className="card p-5">
            <h3 className="text-lg font-bold">{plan.name}</h3>
            <p className="mt-2 text-2xl font-extrabold text-brand">{formatInr(Number(plan.price || 0))}</p>
            <p className="text-sm text-muted">
              {plan.duration} {plan.duration_type}
            </p>
            {isFlagOn(config?.purchase_enabled) ? (
              <button
                className="btn-primary mt-4 w-full"
                onClick={async () => {
                  try {
                    await proMemberApi.purchase({ plan_id: plan.id, payment_method: "razor_pay" });
                    toast.success("Purchase initiated");
                    current.refetch();
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Purchase failed");
                  }
                }}
              >
                Buy with Razorpay
              </button>
            ) : null}
          </div>
        ))}
      </div>
      {isFlagOn(config?.allow_cancellation) ? (
        <button
          className="btn-secondary mt-6"
          onClick={async () => {
            await proMemberApi.cancel();
            toast.success("Cancellation requested");
          }}
        >
          Cancel membership
        </button>
      ) : null}
    </div>
  );
}
