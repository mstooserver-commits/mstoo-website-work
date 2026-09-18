"use client";

import { useQuery } from "@tanstack/react-query";
import { couponApi } from "@/lib/api";

export default function CouponsPage() {
  const q = useQuery({ queryKey: ["coupons"], queryFn: () => couponApi.list() });
  const items = ((q.data as { data?: { id: string; coupon_code?: string; discount?: number; discount_type?: string }[] })?.data || []) as {
    id: string;
    coupon_code?: string;
    discount?: number;
    discount_type?: string;
  }[];
  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold">Coupons</h1>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((c) => (
          <div key={c.id} className="card p-4">
            <p className="font-bold tracking-wide">{c.coupon_code}</p>
            <p className="text-sm text-muted">
              {c.discount} {c.discount_type}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
