"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { bookingApi } from "@/lib/api";
import { formatInr } from "@/lib/currency";
import type { Booking } from "@/types";
import { useConfigStore } from "@/lib/stores/config";
import { isFlagOn } from "@/lib/utils";

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const canCancel = isFlagOn(useConfigStore((s) => s.config)?.customer_can_cancel_booking);
  const q = useQuery({
    queryKey: ["booking", params.id],
    queryFn: () => bookingApi.details(params.id),
  });
  const b = q.data as Booking | undefined;
  if (!b) return <div className="container-page py-16 text-center text-muted">Loading booking…</div>;

  const act = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
      q.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  };

  return (
    <div className="container-page space-y-4 py-8">
      <h1 className="text-2xl font-bold">Booking #{b.readable_id || b.id.slice(0, 8)}</h1>
      <div className="card space-y-2 p-4 text-sm">
        <p>Status: <strong className="capitalize">{b.booking_status}</strong></p>
        <p>Payment: {b.payment_method} ({b.payment_status})</p>
        <p>Schedule: {b.service_schedule}</p>
        <p>Total: {formatInr(Number(b.total_booking_amount || 0))}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {canCancel && b.booking_status !== "canceled" && b.booking_status !== "completed" ? (
          <button className="btn-secondary" onClick={() => act(() => bookingApi.status({ booking_id: b.id, booking_status: "canceled" }), "Cancelled")}>
            Cancel
          </button>
        ) : null}
        <button className="btn-secondary" onClick={() => act(() => bookingApi.complete({ booking_id: b.id }), "Marked complete")}>
          Mark complete
        </button>
        <button
          className="btn-secondary"
          onClick={() => {
            const schedule = prompt("New schedule (YYYY-MM-DD HH:mm)");
            if (!schedule) return;
            void act(() => bookingApi.reschedule({ booking_id: b.id, schedule }), "Rescheduled");
          }}
        >
          Reschedule
        </button>
        <button
          className="btn-primary"
          onClick={() => {
            const comment = prompt("Review comment") || "";
            const rating = Number(prompt("Rating 1-5") || 5);
            void act(
              () => bookingApi.review({ booking_id: b.id, review_comment: comment, review_rating: rating }),
              "Review submitted",
            );
          }}
        >
          Write review
        </button>
      </div>
    </div>
  );
}
