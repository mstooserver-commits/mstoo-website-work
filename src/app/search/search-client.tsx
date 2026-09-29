"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
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

  const result = useInfiniteQuery({
    queryKey: ["search", location?.zoneId, q, sort, min, max],
    enabled: Boolean(location?.zoneId),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (sort === "popular") return catalogApi.popular(pageParam);
      if (sort === "trending") return catalogApi.trending(pageParam);
      if (sort === "recommended") return catalogApi.recommended(pageParam);
      if (q) {
        return catalogApi.search({
          name: q,
          search: q,
          offset: pageParam,
          limit: 30,
          ...(location?.lat ? { lat: String(location.lat), long: String(location.lng) } : {}),
        });
      }
      return catalogApi.services(pageParam, {
        ...(location?.lat ? { lat: String(location.lat), long: String(location.lng) } : {}),
      });
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.next_page_url !== undefined) {
        return lastPage.next_page_url ? lastPageParam + 1 : undefined;
      }
      if (typeof lastPage.last_page === "number") {
        return lastPageParam < lastPage.last_page ? lastPageParam + 1 : undefined;
      }
      const pageSize = Number(lastPage.per_page) || (q ? 30 : 10);
      const currentPage = lastPage.current_page ?? lastPageParam;
      if (typeof lastPage.total === "number") {
        return currentPage * pageSize < lastPage.total ? lastPageParam + 1 : undefined;
      }
      return (lastPage.data?.length ?? 0) >= pageSize ? lastPageParam + 1 : undefined;
    },
  });

  const pages = result.data?.pages ?? [];
  const items = pages.flatMap((page) => list(page));
  const total = pages[pages.length - 1]?.total;

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
        {items.length > 0 ? (
          <div className="mt-6 flex flex-col items-center gap-2">
            {typeof total === "number" ? (
              <p className="text-sm text-muted">Showing {items.length} of {total} ads</p>
            ) : null}
            {result.hasNextPage ? (
              <button
                className="btn-secondary"
                disabled={result.isFetchingNextPage}
                onClick={() => void result.fetchNextPage()}
              >
                {result.isFetchingNextPage ? "Loading…" : "Load more ads"}
              </button>
            ) : null}
            {result.isFetchNextPageError ? (
              <p className="text-sm text-danger" role="alert">Could not load more ads. Try again.</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
