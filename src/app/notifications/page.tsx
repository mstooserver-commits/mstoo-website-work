"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationApi } from "@/lib/api";

export default function NotificationsPage() {
  const q = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.list(1),
  });
  const items = ((q.data as { data?: { id: string; title?: string; description?: string }[] })?.data || []) as {
    id: string;
    title?: string;
    description?: string;
  }[];
  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <div className="mt-4 space-y-3">
        {items.map((n) => (
          <div key={n.id} className="card p-4">
            <p className="font-medium">{n.title}</p>
            <p className="text-sm text-muted">{n.description}</p>
          </div>
        ))}
        {q.isFetched && items.length === 0 ? <p className="text-sm text-muted">You&apos;re all caught up.</p> : null}
      </div>
    </div>
  );
}
