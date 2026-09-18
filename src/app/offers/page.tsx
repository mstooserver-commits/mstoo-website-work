"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api";
import { useLocationStore } from "@/lib/stores/location";
import { ServiceGrid } from "@/components/service/service-card";
import { EmptyState } from "@/components/ui/states";
import { ServiceCardSkeleton } from "@/components/ui/skeleton";
import type { Paginated, Service } from "@/types";

export default function OffersPage() {
  const zoneId = useLocationStore((s) => s.location?.zoneId);
  const q = useQuery({
    queryKey: ["offers", zoneId],
    enabled: Boolean(zoneId),
    queryFn: () => catalogApi.offers(),
  });
  const items = ((q.data as Paginated<Service>)?.data || []) as Service[];
  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold">Offers</h1>
      <div className="mt-6">
        {q.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState title="No offers in your zone right now" />
        ) : (
          <ServiceGrid services={items} />
        )}
      </div>
    </div>
  );
}
