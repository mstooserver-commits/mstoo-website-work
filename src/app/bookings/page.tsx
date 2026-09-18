"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { bookingApi } from "@/lib/api";
import { formatInr } from "@/lib/currency";
import type { Booking, Paginated } from "@/types";

const TABS = ["all", "pending", "accepted", "ongoing", "completed", "canceled"];

export default function BookingsPage() {
  const [tab, setTab] = useState("all");
  const q = useQuery({
    queryKey: ["bookings", tab],
    queryFn: () => bookingApi.list(tab === "all" ? {} : { booking_status: tab }),
  });
  const items = ((q.data as Paginated<Booking>)?.data || []) as Booking[];
  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold">My bookings</h1>
      <div className="mt-4 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            className={`rounded-full px-3 py-1 text-sm capitalize ${tab === t ? "bg-brand text-white" : "bg-white border border-line"}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {items.map((b) => (
          <Link key={b.id} href={`/bookings/${b.id}`} className="card block p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">#{b.readable_id || b.id.slice(0, 8)}</p>
              <span className="text-xs capitalize text-brand">{b.booking_status}</span>
            </div>
            <p className="mt-1 text-sm text-muted">{b.service_schedule}</p>
            <p className="mt-1 font-medium">{formatInr(Number(b.total_booking_amount || 0))}</p>
          </Link>
        ))}
        {q.isFetched && items.length === 0 ? <p className="text-sm text-muted">No bookings in this tab.</p> : null}
      </div>
    </div>
  );
}
