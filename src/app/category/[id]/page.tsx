"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api";
import { useLocationStore } from "@/lib/stores/location";
import { ServiceGrid } from "@/components/service/service-card";
import { ServiceCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import type { Category, Paginated, Service } from "@/types";

export default function CategoryPage({ params }: { params: { id: string } }) {
  const zoneId = useLocationStore((s) => s.location?.zoneId);
  const cats = useQuery({
    queryKey: ["categories", zoneId],
    queryFn: () => catalogApi.categories(),
  });
  const children = useQuery({
    queryKey: ["children", params.id, zoneId],
    enabled: Boolean(zoneId),
    queryFn: () => catalogApi.children(params.id),
  });
  const services = useQuery({
    queryKey: ["cat-services", params.id, zoneId],
    enabled: Boolean(zoneId),
    queryFn: async () => {
      const kids = ((await catalogApi.children(params.id)) as Paginated<{ id: string }>)?.data || [];
      if (kids[0]?.id) return catalogApi.bySubcategory(kids[0].id, 1);
      return catalogApi.bySubcategory(params.id, 1);
    },
  });

  const category = (((cats.data as Paginated<Category>)?.data || []) as Category[]).find((c) => c.id === params.id);
  const subcats = ((children.data as Paginated<Category>)?.data || []) as Category[];
  const items = ((services.data as Paginated<Service>)?.data || []) as Service[];

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold">{category?.name || "Category"}</h1>
      {subcats.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {subcats.map((c) => (
            <a key={c.id} href={`/category/${params.id}?sub=${c.id}`} className="rounded-full border border-line px-3 py-1 text-sm hover:border-brand hover:text-brand">
              {c.name}
            </a>
          ))}
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
