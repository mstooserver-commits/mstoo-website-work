"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { providerApi } from "@/lib/api";

export default function ProviderRequestsPage() {
  const q = useQuery({
    queryKey: ["provider-bookings"],
    queryFn: () => providerApi.bookings({ booking_status: "pending" }),
  });
  const items = ((q.data as { data?: { id: string; readable_id?: string }[] })?.data || []) as {
    id: string;
    readable_id?: string;
  }[];
  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold">Booking requests</h1>
      <div className="mt-4 space-y-3">
        {items.map((b) => (
          <div key={b.id} className="card flex items-center justify-between p-4">
            <p>#{b.readable_id || b.id.slice(0, 8)}</p>
            <div className="flex gap-2">
              <button
                className="btn-primary"
                onClick={async () => {
                  await providerApi.accept({ booking_id: b.id });
                  toast.success("Accepted");
                  q.refetch();
                }}
              >
                Accept
              </button>
              <button
                className="btn-secondary"
                onClick={async () => {
                  await providerApi.reject({ booking_id: b.id });
                  toast.success("Rejected");
                  q.refetch();
                }}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {q.isFetched && items.length === 0 ? <p className="text-sm text-muted">No pending requests.</p> : null}
      </div>
    </div>
  );
}
