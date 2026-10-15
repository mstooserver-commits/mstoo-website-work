"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Grid2X2, MapPin, Search } from "lucide-react";
import { catalogApi } from "@/lib/api";
import { useLocationStore } from "@/lib/stores/location";
import { ServiceGrid } from "@/components/service/service-card";
import { ServiceCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { Pagination } from "@/components/ui/pagination";
import type { Category, Paginated, Service } from "@/types";

function list(payload?: Paginated<Service>) {
  return payload?.data ?? [];
}

export default function SearchClient() {
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get("q") || "";
  const categoryId = params.get("category") || "";
  const sort = params.get("sort") || "";
  const location = useLocationStore((s) => s.location);
  const setPickerOpen = useLocationStore((s) => s.setPickerOpen);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [query, setQuery] = useState(q);
  const [category, setCategory] = useState(categoryId);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [q, categoryId, sort, min, max, location?.zoneId]);

  const categories = useQuery({
    queryKey: ["categories", location?.zoneId],
    enabled: Boolean(location?.zoneId),
    queryFn: () => catalogApi.categories(),
  });

  const result = useQuery({
    queryKey: ["search", location?.zoneId, q, categoryId, sort, min, max, page],
    enabled: Boolean(location?.zoneId),
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      if (sort === "popular") return catalogApi.popular(page);
      if (sort === "trending") return catalogApi.trending(page);
      if (sort === "recommended") return catalogApi.recommended(page);
      if (q) {
        return catalogApi.search({
          string: q,
          ...(categoryId ? { category_id: categoryId } : {}),
          ...(min ? { min_price: min } : {}),
          ...(max ? { max_price: max } : {}),
          offset: page,
          limit: 30,
          ...(location?.lat ? { lat: String(location.lat), long: String(location.lng) } : {}),
        });
      }
      return catalogApi.services(page, {
        ...(categoryId ? { category_id: categoryId } : {}),
        ...(min ? { min_price: min } : {}),
        ...(max ? { max_price: max } : {}),
        ...(location?.lat ? { lat: String(location.lat), long: String(location.lng) } : {}),
      });
    },
  });

  const items = list(result.data);
  const total = result.data?.total;
  const pageSize = Number(result.data?.per_page) || (q || categoryId ? 30 : 10);
  const totalPages = result.data?.last_page || (total ? Math.ceil(total / pageSize) : 1);
  const firstResult = total && items.length ? (page - 1) * pageSize + 1 : 0;
  const lastResult = total ? Math.min((page - 1) * pageSize + items.length, total) : items.length;
  const categoryItems = categories.data?.data ?? [];

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = new URLSearchParams();
    if (query.trim()) next.set("q", query.trim());
    if (category) next.set("category", category);
    router.push(`/search${next.size ? `?${next.toString()}` : ""}`);
  };

  return (
    <div className="container-page py-8 pb-28">
      <div className="rounded-2xl bg-gradient-to-br from-rose-50 via-white to-emerald-50 p-5 shadow-soft sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Explore MSTOO</p>
        <h1 className="mt-1 text-2xl font-extrabold">
          {q ? `Results for “${q}”` : "Find your next rental or service"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Search real listings available in your selected area.
        </p>
        <form
          className="mt-5 grid gap-2 rounded-xl border border-rose-100 bg-white p-2 md:grid-cols-[minmax(0,1fr)_minmax(160px,.65fr)_minmax(160px,.75fr)_auto]"
          onSubmit={submitSearch}
        >
          <label className="flex items-center gap-2 px-3">
            <Search className="h-4 w-4 text-muted" />
            <span className="sr-only">Keyword</span>
            <input
              className="min-w-0 flex-1 py-3 text-sm outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you looking for?"
            />
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-line px-3">
            <Grid2X2 className="h-4 w-4 text-brand" />
            <span className="sr-only">Category</span>
            <select
              className="min-w-0 flex-1 bg-transparent py-3 text-sm text-muted outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {categoryItems.map((item: Category) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="flex min-w-0 items-center gap-2 rounded-lg border border-line px-3 py-3 text-left text-sm text-muted"
            onClick={() => setPickerOpen(true)}
          >
            <MapPin className="h-4 w-4 shrink-0 text-brand" />
            <span className="truncate">{location?.address || "Choose location"}</span>
          </button>
          <button className="btn-primary gap-2 rounded-lg" type="submit">
            <Search className="h-4 w-4" />
            Search
          </button>
        </form>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:max-w-sm">
        <input
          className="input"
          inputMode="numeric"
          aria-label="Minimum price"
          placeholder="Min ₹"
          value={min}
          onChange={(e) => setMin(e.target.value)}
        />
        <input
          className="input"
          inputMode="numeric"
          aria-label="Maximum price"
          placeholder="Max ₹"
          value={max}
          onChange={(e) => setMax(e.target.value)}
        />
      </div>
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
          <EmptyState
            title="No ads in this zone"
            description="Try another keyword or change location."
          />
        ) : (
          <ServiceGrid services={items} />
        )}
        {items.length > 0 ? (
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="w-full rounded-2xl border border-line bg-white px-4 py-5 shadow-soft sm:px-6">
              {typeof total === "number" ? (
                <p className="mb-4 text-center text-sm text-muted">
                  Showing{" "}
                  <span className="font-semibold text-ink">
                    {firstResult}–{lastResult}
                  </span>{" "}
                  of <span className="font-semibold text-ink">{total}</span> ads
                </p>
              ) : null}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                disabled={result.isFetching}
                onPageChange={(nextPage) => {
                  setPage(nextPage);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
