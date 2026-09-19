"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { catalogApi } from "@/lib/api";
import { useLocationStore } from "@/lib/stores/location";
import { CategoryTile } from "@/components/catalog/category-tile";
import { ServiceGrid } from "@/components/service/service-card";
import { ServiceCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import type { Category, Paginated, Service } from "@/types";

function list<T>(payload: Paginated<T> | T[] | undefined): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return payload.data ?? [];
}

export default function CategoryPage({ params }: { params: { id: string } }) {
  const search = useSearchParams();
  const zoneId = useLocationStore((s) => s.location?.zoneId);
  const selectedSub = search.get("sub") || "";

  const cats = useQuery({
    queryKey: ["categories", zoneId],
    enabled: Boolean(zoneId),
    queryFn: () => catalogApi.categories(),
  });
  const children = useQuery({
    queryKey: ["children", params.id, zoneId],
    enabled: Boolean(zoneId),
    queryFn: () => catalogApi.children(params.id),
  });

  const categories = list<Category>(cats.data);
  const category = categories.find((c) => c.id === params.id);
  const subcats = list<Category>(children.data);
  const activeSub = selectedSub || subcats[0]?.id || params.id;

  const services = useQuery({
    queryKey: ["cat-services", params.id, activeSub, zoneId],
    enabled: Boolean(zoneId && activeSub),
    queryFn: () => catalogApi.bySubcategory(activeSub, 1),
  });
  const items = list<Service>(services.data);

  const title = useMemo(() => category?.name || "Category", [category?.name]);

  return (
    <div className="container-page py-8 pb-28">
      <h1 className="text-2xl font-bold">{title}</h1>
      {categories.length > 0 ? (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <CategoryTile
              key={cat.id}
              category={cat}
              href={`/category/${cat.id}`}
              active={cat.id === params.id}
              compact
            />
          ))}
        </div>
      ) : null}

      {subcats.length > 0 ? (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-brand">Sub categories</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {subcats.map((c) => (
              <CategoryTile
                key={c.id}
                category={c}
                href={`/category/${params.id}?sub=${c.id}`}
                active={c.id === activeSub}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        {services.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        ) : services.isError ? (
          <ErrorState message="Could not load this category" onRetry={() => services.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState title="No ads in this category for your zone" />
        ) : (
          <ServiceGrid services={items} />
        )}
      </div>
    </div>
  );
}
