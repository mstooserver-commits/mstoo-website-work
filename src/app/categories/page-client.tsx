"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api";
import { useLocationStore } from "@/lib/stores/location";
import { CategoryTile } from "@/components/catalog/category-tile";
import { EmptyState, ErrorState } from "@/components/ui/states";
import type { Category, Paginated } from "@/types";

function list(payload: Paginated<Category> | Category[] | undefined): Category[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return payload.data ?? [];
}

export default function CategoriesPage() {
  const zoneId = useLocationStore((s) => s.location?.zoneId);
  const cats = useQuery({
    queryKey: ["categories", zoneId],
    enabled: Boolean(zoneId),
    queryFn: () => catalogApi.categories(),
  });
  const items = list(cats.data);

  return (
    <div className="container-page py-8 pb-28">
      <h1 className="text-2xl font-bold">All categories</h1>
      <p className="mt-1 text-sm text-muted">Browse every MSTOO category available in your zone.</p>
      <div className="mt-6">
        {cats.isLoading ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg bg-line" />
            ))}
          </div>
        ) : cats.isError ? (
          <ErrorState message="Could not load categories" onRetry={() => cats.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState title="No categories in this zone" />
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {items.map((cat) => (
              <CategoryTile key={cat.id} category={cat} href={`/category/${cat.id}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
