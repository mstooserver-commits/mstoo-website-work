"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api";
import { useLocationStore } from "@/lib/stores/location";
import { ServiceGrid } from "@/components/service/service-card";
import { ServiceCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import type { Paginated, Service } from "@/types";

function list(payload?: Paginated<Service>) {
  return payload?.data ?? [];
}

export default function SearchClient() {
  const params = useSearchParams();
  const q = params.get("q") || "";
  const sort = params.get("sort") || "";
  const location = useLocationStore((s) => s.location);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [query, setQuery] = useState(q);

  const result = useQuery({
    queryKey: ["search", location?.zoneId, q, sort, min, max],
    enabled: Boolean(location?.zoneId),
    queryFn: async () => {
      if (sort === "popular") return catalogApi.popular(1);
      if (sort === "trending") return catalogApi.trending(1);
      if (sort === "recommended") return catalogApi.recommended(1);
      if (q) {
        return catalogApi.search({
          name: q,
          search: q,
          offset: 1,
          limit: 30,
          ...(location?.lat ? { lat: String(location.lat), long: String(location.lng) } : {}),
        });
      }
      return catalogApi.services(1, {
        ...(location?.lat ? { lat: String(location.lat), long: String(location.lng) } : {}),
      });
    },
  });

  const items = list(result.data);

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold">{q ? `Results for “${q}”` : "Search ads"}</h1>
      <form
        className="mt-4 grid gap-3 sm:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          window.location.href = `/search?q=${encodeURIComponent(query)}`;
        }}
      >
        <input className="input sm:col-span-2" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Keyword" />
        <input className="input" placeholder="Min ₹" value={min} onChange={(e) => setMin(e.target.value)} />
        <input className="input" placeholder="Max ₹" value={max} onChange={(e) => setMax(e.target.value)} />
      </form>
      <div className="mt-6">
        {result.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        ) : result.isError ? (
          <ErrorState message="Search failed" onRetry={() => result.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState title="No ads in this zone" description="Try another keyword or change location." />
        ) : (
          <ServiceGrid services={items} />
        )}
      </div>
    </div>
  );
}
